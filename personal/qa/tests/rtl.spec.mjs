import {test,expect} from '@playwright/test';
const locales=(process.env.QA_LOCALES||'ar,ur,he').split(',').filter(c=>['ar','ur','he'].includes(c));
for(const locale of locales)test(`${locale} physical arrows, horizontal scroll and media orientation`,async({page})=>{
 await page.setViewportSize({width:1920,height:1080});
 await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'||route.request().url().startsWith('data:')?route.continue():route.abort());
 await page.goto(`/?locale=${locale}&screen=home`);
 await expect(page.locator('body')).toHaveAttribute('data-qa-ready','home');
 await expect(page.locator('.card.focus')).toHaveCount(1);
 await page.keyboard.press('ArrowRight',{delay:120});
 await expect(page.locator('body')).toHaveClass(/menu--open/);
 await page.keyboard.press('ArrowLeft',{delay:120});
 await expect(page.locator('body')).not.toHaveClass(/menu--open/);
 const initial=await page.locator('.card.focus').innerText();
 for(let n=0;n<8;n++)await page.keyboard.press('ArrowLeft',{delay:120});
 await expect(page.locator('.card.focus')).toBeInViewport();
 await expect(page.locator('.card.focus')).toContainText('QA-009');
 const images=await page.locator('.card__img').evaluateAll(nodes=>nodes.map(e=>({transform:getComputedStyle(e).transform,loaded:e.complete&&e.naturalWidth>0})));
 expect(images.some(e=>e.loaded)).toBeTruthy();expect(images.every(e=>e.transform==='none'||!e.transform.includes('-1'))).toBeTruthy();
 for(let n=0;n<8;n++)await page.keyboard.press('ArrowRight',{delay:120});
 await expect(page.locator('.card.focus')).toBeInViewport();
 expect(await page.locator('.card.focus').innerText()).toBe(initial);
});
for(const locale of locales)test(`${locale} URL editor uses LTR and saves exact ASCII through the on-screen keyboard`,async({page})=>{
 await page.setViewportSize({width:1920,height:1080});
 await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'||route.request().url().startsWith('data:')?route.continue():route.abort());
 await page.goto(`/?locale=${locale}&screen=torrserver`);
 await expect(page.locator('body')).toHaveAttribute('data-qa-ready','torrserver');
 await page.locator('[data-name="torrserver_url"]').click();
 await expect(page.locator('.settings-input__input')).toHaveAttribute('dir','ltr');
 const url='http://127.0.0.1:8090';
 for(const key of ['http://',...'127.0.0.1:8090'])await page.locator(`.hg-button[data-skbtn=${JSON.stringify(key)}]`).click();
 await expect(page.locator('.settings-input__input')).toHaveText(url);
 // Different keys must work in quick succession, including immediate confirmation.
 await page.locator('.hg-button[data-skbtn="{ENTER}"]').click();
 await expect.poll(()=>page.evaluate(()=>localStorage.getItem('torrserver_url'))).toBe(url);
 await expect(page.locator('[data-name="torrserver_url"] .settings-param__value')).toHaveText(url);
});
