import { Locale } from 'ckeditor5';
import { View } from 'ckeditor5/src/ui.js';

export default class WordDetailBlock extends View {
	constructor(locale: Locale, word: string, functionalLabel: string) {
		super(locale);

		const wordDetailCollection = this.createCollection();
		if (word) {
			const wordView = new View(locale);
			wordView.setTemplate({
				tag: 'p',
				attributes: {
					class: ['ck', 'ck-word-detail'],
				},
				children: [word],
			});
			wordDetailCollection.add(wordView);
		}
		if (functionalLabel) {
			const functionalLabelView = new View(locale);
			functionalLabelView.setTemplate({
				tag: 'p',
				attributes: {
					class: ['ck', 'ck-functionalLabel-detail'],
				},
				children: [functionalLabel],
			});
			wordDetailCollection.add(functionalLabelView);
		}
		this.setTemplate({
			tag: 'div',
			attributes: {
				class: ['ck', 'ck-word-detail-container'],
			},
			children: wordDetailCollection,
		});
	}
}
