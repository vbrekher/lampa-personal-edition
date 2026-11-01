#!/usr/bin/env node
// The personal WGT is assembled on the user's computer. No credentials are sent to CI.
import {createInterface} from 'node:readline/promises';
import {normalizeSettings,PersonalBuildError} from './lib.mjs';
import {buildPersonal} from './engine.mjs';
import {parseBuilderArgs,getBuilderLocale} from './cli.mjs';
import {strings,formatBuildError} from './i18n.mjs';

async function ask(locale,defaultLanguage) {
  if(!process.stdin.isTTY || !process.stdout.isTTY)
    throw new PersonalBuildError('NEED_TERMINAL');
  const t=strings(locale);
  const rl=createInterface({input:process.stdin,output:process.stdout});
  try{
    console.log('\n'+t.title+'\n');
    console.log(t.intro+'\n');
    const language=(await rl.question(t.interfaceLanguage.replace('{default}',defaultLanguage))).trim()||defaultLanguage;
    const torrserverUrl=(await rl.question(t.serverUrl)).trim();
    const parserType=(await rl.question(t.parserType)).trim().toLowerCase()||'jackett';
    const answer=(await rl.question(t.plugins)).trim().toLowerCase();
    return normalizeSettings({language,torrserverUrl,parserType,
      pluginsEnabled:['y','yes','j','ja','д','да'].includes(answer)});
  }finally{rl.close();}
}
const argv=process.argv.slice(2);
const fallbackLocale=getBuilderLocale(argv);
try{
  const parsed=parseBuilderArgs(argv);
  const locale=parsed.locale;
  const t=strings(locale);
  if(parsed.help) {
    console.log(t.help);
  }else{
    const settings=parsed.interactive
      ? await ask(locale,parsed.defaultLanguage)
      : parsed.settings;
    if(settings.torrserverUrl.startsWith('http://'))console.warn(t.httpWarning);
    if(settings.pluginsEnabled)console.warn(t.pluginsWarning);
    console.log(t.compiling);
    const controller=new AbortController();
    const stop=()=>controller.abort();
    process.once('SIGINT',stop);process.once('SIGTERM',stop);
    try {await buildPersonal(settings,{signal:controller.signal});}
    finally {process.removeListener('SIGINT',stop);process.removeListener('SIGTERM',stop);}
    console.log('\n'+t.ready);
    console.log(t.install);
  }
}catch(error) {
  console.error(formatBuildError(error,fallbackLocale));
  process.exitCode=1;
}
