// 3. Data Structure: Other Dictionaries and Thesauruses
export namespace ThesaurusTypes {
	// 3.1 Entry Metadata: meta
	export type Meta = {
		id: string; // Unique entry identifier, typically the headword
		uuid: string; // Universally unique identifier
		src: string; // Source of the data (e.g., 'coll_thes')
		section?: string; // Optional section information (e.g., 'alpha')
		stems: string[]; // List of all stems (forms of the word) for the entry
		syns?: string[][]; // Optional array of synonym groups
		ants?: string[][]; // Optional array of antonym groups
		offensive?: boolean; // Flag if the entry is considered offensive
		target?: {
			tsrc: string; // Source dictionary for the target entry
			tuuid: string; // UUID of the target entry in the source dictionary
		}; // Optional target entry metadata
	};

	// 3.2 IPA and Word-of-the-Day Pronunciations: ipa, wod
	export type Pronunciation = {
		ipa?: string; // Pronunciation in International Phonetic Alphabet (optional)
		wod?: string; // Word-of-the-day pronunciation format (optional)
		sound?: {
			audio: string; // Audio file name for pronunciation
			ref?: string; // Reference, optional
		}; // Optional audio data
	};

	// Example usage in an entry:
	export type HeadwordInformation = {
		hw: string; // Headword
		prs?: Pronunciation[]; // Array of pronunciations (may include ipa and wod)
	};

	// Example usage within a "sense" section:
	export type Sense = {
		dt?: Array<string>; // Array of sense definitions, optional
		syn_list?: SynonymList[];
		sn?: string;
		near_list?: SimilarWord[];
		ant_list?: SimilarWord[];
		rel_list?: SimilarWord[];
		// List of synonyms
	};

	// 3.4 Definition Type, representing the `def` array in the response
	export type Definition = {
		sseq: Array<[string, Sense]>; // Sense sequences within a definition
	};

	// Main Thesaurus Result structure
	export type ThesaurusResult = {
		meta: Meta;
		hwi: HeadwordInformation;
		fl: string; // Functional label, e.g., noun, adjective
		def: Array<Definition>;
		shortdef: string[];
	};
	// 3.4 Synonym Lists: syn_list
	// Type for a word variant in the thesaurus
	export type ThesaurusWordVariant = {
		wvl: string; // Variant label (e.g., "also", "or")
		wva: string; // The actual word variant (e.g., "joyous")
	};

	// Type for subject/status labels
	export type SubjectStatusLabel = {
		wsl: string; // The subject/status label (e.g., "chiefly British", "informal")
	};

	// Type for a synonym word in the thesaurus
	export type SynonymWord = {
		wd: string; // The synonym word (required)
		wvrs?: ThesaurusWordVariant[]; // Optional array of word variants
		wsls?: SubjectStatusLabel[]; // Optional array of subject/status labels
	};

	// Type for the synonym list (syn_list)
	export type SynonymList = SynonymWord[]; // Array of arrays of synonym word objects

	// 3.5 Synonym and Near Synonym Lists: sim_list
	// Type for a similar word (synonym or near synonym) in the thesaurus
	export type SimilarWord = {
		wd: string; // The word (either synonym or near synonym)
		wvrs?: ThesaurusWordVariant[]; // Optional word variants
		wsls?: SubjectStatusLabel[]; // Optional subject/status labels
	};
}
