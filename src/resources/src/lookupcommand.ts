import { Command, type Editor } from 'ckeditor5/src/core.js';
import LookupState from './lookupstate.js';
import { DictionaryTypes } from './DictionaryTypes.js';
import { ThesaurusTypes } from './ThesaurusTypes.js';
import { addToCache, getPreviousEntry, getNextEntry } from './utils.js'; // Import cachedEntries
import { cachedEntries } from './utils.js';

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
		// Check if the word is already cached
		const cachedEntry = cachedEntries.find(
			(entry) => entry.word.toLowerCase() === inputWord.toLowerCase(),
		);

		if (cachedEntry) {
			this._state.set('dictionaryResults', cachedEntry.dictionaryResults);
			this._state.set('thesaurusResults', cachedEntry.thesaurusResults);
			this._state.set('isFetching', false);
			this._state.set('isSuccess', true);
			return;
		}
		// If not cached, fetch from the API
		this._state.set('isFetching', true);

		try {
			// Fetch definitions
			const dictionaryUrl =
				`/actions/thesaurus/get-definitions?` +
				new URLSearchParams({ word: inputWord }).toString();
			const dictionaryResponse = await fetch(dictionaryUrl, {
				method: 'GET',
				headers: { Accept: 'application/json' },
			});
			const dictionaryResults = await dictionaryResponse.json();
			// Fetch synonyms
			const thesaurusUrl =
				`/actions/thesaurus/get-synonyms?` +
				new URLSearchParams({ word: inputWord }).toString();
			const thesaurusResponse = await fetch(thesaurusUrl, {
				method: 'GET',
				headers: { Accept: 'application/json' },
			});
			const thesaurusResults = await thesaurusResponse.json();

			if (
				!Array.isArray(dictionaryResults) ||
				!Array.isArray(thesaurusResults)
			) {
				throw new Error('Unexpected API response structure');
			}
			// Validate and update state
			this._state.set('dictionaryResults', dictionaryResults);
			this._state.set('thesaurusResults', thesaurusResults);
			this._state.set('isFetching', false);
			this._state.set('isSuccess', true);
			// Cache the response
			addToCache(inputWord, dictionaryResults, thesaurusResults);
		} catch (error) {
			console.error(`Failed to fetch data for word: ${inputWord}`, error);
			this._state.set('isFetching', false);
			this._state.set(
				'errorMessage',
				`Failed to fetch data for ${inputWord}`,
			);
		}
	}
}
