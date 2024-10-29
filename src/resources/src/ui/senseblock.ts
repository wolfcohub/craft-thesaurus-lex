import { Locale } from 'ckeditor5';
import { View } from 'ckeditor5/src/ui.js';
import { DictionaryTypes } from '../DictionaryTypes.js';
import DefiningTextBlock from './definingtextblock.js';
import VerbalIllustrationBlock from './verbalillustrationblock.js';

export default class SenseBlock extends View {
	constructor(locale: Locale, data: DictionaryTypes.Sense) {
		super(locale);
		const { sn: senseNumber, dt, et, sdsense: dividedSense } = data[1];

		const senseCollection = this.createCollection();

		if (senseNumber) {
			// sense number block
			const senseNumberBlock = new View(locale);
			senseNumberBlock.setTemplate({
				tag: 'div',
				attributes: {
					class: ['ck', 'ck-sense-number'],
				},
				children: [senseNumber],
			});

			// indented block
			const indentBlock = new View(locale);
			indentBlock.setTemplate({
				tag: 'div',
				attributes: {
					class: ['ck', 'ck-sense-indent'],
				},
				children: [],
			});
			const sensePrefixBlock = new View(locale);
			sensePrefixBlock.setTemplate({
				tag: 'div',
				attributes: {
					class: ['ck', 'ck-sense-prefix'],
				},
				children: [senseNumberBlock, indentBlock],
			});
			senseCollection.add(sensePrefixBlock);
		}

		const senseContentRows = this.createCollection();

		if (dt) {
			dt.forEach((definingText) => {
				if (definingText[0] === 'text') {
					// add Defining Text (dt) row
					const definingTextRow = new View(locale);
					definingTextRow.setTemplate({
						tag: 'div',
						attributes: {
							class: ['ck', 'ck-sense-content-row'],
						},
						children: [
							new DefiningTextBlock(locale, definingText[1]),
						],
					});
					senseContentRows.add(definingTextRow);
				} else if (definingText[0] === 'vis') {
					// add Verbal Illustration (vis) row
					const verbalIllustrationRow = new View(locale);
					verbalIllustrationRow.setTemplate({
						tag: 'div',
						attributes: {
							class: ['ck', 'ck-sense-content-row'],
						},
						children: [
							new VerbalIllustrationBlock(
								locale,
								definingText[1],
							),
						],
					});
					senseContentRows.add(verbalIllustrationRow);
				}
			});
		}

		if (dividedSense) {
			const dividedSenseRow = new View(locale);
			dividedSenseRow.setTemplate({
				tag: 'div',
				attributes: {
					class: ['ck', 'ck-sense-content-row'],
				},
				children: [this.createDividedSenseBlock(dividedSense, locale)],
			});
			senseContentRows.add(dividedSenseRow);
		}

		const senseContentContainer = new View(locale);
		senseContentContainer.setTemplate({
			tag: 'div',
			attributes: {
				class: ['ck', 'ck-sense-content'],
			},
			children: senseContentRows,
		});
		senseCollection.add(senseContentContainer);

		this.setTemplate({
			tag: 'div',
			attributes: {
				class: ['ck', 'ck-sense'],
			},
			children: senseCollection,
		});
	}

	createDividedSenseBlock(
		dividedSense: DictionaryTypes.DividedSense,
		locale: Locale,
	): View {
		const { sd: senseDivider, dt } = dividedSense;

		const senseDividerBlock = new View(locale);
		senseDividerBlock.setTemplate({
			tag: 'span',
			attributes: {
				class: ['ck', 'ck-sense-divider'],
			},
			children: [senseDivider],
		});

		const dtCollection = this.createCollection();
		dt.forEach((definingText) => {
			if (definingText[0] === 'text') {
				const definingTextContainer = new View(locale);
				definingTextContainer.setTemplate({
					tag: 'div',
					attributes: {
						class: ['ck', 'ck-definition'],
					},
				});
				const definingTextBlock = new View(locale);
				definingTextBlock.setTemplate({
					tag: 'p',
					attributes: {
						class: ['ck', 'ck-definition'],
					},
					children: [],
				});
				dtCollection.add(
					new DefiningTextBlock(locale, definingText[1]),
				);
			} else if (definingText[0] === 'vis') {
				dtCollection.add(
					new VerbalIllustrationBlock(locale, definingText[1]),
				);
			}
		});
		const dtContainer = new View(locale);
		dtContainer.setTemplate({
			tag: 'div',
			attributes: {
				class: ['ck', 'ck-dt-container'],
			},
			children: dtCollection,
		});

		const senseDividerContainer = new View(locale);
		senseDividerContainer.setTemplate({
			tag: 'div',
			attributes: {
				class: ['ck', 'ck-sdsense-container'],
			},
			children: [senseDividerBlock, dtContainer],
		});

		return senseDividerContainer;
	}
}
