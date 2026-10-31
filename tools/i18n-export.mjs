#!/usr/bin/env node
// Export exact untranslated strings for human translators / reviewed translation tools.
// Produces machine-readable JSON; does not overwrite or silently activate a locale.
import {TARGETS,readLanguage,reference,examine} from './i18n-audit.mjs';
const locale=process.argv[2];
if(!TARGETS.includes(locale)){
  console.error('Usage: node tools/i18n-export.mjs <nl|de|tr|en|zh|hi|es|ar|fr|bn|pt|id|ur>');
  process.exit(2);
}
const ref=reference(), en=readLanguage('en'), ru=readLanguage('ru');
const report=examine(locale);
const items=report.missing.map(key=>({
  key,
  english:en[key]??null,
  russian:ru[key]??null,
  notes:"Keep {placeholders}, #{tokens}, HTML tags, and named products unchanged."
}));
console.log(JSON.stringify({
  locale,
  generatedFor:'Lampa Personal Edition',
  referenceCount:report.required,
  translatedCount:report.translated,
  missingCount:report.missing.length,
  items
},null,2));
