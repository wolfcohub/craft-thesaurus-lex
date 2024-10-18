// 2.1 Entry Metadata: meta
// Type for the "meta" section in the Merriam-Webster JSON response
type Meta = {
  id: string; // Unique entry identifier, consisting of headword and homograph number if applicable
  uuid: string; // Universally unique identifier
  sort: string; // Sorting code for proper dictionary order
  src?: string; // Source data set for the entry (can be ignored)
  section?: 'alpha' | 'biog' | 'geog' | 'fw&p'; // Section the entry belongs to in print (e.g., main alphabetical, biographical, geographical)
  stems: string[]; // List of all headwords, variants, inflections, undefined entry words, and defined run-on phrases
  offensive: boolean; // True if the entry is flagged as offensive
};
const test: Meta = {
  id: 'battle:2',
  uuid: '6aaba1f1-f7ca-48ce-b801-f866b41b8988',
  sort: '020100000',
  src: 'collegiate',
  section: 'alpha',
  stems: [
    'batteler',
    'battelers',
    'battle',
    'battle it out',
    'battled',
    'battled it out',
    'battler',
    'battlers',
    'battles',
    'battles it out',
    'battling',
    'battling it out',
  ],
  offensive: false,
};
// 2.2 Homograph: hom
// Type for the "hom" section in the Merriam-Webster JSON response
type Homograph = number | undefined; // Homograph number used to distinguish identically spelled headwords
// •	Homograph: This field will contain a number when there are multiple headwords with identical spellings but different meanings or origins (homographs). If the entry does not have multiple homographs, this field might be undefined or absent.

// 2.3 Headword Information: hwi
// Type for the pronunciation object used in "hwi"
type Pronunciation = {
  mw: string; // Written pronunciation in Merriam-Webster format (required)
  sound?: {
    audio: string; // Base filename for audio playback
    ref?: string; // Reference (optional, can be ignored)
    stat?: string; // Status (optional, can be ignored)
  };
  pun?: string; // Punctuation to separate pronunciation objects (optional)
  l?: string; // Pronunciation label before pronunciation (optional)
  l2?: string; // Pronunciation label after pronunciation (optional)
};

// Type for the "hwi" section in the Merriam-Webster JSON response
type HeadwordInformation = {
  hw: string; // Headword (required)
  prs?: Pronunciation[]; // Optional array of pronunciation objects
};

// 2.4 Alternate Headwords: ahws
// Type for an alternate headword object used in "ahws"
type AlternateHeadword = {
  hw: string; // Alternate headword (required)
  prs?: Pronunciation[]; // Optional array of pronunciation objects (same as in "hwi")
};

// Type for the "ahws" section in the Merriam-Webster JSON response
type AlternateHeadwords = {
  ahws: AlternateHeadword[]; // Array of alternate headword objects (optional)
};

// 2.5 Variants: vrs
// Type for a variant object used in "vrs"
type Variant = {
  va: string; // Variant (required)
  vl?: string; // Optional variant label (e.g., "or", "less commonly", etc.)
  prs?: Pronunciation[]; // Optional array of pronunciation objects
  spl?: string; // Optional sense-specific inflection plural label
};

// Type for the "vrs" section in the Merriam-Webster JSON response
type Variants = {
  vrs: Variant[]; // Array of variant objects (optional)
};

// 2.6 Pronunciations: prs
// Type for the sound object used in Pronunciation
// Type for the "prs" section in the Merriam-Webster JSON response
type Pronunciations = {
  prs: Pronunciation[]; // Array of pronunciation objects (optional)
};
// 2.7 Labels
// Full type for the labels section
type Labels = {
  fl: FunctionalLabel; // Functional label (required)
  lbs?: GeneralLabels; // General labels (optional)
  sls?: SubjectStatusLabels; // Subject/status labels (optional)
  psl?: ParenthesizedSubjectStatusLabel; // Parenthesized subject/status label (optional)
  spl?: SenseSpecificInflectionPluralLabel; // Sense-specific inflection plural label (optional)
  sgram?: SenseSpecificGrammaticalLabel; // Sense-specific grammatical label (optional)
};
// 2.7.1 Functional Label: fl
// Type for the functional label (fl)
type FunctionalLabel = {
  fl: string; // Part of speech or functional label (required)
};
// 2.7.2 General Labels: lbs
// Type for general labels (lbs)
type GeneralLabels = {
  lbs: string[]; // Array of general labels (optional)
};
// 2.7.3 Subject/Status Labels: sls
// Type for subject/status labels (sls)
type SubjectStatusLabels = {
  sls: string[]; // Array of subject/status labels (optional)
};
// 2.7.4 Parenthesized Subject/Status Label: psl
// Type for parenthesized subject/status label (psl)
type ParenthesizedSubjectStatusLabel = {
  psl?: string; // Parenthesized subject/status label (optional)
};

// 2.7.5 Sense-Specific Inflection Plural Label: spl
// Type for sense-specific inflection plural label (spl)
type SenseSpecificInflectionPluralLabel = {
  spl?: string; // Sense-specific inflection plural label (optional)
};

// 2.7.6 Sense-Specific Grammatical Label: sgram
// Type for sense-specific grammatical label (sgram)
type SenseSpecificGrammaticalLabel = {
  sgram?: string; // Sense-specific grammatical label (optional)
};

