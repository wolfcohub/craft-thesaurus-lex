import { Command, type Editor } from 'ckeditor5/src/core.js';
import LookupState from './lookupstate.js';
import { addToHistory } from './utils.js';
import { DictionaryTypes } from './DictionaryTypes.js';
import { ThesaurusTypes } from './ThesaurusTypes.js';

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
		this._state.set('errorMessage', null);
		this._state.set('spellingSuggestions', []);

		try {
			// Fetch dictionary and thesaurus results
			const [dictionaryResponse, thesaurusResponse] = await Promise.all([
				fetch(
					`/actions/thesaurus/get-definitions?` +
						new URLSearchParams({ word: inputWord }).toString(),
					{ method: 'GET', headers: { Accept: 'application/json' } },
				),
				fetch(
					`/actions/thesaurus/get-synonyms?` +
						new URLSearchParams({ word: inputWord }).toString(),
					{ method: 'GET', headers: { Accept: 'application/json' } },
				),
			]);

			const dictionaryResults = await dictionaryResponse.json();
			const thesaurusResults = await thesaurusResponse.json();

			//  Handle API errors (e.g., missing word, invalid response)
			if (dictionaryResults.error) {
				throw new Error(dictionaryResults.error);
			}
			if (thesaurusResults.error) {
				console.warn(
					`Thesaurus API Warning: ${thesaurusResults.error}`,
				);
			}

			// Handle Spelling Suggestions (when API returns an array of strings)
			if (
				Array.isArray(dictionaryResults) &&
				dictionaryResults.every((res) => typeof res === 'string')
			) {
				this._state.set('spellingSuggestions', dictionaryResults);
				this._state.set('isFetching', false);
				return;
			}

			// Ensure valid results with explicit typing
			const validDictionaryResults: DictionaryTypes.DictionaryResult[] =
				dictionaryResults.filter(
					(result: DictionaryTypes.DictionaryResult) =>
						result && typeof result === 'object',
				);

			const validThesaurusResults: ThesaurusTypes.ThesaurusResult[] =
				thesaurusResults.filter(
					(result: ThesaurusTypes.ThesaurusResult) =>
						result && typeof result === 'object',
				);

			// Handle empty results (instead of throwing an error)
			if (
				!validDictionaryResults.length &&
				!validThesaurusResults.length
			) {
				this._state.set(
					'errorMessage',
					`No results found for "${inputWord}".`,
				);
				return;
			}

			// ✅ Store results in state
			this._state.set('dictionaryResults', validDictionaryResults);
			this._state.set('thesaurusResults', validThesaurusResults);
			this._state.set('isSuccess', true);
		} catch (error) {
			console.error(`Error fetching data for: ${inputWord}`, error);
			this._state.set(
				'errorMessage',
				error instanceof Error
					? error.message
					: `Failed to fetch data for "${inputWord}".`,
			);
		} finally {
			this._state.set('isFetching', false);
		}
	}
}
