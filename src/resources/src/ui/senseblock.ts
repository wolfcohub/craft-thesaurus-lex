import { Locale } from 'ckeditor5';
import { Editor } from 'ckeditor5/src/core.js';
import { View } from 'ckeditor5/src/ui.js';
import { DictionaryTypes } from '../DictionaryTypes.js';
import { stringToViewCollection } from '../utils.js';

export default class SenseBlock extends View {
    private editor: Editor;

    constructor(editor: Editor, data: [string, DictionaryTypes.TestSense]) {
        super(editor.locale);
        this.editor = editor;

        const [type, content] = data;
        const senseCollection = this.createCollection();

        switch (type) {
            case 'sense':
                this.handleSense(editor.locale, content, senseCollection);
                break;
            case 'bs':
                this.handleBindingSubstitute(
                    editor.locale,
                    content,
                    senseCollection,
                );
                break;
            default:
                console.warn('Unhandled sense type:', type);
        }

        this.setTemplate({
            tag: 'div',
            attributes: { class: ['ck', 'ck-sense'] },
            children: senseCollection,
        });
    }
    private createUnorderedSenseBlock(
        unorderedSenses: Array<
            Array<
                | DictionaryTypes.DefiningText
                | DictionaryTypes.VerbalIllustration
            >
        >,
        locale: Locale,
    ): View {
        const unorderedCollection = this.createCollection();

        unorderedSenses.forEach((senseItems) => {
            const senseBlock = this.createCollection();

            senseItems.forEach(([type, value]) => {
                if (type === 'text') {
                    senseBlock.add(
                        this.createDefiningTextBlock(value as string, locale),
                    );
                } else if (type === 'vis') {
                    senseBlock.add(
                        this.createVerbalIllustrationBlock(
                            value as DictionaryTypes.VerbalIllustrationContent[],
                            locale,
                        ),
                    );
                }
            });

            const unorderedItemView = new View(locale);
            unorderedItemView.setTemplate({
                tag: 'li',
                attributes: { class: ['ck', 'ck-uns-item'] },
                children: senseBlock,
            });
            unorderedCollection.add(unorderedItemView);
        });

        const unorderedListView = new View(locale);
        unorderedListView.setTemplate({
            tag: 'ul',
            attributes: { class: ['ck', 'ck-uns-list'] },
            children: unorderedCollection,
        });

        return unorderedListView;
    }
    private handleSense(
        locale: Locale,
        content: DictionaryTypes.TestSense,
        collection: any,
    ) {
        const { sn, dt, sdsense, pseq } = content;

        // Ensure placeholder for missing `sn`
        const senseNumberView = new View(locale);
        senseNumberView.setTemplate({
            tag: 'span',
            attributes: {
                class: ['ck', 'ck-sense-number'],
            },
            children: [sn || '\u00A0'], // Use non-breaking space if `sn` is null
        });

        if (sn || dt) {
            const rowContainer = new View(locale);
            rowContainer.setTemplate({
                tag: 'div',
                attributes: { class: ['ck', 'ck-sense-row'] },
                children: [
                    senseNumberView, // Always add the sense number view
                    dt ? this.createDefiningTextCollection(dt, locale) : null,
                ].filter((child): child is View => child !== null),
            });
            collection.add(rowContainer);
        }

        if (sdsense) {
            collection.add(this.createDividedSenseBlock(sdsense, locale));
        }

        if (pseq) {
            pseq.forEach(([type, content]) => {
                if (type === 'sense') {
                    collection.add(
                        new SenseBlock(this.editor, ['sense', content]),
                    );
                }
                if (type === 'bs' && content.sense) {
                    collection.add(
                        new SenseBlock(this.editor, ['sense', content.sense]),
                    );
                }
            });
        }
    }
    private createDefiningTextCollection(
        definingTexts: Array<
            DictionaryTypes.DefiningText | DictionaryTypes.VerbalIllustration
        >,
        locale: Locale,
    ): View {
        const dtCollection = this.createCollection();

        definingTexts.forEach(([type, value]) => {
            if (type === 'text') {
                dtCollection.add(
                    this.createDefiningTextBlock(value as string, locale),
                );
            } else if (type === 'vis') {
                dtCollection.add(
                    this.createVerbalIllustrationBlock(
                        value as DictionaryTypes.VerbalIllustrationContent[],
                        locale,
                    ),
                );
            } else if (type === 'uns') {
                dtCollection.add(
                    this.createUnorderedSenseBlock(value as any, locale),
                );
            }
        });

        const dtContainer = new View(locale);
        dtContainer.setTemplate({
            tag: 'div',
            attributes: { class: ['ck', 'ck-dt-container'] },
            children: dtCollection,
        });
        return dtContainer;
    }
    private handleBindingSubstitute(
        locale: Locale,
        bindingSubstitute: DictionaryTypes.BindingSubstitute,
        collection: any,
    ) {
        const { dt, sense } = bindingSubstitute;

        if (dt) {
            dt.forEach(([type, value]) => {
                if (type === 'text') {
                    collection.add(this.createDefiningTextBlock(value, locale));
                } else if (type === 'vis') {
                    collection.add(
                        this.createVerbalIllustrationBlock(value, locale),
                    );
                }
            });
        }

        if (sense) {
            collection.add(new SenseBlock(this.editor, ['sense', sense]));
        }
    }
    private createVerbalIllustrationBlock(
        verbalIllustrationItems: DictionaryTypes.VerbalIllustrationContent[],
        locale: Locale,
    ): View {
        const visCollection = this.createCollection();
        verbalIllustrationItems.forEach((viContent) => {
            const { t, aq } = viContent;
            const visBlock = new View(locale);
            visBlock.setTemplate({
                tag: 'div',
                attributes: {
                    class: ['ck', 'ck-verbal-illustration'],
                },
                children: stringToViewCollection(t, this.editor),
            });
            visCollection.add(visBlock);
        });

        const visContainer = new View(locale);
        visContainer.setTemplate({
            tag: 'div',
            attributes: {
                class: ['ck', 'ck-vis-container'],
            },
            children: visCollection,
        });
        return visContainer;
    }

