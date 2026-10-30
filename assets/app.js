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
let openMusicPanel=null;
function setMusicTab(tab){
  openMusicPanel=(openMusicPanel===tab?null:tab);
  const lyrics=openMusicPanel==='lyrics',list=openMusicPanel==='playlist';
  $('#playlistPanel').hidden=!list;$('#lyricsPanel').hidden=!lyrics;
  $('#playlistTab').classList.toggle('is-active',list);
  $('#lyricsTab').classList.toggle('is-active',lyrics);
  $('#playlistTab').setAttribute('aria-expanded',String(list));
  $('#lyricsTab').setAttribute('aria-expanded',String(lyrics));
  $('#musicDrawer').classList.toggle('expanded',Boolean(openMusicPanel));
  $('#closeMusic').hidden=!openMusicPanel;
}
function openMusic(tab='playlist'){setMusicTab(tab)}
function closeMusic(){if(openMusicPanel)setMusicTab(openMusicPanel)}
$('#soundOpen').addEventListener('click',()=>openMusic('playlist'));
$('#soundBottom').addEventListener('click',()=>openMusic('playlist'));
$('#closeMusic').addEventListener('click',closeMusic);
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeModal();closeMusic()}});

const audio=$('#audio'),play=$('#playMusic'),seek=$('#musicSeek'),clock=$('#musicElapsed'),durationText=$('#musicDuration');
const playlist=[{"title":"말은 반대로","durationSec":262,"src":"assets/music/01_mareun_bandaero.mp3","lyrics":"VERSE 1\n\n별 뜻 없이 던진 말이\n밤이 되면 자꾸 생각나\n웃고 넘긴 짧은 순간이\n이상하게 오래 남아\n아무 일도 아닌 것처럼\n괜히 더 크게 웃었어\n돌아서서 몇 걸음 만에\n발끝부터 느려졌어\n\nPRE-CHORUS\n\n한 걸음이면 가까워질 텐데\n한마디면 다 들킬 것 같아\n잘도 하던 그 많은 말들이\n네 앞에선 왜 말을 안 들어\n\nCHORUS\n\n말은 반대로, 맘은 네게로\n돌아서 놓고 또 제자리로\n아니라고, 아니라고 해도\n끝내 너를 향해 기울어\n웃음은 가볍게, 밤은 더 길게\n못다 한 말들만 깊어지네\n사소한 한 번의 농담이\n나를 여기까지 데려왔네\n\nVERSE 2\n\n어디까지 장난인 건지\n어디부터 진심인 건지\n내가 먼저 던진 말끝에\n내가 먼저 걸려 넘어져\n괜히 다른 얘길 꺼내고\n괜찮다는 말로 덮어도\n하루 종일 참아낸 마음이\n밤이 되면 다시 고개를 들어\n\nPRE-CHORUS\n\n다가서면 다 무너질까 봐\n돌아서면 다 끝날까 봐\n아무렇지 않던 그 이름이\n왜 이토록 어려운 걸까\n\nCHORUS\n\n말은 반대로, 맘은 네게로\n돌아서 놓고 또 제자리로\n아니라고, 아니라고 해도\n끝내 너를 향해 기울어\n웃음은 가볍게, 밤은 더 길게\n못다 한 말들만 깊어지네\n사소한 한 번의 농담이\n나를 여기까지 데려왔네\n\nBRIDGE\n\n비겁했던 건 내 쪽이었지\n모든 이유를 핑계로 돌렸지\n멀어지려 두 걸음 물러서면\n네 생각은 세 걸음 다가왔지\n\nFINAL CHORUS\n\n말은 반대로, 맘은 네게로\n말은 반대로, 맘은 네게로\n돌아서 놓고 또 제자리로\n아니라고, 아니라고 해도\n결국 너를 향해 기울어\n웃음은 가볍게, 밤은 더 길게\n이젠 숨긴 마음도 들리는데\n다 알면서 모르는 척하던\n나를 너는 어떻게 볼까\n\nOUTRO\n\n말은 반대로\n마음은 네게로"},{"title":"한 발 늦게","durationSec":197,"src":"assets/music/02_hanbal_neutge.mp3","lyrics":"VERSE 1\n\n말은 늘 먼저 튀어나가\n미안함은 뒤늦게 와\n웃고 넘긴 그 한마디가\n밤이 깊어도 안 지워져\n가까우면 괜히 멀어져\n멀어지면 또 돌아봐\n정해 둔 길이 분명한데\n발끝은 자꾸 딴 데로 가\n\nPRE-CHORUS\n\n딴소리만 늘어놓고\n정작 할 말은 삼켜 놔\n아닌 척 눈을 돌릴수록\n왜 네 쪽으로만 가\n\nCHORUS\n\n한 발 늦게, 한 발 더 네게\n안 된다고 할수록 더 가깝게\n웃어넘겨, 다시 넘겨\n진심은 왜 꼭 말끝에 걸려\nOut of line, out of time\n한숨은 짧고 밤은 길어\n아무렇지 않게 웃다가\n또 너에게 들켜 버려\n\nVERSE 2\n\n잘난 척하던 내 하루는\n잘난 척하던 내 하루는\n한 번의 침묵에 무너져\n다 맞는 말만 골라 하고\n정작 중요한 건 놓쳐\n그때는 몰랐던 표정도\n이제 와 자꾸 떠올라\n손끝에 남은 그 버릇이\n나를 어제로 데려가\n\nPRE-CHORUS\n\n말 한마디 고르는 동안\n또 한 계절이 지나가\n너무 늦기 전에 한 번\n제대로 묻고 싶은데\n\nCHORUS\n\n한 발 늦게, 한 발 더 네게\n안 된다고 할수록 더 가깝게\n웃어넘겨, 다시 넘겨\n진심은 왜 꼭 말끝에 걸려\nOut of line, out of time\n한숨은 짧고 밤은 길어\n아무렇지 않게 웃다가\n또 너에게 들켜 버려\n\nBRIDGE\n\n잡으려 하면 멀어지고\n놓으려 하면 더 선명해\n쉬운 말들은 다 해놓고\n어려운 말만 남겨 뒀네\n틀린 걸까, 늦은 걸까\n틀린 걸까, 늦은 걸까\n정답은 아직 모르지만\n오늘만큼은 그저 한 번\n솔직해지고 싶은데\n\nFINAL CHORUS\n\n한 발 늦게, 한 발 더 네게\n아니란 말 대신 조금 솔직하게\n웃어넘겨, 다시 넘겨\n그럴수록 더 깊이 남는 걸\nOut of line, out of time\n이젠 피할 이유도 없어\n아무렇지 않은 척하다\n결국 너에게 들켜 버려\n\nOUTRO\n\n한 발 늦게\n그래도 네게"},{"title":"Bad Timing","durationSec":192,"src":"assets/music/03_bad_timing.mp3","lyrics":"VERSE 1\n\n별말 아닌 척 던진 농담\n두 배로 돌아와 꽂혀\n말끝을 잡아 보려다가\n내가 먼저 박자를 놓쳐\n그만하잔 말이 무색해\n시계는 자꾸 뒤로 밀려\n오늘도 쉽게 끝날 줄 알았어\n웃기게, 여전히 여기\n\nPRE-CHORUS\n\n조금 비켜서면 되는데\n왜 거기서 또 마주쳐\n누가 먼저랄 것도 없이\n같은 순간 웃어 버려\n\nCHORUS\n\nBad timing, why am I smiling?\n멀쩡하던 말이 다 꼬이지\n네가 한마디, 내가 두 마디\n끝날 듯 말 듯 다시 시작이지\nBad timing, keep it coming\n어긋난 박자도 춤이 되지\n답은 내일로 미뤄 둬\n오늘은 한마디 더, one more\n\nPOST-CHORUS\n\nOne more, one more\n딱 한마디 더\nOne more, one more\n끝나지 않는 이 밤\n\nVERSE 2\n\n맞는 말만 골랐던 날엔\n가장 쉬운 말을 놓쳤어\n이유를 하나씩 더할수록\n마음은 자꾸 멀어졌어\n가볍게 흘려보낸 밤과\n끝내 못 꺼낸 그 한마디\n서로 다른 모양의 후회가\n같은 멜로디에 겹쳐져\n\nPRE-CHORUS\n\n잠깐의 웃음 틈 사이에\n숨겨 둔 말이 흔들려\n정답보다 더 어려운 건\n네 얘길 끝까지 듣는 일\n\nCHORUS\n\nBad timing, why am I smiling?\n멀쩡하던 말이 다 꼬이지\n네가 한마디, 내가 두 마디\n끝날 듯 말 듯 다시 시작이지\nBad timing, keep it coming\n어긋난 박자도 춤이 되지\n답은 내일로 미뤄 둬\n오늘은 한마디 더, one more\n\nBRIDGE\n\n선명한 건 가끔 틀리고\n흐릿한 게 더 오래 남아\n쉬운 말로 덮어 두기엔\n너무 많은 밤을 지나\n다 알겠다는 말 대신\n조금 더 들어 볼게\n서로 다른 속도라 해도\n꼭 틀린 건 아니니까\n\nFINAL CHORUS\n\nBad timing, why am I smiling?\n익숙했던 말이 또 꼬이지\n네가 한마디, 내가 두 마디\n어쩌면 우린 이게 더 편하지\nBad timing, still we're vibing\n맞지 않는 박자도 리듬이 되지\n아직 이름은 붙이지 마\n오늘은 한마디 더, one more\n\nPOST-CHORUS\n\nOne more, one more\n딱 한마디 더\nOne more, one more"}];
let currentSong=0, musicStarted=false, audioBlocked=false, pendingPlayToken=0;
const musicNotice=$('#musicNotice');
function ftime(t){if(!Number.isFinite(t))return '0:00';return Math.floor(t/60)+':'+String(Math.floor(t%60)).padStart(2,'0')}
function updateTime(){
 clock.textContent=ftime(audio.currentTime);
 durationText.textContent=ftime(Number.isFinite(audio.duration)?Math.round(audio.duration):playlist[currentSong].durationSec);
 const pct=Number.isFinite(audio.duration)&&audio.duration>0?audio.currentTime/audio.duration:0;
 seek.value=Math.round(pct*1000);
 seek.style.setProperty('--seek-progress',(pct*100).toFixed(2)+'%');
 const active=!audio.paused&&!audio.ended;
 $('#soundLed').classList.toggle('on',active);
 $('#playingDot').classList.toggle('on',active);
 $('#musicState').textContent=active?'재생 중':audioBlocked?'자동재생 대기 중':'일시정지';
 $('#soundTopLabel').textContent=active?'재생 중':'BGM';
 play.textContent=active?'Ⅱ':'▶'; play.setAttribute('aria-label',active?'일시정지':'재생');
}
function renderSongs(){
 const list=$('#songList');
 list.replaceChildren();
 playlist.forEach((track,i)=>{
  const b=document.createElement('button');
  b.type='button'; b.className='song-choice'+(i===currentSong?' is-playing':'');
  b.setAttribute('aria-current',i===currentSong?'true':'false');
  b.innerHTML=`<span class="song-number">${String(i+1).padStart(2,'0')}</span><span class="song-name"></span><span class="song-status">${ftime(track.durationSec)}</span>`;
  b.querySelector('.song-name').textContent=track.title;
  b.addEventListener('click',(e)=>{selectSong(i,true);if(e.detail>0)b.blur()});
  list.appendChild(b)
 });
}
function updateLyrics(){
 $('#lyricsTitle').textContent=playlist[currentSong].title;
 $('#lyricsText').textContent=playlist[currentSong].lyrics;
}
function selectSong(index,shouldPlay){
 currentSong=(index+playlist.length)%playlist.length;
 pendingPlayToken++;
 audio.src=playlist[currentSong].src;
 audio.load();
 $('#trackTitle').textContent=playlist[currentSong].title;
 $('#songCounter').textContent=String(currentSong+1).padStart(2,'0')+' / '+String(playlist.length).padStart(2,'0');
 updateLyrics();renderSongs();updateTime();
 if(shouldPlay)startPlayback(false);
}
function markBlocked(){
 audioBlocked=true;
 $('#musicDrawer').classList.add('needs-action');
 musicNotice.textContent='브라우저가 소리 있는 자동재생을 막았어요. 화면을 한 번 터치하거나 ▶를 누르면 시작돼요.';
 
 updateTime();
}
async function startPlayback(auto){
 const token=++pendingPlayToken;
 try{
  await audio.play();
  if(token!==pendingPlayToken)return;
  musicStarted=true;audioBlocked=false;$('#musicDrawer').classList.remove('needs-action');
  
  musicNotice.textContent='3곡 순차 재생 · 마지막 곡 다음은 첫 곡 · 가사는 탭에서 전체 보기';
  updateTime();
 }catch(err){
  if(token!==pendingPlayToken)return;
  if(err&&(err.name==='NotAllowedError'||err.name==='AbortError'&&auto))markBlocked();
  else{musicNotice.textContent='음원 파일을 재생하지 못했어요. ZIP 속 assets/music 폴더를 확인해 주세요.';updateTime()}
 }
}
function userGestureFallback(e){
 if(!audioBlocked)return;
 if(e.target.closest('#prevMusic,#playMusic,#nextMusic,.song-choice,#musicSeek'))return;
 startPlayback(false);
}
// Some browsers disallow unmuted autoplay; any first genuine page interaction offers a fallback.
document.addEventListener('pointerdown',userGestureFallback,{passive:true});
document.addEventListener('keydown',e=>{if(['Tab','Shift','Escape'].includes(e.key))return;userGestureFallback(e)});

