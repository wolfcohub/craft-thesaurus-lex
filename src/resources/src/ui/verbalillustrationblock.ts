import { Locale } from 'ckeditor5';
import { View } from 'ckeditor5/src/ui.js';
import { DictionaryTypes } from '../DictionaryTypes.js';
import { stringToViewCollection } from '../utils.js';

export default class VerbalIllustrationBlock extends View {
	constructor(
		locale: Locale,
		data: DictionaryTypes.VerbalIllustrationContent[],
	) {
		super(locale);

		const visCollection = this.createCollection();
		data.forEach((viContent) => {
			const { t, aq } = viContent;
			const visBlock = new View(locale);
			visBlock.setTemplate({
				tag: 'div',
				attributes: {
					class: ['ck', 'ck-verbal-illustration'],
				},
				children: stringToViewCollection(t, locale),
			});
			visCollection.add(visBlock);
		});

		this.setTemplate({
			tag: 'div',
			attributes: {
				class: ['ck', 'ck-vis-container'],
			},
			children: visCollection,
		});
	}
}
