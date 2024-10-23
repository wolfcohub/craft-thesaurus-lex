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

		const { hwi, shortdef: shortDefinitions } = result;
		const { prs: pronunciations } = hwi;

		const pronunciationsContainer = this.createPronunciationsBlock(
			pronunciations,
			locale,
		);

		const definitionsContainer = this.createShortDefinitionsBlock(
			shortDefinitions,
			locale,
		);

		this.setTemplate({
			tag: 'ul',
			attributes: {
				class: ['ck', 'ck-definitions'],
			},
			children: [pronunciationsContainer, definitionsContainer],
		});
	}

	// @todo figure out why <audio> blocks won't render in CKEditor
	createAudioBlock(
		pronunciation: DictionaryTypes.Pronunciation,
		locale: Locale,
	): View | undefined {
		const { mw, sound } = pronunciation;
		if (!sound) {
			return undefined;
		}
		const url = getAudioUrlForPronunciation(sound);
		if (!url) {
			return undefined;
		}
		// const sourceBlock = new View(locale);
		// sourceBlock.setTemplate({
		// 	tag: 'source',
		// 	attributes: {
		// 		src: url,
		// 		type: 'audio/wav',
		// 	},
		// });
		const audioBlock = new View(locale);
		audioBlock.setTemplate({
			tag: 'audio',
			attributes: {
				controls: true,
				src: url,
				type: 'audio/wav',
			},
			// children: [sourceBlock]
		});
		return audioBlock;
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
					const audioBlock = this.createAudioBlock(
						pronunciation,
						locale,
					);

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
}
