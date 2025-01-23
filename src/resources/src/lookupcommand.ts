import { Command, type Editor } from 'ckeditor5/src/core.js';
import LookupState from './lookupstate.js';
import { DictionaryTypes } from './DictionaryTypes.js';
import { ThesaurusTypes } from './ThesaurusTypes.js';
import { addToCache } from './utils.js';

export default class LookupCommand extends Command {
	/**
	 * The find and replace state object used for command operations.
	 */
	protected _state!: LookupState;

	constructor(editor: Editor, state: LookupState) {
		super(editor);
		this._state = state;
	}
	/**
	 * Executes the command.
	 *
	 * @fires execute
	 */
	override async execute(inputWord: string) {
		addToCache(inputWord); // Add the word to the cache
		this._state.set('isFetching', true);

		const url =
			`/actions/thesaurus/get-definitions?` +
			new URLSearchParams({
				word: inputWord,
			}).toString();

		const response = await fetch(url, {
			method: 'GET',
			headers: {
				Accept: 'application/json',
			},
		});

		const dictionaryResults = await response.json();

		if (dictionaryResults.every((result: any) => typeof result === 'string')) {
			// results are strings (not objects) -> suggestions for correct spelling
			this._state.set('isFetching', false);
			this._state.set('spellingSuggestions', dictionaryResults);
			return;
		}

		if (dictionaryResults.error) {
			this._state.set('isFetching', false);
			this._state.set(
				'errorMessage',
				`Error fetching definition for ${inputWord}: ${dictionaryResults.error}`,
			);
			return;
		}

		if (!Array.isArray(dictionaryResults)) {
			this._state.set('isFetching', false);
			this._state.set('errorMessage', 'Unexpected response from API');
			return;
		}
		const validDictionaryResults: DictionaryTypes.DictionaryResult[] = [];
		dictionaryResults.forEach((result) => {
			try {
				validDictionaryResults.push(result as DictionaryTypes.DictionaryResult);
			} catch (e) {
				console.log(`Error!`, e);
			} // swallow error, exclude from results
		});
		if (!validDictionaryResults.length) {
			this._state.set('isFetching', false);
			this._state.set('errorMessage', 'Unexpected response from API');
			return;
		}

		this._state.set('dictionaryResults', validDictionaryResults);

		const thesaurusUrl =
			`/actions/thesaurus/get-synonyms?` +
			new URLSearchParams({
				word: inputWord,
			}).toString();

		const thesaurusResponse = await fetch(thesaurusUrl, {
			method: 'GET',
			headers: {
				Accept: 'application/json',
			},
		});

		const thesaurusResults = await thesaurusResponse.json();
		if (thesaurusResults.error) {
			console.error(
				`Failed to fetch thesaurus results: ${thesaurusResults.error}`,
			);
			return;
		}

		if (!Array.isArray(thesaurusResults)) {
			this._state.set('isFetching', false);
			this._state.set('errorMessage', 'Unexpected response from API');
			return;
		}
		const validThesaurusResults: ThesaurusTypes.ThesaurusResult[] = [];
		thesaurusResults.forEach((thesaurusResult) => {
			try {
				validThesaurusResults.push(
					thesaurusResult as ThesaurusTypes.ThesaurusResult,
				);
			} catch (e) {
				console.log(`Error!`, e);
			} // swallow error, exclude from results
		});

		this._state.set('thesaurusResults', validThesaurusResults);
		this._state.set('isFetching', false);
		this._state.set('isSuccess', true);
		this._state.set('errorMessage', null);
	}
}
