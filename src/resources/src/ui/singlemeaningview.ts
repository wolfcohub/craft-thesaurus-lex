import { Locale } from 'ckeditor5';
import { View, ViewCollection } from 'ckeditor5/src/ui.js';
import {
	getAudioUrlForPronunciation,
	Meaning,
	MerriamWebsterResult,
} from '../utils.js';
import { DictionaryTypes } from '../DictionaryTypes.js';

export default class SingleMeaningView extends View {
	constructor(locale: Locale, result: DictionaryTypes.DictionaryResult) {
		super(locale);

		const { def, hwi, shortdef: shortDefinitions, quotes, meta } = result;
		const { sseq: senseSequences } = def[0];
		const { prs: pronunciations } = hwi;
		const { id: headword } = meta;
		console.log(`quotes: `, quotes);

		const topLevelBlocks = this.createCollection();

		topLevelBlocks.add(
			this.createPronunciationsBlock(pronunciations, locale),
		);

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

	createPronunciationsBlock(
		pronunciations: DictionaryTypes.Pronunciation[] | undefined,
		locale: Locale,
	): View {
		const pronunciationBlocks = this.createCollection();
		let delimiter = '';

		if (pronunciations) {
			for (const pronunciation of pronunciations) {
				if (pronunciation.pun) {
					delimiter = ` ${pronunciation.pun} `;
				}
			}
			pronunciations.forEach(
				(
					pronunciation: DictionaryTypes.Pronunciation,
					index: number,
				) => {
					if (index > 0) {
						// insert delimiter between pronunciations
						const delimiterView = new View(locale);
						delimiterView.setTemplate({
							tag: 'p',
							children: [delimiter],
						});
						pronunciationBlocks.add(delimiterView);
					}
					const {
						mw: writtenPronunciation,
						l: preText,
						l2: postText,
					} = pronunciation;

					if (preText) {
						// append preText value to pronunciation, if defined
						const preTextBlock = new View(locale);
						preTextBlock.setTemplate({
							tag: 'p',
							attributes: {
								class: ['ck', 'ck-pretext'],
							},
							children: [`${preText} `],
						});
						pronunciationBlocks.add(preTextBlock);
					}

					const pronunciationBlock = new View(locale);
					pronunciationBlock.setTemplate({
						tag: 'span',
						attributes: {
							class: ['ck', 'ck-phonetic'],
						},
						children: [writtenPronunciation],
					});
					pronunciationBlocks.add(pronunciationBlock);

					if (postText) {
						// append postText value to pronunciation, if defined
						const postTextBlock = new View(locale);
						postTextBlock.setTemplate({
							tag: 'p',
							attributes: {
								class: ['ck', 'ck-posttext'],
							},
							children: [` ${postText}`],
						});
						pronunciationBlocks.add(postTextBlock);
					}
				},
			);
		}
		const pronunciationsContainer = new View(locale);
		pronunciationsContainer.setTemplate({
			tag: 'div',
			attributes: {
				class: ['ck', 'ck-prs-container'],
			},
			children: pronunciationBlocks,
		});
		return pronunciationsContainer;
	}

	createShortDefinitionsBlock(
		shortDefinitions: string[],
		locale: Locale,
	): View {
		const shortDefinitionBlocks = this.createCollection();

		shortDefinitions.forEach((shortDef, index) => {
			const defBlock = new View(locale);
			defBlock.setTemplate({
				tag: 'li',
				attributes: {
					class: ['ck', 'ck-definition'],
				},
				children: [`${index + 1}. ${shortDef}`],
			});
			shortDefinitionBlocks.add(defBlock);
		});
		const shortDefinitionsContainer = new View(locale);
		shortDefinitionsContainer.setTemplate({
			tag: 'div',
			children: shortDefinitionBlocks,
		});
		return shortDefinitionsContainer;
	}

	createDefiningTextBlock(definingText: string, locale: Locale): View {
		const definitionBlock = new View(locale);
		definitionBlock.setTemplate({
			tag: 'p',
			attributes: {
				class: ['ck', 'ck-definition'],
			},
			children: [definingText],
		});
		return definitionBlock;
	}

	createVerbalIllustrationBlock(
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
				children: [t],
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
		locale: Locale,
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
				dtCollection.add(
					this.createDefiningTextBlock(definingText[1], locale),
				);
			} else if (definingText[0] === 'vis') {
				dtCollection.add(
					this.createVerbalIllustrationBlock(definingText[1], locale),
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

	createSenseBlock(sense: DictionaryTypes.Sense, locale: Locale): View {
		const { sn: senseNumber, dt, et, sdsense: dividedSense } = sense[1];
		console.log(`senseNumber: ${senseNumber}`);

		const senseCollection = this.createCollection();

		if (senseNumber) {
			// sense number block
			const senseNumberBlock = new View(locale);
			senseNumberBlock.setTemplate({
				tag: 'div',
				attributes: {
					class: ['ck', 'ck-sense-number'],
				},
				children: [senseNumber],
			});

			// indented block
			const indentBlock = new View(locale);
			indentBlock.setTemplate({
				tag: 'div',
				attributes: {
					class: ['ck', 'ck-sense-indent'],
				},
				children: [],
			});
			const sensePrefixBlock = new View(locale);
			sensePrefixBlock.setTemplate({
				tag: 'div',
				attributes: {
					class: ['ck', 'ck-sense-prefix'],
				},
				children: [senseNumberBlock, indentBlock],
			});
			senseCollection.add(sensePrefixBlock);
		}

		const senseContentRows = this.createCollection();

		dt.forEach((definingText) => {
			if (definingText[0] === 'text') {
				// add Defining Text (dt) row
				const definingTextRow = new View(locale);
				definingTextRow.setTemplate({
					tag: 'div',
					attributes: {
						class: ['ck', 'ck-sense-content-row'],
					},
					children: [
						this.createDefiningTextBlock(definingText[1], locale),
					],
				});
				senseContentRows.add(definingTextRow);
			} else if (definingText[0] === 'vis') {
				// add Verbal Illustration (vis) row
				const verbalIllustrationRow = new View(locale);
				verbalIllustrationRow.setTemplate({
					tag: 'div',
					attributes: {
						class: ['ck', 'ck-sense-content-row'],
					},
					children: [
						this.createVerbalIllustrationBlock(
							definingText[1],
							locale,
						),
					],
				});
				senseContentRows.add(verbalIllustrationRow);
			}
		});

		if (dividedSense) {
			const dividedSenseRow = new View(locale);
			dividedSenseRow.setTemplate({
				tag: 'div',
				attributes: {
					class: ['ck', 'ck-sense-content-row'],
				},
				children: [this.createDividedSenseBlock(dividedSense, locale)],
			});
			senseContentRows.add(dividedSenseRow);
		}

		const senseContentContainer = new View(locale);
		senseContentContainer.setTemplate({
			tag: 'div',
			attributes: {
				class: ['ck', 'ck-sense-content'],
			},
			children: senseContentRows,
		});
		senseCollection.add(senseContentContainer);

		const senseContainer = new View(locale);
		senseContainer.setTemplate({
			tag: 'div',
			attributes: {
				class: ['ck', 'ck-sense'],
			},
			children: senseCollection,
		});

		return senseContainer;
	}

	createSenseSequenceBlock(
		senseSequence: DictionaryTypes.SenseSequence,
		locale: Locale,
	): View {
		// console.log(`createSenseSequenceBlock input: `, senseSequence);
		const sceneSequenceCollection = this.createCollection();

		senseSequence.forEach((sense, index) => {
			// console.log(`sense: ${index}`);
			const senseBlock = this.createSenseBlock(sense, locale);
			sceneSequenceCollection.add(senseBlock);
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

	createAttributionBlock(
		aq: DictionaryTypes.AttributionQuote,
		locale: Locale,
	): View {
		const { auth, source, aqdate, subsource } = aq;

		const attributionStrings: Array<string|View> = [];

		// format quote attribution by what values are defined
		if (auth) {
			attributionStrings.push(auth);
		}
		if (source) {
			attributionStrings.push(
				`${attributionStrings.length ? ', ' : ''}${source}`,
			);
		}
		if (aqdate) {
			attributionStrings.push(
				`${attributionStrings.length ? ', ' : ''}${aqdate}`,
			);
		}
		if (subsource) {
			const { source: innerSource, aqdate: innerAqdate } = subsource;

			if (innerSource) {
				attributionStrings.push(
					`${attributionStrings.length ? ', ' : ''}${innerSource}`,
				);
			}
			if (innerAqdate) {
				attributionStrings.push(
					`${attributionStrings.length ? ', ' : ''}${innerAqdate}`,
				);
			}
		}
		if (attributionStrings.length) {
			// prepend attribution string with an emdash
			attributionStrings.unshift('—');
		}
		const quoteAttributionBlock = new View(locale);
		quoteAttributionBlock.setTemplate({
			tag: 'div',
			attributes: {
				class: ['ck', 'ck-quote-attribution'],
			},
			children: attributionStrings,
		});
		return quoteAttributionBlock;
	}

	createSingleQuoteBlock(quote: DictionaryTypes.Quote, locale: Locale): View {
		const { t, aq } = quote;

		const quoteBlocks = this.createCollection();

		const quoteContentBlock = new View(locale);
		quoteContentBlock.setTemplate({
			tag: 'div',
			attributes: {
				class: ['ck', 'ck-quote-content'],
			},
			children: [t],
		});
		quoteBlocks.add(quoteContentBlock);

		if (aq) {
			const attributionBlock = this.createAttributionBlock(aq, locale);
			quoteBlocks.add(attributionBlock);
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
