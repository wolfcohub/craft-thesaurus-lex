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

export function stringToCollection(
	text: string,
	locale: Locale,
): Array<string | View> {
	const result: Array<string | View> = [];
	const regex = /(.*?)(\{it\})(.*?)(\{\/it\})/g; // regex to match text around {it}...{/it} tokens
	let lastIndex = 0;

	let match;
	while ((match = regex.exec(text)) !== null) {
		const [fullMatch, beforeText, , insideItText] = match;

		// Push any text before the match as a plain string.
		if (match.index > lastIndex) {
			result.push(text.slice(lastIndex, match.index));
		}

		// Push the View for the {it}...{/it} text.
		const italicView = new View(locale);
		italicView.setTemplate({
			tag: 'span',
			children: [insideItText],
		});
		result.push(italicView);

		// Update lastIndex to the end of this match.
		lastIndex = match.index + fullMatch.length;
	}

	// Push any remaining text after the last match.
	if (lastIndex < text.length) {
		result.push(text.slice(lastIndex));
	}

	return result;
}

export function stringToViewCollection(
	text: string,
	locale: Locale,
): Array<string | View> {
	const result: Array<string | View> = [];

	// Updated regex to handle paired tokens, self-contained tokens, and the {a_link|text} token
	const regex =
		/(.*?)(\{(it|b|inf|sc|sup)\}(.*?)\{\/\3\}|\{(bc|ldquo|rdquo)\}|\{a_link\|(.*?)\})(.*?)/g;
	let lastIndex = 0;
	let match;

	while ((match = regex.exec(text)) !== null) {
		const [
			fullMatch,
			beforeText,
			pairedToken,
			pairedTokenType,
			insideText,
			selfContainedTokenType,
			linkText,
		] = match;

		// Push any text before the token as a plain string.
		if (match.index > lastIndex) {
			result.push(text.slice(lastIndex, match.index));
		}

		// Process any text before the token
		if (beforeText) result.push(beforeText);

		// Handle paired tokens with opening and closing tags.
		if (pairedToken) {
			if (pairedTokenType === 'it') {
				const italicView = new View(locale);
				italicView.setTemplate({
					tag: 'span',
					attributes: { style: 'font-style: italic;' },
					children: [insideText],
				});
				result.push(italicView);
			} else if (pairedTokenType === 'b') {
				const boldView = new View(locale);
				boldView.setTemplate({
					tag: 'span',
					attributes: { style: 'font-weight: bold;' },
					children: [insideText],
				});
				result.push(boldView);
			} else if (pairedTokenType === 'inf') {
				const subscriptView = new View(locale);
				subscriptView.setTemplate({
					tag: 'sub',
					children: [insideText],
				});
				result.push(subscriptView);
			} else if (pairedTokenType === 'sup') {
				const superscriptView = new View(locale);
				superscriptView.setTemplate({
					tag: 'sup',
					children: [insideText],
				});
				result.push(superscriptView);
			} else if (pairedTokenType === 'sc') {
				const smallCapsView = new View(locale);
				smallCapsView.setTemplate({
					tag: 'span',
					attributes: { style: 'font-variant: small-caps;' },
					children: [insideText],
				});
				result.push(smallCapsView);
			}
		}

		// Handle self-contained tokens
		if (selfContainedTokenType) {
			if (selfContainedTokenType === 'bc') {
				const boldColonView = new View(locale);
				boldColonView.setTemplate({
					tag: 'span',
					attributes: { style: 'font-weight: bold;' },
					children: [': '],
				});
				result.push(boldColonView);
			} else if (selfContainedTokenType === 'ldquo') {
				result.push('“');
			} else if (selfContainedTokenType === 'rdquo') {
				result.push('”');
			}
		}

		// Handle the {a_link|text} token, which creates an <a> link.
		if (linkText) {
			const linkView = new View(locale);
			linkView.setTemplate({ tag: 'a', children: [linkText] });
			result.push(linkView);
		}

		// Update lastIndex to the end of this match.
		lastIndex = match.index + fullMatch.length;
	}

	// Push any remaining text after the last token as a plain string.
	if (lastIndex < text.length) {
		result.push(text.slice(lastIndex));
	}

	return result;
}
