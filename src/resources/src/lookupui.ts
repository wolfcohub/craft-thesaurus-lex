import { Plugin } from 'ckeditor5/src/core.js';
import { ButtonView, Dialog, Notification } from 'ckeditor5/src/ui.js';
import { isSingleWord, LOOKUP, rangeToText } from './utils.js';
import LookupFormView from './ui/lookupformview.js';
import LookupEditing from './lookupediting.js';
import LookupState from './lookupstate.js';
import lexIcon from './../../icon.svg';

export default class LookupUI extends Plugin {
	state!: LookupState;
	private modal!: Dialog;
	private handleOutsideClick: (event: MouseEvent) => void = () => {};
	public static get pluginName() {
		return 'LookupUI' as const;
	}

	static get requires() {
		return [Dialog, Notification];
	}

	public init(): void {
		const editor = this.editor;

		const t = editor.locale.t;
		const plugin = editor.plugins.get('LookupEditing') as LookupEditing;
		this.state = plugin.state;

		this.modal = new Dialog(editor);

		// Define the outside click handler
		this.handleOutsideClick = (event: MouseEvent) => {
			const modalContainer = document.querySelector('.ck-dialog'); // Replace with the correct selector for your modal
			if (
				modalContainer &&
				!modalContainer.contains(event.target as Node)
			) {
				this.modal.hide();
				this.state.reset();
			}
		};

		const lookupCommand = editor.commands.get(LOOKUP);
		if (lookupCommand) {
			editor.ui.componentFactory.add('thesaurusLexButton', () => {
				const dialog = editor.plugins.get('Dialog');
				const plugin = editor.plugins.get(
					'LookupEditing'
				) as LookupEditing;
				const state = plugin.state;
				const doc = editor.model.document;

				const buttonView = new ButtonView(editor.locale);

				buttonView.set({
					label: t('Dictionary'),
					icon: lexIcon,
					tooltip: true,
				});

				buttonView
					.bind('isOn')
					.to(dialog, 'id', id => id === 'dictionaryLookup');

				this.listenTo(buttonView, 'execute', () => {
					const selection = editor.model.document.selection;
					if (selection.rangeCount === 1) {
						const range = selection.getFirstRange();
						const word = rangeToText(range);

						if (isSingleWord(word)) {
							state.wordToLookup = word;
						}
					}

					const formView = new LookupFormView(editor.locale, editor); // Pass editor instance
					formView.input.fieldView.set({
						value: state?.wordToLookup,
					});
					formView.bind('isFetching').to(state, 'isFetching');
					formView.bind('isSuccess').to(state, 'isSuccess');
					formView
						.bind('dictionaryResults')
						.to(state, 'dictionaryResults');
					formView
						.bind('thesaurusResults')
						.to(state, 'thesaurusResults');

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
						}
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
							onShow: () => {
								if (state.wordToLookup) {
									editor.execute(LOOKUP, state.wordToLookup);
								}
								document.body.classList.add('no-scroll'); // Prevent background scrolling
								document.addEventListener(
									'mousedown',
									this.handleOutsideClick
								);
							},
							onHide: () => {
								state.reset();
								document.body.classList.remove('no-scroll'); // Allow background scrolling
								document.removeEventListener(
									'mousedown',
									this.handleOutsideClick
								);
							},
						});
					}
				});

				return buttonView;
			});
		}
	}

	createLookupFormView(): LookupFormView {
		const formView = new LookupFormView(this.editor.locale, this.editor);
		return formView;
	}
}
