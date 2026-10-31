// Lampa Personal Edition — independently packaged Tizen application.
// This file is original integration code; upstream Lampa remains attributed separately.
import {cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync, lstatSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {resolve, join, dirname} from 'node:path';

export const ID = Object.freeze({app:'L4mpaPers0.LampaPersonal', pkg:'L4mpaPers0', version:'0.1.0'});
export const LANGUAGES = Object.freeze(['ru','en','uk','be','zh','pt','bg','he','cs','ro','fr','pl','es']);

export function normalizeServerUrl(raw, optional=true) {
  const value=String(raw??'').trim();
  if(!value && optional)return '';
  if(!value || /\s/.test(value))throw Error('Введите полный HTTP(S) URL без пробелов');
  let u;
  try {u=new URL(value);} catch {throw Error('Некорректный URL: укажи http:// или https://');}
  if(!['http:','https:'].includes(u.protocol) || !u.hostname || u.username || u.password || u.search || u.hash)
    throw Error('Разрешён HTTP(S) URL без пароля, query и #fragment');
  return u.href.replace(/\/+$/,'');
}
export function normalizeSettings(input={}) {
  const language=String(input.language||'ru').trim().toLowerCase();
  if(!LANGUAGES.includes(language))throw Error('Этот язык отсутствует в текущей Lampa: '+language);
  return {language,torrserverUrl:normalizeServerUrl(input.torrserverUrl),pluginsEnabled:input.pluginsEnabled===true};
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
    '  s.plugins_use=cfg.pluginsEnabled; s.plugins_store=false;',
    '  s.torrents_use=!!cfg.torrserverUrl;',
    '  s.disable_features=s.disable_features||{};',
    '  s.disable_features.remote_configuration=true;',
    '  localStorage.setItem("language",cfg.language);',
    '  localStorage.setItem("tmdb_lang",cfg.language);',
    '  if(cfg.torrserverUrl){',
    '    localStorage.setItem("torrserver_url",cfg.torrserverUrl);',
    '    localStorage.setItem("torrserver_use_link","one");',
    '  }',
    '})();',''
  ].join('\n');
}
export function localTizenHtml(original) {
  const marker='<script src="loader.js"></script>';
  if(original.split(marker).length!==2 || !original.includes('css/app.css') || !original.includes('vender/jquery/jquery.js'))
    throw Error('Upstream Tizen index изменился: требуется обновление адаптера');
  return original.replace('<title>Lampa</title>','<title>Lampa Personal Edition</title>')
    .replace('<script src="http://www.youtube.com/iframe_api"></script>',
      '<script src="https://www.youtube.com/iframe_api"></script>')
    .replace(marker,'<script src="personal-config.js"></script>\n    <script src="app.min.js"></script>');
}
export function patchedGulp(original) {
  const start=original.indexOf('function merge(done) {');
  const end=original.indexOf('\nfunction bubbleFile(',start);
  if(start<0 || end<0)throw Error('Upstream gulpfile изменился');
  let section=original.slice(start,end);
  if(!section.includes('    rollup({') || !section.includes('    done();'))throw Error('Unknown Gulp merge implementation');
  section=section.replace('function merge(done) {','function merge() {')
    .replace('    rollup({','    return rollup({')
    .replace(/\n    done\(\);\n(?=\})/,'\n');
  if(section.includes('done();'))throw Error('Gulp callback patch не удался');
  return original.slice(0,start)+section+original.slice(end)
    +'\n// Personal Edition: non-watching, local Tizen assets.\n'
    +'exports.personal_tizen = series(merge, sass_task, lang_task, sync_tizen, uglify_task, public_tizen, index_tizen);\n';
}
export function patchedLibraries(original) {
  const needle="        return window.location.protocol == 'file:' || window.location.href.indexOf('chrome-extension') > -1 ? Manifest.github_lampa + 'vender/' + lib : './vender/' + lib";
  if(!original.includes(needle) || !original.includes('    // Плагины различные'))throw Error('Upstream libraries изменились');
  return original.replace(needle,"        if (window.lampa_personal_mode) return './vender/' + lib;\n"+needle)
    .replace('    // Плагины различные',
      "    if (window.lampa_personal_mode) {\n        Utils.putScriptOfMirrors(include,()=>{})\n        return\n    }\n\n    // Плагины различные");
}
export function patchedManifest(original) {
  const needle="get: ()=> window.lampa_settings.fix_widget ? 'http://lampa.mx/' : 'https://yumata.github.io/lampa/',";
  if(!original.includes(needle))throw Error('Upstream asset-base изменился');
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
      throw Error('Сборка неполная, отсутствует '+rel);
  }
}
function checkLinks(root) {
  for(const name of readdirSync(root)){
    const path=join(root,name),stat=lstatSync(path);
    if(stat.isSymbolicLink())throw Error('Symlinks запрещены внутри WGT: '+path);
    if(stat.isDirectory())checkLinks(path);
  }
}
export function packageTizen({builtDir,outputFile,iconFile,settings}) {
  const input=resolve(builtDir),output=resolve(outputFile);
  checkAssets(input);
  if(!existsSync(iconFile))throw Error('Нет иконки: '+iconFile);
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
