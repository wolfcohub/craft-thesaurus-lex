import { Locale } from 'ckeditor5';
import { View, ViewCollection } from 'ckeditor5/src/ui.js';
import {
	getAudioUrlForPronunciation,
	Meaning,
	MerriamWebsterResult,
} from '../utils.js';
import { DictionaryTypes } from '../../../DictionaryTypes.js';

export default class SingleMeaningView extends View {
	constructor(locale: Locale, result: DictionaryTypes.DictionaryResult) {
		super(locale);

		const { def, hwi, shortdef: shortDefinitions } = result;
		const { sseq: senseSequences } = def[0];
		const { prs: pronunciations } = hwi;

		const pronunciationsContainer = this.createPronunciationsBlock(
			pronunciations,
			locale,
		);

		const senseSequenceBlockCollection = this.createCollection();

		if (senseSequences.length) {
			senseSequences.forEach((senseSequence, index) => {
				console.log(`sense sequence: ${index}`);
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
				class: ['ck'],
			},
			children: senseSequenceBlockCollection,
		});

		const definitionsContainer = this.createShortDefinitionsBlock(
			shortDefinitions,
			locale,
		);

		this.setTemplate({
			tag: 'ul',
			attributes: {
				class: ['ck', 'ck-definitions'],
			},
			children: [
				pronunciationsContainer,
				// definitionsContainer,
				sequencesContainer,
			],
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

	createDefiningTextBlock(
		definingText: DictionaryTypes.DefiningText,
		locale: Locale,
	): View {
		console.log(`createDefiningTextBlock input: `, definingText);
		const definition = definingText[1];
		const definitionBlock = new View(locale);
		definitionBlock.setTemplate({
			tag: 'p',
			attributes: {
				class: ['ck', 'ck-definition'],
			},
			children: [definition],
		});
		return definitionBlock;
	}

	createSenseBlock(sense: DictionaryTypes.Sense, locale: Locale): View {
		// console.log(`createSenseBlock input: `, sense);
		const { sn: senseNumber, dt, et } = sense[1];
		console.log(`senseNumber: ${senseNumber}`);

		const senseCollection = this.createCollection();

		if (senseNumber) {
			const snBlock = new View(locale);
			snBlock.setTemplate({
				tag: 'span',
				attributes: {
					class: ['ck', 'ck-sense-number'],
				},
				children: [senseNumber],
			});
			senseCollection.add(snBlock);
		}

		if (dt.length && dt[0].length && dt[0][0] === 'text') {
			const definingTextBlock = this.createDefiningTextBlock(
				dt[0],
				locale,
			);
			senseCollection.add(definingTextBlock);
		}

		const dtRowBlock = new View(locale);
		dtRowBlock.setTemplate({
			tag: 'p',
			attributes: {
				class: ['ck', 'ck-dt-row'],
			},
			children: senseCollection,
		});

		return dtRowBlock;
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
}
