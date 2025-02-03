import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import ThesaurusLex from '../src/thesauruslex.js';
import { DictionaryTypes } from '../src/DictionaryTypes.js';
import DictionaryContentView from '../src/ui/dictionarycontentview.js';
import applicationJSON from './data/application.json';
import { ViewCollection } from 'ckeditor5/src/ui.js';

describe("DictionaryContentView correctly renders response from Merriam-Webster's Collegiate® Dictionary", () => {
	let editor: ClassicEditor, view: DictionaryContentView;

	// beforeEach( async () => {
	//   const domElement = document.createElement('div');
	//   document.body.appendChild(domElement);

	//   editor = await ClassicEditor.create(domElement, {
	//     plugins: [Paragraph, Essentials, ThesaurusLex],
	//   });

	//   model = editor.model;
	//   root = model.document.getRoot();
	//   state = new LookupState();
	// } );

	beforeEach(async () => {
		const domElement = document.createElement('div');
		document.body.appendChild(domElement);

		editor = await ClassicEditor.create(domElement, {
			plugins: [Paragraph, Essentials, ThesaurusLex],
		});
	});

	afterEach(async () => {
		if (view instanceof DictionaryContentView) {
			view.element?.remove();
			view.destroy();
		}
		await editor.destroy();
	});

	it('handles the word "application"', () => {
		view = new DictionaryContentView(
			editor,
			applicationJSON as unknown as DictionaryTypes.DictionaryResult[],
		);
		view.render();

		expect(view.template).is.not.undefined;
		expect(view.template?.children).to.be.instanceOf(ViewCollection);
		// expect(view.template?.children?.)
	});
});
