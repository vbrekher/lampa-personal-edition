// Argument parsing is separate from the interactive entry point so every locale can be tested.
import {normalizeSettings,PersonalBuildError} from './lib.mjs';
import {BUILDER_LANGUAGES} from './i18n.mjs';

export function defaultAppLanguage(builderLocale) {
  return builderLocale==='ru'?'ru':'en'; // Original Lampa has no Dutch TV UI yet.
}
export function getBuilderLocale(args) {
  const index=args.indexOf('--builder-language');
  return index>=0 && BUILDER_LANGUAGES.includes(args[index+1])?args[index+1]:'en';
}
export function parseBuilderArgs(args) {
  let locale='en', language, torrserverUrl='', parserType='jackett', pluginsEnabled=false, explicit=false, help=false;
  for(let i=0;i<args.length;i++){
    const flag=args[i];
    if(flag==='--help'){help=true;continue;}
    if(!['--builder-language','--language','--torrserver','--parser','--plugins'].includes(flag))
      throw new PersonalBuildError('INVALID_ARGUMENT',flag);
    const value=args[++i];
    if(!value || value.startsWith('--'))throw new PersonalBuildError('MISSING_VALUE',flag);
    if(flag==='--builder-language'){
      if(!BUILDER_LANGUAGES.includes(value))throw new PersonalBuildError('INVALID_BUILDER_LANGUAGE');
      locale=value;
    }
    if(flag==='--language'){language=value;explicit=true;}
    if(flag==='--torrserver'){torrserverUrl=value;explicit=true;}
    if(flag==='--parser'){parserType=value;explicit=true;}
    if(flag==='--plugins'){
      if(!['on','off'].includes(value))throw new PersonalBuildError('INVALID_PLUGIN_CHOICE');
      pluginsEnabled=value==='on';explicit=true;
    }
  }
  return {locale,help,interactive:!explicit,
    defaultLanguage:defaultAppLanguage(locale),
    settings: explicit?normalizeSettings({language:language||defaultAppLanguage(locale),torrserverUrl,parserType,pluginsEnabled}):null};
}