    private createDefiningTextBlock(
        definingText: string,
        locale: Locale,
    ): View {
        const definitionBlock = new View(locale);
        definitionBlock.setTemplate({
            tag: 'p',
            attributes: {
                class: ['ck', 'ck-definition'],
            },
            children: stringToViewCollection(definingText, this.editor),
        });
        return definitionBlock;
    }
    private createDividedSenseBlock(
        dividedSense: DictionaryTypes.DividedSense,
        locale: Locale,
    ): View {
        const { sd: senseDivider, dt } = dividedSense;

        // Create the sense number placeholder
        const senseNumberView = new View(locale);
        senseNumberView.setTemplate({
            tag: 'span',
            attributes: {
                class: 'ck ck-sense-number',
            },
            children: ['\u00A0'], // Non-breaking space placeholder for alignment
        });

        // Create the sense divider view
        const senseDividerView = new View(locale);
        senseDividerView.setTemplate({
            tag: 'span',
            attributes: {
                class: 'ck ck-sense-divider',
            },
            children: [senseDivider || '\u00A0'], // Non-breaking space if no divider
        });

        // Create the defining text collection
        const dtCollection = this.createCollection();

        // Add the sense divider to the defining text collection as the first child
        dtCollection.add(senseDividerView);

        if (dt) {
            dt.forEach((definingText) => {
                if (
                    definingText &&
                    definingText[0] === 'text' &&
                    definingText[1]
                ) {
                    dtCollection.add(
                        this.createDefiningTextBlock(definingText[1], locale),
                    );
                } else if (definingText[0] === 'vis') {
                    dtCollection.add(
                        this.createVerbalIllustrationBlock(
                            definingText[1],
                            locale,
                        ),
                    );
                } else {
                    console.warn(
                        'Unhandled definingText or undefined content:',
                        definingText,
                    );
                }
            });
        }

        // Wrap the defining text collection in a container
        const dtContainer = new View(locale);
        dtContainer.setTemplate({
            tag: 'div',
            attributes: { class: 'ck ck-dt-container' },
            children: dtCollection,
        });

        // Create the container that combines the placeholder and dtContainer
        const senseDividerContainer = new View(locale);
        senseDividerContainer.setTemplate({
            tag: 'div',
            attributes: { class: 'ck ck-sdsense-container' },
            children: [senseNumberView, dtContainer],
        });

        return senseDividerContainer;
    }
}
