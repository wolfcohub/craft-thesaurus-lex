import { ButtonView, ToolbarSeparatorView, View } from 'ckeditor5/src/ui.js';
import { type Locale } from 'ckeditor5/src/utils.js';
import { DictionaryTypes } from '../DictionaryTypes.js';
import { ThesaurusTypes } from '../ThesaurusTypes.js';
import ThesaurusBlock from './thesaurusblock.js';
import DictionaryContentView from './dictionarycontentview.js';
import {
	canGoBack,
	canGoForward,
	getNextWord,
	getPreviousWord,
} from '../utils.js';

export function removeAsterisks(input: string): string {
	return input.replace(/\*/g, '');
}

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

		// Filter dictionary results to exclude invalid entries
		const filteredDictionaryResults =
			this.filterDictionaryResults(dictionaryResults);

		if (filteredDictionaryResults.length === 0) {
			throw new Error('No valid dictionary results to display');
		}
		this.word = dictionaryResults[0]?.hwi?.hw;

		const functionalLabel = filteredDictionaryResults[0].fl;

		this.set('selectedTab', 'dictionary');

		// Back button setup
		const backButton = new ButtonView(locale);
		const forwardButton = new ButtonView(locale);
		// Button state updater
		const updateButtonStates = () => {
			backButton.isEnabled = canGoBack();
			forwardButton.isEnabled = canGoForward();
		};
		// Back button setup
		backButton.set({
			label: t('Back'),
			withText: true,
			tooltip: 'Go back to the previous word',
			isEnabled: canGoBack(), // Initial state
		});
		backButton.on('execute', () => {
			const previousWord = getPreviousWord();
			if (previousWord) {
				editor.execute('lookup', previousWord); // Pass the word, not the whole entry
				updateButtonStates(); // Update after navigation
			} else {
				console.warn('No previous word available.');
			}
		});
		// Forward button setup
		forwardButton.set({
			label: t('Forward'),
			withText: true,
			tooltip: 'Go forward to the next word',
			isEnabled: canGoForward(), // Initial state
		});
		forwardButton.on('execute', () => {
			const nextWord = getNextWord();
			if (nextWord) {
				editor.execute('lookup', nextWord); // Pass the word, not the whole entry
				updateButtonStates(); // Update after navigation
			} else {
				console.warn('No next word available.');
			}
		});
		// Call `updateButtonStates` after initial render to ensure buttons are correct
		updateButtonStates();
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
			this.editor,
			filteredDictionaryResults,
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

		let thesaurusContent: View[];

		// Check if `thesaurusResults` is a flat array of words (edge case)
		if (
			Array.isArray(thesaurusResults) &&
			typeof thesaurusResults[0] === 'string'
		) {
			// Edge case: Wrap the flat array of strings into a single array
			thesaurusContent = [
				new ThesaurusBlock(
					locale,
					thesaurusResults as unknown as string[],
					this.editor,
				),
			];
		} else {
			// Normal case: Process each `ThesaurusResult` object
			thesaurusContent = thesaurusResults.map((result) => {
				return new ThesaurusBlock(
					locale,
					result as ThesaurusTypes.ThesaurusResult,
					this.editor,
				);
			});
		}

		thesaurusContainer.setTemplate({
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-scrollable-results',
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
				backButton,
				forwardButton,
				wordHeading,
				dictionaryContainer,
				thesaurusContainer,
			],
		});
	}

	/**
	 * Filters out dictionary results that lack 'def' or 'fl'.
	 */
	private filterDictionaryResults(
		results: DictionaryTypes.DictionaryResult[],
	): DictionaryTypes.DictionaryResult[] {
		return results.filter((result) => result.def && result.fl);
	}
}
