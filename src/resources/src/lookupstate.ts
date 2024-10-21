import { ObservableMixin, Collection } from 'ckeditor5/src/utils.js';
import type { Model } from 'ckeditor5/src/engine.js';
import { LookupResult, MerriamWebsterResult } from './utils.js';



export default class LookupState extends ObservableMixin() {

  declare public wordToLookup: string;

  // selectedTab!: "dictionary" | "thesaurus";

  declare public isFetching: boolean;

  declare public isSuccess: boolean;

  // declare public isError: boolean;

  declare public results: MerriamWebsterResult[];

  declare public errorMessage: string | null;

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
