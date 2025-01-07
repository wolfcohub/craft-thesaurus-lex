import { View, ButtonView } from 'ckeditor5/src/ui.js';
import { type Locale } from 'ckeditor5/src/utils.js';
import { ThesaurusTypes } from '../ThesaurusTypes.js';
import { Editor } from 'ckeditor5/src/core.js';

export default class ThesaurusBlock extends View {
	private editor: Editor;
	constructor(
		locale: Locale,
		thesaurusData: ThesaurusTypes.ThesaurusResult,
		editor: Editor,
	) {
		super(locale);
		this.editor = editor;

		// Extract `def` from the thesaurus data
		const { def, shortdef, fl } = thesaurusData;
		if (!def || !Array.isArray(def)) {
			throw new Error('Invalid `def` structure in thesaurus data');
		}
		//add word shortdefWord and functionalLabel to the template
		const functionalLabel = fl;
		const shortdefWord = shortdef[0];

		// Create a collection to hold all thesaurus blocks
		const thesaurusCollection = this.createCollection();

		def.forEach((definition) => {
			const sseqItems = this.getSseqItems(definition);
			sseqItems.forEach((synonymList) => {
				if (synonymList.length > 0) {
					const synonymBlock = this.createSynonymBlock(
						locale,
						synonymList,
						shortdefWord,
						functionalLabel,
					);
					thesaurusCollection.add(synonymBlock);
				}
			});
		});

		this.setTemplate({
			tag: 'div',
			attributes: {
				class: ['ck', 'ck-thesaurus-container'],
			},
			children: thesaurusCollection,
		});
	}

	/**
	 * Extracts all `sseq` items and their `syn_list` words, focusing only on `wd`.
	 */
	private getSseqItems(definition: ThesaurusTypes.Definition): string[][] {
		// Ensure `sseq` is valid
		if (!definition.sseq || !Array.isArray(definition.sseq)) {
			return [];
		}

		// Process each `senseSequence` to extract `syn_list` words
		return definition.sseq[0].map((senseSequence) => {
			// Validate `senseSequence` structure
			const sense = Array.isArray(senseSequence)
				? senseSequence[1]
				: null;

			if (
				sense?.syn_list &&
				Array.isArray(sense.syn_list) &&
				sense.syn_list.length > 0
			) {
				// Extract synonyms, focusing only on `wd`
				return sense.syn_list
					.flat()
					.map((syn: ThesaurusTypes.SynonymWord) => syn.wd || '');
			} else if (
				sense?.sim_list &&
				Array.isArray(sense.sim_list) &&
				sense.sim_list.length > 0
			) {
				// Extract synonyms, focusing only on `wd`
				return sense.sim_list
					.flat()
					.map((syn: ThesaurusTypes.SynonymWord) => syn.wd || '');
			}
			// Return an empty array if `syn_list` is missing or invalid
			return [];
		});
	}

	/**
	 * Creates a block for a single list of synonyms.
	 */
	createSynonymBlock(
		locale: Locale,
		synonyms: string[],
		shortdefWord: string,
		functionalLabel: string,
	): View {
		const synonymBlock = new View(locale);

		// Create a view for the functional label and short definition
		const headerView = new View(locale);
		headerView.setTemplate({
			tag: 'div',
			attributes: {
				class: ['ck', 'ck-synonym-header'],
			},
			children: [
				{
					tag: 'span',
					attributes: {
						class: ['ck', 'ck-functional-label'],
					},
					children: functionalLabel,
				},
				{
					tag: 'span',
					attributes: {
						class: ['ck', 'ck-short-def'],
					},
					children: [`As in: ${shortdefWord}`],
				},
			],
		});

		// Create buttons for synonyms
		const synonymButtons = synonyms.map((synonym) => {
			const button = new ButtonView(locale);

			// Configure the button
			button.set({
				label: synonym,
				withText: true,
				tooltip: `Replace with "${synonym}"`,
			});

			// Add handler to replace word with the clicked synonym
			this.listenTo(button, 'execute', () => {
				this.replaceSelectedText(synonym);
			});

			return button;
		});

		// Add all buttons to a container
		synonymBlock.setTemplate({
			tag: 'div',
			attributes: {
				class: ['ck', 'ck-synonym-block'],
			},
			children: [
				headerView, // Add the header view to the block
				...synonymButtons, // Add synonym buttons
			],
		});

		return synonymBlock;
	}

	// function to replace word selected in editor with passed synonym
	private replaceSelectedText(synonym: string): void {
		const editor = this.editor;
		const model = editor.model;

		model.change((writer) => {
			const selection = model.document.selection;

			if (selection.rangeCount > 0) {
				const range = selection.getFirstRange();
				if (range) {
					// Remove the content of the range first
					writer.remove(range);

					// Insert the synonym where the range started
					writer.insertText(synonym, range.start);

					// Clear the selection
					writer.setSelection(null);
				} else {
					console.error('No valid range to replace');
				}
			} else {
				console.error('No text selected to replace');
			}
		});
	}
}
