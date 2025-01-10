import { Locale } from 'ckeditor5';
import { View } from 'ckeditor5/src/ui.js';
import { DictionaryTypes } from '../DictionaryTypes.js';
import PronunciationsBlock from './pronunciationsblock.js';
import SenseBlock from './senseblock.js';
import AttributionBlock from './attributionblock.js';
import { stringToViewCollection } from '../utils.js';
import { removeAsterisks } from './dictionarythesaurusselectorview.js';
import WordDetailBlock from './worddetailblock.js';

export default class SingleMeaningView extends View {
    constructor(locale: Locale, result: DictionaryTypes.DictionaryResult) {
        super(locale);

        const { def, hwi, quotes, meta, fl } = result;
        const { sseq: senseSequences, vd: verbDivider } = def[0];
        const { prs: pronunciations } = hwi;
        const { id: headword } = meta;
        const word = removeAsterisks(hwi.hw);
        const functionalLabel = fl;
        const topLevelBlocks = this.createCollection();

        if (word && functionalLabel) {
            topLevelBlocks.add(
                new WordDetailBlock(locale, word, functionalLabel),
            );
        }
        if (pronunciations) {
            topLevelBlocks.add(new PronunciationsBlock(locale, pronunciations));
        }
        if (verbDivider) {
            topLevelBlocks.add(
                this.createVerbDividerBlock(locale, verbDivider),
            );
        }
        const senseSequenceBlockCollection = this.createCollection();

        if (senseSequences.length) {
            senseSequences.forEach((senseSequence, index) => {
                const senseSequenceBlock = this.createSenseSequenceBlock(
                    senseSequence,
                    locale,
                );
                senseSequenceBlockCollection.add(senseSequenceBlock);
            });
        }

        const sequencesContainer = new View(locale);
        sequencesContainer.setTemplate({
            tag: 'div',
            attributes: {
                class: ['ck', 'ck-sense-sequence-container'],
            },
            children: senseSequenceBlockCollection,
        });
        topLevelBlocks.add(sequencesContainer);

        if (quotes) {
            const quotesBlock = this.createQuotesBlock(
                headword,
                quotes,
                locale,
            );
            topLevelBlocks.add(quotesBlock);
        }

        this.setTemplate({
            tag: 'ul',
            attributes: {
                class: ['ck', 'ck-definitions'],
            },
            children: topLevelBlocks,
        });
    }
    createVerbDividerBlock(locale: Locale, verbDivider: string): View {
        const verbDividerBlock = new View(locale);
        verbDividerBlock.setTemplate({
            tag: 'div',
            attributes: {
                class: ['ck', 'ck-verb-divider'],
            },
            children: [verbDivider], // Render `vd` text
        });
        return verbDividerBlock;
    }

