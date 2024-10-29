import { Locale } from 'ckeditor5';
import { View } from 'ckeditor5/src/ui.js';
import { DictionaryTypes } from '../DictionaryTypes.js';
import { stringToViewCollection } from '../utils.js';

export default class DefiningTextBlock extends View {
	constructor(locale: Locale, data: string) {
		super(locale);

		const definingTextCollection = stringToViewCollection(data, locale);
		this.setTemplate({
			tag: 'p',
			attributes: {
				class: ['ck', 'ck-definition'],
			},
			children: definingTextCollection,
		});
	}
}