// 2.8 Inflections: ins
// Type for inflection details (ins)
type Inflection = {
  if: string; // The actual inflection (required)
  prs?: Pronunciation[]; // Optional pronunciation information (array of prs)
  spl?: string; // Optional sense-specific plural label
  sgram?: string; // Optional sense-specific grammatical label
  lb?: string; // Optional label to describe the inflection (e.g., "plural", "past tense")
};
// Type for the array of inflections (ins)
type Inflections = {
  ins: Inflection[]; // Array of inflection objects
};
// 2.9 Cognate Cross-References: cxs
// Type for a single cognate cross-reference (cxs)
type CognateCrossReference = {
  cxl: string; // The cross-reference label (e.g., "see also", "compare with")
  cxt: string; // The term or cognate being referenced (e.g., a related word in the same or different language)
  cxlr?: string; // Optional label reference (provides additional context for the cross-reference)
};

// Type for the array of cognate cross-references (cxs)
type CognateCrossReferences = {
  cxs: CognateCrossReference[]; // Array of cognate cross-reference objects
};
// 2.10 Sense Organization
// 2.10.1 Definition Section: def
type DefinitionSection = {
  def: SenseSequence[]; // Array of sense sequences representing different senses of the word
};
// 2.10.2 Verb Divider: vd
type VerbDivider = 'transitive' | 'intransitive';
// 2.10.3 Sense Sequence: sseq
type SenseSequence = {
  sn?: string; // Optional sense number
  sense: Sense[]; // Array of sense objects
};
// 2.10.4 Sense: sense
type Sense = {
  sn: string; // Sense number (e.g., "1", "1a", etc.)
  dt: DefiningText[]; // Array of defining texts
};
// 2.10.5 Sense Number: sn
type SenseNumber = string; // Example: "1", "1a", "2", etc.
// 2.10.6 Defining Text: dt
type DefiningText = string; // Example: "to move through the air by means of wings"
// 2.10.7 Divided Sense: sdsense
type DividedSense = {
  sn: string; // Sub-sense number (e.g., "1a", "1b")
  dt: DefiningText[]; // Array of defining texts
};
// 2.10.8 Truncated Sense: sen
type TruncatedSense = {
  sn: string; // Sense number
  dt: DefiningText[]; // Array of defining texts
};
// 2.10.9 Binding Substitute: bs
type BindingSubstitute = {
  bs: string; // Placeholder text or reference
};
// 2.10.10 Parenthesized Sense Sequence: pseq
type ParenthesizedSenseSequence = {
  sn: string; // Sense number
  dt: DefiningText[]; // Array of defining texts
};
// 2.11 Verbal Illustrations: vis
type VerbalIllustration = {
  vi: string[]; // Array of verbal illustrations (e.g., example sentences using the word)
};
// 2.12 Attribution of Quote: aq
type AttributionQuote = {
  aq: string; // The name or source of the quote's author
};
// 2.13 Run-In: ri
type RunIn = {
  ri: string; // The content of the run-in
};
// 2.14 Biographical Name Wrap: bnw
type BiographicalNameWrap = {
  bnw: string; // The biographical information wrapped together
};
// 2.15 Called-Also Note: ca
type CalledAlsoNote = {
  ca: string[]; // Array of alternate names or terms
};
// 2.16 Supplemental Information Note: snote
type SupplementalInformationNote = {
  snote: string; // Additional details or clarifications
};
// 2.17 Usage Notes: uns
type UsageNotes = {
  uns: string; // Usage recommendations and notes
};
// 2.18 Undefined Run-Ons: uros
type UndefinedRunOns = {
  uros: string[]; // List of undefined run-ons
};
// 2.19 Defined Run-Ons: dros
type DefinedRunOns = {
  dros: {
    word: string;
    definition: string;
  }[]; // Array of defined run-ons with their definitions
};
// 2.20 Directional Cross-Reference Section: dxnls
type DirectionalCrossReferenceSection = {
  dxnls: string[]; // List of cross-references
};
// 2.21 Usage Section: usages
type UsageSection = {
  usage_notes: string; // Detailed explanation of how the word should be used
};
// 2.22 Synonyms Section: syns
type SynonymsSection = {
  synonyms: {
    word: string;
    description: string; // Brief differentiation between synonyms
  }[];
};
// 2.23 Quotations Section: quotes
type QuotationsSection = {
  quotations: {
    text: string;
    source: string; // Author or title of the work
  }[];
};
// 2.24 Artwork: art
type ArtworkSection = {
  images: {
    description: string;
    url: string; // URL or path to the image
  }[];
};
// 2.25 Tables: table
type TablesSection = {
  tables: {
    headers: string[]; // List of column headers
    rows: string[][]; // 2D array representing table rows and columns
  }[];
};
// 2.26 Etymology: et
type EtymologySection = {
  origin: string; // Brief history of the word's origin
  languages: string[]; // List of languages contributing to the word's evolution
};
// 2.27 First Known Use: date
type FirstKnownUseSection = {
  first_use_date: string; // Date of the first known appearance of the word
};
// 2.28 Short Definition: shortdef
type ShortDefinitionSection = {
  definitions: string[]; // List of brief definitions
};

// •	{b}: Indicates bold text.
// •	{bc}: Indicates a bold colon, often used before explanations or lists.
// •	{inf}: Stands for infinitive, used for verbs in the infinitive form.
// •	{it}: Marks italicized text.
// •	{ldquo}: Marks the beginning of a left double quotation mark.
// •	{p_br}: Denotes a paragraph break or line break.
// •	{rdquo}: Marks the right double quotation mark.
// •	{sc}: Indicates small caps text.
