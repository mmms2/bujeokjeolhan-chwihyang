(()=>{
'use strict';
const {profiles,posts}=window.MIPIL_SOCIAL;
const layer=document.getElementById('socialExplorer'),root=document.getElementById('simRoot');
const esc=s=>String(s??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const paths={back:'M15 18l-6-6 6-6',close:'M6 6l12 12M18 6L6 18',down:'M6 9l6 6 6-6',next:'M9 6l6 6-6 6',heart:'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z',comment:'M21 11.5a9 9 0 0 1-9 9 9.8 9.8 0 0 1-4-.9L3 21l1.5-4.7A9 9 0 1 1 21 11.5Z',share:'M22 2L9 15M22 2l-7 20-6-7-7-6 20-7Z',bookmark:'M6 3h12v18l-6-4-6 4V3Z',grid:'M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3zM15 15h6v6h-6z',tag:'M8 5h8l2 3h3v13H3V8h3l2-3ZM12 10a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM7 20v-1a5 5 0 0 1 10 0v1',search:'M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',home:'M3 10l9-8 9 8v11h-6v-8H9v8H3V10Z',music:'M9 18V5l12-3v13M9 8l12-3M9 18a3 3 0 1 1-3-3c1.7 0 3 1.3 3 3ZM21 15a3 3 0 1 1-3-3c1.7 0 3 1.3 3 3Z',pin:'M9 3h6l-1 6 4 4v2H6v-2l4-4-1-6ZM12 15v7',stack:'M7 3h14v14M3 7h14v14H3V7Z',pause:'M8 4v16M16 4v16',play:'M8 3l12 9-12 9V3Z',user:'M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM4 21v-2a8 8 0 0 1 16 0v2',check:'M4 12l5 5L20 6',copy:'M9 3h12v14H9V3ZM5 7H3v14h14v-2'};
function icon(n,fill=false){return `<svg viewBox="0 0 24 24" aria-hidden="true" ${fill?'class="svg-fill"':''}><path d="${paths[n]||paths.user}"/></svg>`}
let store={likes:{},saves:{},follows:{},commentLikes:{},comments:{},storyLikes:{},messages:{},blocked:{},dmCount:{},dmWarnings:{},mutual:{},likeReactions:{},followGreetings:{}};
try{localStorage.removeItem('mipil.social.v3')}catch(_){}
const persist=()=>{}; // Fresh SNS state on every full website load
const followEvents={};
const likeEvents={};
let screens=[],current=null,opened=false,session='',skipPop=false,focusBefore=null,storyTimer=null,storyStarted=0,storyRemaining=7000,toastTimer;
const handles=Object.fromEntries(Object.entries(profiles).map(([id,p])=>[p.handle,id]));
function av(id,cls=''){const p=profiles[id]||profiles.you;return p.avatar?`<img class="sim-avatar ${cls}" src="${p.avatar}" alt="${esc(p.name)}" loading="lazy">`:`<span class="sim-avatar ${cls}" style="background:${p.color||'#61505d'}">${icon('user')}</span>`}
function avButton(id){return `<button class="sim-avatar-btn" data-action="profile" data-id="${id}" aria-label="${esc(profiles[id]?.name)} 프로필">${av(id)}</button>`}
function handle(id){return `<button class="sim-handle" data-action="profile" data-id="${id}">${esc(profiles[id]?.handle||id)}</button>`}
function mentions(text){return esc(text).replace(/@([a-z0-9_.]+)/gi,(full,h)=>handles[h]?`<button class="sim-handle sim-blue" data-action="profile" data-id="${handles[h]}">${full}</button>`:full)}
function follow(id){const yes=!!store.follows[id];return `<button class="sim-follow ${yes?'followed':''}" data-action="follow" data-id="${id}" aria-pressed="${yes}">${yes&&store.mutual?.[id]?'맞팔로우 중':yes?'팔로잉':'팔로우'}</button>`}
function userComments(pid){return store.comments[pid]||[]}
function allComments(pid){return [...(posts[pid].comments||[]),...userComments(pid).filter(x=>!x.parent)]}
function replies(pid,c){return [...(c.replies||[]),...userComments(pid).filter(x=>x.parent===c.id)]}
function commentCount(pid){return allComments(pid).reduce((n,c)=>n+1+replies(pid,c).length,0)}
function date(s){const [y,m,d]=s.split('-');return `${y}년 ${+m}월 ${+d}일`}
function saveScroll(){if(current){current.scroll=root.querySelector('.sim-scroll')?.scrollTop||0;const inp=root.querySelector('textarea');if(inp)current.draft=inp.value}}
function setScreen(view){current=view;render();requestAnimationFrame(()=>{let sc=root.querySelector('.sim-scroll');if(sc)sc.scrollTop=view.type==='dm'?(view.scroll===undefined?sc.scrollHeight:view.scroll):(view.scroll||0)})}
function navigate(view){saveScroll();screens.push(view);history.pushState({mipilSNS:session,depth:screens.length},'',location.href);setScreen(view)}
function open(id='yul'){if(opened){navigate({type:'profile',id});return}focusBefore=document.activeElement;opened=true;session='sns'+Date.now();screens=[];layer.classList.add('open');layer.setAttribute('aria-hidden','false');document.body.classList.add('social-open');document.querySelector('main.site').inert=true;syncDock();navigate({type:'profile',id});root.querySelector('.sim-top-name')?.focus({preventScroll:true})}
function hide(){opened=false;clearTimeout(storyTimer);layer.classList.remove('open');layer.setAttribute('aria-hidden','true');document.body.classList.remove('social-open');document.querySelector('main.site').inert=false;focusBefore?.focus({preventScroll:true});syncDock()}
function close(){if(!opened)return;const depth=screens.length;hide();if(depth){skipPop=true;history.go(-depth)}screens=[];current=null}
function back(){if(screens.length>1)history.back();else close()}
window.addEventListener('popstate',e=>{if(skipPop){skipPop=false;return}if(!opened)return;if(e.state?.mipilSNS===session&&e.state.depth>0){screens.length=e.state.depth;setScreen(screens.at(-1))}else hide()});
function syncDock(){const h=document.getElementById('musicDrawer').getBoundingClientRect().height;document.documentElement.style.setProperty('--music-clearance',Math.ceil(h+20)+'px')}
new ResizeObserver(syncDock).observe(document.getElementById('musicDrawer'));window.addEventListener('resize',syncDock);syncDock();
function toolbar(label){return `<header class="sim-top"><button class="sim-icon" data-action="back" aria-label="뒤로">${icon('back')}</button><button class="sim-top-name" data-action="accounts" aria-label="계정 목록">${esc(label)}${current.type==='profile'?icon('down'):''}</button><button class="sim-icon sim-notify-trigger" id="notifyOpen" data-action="notices" aria-label="알림 보기" aria-expanded="false">${icon('heart')}<span class="sim-unread-dot" id="notifyDot" hidden></span></button><button class="sim-close" data-action="close" aria-label="SNS 닫기">닫기 ×</button></header>`}
function bottom(){return `<nav class="sim-bottom" aria-label="SNS 메뉴"><button data-action="feed" class="${current.type==='feed'?'selected':''}" aria-label="피드">${icon('home')}</button><button data-action="search" class="${current.type==='search'?'selected':''}" aria-label="계정 검색">${icon('search')}</button><button data-action="saved" class="${current.type==='saved'?'selected':''}" aria-label="저장한 게시물">${icon('bookmark')}</button><button data-action="activity" class="${current.type==='activity'?'selected':''}" aria-label="내 활동">${icon('heart')}</button><button data-action="profile" data-id="you" aria-label="내 프로필">${av('you')}</button></nav>`}
function tagged(id){const h=profiles[id].handle;return Object.values(posts).filter(p=>p.author!==id&&(p.caption.includes('@'+h)||p.comments.some(c=>c.author===id))).map(p=>p.id)}
function grid(ids){if(!ids.length)return `<div class="sim-empty">${icon('grid')}아직 게시물이 없습니다.</div>`;return `<div class="sim-grid">${ids.map(pid=>{const p=posts[pid];return `<button class="sim-tile" data-action="post" data-id="${pid}" aria-label="${esc(profiles[p.author].name+' · '+p.caption.split('\n')[0])}"><img src="${p.images[0]}" alt="${esc(p.caption.split('\n')[0])}" loading="lazy">${p.pinned||p.images.length>1?`<span class="sim-tile-badge">${icon(p.pinned?'pin':'stack')}</span>`:''}</button>`}).join('')}</div>`}
function profileView(){const p=profiles[current.id],id=current.id,tab=current.tab||'posts';const count=p.posts.length;return `<section class="sim-profile"><div class="sim-profile-top"><button class="sim-profile-avatar ${!p.highlights.length?'no-story':''}" data-action="${p.highlights.length?'story':'avatar'}" data-id="${id}" data-group="0" aria-label="${esc(p.name)} ${p.highlights.length?'스토리':'프로필 사진'}">${av(id)}</button><div class="sim-profile-info"><h2 class="sim-profile-user">${esc(p.handle)}</h2><div class="sim-stats"><button data-action="grid-top"><b>${count}</b><span>게시물</span></button><button data-action="followers" data-id="${id}"><b>${(p.followers+(id==='you'?Object.values(store.mutual).filter(Boolean).length:(store.follows[id]?1:0))).toLocaleString()}</b><span>팔로워</span></button><button data-action="following" data-id="${id}"><b>${id==='you'?Object.keys(store.follows).filter(k=>store.follows[k]).length:p.following.toLocaleString()}</b><span>팔로잉</span></button></div></div></div><div class="sim-bio"><div class="sim-muted">${esc(p.category)}</div><div class="sim-bio-name">${esc(p.name)}</div>${mentions(p.bio)}</div><div class="sim-profile-actions">${id==='you'?`<button class="sim-secondary" data-action="saved">저장한 게시물</button><button class="sim-secondary" data-action="activity">내 활동</button>`:follow(id)+`<button class="sim-secondary" data-action="dm" data-id="${id}">메시지</button><button class="sim-secondary" data-action="connections" data-id="${id}">함께 아는 계정</button>`}</div></section>${p.highlights.length?`<div class="sim-highlights">${p.highlights.map((g,i)=>`<button class="sim-highlight" data-action="story" data-id="${id}" data-group="${i}"><img src="${posts[g.posts[0]].images[0]}" alt="${esc(g.title)} 스토리"><span>${esc(g.title)}</span></button>`).join('')}</div>`:''}<nav class="sim-profile-tabs" aria-label="프로필 게시물"><button data-action="profile-tab" data-tab="posts" class="${tab==='posts'?'on':''}" aria-label="게시물">${icon('grid')}<span>게시물</span></button><button data-action="profile-tab" data-tab="tagged" class="${tab==='tagged'?'on':''}" aria-label="연결된 게시물">${icon('tag')}<span>연결된 게시물</span></button></nav>${grid(tab==='posts'?p.posts:tagged(id))}`}
function postView(pid,feed=false){const p=posts[pid],person=profiles[p.author],ci=feed?0:current.slide||0,yes=!!store.likes[pid],saved=!!store.saves[pid];const comments=allComments(pid);return `<article class="sim-post"><div class="sim-post-header">${avButton(p.author)}<div class="sim-post-header-info">${handle(p.author)}<div class="sim-location">${esc(p.location)}</div></div>${p.author==='you'?'':`<button class="sim-icon" data-action="profile" data-id="${p.author}" aria-label="프로필 보기">${icon('next')}</button>`}</div><div class="${feed?'':'sim-post-layout'}"><div class="sim-media" data-media="${pid}"><img src="${p.images[ci]}" alt="${esc(person.name+' · '+p.caption.split('\n')[0])}">${p.images.length>1&&!feed?`<span class="sim-media-counter">${ci+1} / ${p.images.length}</span><button class="sim-media-prev" data-action="slide-prev" aria-label="이전 사진" ${ci===0?'hidden':''}>${icon('back')}</button><button class="sim-media-next" data-action="slide-next" aria-label="다음 사진" ${ci===p.images.length-1?'hidden':''}>${icon('next')}</button>`:''}</div><div class="sim-post-detail"><div class="sim-post-actions"><button class="sim-icon ${yes?'sim-liked':''}" data-action="like" data-id="${pid}" aria-label="${yes?'좋아요 취소':'좋아요'}" aria-pressed="${yes}">${icon('heart',yes)}</button><button class="sim-icon" data-action="comments" data-id="${pid}" aria-label="댓글 보기">${icon('comment')}</button><button class="sim-icon" data-action="share" data-id="${pid}" aria-label="게시물 링크 복사">${icon('share')}</button><button class="sim-icon save" data-action="save" data-id="${pid}" aria-label="${saved?'저장 취소':'게시물 저장'}" aria-pressed="${saved}">${icon('bookmark',saved)}</button></div><div class="sim-post-copy"><button class="sim-likes" data-action="likers" data-id="${pid}">좋아요 ${(p.likes+(yes?1:0)).toLocaleString()}개</button><p class="sim-caption">${handle(p.author)}${mentions(p.caption)}</p><button class="sim-all-comments" data-action="comments" data-id="${pid}">댓글 ${commentCount(pid)}개 모두 보기</button>${comments.slice(0,2).map(c=>`<div class="sim-comment-preview">${handle(c.author)}${mentions(c.text)}</div>`).join('')}<div class="sim-date">${date(p.date)}</div></div><div class="sim-inline-editor">${av('you')}<button data-action="comments" data-id="${pid}" data-focus="yes">댓글 달기…</button></div></div></div></article>`}
function commentRow(pid,c,isReply=false){const rs=isReply?[]:replies(pid,c);const key=pid+':'+c.id,liked=!!store.commentLikes[key],expanded=current.expanded?.includes(c.id);return `<div class="sim-comment" data-comment="${c.id}">${avButton(c.author)}<div class="sim-comment-body">${handle(c.author)}<span class="sim-comment-text">${mentions(c.text)}</span><div class="sim-comment-meta"><span>${esc(c.time||'방금')}</span><span>좋아요 ${c.likes+(liked?1:0)}개</span><button data-action="reply" data-id="${c.id}" data-author="${c.author}" data-parent="${isReply?(current.replyParent||''):c.id}">답글 달기</button></div>${rs.length?`<button class="sim-reply-toggle" data-action="toggle-replies" data-id="${c.id}">${expanded?'답글 숨기기':`답글 ${rs.length}개 보기`}</button>${expanded?`<div class="sim-replies">${rs.map(r=>commentRow(pid,{...r,_parent:c.id},true).replace('data-parent=""',`data-parent="${c.id}"`)).join('')}</div>`:''}`:''}</div><button class="sim-comment-heart ${liked?'sim-liked':''}" data-action="comment-like" data-id="${key}" aria-label="댓글 좋아요" aria-pressed="${liked}">${icon('heart',liked)}</button></div>`}
function commentsView(){const p=posts[current.id];return `<div class="sim-comments"><div class="sim-comment sim-comment-caption">${avButton(p.author)}<div class="sim-comment-body">${handle(p.author)}<span class="sim-comment-text">${mentions(p.caption)}</span><div class="sim-comment-meta">${date(p.date)}</div></div></div>${allComments(current.id).map(c=>commentRow(current.id,c)).join('')}</div>`}
function composer(){return `<div class="sim-compose-wrap">${current.replyTo?`<div class="sim-replying">@${esc(profiles[current.replyAuthor].handle)} 님에게 답글 남기는 중<button data-action="cancel-reply" aria-label="답글 취소">×</button></div>`:''}<form class="sim-compose" id="simCompose">${av('you')}<textarea name="comment" aria-label="댓글 입력" rows="1" maxlength="500" placeholder="${current.replyTo?'답글 달기…':'댓글 달기…'}">${esc(current.draft||'')}</textarea><button type="submit" ${!current.draft?.trim()?'disabled':''}>게시</button></form></div>`}
function accountRow(id){return `<div class="sim-account-row">${avButton(id)}<button class="account-main" data-action="profile" data-id="${id}"><strong>${esc(profiles[id].handle)}</strong><small>${esc(profiles[id].name)}${profiles[id].category?' · '+esc(profiles[id].category):''}</small></button>${id==='you'?'':follow(id)}</div>`}
function listView(){let ids=current.ids||Object.keys(profiles).filter(x=>x!=='you');if(current.type==='search'){const q=(current.query||'').toLowerCase();ids=ids.filter(id=>(profiles[id].name+' '+profiles[id].handle+' '+profiles[id].category).toLowerCase().includes(q))}return `${current.type==='search'?`<div class="sim-search"><input id="simSearch" type="search" placeholder="계정 검색" aria-label="계정 검색" value="${esc(current.query||'')}"></div>`:''}<div class="sim-list">${current.note?`<div class="sim-list-caption">${esc(current.note)}</div>`:''}${ids.length?ids.map(accountRow).join(''):'<div class="sim-empty">검색 결과가 없습니다.</div>'}</div>`}
function activityView(){const own=Object.entries(store.comments).flatMap(([pid,cs])=>cs.map(c=>({...c,pid})));const likes=Object.keys(store.likes).filter(k=>store.likes[k]);return `<h3 class="sim-directory-title">내가 남긴 댓글</h3><div class="sim-list">${own.length?own.map(c=>`<div class="sim-account-row">${av('you')}<button class="account-main" data-action="comments" data-id="${c.pid}"><strong>${esc(c.text)}</strong><small>@${esc(profiles[posts[c.pid].author].handle)}의 게시물 · ${c.parent?'답글':'댓글'}</small></button></div>`).join(''):'<div class="sim-empty">아직 남긴 댓글이 없습니다.</div>'}</div><h3 class="sim-directory-title">좋아요한 게시물</h3>${grid(likes)}`}
function storyView(){const p=profiles[current.id],group=p.highlights[current.group||0],idx=current.index||0,post=posts[group.posts[idx]];return `<div class="sim-story ${current.paused?'paused':''}"><img class="sim-story-image" src="${post.images[0]}" alt="${esc(post.caption)}"><div class="sim-story-shade"></div><div class="sim-story-bars">${group.posts.map((_,i)=>`<span class="${i<idx?'done':i===idx?'current':''}"><i></i></span>`).join('')}</div><div class="sim-story-user">${avButton(current.id)}${handle(current.id)}<span class="sim-small">${esc(group.title)}</span><button class="sim-icon" data-action="story-pause" aria-label="${current.paused?'스토리 재생':'스토리 일시정지'}">${icon(current.paused?'play':'pause')}</button></div><button class="sim-story-prev" data-action="story-prev" aria-label="이전 스토리"></button><button class="sim-story-next" data-action="story-next" aria-label="다음 스토리"></button><div class="sim-story-caption">${esc(post.caption)}</div></div>`}
function dmView(){const id=current.id,p=profiles[id],blocked=!!store.blocked[id];const messages=store.messages[id]||[];return `<div class="sim-dm"><div class="sim-dm-profile">${av(id)}<b>${esc(p.handle)}</b></div><div class="sim-dm-messages">${messages.length?messages.map(m=>`<div class="sim-bubble ${m.from==='you'?'mine':'theirs'}">${esc(m.text)}</div>`).join(''):`<div class="sim-empty">아직 메시지가 없어요</div>`}</div>${blocked?`<div class="sim-dm-block">이 계정에 메시지를 보낼 수 없습니다.</div>`:`<form id="simDmForm"><input name="message" maxlength="240" autocomplete="off" placeholder="메시지 보내기…" aria-label="DM 메시지"><button type="submit">보내기</button></form>`}</div>`}
function replyToDM(id,text){
 const arr=store.messages[id]||(store.messages[id]=[]);
 const norm=text.trim().toLowerCase().replace(/\s+/g,'');
 const past=arr.filter(m=>m.from==='you');
 const repeats=past.filter(m=>m.text.toLowerCase().replace(/\s+/g,'')===norm).length;
 const spam=repeats>=3 || (/^(야|ㅎ+|ㅋ+|답장|답해|뭐해|읽씹|대답|왜|.)$/i.test(norm)&&past.slice(-4).filter(m=>m.text.toLowerCase().replace(/\s+/g,'')===norm).length>=2);
 store.dmCount[id]=(store.dmCount[id]||0)+(spam?1:0);
 if(!spam)store.dmCount[id]=Math.max(0,(store.dmCount[id]||0)-1);
 const n=store.dmCount[id];
 const yul={greet:['어, 뭐야','웬일이냐','왜, 무슨 일인데'],work:['가게. 왜?','작업하다가 잠깐 쉬는 중','바이크 만지는 중인데'],compliment:['칭찬을 그렇게 하냐','알았어. 고맙다','뭐, 보는 눈은 있네'],flirt:['갑자기 왜 이래','야, 그런 말은 또 어디서 배웠냐','그건 좀 웃기네'],ask:['뭘 물어보려는 건데','그래서 궁금한 게 뭔데','일단 말해 봐'],tease:['너 지금 시비 거는 거냐','말 진짜 안 지네','아오, 또 시작이네'],other:['뭔 소리야, 갑자기','그래서? 계속 얘기해 봐','너 말하는 거 좀 웃기다','응. 듣고 있어','아니, 잠깐만']};
 const han={greet:['안녕. 무슨 일이야?','이 시간에 웬일이야','응, 연락했네'],work:['업무 끝내는 중이야','아직 회사야. 무슨 일인데?','회의는 끝났어'],compliment:['고마워. 갑자기 그러니까 좀 의외네','그렇게 봐줬다면 다행이고','칭찬으로 받아들일게'],flirt:['그 말, 진심이야?','그렇게 말하면 내가 뭐라고 해야 할까','웃기려고 한 말은 아닌 것 같은데'],ask:['응, 물어봐','어떤 게 궁금해?','내가 아는 선에선 말해줄게'],tease:['그건 좀 억울한데','나만 잘못한 건 아니잖아','오늘은 꽤 공격적이네'],other:['무슨 뜻인지 조금 더 얘기해 줄래?','그렇게 생각할 수도 있겠네','응, 그 얘기 계속해 봐','그건 예상 못 했네','듣고 있어']};
 const bank=id==='yul'?yul:han;
 let type='other';
 if(/안녕|하이|hello|ㅎㅇ/.test(norm))type='greet';
 else if(/일해|일중|가게|회사|퇴근|바이크|일바빠|바빠/.test(norm))type='work';
 else if(/멋있|잘생|귀여|예쁘|칭찬|존잘/.test(norm))type='compliment';
 else if(/사랑|좋아해|보고싶|데이트|만나자|설레/.test(norm))type='flirt';
 else if(/왜|어떻게|뭐|언제|어디|누구|\?/.test(norm))type='ask';
 else if(/웃기|장난|놀리|바보|성격|시비|싫어/.test(norm))type='tease';
 let response;
 if(spam&&n>=5){response=id==='yul'?'야, 그만 보내. 차단한다':'같은 메시지가 계속 와서 차단할게';store.blocked[id]=true}
 else if(spam&&n>=3)response=id==='yul'?'같은 말 또 보낼 거면 나중에 해':'같은 얘기는 그만하자';
 else if(spam)response=id==='yul'?'야, 방금도 그거 보냈잖아':'같은 메시지가 다시 왔네';
 else {const candidates=[...(bank[type]||[]),...(type==='other'?[]:bank.other)];const recent=arr.filter(m=>m.from==='them').slice(-5).map(m=>m.text);const previously=arr.filter(m=>m.from==='them').map(m=>m.text);const available=candidates.filter(x=>!previously.includes(x));const list=available.length?available:candidates.filter(x=>!recent.includes(x));const key=[...norm].reduce((x,c)=>(x*31+c.charCodeAt(0))>>>0,19)+past.length*17;response=(list.length?list:candidates)[key%(list.length||candidates.length)]}
 arr.push({from:'them',text:response});
}
function render(){clearTimeout(storyTimer);if(!current)return;let title='',content='';switch(current.type){case 'profile':title=profiles[current.id].handle;content=profileView();break;case 'post':title='게시물';content=postView(current.id);break;case 'comments':title='댓글';content=commentsView();break;case 'feed':title='피드';content=`<div class="sim-feed">${Object.values(posts).filter(p=>['yul','han'].includes(p.author)).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,8).map(p=>postView(p.id,true)).join('')}</div>`;break;case 'saved':title='저장됨';content=grid(Object.keys(store.saves).filter(k=>store.saves[k]));break;case 'activity':title='내 활동';content=activityView();break;case 'story':title=profiles[current.id].handle;break;case 'dm':title=profiles[current.id].handle+' · 메시지';content=dmView();break;case 'avatar':title=profiles[current.id].handle;content=`<div class="sim-empty">${av(current.id)}</div>`;break;default:title=current.title||'계정 검색';content=listView();}
root.innerHTML=toolbar(title)+(current.type==='story'?storyView():`<div class="sim-scroll" tabindex="-1">${content}</div>`)+(current.type==='comments'?composer():current.type==='story'?'':bottom());window.MIPIL_NOTICES?.sync();
if(current.type==='story'){storyRemaining=7000;storyStarted=performance.now();if(!current.paused)storyTimer=setTimeout(storyNext,7000)}
}
function redraw(){saveScroll();setScreen(current)}
// The DM trigger must be tied to the specific post, never to the account alone.
// These are unique scripted responses, not an AI chat service.
const likeMessages={
 'yul-1':'공구 사진에 좋아요라. 이런 것도 보냐?',
 'yul-2':'저 엔진 사진은 좀 의외네. 기계에도 관심 있었어?',
 'yul-3':'저 바이크 네 취향이냐? 아직 손볼 데 남았는데.',
 'yul-4':'야, 내 사진엔 왜 하트 누르는데?',
 'han-1':'행사 사진 봤구나. 그날 꽤 정신없었는데.',
 'han-2':'책상 사진에 관심이 있었어? 의외네.',
 'han-3':'그 디스플레이는 내가 직접 최종 확인한 거야.',
 'han-4':'내 사진에 좋아요를 눌렀네. 무슨 바람이야?'
};
const likeDeliveryAfter={};
function appendIncomingMessage(id,text,eventData={}){
 if(!text)return false;
 const messages=store.messages[id]||(store.messages[id]=[]);
 messages.push({from:'them',text,...eventData});
 // Do not replace the DM composer: its focus and draft must stay intact.
 if(opened&&current?.type==='dm'&&current.id===id){
   const panel=root.querySelector('.sim-dm-messages');
   if(panel){
     panel.querySelector('.sim-empty')?.remove();
     const bubble=document.createElement('div');bubble.className='sim-bubble theirs';bubble.textContent=text;panel.appendChild(bubble);
     requestAnimationFrame(()=>{const scroll=root.querySelector('.sim-scroll');if(scroll)scroll.scrollTop=scroll.scrollHeight;});
   }
 }
 const name=id==='yul'?'전율':'전한';
 socialNotice(name+'님에게 메시지가 도착했습니다');
 return true;
}
function schedulePostLikeDM(pid){
 const post=posts[pid];const who=post?.author;
 if(!['yul','han'].includes(who)||!store.likes[pid]||store.likeReactions[pid]||likeEvents[pid])return;
 // Realistic feed behavior: an occasional DM, not a DM from every single like.
 const reacted=Object.keys(store.likeReactions).filter(k=>store.likeReactions[k]&&posts[k]?.author===who).length;
 const queued=Object.keys(likeEvents).filter(k=>posts[k]?.author===who).length;
 if(reacted+queued>=3)return;
 const now=Date.now(),base=who==='yul'?5700:7600;
 const delivery=Math.max(now+base,(likeDeliveryAfter[who]||0)+3800);
 likeDeliveryAfter[who]=delivery;
 likeEvents[pid]=setTimeout(()=>{
   delete likeEvents[pid];
   if(!store.likes[pid]||store.likeReactions[pid])return;
   const text=likeMessages[pid];
   if(!text)return;
   store.likeReactions[pid]=true;
   appendIncomingMessage(who,text,{event:'like',postId:pid});
 },delivery-now);
}
function socialNotice(text){
 const account=/전율/.test(text)?'yul':/전한/.test(text)?'han':null;
 const kind=/메시지|DM/.test(text)?'dm':'follow';
 window.MIPIL_NOTICES?.add({text,account,kind});
 let x=document.getElementById('mipilNotice');if(!x){x=document.createElement('div');x.id='mipilNotice';x.setAttribute('role','status');x.style.cssText='position:fixed;top:76px;left:50%;transform:translateX(-50%);z-index:99999;background:#f7eee7;color:#302b31;border:1px solid #d8b99e;border-radius:15px;box-shadow:0 12px 40px #0007;padding:13px 19px;font:600 14px/1.55 system-ui,sans-serif;max-width:calc(100vw - 30px);min-width:220px;text-align:center;cursor:pointer';x.onclick=()=>{x.remove();window.MIPIL_NOTICES?.open()};document.body.append(x)}x.textContent=text;clearTimeout(socialNotice.timer);socialNotice.timer=setTimeout(()=>x.remove(),4000);
}
function toast(text){clearTimeout(toastTimer);root.querySelector('.sim-toast')?.remove();const x=document.createElement('div');x.className='sim-toast';x.setAttribute('role','status');x.textContent=text;root.append(x);toastTimer=setTimeout(()=>x.remove(),2300)}
function storyNext(){const g=profiles[current.id].highlights[current.group||0];if((current.index||0)<g.posts.length-1){current.index=(current.index||0)+1;render()}else back()}
function linkedList(id,title,note=''){navigate({type:'list',id,title,ids:id==='you'?Object.keys(store.follows).filter(k=>store.follows[k]):profiles[id].links,note})}
root.addEventListener('click',async e=>{const b=e.target.closest('[data-action]');if(!b)return;const {action,id}=b.dataset;switch(action){
case 'profile':navigate({type:'profile',id});break;case 'dm':navigate({type:'dm',id,scroll:undefined});break;
case 'post':navigate({type:'post',id});break;
case 'comments':navigate({type:'comments',id,expanded:[]});if(b.dataset.focus)root.querySelector('textarea')?.focus({preventScroll:true});break;
case 'back':back();break;case 'close':close();break;case 'notices':e.stopPropagation();window.MIPIL_NOTICES?.toggle();break;case 'music':window.mipilMusicPanel?.();break;
case 'accounts':navigate({type:'list',title:'계정 둘러보기',ids:['yul','han',...Object.keys(profiles).filter(x=>!['yul','han','you'].includes(x))]});break;
case 'search':navigate({type:'search',query:''});break;case 'feed':navigate({type:'feed'});break;case 'saved':navigate({type:'saved'});break;case 'activity':navigate({type:'activity'});break;
case 'followers':linkedList(id,'팔로워','피드에서 만난 계정');break;case 'following':linkedList(id,'팔로잉','연결된 계정');break;case 'connections':linkedList(id,'함께 아는 계정');break;
case 'follow':{
  store.follows[id]=!store.follows[id];
  (followEvents[id]||[]).forEach(clearTimeout);followEvents[id]=[];
  if(!store.follows[id]){store.mutual[id]=false;}
  else if(['yul','han'].includes(id)&&!store.mutual[id]){
    const label=id==='yul'?'전율':'전한';
    const firstDelay=id==='yul'?3600:5800;
    followEvents[id].push(setTimeout(()=>{
      if(!store.follows[id])return;
      store.mutual[id]=true;
      if(opened&&current?.type==='profile'&&current.id==='you')redraw();
      socialNotice(label+'님이 회원님을 팔로우했습니다');
      if(opened&&current?.type==='profile'&&current.id===id)redraw();
    },firstDelay));
    followEvents[id].push(setTimeout(()=>{
      if(!store.follows[id]||!store.mutual[id]||store.followGreetings[id])return;
      const text=id==='yul'?'맞팔은 해놨다. 근데 갑자기 무슨 바람이냐?':'맞팔했어. 연락할 일 있으면 여기로 해.';
      store.followGreetings[id]=true;
      appendIncomingMessage(id,text,{event:'follow'});
    },firstDelay+(id==='yul'?4400:5200)));
  }
  persist();redraw();break;}

case 'like':{
 store.likes[id]=!store.likes[id];
 if(!store.likes[id]&&likeEvents[id]){clearTimeout(likeEvents[id]);delete likeEvents[id];}
 if(store.likes[id])schedulePostLikeDM(id);
 persist();redraw();break;}
case 'save':store.saves[id]=!store.saves[id];persist();redraw();toast(store.saves[id]?'저장했습니다.':'저장을 취소했습니다.');break;
case 'likers':navigate({type:'list',title:'좋아요',ids:[...new Set(allComments(id).map(c=>c.author)),...(store.likes[id]?['you']:[])],note:'이 게시물에서 만난 계정'});break;
case 'share':{const u=new URL(location.href);u.hash='sns/'+posts[id].author+'/'+id;try{await navigator.clipboard.writeText(u.href);toast('게시물 링크를 복사했습니다.')}catch(_){const a=document.createElement('textarea');a.value=u.href;root.append(a);a.select();const ok=document.execCommand('copy');a.remove();toast(ok?'게시물 링크를 복사했습니다.':'주소창에서 사이트 주소를 복사해 주세요.')}break}
case 'profile-tab':current.tab=b.dataset.tab;redraw();break;
case 'grid-top':root.querySelector('.sim-profile-tabs')?.scrollIntoView({block:'start',behavior:'smooth'});break;
case 'toggle-replies':current.expanded||=[];current.expanded=current.expanded.includes(id)?current.expanded.filter(k=>k!==id):[...current.expanded,id];redraw();break;
case 'comment-like':store.commentLikes[id]=!store.commentLikes[id];persist();redraw();break;
case 'reply':saveScroll();current.replyTo=b.dataset.parent||id;current.replyAuthor=b.dataset.author;setScreen(current);root.querySelector('textarea')?.focus({preventScroll:true});break;
case 'cancel-reply':saveScroll();current.replyTo=null;current.replyAuthor=null;setScreen(current);break;
case 'slide-next':current.slide=Math.min((current.slide||0)+1,posts[current.id].images.length-1);redraw();break;
case 'slide-prev':current.slide=Math.max((current.slide||0)-1,0);redraw();break;
case 'story':navigate({type:'story',id,group:+b.dataset.group||0,index:0});break;
case 'story-next':storyNext();break;
case 'story-prev':if(current.index>0){current.index--;render()}else back();break;
case 'story-pause':{const st=root.querySelector('.sim-story');current.paused=!current.paused;if(current.paused){clearTimeout(storyTimer);storyRemaining-=performance.now()-storyStarted;st.classList.add('paused')}else{storyStarted=performance.now();storyTimer=setTimeout(storyNext,Math.max(100,storyRemaining));st.classList.remove('paused')}b.innerHTML=icon(current.paused?'play':'pause');b.setAttribute('aria-label',current.paused?'스토리 재생':'스토리 일시정지');break}
case 'avatar':toast('프로필 사진이 없습니다.');break;
}});
root.addEventListener('submit',e=>{if(e.target.id==='simDmForm'){e.preventDefault();const t=e.target.elements.message.value.trim();if(!t||store.blocked[current.id])return;const id=current.id;const arr=store.messages[id]||(store.messages[id]=[]);arr.push({from:'you',text:t});replyToDM(id,t);current.scroll=undefined;render();requestAnimationFrame(()=>{const sc=root.querySelector('.sim-scroll');if(sc)sc.scrollTop=sc.scrollHeight;const msgs=root.querySelector('.sim-dm-messages');if(msgs)msgs.scrollTop=msgs.scrollHeight;const input=root.querySelector('#simDmForm input[name=message]');if(input)input.focus({preventScroll:true});});return}if(e.target.id!=='simCompose')return;e.preventDefault();const t=e.target.querySelector('textarea').value.trim();if(!t)return;const pid=current.id;const c={id:'local-'+Date.now().toString(36)+Math.random().toString(36).slice(2,5),author:'you',text:t,likes:0,time:'방금',parent:current.replyTo||null,replies:[]};store.comments[pid]||=[];store.comments[pid].push(c);persist();current.draft='';if(c.parent){current.expanded||=[];if(!current.expanded.includes(c.parent))current.expanded.push(c.parent)}current.replyTo=null;current.replyAuthor=null;render();requestAnimationFrame(()=>root.querySelector(`[data-comment="${c.id}"]`)?.scrollIntoView({block:'nearest'}));toast(c.parent?'답글을 남겼습니다.':'댓글을 남겼습니다.');});
root.addEventListener('input',e=>{if(e.target.matches('textarea')){current.draft=e.target.value;root.querySelector('#simCompose button[type="submit"]').disabled=!e.target.value.trim()}if(e.target.id==='simSearch'){const pos=e.target.selectionStart;current.query=e.target.value;render();const x=root.querySelector('#simSearch');x.focus({preventScroll:true});try{x.setSelectionRange(pos,pos)}catch(_){}}});
root.addEventListener('dblclick',e=>{const m=e.target.closest('[data-media]');if(!m)return;const pid=m.dataset.media;const wasLiked=!!store.likes[pid];store.likes[pid]=true;if(!wasLiked)schedulePostLikeDM(pid);persist();redraw();const box=root.querySelector(`[data-media="${pid}"]`);if(box){const heart=document.createElement('span');heart.className='sim-media-heart';heart.textContent='♥';box.append(heart);setTimeout(()=>heart.remove(),800)}});
let touchX=null;root.addEventListener('touchstart',e=>{touchX=e.target.closest('[data-media]')?e.touches[0].clientX:null},{passive:true});root.addEventListener('touchend',e=>{if(touchX===null||current.type!=='post')return;const dx=e.changedTouches[0].clientX-touchX;touchX=null;if(Math.abs(dx)>45){current.slide=Math.max(0,Math.min(posts[current.id].images.length-1,(current.slide||0)+(dx<0?1:-1)));redraw()}},{passive:true});
layer.addEventListener('click',e=>{if(e.target===layer)close()});
document.querySelectorAll('[data-open-ig]').forEach(b=>b.addEventListener('click',()=>open(b.dataset.openIg)));
document.addEventListener('keydown',e=>{if(!opened)return;if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();back()}if(current?.type==='story'&&!e.target.matches('input,textarea')){if(e.key==='ArrowRight')storyNext();if(e.key==='ArrowLeft'&&current.index>0){current.index--;render()}}if(e.key==='Tab'){const list=[...root.querySelectorAll('button:not([disabled]),input,textarea'),...document.getElementById('musicDrawer').querySelectorAll('button:not([disabled]),input')].filter(n=>n.getClientRects().length);if(!list.length)return;const first=list[0],last=list.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}},true);
// Shared URLs open the same local fictional account/post; no external sign-in.
const deep=location.hash.match(/^#sns\/([^/]+)(?:\/([^/]+))?$/);if(deep&&profiles[deep[1]]){open(deep[1]);if(deep[2]&&posts[deep[2]])navigate({type:'post',id:deep[2]})}
window.MipilSocial={open,close};
window.MIPIL_SOCIAL_OPEN_TARGET=(account,kind)=>{open(account||'yul');if(kind==='dm')navigate({type:'dm',id:account||'yul',scroll:undefined});};
})();
