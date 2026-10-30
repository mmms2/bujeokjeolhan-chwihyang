(()=>{
'use strict';
const $=(s)=>document.querySelector(s);
const sceneData={
  one:{date:'2026.10.30  FRI  20:47',caption:'OCT 30 · FRIDAY · 20:47',heading:'이사 첫날, 옆집에서 만난 얼굴',synopsis:'새집에 짐을 풀던 전율이 복도에서 동생의 전 연인을 알아본다. 서로 이웃이 된 걸 알게 되는 첫날.',quote:'와, 씨​발. 하필.',excerpt:'전율은 계약만료와 가게 출퇴근 때문에 이사했다. 바이크 헬멧과 공구 가방을 들고 올라온 복도에서 예상 못 한 얼굴을 마주친다. 1101호 앞에 있는 건 동생과 헤어진 지 약 3개월 된 사람. 그동안 가까이 지낸 적 없던 사이가 문 하나를 두고 이웃이 됐다.',
  you:{title:'1101호 · 당신의 집',text:'이 건물에 먼저 살던 집. 전율이 이사 온 사실도, 새집이 바로 옆이라는 사실도 이날 처음 드러난다. 이후 어떤 말을 하거나 행동할지는 정해져 있지 않다.',quote:'“……야. 너 여기 살아?”'},
  yul:{title:'1102호 · 전율의 새집',text:'커스텀숍과 가까운 거리에 얻은 집. 이삿짐 상자가 아직 남아 있고, 전율은 문을 열어놓고 황당한 우연을 웃어넘기지 못한다.',quote:'“미리 말해 두는데, 나 안 나가. 보증금 걸었어.”'},
  lift:{title:'엘리베이터 · 귀가한 사람',text:'바이크를 세우고 올라온 전율. 헬멧과 공구 가방을 챙겨 돌아오다가, 자신이 아는 얼굴이 바로 옆집에 산다는 걸 알게 된다.',quote:'“와, 씨​발. 하필.”'}},
  two:{date:'2026.11.20  FRI  23:41',caption:'NOV 20 · FRIDAY · 23:41',heading:'다시 찾아온 전 약혼자, 바로 옆집의 친형',synopsis:'전한은 미련 때문에 익숙한 1101호를 찾아왔고, 여자와 귀가한 전율은 1102호 문을 열다가 동생과 마주친다.',quote:'네가 물어봤냐? 씨​발, 집 앞에서 청문회 열겠네.',excerpt:'전한은 3년 동안 드나들던 1101호를 잊지 못해 찾아왔다. 전율은 가볍게 만나던 여성과 함께 귀가해 1102호 문을 연다. 그제야 전한은 친형이 자신의 전 약혼자 바로 옆집에 3주째 살고 있었다는 걸 알게 된다.',
  you:{title:'1101호 · 아직 닫힌 현관',text:'전한이 이 집을 찾아온 이유는 남은 미련. 복도에서 전율과 언쟁을 주고받다가 결국 초인종을 누른다. 문이 열릴지, 누가 응답할지는 아직 정해지지 않았다.',quote:'띵동—.'},
  yul:{title:'1102호 · 뜻밖의 형제 대면',text:'전율이 동행한 여성에게 먼저 들어가라며 문을 열어준 순간, 바로 옆에서 전한과 마주친다. 이사 사실을 먼저 말하지 않은 데 특별한 의도는 없었다.',quote:'“네가 물어봤냐? 씨​발, 집 앞에서 청문회 열겠네.”'},
  lift:{title:'엘리베이터 · 뒤엉킨 귀가',text:'전율은 여성과 함께 늦은 약속을 마치고 돌아왔다. 전한은 전 약혼자를 보러 왔다. 서로 다른 이유로 도착한 두 형제가 하필 같은 복도에서 마주친다.',quote:'“……형이 왜 여기 있어?”'}}
};
let active='one',lastFocused=null;
function setScene(id){active=id;const s=sceneData[id];$('#sceneClock').textContent=s.date;$('#sceneCaption').textContent=s.caption;$('#sceneHeading').textContent=s.heading;$('#sceneSynopsis').textContent=s.synopsis;$('#sceneQuote').textContent=s.quote;$('#sceneHall').classList.toggle('night',id==='two');$('#scene1').classList.toggle('active',id==='one');$('#scene2').classList.toggle('active',id==='two');$('#scene1').setAttribute('aria-pressed',String(id==='one'));$('#scene2').setAttribute('aria-pressed',String(id==='two'))}
$('#scene1').addEventListener('click',()=>setScene('one'));$('#scene2').addEventListener('click',()=>setScene('two'));
function htmlEscape(s){return s.replace(/[&<>\"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[ch]))}
function openModal(eyebrow,content){lastFocused=document.activeElement;$('#modalEyebrow').textContent=eyebrow;$('#modalContent').innerHTML=content;$('#modalShade').classList.add('show');$('#modalShade').setAttribute('aria-hidden','false');document.body.classList.add('lock');$('#modalClose').focus()}
function closeModal(){if(!$('#modalShade').classList.contains('show'))return;$('#modalShade').classList.remove('show');$('#modalShade').setAttribute('aria-hidden','true');document.body.classList.remove('lock');if(lastFocused&&lastFocused.focus)lastFocused.focus()}
function showDoor(which){const s=sceneData[active][which];openModal('11F · '+(active==='one'?'10.30':'11.20'),`<h3 id="modalTitle">${htmlEscape(s.title)}</h3><p>${htmlEscape(s.text)}</p><div class="quote">${htmlEscape(s.quote)}</div><p class="minor">* 방문자의 선택이나 반응은 이 미리보기에서 정하지 않아.</p>`)}
$('#door1101').addEventListener('click',()=>showDoor('you'));$('#door1102').addEventListener('click',()=>showDoor('yul'));$('#elevator').addEventListener('click',()=>showDoor('lift'));
$('#readScene').addEventListener('click',()=>{let s=sceneData[active];openModal(active==='one'?'START 01':'START 02',`<h3 id="modalTitle">${active==='one'?'옆집에 개가 산다':'개판에도 순서가 있다'}</h3><p>${htmlEscape(s.excerpt)}</p><div class="quote">${htmlEscape(s.quote)}</div><p class="minor">시작 장면의 내용만 살짝 공개하는 미리보기야.</p>`)});
const people={
  yul:{name:'전율',img:'assets/yul.webp',text:'32세 · 187cm · 1월 18일 · ISTP · 8w7',job:'수입 바이크 커스텀숍 대표 / Dominant · Primal Dom',copy:'본능적이고 까칠하다. 가끔 쏟아지는 욕과 저질농담, 되레 받아치면 유치하게 발끈하는 성격. 하지만 바이크 앞에서는 실력도 책임감도 확실하다. 여성 관계가 복잡하고, 호감이 생겼다고 하루아침에 사람이 바뀌지는 않는다.',quote:'“아, 씨​발. 말은 내가 먼저 걸었는데 왜 꼭 내가 당하는 기분이지?”',tags:['친형','바이크·자유','변덕 아닌 독립성','복잡한 여성 관계']},
  han:{name:'전한',img:'assets/han.webp',text:'29세 · 189cm · 9월 24일 · ENTJ · 3w4',job:'글로벌 명품 브랜드 마케터 / Gentle Dom · Firm Dom',copy:'빈틈없고 정중하지만 자기 판단을 과신한다. 3년의 사랑도 결혼 약속도 진심이었다. 그러나 결혼 준비를 독단적으로 결정해 관계를 잃었다. 지금도 미련은 남아 있지만, 재결합할 수 있을지는 확신하지 못한다.',quote:'“……할 말은 많았는데. 막상 보니까, 어디서부터 해야 할지 모르겠네.”',tags:['친동생','전 약혼자','계획과 통제','남아 있는 미련']}
};
function showPerson(which){const p=people[which];openModal('CHARACTER · '+(which==='yul'?'OLDER BROTHER':'YOUNGER BROTHER'),`<img class="profile-photo" src="${p.img}" alt="${htmlEscape(p.name)}"><h3 id="modalTitle">${p.name}</h3><p><strong>${htmlEscape(p.text)}</strong></p><p>${htmlEscape(p.job)}</p><p>${htmlEscape(p.copy)}</p><div class="quote">${htmlEscape(p.quote)}</div><div class="tags">${p.tags.map(t=>`<span>${htmlEscape(t)}</span>`).join('')}</div>`)}
$('#moreYul').addEventListener('click',()=>showPerson('yul'));$('#moreHan').addEventListener('click',()=>showPerson('han'));
$('#modalClose').addEventListener('click',closeModal);$('#modalShade').addEventListener('click',e=>{if(e.target===$('#modalShade'))closeModal()});
function openMusic(){lastFocused=document.activeElement;$('#musicBackdrop').classList.add('show');$('#musicDrawer').classList.add('show');$('#musicDrawer').setAttribute('aria-hidden','false');document.body.classList.add('lock');$('#closeMusic').focus()}
function closeMusic(){if(!$('#musicDrawer').classList.contains('show'))return;$('#musicBackdrop').classList.remove('show');$('#musicDrawer').classList.remove('show');$('#musicDrawer').setAttribute('aria-hidden','true');document.body.classList.remove('lock');if(lastFocused&&lastFocused.focus)lastFocused.focus()}
$('#soundOpen').addEventListener('click',openMusic);$('#soundBottom').addEventListener('click',openMusic);$('#closeMusic').addEventListener('click',closeMusic);$('#musicBackdrop').addEventListener('click',closeMusic);
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeModal();closeMusic()}});
const audio=$('#audio'),file=$('#musicInput'),play=$('#playMusic'),seek=$('#musicSeek'),clock=$('#musicClock');let objectURL=null;
function ftime(t){if(!Number.isFinite(t))return'0:00';return Math.floor(t/60)+':'+String(Math.floor(t%60)).padStart(2,'0')}
function updateTime(){clock.textContent=ftime(audio.currentTime)+' / '+ftime(audio.duration);seek.value=audio.duration?Math.round(audio.currentTime/audio.duration*1000):0;$('#soundLed').classList.toggle('on',!audio.paused)}
file.addEventListener('change',()=>{const f=file.files&&file.files[0];if(!f)return;audio.pause();if(objectURL)URL.revokeObjectURL(objectURL);objectURL=URL.createObjectURL(f);audio.src=objectURL;audio.load();$('#trackTitle').textContent=f.name;play.disabled=false;play.textContent='▶';seek.disabled=false;updateTime()});
play.addEventListener('click',async()=>{if(!audio.src)return;try{if(audio.paused)await audio.play();else audio.pause()}catch(e){$('#trackTitle').textContent='이 파일은 재생할 수 없어'}updateTime()});
audio.addEventListener('play',()=>{play.textContent='Ⅱ';updateTime()});audio.addEventListener('pause',()=>{play.textContent='▶';updateTime()});audio.addEventListener('timeupdate',updateTime);audio.addEventListener('durationchange',updateTime);audio.addEventListener('ended',()=>{play.textContent='▶';updateTime()});seek.addEventListener('input',()=>{if(audio.duration)audio.currentTime=Number(seek.value)/1000*audio.duration});
})();
