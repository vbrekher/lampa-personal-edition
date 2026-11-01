import Storage from './storage/storage'
import Direction from '../utils/direction'
import Arrays from '../utils/arrays'
import Manifest from './manifest'
import Utils from '../utils/utils'

import meta from '../lang/meta'
import ru from '../lang/ru'
import en from '../lang/en'

let langs = {}
let keys  = {}

let lang_default = 'ru'

Object.defineProperty(langs, 'ru', { get: ()=> ru })
Object.defineProperty(langs, 'en', { get: ()=> en })

for(let code in meta.languages){
    keys[code] = meta.languages[code].name

    if(!langs[code]) langs[code] = {}

    langs[code].lang_choice_title    = meta.languages[code].lang_choice_title
    langs[code].lang_choice_subtitle = meta.languages[code].lang_choice_subtitle
    if(meta.languages[code].loading) langs[code].loading = meta.languages[code].loading
    if(meta.languages[code].preparing) langs[code].loading_progress_step_0 = meta.languages[code].preparing
    if(meta.languages[code].loading_languages) langs[code].loading_progress_step_1 = meta.languages[code].loading_languages
}

/**
 * Перевести
 * @param {string} name 
 * @param {string} custom_code - ru/en/uk...
 * @returns 
 */
function translate(name, custom_code){
    name = name + ''

    let code = custom_code || Storage.get('language','ru')
    let result = ''

    if(!langs[code]) code = lang_default

    // Personal Edition must not unexpectedly show Russian fallback text to
    // users of another locale. This is a fallback, not a replacement for a complete translation.
    let fallback = window.lampa_personal_mode && code !== 'ru' ? 'en' : lang_default

    if(name.indexOf('#{') >= 0){
        result = name.replace(/#{([a-z_0-9-]+)}/g, function(e,s){
            return langs[code][s] || langs[fallback][s] || langs[lang_default][s] || s
        })
    }
    else{
        result = langs[code][name] || langs[fallback][name] || langs[lang_default][name] || name
    }

    result = result.replace(/{site}/g, Manifest.cub_site)
    result = result.replace(/{mirror}/g, Utils.protocol() + Manifest.cub_domain)

    return result
}

/** Translate an owned dynamic key without exposing an unknown identifier to the UI. */
function known(name, fallback = 'network_error'){
    const code = Storage.get('language','ru')
    const exists = [langs[code],langs.en,langs.ru].some(table=>table && typeof table[name] === 'string')
    return translate(exists ? name : fallback)
}

/**
 * Добавить переводы
 * @param {{key_name:{en:string,ru:string}}} data 
 */
function add(data){
    for(let name in data){
        for(let code in data[name]){
            if(langs[code]){
                langs[code][name] = data[name][code]
            }
        }
    }
}

/**
 * Добавить перевод для кода
 * @param {string} code 
 * @param {{key1:string,key2:string}} data 
 */
function AddTranslation(code, data){
    if(!langs[code]) langs[code] = {}

    for(let name in data){
        langs[code][name] = data[name]
    }
}

/**
 * Добавить коды
 * @param {{code_name:string}} new_codes 
 */
function addCodes(new_codes){
    for(let i in new_codes){
        keys[i]  = new_codes[i]
        langs[i] = {}
    }
}

/**
 * Получить список кодов
 * @returns {{ru:string,en:string}}
 */
function codes(){
    return Arrays.clone(keys)
}

function selected(check_codes){
    return check_codes.indexOf(Storage.get('language','ru')) >= 0 ? true : false
}

export default {
    translate,
    known,
    add,
    codes,
    addCodes,
    AddTranslation,
    selected,
    isRTL: Direction.isRTL
}
