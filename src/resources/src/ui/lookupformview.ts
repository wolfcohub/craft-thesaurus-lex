import {
	View,
	ButtonView,
	LabeledFieldView,
	createLabeledInputText,
	submitHandler,
	InputView,
	SpinnerView,
	ViewCollection,
} from 'ckeditor5/src/ui.js';
import { type Locale } from 'ckeditor5/src/utils.js';
import { DictionaryTypes } from '../DictionaryTypes.js';
import DictionaryThesaurusSelectorView from './dictionarythesaurusselectorview.js';
import { ThesaurusTypes } from '../ThesaurusTypes.js';

export default class LookupFormView extends View {
	contentBlocks!: ViewCollection;

	input!: LabeledFieldView<InputView>;

	inputView!: View;

	loadingView!: View;

	isFetching!: boolean;

	isSuccess!: boolean;

	isError!: boolean;

	dictionaryResults!: DictionaryTypes.DictionaryResult[];
	thesaurusResults!: ThesaurusTypes.ThesaurusResult[];

	errorMessage!: string | null;

	constructor(locale: Locale, editor: any) {
		super(locale);

		// instantiate the container for all content blocks in this view
		this.contentBlocks = this.createCollection();

		const inputForm = this.createInputForm(locale);
		this.contentBlocks.add(inputForm);

		this.listenTo(
			this,
			'change:dictionaryResults',
			(evt, name, dictionaryResults) => {
				// dictionaryResults changed. add them to the UI
				if (dictionaryResults.length > 0) {
					const resultView = new DictionaryThesaurusSelectorView(
						locale,
						editor,
						dictionaryResults,
						this.thesaurusResults || [],
					);
					resultView.set({ viewUid: 'result' });
					this.contentBlocks.clear();
					this.contentBlocks.add(resultView);
				}
			},
		);

		this.listenTo(
			this,
			'change:thesaurusResults',
			(evt, name, thesaurusResults) => {
				// thesaurusResults changed. add them to the UI
				if (thesaurusResults.length > 0) {
					const resultView = new DictionaryThesaurusSelectorView(
						locale,
						editor,
						this.dictionaryResults || [],
						thesaurusResults,
					);
					resultView.set({ viewUid: 'result' });
					this.contentBlocks.clear();
					this.contentBlocks.add(resultView);
				}
			},
		);

		// return all content blocks wrapped in a single view
		this.setTemplate({
			tag: 'div',
			attributes: {
				class: 'ck',
				tabindex: '-1',
			},
			children: this.contentBlocks,
		});
	}

	// delegate handling of form submit to this view component
	// (stop event from bubbling up to browser)
	override render() {
		super.render();
		submitHandler({
			view: this,
		});
	}

	// helper function to get current value of form input
	get inputText() {
		return this.input.fieldView.element?.value ?? '';
	}

	createInputForm(locale: Locale): View {
		const t = locale.t;
		const bind = this.bindTemplate;

		this.input = new LabeledFieldView(this.locale, createLabeledInputText);
		this.input.label = t('Lookup word…');
		this.input.class = 'ck-lookup-form__inputs';

		// button to submit form
		const lookupButton = new ButtonView(locale);
		lookupButton.set({
			label: t('Get Definition'),
			class: 'ck-button-action',
			withText: true,
			tooltip: true,
		});
		lookupButton.type = 'submit';

		// button to trigger 'cancel' event (close form)
		const cancelButton = new ButtonView(locale);
		cancelButton.set({
			label: t('Cancel'),
			withText: true,
			tooltip: true,
		});
		cancelButton.delegate('execute').to(this, 'cancel');

		// instantiate spinner for loading state
		const spinner = new SpinnerView();
		spinner.set({ isVisible: true });

		this.loadingView = new View(locale);
		this.loadingView.set({ viewUid: 'loader' });
		this.loadingView.setTemplate({
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-loader',
					// show loader if isFetching is true
					bind.if('isFetching', 'ck-hidden', (value) => !value),
				],
			},
			children: [spinner],
		});

		const actionDiv = new View(locale);
		actionDiv.setTemplate({
			tag: 'div',
			attributes: {
				class: ['ck', 'ck-lookup-form__actions'],
			},
			children: [cancelButton, lookupButton],
		});

		// return input field and buttons wrapped in a single view
		const containerView = new View(locale);
		containerView.set({ viewUid: 'input' });
		containerView.setTemplate({
			tag: 'form',
			attributes: {
				class: [
					'ck',
					'ck-lookup-form',
					// hide loader if isSuccess is true
					bind.if('isSuccess', 'ck-hidden'),
				],
			},
			children: [this.loadingView, this.input, actionDiv],
		});
		return containerView;
	}
}
