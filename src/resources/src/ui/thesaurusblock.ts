import { View, ButtonView } from 'ckeditor5/src/ui.js';
import { type Locale } from 'ckeditor5/src/utils.js';
import { ThesaurusTypes } from '../ThesaurusTypes.js';
import { Editor } from 'ckeditor5/src/core.js';

export default class ThesaurusBlock extends View {
	private editor: Editor;

	constructor(
		locale: Locale,
		thesaurusData: ThesaurusTypes.ThesaurusResult | string[],
		editor: Editor,
	) {
		super(locale);
		this.editor = editor;

		const thesaurusCollection = this.createCollection();

		// Check if thesaurusData is an array of strings (edge case)
		if (Array.isArray(thesaurusData)) {
			// Create a container for synonym buttons in the edge case
			const synonymContainer = new View(locale);
			synonymContainer.setTemplate({
				tag: 'div',
				attributes: {
					class: ['ck', 'ck-synonym-block'],
				},
				children: thesaurusData.map((word) =>
					this.createWordButton(locale, word),
				),
			});
			thesaurusCollection.add(synonymContainer);
		} else {
			// Handle normal case: Nested `ThesaurusResult`
			const { def, shortdef, fl } = thesaurusData;
			if (def && Array.isArray(def)) {
				def.forEach((definition) => {
					const sseqItems = this.getSseqItems(definition);
					sseqItems.forEach((synonymList) => {
						if (synonymList.length > 0) {
							const synonymBlock = this.createSynonymBlock(
								locale,
								synonymList,
								shortdef[0] || '',
								fl || '',
							);
							thesaurusCollection.add(synonymBlock);
						}
					});
				});
			}
		}

		this.setTemplate({
			tag: 'div',
			attributes: {
				class: ['ck', 'ck-thesaurus-container'],
			},
			children: thesaurusCollection,
		});
	}

	/**
	 * Extracts all `sseq` items and their `syn_list` words.
	 */
	private getSseqItems(definition: ThesaurusTypes.Definition): string[][] {
		if (!definition.sseq || !Array.isArray(definition.sseq)) {
			return [];
		}

		return definition.sseq[0].map((senseSequence) => {
			const sense = Array.isArray(senseSequence)
				? senseSequence[1]
				: null;

			if (sense?.syn_list && Array.isArray(sense.syn_list)) {
				return sense.syn_list
					.flat()
					.map((syn: ThesaurusTypes.SynonymWord) => syn.wd || '');
			}
			return [];
		});
	}

	/**
	 * Creates a block for a single list of synonyms.
	 */
	private createSynonymBlock(
		locale: Locale,
		synonyms: string[],
		shortdefWord: string,
		functionalLabel: string,
	): View {
		const synonymBlock = new View(locale);

		const headerView = new View(locale);
		headerView.setTemplate({
			tag: 'div',
			attributes: { class: ['ck', 'ck-synonym-header'] },
			children: [
				{
					tag: 'span',
					attributes: { class: ['ck', 'ck-functional-label'] },
					children: functionalLabel,
				},
				{
					tag: 'span',
					attributes: { class: ['ck', 'ck-short-def'] },
					children: [`As in: ${shortdefWord}`],
				},
			],
		});

		const synonymButtons = synonyms.map((synonym) =>
			this.createWordButton(locale, synonym),
		);

		synonymBlock.setTemplate({
			tag: 'div',
			attributes: { class: ['ck', 'ck-synonym-block'] },
			children: [headerView, ...synonymButtons],
		});

		return synonymBlock;
	}

	/**
	 * Creates a simple button for a single word.
	 */
	private createWordButton(locale: Locale, word: string): ButtonView {
		const button = new ButtonView(locale);
		button.set({
			label: word,
			withText: true,
			tooltip: `Replace with "${word}"`,
		});

		this.listenTo(button, 'execute', () => {
			this.replaceSelectedText(word);
		});

		return button;
	}

	/**
	 * Replaces the selected text in the editor with the given synonym.
	 */
	private replaceSelectedText(synonym: string): void {
		const model = this.editor.model;
		model.change((writer) => {
			const selection = model.document.selection;

			if (selection.rangeCount > 0) {
				const range = selection.getFirstRange();
				if (range) {
					writer.remove(range);
					writer.insertText(synonym, range.start);
				}
			}
		});
	}
}
