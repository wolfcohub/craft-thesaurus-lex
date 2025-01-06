import { ButtonView, ToolbarSeparatorView, View } from 'ckeditor5/src/ui.js';
import { type Locale } from 'ckeditor5/src/utils.js';
import { DictionaryTypes } from '../DictionaryTypes.js';
import { ThesaurusTypes } from '../ThesaurusTypes.js';
import ThesaurusBlock from './thesaurusblock.js';
import DictionaryContentView from './dictionarycontentview.js';

export function removeAsterisks(input: string): string {
	return input.replace(/\*/g, '');
}

// Placeholder API key for the thesaurus API

export default class DictionaryThesaurusSelectorView extends View {
	public declare selectedTab: 'dictionary' | 'thesaurus';
	private word: string;
	private editor: any;

	constructor(
		locale: Locale,
		editor: any,
		dictionaryResults: DictionaryTypes.DictionaryResult[],
		thesaurusResults: ThesaurusTypes.ThesaurusResult[] = [],
	) {
		super(locale);
		this.editor = editor;
		const t = locale.t;
		const bind = this.bindTemplate;

		if (dictionaryResults.length === 0) {
			throw new Error('No results to display');
		}

		this.word = dictionaryResults[0].hwi.hw;
		const functionalLabel = dictionaryResults[0].fl;

		this.set('selectedTab', 'dictionary');

		// Dictionary select button setup
		const dictionarySelectButton = new ButtonView(locale);
		dictionarySelectButton.set({
			label: t('Dictionary'),
			withText: true,
			tooltip: true,
		});
		dictionarySelectButton
			.bind('class')
			.to(this, 'selectedTab', (value) =>
				value === 'dictionary'
					? 'ck ck-tab ck-dictionary-select ck-selected'
					: 'ck ck-tab ck-dictionary-select',
			);
		this.listenTo(dictionarySelectButton, 'execute', () => {
			this.set('selectedTab', 'dictionary');
		});

		// Thesaurus select button setup
		const thesaurusSelectButton = new ButtonView(locale);
		thesaurusSelectButton.set({
			label: t('Thesaurus'),
			withText: true,
			tooltip: true,
		});
		thesaurusSelectButton
			.bind('class')
			.to(this, 'selectedTab', (value) =>
				value === 'thesaurus'
					? 'ck ck-tab ck-thesaurus-select ck-selected'
					: 'ck ck-tab ck-thesaurus-select',
			);
		this.listenTo(thesaurusSelectButton, 'execute', () => {
			this.set('selectedTab', 'thesaurus');
		});

		const tabSelectDiv = new View(locale);
		tabSelectDiv.setTemplate({
			tag: 'div',
			attributes: {
				class: ['ck', 'ck-tab-selector'],
			},
			children: [
				dictionarySelectButton,
				new ToolbarSeparatorView(),
				thesaurusSelectButton,
			],
		});

		// Create word heading view
		const wordHeading = new View(locale);
		wordHeading.setTemplate({
			tag: 'span',
			attributes: {
				class: ['ck', 'ck-word'],
			},
			children: [removeAsterisks(this.word)],
		});

		// Create functional label view
		const functionalLabelView = new View(locale);
		functionalLabelView.setTemplate({
			tag: 'span',
			attributes: {
				class: ['ck', 'ck-functional-label'],
			},
			children: [functionalLabel],
		});

		// Container for wordHeading and functionalLabelView
		const wordContainer = new View(locale);
		wordContainer.setTemplate({
			tag: 'div',
			attributes: {
				class: ['ck', 'ck-word-container'],
			},
			children: [wordHeading, functionalLabelView],
		});

		// create SingleMeaningView instance for each result
		const dictionaryContainer = new View(locale);
		const dictionaryContent = new DictionaryContentView(
			locale,
			dictionaryResults,
		);
		dictionaryContainer.setTemplate({
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-scrollable-results',
					// hide dictionary content if thesaurus tab selected
					bind.if(
						'selectedTab',
						'ck-hidden',
						(value) => value !== 'dictionary',
					),
				],
			},
			children: [wordHeading, dictionaryContent],
		});

		const thesaurusContainer = new View(locale);
		const thesaurusContent = thesaurusResults.map(
			(result) => new ThesaurusBlock(locale, result, this.editor),
		);

		thesaurusContainer.setTemplate({
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-scrollable-results',
					// hide thesaurus content if dictionary tab selected
					bind.if(
						'selectedTab',
						'ck-hidden',
						(value) => value !== 'thesaurus',
					),
				],
			},
			children: [wordHeading, ...thesaurusContent],
		});

		this.setTemplate({
			tag: 'div',
			attributes: {
				class: ['ck', 'ck-result-form'],
				tabindex: -1,
			},
			children: [
				tabSelectDiv,
				wordHeading,
				dictionaryContainer,
				thesaurusContainer,
			],
		});
	}
}
