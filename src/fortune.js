import { calculateFourPillars, lunarToSolar, getHeavenlyStemElement, getEarthlyBranchElement } from 'manseryeok';
export function koreanToday(now=new Date()) { return new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(now); }
export function shiftDate(date,offset) { const d=new Date(date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+offset);return d.toISOString().slice(0,10); }
export function validateProfile(p,today=koreanToday()) {
 if(!p || !['solar','lunar'].includes(p.calendar) || !['female','male','unspecified'].includes(p.gender)) throw Error('입력 항목을 다시 확인해주세요.');
 if(!Number.isInteger(p.year)||p.year<1900||p.year>Number(today.slice(0,4))) throw Error('출생 연도는 1900년부터 올해까지 입력해주세요.');
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
const copy={
 money:['작은 지출도 잠깐 멈추어 살펴보세요. 필요한 것부터 고르면 충분해요.','계획한 범위에서 지출해보세요. 작은 정리가 마음의 여유를 만들어요.','미뤄둔 소비 계획을 정리하기 좋아요. 비교하고 고르면 더 만족스러워요.'],
 love:['마음을 서둘러 확인하지 않아도 괜찮아요. 내 속도부터 존중해주세요.','짧은 안부 한마디를 건네보세요. 편안한 대화가 가까워지는 시작이에요.','따뜻한 마음을 표현해보세요. 작은 관심이 기분 좋은 대화로 이어질 수 있어요.'],
 work:['할 일을 하나만 골라 시작해보세요. 쉬어가는 시간도 계획의 일부예요.','작은 목표를 세워 차근차근 해보세요. 꾸준함이 오늘의 힘이에요.','집중할 시간을 따로 마련해보세요. 미뤄둔 일의 첫 단추를 끼우기 좋아요.'],
 people:['답하기 전에 한 번 더 들어보세요. 잠깐의 여유가 오해를 줄여줘요.','익숙한 사람에게 먼저 안부를 건네보세요. 가벼운 대화면 충분해요.','함께할 일을 제안해보세요. 서로의 아이디어를 나누기 좋은 흐름이에요.']};
const cautions=['충동적인 소비는 한 번 더 생각해보세요.','중요한 이야기는 서두르지 않아도 괜찮아요.','너무 많은 일을 한꺼번에 시작하지 마세요.','오늘은 주변 사람의 말을 조금 더 들어보세요.'];
export function calculateDay(p,date) {
 const solar=validateProfile(p);const birth=calculateFourPillars({...solar,hour:p.unknownTime?12:p.hour,minute:p.unknownTime?0:p.minute});
 const [year,month,day]=date.split('-').map(Number);const daily=calculateFourPillars({year,month,day,hour:12,minute:0});
 const keys=p.unknownTime?['year','month','day']:['year','month','day','hour'];
 const dayStem=getHeavenlyStemElement(daily.day.heavenlyStem);const dayBranch=getEarthlyBranchElement(daily.day.earthlyBranch);
 const mean=keys.reduce((sum,k)=>sum+relation(getHeavenlyStemElement(birth[k].heavenlyStem),dayStem)+relation(getEarthlyBranchElement(birth[k].earthlyBranch),dayBranch),0)/(keys.length*2);
 const base=65+mean*2;
 const targets=[elements[(elements.indexOf(dayStem)+2)%5],elements[(elements.indexOf(dayBranch)+1)%5],dayStem,dayBranch];
 const fields=Object.keys(copy).map((key,i)=>{const score=Math.max(0,Math.min(100,Math.round(base+relation(birth.dayElement.stem,targets[i]))));return {key,score,text:copy[key][score>=80?2:score>=60?1:0]};});
 const score=Math.round(fields.reduce((s,f)=>s+f.score,0)/4);const lowest=fields.reduce((best,f,i)=>f.score<fields[best].score?i:best,0);
 return {date,score,fields,caution:cautions[lowest],pillars:birth.toObject(),daily:daily.toObject().day,unknownTime:p.unknownTime};
}
export function getFortune(p,today=koreanToday()) { const days=[-2,-1,0].map(n=>calculateDay(p,shiftDate(today,n)));const delta=days[2].score-days[0].score;return {days,today:days[2],trend:delta>=6?'최근 흐름이 한결 가벼워지고 있어요.':delta<=-6?'조금 천천히, 나만의 속도로 움직여보세요.':'비슷한 흐름이 이어지고 있어요. 차분히 하루를 시작해보세요.'}; }
export const STORAGE_KEY='harujeom.profile.v1';
export function readProfile(storage) {try {const p=JSON.parse(storage.getItem(STORAGE_KEY));if(!p)return null;validateProfile(p);return p;}catch{return null;}}
