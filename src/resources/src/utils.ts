import { Locale } from 'ckeditor5';
import type { Range } from 'ckeditor5/src/engine.js';
import { ButtonView, View } from 'ckeditor5/src/ui.js';
import { Editor } from 'ckeditor5/src/core.js';

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

// return boolean `true` if input string consists of a single unbroken word, `false` otherwise
export function isSingleWord(input: string): boolean {
	// Trim leading and trailing whitespace
	const trimmedInput = input.trim();

	// Use a regular expression to check if the string consists of a single word
	return /^[^\s]+$/.test(trimmedInput);
}

// return string representation of a selected Range from CKEditor field
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

// strip out tokens from Dictionary API response we don't use
// (dx, dx_def, dx_ety, ma)
function stripNestedTokens(text: string): string {
	const nestedTokenRegex =
		/\{(dx|dx_def|dx_ety|ma)\}|{\/(dx|dx_def|dx_ety|ma)}/g;

	// Replace all instances of the matched tokens with an empty string.
	return text.replace(nestedTokenRegex, '');
}

type TokenHandler = (matchGroups: string[], editor: Editor) => string | View;

// function map for converting the various tokens to displayable elements in CKEditor
// per Merriam-Webster guidlines (https://dictionaryapi.com/products/json)
const tokenHandlers: Record<string, TokenHandler> = {
	it: (groups, editor) =>
		createStyledView('italic', groups[0], editor.locale),
	b: (groups, editor) => createStyledView('bold', groups[0], editor.locale),
	inf: (groups, editor) => createStyledView('sub', groups[0], editor.locale),
	sup: (groups, editor) => createStyledView('sup', groups[0], editor.locale),
	sc: (groups, editor) =>
		createStyledView('smallCaps', groups[0], editor.locale),
	gloss: (groups, editor) =>
		createStyledView('normal', `[${groups[0]}]`, editor.locale),
	parahw: (groups, editor) =>
		createStyledView('boldSmallCaps', groups[0], editor.locale),
	phrase: (groups, editor) =>
		createStyledView('boldItalic', groups[0], editor.locale),
	qword: (groups, editor) =>
		createStyledView('italic', groups[0], editor.locale),
	wi: (groups, editor) =>
		createStyledView('italic', groups[0], editor.locale),
	bc: () => ': ',
	ldquo: () => '“',
	rdquo: () => '”',
	a_link: (groups, editor) => createLinkView(groups[3], groups[3], editor),
	d_link: (groups, editor) => {
		const linkText = groups[4] || groups[3];
		const view = createLinkView(linkText, linkText, editor);
		return view;
	},
	i_link: (groups, editor) => {
		const linkText = groups[4] || groups[3];
		const view = createLinkView(linkText, linkText, editor);
		return view;
	},
	et_link: (groups, editor) => {
		const linkText = groups[4] || groups[3];
		const view = createLinkView(linkText, linkText, editor);
		return view;
	},
	sx: (groups, editor) =>
		createLinkView(groups[3], groups[3], editor, undefined, groups[5]),
	mat: (groups, editor) => {
		const linkText = groups[4] || groups[3];
		const view = createLinkView(linkText, linkText, editor);
		return view;
	},
	dxt: (groups, editor) => {
		const view = createLinkView(
			groups[3],
			groups[3],
			editor,
			undefined,
			groups[5],
		);
		return view;
	},
};

// convert text block from Dictionary API to a combined Array<string | View>
// which can be passed into the `children` prop of `View.setTemplate`
export function stringToViewCollection(
	text: string,
	editor: Editor,
): Array<string | View> {
	const collection: Array<string | View> = [];
	const textWithoutNestedTokens = stripNestedTokens(text);
	parseAndBuildCollection(textWithoutNestedTokens, collection, editor);
	return collection;
}

function parseAndBuildCollection(
	text: string,
	collection: Array<string | View>,
	editor: Editor,
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
				const element = handler(groups, editor);
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

// return styled CKEditor View per embedded API tokens
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

// create CKEditor View for link to another word
function createLinkView(
	linkText: string,
	href: string | undefined,
	editor: Editor,
	textStyle?: string,
	extraText?: string,
): View {
	const linkView = new ButtonView(editor.locale);
	const text = extraText ? `${linkText} ${extraText}` : linkText;

	linkView.set({
		label: text,
		withText: true,
		tooltip: `Look up "${text}"`,
	});

	// linkView.setTemplate({
	// 	tag: 'a',
	// 	attributes: {
	// 		...(textStyle && {
	// 			style: textStyle === 'italic' ? 'font-style: italic;' : '',
	// 		}),
	// 	},
	// 	children: [text],
	// });
	linkView.on('execute', () => {
		console.log(`executing lookup command with ${text}`);
		editor.execute(LOOKUP, text);
	});
	return linkView;
}