play.addEventListener('click',async e=>{
 if(audio.paused)startPlayback(false);
 else{pendingPlayToken++;audio.pause();audioBlocked=false;musicNotice.textContent='일시정지';$('#musicDrawer').classList.remove('needs-action');}
 if(e.detail>0)e.currentTarget.blur();
});
$('#prevMusic').addEventListener('click',e=>{selectSong(currentSong-1,true);if(e.detail>0)e.currentTarget.blur()});
$('#nextMusic').addEventListener('click',e=>{selectSong(currentSong+1,true);if(e.detail>0)e.currentTarget.blur()});
audio.addEventListener('ended',()=>selectSong(currentSong+1,true));
audio.addEventListener('play',updateTime);
audio.addEventListener('pause',updateTime);
audio.addEventListener('timeupdate',updateTime);
audio.addEventListener('durationchange',updateTime);
audio.addEventListener('loadedmetadata',updateTime);
audio.addEventListener('error',()=>{musicNotice.textContent='음악을 불러오지 못했어요. 파일 경로를 확인해 주세요.'});
seek.addEventListener('input',()=>{if(Number.isFinite(audio.duration)&&audio.duration>0)audio.currentTime=Number(seek.value)/1000*audio.duration});
$('#playlistTab').addEventListener('click',()=>setMusicTab('playlist'));
$('#lyricsTab').addEventListener('click',()=>setMusicTab('lyrics'));
selectSong(0,false);
// Make a genuine unmuted play attempt immediately on entering the homepage.
startPlayback(true);
})();

