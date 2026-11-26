import {STORAGE_KEY,validateProfile} from './fortune.js';
export function parseProfile(values){
 for(const [key,label] of [['year','출생 연도를'],['month','출생 월을'],['day','출생 일을']])if(!String(values[key]??'').trim()){const e=Error(`${label} 입력해주세요.`);e.field=key;throw e;}
 if(!values.unknownTime&&!/^\d{2}:\d{2}$/.test(values.time??'')){const e=Error('출생시간을 입력하거나 시간을 몰라요를 선택해주세요.');e.field='time';throw e;}
 const [hour,minute]=(values.time||'12:00').split(':').map(Number);
 const p={year:Number(values.year),month:Number(values.month),day:Number(values.day),hour:values.unknownTime?12:hour,minute:values.unknownTime?0:minute,calendar:values.calendar,gender:values.gender,leap:!!values.leap,unknownTime:!!values.unknownTime};validateProfile(p);return p;
}
// 저장소 getter 자체가 SecurityError를 던지는 환경도 처리한다.
export function loadProfile(getStorage){try{const raw=getStorage().getItem(STORAGE_KEY);if(raw===null)return {profile:null,status:'empty'};const profile=JSON.parse(raw);validateProfile(profile);return {profile,status:'saved'};}catch(error){return {profile:null,status:error instanceof SyntaxError?'corrupt':'unavailable'};}}
export function saveProfile(getStorage,p,remember){try{if(remember)getStorage().setItem(STORAGE_KEY,JSON.stringify(p));else getStorage().removeItem(STORAGE_KEY);return {ok:true,status:remember?'saved':'session'};}catch{return {ok:false,status:'unavailable'};}}
export function deleteProfile(getStorage){try{getStorage().removeItem(STORAGE_KEY);return true;}catch{return false;}}
export function needsRefresh(renderedDate,currentDate,visible){return !!renderedDate&&visible&&renderedDate!==currentDate;}
