import {test,expect} from '@playwright/test';
import {readLanguage} from '../../../tools/i18n-audit.mjs';
const states=['nl','he','de'];
test('language selection preserves bookmarks, playback state, parser, plugins and metadata language',async({page})=>{
 await page.setViewportSize({width:1920,height:1080});
 await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'||route.request().url().startsWith('data:')?route.continue():route.abort());
 await page.goto('/?locale=nl&screen=movie');
 await expect(page.locator('body')).toHaveAttribute('data-qa-ready','movie');
 await page.locator('.button--book').click();
 await expect(page.locator('.selectbox__content')).toBeInViewport();
 await page.locator('.selectbox-item').filter({hasText:readLanguage('nl').title_book}).first().click();
 await expect.poll(()=>page.evaluate(()=>localStorage.getItem('favorite'))).toContain('900001');
 await page.keyboard.press('Escape');
 // Test-owned persisted settings model independent metadata and TV-side edits.
 const own={tmdb_lang:'ja',torrserver_url:'https://qa.example:8090',parser_torrent_type:'prowlarr',plugins:'[]',file_view:JSON.stringify({'900001':{card:900001,time:125,duration:300,percent:42}})};
 await page.evaluate(values=>{for(const[k,v]of Object.entries(values))localStorage.setItem(k,v);},own);
 const before=await page.evaluate(()=>Object.fromEntries(['favorite','tmdb_lang','torrserver_url','parser_torrent_type','plugins','file_view'].map(k=>[k,localStorage.getItem(k)])));
 for(const locale of states.slice(1)){
  await page.locator('.open--settings').click();
  await page.locator('.settings-folder[data-component="interface"]').click();
  await page.locator('.settings-param[data-static="true"]').first().click();
  await expect(page.locator('.lang')).toBeVisible();
  await page.locator(`.lang__selector-item[data-code="${locale}"]`).click();
  await expect(page.locator('html')).toHaveAttribute('lang',locale);
  await expect(page.locator('body')).toHaveAttribute('data-qa-ready','home');
  const after=await page.evaluate(()=>Object.fromEntries(['favorite','tmdb_lang','torrserver_url','parser_torrent_type','plugins','file_view'].map(k=>[k,localStorage.getItem(k)])));
  expect(after).toEqual(before);
  expect(await page.evaluate(()=>localStorage.getItem('language'))).toBe(locale);
 }
});

test('first launch preselects the builder language and confirms with remote Enter',async({page})=>{
 await page.goto('/?locale=nl&screen=launch');
 await expect(page.locator('body')).toHaveAttribute('data-qa-ready','launch');
 await expect(page.locator('.lang__selector-item.focus')).toHaveAttribute('data-code','nl');
 await page.keyboard.press('ArrowDown');
 await expect(page.locator('.lang__selector-item.focus')).not.toHaveAttribute('data-code','nl');
 const selected=await page.locator('.lang__selector-item.focus').getAttribute('data-code');
 await page.keyboard.press('Enter');
 await expect(page.locator('.lang')).toHaveCount(0);
 await expect(page.locator('html')).toHaveAttribute('lang',selected);
 expect(await page.evaluate(()=>localStorage.getItem('lampa_personal_language_pending'))).toBeNull();
});
