import { Command, type Editor } from 'ckeditor5/src/core.js';
import LookupState from './lookupstate.js';
import { addToHistory } from './utils.js';

export default class LookupCommand extends Command {
	protected _state!: LookupState;

	constructor(editor: Editor, state: LookupState) {
		super(editor);
		this._state = state;
	}

	override async execute(inputWord: string) {
		// Add word to history
		addToHistory(inputWord);

		// Set state to indicate fetching
		this._state.set('isFetching', true);

		try {
			// Fetch from backend endpoints (server handles caching)
			const dictionaryResponse = await fetch(
				`/actions/thesaurus/get-definitions?` +
					new URLSearchParams({ word: inputWord }).toString(),
				{ method: 'GET', headers: { Accept: 'application/json' } },
			);

			const thesaurusResponse = await fetch(
				`/actions/thesaurus/get-synonyms?` +
					new URLSearchParams({ word: inputWord }).toString(),
				{ method: 'GET', headers: { Accept: 'application/json' } },
			);

			// Parse responses
			const dictionaryResults = await dictionaryResponse.json();
			const thesaurusResults = await thesaurusResponse.json();

			// Validate response structure
			if (
				!Array.isArray(dictionaryResults) ||
				!Array.isArray(thesaurusResults)
			) {
				throw new Error('Unexpected API response structure');
			}

			// Update state with results
			this._state.set('dictionaryResults', dictionaryResults);
			this._state.set('thesaurusResults', thesaurusResults);
			this._state.set('isSuccess', true);
		} catch (error) {
			// Handle errors gracefully
			console.error(`Error fetching data for: ${inputWord}`, error);
			this._state.set(
				'errorMessage',
				`Failed to fetch data for ${inputWord}.`,
			);
		} finally {
			this._state.set('isFetching', false);
		}
	}
}
