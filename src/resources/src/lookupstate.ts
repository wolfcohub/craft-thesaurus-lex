import { ObservableMixin } from 'ckeditor5/src/utils.js';
import { DictionaryTypes } from './DictionaryTypes.js';
import { ThesaurusTypes } from './ThesaurusTypes.js';

export default class LookupState extends ObservableMixin() {
	public declare wordToLookup: string;

	public declare isFetching: boolean;

	public declare isSuccess: boolean;

	public declare dictionaryResults: DictionaryTypes.DictionaryResult[];

	public declare thesaurusResults: ThesaurusTypes.ThesaurusResult[];

	public declare errorMessage: string | null;

	constructor() {
		super();
		this.reset();
	}

	reset(): void {
		this.set('wordToLookup', '');
		this.set('isFetching', false);
		this.set('isSuccess', false);
		this.set('dictionaryResults', []);
		this.set('thesaurusResults', []);
		this.set('errorMessage', null);
	}
}
