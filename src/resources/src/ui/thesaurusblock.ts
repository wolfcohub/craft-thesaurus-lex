import { View, ButtonView } from 'ckeditor5/src/ui.js';
import { type Locale } from 'ckeditor5/src/utils.js';
import { ThesaurusTypes } from '../ThesaurusTypes.js';
import { Editor } from 'ckeditor5/src/core.js';

export default class ThesaurusBlock extends View {
	private editor: Editor;
	constructor(
		locale: Locale,
		thesaurusData: ThesaurusTypes.ThesaurusResult,
		editor: Editor
	) {
		super(locale);
		this.editor = editor;
		// console.log('🚀 Data received by ThesaurusBlock:', thesaurusData);

		// Extract `def` from the thesaurus data
		const { def, shortdef, fl, hwi } = thesaurusData;
		console.log(shortdef[0]);
		if (!def || !Array.isArray(def)) {
			throw new Error('Invalid `def` structure in thesaurus data');
		}
		// const word = hwi.hw;
		const functionalLabel = fl;
		const shortdefWord = shortdef[0];
		//add word shortdefWord and functionalLabel to the template

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
						functionalLabel
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
	 * Extracts all `sseq` items and their `syn_list` words, including optional `lvl` and `ova` values.
	 */
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
			const sense = Array.isArray(senseSequence) ? senseSequence[1] : null;

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

			console.info('No valid syn_list in senseSequence:', senseSequence);
			return []; // Return an empty array if `syn_list` is missing or invalid
		});
	}

	/**
	 * Creates a block for a single list of synonyms.
	 */
	createSynonymBlock(
		locale: Locale,
		synonyms: string[],
		shortdefWord: string,
		functionalLabel: string
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
					children: functionalLabel, // Add the functional label
				},
				{
					tag: 'span',
					attributes: {
						class: ['ck', 'ck-short-def'],
					},
					children: [`As in: ${shortdefWord}`], // Add the short definition
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

			// Add an event listener for the button click
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
	/**
	 * Copies the given text to the clipboard.
	 */
	private copyToClipboard(text: string): void {
		console.log(`Copying to clipboard:`);
		navigator.clipboard.writeText(text).then(
			() => {
				console.log(`Copied to clipboard: ${text}`);
			},
			(err) => {
				console.error('Failed to copy text: ', err);
			}
		);
	}
}
