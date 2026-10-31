// Lampa Personal Edition — terminal UI messages only.
// Upstream Lampa TV interface languages are independent from the builder language.
export const BUILDER_LANGUAGES = Object.freeze(['en', 'ru', 'nl']);
const messages = {
  en: {
    title: 'Lampa Personal Edition — local Samsung Tizen build',
    intro: 'Lampa hosting is not required. The builder does not ask for passwords.',
    interfaceLanguage: 'Lampa interface language [ru/en/uk/fr/es/pl] (Enter={default}): ',
    serverUrl: 'TorrServer URL (optional; Enter to skip): ',
    parserType: 'Parser backend [jackett/prowlarr/torrserver] (Enter=jackett): ',
    plugins: 'Enable third-party plugins? [y/N]: ',
    compiling: 'Building Lampa assets locally...',
    ready: 'Ready: dist/Lampa-Personal-Edition.wgt',
    install: 'Install using Apps2Samsung > Custom WGT. Do not share personal packages.',
    httpWarning: 'HTTP is not encrypted. Use it only on a trusted home network.',
    pluginsWarning: 'Warning: third-party plugins can run remote JavaScript.',
    help: 'Usage: npm run build:personal [-- --builder-language en|ru|nl --language en --torrserver https://host:8090 --parser jackett --plugins off]\nWithout app settings the builder asks questions in your terminal.\n--builder-language changes terminal messages only; --language selects the TV interface language.',
    errorPrefix: 'Build failed',
    errors: {
      INVALID_ARGUMENT: 'Unknown option: {detail}. See --help.',
      MISSING_VALUE: 'Missing value for {detail}. See --help.',
      INVALID_PLUGIN_CHOICE: 'Plugin mode must be on or off.',
      INVALID_PARSER_TYPE: 'Parser backend must be jackett, prowlarr or torrserver.',
      INVALID_BUILDER_LANGUAGE: 'Builder language must be en, ru or nl.',
      NEED_TERMINAL: 'Interactive setup requires a terminal. Supply app options or open Terminal.',
      MISSING_DEPENDENCY: 'Missing {detail}. Run npm install first.',
      INVALID_URL: 'Enter an HTTP(S) URL without spaces.',
      INVALID_URL_FORMAT: 'Invalid URL: include http:// or https://.',
      URL_WITH_SECRET: 'Only HTTP(S) URLs without usernames, passwords, query strings or fragments are allowed.',
      UNSUPPORTED_APP_LANGUAGE: 'The Lampa TV interface does not support language: {detail}.',
      UPSTREAM_INDEX: 'The upstream Tizen index has changed. Update the adapter before building.',
      UPSTREAM_GULP: 'The upstream Gulp build has changed. Update the adapter before building.',
      UPSTREAM_GULP_CALLBACK: 'The Gulp callback patch could not be applied.',
      UPSTREAM_LIBRARIES: 'The upstream library loader has changed. Update the adapter.',
      UPSTREAM_ASSET_BASE: 'The upstream asset base has changed. Update the adapter.',
      MISSING_ASSET: 'The build is incomplete; missing asset: {detail}.',
      SYMLINK_FORBIDDEN: 'Symbolic links are forbidden in the WGT package: {detail}.',
      UPSTREAM_BUILD_FAILED: 'Upstream Lampa compilation failed. See the local diagnostic log at dist/build-error.log.',
      MISSING_ICON: 'App icon not found: {detail}.'
    }
  },
  ru: {
    title: 'Lampa Personal Edition — локальная сборка для Samsung Tizen',
    intro: 'Хостинг Lampa не требуется. Сборщик не спрашивает пароли.',
    interfaceLanguage: 'Язык интерфейса Lampa [ru/en/uk/fr/es/pl] (Enter={default}): ',
    serverUrl: 'Адрес TorrServer (необязательно; Enter — пропустить): ',
    parserType: 'Тип парсера [jackett/prowlarr/torrserver] (Enter=jackett): ',
    plugins: 'Разрешить сторонние плагины? [д/Н]: ',
    compiling: 'Собираем Lampa из локальных исходников...',
    ready: 'Готово: dist/Lampa-Personal-Edition.wgt',
    install: 'Установи через Apps2Samsung > Custom WGT. Не передавай другим персональный пакет.',
    httpWarning: 'HTTP не шифрует трафик. Используй его только в доверенной домашней сети.',
    pluginsWarning: 'Внимание: сторонние плагины могут исполнять удалённый JavaScript.',
    help: 'Использование: npm run build:personal [-- --builder-language ru --language ru --torrserver https://host:8090 --parser jackett --plugins off]\nБез настроек приложения сборщик задаёт вопросы в терминале.\n--builder-language меняет язык вопросов, --language — язык Lampa на телевизоре.',
    errorPrefix: 'Ошибка сборки',
    errors: {
      INVALID_ARGUMENT: 'Неизвестный параметр: {detail}. См. --help.',
      MISSING_VALUE: 'Не указано значение для {detail}. См. --help.',
      INVALID_PLUGIN_CHOICE: 'Для плагинов укажи on или off.',
      INVALID_PARSER_TYPE: 'Тип парсера должен быть jackett, prowlarr или torrserver.',
      INVALID_BUILDER_LANGUAGE: 'Язык сборщика должен быть en, ru или nl.',
      NEED_TERMINAL: 'Для диалога нужен обычный терминал. Укажи параметры или открой Terminal.',
      MISSING_DEPENDENCY: 'Отсутствует {detail}. Сначала выполни npm install.',
      INVALID_URL: 'Укажи полный HTTP(S) URL без пробелов.',
      INVALID_URL_FORMAT: 'Некорректный URL: укажи http:// или https://.',
      URL_WITH_SECRET: 'Допустим только HTTP(S) URL без логина, пароля, параметров запроса и фрагмента.',
      UNSUPPORTED_APP_LANGUAGE: 'Lampa на телевизоре не поддерживает язык: {detail}.',
      UPSTREAM_INDEX: 'Исходный Tizen index изменился. Требуется обновить адаптер.',
      UPSTREAM_GULP: 'Исходная сборка Gulp изменилась. Требуется обновить адаптер.',
      UPSTREAM_GULP_CALLBACK: 'Не удалось применить исправление Gulp.',
      UPSTREAM_LIBRARIES: 'Исходный загрузчик библиотек изменился. Обнови адаптер.',
      UPSTREAM_ASSET_BASE: 'Исходный путь ресурсов изменился. Обнови адаптер.',
      MISSING_ASSET: 'Сборка неполная. Отсутствует файл: {detail}.',
      SYMLINK_FORBIDDEN: 'Символические ссылки внутри WGT запрещены: {detail}.',
      UPSTREAM_BUILD_FAILED: 'Сборка исходной Lampa завершилась ошибкой. Подробный журнал сохранён в dist/build-error.log.',
      MISSING_ICON: 'Не найдена иконка приложения: {detail}.'
    }
  },
  nl: {
    title: 'Lampa Personal Edition — lokaal bouwen voor Samsung Tizen',
    intro: 'Je hoeft Lampa niet zelf te hosten. De bouwer vraagt niet om wachtwoorden.',
    interfaceLanguage: 'Taal van Lampa op de tv [ru/en/uk/fr/es/pl] (Enter={default}): ',
    serverUrl: 'TorrServer-adres (optioneel; Enter om over te slaan): ',
    parserType: 'Parser-type [jackett/prowlarr/torrserver] (Enter=jackett): ',
    plugins: 'Externe plug-ins inschakelen? [j/N]: ',
    compiling: 'Lampa wordt lokaal opgebouwd...',
    ready: 'Klaar: dist/Lampa-Personal-Edition.wgt',
    install: 'Installeer via Apps2Samsung > Custom WGT. Deel je persoonlijke pakket niet.',
    httpWarning: 'HTTP is niet versleuteld. Gebruik het alleen op een vertrouwd thuisnetwerk.',
    pluginsWarning: 'Waarschuwing: externe plug-ins kunnen JavaScript van derden uitvoeren.',
    help: 'Gebruik: npm run build:personal [-- --builder-language nl --language en --torrserver https://host:8090 --parser jackett --plugins off]\nZonder app-instellingen stelt de bouwer vragen in de terminal.\n--builder-language kiest de taal van de vragen; --language kiest de taal van Lampa op de tv.',
    errorPrefix: 'Bouwen mislukt',
    errors: {
      INVALID_ARGUMENT: 'Onbekende optie: {detail}. Zie --help.',
      MISSING_VALUE: 'Waarde ontbreekt voor {detail}. Zie --help.',
      INVALID_PLUGIN_CHOICE: 'Gebruik on of off voor plug-ins.',
      INVALID_PARSER_TYPE: 'Parser-type moet jackett, prowlarr of torrserver zijn.',
      INVALID_BUILDER_LANGUAGE: 'De taal van de bouwer moet en, ru of nl zijn.',
      NEED_TERMINAL: 'Voor interactief bouwen is een terminal nodig. Geef app-opties op of open Terminal.',
      MISSING_DEPENDENCY: '{detail} ontbreekt. Voer eerst npm install uit.',
      INVALID_URL: 'Voer een volledige HTTP(S)-URL zonder spaties in.',
      INVALID_URL_FORMAT: 'Ongeldige URL: gebruik http:// of https://.',
      URL_WITH_SECRET: 'Alleen HTTP(S)-URL’s zonder gebruikersnaam, wachtwoord, queryparameters of fragment zijn toegestaan.',
      UNSUPPORTED_APP_LANGUAGE: 'Lampa op de tv ondersteunt deze taal niet: {detail}.',
      UPSTREAM_INDEX: 'De oorspronkelijke Tizen-index is veranderd. Werk de adapter bij.',
      UPSTREAM_GULP: 'De oorspronkelijke Gulp-build is veranderd. Werk de adapter bij.',
      UPSTREAM_GULP_CALLBACK: 'De Gulp-callbackaanpassing is mislukt.',
      UPSTREAM_LIBRARIES: 'De oorspronkelijke bibliotheeklader is veranderd. Werk de adapter bij.',
      UPSTREAM_ASSET_BASE: 'Het oorspronkelijke pad naar appbestanden is veranderd. Werk de adapter bij.',
      MISSING_ASSET: 'De build is niet compleet. Bestand ontbreekt: {detail}.',
      SYMLINK_FORBIDDEN: 'Symbolische koppelingen in het WGT-pakket zijn niet toegestaan: {detail}.',
      UPSTREAM_BUILD_FAILED: 'Het bouwen van de oorspronkelijke Lampa is mislukt. Het lokale logbestand staat in dist/build-error.log.',
      MISSING_ICON: 'Het app-pictogram ontbreekt: {detail}.'
    }
  }
};
export const CATALOG = Object.freeze(messages);
export function builderLanguage(code='en') {
  return BUILDER_LANGUAGES.includes(code) ? code : 'en';
}
export function strings(code='en') {
  return CATALOG[builderLanguage(code)];
}
export function formatMessage(value,detail) {
  return value.replace(/\{detail\}/g,()=>String(detail??''));
}
export function formatBuildError(error,locale='en') {
  const c=strings(locale);
  return c.errorPrefix+': '+(error?.code&&c.errors[error.code]?
    formatMessage(c.errors[error.code],error.detail):String(error?.message||error));
}
