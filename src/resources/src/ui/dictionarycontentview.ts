import { Editor } from 'ckeditor5/src/core.js';
import { ToolbarSeparatorView, View } from 'ckeditor5/src/ui.js';
import { DictionaryTypes } from '../DictionaryTypes.js';
import SingleMeaningView from './singlemeaningview.js';

export default class DictionaryContentView extends View {
	private editor: Editor;
	public declare selectedResult: string | null;

	constructor(
		editor: Editor,
		lookupResults: DictionaryTypes.DictionaryResult[],
	) {
		super(editor.locale);
		this.editor = editor;

		const tabBlocks = this.createCollection();
		const resultBlocks = this.createCollection();

		lookupResults.forEach((result) => {
			if (!result.def) {
				// skip result if def is not defined
				return;
			}
			// insert separators between tabs
			tabBlocks.add(new ToolbarSeparatorView());

			const resultBlock = new View(editor.locale);
			resultBlock.setTemplate({
				tag: 'div',
				attributes: {
					class: ['ck', 'selectedResult'],
				},
				children: [new SingleMeaningView(this.editor, result)],
			});
			resultBlocks.add(resultBlock);
		});

		const tabsContainer = new View(editor.locale);
		tabsContainer.setTemplate({
			tag: 'div',
			attributes: {
				class: ['ck', 'ck-sub-tab-selector'],
			},
			children: tabBlocks,
		});

		const resultsContainer = new View(editor.locale);
		resultsContainer.setTemplate({
			tag: 'div',
			children: resultBlocks,
		});

		this.setTemplate({
			tag: 'div',
			attributes: {
				class: ['ck', 'ck-dictionary'],
			},
			children: [tabsContainer, resultsContainer],
		});
		this.set('selectedResult', 'result-0');
	}
}
