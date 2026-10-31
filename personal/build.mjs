#!/usr/bin/env node
// The personal WGT is assembled on the user's computer. No credentials are sent to CI.
import {createInterface} from 'node:readline/promises';
import {cpSync,existsSync,mkdtempSync,readFileSync,rmSync,symlinkSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {normalizeSettings,packageTizen,patchedGulp,patchedLibraries,patchedManifest,PersonalBuildError} from './lib.mjs';
import {parseBuilderArgs,getBuilderLocale} from './cli.mjs';
import {strings,formatBuildError} from './i18n.mjs';

const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
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
    const answer=(await rl.question(t.plugins)).trim().toLowerCase();
    return normalizeSettings({language,torrserverUrl,
      pluginsEnabled:['y','yes','j','ja','д','да'].includes(answer)});
  }finally{rl.close();}
}
function compile(settings,locale) {
  const t=strings(locale);
  for(const path of ['src','public','index','gulpfile.js','node_modules/.bin/gulp']){
    if(!existsSync(join(ROOT,path)))throw new PersonalBuildError('MISSING_DEPENDENCY',path);
  }
  const temp=mkdtempSync(join(tmpdir(),'lampa-personal-build-'));
  try{
    for(const name of ['src','public','index'])cpSync(join(ROOT,name),join(temp,name),{recursive:true});
    symlinkSync(join(ROOT,'node_modules'),join(temp,'node_modules'),'dir');
    const libs=join(temp,'src/services/libs.js');
    writeFileSync(libs,patchedLibraries(readFileSync(libs,'utf8')));
    const manifest=join(temp,'src/core/manifest.js');
    writeFileSync(manifest,patchedManifest(readFileSync(manifest,'utf8')));
    writeFileSync(join(temp,'gulpfile.js'),patchedGulp(readFileSync(join(ROOT,'gulpfile.js'),'utf8')));
    console.log(t.compiling);
    execFileSync(join(ROOT,'node_modules/.bin/gulp'),['personal_tizen'],{cwd:temp,stdio:'inherit'});
    packageTizen({builtDir:join(temp,'build/tizen'),
      outputFile:join(ROOT,'dist/Lampa-Personal-Edition.wgt'),
      iconFile:join(ROOT,'personal/assets/icon.png'),settings});
  }finally{rmSync(temp,{recursive:true,force:true});}
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
    compile(settings,locale);
    console.log('\n'+t.ready);
    console.log(t.install);
  }
}catch(error) {
  console.error(formatBuildError(error,fallbackLocale));
  process.exitCode=1;
}
