import { expect } from 'chai';
import { ThesaurusLex as ThesaurusLexDll, icons } from '../src/index.js';
import ThesaurusLex from '../src/thesauruslex.js';

import ckeditor from './../theme/icons/ckeditor.svg';

describe( 'CKEditor5 ThesaurusLex DLL', () => {
	it( 'exports ThesaurusLex', () => {
		expect( ThesaurusLexDll ).to.equal( ThesaurusLex );
	} );

	describe( 'icons', () => {
		it( 'exports the "ckeditor" icon', () => {
			expect( icons.ckeditor ).to.equal( ckeditor );
		} );
	} );
} );
