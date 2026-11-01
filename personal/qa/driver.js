// Reproducible UI fixtures mount production components through Lampa's public API.
// No template copies, replacement translations or simulated product screenshots.
(function(){
    var fixture = window.qaFixture;
    var L = window.Lampa;
    var translate = function(key){ return L.Lang.translate(key); };
    var movie = function(tv){
        var item = {
            id: tv ? 900002 : 900001, source: 'qa', title: 'QA-001', original_title: 'QA-001',
            overview: translate('full_notext'), tagline: '', runtime: 95, vote_average: 7.5,
            release_date: '2024-01-15', genres: [], production_countries: [], production_companies: [],
            spoken_languages: [], keywords: {results: []}, credits: {cast: [], crew: []},
            videos: {results: []}, images: {posters: [], backdrops: []},
            budget: 0, status: 'Released', adult: false, poster_path: null, backdrop_path: null, img: location.origin+'/qa/poster.svg'
        };
        if(tv){
            delete item.release_date;
            item.name = 'QA-002'; item.original_name = 'QA-002'; item.first_air_date = '2024-01-15';
            item.number_of_seasons = 1; item.number_of_episodes = 2; item.episode_run_time = [42];
            item.seasons = [{id: 11, season_number: 1, episode_count: 2, name: translate('full_season') + ' 1'}];
        }
        return item;
    };
    function later(callback,data){ setTimeout(function(){ callback(data); },20); }
    L.Api.sources.qa = {
        main: function(params,done){
            later(done,[{title:translate('title_popular_movie'),results:Array.from({length:10},function(_,n){return Object.assign(movie(n===1),{id:900001+n,title:'QA-'+String(n+1).padStart(3,'0')});})}]);
        },
        full: function(params,done){
            var tv=params.method==='tv', data={movie:movie(tv)};
            if(tv)data.episodes={name:translate('full_season')+' 1',seasons_count:1,episodes:[1,2].map(function(n){return {id:10+n,episode_number:n,season_number:1,name:translate('full_episode')+' '+n,air_date:'2024-01-15',overview:translate('full_notext'),still_path:null};})};
            later(done,data);
        },
        category: function(params,done){later(done,{page:1,total_pages:1,total_results:2,results:[movie(false),movie(true)]});},
        clear: function(){}
    };
    function settings(name){
        L.Controller.toggle('settings');
        if(name)L.Settings.create(name);
    }
    function ready(){
        var screen=fixture.screen;
        try{
            L.Api.clear();
            var activity=(screen==='movie'||screen==='series')?{component:'full',source:'qa',id:screen==='series'?900002:900001,method:screen==='series'?'tv':'movie',card:movie(screen==='series')}:{component:'main',source:'qa',page:1,title:translate('title_main')};
            L.Activity.replace(activity,true);
            function mountPanel(){
            if(screen==='settings')settings();
            else if(screen==='parser')settings('parser');
            else if(screen==='torrserver')settings('server');
            else if(screen==='subtitles'){
                settings('player');
                setTimeout(function(){
                    var item=L.Settings.render().find('[data-name="subtitles_start"]');
                    if(item.length)L.Controller.collectionFocus(item[0],L.Settings.render());
                },100);
            }
            else if(screen==='launch'){
                settings('interface');
                L.Settings.render().find('.settings-param').first().trigger('hover:enter');
            }
            else if(screen==='search')L.Search.open();
            else if(screen==='filters'){
                var filter=new L.Filter({movie:movie(false)});
                filter.onBack=function(){L.Controller.toggle('content');};
                filter.onSelect=function(){}; filter.onCheck=function(){};
                filter.set('sort',['torrent_parser_sort_by_seeders','torrent_parser_sort_by_size','torrent_parser_sort_by_date','torrent_parser_sort_by_name'].map(function(key){return {title:translate(key)};}));
                filter.show(translate('filter_sorted'),'sort');
            }
            else if(screen==='plugins')L.Extensions.show();
            else if(screen==='modal')L.Modal.open({title:translate('install_extension_rule_1'),html:L.Template.get('plugins_rules'),size:'medium',buttons:[{name:translate('extensions_install'),onSelect:function(){L.Modal.close();}},{name:translate('cancel'),onSelect:function(){L.Modal.close();}}]});
            else if(screen==='errors')L.Modal.open({title:translate('torrent_error_connect'),html:L.Template.get('torrent_error',{ip:'http://192.168.1.100:8090'}),size:'large',buttons:[{name:translate('back'),onSelect:function(){L.Modal.close();}}]});
            else if(screen==='player'){
                L.Player.play({url:location.origin+'/qa/fixture.mp4',title:'QA-VIDEO',quality:{'360p':location.origin+'/qa/fixture.mp4','720p':location.origin+'/qa/fixture-720.mp4'}});
                setTimeout(function(){L.PlayerPanel.show();},400);
            }
            setTimeout(function settle(){
                var welcome=document.querySelector('.welcome');
                if((welcome && getComputedStyle(welcome).display!=='none') || (document.fonts && document.fonts.status==='loading'))return setTimeout(settle,50);
                var selectors={settings:'.settings-folder',parser:'[data-name=parser_use]',torrserver:'[data-name=torrserver_url]',subtitles:'[data-name=subtitles_start]',launch:'.lang',search:'.main-search',filters:'.selectbox__content',plugins:'.extensions',modal:'.modal',errors:'.torrent-checklist',player:'.player'};
                var target=selectors[screen]&&document.querySelector(selectors[screen]);
                if(selectors[screen]&&(!target||!target.getBoundingClientRect().width))return document.body.setAttribute('data-qa-error','Scenario target did not open: '+screen);
                document.body.setAttribute('data-qa-ready',screen);
                document.body.setAttribute('data-qa-mode','controlled-ui-fixture');
            },1000);
            }
            function waitForContent(){
                var target=document.querySelector(screen==='movie'||screen==='series'?'.full-start-new':'.items-line');
                if(!target||!target.getBoundingClientRect().width)return setTimeout(waitForContent,50);
                setTimeout(mountPanel,100);
            }
            waitForContent();
        }catch(error){
            document.body.setAttribute('data-qa-error',String(error));
            throw error;
        }
    }
    var started=false;
    function afterStart(){
        if(started)return;
        if(fixture.screen==='launch'){
            var chooser=document.querySelector('.lang');
            if(!chooser || !chooser.getBoundingClientRect().width || (document.fonts && document.fonts.status==='loading'))return setTimeout(afterStart,50);
            started=true;document.body.setAttribute('data-qa-ready','launch');document.body.setAttribute('data-qa-mode','controlled-first-launch-fixture');return;
        }
        var welcome=document.querySelector('.welcome');
        if(!window.appready||!window.show_app||!L.Activity.active()||(welcome&&getComputedStyle(welcome).display!=='none'))return setTimeout(afterStart,50);
        started=true;ready();
    }
    afterStart();
})();
