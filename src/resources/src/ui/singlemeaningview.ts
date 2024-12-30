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
		console.log('🚀 ~ SingleMeaningView ~ constructor ~ result:', result);
		super(locale);

		const {
			def,
			hwi,
			shortdef: shortDefinitions,
			quotes,
			meta,
			cxs,
			fl,
		} = result;
		const { sseq: senseSequences, vd: verbDivider } = def[0];
		const { prs: pronunciations } = hwi;
		const { id: headword } = meta;
		const word = removeAsterisks(hwi.hw);
		const functionalLabel = fl;
		const topLevelBlocks = this.createCollection();

		if (word && functionalLabel) {
			topLevelBlocks.add(new WordDetailBlock(locale, word, functionalLabel));
		}
		if (pronunciations) {
			topLevelBlocks.add(new PronunciationsBlock(locale, pronunciations));
		}
		if (verbDivider) {
			topLevelBlocks.add(this.createVerbDividerBlock(locale, verbDivider));
		}
		const senseSequenceBlockCollection = this.createCollection();

		if (senseSequences.length) {
			senseSequences.forEach((senseSequence, index) => {
				const senseSequenceBlock = this.createSenseSequenceBlock(
					senseSequence,
					locale
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
			const quotesBlock = this.createQuotesBlock(headword, quotes, locale);
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

	createDefiningTextBlock(definingText: string, locale: Locale): View {
		const definitionBlock = new View(locale);
		definitionBlock.setTemplate({
			tag: 'p',
			attributes: {
				class: ['ck', 'ck-definition'],
			},
			children: stringToViewCollection(definingText, locale),
		});
		return definitionBlock;
	}

	createVerbalIllustrationBlock(
		verbalIllustrationItems: DictionaryTypes.VerbalIllustrationContent[],
		locale: Locale
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
				children: stringToViewCollection(t, locale),
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

	createDividedSenseBlock(
		dividedSense: DictionaryTypes.DividedSense,
		locale: Locale
	): View {
		const { sd: senseDivider, dt } = dividedSense;

		const senseDividerBlock = new View(locale);
		senseDividerBlock.setTemplate({
			tag: 'span',
			attributes: {
				class: ['ck', 'ck-sense-divider'],
			},
			children: [senseDivider],
		});

		const dtCollection = this.createCollection();
		dt.forEach((definingText) => {
			if (definingText[0] === 'text') {
				const definingTextContainer = new View(locale);
				definingTextContainer.setTemplate({
					tag: 'div',
					attributes: {
						class: ['ck', 'ck-definition'],
					},
				});
				const definingTextBlock = new View(locale);
				definingTextBlock.setTemplate({
					tag: 'p',
					attributes: {
						class: ['ck', 'ck-definition'],
					},
					children: [],
				});
				dtCollection.add(this.createDefiningTextBlock(definingText[1], locale));
			} else if (definingText[0] === 'vis') {
				dtCollection.add(
					this.createVerbalIllustrationBlock(definingText[1], locale)
				);
			}
		});
		const dtContainer = new View(locale);
		dtContainer.setTemplate({
			tag: 'div',
			attributes: {
				class: ['ck', 'ck-dt-container'],
			},
			children: dtCollection,
		});

		const senseDividerContainer = new View(locale);
		senseDividerContainer.setTemplate({
			tag: 'div',
			attributes: {
				class: ['ck', 'ck-sdsense-container'],
			},
			children: [senseDividerBlock, dtContainer],
		});

		return senseDividerContainer;
	}

	createSenseSequenceBlock(
		senseSequence: DictionaryTypes.SenseSequence,
		locale: Locale
	): View {
		// console.log(`createSenseSequenceBlock input: `, senseSequence);
		const sceneSequenceCollection = this.createCollection();

		senseSequence.forEach((sense, index) => {
			// console.log(`sense: ${index}`);
			sceneSequenceCollection.add(new SenseBlock(locale, sense));
		});

		const senseSequenceBlock = new View(locale);
		senseSequenceBlock.setTemplate({
			tag: 'div',
			attributes: {
				class: ['ck', 'ck-sense-sequence'],
			},
			children: sceneSequenceCollection,
		});
		return senseSequenceBlock;
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
		locale: Locale
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
