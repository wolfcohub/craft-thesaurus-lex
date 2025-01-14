import { Editor } from 'ckeditor5/src/core.js';
import { View } from 'ckeditor5/src/ui.js';
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

		const resultBlocks = this.createCollection();

		lookupResults.forEach((result) => {
			if (!result.def) {
				// skip result if def is not defined
				return;
			}

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
			children: [resultsContainer],
		});
		this.set('selectedResult', 'result-0');
	}
}
