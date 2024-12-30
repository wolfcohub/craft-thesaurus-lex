import { Locale } from 'ckeditor5';
import { View, ViewCollection } from 'ckeditor5/src/ui.js';
import { DictionaryTypes } from '../DictionaryTypes.js';

export default class PronunciationsBlock extends View {
	constructor(locale: Locale, data: DictionaryTypes.Pronunciation[]) {
		// console.log(`PronunciationsBlock constructor`);
		super(locale);

		const pronunciationBlocks = this.createCollection();
		let delimiter = '';

		if (data) {
			for (const pronunciation of data) {
				if (pronunciation.pun) {
					delimiter = ` ${pronunciation.pun} `;
				}
			}
			data.forEach(
				(pronunciation: DictionaryTypes.Pronunciation, index: number) => {
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
				}
			);
		}
		this.setTemplate({
			tag: 'div',
			attributes: {
				class: ['ck', 'ck-prs-container'],
			},
			children: pronunciationBlocks,
		});
	}
}
