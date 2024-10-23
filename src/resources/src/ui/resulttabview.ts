import { Locale } from 'ckeditor5';
import {
	ButtonView,
	ToolbarSeparatorView,
	View,
	ViewCollection,
} from 'ckeditor5/src/ui.js';
import { LookupResult, MerriamWebsterResult } from '../utils.js';
import { DictionaryTypes } from '../DictionaryTypes.js';
import SingleMeaningView from './singlemeaningview.js';

export default class ResultTabView extends View {
	public declare selectedResult: string | null;

	constructor(
		locale: Locale,
		lookupResults: DictionaryTypes.DictionaryResult[],
	) {
		super(locale);

		const bind = this.bindTemplate;
		const tabBlocks = this.createCollection();
		const resultBlocks = this.createCollection();

		lookupResults.forEach((result, index) => {
			if (index > 0) {
				// insert separators between tabs
				tabBlocks.add(new ToolbarSeparatorView());
			}
			const viewUid = `result-${index}`;
			const selectTabButton = new ButtonView(locale);
			selectTabButton.set({
				label: `${index + 1}. ${result.fl}`,
				withText: true,
			});
			selectTabButton
				.bind('class')
				.to(this, 'selectedResult', (value) =>
					value === viewUid
						? 'ck ck-sub-tab ck-selected'
						: 'ck ck-sub-tab',
				);
			this.listenTo(selectTabButton, 'execute', () => {
				this.set('selectedResult', viewUid);
			});
			tabBlocks.add(selectTabButton);

			const resultBlock = new View(locale);
			resultBlock.set({ viewUid: viewUid });
			resultBlock.setTemplate({
				tag: 'div',
				attributes: {
					class: [
						'ck',
						bind.if(
							'selectedResult',
							'ck-hidden',
							(value) => value !== viewUid,
						),
					],
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
