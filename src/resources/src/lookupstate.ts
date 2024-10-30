import { ObservableMixin } from 'ckeditor5/src/utils.js';
import { DictionaryTypes } from './DictionaryTypes.js';

export default class LookupState extends ObservableMixin() {
	public declare wordToLookup: string;

	// selectedTab!: "dictionary" | "thesaurus";

	public declare isFetching: boolean;

	public declare isSuccess: boolean;

	// declare public isError: boolean;

	public declare results: DictionaryTypes.DictionaryResult[];

	public declare errorMessage: string | null;

	constructor() {
		super();
		this.reset();
	}

	reset(): void {
		this.set('wordToLookup', '');
		this.set('isFetching', false);
		this.set('isSuccess', false);
		// this.set('isError', false);
		this.set('results', []);
		this.set('errorMessage', null);
	}
}
