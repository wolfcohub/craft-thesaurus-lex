import { Locale } from 'ckeditor5';
import { ToolbarSeparatorView, View } from 'ckeditor5/src/ui.js';
import { DictionaryTypes } from '../DictionaryTypes.js';
import SingleMeaningView from './singlemeaningview.js';

export default class DictionaryContentView extends View {
	public declare selectedResult: string | null;

	constructor(
		locale: Locale,
		lookupResults: DictionaryTypes.DictionaryResult[],
	) {
		super(locale);
		const tabBlocks = this.createCollection();
		const resultBlocks = this.createCollection();

		lookupResults.forEach((result) => {
			if (!result.def) {
				// skip result if def is not defined
				return;
			}
			// insert separators between tabs
			tabBlocks.add(new ToolbarSeparatorView());

			const resultBlock = new View(locale);
			resultBlock.setTemplate({
				tag: 'div',
				attributes: {
					class: ['ck', 'selectedResult'],
				},
				children: [new SingleMeaningView(locale, result)],
			});
			resultBlocks.add(resultBlock);
		});

		const tabsContainer = new View(locale);
		tabsContainer.setTemplate({
			tag: 'div',
			attributes: {
				class: ['ck', 'ck-sub-tab-selector'],
			},
			children: tabBlocks,
		});

		const resultsContainer = new View(locale);
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
