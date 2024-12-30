import { Locale } from 'ckeditor5';
import { View } from 'ckeditor5/src/ui.js';
import { DictionaryTypes } from '../DictionaryTypes.js';
import DefiningTextBlock from './definingtextblock.js';
import VerbalIllustrationBlock from './verbalillustrationblock.js';
import { stringToViewCollection } from '../utils.js';

export default class SenseBlock extends View {
	constructor(locale: Locale, data: [string, DictionaryTypes.TestSense]) {
		super(locale);
		const [type, content] = data; // Destructure the type and content
		const senseCollection = this.createCollection();

		// Handle `bs` (binding substitute) entries
		if (type === 'bs' && content) {
			this.handleBindingSubstitute(locale, content, senseCollection);
		}

		// Handle `sense` entries
		if (type === 'sense') {
			this.handleSense(locale, content, senseCollection);
		}

		this.setTemplate({
			tag: 'div',
			attributes: { class: ['ck', 'ck-sense'] },
			children: senseCollection,
		});
	}

	private handleBindingSubstitute(
		locale: Locale,
		bindingSubstitute: DictionaryTypes.TestSense,
		collection: any
	): void {
		const { dt, sense } = bindingSubstitute;

		// Render the defining text (dt) if present
		if (dt) {
			dt.forEach((definitionPart: any) => {
				if (definitionPart[0] === 'text') {
					const definingText = definitionPart[1];
					const definingTextBlock = new DefiningTextBlock(locale, definingText);
					collection.add(definingTextBlock);
				}
			});
		}

		// Handle the nested "sense" object if present
		if (sense) {
			const nestedSenseBlock = new SenseBlock(locale, ['sense', sense]);
			collection.add(nestedSenseBlock);
		}
	}

	private handleSense(
		locale: Locale,
		content: DictionaryTypes.TestSense,
		collection: any
	): void {
		const { sn: senseNumber, dt, sdsense: dividedSense, sls, pseq } = content;

		// Create a container for the sense number and first definition
		const numberDefinitionContainer = new View(locale);
		const numberDefinitionCollection = this.createCollection();

		// Render the sense number
		if (senseNumber) {
			const senseNumberBlock = new View(locale);
			senseNumberBlock.setTemplate({
				tag: 'span',
				attributes: { class: ['ck', 'ck-sense-number'] },
				children: [senseNumber],
			});
			numberDefinitionCollection.add(senseNumberBlock);
		}

		// Handle the first definition separately
		if (dt && dt.length > 0) {
			const firstDefinition = dt[0];
			if (firstDefinition[0] === 'text') {
				const definingText = firstDefinition[1];
				const definingTextBlock = new DefiningTextBlock(locale, definingText);
				numberDefinitionCollection.add(definingTextBlock);
			}
		}

		numberDefinitionContainer.setTemplate({
			tag: 'div',
			attributes: { class: ['ck', 'ck-number-definition-container'] },
			children: numberDefinitionCollection,
		});

		collection.add(numberDefinitionContainer);

		// Render subsequent definitions in their own rows
		if (dt && dt.length > 1) {
			dt.slice(1).forEach((definitionPart: any) => {
				if (definitionPart[0] === 'text') {
					const definingText = definitionPart[1];
					const rowDefinitionContainer = new View(locale);
					const definitionBlock = new DefiningTextBlock(locale, definingText);

					rowDefinitionContainer.setTemplate({
						tag: 'div',
						attributes: { class: ['ck', 'ck-definition-row'] },
						children: [definitionBlock],
					});

					collection.add(rowDefinitionContainer);
				}
			});
		}

		// Handle divided sense (sdsense)
		if (dividedSense) {
			const dividedSenseBlock = this.createDividedSenseBlock(
				dividedSense,
				locale
			);
			collection.add(dividedSenseBlock);
		}

		// Handle nested sense sequences in "pseq", if present
		if (pseq) {
			const pseqBlock = this.createPseqBlock(pseq, locale);
			collection.add(pseqBlock);
		}
	}

	private createDividedSenseBlock(
		dividedSense: DictionaryTypes.DividedSense,
		locale: Locale
	): View {
		const { sd: senseDivider, dt } = dividedSense;

		const senseDividerBlock = new View(locale);
		senseDividerBlock.setTemplate({
			tag: 'span',
			attributes: { class: ['ck', 'ck-sense-divider'] },
			children: [senseDivider],
		});

		const dtCollection = this.createCollection();
		dt.forEach((definingText) => {
			if (definingText[0] === 'text') {
				const textContent = definingText[1];
				dtCollection.add(new DefiningTextBlock(locale, textContent));
			}
		});

		const dtContainer = new View(locale);
		dtContainer.setTemplate({
			tag: 'div',
			attributes: { class: ['ck', 'ck-dt-container'] },
			children: dtCollection,
		});

		const senseDividerContainer = new View(locale);
		senseDividerContainer.setTemplate({
			tag: 'div',
			attributes: { class: ['ck', 'ck-sdsense-container'] },
			children: [senseDividerBlock, dtContainer],
		});

		return senseDividerContainer;
	}

	private createPseqBlock(pseq: DictionaryTypes.Pseq, locale: Locale): View {
		const pseqCollection = this.createCollection();

		pseq[1].forEach((seqItem) => {
			if ('sense' in seqItem) {
				// Recursively create SenseBlock for each nested sense
				pseqCollection.add(new SenseBlock(locale, ['sense', seqItem.sense]));
			}
		});

		const pseqContainer = new View(locale);
		pseqContainer.setTemplate({
			tag: 'div',
			attributes: { class: ['ck', 'ck-pseq-container'] },
			children: pseqCollection,
		});

		return pseqContainer;
	}
}
