// 브라우저 저장소 제한 검증용. 배포 산출물에 포함하지 않는다.
import {readFile,writeFile} from 'node:fs/promises';
const html=await readFile('dist/harujeom.html','utf8');
const escape=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
await writeFile('dist/qa-storage.html',`<!doctype html><meta charset="utf-8"><title>저장소 제한 QA</title><h1>저장소 제한 QA · 가상 정보만 사용</h1><p>allow-same-origin 없는 sandbox iframe: localStorage 접근 제한. 실제 오프라인 검증과는 별개.</p><iframe title="저장소 제한 하루점" sandbox="allow-scripts allow-forms" style="width:100%;height:1500px;border:0" srcdoc="${escape(html)}"></iframe>`);
console.log('Generated ignored dist/qa-storage.html');
