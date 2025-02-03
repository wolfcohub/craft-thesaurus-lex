import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Dialog } from 'ckeditor5/src/ui.js';
import ThesaurusLex from '../src/thesauruslex.js';
import LookupUI from '../src/lookupui.js';

describe('ThesaurusLex', () => {
	it('should be named', () => {
		expect(ThesaurusLex.pluginName).to.equal('ThesaurusLex');
	});

	describe('init()', () => {
		let domElement: HTMLElement, editor: ClassicEditor;

		beforeEach(async () => {
			domElement = document.createElement('div');
			document.body.appendChild(domElement);

			editor = await ClassicEditor.create(domElement, {
				plugins: [Paragraph, Essentials, ThesaurusLex],
				toolbar: ['thesaurusLexButton'],
			});
		});

		afterEach(() => {
			domElement.remove();
			return editor.destroy();
		});

		it('should load ThesaurusLex', () => {
			const myPlugin = editor.plugins.get('ThesaurusLex');

			expect(myPlugin).to.be.an.instanceof(ThesaurusLex);
		});

		it('should add an icon to the toolbar', () => {
			expect(
				editor.ui.componentFactory.has('thesaurusLexButton'),
			).to.equal(true);
		});

		it('clicking the icon should open the ThesaurusLex modal', () => {
			const icon =
				editor.ui.componentFactory.create('thesaurusLexButton');
			const lookupUi = editor.plugins.get('LookupUI') as LookupUI;

			expect(editor.getData()).to.equal('');
			expect(lookupUi).to.be.instanceOf(LookupUI);

			expect(lookupUi).toHaveProperty('modal');
			expect(lookupUi.modal).to.be.instanceOf(Dialog);

			// modal should initially be closed
			expect(lookupUi.modal.isOpen).to.equal(false);

			// simulate ThesaurusLex button click
			icon.fire('execute');

			// modal should now be open
			expect(lookupUi.modal.isOpen).to.equal(true);
		});
	});
});
