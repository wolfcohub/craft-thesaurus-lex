import { ButtonView, ToolbarSeparatorView, View, ViewCollection } from 'ckeditor5/src/ui.js';
import { type Locale } from 'ckeditor5/src/utils.js';
import { MerriamWebsterResult } from '../utils.js';
import ResultTabView from './resulttabview.js';
import SingleMeaningView from './singlemeaningview.js';

export default class DictionaryThesaurusSelectorView extends View {

  declare public selectedTab: "dictionary" | "thesaurus";

  constructor(locale: Locale, lookupResults: MerriamWebsterResult[]) {
    super(locale);
    const t = locale.t;
    const bind = this.bindTemplate;
    if (lookupResults.length === 0) {
      throw new Error("No results to display");
    }
    const word = lookupResults[0].word;

    this.set('selectedTab', 'dictionary');

    const dictionarySelectButton = new ButtonView(locale);
    dictionarySelectButton.set({
      label: t('Dictionary'),
      withText: true,
      tooltip: true
    });
    dictionarySelectButton.bind('class')
      .to(this, 'selectedTab', value => value === 'dictionary' ?
        'ck ck-tab ck-dictionary-select ck-selected'
        : 'ck ck-tab ck-dictionary-select')
    this.listenTo(dictionarySelectButton, 'execute', () => {
      this.set('selectedTab', 'dictionary');
    });

    const thesaurusSelectButton = new ButtonView(locale);
    thesaurusSelectButton.set({
      label: t('Thesaurus'),
      withText: true,
      tooltip: true
    });
    thesaurusSelectButton.bind('class')
    .to(this, 'selectedTab', value => value === 'thesaurus' ?
      'ck ck-tab ck-thesaurus-select ck-selected'
      : 'ck ck-tab ck-thesaurus-select');
    this.listenTo(thesaurusSelectButton, 'execute', () => {
      this.set('selectedTab', 'thesaurus');
    });

    const tabSelectDiv = new View(locale);
    tabSelectDiv.setTemplate({
      tag: 'div',
      attributes: {
          class: ['ck', 'ck-tab-selector']
      },
      children: [
        dictionarySelectButton,
        new ToolbarSeparatorView(),
        thesaurusSelectButton
      ]
    });

    const wordHeading = new View(locale);
    wordHeading.setTemplate({
      tag: 'div',
      attributes: {
        class: [
          'ck',
          'ck-word'
        ]
      },
      children: [word]
    });
    

    const dictionaryContainer = new View(locale);
    const dictionaryContent = (lookupResults.length === 1) ? 
      new SingleMeaningView(locale, lookupResults[0]) : 
      new ResultTabView(locale, lookupResults);
    dictionaryContainer.setTemplate({
      tag: 'div',
      attributes: {
        class: [
          'ck',
          'ck-scrollable-results',
          bind.if('selectedTab', 'ck-hidden', (value) => value !== 'dictionary')
        ]
      },
      children: [
        wordHeading,
        dictionaryContent
      ]
    });

    const thesaurusContainer = new View(locale);
    thesaurusContainer.setTemplate({
      tag: 'div',
      attributes: {
        class: [
          'ck',
          bind.if('selectedTab', 'ck-hidden', (value) => value !== 'thesaurus')
        ]
      },
      children: ['no content yet']
    });

    this.setTemplate({
      tag: 'div',
      attributes: {
        class: [
          'ck',
          'ck-result-form'
        ],
        tabindex: -1
      },
      children: [
        tabSelectDiv,
        dictionaryContainer,
        thesaurusContainer
      ]
    });
  }
}
