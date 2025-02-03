import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import ThesaurusLex from '../src/thesauruslex.js';
import { DictionaryTypes } from '../src/DictionaryTypes.js';
import DictionaryContentView from '../src/ui/dictionarycontentview.js';
import applicationJSON from './data/application.json';
import gingerlyJSON from './data/gingerly.json';

describe("DictionaryContentView correctly renders response from Merriam-Webster's Collegiate® Dictionary", () => {
	let editor: ClassicEditor, view: DictionaryContentView;

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
		expect(view.element).is.not.null;

		const resultElements =
			view.element?.querySelectorAll('div.ck.ck-result');
		expect(resultElements).is.not.undefined;
		expect(resultElements?.length).toBe(4);
	});

	it('handles the word "gingerly"', () => {
		view = new DictionaryContentView(
			editor,
			gingerlyJSON as unknown as DictionaryTypes.DictionaryResult[],
		);
		view.render();

		expect(view.template).is.not.undefined;
		expect(view.element).is.not.null;

		const resultElements =
			view.element?.querySelectorAll('div.ck.ck-result');
		expect(resultElements).is.not.undefined;
		expect(resultElements?.length).toBe(2);
	});
});
