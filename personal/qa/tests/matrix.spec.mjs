import {test,expect} from '@playwright/test';
import {mkdirSync} from 'node:fs';
import {TARGETS,readLanguage} from '../../../tools/i18n-audit.mjs';
const locales=process.env.QA_LOCALES?.split(',')||TARGETS;
const screens={launch:'.lang',home:'.items-line',movie:'.full-start-new',series:'.full-start-new',search:'.main-search',filters:'.selectbox__content',settings:'.settings-folder',parser:'[data-name="parser_use"]',torrserver:'[data-name="torrserver_url"]',player:'.player',subtitles:'[data-name="subtitles_start"]',plugins:'.extensions',modal:'.modal',errors:'.torrent-checklist'};
for(const locale of locales)for(const [scene,selector]of Object.entries(screens))for(const [width,height]of [[1920,1080],[3840,2160]]){
 test(`${locale} ${scene} ${width}x${height}`,async({page},info)=>{
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.setViewportSize({width,height});
  // External catalog/account endpoints are deliberately outside these fixture tests.
  await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'||route.request().url().startsWith('data:')?route.continue():route.abort());
  await page.goto(`/?locale=${locale}&screen=${scene}`);
  await expect(page.locator('body')).toHaveAttribute('data-qa-ready',scene);
  await expect(page.locator('body')).not.toHaveAttribute('data-qa-error',/.+/);
  const target=page.locator(selector).first();await expect(target).toBeInViewport();
  await page.evaluate(()=>document.fonts.ready);
  const expectedDir=['ar','ur','he'].includes(locale)?'rtl':'ltr';
  await expect(page.locator('html')).toHaveAttribute('lang',locale);
  await expect(page.locator('html')).toHaveAttribute('dir',expectedDir);
  const audit=await page.evaluate(()=>{
   const shown=e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width&&r.height&&r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth&&s.display!=='none'&&s.visibility!=='hidden';};
   const labels=Array.from(document.querySelectorAll('.settings-param__name,.settings-param__descr,.settings-folder__name,.modal__button,.simple-button,.full-start__button')).filter(shown);
   return {viewport:[innerWidth,innerHeight],overflow:labels.filter(e=>e.scrollWidth>e.clientWidth+2).map(e=>e.textContent),unresolved:(document.body.innerText.match(/#\{[^}]+\}/g)||[]),text:document.body.innerText,fonts:Array.from(document.fonts).filter(f=>/Noto/.test(f.family)).map(f=>({family:f.family,status:f.status})),technical:Array.from(document.querySelectorAll('bdi.technical-ltr')).filter(shown).map(e=>({text:e.textContent,dir:getComputedStyle(e).direction}))};
  });
  expect(audit.viewport).toEqual([width,height]);expect(audit.overflow).toEqual([]);expect(audit.unresolved).toEqual([]);expect(errors).toEqual([]);
  if(['hi','bn','ar','ur','he'].includes(locale))expect(audit.fonts.some(f=>f.status==='loaded')).toBeTruthy();
  if(expectedDir==='rtl')expect(audit.technical.every(e=>e.dir==='ltr')).toBeTruthy();
  if(scene==='movie'||scene==='series')expect(audit.text).toContain(readLanguage(locale).full_notext);
  if(scene==='player')await expect.poll(()=>page.locator('video').first().evaluate(v=>v.readyState)).toBeGreaterThanOrEqual(2);
  mkdirSync('reports/ui-screenshots',{recursive:true});
  const path=`reports/ui-screenshots/${locale}-${scene}-${width}x${height}.png`;
  await page.screenshot({path,animations:'disabled'});
  await info.attach('screenshot',{path,contentType:'image/png'});
  await info.attach('assertions',{body:JSON.stringify(audit,null,2),contentType:'application/json'});
 });
}
