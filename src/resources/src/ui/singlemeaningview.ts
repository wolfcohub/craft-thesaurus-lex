import { Locale } from 'ckeditor5';
import { View } from 'ckeditor5/src/ui.js';
import { Meaning, MerriamWebsterResult } from '../utils.js';

export default class SingleMeaningView extends View {
  constructor(locale: Locale, result: MerriamWebsterResult) {
    super(locale);

    const definitionBlocks = this.createCollection();
    const phoneticBlocks = this.createCollection();
    
    const { pronunciations, definitions } = result;

    pronunciations.forEach((prs) => {
      const phoneticBlock = new View(locale);
      phoneticBlock.setTemplate({
        tag: 'span',
        attributes: {
          class: [
            'ck',
            'ck-phonetic'
          ]
        },
        children: [`${prs.preText} ${prs.text} ${prs.postText}`],
      });
      phoneticBlocks.add(phoneticBlock);
    });

    const pronunciationsContainer = new View(locale);
    pronunciationsContainer.setTemplate({
      tag: 'div',
      children: phoneticBlocks
    });
    
    definitions.forEach((definition, index) => {
      const defBlock = new View(locale);
      defBlock.setTemplate({
        tag: 'li',
        attributes: {
          class: [
            'ck',
            'ck-definition'
          ]
        },
        children: [`${index + 1}. ${definition}`],
      });
      definitionBlocks.add(defBlock);
    });

    const definitionsContainer = new View(locale);
    definitionsContainer.setTemplate({
      tag: 'div',
      children: definitionBlocks,
    });

    this.setTemplate({
      tag: 'ul',
      attributes: {
        class: [
          'ck',
          'ck-definitions'
        ]
      },
      children: [pronunciationsContainer, definitionsContainer]
    });
  }
}
