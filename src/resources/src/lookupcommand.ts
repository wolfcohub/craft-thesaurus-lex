import { Command, type Editor } from 'ckeditor5/src/core.js';
import LookupState from './lookupstate.js';
import { DictionaryTypes } from '../../DictionaryTypes.js';

const API_KEY = '054c2e55-ab0b-437e-adc6-ddec840a3616';

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

		const url = `https://dictionaryapi.com/api/v3/references/collegiate/json/${inputWord}?key=${API_KEY}`;
		const response = await fetch(url);
		if (!response.ok) {
			this._state.set('isFetching', false);
			this._state.set(
				'errorMessage',
				`Error fetching definition for ${inputWord}: ${response.status}`,
			);
			return;
		}

		const results = await response.json();
		console.log('response data: ', results);
		if (!Array.isArray(results)) {
			this._state.set('isFetching', false);
			this._state.set('errorMessage', 'Unexpected response from API');
			return;
		}
		const validResults: DictionaryTypes.DictionaryResult[] = [];

		results.forEach((result) => {
			try {
				// const validResult = formatMerriamWebsterResult(result);
				validResults.push(result as DictionaryTypes.DictionaryResult);
			} catch (e) {
				console.log(`Error!`, e);
			} // swallow error, exclude from results
		});
		if (!validResults.length) {
			this._state.set('isFetching', false);
			this._state.set('errorMessage', 'Unexpected response from API');
			return;
		}
		console.log(`results: `, validResults);

		// request succeeded
		this._state.set('isFetching', false);
		this._state.set('isSuccess', true);
		this._state.set('errorMessage', null);
		this._state.set('results', validResults);
	}
}
