import { Plugin } from 'ckeditor5/src/core.js';
import LookupUI from './lookupui.js';
import LookupEditing from './lookupediting.js';
import { LOOKUP } from './utils.js';


export default class ThesaurusLex extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ LookupEditing, LookupUI ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'ThesaurusLex' as const;
	}
}
