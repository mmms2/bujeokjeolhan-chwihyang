(()=>{
'use strict';
const {profiles,posts}=window.MIPIL_SOCIAL;
const layer=document.getElementById('socialExplorer'),root=document.getElementById('simRoot');
const esc=s=>String(s??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const paths={back:'M15 18l-6-6 6-6',close:'M6 6l12 12M18 6L6 18',down:'M6 9l6 6 6-6',next:'M9 6l6 6-6 6',heart:'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z',comment:'M21 11.5a9 9 0 0 1-9 9 9.8 9.8 0 0 1-4-.9L3 21l1.5-4.7A9 9 0 1 1 21 11.5Z',share:'M22 2L9 15M22 2l-7 20-6-7-7-6 20-7Z',bookmark:'M6 3h12v18l-6-4-6 4V3Z',grid:'M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3zM15 15h6v6h-6z',tag:'M8 5h8l2 3h3v13H3V8h3l2-3ZM12 10a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM7 20v-1a5 5 0 0 1 10 0v1',search:'M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',home:'M3 10l9-8 9 8v11h-6v-8H9v8H3V10Z',music:'M9 18V5l12-3v13M9 8l12-3M9 18a3 3 0 1 1-3-3c1.7 0 3 1.3 3 3ZM21 15a3 3 0 1 1-3-3c1.7 0 3 1.3 3 3Z',pin:'M9 3h6l-1 6 4 4v2H6v-2l4-4-1-6ZM12 15v7',stack:'M7 3h14v14M3 7h14v14H3V7Z',pause:'M8 4v16M16 4v16',play:'M8 3l12 9-12 9V3Z',user:'M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM4 21v-2a8 8 0 0 1 16 0v2',check:'M4 12l5 5L20 6',copy:'M9 3h12v14H9V3ZM5 7H3v14h14v-2'};
function icon(n,fill=false){return `<svg viewBox="0 0 24 24" aria-hidden="true" ${fill?'class="svg-fill"':''}><path d="${paths[n]||paths.user}"/></svg>`}
let store={likes:{},saves:{},follows:{},commentLikes:{},comments:{},storyLikes:{},messages:{},blocked:{},dmCount:{},dmWarnings:{},dmMeta:{},mutual:{},likeReactions:{},followGreetings:{}};
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
function setScreen(view){current=view;render();requestAnimationFrame(()=>{let sc=root.querySelector('.sim-scroll');if(sc)sc.scrollTop=view.type==='dm'?0:(view.scroll||0);if(view.type==='dm'){const ms=root.querySelector('.sim-dm-messages');if(ms)ms.scrollTop=ms.scrollHeight;}})}
function navigate(view){saveScroll();screens.push(view);history.pushState({mipilSNS:session,depth:screens.length},'',location.href);setScreen(view)}
function open(id='yul'){if(opened){navigate({type:'profile',id});return}focusBefore=document.activeElement;opened=true;session='sns'+Date.now();screens=[];layer.classList.add('open');layer.setAttribute('aria-hidden','false');document.body.classList.add('social-open');document.querySelector('main.site').inert=true;syncDock();navigate({type:'profile',id});root.tabIndex=-1;root.focus({preventScroll:true})}
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
function profileView(){const p=profiles[current.id],id=current.id,tab=current.tab||'posts';if(store.blocked[id])return `<div class="sim-empty" style="padding:70px 25px">${av(id)}<p>이 계정을 볼 수 없습니다.</p><small>이 계정에서 회원님을 차단했습니다.</small></div>`;const count=p.posts.length;return `<section class="sim-profile"><div class="sim-profile-top"><button class="sim-profile-avatar ${!p.highlights.length?'no-story':''}" data-action="${p.highlights.length?'story':'avatar'}" data-id="${id}" data-group="0" aria-label="${esc(p.name)} ${p.highlights.length?'스토리':'프로필 사진'}">${av(id)}</button><div class="sim-profile-info"><h2 class="sim-profile-user">${esc(p.handle)}</h2><div class="sim-stats"><button data-action="grid-top"><b>${count}</b><span>게시물</span></button><button data-action="followers" data-id="${id}"><b>${(p.followers+(id==='you'?Object.values(store.mutual).filter(Boolean).length:(store.follows[id]?1:0))).toLocaleString()}</b><span>팔로워</span></button><button data-action="following" data-id="${id}"><b>${id==='you'?Object.keys(store.follows).filter(k=>store.follows[k]).length:p.following.toLocaleString()}</b><span>팔로잉</span></button></div></div></div><div class="sim-bio"><div class="sim-muted">${esc(p.category)}</div><div class="sim-bio-name">${esc(p.name)}</div>${mentions(p.bio)}</div><div class="sim-profile-actions">${id==='you'?`<button class="sim-secondary" data-action="saved">저장한 게시물</button><button class="sim-secondary" data-action="activity">내 활동</button>`:follow(id)+`<button class="sim-secondary" data-action="dm" data-id="${id}">메시지</button><button class="sim-secondary" data-action="connections" data-id="${id}">함께 아는 계정</button>`}</div></section>${p.highlights.length?`<div class="sim-highlights">${p.highlights.map((g,i)=>`<button class="sim-highlight" data-action="story" data-id="${id}" data-group="${i}"><img src="${posts[g.posts[0]].images[0]}" alt="${esc(g.title)} 스토리"><span>${esc(g.title)}</span></button>`).join('')}</div>`:''}<nav class="sim-profile-tabs" aria-label="프로필 게시물"><button data-action="profile-tab" data-tab="posts" class="${tab==='posts'?'on':''}" aria-label="게시물">${icon('grid')}<span>게시물</span></button><button data-action="profile-tab" data-tab="tagged" class="${tab==='tagged'?'on':''}" aria-label="연결된 게시물">${icon('tag')}<span>연결된 게시물</span></button></nav>${grid(tab==='posts'?p.posts:tagged(id))}`}
function postView(pid,feed=false){const p=posts[pid],person=profiles[p.author],ci=feed?0:current.slide||0,yes=!!store.likes[pid],saved=!!store.saves[pid];const comments=allComments(pid);return `<article class="sim-post"><div class="sim-post-header">${avButton(p.author)}<div class="sim-post-header-info">${handle(p.author)}<div class="sim-location">${esc(p.location)}</div></div>${p.author==='you'?'':`<button class="sim-icon" data-action="profile" data-id="${p.author}" aria-label="프로필 보기">${icon('next')}</button>`}</div><div class="${feed?'':'sim-post-layout'}"><div class="sim-media" data-media="${pid}"><img src="${p.images[ci]}" alt="${esc(person.name+' · '+p.caption.split('\n')[0])}">${p.images.length>1&&!feed?`<span class="sim-media-counter">${ci+1} / ${p.images.length}</span><button class="sim-media-prev" data-action="slide-prev" aria-label="이전 사진" ${ci===0?'hidden':''}>${icon('back')}</button><button class="sim-media-next" data-action="slide-next" aria-label="다음 사진" ${ci===p.images.length-1?'hidden':''}>${icon('next')}</button>`:''}</div><div class="sim-post-detail"><div class="sim-post-actions"><button class="sim-icon ${yes?'sim-liked':''}" data-action="like" data-id="${pid}" aria-label="${yes?'좋아요 취소':'좋아요'}" aria-pressed="${yes}">${icon('heart',yes)}</button><button class="sim-icon" data-action="comments" data-id="${pid}" aria-label="댓글 보기">${icon('comment')}</button><button class="sim-icon" data-action="share" data-id="${pid}" aria-label="게시물 링크 복사">${icon('share')}</button><button class="sim-icon save" data-action="save" data-id="${pid}" aria-label="${saved?'저장 취소':'게시물 저장'}" aria-pressed="${saved}">${icon('bookmark',saved)}</button></div><div class="sim-post-copy"><button class="sim-likes" data-action="likers" data-id="${pid}">좋아요 ${(p.likes+(yes?1:0)).toLocaleString()}개</button><p class="sim-caption">${handle(p.author)}${mentions(p.caption)}</p><button class="sim-all-comments" data-action="comments" data-id="${pid}">댓글 ${commentCount(pid)}개 모두 보기</button>${comments.slice(0,2).map(c=>`<div class="sim-comment-preview">${handle(c.author)}${mentions(c.text)}</div>`).join('')}<div class="sim-date">${date(p.date)}</div></div><div class="sim-inline-editor">${av('you')}<button data-action="comments" data-id="${pid}" data-focus="yes">댓글 달기…</button></div></div></div></article>`}
function commentRow(pid,c,isReply=false){const rs=isReply?[]:replies(pid,c);const key=pid+':'+c.id,liked=!!store.commentLikes[key],expanded=current.expanded?.includes(c.id);return `<div class="sim-comment" data-comment="${c.id}">${avButton(c.author)}<div class="sim-comment-body">${handle(c.author)}<span class="sim-comment-text">${mentions(c.text)}</span><div class="sim-comment-meta"><span>${esc(c.time||'방금')}</span><span>좋아요 ${c.likes+(liked?1:0)}개</span><button data-action="reply" data-id="${c.id}" data-author="${c.author}" data-parent="${isReply?(current.replyParent||''):c.id}">답글 달기</button></div>${rs.length?`<button class="sim-reply-toggle" data-action="toggle-replies" data-id="${c.id}">${expanded?'답글 숨기기':`답글 ${rs.length}개 보기`}</button>${expanded?`<div class="sim-replies">${rs.map(r=>commentRow(pid,{...r,_parent:c.id},true).replace('data-parent=""',`data-parent="${c.id}"`)).join('')}</div>`:''}`:''}</div><button class="sim-comment-heart ${liked?'sim-liked':''}" data-action="comment-like" data-id="${key}" aria-label="댓글 좋아요" aria-pressed="${liked}">${icon('heart',liked)}</button></div>`}
function commentsView(){const p=posts[current.id];if(store.blocked[p.author])return `<div class="sim-empty">이 계정에서 회원님을 차단했습니다.</div>`;return `<div class="sim-comments"><div class="sim-comment sim-comment-caption">${avButton(p.author)}<div class="sim-comment-body">${handle(p.author)}<span class="sim-comment-text">${mentions(p.caption)}</span><div class="sim-comment-meta">${date(p.date)}</div></div></div>${allComments(current.id).map(c=>commentRow(current.id,c)).join('')}</div>`}
function composer(){return `<div class="sim-compose-wrap">${current.replyTo?`<div class="sim-replying">@${esc(profiles[current.replyAuthor].handle)} 님에게 답글 남기는 중<button data-action="cancel-reply" aria-label="답글 취소">×</button></div>`:''}<form class="sim-compose" id="simCompose">${av('you')}<textarea name="comment" aria-label="댓글 입력" rows="1" maxlength="500" placeholder="${current.replyTo?'답글 달기…':'댓글 달기…'}">${esc(current.draft||'')}</textarea><button type="submit" ${!current.draft?.trim()?'disabled':''}>게시</button></form></div>`}
function accountRow(id){return `<div class="sim-account-row">${avButton(id)}<button class="account-main" data-action="profile" data-id="${id}"><strong>${esc(profiles[id].handle)}</strong><small>${esc(profiles[id].name)}${profiles[id].category?' · '+esc(profiles[id].category):''}</small></button>${id==='you'?'':follow(id)}</div>`}
function listView(){let ids=current.ids||Object.keys(profiles).filter(x=>x!=='you');if(current.type==='search'){const q=(current.query||'').toLowerCase();ids=ids.filter(id=>(profiles[id].name+' '+profiles[id].handle+' '+profiles[id].category).toLowerCase().includes(q))}return `${current.type==='search'?`<div class="sim-search"><input id="simSearch" type="search" placeholder="계정 검색" aria-label="계정 검색" value="${esc(current.query||'')}"></div>`:''}<div class="sim-list">${current.note?`<div class="sim-list-caption">${esc(current.note)}</div>`:''}${ids.length?ids.map(accountRow).join(''):'<div class="sim-empty">검색 결과가 없습니다.</div>'}</div>`}
function activityView(){const own=Object.entries(store.comments).flatMap(([pid,cs])=>cs.map(c=>({...c,pid})));const likes=Object.keys(store.likes).filter(k=>store.likes[k]);return `<h3 class="sim-directory-title">내가 남긴 댓글</h3><div class="sim-list">${own.length?own.map(c=>`<div class="sim-account-row">${av('you')}<button class="account-main" data-action="comments" data-id="${c.pid}"><strong>${esc(c.text)}</strong><small>@${esc(profiles[posts[c.pid].author].handle)}의 게시물 · ${c.parent?'답글':'댓글'}</small></button></div>`).join(''):'<div class="sim-empty">아직 남긴 댓글이 없습니다.</div>'}</div><h3 class="sim-directory-title">좋아요한 게시물</h3>${grid(likes)}`}
function storyView(){const p=profiles[current.id],group=p.highlights[current.group||0],idx=current.index||0,post=posts[group.posts[idx]];return `<div class="sim-story ${current.paused?'paused':''}"><img class="sim-story-image" src="${post.images[0]}" alt="${esc(post.caption)}"><div class="sim-story-shade"></div><div class="sim-story-bars">${group.posts.map((_,i)=>`<span class="${i<idx?'done':i===idx?'current':''}"><i></i></span>`).join('')}</div><div class="sim-story-user">${avButton(current.id)}${handle(current.id)}<span class="sim-small">${esc(group.title)}</span><button class="sim-icon" data-action="story-pause" aria-label="${current.paused?'스토리 재생':'스토리 일시정지'}">${icon(current.paused?'play':'pause')}</button></div><button class="sim-story-prev" data-action="story-prev" aria-label="이전 스토리"></button><button class="sim-story-next" data-action="story-next" aria-label="다음 스토리"></button><div class="sim-story-caption">${esc(post.caption)}</div></div>`}
function dmView(){const id=current.id,p=profiles[id],blocked=!!store.blocked[id];const messages=store.messages[id]||[];return `<div class="sim-dm"><div class="sim-dm-profile">${av(id)}<b>${esc(p.handle)}</b></div><div class="sim-dm-messages">${messages.length?messages.map(m=>`<div class="sim-bubble ${m.from==='you'?'mine':'theirs'}">${esc(m.text)}</div>`).join(''):`<div class="sim-empty">아직 메시지가 없어요</div>`}</div>${blocked?`<div class="sim-dm-block">${esc(p.name)}님이 회원님을 차단했습니다. 더 이상 메시지를 보낼 수 없습니다.</div>`:`<form id="simDmForm"><input name="message" maxlength="240" autocomplete="off" placeholder="메시지 보내기…" aria-label="DM 메시지"><button type="submit">보내기</button></form>`}</div>`}
// This is a local, fictional rule-driven conversation, not a generative AI service.
// Reply history and repeated-pressure tracking are independent for each brother.
const dmReplySets={
 yul:{
  greet:['어, 너냐. 무슨 일이야?','야, 갑자기 웬일인데.','연락은 네가 해놓고 왜 이렇게 뜸을 들여.','어. 나 지금 잠깐 쉬는 중.'],
  meal:['먹었어. 너는 아직이냐?','방금 대충 먹었지. 작업할 때는 끼니 놓치기 쉽거든.','아직. 이거 끝나면 뭐라도 먹으려고.'],
  daily:['아직 작업 중. 뭐, 별일은 없어.','밥? 아까 대충 먹었어. 너는?','지금 막 가게 정리하다가 폰 봤다.','퇴근하면 씻고 뻗을 생각이지.','오늘은 집에 들어가도 할 일 없고.','아직 못 먹었어. 가게 앞에서 뭐라도 시키려고.'],
  workTime:['오늘은 좀 늦어. 부품만 맞추면 끝인데 그게 쉽지가 않네.','지금은 못 나가. 마무리하고 연락할게.','퇴근? 한두 시간은 더 봐야 해.','작업 남아서 아직 가게야. 시간은 장담 못 해.'],
  work:['가게. 엔진 하나 더 봐야 해서 퇴근은 글렀고.','일은 재밌지. 사람 상대하는 게 귀찮아서 그렇지.','바이크 만지는 중인데. 너 그쪽에도 관심 있었냐?','오늘 부품 들어오는 게 늦어졌어. 내일 정리해야지.','작업할 땐 멀쩡한데 퇴근하면 피곤해 죽겠어.'],
  photo:['야, 내 사진은 왜 보고 있는데.','사진은 그냥 올린 거야. 별 뜻 없다.','그 바이크? 아직 손볼 데 좀 남았어.','사람 얼굴보다 기계 사진이 훨씬 나은데, 그치.','찍어준 놈이 올리라고 하도 난리라.'],
  love:['뭐, 지금 나한테 그 얘길 하겠다는 거냐?','야. 농담이면 적당히 해. 나 말 곧이곧대로 듣는다.','갑자기 사람 시험하냐.','말은 쉽지. 그다음은 생각해 봤고?','내가 듣고 싶은 답 정해 놓고 묻지 마.'],
  women:['내 여자 관계가 단순한 줄 알았냐?','누굴 만나는지는 내가 정해. 네가 싫어하는 것도 네 자유고.','왜, 누구한테 들은 얘기라도 있어?','없는 말 하진 말자. 내가 가볍게 만나는 건 숨긴 적 없어.','그 얘길로 나한테 잔소리할 거면 오늘은 여기까지만 하자.'],
  brother:['한이랑 무슨 얘길 했는지 난 몰라.','야, 동생 일까지 내가 대신 설명해 줘야 하냐?','걔가 또 혼자 다 정하려 들었냐.','내가 형인 건 맞는데 걔 대변인은 아니거든.'],
  meet:['지금? 작업 끝나려면 좀 걸릴 텐데.','나 약속 있는 날도 있어. 일단 날짜부터 말해 봐.','집 앞에서 마주치면 그때 얘기하지, 뭐.','밥? 그건 상황 봐서. 거창하게 생각하진 말고.'],
  apology:['됐어. 사과받으려고 연락한 건 아니니까.','아, 그런 뜻이었냐. 알았어.','미안하다고 하면 내가 바로 풀릴 줄 알았냐?','오해한 건 알겠는데 말은 좀 똑바로 해.'],
  boundary:['알았어. 더 안 건드릴게.','그만하라는 말은 알아들었어.','그래. 너도 싫다는 건 싫다고 해.','오케이. 그 얘긴 접자.'],
  tease:['시비 걸려고 메시지 보냈냐?','야, 말 진짜 얄밉게 하네.','너 지금 나 놀리는 거지.','웃기네. 내가 그 말에 넘어갈 줄 알았냐?','아, 씨​발. 또 말리네.'],
  ask:['뭘 물어보려는 건지 정확하게 말해 봐.','아, 그거? 질문이 좀 갑작스러운데.','왜. 이유라도 있냐?','내가 아는 거면 대답하지. 무슨 얘긴데.'],
  short:['단답은 너도 잘하네.','그래서, 본론은?','너 지금 말 아끼는 거냐.','그냥 궁금해서 연락했어?','야, 내가 눈치로 다 알아먹어야 하냐?'],
  other:['그 얘길 왜 나한테 하는지부터 궁금한데.','무슨 일 있었냐? 아까랑 말투가 좀 다르네.','아, 그건 좀 웃기네. 근데 끝이야?','그걸 나보고 어쩌라고. 아니, 말은 끝까지 들어볼게.','너 오늘 나한테 할 말 되게 많다.','지금 그 얘기 꺼낸 이유가 뭐냐.','야, 앞뒤는 좀 설명하고 말해.','그건 네가 판단할 일이지. 내가 정할 건 아니잖아.','응, 알았어. 근데 그다음은?','그렇게 말하면 내가 또 뭐라고 해야 하냐.','너랑 얘기하다 보면 꼭 말꼬리가 잡히더라.']
 },
 han:{
  greet:['안녕. 이 시간에 무슨 일이야?','연락했네. 별일 없는 거지?','응, 보고 있어. 할 말 있어?','메시지 확인했어. 무슨 얘기부터 할까.'],
  meal:['아까 간단히 먹었어. 너는?','이제 식사하려고. 일정 때문에 조금 늦었어.','응, 먹었어. 네 식사는 챙겼어?'],
  daily:['오늘은 일정이 조금 길어졌어. 너는?','밥은 아까 먹었어. 너도 식사 챙겨.','지금은 잠깐 쉬는 중이야.','오늘 특별한 일은 없었어?','이제 퇴근하려고. 남은 건 내일 처리하면 돼.','조금 피곤하긴 한데, 괜찮아.'],
  work:['이제 회의 마쳤어. 아직 확인할 게 조금 남았고.','오늘은 행사 동선 때문에 꽤 바빴어.','브랜드 런칭 일정이 겹쳐서 늦어졌어.','업무는 정리하고 있어. 시간을 조금 비웠어.','일은 늘 계획대로 안 흘러가. 내가 그걸 인정하는 데 시간이 걸리지만.'],
  photo:['그날 행사 사진이야. 준비에 공을 꽤 들였어.','사진은 잘 나왔지. 현장은 조금 더 정신없었어.','그건 내가 담당한 프로젝트야. 궁금한 부분 있어?','내 사진 얘기라니, 조금 의외네.','업로드한 게 다는 아니야. 아직 공개 못 하는 컷도 있어.'],
  accountability:['내가 잘못한 건 분명해. 그걸 없던 일로 만들 생각은 없어.','미안해. 네가 그 말을 받아줄 의무는 없지만.','그때는 그걸 배려라고 생각했어. 지금은 독단이었다는 걸 인정해.','그렇게 묻는 것도 이해해. 내가 말보다 행동으로 보여줬어야 했지.'],
  marriageListen:['네 말을 듣는다고 생각했는데, 사실 내가 정해 둔 선택지 안에서만 고르게 했어.','네 의견을 들으려 했다고 말하면 변명처럼 들리겠지. 결국 내 결정을 밀어붙였으니까.','네가 문제를 말했을 때 멈추고 다시 정했어야 했어. 그걸 못 했지.'],
  marriageFuture:['다음에는 먼저 네 의견을 묻고 기다려야지. 내가 앞서 정할 일이 아니야.','결정을 내려놓고 동의를 구하는 게 아니라 처음부터 함께 정해야 해.','내가 달라졌다는 건 말로 증명할 수 없어. 네가 보고 판단할 문제야.','당장 뭘 정하자고 하고 싶지는 않아. 그 자체가 또 내 방식이니까.'],
  marriage:['그때 내가 결정해 놓고 너한테 통보했던 거, 지금은 그게 얼마나 큰 문제였는지 알아.','좋은 결과를 만들면 과정도 이해받을 거라고 생각했어. 그게 잘못이었지.','예식장부터 신혼집까지. 물어본 척만 했던 순간들이 있었어.','미안하다는 말 한 번으로 끝날 일은 아니라는 거 알아.','당장 달라졌다고 믿어 달라는 말은 안 할게.'],
  love:['그 말을 다시 듣게 될 줄은 몰랐어.','지금 네 감정을 내가 마음대로 해석하고 싶진 않아.','나한테 아직 감정이 남아 있냐고 묻는 거라면, 있어.','쉽게 대답하고 싶은 얘기가 아니야. 제대로 말하고 싶어.','내가 원하는 걸 앞세우면 또 같은 실수를 하겠지.'],
  women:['누가 무슨 얘길 했는지 먼저 알려줄래?','그런 의미라면 오해는 풀고 싶어. 하지만 네 생각을 강요하진 않을게.','내 사생활에 관해선 사실대로 대답할게.','이유 없이 의심하게 만들고 싶진 않아.'],
  brother:['형은 원래 그렇게 말하지. 그렇다고 늘 같은 생각인 건 아니야.','형 얘길 나한테 묻는 이유가 있어?','형이 무슨 말을 했든 그건 형 판단이야.','형과 나는 일하는 방식부터 다르니까.'],
  meet:['만나자는 건 네 의사가 제일 중요해. 장소부터 내가 정하진 않을게.','지금은 네 일정부터 물어보는 게 맞겠지.','시간은 조정할 수 있어. 다만 네가 원하지 않으면 안 할게.','얼굴을 보고 얘기하고 싶은 마음은 있어. 서두르진 않을게.'],
  apology:['괜찮아. 무슨 뜻인지 알겠어.','말해 줘서 고마워. 나도 내 말투를 돌아볼게.','그 부분은 사과하지 않아도 돼.','오해가 있었다면 바로잡으면 되지.'],
  boundary:['알았어. 그만할게.','네가 싫다고 한 부분은 더 밀어붙이지 않을게.','응, 그 얘기는 여기까지 하자.','원하지 않는 대화를 계속할 생각은 없어.'],
  tease:['그건 내가 좀 억울한데.','알아. 지금 나 놀리는 거지.','대답을 해도 또 다른 질문이 돌아올 것 같은데.','예상했던 대화 방향은 아닌데, 재미는 있네.','그렇게 말하면 나도 반박하고 싶어져.'],
  ask:['응, 물어봐. 아는 선에서는 대답할게.','어떤 부분을 묻는지 조금만 더 구체적으로 말해 줄래?','그건 상황에 따라 달라. 무슨 일이 있었어?','궁금한 이유가 있는 것 같은데.'],
  short:['무슨 뜻인지는 알겠어. 조금 더 얘기해 줄래?','응. 바로 결정할 일은 아닌 것 같아.','지금 바로 답을 정하진 않을게.','그 한마디에 여러 뜻이 있는 것 같은데.','듣고 있어. 천천히 말해.'],
  other:['그 얘길 꺼내는 데 이유가 있겠지.','내가 놓친 부분이 있으면 말해 줘.','무슨 의미로 한 말인지 먼저 이해하고 싶어.','그럴 수도 있겠네. 내가 생각한 방향과는 다르지만.','네가 원하는 결론을 내가 대신 내릴 순 없어.','그건 충분히 고민해 볼 문제야.','내가 먼저 해결책부터 말하면 또 같은 실수를 하겠지.','서로 다르게 생각하는 부분은 짚고 넘어가자.','지금 하는 얘기를 가볍게 넘기진 않을게.','음, 그건 예상하지 못한 얘기였어.','단정해서 답하지 않을게. 좀 더 정확히 알고 싶어.']
 }
};
function normDM(text){return String(text).normalize('NFKC').toLowerCase().replace(/[\s.,!?~…·:;"'`]+/g,'')}
function dmIntent(text,id,lastTopic){
 const t=normDM(text);
 if(/그만|하지마|싫어|더이상|연락하지마|꺼져|됐어/.test(t))return 'boundary';
 if(/^(미안|미안해|죄송|사과할게|내가잘못)/.test(t))return 'apology';
 if(id==='han'&&/미안하|사과|잘못|반성|후회|진심으로미안/.test(t))return 'accountability';
 if(id==='han'&&/의견|선택권|내말|내얘기|얘길들|들어줄|내가말|내가한말/.test(t))return 'marriageListen';
 if(id==='han'&&/다음엔|앞으로|이제어떻게|뭘바꿔|다시그러면/.test(t)&&['marriage','marriageListen','marriageFuture','accountability'].includes(lastTopic))return 'marriageFuture';
 if(id==='han'&&/결혼|파혼|혼수|식장|신혼집|약혼|독단|결정권|상의안|동의없이|혼자결정|혼자정하|합의/.test(t))return 'marriage';
 if(/여자|다른사람|원나잇|바람|만나는사람|데이트상대/.test(t))return 'women';
 if(/전한|전율|형|동생|오빠동생/.test(t))return 'brother';
 if(id==='yul'&&/퇴근|몇시에끝|언제끝|늦게까지/.test(t))return 'workTime';
 if(/커스텀|엔진|정비|바이크|부품|작업|회사|퇴근|회의|행사|런칭|일해|바쁘|가게|출근/.test(t))return 'work';
 if(/사진|하트|좋아요|피드|게시물|포스트|인스타|스토리/.test(t))return 'photo';
 if(/만나|같이밥|밥먹자|커피마시자|약속잡|시간돼|놀자|올래|갈래/.test(t))return 'meet';
 if(/식사|밥|저녁먹|아침먹|점심먹|먹었어|먹었니/.test(t))return 'meal';
 if(/뭐해|오늘|지금|잘잤|자고|집에|집이야/.test(t))return 'daily';
 if(/사랑|보고싶|좋아해|좋아하|연애|키스|설레|미련|재결합|다시사귀/.test(t))return 'love';
 if(/ㅋㅋ|ㅎㅎ|장난|놀려|시비|웃기|바보|재수없|웃겨/.test(t))return 'tease';
 if(/안녕|하이|ㅎㅇ|잘지내/.test(t))return 'greet';
 if(/왜|뭐|언제|어디|누구|어떻게|가능|알아|궁금|\?/.test(t))return 'ask';
 if(t.length<5)return 'short';
 return 'other';
}
function takeDMReply(id,kind,meta,seed){
 const bank=dmReplySets[id],arr=bank[kind]||bank.other;
 meta.used??=[];
 const available=arr.filter(x=>!meta.used.includes(x));
 const choicePool=available.length?available:bank.other.filter(x=>!meta.used.includes(x));
 if(!choicePool.length){
  meta.pressure=Math.max(meta.pressure||0,2);
  const closing=id==='yul'?'야, 나 지금 같은 얘기만 계속하고 있다. 다른 할 말 없으면 여기서 끝내자.':'지금은 비슷한 말이 오가는 것 같아. 다른 얘기가 있으면 그때 이어 가자.';
  return closing;
 }
 let hash=meta.turn*13+seed.length*7;
 for(const ch of seed)hash=(hash*33+ch.charCodeAt(0))>>>0;
 const chosen=choicePool[hash%choicePool.length];meta.used.push(chosen);
 return chosen;
}
function replyToDM(id,text){
 const arr=store.messages[id]||(store.messages[id]=[]);
 const meta=store.dmMeta[id]||(store.dmMeta[id]={turn:0,used:[],pressure:0,warned:false,calm:0,lastTopic:'',lastInput:''});
 const prior=arr.filter(m=>m.from==='you').slice(0,-1);
 const normalized=normDM(text);
 const exact=prior.slice(-6).filter(m=>normDM(m.text)===normalized).length;
 const tiny=normalized.length<=2;
 const flood=/([ㅋㅎㅜㅠ.!?])\1{5,}/.test(text)||(tiny&&prior.slice(-3).filter(m=>normDM(m.text)===normalized).length>=1);
 const demand=/(답장해|대답해|읽씹|왜무시|보라고|연락해|당장|전화해|무조건)/.test(normalized);
 const repeating=exact>=1||flood;
 meta.turn++;
 const previousPressure=meta.pressure||0;
 if(repeating)meta.pressure+=exact>=2?2:1;
 else if(demand)meta.pressure+=1;
 else meta.pressure=Math.max(0,meta.pressure-2);
 if(!repeating&&!demand){meta.calm++;if(meta.calm>=2){meta.warned=false;meta.calm=0}}
 else meta.calm=0;
 const kind=dmIntent(text,id,meta.lastTopic);
 let response;
 if(meta.warned&&meta.pressure>=5&&(repeating||demand)){
   response=id==='yul'?'아, 씨​발. 말했지? 그만 보내라고. 차단한다.':'분명히 그만해 달라고 했어. 계속 같은 메시지가 와서 차단할게.';
   store.blocked[id]=true;
 }else if(meta.pressure>=3&&(repeating||demand)&&!meta.warned){
   meta.warned=true;
   response=id==='yul'?'야, 똑같은 말 계속 보낼 거면 차단한다. 그만해.':'같은 내용이 반복되고 있어. 계속 이러면 차단할 수밖에 없어.';
 }else if(repeating){
   response=id==='yul'?(exact>=1?'아까도 그 말 했잖아. 본론이 뭐냐.':'야, 장난 그만하고 말해.'):(exact>=1?'그 메시지는 이미 봤어. 다른 얘기가 있으면 해 줘.':'그런 식으로 메시지를 보내면 대화를 이어가기 어려워.');
 }else if(demand&&meta.pressure>=2){
   response=id==='yul'?'재촉하지 마. 나도 할 일이 있어.':'재촉한다고 대답이 빨라지는 건 아니야. 기다려 줘.';
 }else{
   const lastIncoming=[...arr].reverse().find(m=>m.from==='them');
   if(/^(왜|왜요|왜그런데|무슨소리|뭔데)[?!.]*$/.test(normalized)&&lastIncoming?.event==='like'){
     response=id==='yul'?'네가 내 사진에 하트 눌렀잖아. 난 그게 더 궁금한데.':'네가 내 게시물에 좋아요를 눌렀으니까. 그게 조금 의외였어.';
   }else if(/^(응|어|그래|그래서|음|ㅇㅇ|아니)[?!.]*$/.test(normalized)&&meta.lastTopic&&meta.lastTopic!=='short'){
     response=takeDMReply(id,meta.lastTopic,meta,normalized);
   }else response=takeDMReply(id,kind,meta,normalized);
 }
 meta.lastTopic=kind==='short'&&meta.lastTopic?meta.lastTopic:kind;
 meta.lastInput=normalized;
 arr.push({from:'them',text:response});
}


const commentReplySets={
 'yul-1':{praise:['공구 사진에 칭찬이라니, 독특하네 ㅋㅋ','다음엔 작업하는 것도 한번 올려볼까.','오늘은 가게가 좀 난장판이었거든.'],ask:['뭐가 궁금한데. 부품 관련이면 가게 계정으로 물어봐.','작업 중이어서 답 늦을 수 있어.','렌치 얘기면 나도 좀 찾고 싶다.'],other:['작업 중에 폰 들었다고 또 잔소리 듣겠다.','야, 오늘은 엔진보다 댓글이 더 시끄럽네.','그건 좀 웃겼다 ㅋㅋ']},
 'yul-2':{praise:['이쪽 알아보는 사람 별로 없는데. 보는 눈 있네.','이거 마무리하면 좀 뿌듯하긴 하겠다.'],ask:['엔진 쪽이야. 끝나면 사진 또 올리지 뭐.','일정은 아직 미정. 부품부터 와야 돼.'],other:['그러게. 이 부분만 끝나면 퇴근인데.','야, 이게 생각보다 오래 걸리네.','기계가 말썽 부릴 땐 밤도 짧다.']},
 'yul-3':{praise:['색 괜찮지. 내가 고른 거다.','이건 좀 마음에 들게 나왔어.'],ask:['시승은 점검 끝나고. 아무나 태우진 않아.','세부 사양은 가게 쪽에 올릴 거야.'],other:['끝났다고 바로 타는 건 아니고.','일단 최종 점검부터 해야지.','이런 날엔 꽤 기분 좋긴 하다.']},
 'yul-4':{praise:['사진 하나 올렸다고 반응 왜 이러냐 ㅋㅋ','아, 씨​발. 이런 칭찬은 좀 어색한데.'],ask:['누가 찍었는지는 비밀. 별건 아니고.','그냥 찍혔다니까. 왜 다들 안 믿냐?'],other:['평소랑 다른 거 없다.','야, 사진만 보라고 ㅋㅋ','댓글이 더 웃기네.']},
 'han-1':{praise:['팀이 정말 고생했어. 잘 끝나서 다행이지.','좋게 봐주셔서 감사합니다.'],ask:['행사 관련 정보는 브랜드 공식 채널에 올릴 예정이에요.','현장 세팅은 팀과 함께 진행했어.'],other:['행사 끝나도 정리할 일이 꽤 많네.','결과가 괜찮아서 다행이야.','실제로 보면 디테일이 더 잘 보여.']},
 'han-2':{praise:['이런 평범한 사진도 좋게 봐주는구나.','고마워. 정신없는 하루였어.'],ask:['아직 회사야. 정리할 게 남았거든.','일정은 끝났는데 메일이 남아 있네.'],other:['월요일은 늘 조금 길어지네.','이제 정말 퇴근하려고.','다음엔 더 일찍 끝내고 싶어.']},
 'han-3':{praise:['조명과 동선을 많이 조정했어.','디테일까지 봐줬네. 고마워.'],ask:['디스플레이는 브랜드 팀과 함께 맞췄어.','최종 컨펌까지 시간이 좀 걸렸어.'],other:['마지막에 고칠 곳이 하나 더 보이더라.','이 컷은 현장감이 잘 살아서 마음에 들어.','준비한 만큼 결과가 나와서 다행이야.']},
 'han-4':{praise:['고마워. 오늘은 정말 퇴근하는 중이야.','그렇게 봐줬다면 다행이고.'],ask:['집에 가는 길이야. 오늘 일정은 끝났어.','내일 일정은 오전부터 있어.'],other:['오늘은 이만 끝.','오랜만에 여유가 좀 생겼네.','내일은 조금 덜 바빴으면 좋겠다.']}
};
function commentReplyFor(pid,text){
 const author=posts[pid]?.author;
 const bank=commentReplySets[pid]||commentReplySets[author==='yul'?'yul-1':'han-1'];
 const ask=/\?|어디|뭐|얼마|언제|가능|알려|궁금|어떤|어떻게|태워|탈수|일정/.test(text);
 const praise=/멋|예쁘|좋다|최고|잘생|대박|예술|완벽|짱|귀여|멋져|굿|존잘|😍|❤️|🔥/.test(text);
 const options=bank[ask?'ask':praise?'praise':'other'];
 const earlier=Object.values(store.comments).flat().filter(c=>c.author===author).map(c=>c.text.replace(/^@you\s*/,''));
 const pool=options.filter(x=>!earlier.includes(x));
 const arr=pool.length?pool:options;
 let hash=text.length*17+pid.length;
 for(const ch of text)hash=(hash*31+ch.charCodeAt(0))>>>0;
 return '@you '+arr[hash%arr.length];
}
function scheduleCommentReply(pid,posted){
 if(!['yul','han'].includes(posts[pid]?.author)||store.blocked[posts[pid].author])return;
 const originalId=posted.id;
 setTimeout(()=>{
  const owner=posts[pid].author;
  if(store.blocked[owner]||!store.comments[pid]?.some(x=>x.id===originalId)||store.comments[pid].some(x=>x.parent===originalId&&x.author===owner))return;
  const rootId=posted.parent||originalId;
  const text=commentReplyFor(pid,posted.text);
  store.comments[pid].push({id:'reply-'+originalId,author:owner,text,likes:0,time:'방금',parent:rootId,replies:[]});
  if(opened&&current?.type==='comments'&&current.id===pid){
   current.expanded??=[];
   if(!current.expanded.includes(rootId))current.expanded.push(rootId);
   const original=allComments(pid).find(c=>c.id===rootId);
   const old=root.querySelector('.sim-comments > .sim-comment[data-comment="'+rootId+'"]');
   if(original&&old){
    const pos=root.querySelector('.sim-scroll')?.scrollTop||0;
    old.outerHTML=commentRow(pid,original);
    const sc=root.querySelector('.sim-scroll');if(sc)sc.scrollTop=pos;
   }
  }
  window.MIPIL_NOTICES?.add({text:(owner==='yul'?'전율':'전한')+'님이 댓글에 답글을 남겼습니다',account:owner,kind:'comment',postId:pid});
 },1400+Math.min(1000,posted.text.length*19));
}
function render(){clearTimeout(storyTimer);if(!current)return;let title='',content='';switch(current.type){case 'profile':title=profiles[current.id].handle;content=profileView();break;case 'post':title='게시물';content=postView(current.id);break;case 'comments':title='댓글';content=commentsView();break;case 'feed':title='피드';content=`<div class="sim-feed">${Object.values(posts).filter(p=>['yul','han'].includes(p.author)).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,8).map(p=>postView(p.id,true)).join('')}</div>`;break;case 'saved':title='저장됨';content=grid(Object.keys(store.saves).filter(k=>store.saves[k]));break;case 'activity':title='내 활동';content=activityView();break;case 'story':title=profiles[current.id].handle;break;case 'dm':title=profiles[current.id].handle+' · 메시지';content=dmView();break;case 'avatar':title=profiles[current.id].handle;content=`<div class="sim-empty">${av(current.id)}</div>`;break;default:title=current.title||'계정 검색';content=listView();}
root.innerHTML=toolbar(title)+(current.type==='story'?storyView():`<div class="sim-scroll ${current.type==='dm'?'sim-scroll-dm':''}" tabindex="-1">${content}</div>`)+(current.type==='comments'?composer():current.type==='story'?'':bottom());window.MIPIL_NOTICES?.sync();
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
 if(!text||store.blocked[id])return false;
 const messages=store.messages[id]||(store.messages[id]=[]);
 messages.push({from:'them',text,...eventData});
 // Do not replace the DM composer: its focus and draft must stay intact.
 if(opened&&current?.type==='dm'&&current.id===id){
   const panel=root.querySelector('.sim-dm-messages');
   if(panel){
     panel.querySelector('.sim-empty')?.remove();
     const bubble=document.createElement('div');bubble.className='sim-bubble theirs';bubble.textContent=text;panel.appendChild(bubble);
     requestAnimationFrame(()=>{panel.scrollTop=panel.scrollHeight;});
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
root.addEventListener('submit',e=>{if(e.target.id==='simDmForm'){e.preventDefault();const t=e.target.elements.message.value.trim();if(!t||store.blocked[current.id])return;const id=current.id;const arr=store.messages[id]||(store.messages[id]=[]);arr.push({from:'you',text:t});replyToDM(id,t);current.scroll=undefined;render();requestAnimationFrame(()=>{const msgs=root.querySelector('.sim-dm-messages');if(msgs)msgs.scrollTop=msgs.scrollHeight;const input=root.querySelector('#simDmForm input[name=message]');if(input)input.focus({preventScroll:true});});return}if(e.target.id!=='simCompose')return;e.preventDefault();const t=e.target.querySelector('textarea').value.trim();if(!t)return;const pid=current.id;if(store.blocked[posts[pid]?.author])return;const c={id:'local-'+Date.now().toString(36)+Math.random().toString(36).slice(2,5),author:'you',text:t,likes:0,time:'방금',parent:current.replyTo||null,replies:[]};store.comments[pid]||=[];store.comments[pid].push(c);persist();scheduleCommentReply(pid,c);current.draft='';if(c.parent){current.expanded||=[];if(!current.expanded.includes(c.parent))current.expanded.push(c.parent)}current.replyTo=null;current.replyAuthor=null;render();requestAnimationFrame(()=>root.querySelector(`[data-comment="${c.id}"]`)?.scrollIntoView({block:'nearest'}));toast(c.parent?'답글을 남겼습니다.':'댓글을 남겼습니다.');});
root.addEventListener('input',e=>{if(e.target.matches('textarea')){current.draft=e.target.value;root.querySelector('#simCompose button[type="submit"]').disabled=!e.target.value.trim()}if(e.target.id==='simSearch'){const pos=e.target.selectionStart;current.query=e.target.value;render();const x=root.querySelector('#simSearch');x.focus({preventScroll:true});try{x.setSelectionRange(pos,pos)}catch(_){}}});
root.addEventListener('dblclick',e=>{const m=e.target.closest('[data-media]');if(!m)return;const pid=m.dataset.media;const wasLiked=!!store.likes[pid];store.likes[pid]=true;if(!wasLiked)schedulePostLikeDM(pid);persist();redraw();const box=root.querySelector(`[data-media="${pid}"]`);if(box){const heart=document.createElement('span');heart.className='sim-media-heart';heart.textContent='♥';box.append(heart);setTimeout(()=>heart.remove(),800)}});
let touchX=null;root.addEventListener('touchstart',e=>{touchX=e.target.closest('[data-media]')?e.touches[0].clientX:null},{passive:true});root.addEventListener('touchend',e=>{if(touchX===null||current.type!=='post')return;const dx=e.changedTouches[0].clientX-touchX;touchX=null;if(Math.abs(dx)>45){current.slide=Math.max(0,Math.min(posts[current.id].images.length-1,(current.slide||0)+(dx<0?1:-1)));redraw()}},{passive:true});
layer.addEventListener('click',e=>{if(e.target===layer)close()});
document.querySelectorAll('[data-open-ig]').forEach(b=>b.addEventListener('click',()=>open(b.dataset.openIg)));
document.addEventListener('keydown',e=>{if(!opened)return;if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();back()}if(current?.type==='story'&&!e.target.matches('input,textarea')){if(e.key==='ArrowRight')storyNext();if(e.key==='ArrowLeft'&&current.index>0){current.index--;render()}}if(e.key==='Tab'){const list=[...root.querySelectorAll('button:not([disabled]),input,textarea'),...document.getElementById('musicDrawer').querySelectorAll('button:not([disabled]),input')].filter(n=>n.getClientRects().length);if(!list.length)return;const first=list[0],last=list.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}},true);
// Shared URLs open the same local fictional account/post; no external sign-in.
const deep=location.hash.match(/^#sns\/([^/]+)(?:\/([^/]+))?$/);if(deep&&profiles[deep[1]]){open(deep[1]);if(deep[2]&&posts[deep[2]])navigate({type:'post',id:deep[2]})}
window.MipilSocial={open,close};
window.MIPIL_SOCIAL_OPEN_TARGET=(account,kind,postId)=>{open(account||'yul');if(kind==='dm')navigate({type:'dm',id:account||'yul',scroll:undefined});else if(kind==='comment'&&posts[postId])navigate({type:'comments',id:postId,expanded:[]});};
})();
