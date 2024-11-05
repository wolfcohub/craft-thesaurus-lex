// 2.1 Entry Metadata: meta
// Type for the "meta" section in the Merriam-Webster JSON response
export namespace DictionaryTypes {
	export type Meta = {
		id: string; // Unique entry identifier, consisting of headword and homograph number if applicable
		uuid: string; // Universally unique identifier
		sort: string; // Sorting code for proper dictionary order
		src?: string; // Source data set for the entry (can be ignored)
		section?: 'alpha' | 'biog' | 'geog' | 'fw&p'; // Section the entry belongs to in print (e.g., main alphabetical, biographical, geographical)
		stems: string[]; // List of all headwords, variants, inflections, undefined entry words, and defined run-on phrases
		offensive: boolean; // True if the entry is flagged as offensive
	};

	// 2.2 Homograph: hom
	// Type for the "hom" section in the Merriam-Webster JSON response
	export type Homograph = number; // Homograph number used to distinguish identically spelled headwords
	// •	Homograph: This field will contain a number when there are multiple headwords with identical spellings but different meanings or origins (homographs). If the entry does not have multiple homographs, this field might be undefined or absent.

	export type Sound = {
		audio: string; // Base filename for audio playback
		ref?: string; // Reference (optional, can be ignored)
		stat?: string; // Status (optional, can be ignored)
	};

	// 2.3 Headword Information: hwi
	// Type for the pronunciation object used in "hwi"
	export type Pronunciation = {
		mw: string; // Written pronunciation in Merriam-Webster format (required)
		sound?: Sound;
		pun?: string; // Punctuation to separate pronunciation objects (optional)
		l?: string; // Pronunciation label before pronunciation (optional)
		l2?: string; // Pronunciation label after pronunciation (optional)
	};

	// Type for the "hwi" section in the Merriam-Webster JSON response
	export type HeadwordInformation = {
		hw: string; // Headword (required)
		prs?: Pronunciation[]; // Optional array of pronunciation objects
	};

	// 2.4 Alternate Headwords: ahws
	// Type for an alternate headword object used in "ahws"
	export type AlternateHeadword = {
		hw: string; // Alternate headword (required)
		prs?: Pronunciation[]; // Optional array of pronunciation objects (same as in "hwi")
	};

	// 2.5 Variants: vrs
	// Type for a variant object used in "vrs"
	export type Variant = {
		va: string; // Variant (required)
		vl?: string; // Optional variant label (e.g., "or", "less commonly", etc.)
		prs?: Pronunciation[]; // Optional array of pronunciation objects
		spl?: string; // Optional sense-specific inflection plural label
	};

	// 2.6 Pronunciations: prs
	// Type for the sound object used in Pronunciation
	// Type for the "prs" section in the Merriam-Webster JSON response
	export type Pronunciations = {
		prs: Pronunciation[]; // Array of pronunciation objects (optional)
	};
	// 2.7 Labels
	// Full export type for the labels section
	export type Labels = {
		fl: string; // Functional label (required)
		lbs?: string[]; // General labels (optional)
		sls?: string[]; // Subject/status labels (optional)
		psl?: ParenthesizedSubjectStatusLabel; // Parenthesized subject/status label (optional)
		spl?: SenseSpecificInflectionPluralLabel; // Sense-specific inflection plural label (optional)
		sgram?: SenseSpecificGrammaticalLabel; // Sense-specific grammatical label (optional)
	};
	// 2.7.1 Functional Label: fl
	// Type for the functional label (fl)
	// export type FunctionalLabel = {
	// 	fl: string; // Part of speech or functional label (required)
	// };
	// 2.7.3 Subject/Status Labels: sls
	// Type for subject/status labels (sls)
	export type SubjectStatusLabels = {
		sls: string[]; // Array of subject/status labels (optional)
	};
	// 2.7.4 Parenthesized Subject/Status Label: psl
	// Type for parenthesized subject/status label (psl)
	export type ParenthesizedSubjectStatusLabel = {
		psl?: string; // Parenthesized subject/status label (optional)
	};

	// 2.7.5 Sense-Specific Inflection Plural Label: spl
	// Type for sense-specific inflection plural label (spl)
	export type SenseSpecificInflectionPluralLabel = {
		spl?: string; // Sense-specific inflection plural label (optional)
	};

	// 2.7.6 Sense-Specific Grammatical Label: sgram
	// Type for sense-specific grammatical label (sgram)
	export type SenseSpecificGrammaticalLabel = {
		sgram?: string; // Sense-specific grammatical label (optional)
	};

	// 2.8 Inflections: ins
	// Type for inflection details (ins)
	export type Inflection = {
		if?: string; // The actual inflection (required)
		ifc?: string;
		il?: string;
		prs?: Pronunciation[]; // Optional pronunciation information (array of prs)
		spl?: string; // Optional sense-specific plural label
	};

	export type CrossReferenceTarget = {
		cxl?: string; // The cross-reference label (e.g., "see also", "compare with")
		cxr?: string;
		cxt?: string; // The term or cognate being referenced (e.g., a related word in the same or different language)
		cxn?: string; // Optional label reference (provides additional context for the cross-reference)
	};

	// 2.9 Cognate Cross-References: cxs
	// Type for a single cognate cross-reference (cxs)
	export type CognateCrossReference = {
		cxl?: string;
		cxtis?: CrossReferenceTarget[];
	};

	export type DefiningText = ['text', string];
	export type EtymologyContent = ['text', string];
	export type EtymologySupplementalNote = ['et_snote', Array<['t', string]>];
	export type Pseq = [
		'pseq',
		Array<{
			sense: {
				sn: string;
				dt: Array<DefiningText | VerbalIllustration>;
			};
		}>,
	];

