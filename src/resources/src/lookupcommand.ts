import { Command, type Editor } from 'ckeditor5/src/core.js';
import LookupState from './lookupstate.js';
import { MerriamWebsterResult, Pronunciation } from './utils.js';

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
		const validResults: MerriamWebsterResult[] = [];

		results.forEach((result) => {
			try {
				const validResult = formatMerriamWebsterResult(result);
				validResults.push(validResult);
			} catch (e) {
				console.log(`Error!`, e);
			} // swallow error, exclude from results
		});
		if (!validResults.length) {
			this._state.set('isFetching', false);
			this._state.set('errorMessage', 'Unexpected response from API');
			return;
		}

		// request succeeded
		this._state.set('isFetching', false);
		this._state.set('isSuccess', true);
		this._state.set('errorMessage', null);
		this._state.set('results', validResults);
	}
}

export function formatMerriamWebsterResult(
	result: unknown,
): MerriamWebsterResult {
	if (typeof result !== 'object' || result === null) {
		throw new Error('Invalid input: result must be an object');
	}

	const obj = result as Record<string, any>; // Type assertion for easier property access

	// Ensure required properties
	if (!obj.shortdef || !Array.isArray(obj.shortdef)) {
		throw new Error('Missing or invalid property: shortdef');
	}
	if (!obj.fl || typeof obj.fl !== 'string') {
		throw new Error('Missing or invalid property: fl');
	}
	if (!obj.hwi || !obj.hwi.hw) {
		throw new Error('Missing or invalid property: hwi');
	}

	const pronunciations: Pronunciation[] = [];
	if (obj.hwi.prs && Array.isArray(obj.hwi.prs)) {
		obj.hwi.prs.forEach((p: any) => {
			pronunciations.push({
				preText: p.l ? String(p.l) : '',
				text: String(p.mw),
				postText: p.l2 ? String(p.l2) : '',
			});
		});
	}

	return {
		word: String(obj.hwi.hw),
		pronunciations,
		label: String(obj.fl),
		definitions: obj.shortdef.map((def: any) => String(def)),
	};
}
