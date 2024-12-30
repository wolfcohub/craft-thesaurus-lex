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

	// 3.3 Geographical Direction: g
	export type GeographicalDirection = {
		g: string; // Compass direction text (e.g., 'NW', 'SW', etc.)
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

	// Type for the synonym and near synonym list (sim_list)

	// 3.6 Subject/Status Labels for Thesaurus Word: wsls
	export type SimilarList = SimilarWord[][]; // Array of arrays of similar word objects

	// Type for subject/status labels (wsls) in the thesaurus

	// 3.7 Variants of Thesaurus Word: wvrs
	// Type for a word variant (wvrs) in the thesaurus

	// Type for the array of word variants (wvrs)
	export type ThesaurusWordVariants = ThesaurusWordVariant[]; // Array of word variant objects

	// 3.8 Verb Variants of Thesaurus Word: wvbvrs
	// Type for a verb variant (wvbvrs) in the thesaurus
	export type VerbVariant = {
		wvbvl: string; // Verb variant label (e.g., "or")
		wvbva: string; // Verb variant word (e.g., "rub shoulders (with)")
	};

	// Type for the array of verb variants (wvbvrs)
	export type VerbVariants = VerbVariant[]; // Array of verb variant objects

	// 3.9 Related Word Lists: rel_list
	// Type for a related word in the thesaurus
	export type RelatedWord = {
		wd: string; // The related word (required)
		wvrs?: ThesaurusWordVariants; // Optional array of word variants
		wsls?: SubjectStatusLabel[]; // Optional array of subject/status labels
		wvbvrs?: VerbVariants; // Optional array of verb variants
	};

	// Type for the related word list (rel_list)
	export type RelatedWordList = RelatedWord[][]; // Array of arrays of related word objects

	// 3.10 Synonymous Phrase Lists: phrase_list
	// Type for a synonymous phrase in the thesaurus
	export type SynonymousPhrase = {
		wd: string; // The synonymous phrase (required)
		wvrs?: ThesaurusWordVariants; // Optional array of word variants
		wsls?: SubjectStatusLabel[]; // Optional array of subject/status labels
		wvbvrs?: VerbVariants; // Optional array of verb variants
	};

	// Type for the synonymous phrase list (phrase_list)
	export type SynonymousPhraseList = SynonymousPhrase[][]; // Array of arrays of synonymous phrase objects

	// 3.11 Near Antonym Lists: near_list
	// Type for a near antonym in the thesaurus
	export type NearAntonym = {
		wd: string; // The near antonym word (required)
		wvrs?: ThesaurusWordVariants; // Optional array of word variants
		wsls?: SubjectStatusLabel[]; // Optional array of subject/status labels
		wvbvrs?: VerbVariants; // Optional array of verb variants
	};

	// Type for the near antonym list (near_list)
	export type NearAntonymList = NearAntonym[][]; // Array of arrays of near antonym objects

	// 3.12 Antonym Lists: ant_list
	// Type for an antonym in the thesaurus
	export type Antonym = {
		wd: string; // The antonym word (required)
		wvrs?: ThesaurusWordVariants; // Optional array of word variants
		wsls?: SubjectStatusLabel[]; // Optional array of subject/status labels
		wvbvrs?: VerbVariants; // Optional array of verb variants
	};

	// Type for the antonym list (ant_list)
	export type AntonymList = Antonym[][]; // Array of arrays of antonym objects

	// 3.13 Antonym and Near Antonym Lists: opp_list
	// Type for an opposite word (antonym or near antonym) in the thesaurus
	export type OppositeWord = {
		wd: string; // The opposite word (required, can be an antonym or near antonym)
		wvrs?: ThesaurusWordVariants; // Optional array of word variants
		wsls?: SubjectStatusLabel[]; // Optional array of subject/status labels
		wvbvrs?: VerbVariants; // Optional array of verb variants
	};

	// Type for the antonym and near antonym list (opp_list)
	export type OppositeWordList = OppositeWord[][]; // Array of arrays of opposite words (antonyms and near antonyms)

	// 3.14 Synonym Cross-References: srefs
	// Type for a synonym cross-reference in the thesaurus
	export type SynonymCrossReference = string; // The target entry ID for the synonym cross-reference (also acts as the link text)

	// Type for the synonym cross-reference list (srefs)
	export type SynonymCrossReferenceList = SynonymCrossReference[]; // Array of synonym cross-references

	// 3.15 Usage Cross-References: urefs
	// Type for a usage cross-reference in the thesaurus
	export type UsageCrossReference = string; // The target entry ID for the usage cross-reference (also acts as the link text)

	// Type for the usage cross-reference list (urefs)
	export type UsageCrossReferenceList = UsageCrossReference[]; // Array of usage cross-references

	// 3.16 Self-Explanatory List: list
	// Type for a self-explanatory word in the thesaurus
	export type SelfExplanatoryWord = string; // Contains the word that is self-explanatory in context

	// Type for the self-explanatory list (list)
	export type SelfExplanatoryList = SelfExplanatoryWord[]; // Array of self-explanatory words

	// 3.17 Tokens Used in Running Text
	// 3.17.1 Formatting Tokens: {bit}, {itsc}, {rom}
	// Type for text that is marked up for specific formatting in running text
	export type FormattedText = string; // The base string content to be formatted

	// Type for bold-italics formatting token {bit}
	export type BoldItalicsText = {
		bit: FormattedText; // Text that should be displayed in bold italics
	};

	// Type for italic small caps formatting token {itsc}
	export type ItalicSmallCapsText = {
		itsc: FormattedText; // Text that should be displayed in italic small caps
	};

	// Type for Roman/normal formatting token {rom}
	export type RomanText = {
		rom: FormattedText; // Text that should be displayed in normal font
	};

	// Example of how these tokens could be used together in running text
	export type RunningTextTokens = (
		| BoldItalicsText
		| ItalicSmallCapsText
		| RomanText
		| FormattedText
	)[];
}
