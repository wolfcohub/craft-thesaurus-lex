import { Locale } from 'ckeditor5';
import { View } from 'ckeditor5/src/ui.js';
import { DictionaryTypes } from '../DictionaryTypes.js';
import { stringToViewCollection } from '../utils.js';

export default class AttributionBlock extends View {
	constructor(locale: Locale, data: DictionaryTypes.AttributionQuote) {
		super(locale);

		const { auth, source, aqdate, subsource } = data;

		const attributionStrings: Array<string | View> = [];

		// format quote attribution by what values are defined
		if (auth) {
			attributionStrings.push(auth);
		}
		if (source) {
			if (attributionStrings.length) {
				attributionStrings.push(', ');
			}
			const sourceCollection = stringToViewCollection(source, locale);
			attributionStrings.push(...sourceCollection);
		}
		if (aqdate) {
			if (attributionStrings.length) {
				attributionStrings.push(', ');
			}
			const aqdateCollection = stringToViewCollection(aqdate, locale);
			attributionStrings.push(...aqdateCollection);
		}
		if (subsource) {
			const { source: innerSource, aqdate: innerAqdate } = subsource;

			if (innerSource) {
				if (attributionStrings.length) {
					attributionStrings.push(', ');
				}
				const innerSourceCollection = stringToViewCollection(
					innerSource,
					locale,
				);
				attributionStrings.push(...innerSourceCollection);
			}
			if (innerAqdate) {
				if (attributionStrings.length) {
					attributionStrings.push(', ');
				}
				const innerAqdateCollection = stringToViewCollection(
					innerAqdate,
					locale,
				);
				attributionStrings.push(...innerAqdateCollection);
			}
		}
		if (attributionStrings.length) {
			// prepend attribution string with an emdash
			attributionStrings.unshift('—');
		}
		this.setTemplate({
			tag: 'div',
			attributes: {
				class: ['ck', 'ck-quote-attribution'],
			},
			children: attributionStrings,
		});
	}
}
