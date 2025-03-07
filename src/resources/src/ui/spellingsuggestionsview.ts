import { View, ButtonView } from 'ckeditor5/src/ui.js';
import { Editor } from 'ckeditor5/src/core.js';
import { LOOKUP } from '../utils.js';

export default class SpellingSuggestionsView extends View {
	private editor: Editor;

	constructor(editor: Editor, suggestions: string[]) {
		super(editor.locale);
		this.editor = editor;

		const suggestionsContainer = new View(editor.locale);

		const headerView = new View(editor.locale);
		headerView.setTemplate({
			tag: 'div',
			attributes: {
				class: ['ck', 'ck-suggestions-header'],
			},
			children: [
				"Oops! We couldn't find that word. Did you mean one of these?",
			],
		});

		const suggestionButtons = suggestions.map((suggestion) => {
			const button = new ButtonView(editor.locale);
			button.set({
				label: suggestion,
				withText: true,
				tooltip: `Look up "${suggestion}"`,
			});

			// trigger lookup command on suggestion click
			this.listenTo(button, 'execute', () => {
				console.log(`executing lookup command with ${suggestion}`);
				this.editor.execute(LOOKUP, suggestion);
			});

			return button;
		});

		suggestionsContainer.setTemplate({
			tag: 'div',
			attributes: {
				class: ['ck', 'ck-suggestions-block'],
			},
			children: [headerView, ...suggestionButtons],
		});

		this.setTemplate({
			tag: 'div',
			attributes: {
				class: ['ck', 'ck-suggestions-container'],
			},
			children: [suggestionsContainer],
		});
	}
}
