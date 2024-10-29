import { Locale } from 'ckeditor5';
import type { Range } from 'ckeditor5/src/engine.js';
import { DictionaryTypes } from './DictionaryTypes.js';
import { View } from 'ckeditor5/src/ui.js';

export type Definition = {
	definition: string;
	synonyms: string[];
	antonyms: string[];
};
export type Meaning = {
	partOfSpeech: string;
	definitions: Definition[];
	synonyms: string[];
	antonyms: string[];
};
export type Phonetic = {
	text?: string;
	audio?: string;
	sourceUrl?: string;
};
export type LookupResult = {
	word: string;
	phonetics: Phonetic[];
	meanings: Meaning[];
};
// vis
export type VerbalIllustration = {
	text: string;
	author: string;
};
// dt
export type DefiningText = {
	text: string;
};
// bnw
export type BiographicalNameWrap = {
	pname?: string; // display in normal font
	sname?: string; // display in normal font
	altname?: string; // display in italics
};
// sseq
export type SenseSequence = {};
export type Pronunciation = {
	preText: string;
	text: string;
	postText: string;
};
export type MerriamWebsterResult = {
	word: string;
	pronunciations: Pronunciation[];
	label: string; // (noun, verb, adjective, etc)
	definitions: string[];
};
type StylingKey =
	| 'normal'
	| 'sub'
	| 'sup'
	| 'smallCaps'
	| 'italic'
	| 'bold'
	| 'boldItalic'
	| 'boldSmallCaps';

export const LOOKUP = 'lookup';

export function isSingleWord(input: string): boolean {
	// Trim leading and trailing whitespace
	const trimmedInput = input.trim();

	// Use a regular expression to check if the string consists of a single word
	return /^[^\s]+$/.test(trimmedInput);
}

export function rangeToText(range: Range | null): string {
	if (!range) {
		return '';
	}
	return Array.from(range.getItems()).reduce((rangeText, node) => {
		if (!(node.is('$text') || node.is('$textProxy'))) {
			// convert any non-text items to newline char
			return `${rangeText}\n`;
		}
		return rangeText + node.data;
	}, '');
}

function stripNestedTokens(text: string): string {
	// Define a regular expression to match {dx}, {dx_def}, {dx_ety}, and {ma} opening and closing tags.
	const nestedTokenRegex =
		/\{(dx|dx_def|dx_ety|ma)\}|{\/(dx|dx_def|dx_ety|ma)}/g;

	// Replace all instances of the matched tokens with an empty string.
	return text.replace(nestedTokenRegex, '');
}

type TokenHandler = (matchGroups: string[], locale: Locale) => string | View;

const tokenHandlers: Record<string, TokenHandler> = {
	it: (groups, locale) => createStyledView('italic', groups[0], locale),
	b: (groups, locale) => createStyledView('bold', groups[0], locale),
	inf: (groups, locale) => createStyledView('sub', groups[0], locale),
	sup: (groups, locale) => createStyledView('sup', groups[0], locale),
	sc: (groups, locale) => createStyledView('smallCaps', groups[0], locale),
	gloss: (groups, locale) =>
		createStyledView('normal', `[${groups[0]}]`, locale),
	parahw: (groups, locale) =>
		createStyledView('boldSmallCaps', groups[0], locale),
	phrase: (groups, locale) =>
		createStyledView('boldItalic', groups[0], locale),
	qword: (groups, locale) => createStyledView('italic', groups[0], locale),
	wi: (groups, locale) => createStyledView('italic', groups[0], locale),
	bc: () => ': ',
	ldquo: () => '“',
	rdquo: () => '”',
	a_link: (groups, locale) => createLinkView(groups[3], groups[3], locale),
	d_link: (groups, locale) => {
		const linkText = groups[4] || groups[3];
		const view = createLinkView(linkText, linkText, locale);
		return view;
	},
	i_link: (groups, locale) => {
		const linkText = groups[4] || groups[3];
		const view = createLinkView(linkText, linkText, locale);
		return view;
	},
	et_link: (groups, locale) => {
		const linkText = groups[4] || groups[3];
		const view = createLinkView(linkText, linkText, locale);
		return view;
	},
	sx: (groups, locale) =>
		createLinkView(groups[3], groups[3], locale, undefined, groups[5]),
	mat: (groups, locale) => {
		const linkText = groups[4] || groups[3];
		const view = createLinkView(linkText, linkText, locale);
		return view;
	},
	dxt: (groups, locale) => {
		const view = createLinkView(
			groups[3],
			groups[3],
			locale,
			undefined,
			groups[5],
		);
		return view;
	},
};

export function stringToViewCollection(
	text: string,
	locale: Locale,
): Array<string | View> {
	const collection: Array<string | View> = [];
	const textWithoutNestedTokens = stripNestedTokens(text);
	parseAndBuildCollection(textWithoutNestedTokens, collection, locale);
	return collection;
}

function parseAndBuildCollection(
	text: string,
	collection: Array<string | View>,
	locale: Locale,
) {
	const tokenRegex =
		/\{(it|b|inf|sc|sup|gloss|parahw|phrase|qword|wi)\}(.*?)\{\/\1\}|\{(bc|ldquo|rdquo)\}|\{(a_link|d_link|i_link|et_link|sx|mat|dxt)\|?([^|]*)\|?([^|]*)\|?([^|]*)\}/g;
	let lastIndex = 0;
	let match;

	while ((match = tokenRegex.exec(text)) !== null) {
		// Add any preceding plain text to the collection
		if (match.index > lastIndex) {
			collection.push(text.slice(lastIndex, match.index));
		}

		// Determine the token type and find the appropriate handler
		const tokenType = match[1] || match[4] || match[3] || match[5];

		if (tokenType) {
			const handler = tokenHandlers[tokenType];

			if (handler) {
				// Slice to extract the relevant match groups and pass to the handler
				const groups = match.slice(2);
				const element = handler(groups, locale);
				collection.push(element);
			}
		}
		// Update lastIndex to the end of the current match
		lastIndex = match.index + match[0].length;
	}

	// Add any remaining plain text after the last match
	if (lastIndex < text.length) {
		collection.push(text.slice(lastIndex));
	}
}

function createStyledView(
	style: StylingKey,
	content: string,
	locale: Locale,
): View {
	const view = new View(locale);
	const styles = {
		normal: '',
		italic: 'font-style: italic;',
		boldItalic: 'font-style: italic; font-weight: bold;',
		boldSmallCaps: 'font-variant: small-caps; font-weight: bold;',
		bold: 'font-weight: bold;',
		sub: 'sub',
		sup: 'sup',
		smallCaps: 'font-variant: small-caps;',
	};
	view.setTemplate({
		tag: style === 'sub' || style === 'sup' ? style : 'span',
		attributes:
			style !== 'sub' && style !== 'sup'
				? { style: styles[style] }
				: undefined,
		children: [content],
	});
	return view;
}

function createLinkView(
	linkText: string,
	href: string | undefined,
	locale: Locale,
	textStyle?: string,
	extraText?: string,
): View {
	const linkView = new View(locale);
	const text = extraText ? `${linkText} ${extraText}` : linkText;

	linkView.setTemplate({
		tag: 'a',
		attributes: {
			href: href || linkText,
			...(textStyle && {
				style: textStyle === 'italic' ? 'font-style: italic;' : '',
			}),
		},
		children: [text],
	});
	return linkView;
}
