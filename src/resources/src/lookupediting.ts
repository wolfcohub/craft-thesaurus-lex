import { Plugin } from 'ckeditor5/src/core.js';
import LookupCommand from './lookupcommand.js';
import LookupState from './lookupstate.js';
import { LOOKUP } from './utils.js';
import '../theme/lookup.css';

export default class LookupEditing extends Plugin {
	public state!: LookupState;

	public static get pluginName() {
		return 'LookupEditing' as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const t = this.editor.t;
		this.state = new LookupState();

		// Create bold command.
		editor.commands.add(LOOKUP, new LookupCommand(editor, this.state));

		// Set the Ctrl+L keystroke.
		// editor.keystrokes.set( 'CTRL+L', LOOKUP );

		// Add the information about the keystroke to the accessibility database.
		// editor.accessibility.addKeystrokeInfos( {
		// 	keystrokes: [
		// 		{
		// 			label: t( 'Lookup word' ),
		// 			keystroke: 'CTRL+L'
		// 		}
		// 	]
		// } );
	}
}
