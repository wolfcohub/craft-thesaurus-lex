import { Plugin } from 'ckeditor5/src/core.js';
import { ButtonView, Dialog, Notification, View } from 'ckeditor5/src/ui.js';
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

		// instantiate modal
		this.modal = new Dialog(editor);

		// define the handler to close modal on outside click
		this.handleOutsideClick = (event: MouseEvent) => {
			const modalContainer = document.querySelector('.ck-dialog');
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
			// add the ThesaurusLex button (which opens modal) to CKEditor toolbar
			editor.ui.componentFactory.add('thesaurusLexButton', () => {
				const plugin = editor.plugins.get(
					'LookupEditing',
				) as LookupEditing;
				const state = plugin.state;

				const buttonView = new ButtonView(editor.locale);

				buttonView.set({
					label: t('Dictionary'),
					icon: lexIcon,
					tooltip: true,
				});

				// handle ThesaurusLex button click
				this.listenTo(buttonView, 'execute', () => {
					const selection = editor.model.document.selection;
					if (selection.rangeCount === 1) {
						const range = selection.getFirstRange();
						const word = rangeToText(range);

						if (isSingleWord(word)) {
							// if a single word is selected, set it in the state
							state.wordToLookup = word;
						}
					}

					// instantiate word lookup form
					const formView = new LookupFormView(editor.locale, editor);
					formView.input.fieldView.set({
						value: state?.wordToLookup,
					});
					// the following form props should reflect their respective state values
					// - isFetching
					// - isSuccess
					// - dictionaryResults
					// - thesaurusResults
					// - spellingSuggestions
					formView.bind('isFetching').to(state, 'isFetching');
					formView.bind('isSuccess').to(state, 'isSuccess');
					formView
						.bind('dictionaryResults')
						.to(state, 'dictionaryResults');
					formView
						.bind('thesaurusResults')
						.to(state, 'thesaurusResults');
					formView
						.bind('spellingSuggestions')
						.to(state, 'spellingSuggestions');

					// listen to state for change in errorMessage
					// display in modal if non-empty
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

					// hide modal on form 'cancel' event
					formView.on('cancel', () => {
						this.modal.hide();
					});

					// trigger lookup command on form submit
					this.listenTo(formView, 'submit', () => {
						editor.execute(LOOKUP, formView.inputText);
					});

					const logoPrefix = new View(editor.locale);
					logoPrefix.setTemplate({
						tag: 'span',
						attributes: {
							class: ['ck', 'ck-logo-prefix'],
						},
						children: ['Powered by'],
					});
					const logoBlock = new View(editor.locale);
					logoBlock.setTemplate({
						tag: 'span',
						attributes: {
							class: ['ck', 'ck-logo'],
						},
					});
					const logoContainer = new View(editor.locale);
					logoContainer.setTemplate({
						tag: 'div',
						attributes: {
							class: ['ck', 'ck-logo-container'],
						},
						children: [logoPrefix, logoBlock],
					});

					const formContainer = new View(editor.locale);
					formContainer.setTemplate({
						tag: 'div',
						attributes: {
							class: ['ck', 'ck-form-container'],
						},
						children: [formView, logoContainer],
					});

					// with all event listeners hooked up, now show the modal
					this.modal.show({
						isModal: true,
						id: 'dictionaryLookup',
						title: 'Thesaurus Lex',
						className: 'ck-thesaurus-lex-modal',
						content: formContainer,
						onShow: () => {
							if (state.wordToLookup) {
								// trigger lookup automatically if word to lookup is set in state
								editor.execute(LOOKUP, state.wordToLookup);
							}
							// prevent background scrolling while modal is open
							document.body.classList.add('no-scroll');
							// hook up mousedown event to our outside click handler
							document.addEventListener(
								'mousedown',
								this.handleOutsideClick,
							);
						},
						onHide: () => {
							// clear state (avoid duplicate API calls)
							state.reset();
							// with modal closed, re-enable background scrolling
							document.body.classList.remove('no-scroll');
							document.removeEventListener(
								'mousedown',
								this.handleOutsideClick,
							);
						},
					});
				});

				return buttonView;
			});
		}
	}
}
