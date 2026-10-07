(function(){
function el(id){return document.getElementById(id)}
function isoDate(d){const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');return `${y}-${m}-${day}`}
function localDate(s){const a=String(s||'').split('-').map(Number);return a.length===3?new Date(a[0],a[1]-1,a[2]):new Date()}
function mondayOf(s){const d=localDate(s);const day=d.getDay()||7;d.setDate(d.getDate()-day+1);d.setHours(0,0,0,0);return d}
function addDays(d,n){const x=new Date(d);x.setDate(x.getDate()+n);return x}
function fmtDate(d){return d.toLocaleDateString('en-AU',{day:'numeric',month:'short',year:'numeric'})}
function fmtDay(d){return d.toLocaleDateString('en-AU',{weekday:'long'})}
function jobDate(r){return r.nightDate||r.date||''}
function jobHours(r){const h=Number(r.hours)||0;return h?h.toLocaleString('en-AU',{maximumFractionDigits:2})+' hrs':''}
function productText(r){
 if(r.irrigationOnly||r.phaseMode==='water')return 'Water Only';
 const xs=(r.injectors||[]).filter(x=>x&&x.type==='product'&&x.name);
 if(!xs.length)return 'Fertigation';
 return xs.map(x=>{const unit=x.unit==='kg/ha'?'kg':'L';const q=Number(x.qty)||0;return `${x.name} — ${q.toLocaleString('en-AU',{maximumFractionDigits:1})} ${unit}`}).join('   ·   ')
}
function planned(){return (typeof state!=='undefined'&&Array.isArray(state.plans)?state.plans:[]).map(r=>({...r,_diaryStatus:'Planned'}))}
function completed(){return (typeof state!=='undefined'&&Array.isArray(state.records)?state.records:[]).map(r=>({...r,_diaryStatus:'Completed'}))}
function allDiaryRecords(){return planned().concat(completed())}
function weekRecords(start){const end=addDays(start,7);return allDiaryRecords().filter(r=>{const d=localDate(jobDate(r));return d>=start&&d<end}).sort((a,b)=>{const da=jobDate(a).localeCompare(jobDate(b));if(da)return da;return String(a.startTime||'').localeCompare(String(b.startTime||''))})}
function entryHtml(r){const outs=(r.outlets||[]).join(', '),status=r._diaryStatus||'Planned',cls=status==='Completed'?'completed':'planned';return `<div class="diaryEntry"><div class="diaryFarm">${r.farm||''}${outs?` — ${outs}`:''}<span class="diaryStatus ${cls}">${status==='Completed'?'✓ Completed':'Planned'}</span></div><div class="diaryHours">${jobHours(r)}</div><div class="diaryProducts">${productText(r)}</div></div>`}
function renderDiary(){const host=el('diaryWeek'),picker=el('diaryDate');if(!host||!picker)return;if(!picker.value)picker.value=isoDate(new Date());const start=mondayOf(picker.value),rs=weekRecords(start);let html='';for(let i=0;i<7;i++){const d=addDays(start,i),key=isoDate(d),day=rs.filter(r=>jobDate(r)===key);html+=`<div class="diaryDay"><div class="diaryDayTitle"><strong>${fmtDay(d)}</strong><span>${fmtDate(d)}</span></div><div class="diaryEntries">`;html+=day.length?day.map(entryHtml).join(''):'<div class="diaryEmpty">No irrigation planned.</div>';html+='</div></div>'}host.innerHTML=html}
function diaryText(){const start=mondayOf(el('diaryDate').value),rs=weekRecords(start),lines=[];for(let i=0;i<7;i++){const d=addDays(start,i),key=isoDate(d),day=rs.filter(r=>jobDate(r)===key);lines.push(`${fmtDay(d)} ${fmtDate(d)}`);day.forEach(r=>lines.push(`${r.farm} ${(r.outlets||[]).join(', ')}   ${jobHours(r)}   ${productText(r)}   [${r._diaryStatus}]`));if(!day.length)lines.push('—');lines.push('')}return lines.join('\n')}
window.renderDiary=renderDiary;
document.addEventListener('DOMContentLoaded',()=>{const picker=el('diaryDate');if(!picker)return;picker.value=isoDate(new Date());picker.addEventListener('change',renderDiary);el('diaryPrev').addEventListener('click',()=>{picker.value=isoDate(addDays(mondayOf(picker.value),-7));renderDiary()});el('diaryNext').addEventListener('click',()=>{picker.value=isoDate(addDays(mondayOf(picker.value),7));renderDiary()});el('copyDiary').addEventListener('click',async()=>{const t=diaryText();try{await navigator.clipboard.writeText(t);alert('Diary copied.')}catch(e){prompt('Copy diary:',t)}});el('printDiary').addEventListener('click',()=>window.print())});
})();
