import { Editor } from 'ckeditor5/src/core.js';
import { View } from 'ckeditor5/src/ui.js';
import { DictionaryTypes } from '../DictionaryTypes.js';
import { stringToViewCollection } from '../utils.js';

export default class AttributionBlock extends View {
	private editor: Editor;

	constructor(editor: Editor, data: DictionaryTypes.AttributionQuote) {
		super(editor.locale);
		this.editor = editor;

		const { auth, source, aqdate, subsource } = data;

		const attributionStrings: Array<string | View> = [];

		// format quote attribution by what values are defined
		if (auth) {
			attributionStrings.push(auth);
		}
		if (source) {
			if (attributionStrings.length) {
				attributionStrings.push(', ');
			}
			const sourceCollection = stringToViewCollection(
				source,
				this.editor,
			);
			attributionStrings.push(...sourceCollection);
		}
		if (aqdate) {
			if (attributionStrings.length) {
				attributionStrings.push(', ');
			}
			const aqdateCollection = stringToViewCollection(
				aqdate,
				this.editor,
			);
			attributionStrings.push(...aqdateCollection);
		}
		if (subsource) {
			const { source: innerSource, aqdate: innerAqdate } = subsource;

			if (innerSource) {
				if (attributionStrings.length) {
					attributionStrings.push(', ');
				}
				const innerSourceCollection = stringToViewCollection(
					innerSource,
					this.editor,
				);
				attributionStrings.push(...innerSourceCollection);
			}
			if (innerAqdate) {
				if (attributionStrings.length) {
					attributionStrings.push(', ');
				}
				const innerAqdateCollection = stringToViewCollection(
					innerAqdate,
					this.editor,
				);
				attributionStrings.push(...innerAqdateCollection);
			}
		}
		if (attributionStrings.length) {
			// prepend attribution string with an emdash
			attributionStrings.unshift('—');
		}
		this.setTemplate({
			tag: 'div',
			attributes: {
				class: ['ck', 'ck-quote-attribution'],
			},
			children: attributionStrings,
		});
	}
}
