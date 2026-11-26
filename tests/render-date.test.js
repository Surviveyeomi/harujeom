import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {build} from 'esbuild';
import {getFortune} from '../src/fortune.js';

test('S2-01 자정 사이 렌더 날짜 일치 및 다음 갱신',async()=>{
 const p={year:2000,month:5,day:15,hour:9,minute:30,calendar:'solar',leap:false,unknownTime:false,gender:'unspecified'};
 const results=['2026-11-25','2026-11-26'].map(date=>getFortune(p,date));
 // 계산을 시작할 때는 전날, 계산이 끝날 때 시계는 다음날인 상황.
 const bundle=await build({entryPoints:['src/app.js'],bundle:true,format:'iife',write:false,plugins:[{name:'midnight-clock',setup(b){b.onResolve({filter:/fortune\.js$/},args=>args.importer.endsWith('/src/app.js')?{path:'clock',namespace:'test'}:undefined);b.onLoad({filter:/.*/,namespace:'test'},()=>({contents:`let i=0;const r=${JSON.stringify(results)};export const getFortune=()=>r[Math.min(i++,1)];export const koreanToday=()=>"2026-11-26";`,loader:'js'}));}}]});
 const elements=new Map();const element=()=>({hidden:false,value:'',checked:false,textContent:'',innerHTML:'',addEventListener(){},append(){},replaceChildren(){},focus(){}});
 const byId=id=>{if(!elements.has(id))elements.set(id,element());return elements.get(id);};let timer;
 const context={document:{getElementById:byId,createElement:()=>({...element(),setAttribute(){}}),addEventListener(){},querySelectorAll:()=>[]},window:{localStorage:{getItem:()=>null},scrollTo(){}},setInterval:fn=>{timer=fn;},Intl,Date};
 vm.runInNewContext(bundle.outputFiles[0].text,context);
 byId('demo').onclick();
 assert.ok(byId('today-date').textContent.startsWith('2026. 11. 25'),'표시 날짜는 계산 결과의 날짜여야 함');
 timer();
 assert.ok(byId('today-date').textContent.startsWith('2026. 11. 26'),'다음 폴링은 새 날짜로 갱신해야 함');
 assert.equal(byId('score').textContent,results[1].today.score);
});
