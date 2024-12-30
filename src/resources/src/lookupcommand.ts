import { Command, type Editor } from 'ckeditor5/src/core.js';
import LookupState from './lookupstate.js';
import { DictionaryTypes } from './DictionaryTypes.js';
import { ThesaurusTypes } from './ThesaurusTypes.js';

const DICTIONARY_API_KEY = '***REMOVED***';
const THESAURUS_API_KEY = '***REMOVED***';

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
		this._state.set('isFetching', true);

		const url = `https://dictionaryapi.com/api/v3/references/collegiate/json/${inputWord}?key=${DICTIONARY_API_KEY}`;
		const response = await fetch(url);
		if (!response.ok) {
			this._state.set('isFetching', false);
			this._state.set(
				'errorMessage',
				`Error fetching definition for ${inputWord}: ${response.status}`
			);
			return;
		}

		const dictionaryResults = await response.json();
		// console.log('dictionary response data: ', results);
		if (!Array.isArray(dictionaryResults)) {
			this._state.set('isFetching', false);
			this._state.set('errorMessage', 'Unexpected response from API');
			return;
		}
		const validDictionaryResults: DictionaryTypes.DictionaryResult[] = [];

		dictionaryResults.forEach((result) => {
			try {
				// const validResult = formatMerriamWebsterResult(result);
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
		// console.log(`results: `, validDictionaryResults);

		// request succeeded

		this._state.set('dictionaryResults', validDictionaryResults);

		const thesaurusUrl = `https://dictionaryapi.com/api/v3/references/thesaurus/json/${inputWord}?key=${THESAURUS_API_KEY}`;
		const thesaurusResponse = await fetch(thesaurusUrl);
		if (!thesaurusResponse.ok) {
			console.error(
				`Failed to fetch thesaurus results: ${thesaurusResponse.status}`
			);
			return;
		}
		const thesaurusResults = await thesaurusResponse.json();
		if (!Array.isArray(thesaurusResults)) {
			this._state.set('isFetching', false);
			this._state.set('errorMessage', 'Unexpected response from API');
			return;
		}
		const validThesaurusResults: ThesaurusTypes.ThesaurusResult[] = [];

		thesaurusResults.forEach((thesaurusResult) => {
			try {
				// const validResult = formatMerriamWebsterResult(thesaurusResult);
				validThesaurusResults.push(
					thesaurusResult as ThesaurusTypes.ThesaurusResult
				);
			} catch (e) {
				console.log(`Error!`, e);
			} // swallow error, exclude from results
		});
		if (!validThesaurusResults.length) {
			this._state.set('isFetching', false);
			this._state.set('errorMessage', 'Unexpected response from API');
			return;
		}

		this._state.set('thesaurusResults', validThesaurusResults);
		this._state.set('isFetching', false);
		this._state.set('isSuccess', true);
		this._state.set('errorMessage', null);
		// console.error('Error fetching thesaurus data:', error);
		// console.log(
		// 	'🚀 ~ LookupCommand ~ overrideexecute ~ validThesaurusResults:',
		// 	validThesaurusResults
		// );
	}
}
