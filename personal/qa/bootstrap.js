// Only the isolated QA server injects this file. It is never packaged in a WGT.
(function(){
    var query = new URLSearchParams(location.search);
    var locale = query.get('locale') || localStorage.getItem('language') || 'en';
    localStorage.setItem('language', locale);
    localStorage.setItem('parser_use', 'true');
    localStorage.setItem('player', 'inner');
    localStorage.setItem('player_timecode', 'again');
    localStorage.setItem('screensaver', 'false');
    localStorage.setItem('animation', 'false');
    window.lampa_settings = window.lampa_settings || {};
    window.lampa_settings.mirrors = false;
    // Test UI states use local fixtures, never executable third-party plugins.
    window.lampa_settings.plugins_use = false;
    window.lampa_settings.account_use = false;
    window.lampa_settings.socket_use = false;
    if(query.get('screen') === 'launch')localStorage.setItem('lampa_personal_language_pending','true');
    else localStorage.removeItem('lampa_personal_language_pending');
    window.qaFixture = {locale: locale, screen: query.get('screen') || 'home', mode: 'controlled-ui-fixture'};
})();
