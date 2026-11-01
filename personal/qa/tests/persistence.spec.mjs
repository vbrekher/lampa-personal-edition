import {test,expect} from '@playwright/test';
import {readLanguage} from '../../../tools/i18n-audit.mjs';
const states=['nl','de','tr','en','zh','hi','es','ar','fr','bn','pt','id','ur','ru','uk','be','bg','cs','he','pl','ro'];
test('language selection preserves bookmarks, playback state, parser, plugins and metadata language',async({page})=>{
 test.setTimeout(360000);
 await page.setViewportSize({width:1920,height:1080});
 await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'||route.request().url().startsWith('data:')?route.continue():route.abort());
 await page.goto('/?locale=nl&screen=movie');
 await expect(page.locator('body')).toHaveAttribute('data-qa-ready','movie');
 await page.locator('.button--book').click();
 await expect(page.locator('.selectbox__content')).toBeInViewport();
 await expect(page.locator('.selectbox-item.focus')).toContainText(readLanguage('nl').title_book);
 await page.keyboard.press('Enter',{delay:120});
 await expect.poll(()=>page.evaluate(()=>localStorage.getItem('favorite'))).toContain('900001');
 await page.keyboard.press('Escape');
 // Test-owned persisted settings model independent metadata and TV-side edits.
 const own={tmdb_lang:'ja',torrserver_url:'https://qa.example:8090',parser_torrent_type:'prowlarr',plugins:'[]',file_view:JSON.stringify({'900001':{card:900001,time:125,duration:300,percent:42}})};
 await page.evaluate(values=>{for(const[k,v]of Object.entries(values))localStorage.setItem(k,v);},own);
 const before=await page.evaluate(()=>Object.fromEntries(['favorite','tmdb_lang','torrserver_url','parser_torrent_type','plugins','file_view'].map(k=>[k,localStorage.getItem(k)])));
 for(const locale of states.slice(1)){
  const selectedBefore=await page.locator('html').getAttribute('lang');
  // Mount the production settings fixture; language selection itself uses real remote keys.
  await page.goto(`/?locale=${selectedBefore}&screen=settings`);
  await expect(page.locator('body')).toHaveAttribute('data-qa-ready','settings');
  await expect(page.locator('.settings-folder.focus')).toHaveAttribute('data-component','interface');
  await page.keyboard.press('Enter',{delay:120});
  await expect(page.locator('.settings-param.focus')).toHaveAttribute('data-static','true');
  await page.keyboard.press('Enter',{delay:120});
  await expect(page.locator('.lang')).toBeVisible();
  const codes=await page.locator('.lang__selector-item').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('data-code')));
  const current=await page.locator('.lang__selector-item.focus').getAttribute('data-code');
  const delta=codes.indexOf(locale)-codes.indexOf(current);
  for(let n=0;n<Math.abs(delta);n++)await page.keyboard.press(delta>0?'ArrowDown':'ArrowUp',{delay:120});
  await expect(page.locator('.lang__selector-item.focus')).toHaveAttribute('data-code',locale);
  await page.keyboard.press('Enter',{delay:120});
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
 await page.keyboard.press('Enter',{delay:120});
 await expect(page.locator('.lang')).toHaveCount(0);
 await expect(page.locator('html')).toHaveAttribute('lang',selected);
 expect(await page.evaluate(()=>localStorage.getItem('lampa_personal_language_pending'))).toBeNull();
});
