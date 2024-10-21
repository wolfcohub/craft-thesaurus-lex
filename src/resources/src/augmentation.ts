import type { ThesaurusLex } from './index.js';

declare module '@ckeditor/ckeditor5-core' {
	interface PluginsMap {
		[ ThesaurusLex.pluginName ]: ThesaurusLex;
	}
}
