import { View, ButtonView, LabeledFieldView, createLabeledInputText, submitHandler, InputView, SplitButtonView, ToolbarSeparatorView, SpinnerView, ViewCollection } from 'ckeditor5/src/ui.js';
import { type Locale } from 'ckeditor5/src/utils.js';
import { LOOKUP, LookupResult, MerriamWebsterResult } from '../utils.js';
import LookupState from '../lookupstate.js';
import DictionaryThesaurusSelectorView from './dictionarythesaurusselectorview.js';


export default class LookupFormView extends View {

  contentBlocks!: ViewCollection;

  input!: LabeledFieldView<InputView>;

  inputView!: View;

  loadingView!: View;

  errorView!: View;

  isFetching!: boolean;

  isSuccess!: boolean;

  isError!: boolean;

  results!: MerriamWebsterResult[];

  errorMessage!: string | null;


  constructor(locale: Locale) {
    super(locale);

    this.contentBlocks = this.createCollection();
    
    const inputForm = this.createInputForm(locale);
    this.contentBlocks.add(inputForm);

    this.listenTo(this, 'change:results', (evt, name, results) => {
      if (results.length > 0) {
        const resultView = new DictionaryThesaurusSelectorView(locale, results);
        resultView.set({ viewUid: 'result' });
        this.contentBlocks.clear();
        this.contentBlocks.add(resultView);
      }
    });

    // this.listenTo(this, 'change:isFetching', (evt, name, isFetching) => {
    //   if (isFetching && !this.contentBlocks.has('loader')) {
    //     this.contentBlocks.add(this.loadingView);
    //   }
    // });

    // listen for change to isError


    this.setTemplate({
      tag: 'div',
      attributes: {
          class: 'ck',
          tabindex: '-1',
      },
      children: this.contentBlocks
    });
  }

  override render() {
    super.render();
    submitHandler( {
      view: this
  } );
  }

  get inputText() {
    return this.input.fieldView.element?.value ?? '';
  }

  createInputForm(locale: Locale): View {
    const t = locale.t;
    const bind = this.bindTemplate;

    this.input = new LabeledFieldView(this.locale, createLabeledInputText);
    this.input.label = t('Lookup word…');
    this.input.class = 'ck-lookup-form__inputs';

    const lookupButton = new ButtonView(locale);
    lookupButton.set({
        label: t('Get Definition'),
        class: 'ck-button-action',
        withText: true,
        tooltip: true,
    });
    lookupButton.type = 'submit';
    
    const cancelButton = new ButtonView(locale);
    cancelButton.set({
      label: t('Cancel'),
      withText: true,
      tooltip: true,
    });
    cancelButton.delegate('execute').to(this, 'cancel');

    const spinner = new SpinnerView();
    spinner.set({ isVisible: true });

    this.loadingView = new View(locale);
    this.loadingView.set({ viewUid: 'loader' })
    this.loadingView.setTemplate({
      tag: 'div',
      attributes: {
        class: [
          'ck',
          'ck-loader',
          bind.if( 'isFetching', 'ck-hidden', value => !value )
        ],
      },
      children: [spinner]
    });

    const actionDiv = new View(locale);
    actionDiv.setTemplate({
        tag: 'div',
        attributes: {
            class: [
              'ck',
              'ck-lookup-form__actions',
            ]
        },
        children: [
            cancelButton,
            lookupButton,
        ]
    });

    const containerView = new View(locale);
    containerView.set({ viewUid: 'input' });
    containerView.setTemplate({
      tag: 'form',
      attributes: {
          class: [
              'ck',
              'ck-lookup-form',
              bind.if('isSuccess', 'ck-hidden'),
              // bind.if('isFetching', 'ck-hidden')
          ],
      },
      children: [
        this.loadingView,
        this.input,
        actionDiv,
      ]
    });
    return containerView;
  }

  createResultView(locale: Locale, result: LookupResult): View {
    const blocks = this.createCollection();

    const wordHeading = new View(locale);
    wordHeading.setTemplate({
      tag: 'div',
      attributes: {
        class: [
          'ck',
          'ck-word'
        ]
      },
      children: result !== null ? [result.word] : [],
    });
    const { meanings } = result;
    const { definitions } = meanings[0];
    const definitionView = new View(locale);
    const defBlocks = this.createCollection();
    definitions.forEach((def, index) => {
      const defBlock = new View(locale);
      defBlock.setTemplate({
        tag: 'li',
        attributes: {
          class: [
            'ck',
            'ck-definition'
          ]
        },
        children: [`${index + 1}. ${def.definition}`],
      });
      defBlocks.add(defBlock);
    })

    definitionView.setTemplate({
      tag: 'ul',
      attributes: {
        class: [
          'ck',
          'ck-definitions'
        ]
      },
      children: defBlocks
    });

    blocks.addMany([
      wordHeading,
      definitionView
    ]);

    const resultView = new View();
    resultView.setTemplate({
      tag: 'div',
      attributes: {
        class: [
          'ck',
          'ck-result-form'
        ],
        tabindex: -1
      },
      children: blocks
    });
    return resultView;
  }
}
