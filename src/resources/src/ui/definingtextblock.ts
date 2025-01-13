import { Editor } from 'ckeditor5/src/core.js';
import { View } from 'ckeditor5/src/ui.js';
import { stringToViewCollection } from '../utils.js';

export default class DefiningTextBlock extends View {
	constructor(editor: Editor, data: string) {
		super(editor.locale);

		const definingTextCollection = stringToViewCollection(data, editor);
		this.setTemplate({
			tag: 'p',
			attributes: {
				class: ['ck', 'ck-definition'],
			},
			children: definingTextCollection,
		});
	}
}