    private transformSenseSequenceToPseq(
        senseSequence: DictionaryTypes.SenseSequence,
    ): DictionaryTypes.Pseq {
        return senseSequence
            .filter(([type]) => type === 'sense') // Only keep 'sense' types
            .map(([, content]) => ({
                sense: content as DictionaryTypes.Sense,
            }));
    }
    createSenseSequenceBlock(
        senseSequence: DictionaryTypes.SenseSequence,
        locale: Locale,
    ): View {
        const senseSequenceCollection = this.createCollection();

        senseSequence.forEach(([type, content]) => {
            if (type === 'sense') {
                // Handle sense entries
                senseSequenceCollection.add(
                    new SenseBlock(locale, ['sense', content]),
                );
            } else if (type === 'bs') {
                // Handle binding substitutes
                senseSequenceCollection.add(
                    new SenseBlock(locale, ['bs', content]),
                );
            } else if (type === 'pseq') {
                // Transform `pseq` into the correct format and create a block
                const transformedPseq = this.transformSenseSequenceToPseq(
                    content as DictionaryTypes.SenseSequence,
                );
                const nestedPseqBlock = this.createPseqBlock(
                    transformedPseq,
                    locale,
                );
                senseSequenceCollection.add(nestedPseqBlock);
            } else if (type === 'sen') {
                // Handle divided senses
                const senseGroupBlock = this.createSenseGroupBlock(
                    content as DictionaryTypes.SenseGroup,
                    locale,
                );
                senseSequenceCollection.add(senseGroupBlock);
            }
        });

        const senseSequenceContainer = new View(locale);
        senseSequenceContainer.setTemplate({
            tag: 'div',
            attributes: { class: ['ck', 'ck-sense-sequence'] },
            children: senseSequenceCollection,
        });

        return senseSequenceContainer;
    }
    private createSenseGroupBlock(
        senseGroup: DictionaryTypes.SenseGroup,
        locale: Locale,
    ): View {
        const { sn: senseNumber, sls: subjectLabels } = senseGroup;

        const groupCollection = this.createCollection();

        // Render the sense number
        if (senseNumber) {
            const senseNumberBlock = new View(locale);
            senseNumberBlock.setTemplate({
                tag: 'span',
                attributes: { class: ['ck', 'ck-sense-number'] },
                children: [senseNumber],
            });
            groupCollection.add(senseNumberBlock);
        }

        // Render the subject or status labels
        if (subjectLabels && subjectLabels.length > 0) {
            const labelsBlock = new View(locale);
            labelsBlock.setTemplate({
                tag: 'span',
                attributes: { class: ['ck', 'ck-subject-labels'] },
                children: subjectLabels.map((label) => label),
            });
            groupCollection.add(labelsBlock);
        }
        const groupContainer = new View(locale);
        groupContainer.setTemplate({
            tag: 'div',
            attributes: { class: ['ck', 'ck-sense-group'] },
            children: groupCollection,
        });

        return groupContainer;
    }
    private createPseqBlock(pseq: DictionaryTypes.Pseq, locale: Locale): View {
        const pseqCollection = this.createCollection();

        pseq.forEach(({ sense }) => {
            pseqCollection.add(new SenseBlock(locale, ['sense', sense]));
        });

        const pseqContainer = new View(locale);
        pseqContainer.setTemplate({
            tag: 'div',
            attributes: { class: ['ck', 'ck-pseq-container'] },
            children: pseqCollection,
        });

        return pseqContainer;
    }

    createSingleQuoteBlock(quote: DictionaryTypes.Quote, locale: Locale): View {
        const { t, aq } = quote;

        const quoteBlocks = this.createCollection();

        const quoteCollection = stringToViewCollection(t, locale);

        const quoteContentBlock = new View(locale);
        quoteContentBlock.setTemplate({
            tag: 'div',
            attributes: {
                class: ['ck', 'ck-quote-content'],
            },
            children: quoteCollection,
        });
        quoteBlocks.add(quoteContentBlock);

        if (aq) {
            quoteBlocks.add(new AttributionBlock(locale, aq));
        }

        const quoteContainer = new View(locale);
        quoteContainer.setTemplate({
            tag: 'div',
            attributes: {
                class: ['ck', 'ck-quote'],
            },
            children: quoteBlocks,
        });
        return quoteContainer;
    }

    createQuotesBlock(
        headword: string,
        quotes: DictionaryTypes.Quote[],
        locale: Locale,
    ): View {
        const headwordSpan = new View(locale);
        headwordSpan.setTemplate({
            tag: 'span',
            children: [headword],
        });

        const headerTitle = new View(locale);
        headerTitle.setTemplate({
            tag: 'p',
            children: ['Examples of ', headwordSpan, ' in a sentence:'],
        });

        const quotesBlockHeader = new View(locale);
        quotesBlockHeader.setTemplate({
            tag: 'div',
            attributes: {
                class: ['ck', 'ck-quotes-header'],
            },
            children: [headerTitle],
        });

        const quotesCollection = this.createCollection();
        quotes.forEach((quote) => {
            quotesCollection.add(this.createSingleQuoteBlock(quote, locale));
        });

        const quotesBody = new View(locale);
        quotesBody.setTemplate({
            tag: 'div',
            attributes: {
                class: ['ck', 'ck-quotes-body'],
            },
            children: quotesCollection,
        });

        const quotesBlock = new View(locale);
        quotesBlock.setTemplate({
            tag: 'div',
            attributes: {
                class: ['ck', 'ck-quotes-block'],
            },
            children: [quotesBlockHeader, quotesBody],
        });
        return quotesBlock;
    }
}
