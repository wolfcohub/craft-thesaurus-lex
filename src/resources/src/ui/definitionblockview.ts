import { View, ViewCollection } from 'ckeditor5/src/ui.js';
import { type Locale } from 'ckeditor5/src/utils.js';

export default class DefinitionBlockView extends View {
  /**
     * A collection of child views.
     */
  children: ViewCollection;

  constructor(locale: Locale, word: string, definitions: Array<string>) {
    super(locale);
    const t = locale.t;
    console.log("definitions: ", definitions);

    this.children = this.createCollection();
    const wordView = new View(locale);
    wordView.setTemplate({
      tag: 'strong',
      children: [
        word
      ]
    });
    const definitionView = new View(locale);
    definitionView.setTemplate({
      tag: 'div',
      children: definitions
    });
    this.children.addMany([
      wordView,
      definitionView
    ]);
    this.setTemplate({
      tag: 'div',
      attributes: {
        style: {
          padding: 'var(--ck-spacing-large)',
        },
        tabindex: -1
      },
      children: this.children
    })
  }
}
