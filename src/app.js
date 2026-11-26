import {parseProfile,loadProfile,saveProfile,deleteProfile,needsRefresh} from './profile.js';
import {getFortune,koreanToday} from './fortune.js';
const $=id=>document.getElementById(id);let active=null,personal=null,isDemo=false,renderedDate='',remembered=false,lastNotice='';
const example={year:2000,month:5,day:15,hour:9,minute:30,calendar:'solar',leap:false,unknownTime:false,gender:'unspecified'};
function storage(){return window.localStorage;}
function form(p=example){for(const k of ['year','month','day','calendar','gender'])$(k).value=p[k];$('time').value=String(p.hour).padStart(2,'0')+':'+String(p.minute).padStart(2,'0');$('unknown').checked=p.unknownTime;$('leap').checked=p.leap;sync();}
function sync(){$('time').disabled=$('unknown').checked;$('leap-label').hidden=$('calendar').value!=='lunar';if($('calendar').value!=='lunar')$('leap').checked=false;}
$('calendar').addEventListener('change',sync);$('unknown').addEventListener('change',sync);
function showForm(){for(const el of document.querySelectorAll('[aria-invalid]'))el.removeAttribute('aria-invalid');if(personal)form(personal);else {$('profile-form').reset();sync();}$('remember').checked=remembered;$('welcome').hidden=false;$('dashboard').hidden=true;$('edit').hidden=true;$('cancel').hidden=!active;$('form-error').textContent='';window.scrollTo(0,0);$('year').focus();}
function render(p,demo=false,message='',focus=true){
 const result=getFortune(p);active=p;isDemo=demo;renderedDate=koreanToday();$('welcome').hidden=true;$('dashboard').hidden=false;$('edit').hidden=false;
 $('today-date').textContent=renderedDate.replaceAll('-','. ')+' · 오늘의 작은 힌트';$('mode-label').textContent=demo?'예시 체험':'오늘의 운세';
 $('profile-summary').textContent=(demo?'가상 예시 · ':'')+`${p.calendar==='solar'?'양력':'음력'} ${p.year}.${p.month}.${p.day}${p.leap?' (윤달)':''} · ${p.unknownTime?'출생시간 미상':String(p.hour).padStart(2,'0')+':'+String(p.minute).padStart(2,'0')}`;
 lastNotice=message;const notice=demo?'가상 정보로 보는 예시예요. 내 정보를 입력하면 나의 결과를 확인할 수 있어요.':message;$('notice').hidden=!notice;$('notice').textContent=notice;
 const s=result.today.score;$('score').textContent=s;$('score-label').textContent=s>=80?'가볍게 한 걸음':s>=60?'차분히 이어가는 날':'여유를 챙기는 날';
 $('score-title').textContent=s>=80?'작은 시작이 기대되는 하루':s>=60?'나만의 리듬을 찾아가는 하루':'잠깐 쉬어가도 괜찮은 하루';
 $('score-description').textContent=result.today.description;
 const xs=[35,145,255];const ys=result.days.map(d=>140-d.score);const points=xs.map((x,i)=>`${x},${ys[i]}`).join(' ');
 $('chart').innerHTML=`<svg viewBox="0 0 400 190" role="img" aria-label="최근 운세: 그제 ${result.days[0].score}점, 어제 ${result.days[1].score}점, 오늘 ${s}점, 내일 미공개"><path d="M20 140 H380 M20 90 H380 M20 40 H380" stroke="#e9ebe2" fill="none"/><polygon points="35,140 ${points} 255,140" fill="#edf1e3"/><polyline points="${points}" stroke="#648252" stroke-width="2.5" fill="none"/>${xs.map((x,i)=>`<circle cx="${x}" cy="${ys[i]}" r="${i===2?6:4}" fill="${i===2?'#42684c':'#a4b18e'}"/><text x="${x}" y="${ys[i]-16}" text-anchor="middle" fill="#42684c" font-size="15">${result.days[i].score}</text><text x="${x}" y="167" text-anchor="middle" fill="#747c71" font-size="15">${['그제','어제','오늘'][i]}</text><text x="${x}" y="184" text-anchor="middle" fill="#59634f" font-size="13">${result.days[i].date.slice(5).replace('-','.')}</text>`).join('')}<circle cx="365" cy="80" r="17" fill="#f2f2e8"/><text x="365" y="86" text-anchor="middle" font-size="17" fill="#59634f">?</text><text x="365" y="167" text-anchor="middle" font-size="15" fill="#59634f">내일</text></svg>`;
 $('chart-values').textContent=result.days.map((d,i)=>`${['그제','어제','오늘'][i]} ${d.date.slice(5)} · ${d.score}점`).join(' / ')+' / 내일 ?';$('trend').textContent=result.trend;const names=['금전운','연애운','일·공부운','대인운'];const icons=['₩','♡','✎','☺'];$('fields').replaceChildren();result.today.fields.forEach((f,i)=>{const el=document.createElement('div');el.className='field';const icon=document.createElement('span');icon.className='field-icon';icon.textContent=icons[i];icon.setAttribute('aria-hidden','true');const h=document.createElement('h3');h.textContent=names[i]+' · '+f.score+'점';const text=document.createElement('p');text.textContent=f.text;el.append(icon,h,text);$('fields').append(el);});
 $('caution').textContent=result.today.caution;$('pillars').textContent='계산 확인 · '+Object.entries(result.today.pillars).filter(([k])=>!p.unknownTime||k!=='hour').map(([k,v])=>({year:'연주',month:'월주',day:'일주',hour:'시주'}[k])+' '+v).join(' / ')+' · 오늘 일진 '+result.today.daily;
 $('delete').hidden=demo;if(focus){window.scrollTo(0,0);$('result-heading').focus();}
}
$('profile-form').addEventListener('submit',e=>{
 e.preventDefault();for(const el of document.querySelectorAll('[aria-invalid]'))el.removeAttribute('aria-invalid');
 try{const p=parseProfile({year:$('year').value,month:$('month').value,day:$('day').value,time:$('time').value,unknownTime:$('unknown').checked,calendar:$('calendar').value,leap:$('leap').checked,gender:$('gender').value});
 const state=saveProfile(storage,p,$('remember').checked);personal=p;remembered=state.ok&&state.status==='saved';
 const message=state.ok?(remembered?'이 브라우저에 정보를 저장했어요. 아래에서 언제든 삭제할 수 있어요.':'정보를 저장하지 않고 이번 방문에서만 보여드려요.'):'브라우저 저장소에 접근할 수 없어 이번 방문에서만 보여드려요. 기존 저장 정보가 있다면 삭제되지 않았을 수 있으니 브라우저 설정에서 확인해주세요.';
 render(p,false,message);
 }catch(err){$('form-error').textContent=err.message;const el=$(err.field||'year');el.setAttribute('aria-invalid','true');el.focus();}
});
$('demo').onclick=()=>render(example,true);$('edit').onclick=showForm;$('home').onclick=showForm;$('new-profile').onclick=showForm;$('cancel').onclick=()=>render(active,isDemo,lastNotice);
$('delete').onclick=()=>$('delete-dialog').showModal();$('delete-cancel').onclick=()=>$('delete-dialog').close();
$('delete-confirm').onclick=()=>{const deleted=deleteProfile(storage);$('delete-dialog').close();active=null;personal=null;isDemo=false;remembered=false;$('profile-form').reset();showForm();$('form-error').textContent=deleted?'정보를 삭제했어요.':'화면의 정보는 지웠지만 저장소 삭제에 실패했어요. 브라우저 설정에서 사이트 데이터를 삭제해주세요.';};
function refresh(){if(active&&needsRefresh(renderedDate,koreanToday(),!$('dashboard').hidden))render(active,isDemo,lastNotice,false);}
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});setInterval(refresh,30000);
$('year').max=Number(koreanToday().slice(0,4));
const loaded=loadProfile(storage);if(loaded.profile){personal=loaded.profile;remembered=true;render(personal,false,'이 브라우저에 저장된 정보를 불러왔어요.');}else if(loaded.status!=='empty'){$('form-error').textContent='저장 정보를 불러오지 못했어요. 새로 입력하면 저장 없이도 이용할 수 있어요.';}
sync();
