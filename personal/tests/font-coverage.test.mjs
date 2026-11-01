import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {inflateSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {readLanguage} from '../../tools/i18n-audit.mjs';
const root=new URL('../../',import.meta.url);
function woffTables(file){
  const bytes=readFileSync(new URL(file,root));
  assert.equal(bytes.toString('ascii',0,4),'wOFF');
  const tables=new Map();
  for(let n=0;n<bytes.readUInt16BE(12);n++){
    const at=44+n*20,tag=bytes.toString('ascii',at,at+4),offset=bytes.readUInt32BE(at+4);
    const length=bytes.readUInt32BE(at+8),original=bytes.readUInt32BE(at+12);
    const data=bytes.subarray(offset,offset+length);
    tables.set(tag,length===original?data:inflateSync(data));
  }
  return tables;
}
function hasGlyph(cmap,code){
  for(let n=0;n<cmap.readUInt16BE(2);n++){
    const record=4+n*8,platform=cmap.readUInt16BE(record);
    if(platform!==0&&platform!==3)continue;
    const table=cmap.subarray(cmap.readUInt32BE(record+4)),format=table.readUInt16BE(0);
    if(format===12){
      for(let group=0;group<table.readUInt32BE(12);group++){
        const at=16+group*12,first=table.readUInt32BE(at),last=table.readUInt32BE(at+4);
        if(code>=first&&code<=last&&table.readUInt32BE(at+8)+code-first!==0)return true;
      }
    }else if(format===4&&code<=0xffff){
      const segments=table.readUInt16BE(6)/2;
      for(let i=0;i<segments;i++){
        const end=table.readUInt16BE(14+i*2),start=table.readUInt16BE(16+segments*2+i*2);
        if(code<start||code>end)continue;
        const delta=table.readInt16BE(16+segments*4+i*2),position=16+segments*6+i*2;
        const offset=table.readUInt16BE(position);
        let glyph=offset?table.readUInt16BE(position+offset+(code-start)*2):code;
        if(!offset||glyph)glyph=(glyph+delta)&0xffff;
        if(glyph)return true;
      }
    }
  }
  return false;
}
for(const [code,family,first,last] of [['hi','NotoSansDevanagari',0x900,0x97f],['bn','NotoSansBengali',0x980,0x9ff],['ar','NotoNaskhArabic',0x600,0x8ff],['ur','NotoNaskhArabic',0x600,0x8ff],['he','NotoSansHebrew',0x590,0x5ff]]){
  test(code+' bundled font covers every translated script character and retains shaping tables',()=>{
    const tables=woffTables('public/fonts/noto/'+family+'-Regular.woff');
    for(const tag of ['cmap','GSUB','GPOS','GDEF'])assert.ok(tables.has(tag),tag);
    const keyboard=['ar','ur'].includes(code)?readFileSync(new URL('src/interaction/keyboard/layers.js',root),'utf8'):'';
    const characters=new Set(Object.values(readLanguage(code)).join('')+keyboard);
    for(const character of characters){
      const point=character.codePointAt(0);
      if(point>=first&&point<=last)assert.ok(hasGlyph(tables.get('cmap'),point),code+' missing U+'+point.toString(16));
    }
    assert.match(readFileSync(new URL('public/fonts/noto/'+family+'-OFL.txt',root),'utf8'),/SIL Open Font License/);
  });
}
test('bundled font provenance hashes match the shipped static WOFF files',()=>{
  const records=JSON.parse(readFileSync(new URL('public/fonts/noto/SOURCES.json',root),'utf8'));
  for(const record of records){
    const bytes=readFileSync(new URL('public/fonts/noto/'+record.file,root));
    assert.equal(createHash('sha256').update(bytes).digest('hex'),record.sha256);
    assert.equal(bytes.length,record.bytes);
  }
});
