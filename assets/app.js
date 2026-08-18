/* 通用答题引擎：由页面里的 window.TEST 配置驱动（各测试配置见 assets/tests/*.js）。
   TEST = {
     id, title, storageKey, filePrefix,
     scale: [{v, label}, ...],                 // 选项（5/6/7 点均可）
     stemBefore, stemAfter,                    // 题干前后缀（可选，如 BFI-2 的“我是一个……的人”）
     items: [string],                          // 题目
     score(vals) -> scores                     // 计分，返回任意结构
     renderResult(scores, ctx) -> html         // 结果区主体（维度条、解读等）
     compact(scores, ctx) -> html              // 结果总览页用的精简版（可选）
     brief(scores) -> string                   // 一句话摘要（合集页卡片用，可选）
     summaryText(scores) -> string             // 汇总结果纯文本
     summaryRows(scores) -> [[名称, 分数], ...] // 汇总结果 CSV/JSON 行
     aiIntro(mode) -> string, aiQuestions -> [string] | mode => [string]
     flatWarn: false                           // 关闭引擎自带的“选项过于集中”提醒（自己在 renderResult 里处理）
   }
   ctx（window.ResultCtx，见 result-ctx.js）提供：bar / sub / diverging / level / tag / flatness 等小工具。 */
(function(){
const C = window.Common;
const T = window.TEST;
const $ = id => document.getElementById(id);
const N = T.items.length;
const SCALE = T.scale;
const LABELS = Object.fromEntries(SCALE.map(s=>[s.v,s.label]));
const esc = C.esc, toast = C.toast;
let latestScores = null;

const store = { // 隐私模式等场景下 localStorage 可能抛错，静默降级
  get(){ try{ return JSON.parse(localStorage.getItem(T.storageKey)||'{}'); }catch(e){ return {}; } },
  set(v){ try{ localStorage.setItem(T.storageKey,JSON.stringify(v)); }catch(e){} },
  clear(){ try{ localStorage.removeItem(T.storageKey); }catch(e){} }
};

// ---- 渲染题目 ----
const root = $('questions');
T.items.forEach((q,i)=>{
  const n=i+1; const el=document.createElement('article'); el.className='question'; el.id='q'+n;
  const text = (T.stemBefore?`<span class="stem">${esc(T.stemBefore)}</span>`:'') + esc(q) + (T.stemAfter?`<span class="stem">${esc(T.stemAfter)}</span>`:'');
  el.innerHTML=`<p class="qtext" id="qt${n}"><span class="num">${n}.</span>${text}</p><fieldset class="options n${SCALE.length}" style="--n:${SCALE.length}" aria-labelledby="qt${n}">${SCALE.map(s=>`<label><input type="radio" name="q${n}" value="${s.v}" aria-label="${s.v} ${esc(s.label)}"><span>${s.v}</span><small>${esc(s.label)}</small></label>`).join('')}</fieldset>`;
  root.appendChild(el);
});

function labelFor(v){ return LABELS[Number(v)] || ''; }
function answerOf(i){ const el=document.querySelector(`input[name=q${i+1}]:checked`); return el?Number(el.value):0; }
function allAnswers(){ return T.items.map((_,i)=>answerOf(i)); }
function checkedInputs(){ return document.querySelectorAll('#questions input:checked'); }

function update(){
  const answered=checkedInputs().length;
  $('count').textContent=`已完成 ${answered} / ${N}`;
  $('progress').style.width=(answered/N*100)+'%';
  $('progressbar').setAttribute('aria-valuenow',answered);
  const saved={}; checkedInputs().forEach(x=>saved[x.name]=x.value); store.set(saved);
  try{ if(answered===N){ if(!localStorage.getItem(T.storageKey+'At')) localStorage.setItem(T.storageKey+'At',Date.now()); } else localStorage.removeItem(T.storageKey+'At'); }catch(e){} // 完成时间，供结果总览显示
}

root.addEventListener('change',e=>{
  if(!(e.target instanceof HTMLInputElement)) return;
  update();
  const card=e.target.closest('.question'); card.classList.remove('missing');
  if($('result').style.display==='block'){ renderResult(); return; } // 结果已展示则实时重算；否则滚到下一道未答题
  let next=card.nextElementSibling;
  while(next && next.querySelector('input:checked')) next=next.nextElementSibling;
  if(next) setTimeout(()=>next.scrollIntoView({behavior:'smooth',block:'center'}),120);
});

// ---- 桌面端数字键快捷作答：按 1～N 选中视口里最靠上的未答题 ----
document.addEventListener('keydown',e=>{
  if(e.metaKey||e.ctrlKey||e.altKey) return;
  const ae=document.activeElement; if(ae && /^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName) && ae.type!=='radio') return;
  const v=Number(e.key); if(!v || !LABELS[v]) return;
  const top=[...document.querySelectorAll('.question')].find(c=>!c.querySelector('input:checked') && c.getBoundingClientRect().bottom>80);
  if(!top) return; const input=top.querySelector(`input[value="${v}"]`); if(!input) return;
  input.checked=true; input.dispatchEvent(new Event('change',{bubbles:true})); e.preventDefault();
});

// ---- 结果 ----
const ctx = window.ResultCtx;
function renderResult(){
  const vals=allAnswers(); if(vals.some(v=>!v)) return;
  const scores=T.score(vals); latestScores=scores;
  const f=ctx.flatness(vals);
  const warn = (T.flatWarn!==false && f.ratio>=0.85) ? `<div class="warn">你有 ${f.top} / ${N} 题选了同一个分数，作答区分度不足，下面的结果参考价值有限。建议按第一直觉重新作答，尽量拉开「符合」与「不符合」的题目。</div>` : '';
  $('resultBody').innerHTML = warn + T.renderResult(scores, ctx);
  ctx.grow($('resultBody'));
  $('summary').value=T.summaryText(scores);
  renderNext();
  $('result').style.display='block';
  updateFab();
}

// ---- 接下来：推荐下一份测试 / 综合分析入口 ----
function renderNext(){
  const el=$('next'); if(!el) return;
  const others=C.REG.filter(r=>r.id!==T.id).map(r=>({...r,p:C.progressOf(r)}));
  const doneCount=1+others.filter(o=>o.p.complete).length;
  const todo=others.filter(o=>!o.p.complete);
  const rec=todo.find(o=>o.p.answered>0) || [...todo].sort((a,b)=>a.minutes-b.minutes)[0]; // 先接着做没做完的，否则挑最短的
  const rows=[];
  if(rec){
    const going=rec.p.answered>0;
    rows.push(`<div class="next-row"><span class="ticon" aria-hidden="true">${rec.icon}</span><div class="next-text"><b>${going?`继续做「${rec.name}」`:`再花约 ${rec.minutes} 分钟做「${rec.name}」`}</b><span>${going?`上次答到第 ${rec.p.answered} 题，共 ${rec.p.total} 题。`:esc(rec.desc)}</span></div><a class="primary small btnlike" href="../${rec.path}">${going?'继续答题':'开始'}</a></div>`);
  }
  if(doneCount>=2){
    rows.push(`<div class="next-row"><span class="ticon" aria-hidden="true">🧩</span><div class="next-text"><b>${doneCount===C.REG.length?'五份都做完了，':`你已完成 ${doneCount} 份，`}可以做一次跨量表的综合分析</b><span>把几份结果放在一起交给 AI，看哪些特质相互印证、哪些互相矛盾。</span></div><a class="${rec?'secondary':'primary'} small btnlike" href="../overview/">去综合分析</a></div>`);
  }
  el.innerHTML=`<h3>接下来</h3>${rows.join('')}<div class="next-links"><a href="../">全部测试</a><a href="../overview/">结果总览</a>${todo.length?`<span>还有 ${todo.length} 份没做，共约 ${todo.reduce((s,o)=>s+o.minutes,0)} 分钟</span>`:''}</div>`;
}

$('finish').onclick=()=>{
  const vals=allAnswers();
  document.querySelectorAll('.question.missing').forEach(q=>q.classList.remove('missing'));
  const missing=vals.map((v,i)=>v?-1:i).filter(i=>i>=0);
  if(missing.length){
    missing.forEach(i=>$('q'+(i+1)).classList.add('missing'));
    $('q'+(missing[0]+1)).scrollIntoView({behavior:'smooth',block:'center'});
    toast(`还有 ${missing.length} 题未作答，已为你标出，请完成后再生成结果。`, true);
    return;
  }
  renderResult();
  $('result').scrollIntoView({behavior:'smooth'});
};

// ---- 复制 / 下载 ----
let exportMode='details';
$('exportMode').addEventListener('click',e=>{ const b=e.target.closest('button[data-mode]'); if(!b) return; exportMode=b.dataset.mode; $('exportMode').querySelectorAll('button').forEach(x=>{ const on=x===b; x.classList.toggle('on',on); x.setAttribute('aria-checked',on); }); });
$('copy').onclick=()=>C.copyText(exportMode==='summary'?$('summary').value:detailText(), exportMode==='summary'?'汇总结果已复制到剪贴板。':'逐题结果已复制到剪贴板。');
function itemText(q){ return (T.stemBefore||'')+q+(T.stemAfter||''); }
function detailText(){ return ctx.detailText(T, allAnswers(), latestScores); }

function exportContent(format){
  const mode=exportMode; const vals=allAnswers(); const rows=T.summaryRows(latestScores);
  if(format==='txt') return mode==='summary'?$('summary').value:detailText();
  if(mode==='summary'){
    if(format==='json') return JSON.stringify({title:`${T.title} 结果`,scores:rows.map(r=>({name:r[0],score:r[1]}))},null,2);
    return C.csv([['维度','分数'],...rows]);
  }
  if(format==='json') return JSON.stringify({title:`${T.title} 逐题结果`,scale:SCALE,answers:T.items.map((q,i)=>({questionNo:i+1,question:itemText(q),score:vals[i],label:labelFor(vals[i])})),scores:rows.map(r=>({name:r[0],score:r[1]}))},null,2);
  return C.csv([['题号','题目','分数','选项'],...T.items.map((q,i)=>[i+1,itemText(q),vals[i],labelFor(vals[i])])]);
}
document.querySelector('.dl-group').addEventListener('click',e=>{
  const b=e.target.closest('button[data-format]'); if(!b) return;
  const format=b.dataset.format;
  C.download(`${T.filePrefix||T.title}${exportMode==='details'?'_逐题':''}_${C.stamp()}.${format}`, exportContent(format), format);
});

// ---- AI 解读 ----
function aiPrompt(){
  const content = exportMode==='summary' ? $('summary').value : detailText();
  const qs = typeof T.aiQuestions==='function' ? T.aiQuestions(exportMode) : T.aiQuestions;
  return [T.aiIntro(exportMode), '', ...qs.map((q,i)=>`${i+1}. ${q}`), '', '请用中文回答，结构清晰，避免空泛套话。以下是我的测试结果：', '', '——————————', content].join('\n');
}
C.aiButtons($('aiGroup'), aiPrompt);
$('copyPrompt').onclick=()=>C.copyText(aiPrompt(),'提示词 + 结果已复制，粘贴到任意 AI 即可。');

$('clear').onclick=()=>{
  if(!confirm('确定要清空所有答案并重新开始吗？')) return;
  checkedInputs().forEach(x=>x.checked=false);
  document.querySelectorAll('.question.missing').forEach(q=>q.classList.remove('missing'));
  $('result').style.display='none'; update(); store.clear(); updateFab(); if(location.hash) history.replaceState(null,'',location.pathname);
  window.scrollTo({top:0,behavior:'smooth'}); toast('已清空，可以重新开始作答。');
};
$('toplink').onclick=e=>{ e.preventDefault(); window.scrollTo({top:0,behavior:'smooth'}); };

// ---- 头部收起 / 浮动按钮 ----
// 向下滚动时收起头部。关键：收起后补齐高度差，让头部占据的文档流高度不变，
// 否则浏览器的滚动锚定会把 scrollY 拉回阈值以下，造成展开/收起来回抖动。
const header=$('header'); const questionsEl=$('questions');
let expandedH=0, compactH=0;
function measureHeader(){
  const was=header.classList.contains('compact');
  header.classList.remove('compact'); questionsEl.style.paddingTop=''; expandedH=header.offsetHeight;
  header.classList.add('compact'); compactH=header.offsetHeight;
  header.classList.toggle('compact',was); if(was) questionsEl.style.paddingTop=Math.max(0,expandedH-compactH)+'px';
}
function applyHeader(){
  const want=window.scrollY>expandedH;
  if(want===header.classList.contains('compact')) return;
  header.classList.toggle('compact',want);
  questionsEl.style.paddingTop = want ? Math.max(0,expandedH-compactH)+'px' : '';
}
measureHeader();
// 浮动按钮：有结果且结果在视口下方 → 「查看结果」，否则滚得够远 → 「回到顶部」
function updateFab(){
  const fab=$('fab'); const res=$('result');
  const resultShown=res.style.display==='block';
  const resultBelow=resultShown && res.getBoundingClientRect().top>innerHeight;
  if(resultBelow){ fab.textContent='查看结果 ↓'; fab.dataset.act='result'; fab.classList.add('show'); }
  else if(window.scrollY>innerHeight){ fab.textContent='回到顶部 ↑'; fab.dataset.act='top'; fab.classList.add('show'); }
  else fab.classList.remove('show');
}
$('fab').onclick=()=>{ if($('fab').dataset.act==='result') $('result').scrollIntoView({behavior:'smooth'}); else window.scrollTo({top:0,behavior:'smooth'}); };
let ticking=false;
window.addEventListener('scroll',()=>{ if(ticking) return; ticking=true; requestAnimationFrame(()=>{ applyHeader(); updateFab(); ticking=false; }); },{passive:true});
let resizeTimer; window.addEventListener('resize',()=>{ clearTimeout(resizeTimer); resizeTimer=setTimeout(()=>{ measureHeader(); applyHeader(); updateFab(); },150); });

// 初始化：恢复本机保存的进度
(function init(){
  Object.entries(store.get()).forEach(([name,value])=>{ const input=document.querySelector(`input[name="${name}"][value="${value}"]`); if(input) input.checked=true; });
  update();
  const answered=checkedInputs().length;
  if(answered===N){ renderResult(); if(location.hash==='#result') setTimeout(()=>$('result').scrollIntoView(),50); else toast('已恢复你上次的答题结果。', false, {label:'查看结果', fn:()=>$('result').scrollIntoView({behavior:'smooth'})}); }
  else if(answered>0){ toast(`已恢复上次进度：${answered} / ${N} 题。`); }
  applyHeader(); updateFab();
})();
})();
