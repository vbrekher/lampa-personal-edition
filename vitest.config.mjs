import {defineConfig} from 'vitest/config';
// Node unit suites and Playwright browser suites have separate runners.
export default defineConfig({test:{include:['spec/**/*.spec.js']}});
