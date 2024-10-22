import { Plugin } from 'ckeditor5/src/core.js';
import { ButtonView, Dialog, Notification } from 'ckeditor5/src/ui.js';
import { isSingleWord, LOOKUP, rangeToText } from './utils.js';
import LookupFormView from './ui/lookupformview.js';
import LookupEditing from './lookupediting.js';
import LookupState from './lookupstate.js';
import lexIcon from './../../icon.svg';

/**
 * The Lookup UI feature. It introduces the Lookup button.
 */
export default class LookupUI extends Plugin {
	state!: LookupState;
	private modal!: Dialog;

	public static get pluginName() {
		return 'LookupUI' as const;
	}

	static get requires() {
		return [Dialog, Notification];
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const t = editor.locale.t;
		const plugin = editor.plugins.get('LookupEditing') as LookupEditing;
		this.state = plugin.state;

		this.modal = new Dialog(editor);

		const lookupCommand = editor.commands.get(LOOKUP);
		if (lookupCommand) {
			// Add lookup button to feature components.
			editor.ui.componentFactory.add('lookupButton', () => {
				const dialog = editor.plugins.get('Dialog');
				const plugin = editor.plugins.get(
					'LookupEditing',
				) as LookupEditing;
				const state = plugin.state;
				const doc = editor.model.document;

				const buttonView = new ButtonView(editor.locale);

				buttonView.set({
					label: t('ThesaurusLex'),
					icon: lexIcon,
					tooltip: true,
				});

				buttonView
					.bind('isOn')
					.to(dialog, 'id', (id) => id === 'dictionaryLookup');

				// Execute the command.
				this.listenTo(buttonView, 'execute', () => {
					console.log('LookupUI:execute');
					const selection = doc.selection;
					if (selection.rangeCount === 1) {
						// if a single word is selected, prepopulate search input with it
						const range = selection.getFirstRange();

						const word = rangeToText(range);
						if (isSingleWord(word)) {
							state.wordToLookup = word;
						}
					}

					const formView = this.createLookupFormView();
					formView.input.fieldView.set({
						value: state?.wordToLookup,
					});
					formView.bind('isFetching').to(state, 'isFetching');
					formView.bind('isSuccess').to(state, 'isSuccess');
					formView.bind('results').to(state, 'results');

					this.listenTo(
						state,
						'change:errorMessage',
						(evt, name, errorMessage) => {
							if (errorMessage) {
								this.modal.hide();
								const notification =
									editor.plugins.get(Notification);
								notification.showWarning(errorMessage);
							}
						},
					);

					formView.on('cancel', () => {
						this.modal.hide();
					});
					this.listenTo(formView, 'submit', () => {
						editor.execute(LOOKUP, formView.inputText);
					});

					if (buttonView.isOn) {
						this.modal.hide();
						state.reset();
					} else {
						this.modal.show({
							isModal: true,
							id: 'dictionaryLookup',
							title: t('Dictionary Lookup'),
							content: formView,
							onHide: () => {
								state.reset();
							},
						});
					}
				});

				return buttonView;
			});
		}
	}

	createLookupFormView(): LookupFormView {
		const formView = new LookupFormView(this.editor.locale);
		return formView;
	}
}
