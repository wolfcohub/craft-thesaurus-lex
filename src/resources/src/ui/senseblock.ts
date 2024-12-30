import { Locale } from 'ckeditor5';
import { View } from 'ckeditor5/src/ui.js';
import { DictionaryTypes } from '../DictionaryTypes.js';
import DefiningTextBlock from './definingtextblock.js';
import VerbalIllustrationBlock from './verbalillustrationblock.js';

export default class SenseBlock extends View {
	constructor(locale: Locale, data: DictionaryTypes.Sense) {
		super(locale);
		const { sn: senseNumber, dt, sdsense: dividedSense, sls, pseq } = data[1];

		const senseCollection = this.createCollection();

		// Render the sense number (e.g., 1, 2 a, b, etc.)
		if (senseNumber) {
			const senseNumberBlock = new View(locale);
			senseNumberBlock.setTemplate({
				tag: 'div',
				attributes: { class: ['ck', 'ck-sense-number'] },
				children: [senseNumber],
			});
			senseCollection.add(senseNumberBlock);
		}

		// Render the subject labels (e.g., "psychology")
		if (sls && sls.length > 0) {
			const slsBlock = new View(locale);
			slsBlock.setTemplate({
				tag: 'span',
				attributes: { class: ['ck', 'ck-sense-label'] },
				children: [sls.join(', ')],
			});
			senseCollection.add(slsBlock);
		}

		// Render the defining text (dt)
		if (dt) {
			dt.forEach((definitionPart) => {
				if (definitionPart[0] === 'text') {
					const definingText = definitionPart[1];
					const definingTextBlock = new DefiningTextBlock(locale, definingText);
					senseCollection.add(definingTextBlock);
				} else if (definitionPart[0] === 'vis') {
					const visContent = definitionPart[1];
					senseCollection.add(new VerbalIllustrationBlock(locale, visContent));
				}
			});
		}

		// Handle divided sense (sdsense), if present
		if (dividedSense) {
			const dividedSenseBlock = this.createDividedSenseBlock(
				dividedSense,
				locale
			);
			senseCollection.add(dividedSenseBlock);
		}

		// Handle nested sense sequences in "pseq", if present
		if (pseq) {
			const pseqBlock = this.createPseqBlock(pseq, locale);
			senseCollection.add(pseqBlock);
		}

		this.setTemplate({
			tag: 'div',
			attributes: { class: ['ck', 'ck-sense'] },
			children: senseCollection,
		});
	}

	createDividedSenseBlock(
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
			} else if (definingText[0] === 'vis') {
				const visContent = definingText[1];
				dtCollection.add(new VerbalIllustrationBlock(locale, visContent));
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

	// Updated method to handle "pseq" with the correct type
	createPseqBlock(pseq: DictionaryTypes.Pseq, locale: Locale): View {
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
