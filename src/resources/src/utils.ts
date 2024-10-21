import type { Range } from 'ckeditor5/src/engine.js';

export type Definition = {
  definition: string;
  synonyms: string[],
  antonyms: string[],
}
export type Meaning = {
  partOfSpeech: string;
  definitions: Definition[];
  synonyms: string[],
  antonyms: string[],
}
export type Phonetic = {
  text?: string;
  audio?: string;
  sourceUrl?: string;
}
export type LookupResult = {
  word: string;
  phonetics: Phonetic[];
  meanings: Meaning[];
}
// vis
export type VerbalIllustration = {
  text: string;
  author: string;
}
// dt
export type DefiningText = {
  text: string;
}
// bnw
export type BiographicalNameWrap = {
  pname?: string; // display in normal font
  sname?: string; // display in normal font
  altname?: string; // display in italics
}
// sseq
export type SenseSequence = {

}
export type Pronunciation = {
  preText: string;
  text: string;
  postText: string;
}
export type MerriamWebsterResult = {
  word: string;
  pronunciations: Pronunciation[];
  label: string; // (noun, verb, adjective, etc)
  definitions: string[];
}

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
