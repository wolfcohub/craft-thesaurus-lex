/**
 * @license Copyright (c) 2023-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { defineConfig } from 'vitest/config';
import svg from 'vite-plugin-svgo';

export default defineConfig({
	plugins: [svg()],
	test: {
		browser: {
			enabled: true,
			provider: 'webdriverio',
			instances: [
				{
					browser: 'chromium',
				},
			],
			headless: true,
			ui: false,
		},
		include: ['tests/**/*.[jt]s'],
		globals: true,
		watch: false,
		coverage: {
			thresholds: {
				lines: 100,
				functions: 100,
				branches: 100,
				statements: 100,
			},
			provider: 'istanbul',
			include: ['src'],
		},
	},
});
