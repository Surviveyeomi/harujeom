import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const bytes=await readFile('dist/harujeom.html');const h=bytes.toString();
const forbidden=[/<script[^>]+src=/i,/<link[^>]+rel=["']stylesheet/i,/@import/i,/url\(https?:/i,/\bfetch\s*\(/,/XMLHttpRequest/,/WebSocket/];
if(forbidden.some(x=>x.test(h)))throw Error('External runtime dependency or network API found');
if(!h.includes('Permission is hereby granted'))throw Error('Missing license');
console.log(`Standalone: ${bytes.length} bytes; sha256 ${createHash('sha256').update(bytes).digest('hex')}; external runtime dependency scan PASS`);
if(process.argv[2]){const other=await readFile(process.argv[2]);if(!bytes.equals(other))throw Error('Submission differs');console.log('Submission is byte-identical: PASS');}
const lum=hex=>{const rgb=hex.match(/\w\w/g).map(x=>parseInt(x,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;};
for(const [name,fg,bg] of [['body','26392f','f7f5ef'],['muted','596451','fffefa'],['score text','536347','e6ecd9'],['button','ffffff','42684c'],['error','993d31','fffefa']]){const a=lum(fg),b=lum(bg),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);if(ratio<4.5)throw Error(name+' insufficient contrast');console.log(`${name}: ${ratio.toFixed(2)}:1 PASS (selected text pair, not a full accessibility audit)`);}