/* Fictional social feeds; no outbound Instagram links or network requests. */
(()=>{
const data={"yul":[{"src":"assets/ig/yul_01.webp","title":"샵은 늘 바쁨","caption":"오늘도 볼트 하나에 두 시간.","sub":"작업하다 말 걸면 안 들리는 척함","date":"2026.10.28","likes":142,"comments":[{"author":"shopmate.park","text":"이 사진 괜찮네요ㅋㅋ"},{"author":"daylog.seoul","text":"좋아요 ✨"}]},{"src":"assets/ig/yul_02.webp","title":"퇴근","caption":"오늘은 이쪽.","sub":"집 가기 전에 한 바퀴.","date":"2026.10.25","likes":387,"comments":[{"author":"shopmate.park","text":"이 사진 괜찮네요ㅋㅋ"},{"author":"daylog.seoul","text":"좋아요 ✨"}]},{"src":"assets/ig/yul_03.webp","title":"편의점","caption":"저녁은 대충.","sub":"라면이든 뭐든, 먹으면 그만.","date":"2026.10.21","likes":96,"comments":[{"author":"shopmate.park","text":"이 사진 괜찮네요ㅋㅋ"},{"author":"jeon.han","text":"밥 좀 제대로 먹어."}]},{"src":"assets/ig/yul_04.webp","title":"짐","caption":"끝.","sub":"운동 끝나고 물 한 병.","date":"2026.10.17","likes":311,"comments":[{"author":"shopmate.park","text":"이 사진 괜찮네요ㅋㅋ"},{"author":"daylog.seoul","text":"좋아요 ✨"}]},{"src":"assets/ig/yul_05.webp","title":"잠깐","caption":"잠깐 쉬는 중.","sub":"담배 한 대 피우고 다시 일.","date":"2026.10.13","likes":221,"comments":[{"author":"shopmate.park","text":"이 사진 괜찮네요ㅋㅋ"},{"author":"daylog.seoul","text":"좋아요 ✨"}]},{"src":"assets/ig/yul_06.webp","title":"야간 주행","caption":"길 막히는 시간은 피해서.","sub":"밤 공기가 좀 낫네.","date":"2026.10.09","likes":499,"comments":[{"author":"shopmate.park","text":"이 사진 괜찮네요ㅋㅋ"},{"author":"daylog.seoul","text":"좋아요 ✨"}]},{"src":"assets/ig/yul_07.webp","title":"집","caption":"물 좀 마시자.","sub":"집에서도 그냥 대충.","date":"2026.10.05","likes":81,"comments":[{"author":"shopmate.park","text":"이 사진 괜찮네요ㅋㅋ"},{"author":"daylog.seoul","text":"좋아요 ✨"}]},{"src":"assets/ig/yul_08.webp","title":"정비 끝","caption":"이건 잘 나왔다.","sub":"손댄 만큼 달라지는 게 좋지.","date":"2026.10.01","likes":262,"comments":[{"author":"shopmate.park","text":"이 사진 괜찮네요ㅋㅋ"},{"author":"daylog.seoul","text":"좋아요 ✨"}]},{"src":"assets/ig/yul_09.webp","title":"새벽","caption":"잠 안 와서 나온 건 아니고.","sub":"나가려던 참이었어.","date":"2026.09.28","likes":158,"comments":[{"author":"shopmate.park","text":"이 사진 괜찮네요ㅋㅋ"},{"author":"daylog.seoul","text":"좋아요 ✨"}]}],"han":[{"src":"assets/ig/han_01.webp","title":"오전","caption":"일정 시작.","sub":"미팅 두 건, 리뷰 하나.","date":"2026.10.27","likes":216,"comments":[{"author":"studio.team","text":"고생하셨습니다 🙌"},{"author":"daylog.seoul","text":"좋아요 ✨"}]},{"src":"assets/ig/han_02.webp","title":"이동 중","caption":"다음 일정까지 잠깐.","sub":"한숨 돌리고 다시.","date":"2026.10.23","likes":97,"comments":[{"author":"studio.team","text":"고생하셨습니다 🙌"},{"author":"daylog.seoul","text":"좋아요 ✨"}]},{"src":"assets/ig/han_03.webp","title":"퇴근","caption":"퇴근은 했는데.","sub":"생각은 아직 회사에 두고 왔나 봐.","date":"2026.10.18","likes":312,"comments":[{"author":"studio.team","text":"고생하셨습니다 🙌"},{"author":"daylog.seoul","text":"좋아요 ✨"}]},{"src":"assets/ig/han_04.webp","title":"회의 끝","caption":"예정보다 길어졌다.","sub":"시간표는 다시 정리해야겠네.","date":"2026.10.14","likes":189,"comments":[{"author":"studio.team","text":"고생하셨습니다 🙌"},{"author":"daylog.seoul","text":"좋아요 ✨"}]},{"src":"assets/ig/han_05.webp","title":"잠깐","caption":"별일 없는 날.","sub":"사진은 오랜만.","date":"2026.10.10","likes":144,"comments":[{"author":"studio.team","text":"고생하셨습니다 🙌"},{"author":"daylog.seoul","text":"좋아요 ✨"}]},{"src":"assets/ig/han_06.webp","title":"저녁","caption":"조용한 하루 끝.","sub":"내일은 조금 덜 바쁘길.","date":"2026.10.06","likes":108,"comments":[{"author":"studio.team","text":"고생하셨습니다 🙌"},{"author":"jeon.yul","text":"또 일하냐."}]},{"src":"assets/ig/han_07.webp","title":"주말","caption":"계획 없는 오후도 나쁘지 않네.","sub":"가끔은.","date":"2026.10.02","likes":257,"comments":[{"author":"studio.team","text":"고생하셨습니다 🙌"},{"author":"daylog.seoul","text":"좋아요 ✨"}]},{"src":"assets/ig/han_08.webp","title":"이른 퇴근","caption":"오랜만에 해 지기 전에.","sub":"늦지 않은 귀가.","date":"2026.09.29","likes":190,"comments":[{"author":"studio.team","text":"고생하셨습니다 🙌"},{"author":"daylog.seoul","text":"좋아요 ✨"}]},{"src":"assets/ig/han_09.webp","title":"휴식","caption":"사진 찍힌 줄도 몰랐네.","sub":"쉬는 날은 드물다.","date":"2026.09.22","likes":329,"comments":[{"author":"studio.team","text":"고생하셨습니다 🙌"},{"author":"daylog.seoul","text":"좋아요 ✨"}]}]};
const people={yul:{name:'전율',handle:'jeon.yul',bio:'JEON YUL / 성수동\n커스텀 바이크 · 야간 주행 · 가끔 사람',avatar:'assets/yul.webp',following:'271',followers:'8,426',highlights:[['WORK',0,7],['RIDE',1,5],['OFF',2,6]]},han:{name:'전한',handle:'jeon.han',bio:'JEON HAN\nBrand marketing / Seoul\nWork & moments between',avatar:'assets/han.webp',following:'418',followers:'3,179',highlights:[['WORK',0,3],['DAILY',2,5],['REST',6,8]]}};
let who='yul',index=0,story=0,storyImages=[],liked=new Set(),saved=new Set();
const el=id=>document.getElementById(id);const shade=el('igShade'),postShade=el('igPostShade'),storyShade=el('igStoryShade');
const lock=()=>document.body.classList.add('ig-open');const unlock=()=>{if(!shade.classList.contains('open')&&!postShade.classList.contains('open')&&!storyShade.classList.contains('open'))document.body.classList.remove('ig-open')};
function render(w){who=w;const p=people[w],posts=data[w];el('igTitle').textContent='@'+p.handle;el('igProfile').innerHTML=`<div class="ig-profile-top"><img class="ig-avatar" src="${p.avatar}" alt="${p.name}"><div class="ig-profile-right"><div class="ig-username">${p.handle}</div><div class="ig-stat-row"><div><b>${posts.length}</b>게시물</div><div><b>${p.followers}</b>팔로워</div><div><b>${p.following}</b>팔로잉</div></div></div></div><div class="ig-bio"><b>${p.name}</b>${p.bio}</div>`;
 document.querySelectorAll('[data-ig-switch]').forEach(b=>b.classList.toggle('active',b.dataset.igSwitch===w));
 el('igHighlights').replaceChildren();p.highlights.forEach(([title,a,b])=>{const btn=document.createElement('button');btn.type='button';btn.className='ig-highlight';btn.innerHTML=`<img src="${posts[a].src}" alt=""><span>${title}</span>`;btn.onclick=()=>openStory([a,b],title);el('igHighlights').append(btn)});
 el('igGrid').replaceChildren();posts.forEach((item,i)=>{const btn=document.createElement('button');btn.type='button';btn.setAttribute('aria-label',item.title+' 게시물 보기');const img=document.createElement('img');img.src=item.src;img.alt=item.title;img.loading='lazy';btn.append(img);btn.onclick=()=>openPost(i);el('igGrid').append(btn)})
}
function open(w){render(w);shade.classList.add('open');shade.setAttribute('aria-hidden','false');lock();shade.querySelector('.ig-shell').focus()}
function close(){shade.classList.remove('open');shade.setAttribute('aria-hidden','true');closePost();closeStory();unlock()}
function openPost(i){index=i;const p=people[who],d=data[who][i],key=who+':'+i;el('igPostHandle').textContent='@'+p.handle;el('igPostImage').src=d.src;el('igPostImage').alt=d.title;el('igPostLikes').textContent='좋아요 '+(d.likes+(liked.has(key)?1:0)).toLocaleString()+'개';el('igPostCaption').textContent=d.caption+'  '+d.sub;el('igPostDate').textContent=d.date;el('igHeart').textContent=liked.has(key)?'♥':'♡';el('igHeart').classList.toggle('liked',liked.has(key));el('igBookmark').textContent=saved.has(key)?'▣':'♧';el('igComments').replaceChildren();d.comments.forEach(c=>{const line=document.createElement('div');const bold=document.createElement('b');bold.textContent=c.author+'  ';line.append(bold,document.createTextNode(c.text));el('igComments').append(line)});postShade.classList.add('open');postShade.setAttribute('aria-hidden','false');lock()}
function closePost(){postShade.classList.remove('open');postShade.setAttribute('aria-hidden','true');unlock()}
function openStory(ids,title){storyImages=ids;story=0;el('igStoryTitle').textContent=people[who].handle+' · '+title;renderStory();storyShade.classList.add('open');storyShade.setAttribute('aria-hidden','false');lock()}
function renderStory(){const d=data[who][storyImages[story]];el('igStoryImage').src=d.src;el('igStoryText').textContent=d.caption;el('igStoryPrev').disabled=story===0;el('igStoryNext').textContent=story===storyImages.length-1?'닫기':'다음 →'}
function closeStory(){storyShade.classList.remove('open');storyShade.setAttribute('aria-hidden','true');unlock()}
document.querySelectorAll('[data-open-ig]').forEach(b=>b.onclick=()=>open(b.dataset.openIg));document.querySelectorAll('[data-ig-switch]').forEach(b=>b.onclick=()=>render(b.dataset.igSwitch));el('igClose').onclick=close;el('igPostBack').onclick=closePost;el('igPostExit').onclick=closePost;el('igStoryClose').onclick=closeStory;el('igStoryPrev').onclick=()=>{story=Math.max(0,story-1);renderStory()};el('igStoryNext').onclick=()=>{if(story>=storyImages.length-1)closeStory();else{story++;renderStory()}};
el('igHeart').onclick=()=>{const key=who+':'+index;liked.has(key)?liked.delete(key):liked.add(key);openPost(index)};el('igBookmark').onclick=()=>{const key=who+':'+index;saved.has(key)?saved.delete(key):saved.add(key);openPost(index)};
shade.addEventListener('click',e=>{if(e.target===shade)close()});postShade.addEventListener('click',e=>{if(e.target===postShade)closePost()});storyShade.addEventListener('click',e=>{if(e.target===storyShade)closeStory()});document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(storyShade.classList.contains('open'))closeStory();else if(postShade.classList.contains('open'))closePost();else if(shade.classList.contains('open'))close()}});
})();
