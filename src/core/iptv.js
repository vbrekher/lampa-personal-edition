import Utils from '../utils/utils'
import Manifest from './manifest'
import Lang from './lang'
import Storage from './storage/storage'

function init(){
    if(!window.lampa_settings.iptv) return
    
    let components = ['tmdb','plugins','content_rows']
    let titles     = ['card_interfice_type']
    let params = ['light_version', 'card_interfice_type', 'card_interfice_reactions', 'player_timecode', 'pages_save_total', 'device_name', 'playlist_next', 'background_type', 'card_views_type', 'hide_outside_the_screen', 'card_interfice_cover', 'card_interfice_poster', 'start_page', 'source', 'card_quality', 'card_episodes', 'player']
    
    const code = Storage.get('language','ru')
    Lang.add({
        about_text: {[code]: Lang.translate('iptv_about_text')},
        empty_title_two: {[code]: Lang.translate('iptv_load_error_title')},
        empty_text_two: {[code]: Lang.translate('iptv_load_error_text')}
    })


    window.iptvClearSettingsFunction = function(e) {
        titles.forEach(function(t) {
            var param = $('[data-name="' + t + '"]', e.body).prev()
            if (param.length && param.hasClass('settings-param-title')) param.remove()
        })

        $(components.map(function(c) {
            return '[data-component="' + c + '"]'
        }).join(','), e.body).remove()

        $(params.map(function(c) {
            return '[data-name="' + c + '"]'
        }).join(','), e.body).remove()
    }

    window.iptvClearFunction = function() {
        $('.menu .menu__list:eq(0)').empty()
        $('.head .open--notice, .head .open--search, .head .open--feed, .head .open--premium').addClass('hide')

        window.iptvClearFunction = function() {}
    }

    setTimeout(()=>{
        window.iptvClearFunction()
    },10)

    Lampa.Settings.listener.follow('open', window.iptvClearSettingsFunction)

    Utils.putScriptOfMirrors([Utils.protocol() + Manifest.cub_domain + '/plugin/iptv'], function () {
        console.log('IPTV', 'load from lampa','complite')
    }, function () {
        console.log('IPTV', 'load from lampa','error')
    }, function () {
        console.log('IPTV', 'load from lampa','success')
    }, false)
}

export default {
    init
}