	export type Sense = [
		'sense' | 'pseq',
		{
			sn?: string;
			dt?: Array<DefiningText | VerbalIllustration>;
			et?: Array<EtymologyContent | EtymologySupplementalNote>;
			sdsense?: DividedSense;
			sls?: string[];
			pseq?: Pseq;
		},
	];

	export type VerbalIllustrationContent = {
		t: string;
		aq?: AttributionQuote;
	};

	export type VerbalIllustration = ['vis', VerbalIllustrationContent[]];

	// same structure as VerbalIllustrationContent - separating for readability
	export type Quote = {
		t: string;
		aq?: AttributionQuote;
	};

	export type DividedSense = {
		sd: string;
		dt: Array<DefiningText | VerbalIllustration>;
	};

	export type SenseSequence = Array<Sense>;
	// 2.10 Sense Organization
	// 2.10.1 Definition Section: def
	export type DefinitionSection = {
		def: SenseSequence[]; // Array of sense sequences representing different senses of the word
	};
	export type Definition = {
		sseq: SenseSequence[];
		vd?: string;
	};
	// 2.10.2 Verb Divider: vd
	export type VerbDivider = 'transitive' | 'intransitive';

	// 2.10.5 Sense Number: sn
	export type SenseNumber = string; // Example: "1", "1a", "2", etc.
	// 2.10.6 Defining Text: dt
	// export type DefiningText = string; // Example: "to move through the air by means of wings"
	// Define the basic structure for 'dt'

	export type Subsource = {
		source?: string;
		aqdate?: string;
	};

	export type AttributionQuote = {
		auth?: string;
		source?: string;
		aqdate?: string;
		subsource?: Subsource;
	};

	// 2.10.7 Divided Sense: sdsense
	// export type DividedSense = {
	//   sn: string; // Sub-sense number (e.g., "1a", "1b")
	//   dt: DefiningText[]; // Array of defining texts
	// };

	// 2.10.8 Truncated Sense: sen
	export type TruncatedSense = {
		sn: string; // Sense number
		dt: DefiningText[]; // Array of defining texts
	};
	// 2.10.9 Binding Substitute: bs
	export type BindingSubstitute = {
		bs: string; // Placeholder text or reference
	};
	// 2.10.10 Parenthesized Sense Sequence: pseq
	export type ParenthesizedSenseSequence = {
		sn: string; // Sense number
		dt: DefiningText[]; // Array of defining texts
	};
	// 2.13 Run-In: ri
	export type RunIn = {
		ri: string; // The content of the run-in
	};
	// 2.14 Biographical Name Wrap: bnw
	export type BiographicalNameWrap = {
		bnw: string; // The biographical information wrapped together
	};
	// 2.15 Called-Also Note: ca
	export type CalledAlsoNote = {
		ca: string[]; // Array of alternate names or terms
	};
	// 2.16 Supplemental Information Note: snote
	export type SupplementalInformationNote = {
		snote: string; // Additional details or clarifications
	};
	// 2.17 Usage Notes: uns
	export type UsageNotes = {
		uns: string; // Usage recommendations and notes
	};
	// 2.18 Undefined Run-Ons: uros
	export type UndefinedRunOns = {
		uros: string[]; // List of undefined run-ons
	};
	// 2.19 Defined Run-Ons: dros
	export type DefinedRunOns = {
		dros: {
			word: string;
			definition: string;
		}[]; // Array of defined run-ons with their definitions
	};
	// 2.20 Directional Cross-Reference Section: dxnls
	export type DirectionalCrossReferenceSection = {
		dxnls: string[]; // List of cross-references
	};
	// 2.21 Usage Section: usages
	export type UsageSection = {
		usage_notes: string; // Detailed explanation of how the word should be used
	};
	// 2.22 Synonyms Section: syns
	export type SynonymsSection = {
		synonyms: {
			word: string;
			description: string; // Brief differentiation between synonyms
		}[];
	};
	// 2.23 Quotations Section: quotes
	export type QuotationsSection = {
		quotations: {
			text: string;
			source: string; // Author or title of the work
		}[];
	};
	// 2.24 Artwork: art
	export type ArtworkSection = {
		images: {
			description: string;
			url: string; // URL or path to the image
		}[];
	};
	// 2.25 Tables: table
	export type TablesSection = {
		tables: {
			headers: string[]; // List of column headers
			rows: string[][]; // 2D array representing table rows and columns
		}[];
	};
	// 2.26 Etymology: et
	export type EtymologySection = {
		origin: string; // Brief history of the word's origin
		languages: string[]; // List of languages contributing to the word's evolution
	};
	// 2.27 First Known Use: date
	export type FirstKnownUseSection = {
		first_use_date: string; // Date of the first known appearance of the word
	};
	// 2.28 Short Definition: shortdef
	export type ShortDefinitionSection = {
		definitions: string[]; // List of brief definitions
	};

	export type DictionaryResult = {
		def: Array<Definition>;
		meta: Meta;
		shortdef: string[];
		quotes?: Quote[];
		hom?: Homograph;
		hwi: HeadwordInformation;
		ahws?: AlternateHeadword[];
		vrs?: Variant[];
		fl: string;
		lbs?: string[];
		sls?: string[];
		ins?: Inflection[];
		cxs?: CognateCrossReference[];
	};
}
// •	{b}: Indicates bold text.
// •	{bc}: Indicates a bold colon, often used before explanations or lists.
// •	{inf}: Stands for infinitive, used for verbs in the infinitive form.
// •	{it}: Marks italicized text.
// •	{ldquo}: Marks the beginning of a left double quotation mark.
// •	{p_br}: Denotes a paragraph break or line break.
// •	{rdquo}: Marks the right double quotation mark.
// •	{sc}: Indicates small caps text.
