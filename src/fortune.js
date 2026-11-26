import {fields as messages,overall,trends,cautions,tier,choose,seedFor} from './messages.js';
import { calculateFourPillars, lunarToSolar, getHeavenlyStemElement, getEarthlyBranchElement } from 'manseryeok';
export function koreanToday(now=new Date()) { return new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(now); }
export function shiftDate(date,offset) { const d=new Date(date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+offset);return d.toISOString().slice(0,10); }
export function validateProfile(p,today=koreanToday()) {
 if(!p || !['solar','lunar'].includes(p.calendar) || !['female','male','unspecified'].includes(p.gender)) throw Error('입력 항목을 다시 확인해주세요.');
 if(!Number.isInteger(p.year)||p.year<1900||p.year>Math.min(Number(today.slice(0,4)),p.calendar==='lunar'?2100:2300)) throw Error('출생 연도는 1900년부터 올해까지 입력해주세요. 지원 상한은 양력 2300년, 음력 2100년이에요.');
 if(!Number.isInteger(p.month)||p.month<1||p.month>12||!Number.isInteger(p.day)||p.day<1||p.day>31) throw Error('월과 일을 확인해주세요.');
 if(typeof p.unknownTime!=='boolean'||typeof p.leap!=='boolean'||!Number.isInteger(p.hour)||p.hour<0||p.hour>23||!Number.isInteger(p.minute)||p.minute<0||p.minute>59) throw Error('출생시간을 확인해주세요.');
 if(p.calendar==='solar'&&p.leap) throw Error('윤달은 음력에서만 선택할 수 있어요.');
 let solar;
 try { solar=p.calendar==='lunar'?lunarToSolar(p.year,p.month,p.day,p.leap):{year:p.year,month:p.month,day:p.day};
 const d=new Date(Date.UTC(solar.year,solar.month-1,solar.day));
 if(d.getUTCFullYear()!==solar.year||d.getUTCMonth()+1!==solar.month||d.getUTCDate()!==solar.day) throw Error();
 if(d.toISOString().slice(0,10)>today) throw Error();
 calculateFourPillars({year:solar.year,month:solar.month,day:solar.day,hour:p.unknownTime?12:p.hour,minute:p.unknownTime?0:p.minute});
 } catch {throw Error('존재하지 않는 날짜·윤달이거나 미래의 생일이에요. 날짜를 확인해주세요.');}
 return solar;
}
const elements=['목','화','토','금','수'];
// 서비스 자체 규칙 v0.1: 오행 관계별 가중치. 명리학의 공식 운세 점수가 아님.
export function relation(a,b) { return [8,5,-6,-9,10][(elements.indexOf(b)-elements.indexOf(a)+5)%5]; }
export function calculateDay(p,date) {
 validateDate(date);
 const solar=validateProfile(p);const seed=seedFor(solar,p);const birth=calculateFourPillars({...solar,hour:p.unknownTime?12:p.hour,minute:p.unknownTime?0:p.minute});
 const [year,month,day]=date.split('-').map(Number);const daily=calculateFourPillars({year,month,day,hour:12,minute:0});
 const keys=p.unknownTime?['year','month','day']:['year','month','day','hour'];
 const dayStem=getHeavenlyStemElement(daily.day.heavenlyStem);const dayBranch=getEarthlyBranchElement(daily.day.earthlyBranch);
 const mean=keys.reduce((sum,k)=>sum+relation(getHeavenlyStemElement(birth[k].heavenlyStem),dayStem)+relation(getEarthlyBranchElement(birth[k].earthlyBranch),dayBranch),0)/(keys.length*2);
 const base=65+mean*2;
 const targets=[elements[(elements.indexOf(dayStem)+2)%5],elements[(elements.indexOf(dayBranch)+1)%5],dayStem,dayBranch];
 const fields=Object.keys(messages).map((key,i)=>{const score=Math.max(0,Math.min(100,Math.round(base+relation(birth.dayElement.stem,targets[i]))));return {key,score,text:choose(messages[key][tier(score)],seed,date,key)};});
 const score=Math.round(fields.reduce((s,f)=>s+f.score,0)/4);const lowest=fields.reduce((best,f,i)=>f.score<fields[best].score?i:best,0);
 return {date,score,fields,caution:choose(cautions[fields[lowest].key],seed,date,'caution'),description:choose(overall[tier(score)],seed,date,'overall'),pillars:birth.toObject(),daily:daily.toObject().day,unknownTime:p.unknownTime};
}
export function getFortune(p,today=koreanToday()) { validateDate(today);const days=[-2,-1,0].map(n=>calculateDay(p,shiftDate(today,n)));const delta=days[2].score-days[0].score;return {days,today:days[2],trend:choose(trends[delta>=6?2:delta<=-6?0:1],seedFor(validateProfile(p),p),today,'trend')}; }
export function validateDate(date) {const d=new Date(date+'T12:00:00Z');if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(d.valueOf())||d.toISOString().slice(0,10)!==date||Number(date.slice(0,4))<1800||Number(date.slice(0,4))>2300)throw Error('계산 날짜는 1800~2300년의 유효한 날짜여야 해요.');}
export const STORAGE_KEY='harujeom.profile.v1';
export function readProfile(storage) {try {const p=JSON.parse(storage.getItem(STORAGE_KEY));if(!p)return null;validateProfile(p);return p;}catch{return null;}}
