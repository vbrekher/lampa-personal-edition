// Lampa Personal Edition — independently packaged Tizen application.
// This file is original integration code; upstream Lampa remains attributed separately.
import {cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync, lstatSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {resolve, join, dirname} from 'node:path';

export const ID = Object.freeze({app:'L4mpaPers0.LampaPersonal', pkg:'L4mpaPers0', version:'0.1.0'});
export class PersonalBuildError extends Error {
  constructor(code,detail='') {
    super(code);
    this.name='PersonalBuildError';
    this.code=code;
    this.detail=detail;
  }
}

export const LANGUAGES = Object.freeze(['ur','ar','id','bn','hi','tr','de','nl','ru','en','uk','be','zh','pt','bg','he','cs','ro','fr','pl','es']);

export function normalizeServerUrl(raw, optional=true) {
  const value=String(raw??'').trim();
  if(!value && optional)return '';
  if(!value || /\s/.test(value))throw new PersonalBuildError('INVALID_URL');
  let u;
  try {u=new URL(value);} catch {throw new PersonalBuildError('INVALID_URL_FORMAT');}
  if(!['http:','https:'].includes(u.protocol) || !u.hostname || u.username || u.password || u.search || u.hash)
    throw new PersonalBuildError('URL_WITH_SECRET');
  return u.href.replace(/\/+$/,'');
}
export function normalizeSettings(input={}) {
  const language=String(input.language||'ru').trim().toLowerCase();
  if(!LANGUAGES.includes(language))throw new PersonalBuildError('UNSUPPORTED_APP_LANGUAGE',language);
  const parserType=String(input.parserType||'jackett').trim().toLowerCase();
  if(!['jackett','prowlarr','torrserver'].includes(parserType))throw new PersonalBuildError('INVALID_PARSER_TYPE',parserType);
  return {language,torrserverUrl:normalizeServerUrl(input.torrserverUrl),parserType,pluginsEnabled:input.pluginsEnabled===true};
}
export function configScript(input={}) {
  const json=JSON.stringify(normalizeSettings(input)).replace(/</g,'\\u003c').replace(/>/g,'\\u003e')
    .replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
  return [
    '/* Generated locally for Lampa Personal Edition. No passwords or tokens. */',
    '(function(){',
    '  "use strict";',
    '  var cfg='+json+';',
    '  window.lampa_personal_mode=true;',
    '  window.lampa_settings=window.lampa_settings||{};',
    '  var s=window.lampa_settings;',
    '  s.socket_use=false; s.account_use=false; s.account_sync=false;',
    '  // Keep the plugin catalogue visible, but never auto-run third-party code without opt-in.',
    '  s.plugins_use=cfg.pluginsEnabled || localStorage.getItem("lampa_personal_plugins_opt_in")==="true";',
    '  s.plugins_store=false;',
    '  // Parser and TorrServer settings stay visible even with no configured server.',
    '  s.torrents_use=true;',
    '  s.disable_features=s.disable_features||{};',
    '  s.disable_features.remote_configuration=true;',
    '  // Seed on first install or when builder inputs change; do not erase TV-side edits at each launch.',
    '  var seed=JSON.stringify({language:cfg.language,torrserverUrl:cfg.torrserverUrl,parserType:cfg.parserType});',
    '  if(!localStorage.getItem("lampa_personal_seed_v2") && !localStorage.getItem("language")) localStorage.setItem("lampa_personal_language_pending","true");',
    '  var previous=null;',
    '  try { previous=JSON.parse(localStorage.getItem("lampa_personal_seed_v2")); } catch(ignore) {}',
    '  if(localStorage.getItem("lampa_personal_seed_v2")!==seed){',
    '    if(!previous || previous.language!==cfg.language) localStorage.setItem("language",cfg.language);',
    '    if(!localStorage.getItem("tmdb_lang")) localStorage.setItem("tmdb_lang",cfg.language);',
    '    if(!previous || previous.torrserverUrl!==cfg.torrserverUrl){',
    '      localStorage.setItem("torrserver_url",cfg.torrserverUrl);',
    '      localStorage.setItem("torrserver_use_link","one");',
    '    }',
    '    if(!previous || previous.parserType!==cfg.parserType) localStorage.setItem("parser_torrent_type",cfg.parserType);',
    '    localStorage.setItem("lampa_personal_seed_v2",seed);',
    '  }',
    '})();',''
  ].join('\n');
}
export function localTizenHtml(original) {
  const marker='<script src="loader.js"></script>';
  if(original.split(marker).length!==2 || !original.includes('css/app.css') || !original.includes('vender/jquery/jquery.js'))
    throw new PersonalBuildError('UPSTREAM_INDEX');
  return original.replace('<title>Lampa</title>','<title>Lampa Personal Edition</title>')
    .replace('<script src="http://www.youtube.com/iframe_api"></script>',
      '<script src="https://www.youtube.com/iframe_api"></script>')
    .replace(marker,'<script src="personal-config.js"></script>\n    <script src="app.min.js"></script>');
}
export function patchedGulp(original) {
  const start=original.indexOf('function merge(done) {');
  const end=original.indexOf('\nfunction bubbleFile(',start);
  if(start<0 || end<0)throw new PersonalBuildError('UPSTREAM_GULP');
  let section=original.slice(start,end);
  if(!section.includes('    rollup({') || !section.includes('    done();'))throw new PersonalBuildError('UPSTREAM_GULP');
  section=section.replace('function merge(done) {','function merge() {')
    .replace('    rollup({','    return rollup({')
    .replace(/\n    done\(\);\n(?=\})/,'\n');
  if(section.includes('done();'))throw new PersonalBuildError('UPSTREAM_GULP_CALLBACK');
  return original.slice(0,start)+section+original.slice(end)
    +'\n// Personal Edition: non-watching, local Tizen assets.\n'
    +'exports.personal_tizen = series(merge, sass_task, lang_task, sync_tizen, uglify_task, public_tizen, index_tizen);\n';
}
export function patchedLibraries(original) {
  const needle="        return window.location.protocol == 'file:' || window.location.href.indexOf('chrome-extension') > -1 ? Manifest.github_lampa + 'vender/' + lib : './vender/' + lib";
  if(!original.includes(needle) || !original.includes('    // Плагины различные'))throw new PersonalBuildError('UPSTREAM_LIBRARIES');
  return original.replace(needle,"        if (window.lampa_personal_mode) return './vender/' + lib;\n"+needle)
    .replace('    // Плагины различные',
      "    if (window.lampa_personal_mode) {\n        Utils.putScriptOfMirrors(include,()=>{})\n        return\n    }\n\n    // Плагины различные");
}
export function patchedManifest(original) {
  const needle="get: ()=> window.lampa_settings.fix_widget ? 'http://lampa.mx/' : 'https://yumata.github.io/lampa/',";
  if(!original.includes(needle))throw new PersonalBuildError('UPSTREAM_ASSET_BASE');
  return original.replace(needle,
    "get: ()=> window.lampa_personal_mode ? './' : (window.lampa_settings.fix_widget ? 'http://lampa.mx/' : 'https://yumata.github.io/lampa/'),");
}
export function widgetManifest() {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<widget xmlns="http://www.w3.org/ns/widgets" xmlns:tizen="http://tizen.org/ns/widgets" id="https://github.com/vbrekher/lampa-personal-edition" version="'+ID.version+'" viewmodes="maximized">',
    '  <name>Lampa Personal Edition</name>',
    '  <icon src="icon.png"/>',
    '  <content src="index.html"/>',
    '  <access origin="*" subdomains="true"/>',
    '  <tizen:application id="'+ID.app+'" package="'+ID.pkg+'" required_version="5.0"/>',
    '  <tizen:profile name="tv"/>',
    '  <tizen:privilege name="http://tizen.org/privilege/internet"/>',
    '  <tizen:privilege name="http://tizen.org/privilege/tv.inputdevice"/>',
    '</widget>',''
  ].join('\n');
}
function checkAssets(folder) {
  for(const rel of ['index.html','app.min.js','css/app.css','vender/jquery/jquery.js',
    'vender/notify/notify.js','vender/keypad/keypad.js','vender/navigator/navigator.js',
    'vender/hls/hls.js','vender/dash/dash.js','vender/qrcode/qrcode.js','lang/ru.js']) {
    const file=join(folder,rel);
    if(!existsSync(file)||!statSync(file).isFile()||statSync(file).size===0)
      throw new PersonalBuildError('MISSING_ASSET',rel);
  }
}
function checkLinks(root) {
  for(const name of readdirSync(root)){
    const path=join(root,name),stat=lstatSync(path);
    if(stat.isSymbolicLink())throw new PersonalBuildError('SYMLINK_FORBIDDEN',path);
    if(stat.isDirectory())checkLinks(path);
  }
}
// Gulp 5 decodes files as UTF-8 unless copying explicitly opts out.
// Compare original binary assets byte-for-byte before packaging a releasable WGT.
export function checkBinaryAssets(source, built, prefix='') {
  for(const name of readdirSync(source)){
    const input=join(source,name),relative=prefix+name,output=join(built,name);
    if(statSync(input).isDirectory())checkBinaryAssets(input,output,relative+'/');
    else if(/\.(?:woff2?|ttf|otf|png|jpe?g|gif|webp|ico|mp4|wasm)$/i.test(name)){
      if(!existsSync(output)||!readFileSync(input).equals(readFileSync(output)))
        throw new PersonalBuildError('CORRUPT_ASSET',relative);
    }
  }
}
export function packageTizen({builtDir,outputFile,iconFile,settings}) {
  const input=resolve(builtDir),output=resolve(outputFile);
  checkAssets(input);
  if(!existsSync(iconFile))throw new PersonalBuildError('MISSING_ICON',iconFile);
  const temp=mkdtempSync(join(tmpdir(),'lampa-personal-'));
  const stage=join(temp,'package');
  try {
    cpSync(input,stage,{recursive:true,errorOnExist:true});
    const html=join(stage,'index.html');
    writeFileSync(html,localTizenHtml(readFileSync(html,'utf8')));
    rmSync(join(stage,'loader.js'),{force:true});
    writeFileSync(join(stage,'personal-config.js'),configScript(settings),{mode:0o600});
    writeFileSync(join(stage,'config.xml'),widgetManifest());
    cpSync(iconFile,join(stage,'icon.png'));
    mkdirSync(join(stage,'plugins'),{recursive:true});
    if(!existsSync(join(stage,'plugins','modification.js')))
      writeFileSync(join(stage,'plugins','modification.js'),'/* No user plugins configured */\n');
    checkLinks(stage);
    mkdirSync(dirname(output),{recursive:true});
    rmSync(output,{force:true});
    execFileSync('zip',['-q','-r',output,'.'],{cwd:stage,stdio:'pipe'});
    execFileSync('unzip',['-tq',output],{stdio:'pipe'});
    return output;
  } finally {rmSync(temp,{recursive:true,force:true});}
}
