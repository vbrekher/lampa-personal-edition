// Only the isolated QA server injects this file. It is never packaged in a WGT.
(function(){
    var query = new URLSearchParams(location.search);
    var locale = query.get('locale') || 'en';
    localStorage.setItem('language', locale);
    localStorage.setItem('parser_use', 'true');
    localStorage.setItem('player', 'inner');
    localStorage.setItem('player_timecode', 'again');
    localStorage.setItem('screensaver', 'false');
    window.lampa_settings = window.lampa_settings || {};
    window.lampa_settings.mirrors = false;
    // Test UI states use local fixtures, never executable third-party plugins.
    window.lampa_settings.plugins_use = false;
    window.lampa_settings.account_use = false;
    window.lampa_settings.socket_use = false;
    window.qaFixture = {locale: locale, screen: query.get('screen') || 'home', mode: 'controlled-ui-fixture'};
})();
