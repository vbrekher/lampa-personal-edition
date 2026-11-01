// Buildless static preview: the exact wizard frontend, explicitly without its local API.
import{mkdirSync,readFileSync,writeFileSync,cpSync}from'node:fs';
import{NAMES,SUPPORTED,readLanguage}from'./i18n-audit.mjs';
const english={nl:'Dutch',de:'German',tr:'Turkish',en:'English',zh:'Chinese',hi:'Hindi',es:'Spanish',ar:'Arabic',fr:'French',bn:'Bengali',pt:'Portuguese',id:'Indonesian',ur:'Urdu',ru:'Russian',uk:'Ukrainian',be:'Belarusian',bg:'Bulgarian',cs:'Czech',he:'Hebrew',pl:'Polish',ro:'Romanian'};
const data=SUPPORTED.map(code=>{const d=readLanguage(code);return{code,name:NAMES[code],english:english[code],dir:['ar','ur','he'].includes(code)?'rtl':'ltr',home:d.title_main,settings:d.title_settings,search:d.search,watch:d.title_watch};});
writeFileSync('personal/web/locales.json',JSON.stringify(data,null,2)+'\n');mkdirSync('site/demo',{recursive:true});
for(const file of ['app.js','messages.js','builder.css','locales.json'])cpSync('personal/web/'+file,'site/demo/'+file);
let html=readFileSync('personal/web/index.html','utf8').replace('<html lang="en">','<html lang="en" data-mode="demo">').replaceAll('href="assets/','href="../assets/').replaceAll('src="assets/','src="../assets/').replace('href="brand.css"','href="../brand.css"').replace('· Local Builder','· Interactive Preview');
writeFileSync('site/demo/index.html',html);console.log('Static wizard preview prepared. No compiler or local API is deployed.');
