import {build} from 'esbuild';
import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
await build({entryPoints:['src/app.js'],bundle:true,format:'iife',outfile:'dist/app.js',legalComments:'inline',charset:'utf8'});
const [html,css,js,license]=await Promise.all(['dist/index.html','dist/style.css','dist/app.js','dist/manseryeok-LICENSE.txt'].map(p=>readFile(p,'utf8')));
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const standalone=html.replace('<link rel="stylesheet" href="style.css">',()=>`<style>${css.replaceAll('</style','<\\/style')}</style>`).replace('<script src="app.js" defer></script>','').replace('</body>',()=>`<details class="license"><summary>오픈소스 라이선스 · manseryeok 2.0.0 (MIT)</summary><pre>${escape(license)}</pre></details><script>${js.replaceAll('</script','<\\/script')}</script></body>`);
await writeFile('dist/harujeom.html',standalone);
const index=process.argv.indexOf('--submission');if(index!==-1){if(!process.argv[index+1])throw Error('--submission requires a local output path');const dest=resolve(process.argv[index+1]);if(!dest.startsWith(resolve('submission')+'/'))throw Error('Submission output must be inside ignored submission/');await mkdir(dirname(dest),{recursive:true});await copyFile('dist/harujeom.html',dest);}
console.log('Built dist/app.js and self-contained dist/harujeom.html');
