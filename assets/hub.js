/* 合集首页（/）与结果总览（/overview/）共用：读取本机各测试的作答，渲染状态卡片 / 精简结果，生成跨量表综合分析提示词。
   页面通过 <body data-page="hub|overview" data-base="../"> 指定角色与相对根路径。 */
(function(){
const C=window.Common, ctx=window.ResultCtx, TESTS=window.TESTS;
const $=id=>document.getElementById(id);
const body=document.body, PAGE=body.dataset.page, BASE=body.dataset.base||'';
const REG=C.REG;
// 每个测试的状态：{T, a:{vals,answered,total,complete}, scores?, at?}
const state=REG.map(r=>{
  const T=TESTS[r.id]; const a=C.loadAnswers(T);
  const scores=a.complete?T.score(a.vals):null;
  let at=null; try{ at=Number(localStorage.getItem(T.storageKey+'At'))||null; }catch(e){}
  return { ...r, T, a, scores, at };
});
const done=state.filter(s=>s.a.complete);
const fmtDate=t=>{ if(!t) return ''; const d=new Date(t); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
const esc=C.esc;

// ---- 跨量表综合分析提示词 ----
const SCALE_NOTES=[
  '九型人格：54 题，每题 1～5 分，每 6 题对应一型，每型总分 6～30。',
  '大五人格 BFI-2：60 题，每题 1～5 分，反向题已换算，每维度 12 题取均分，另有 15 个子维度。',
  'HEXACO-60：60 题，每题 1～5 分，反向题已换算，每维度 10 题取均分（注意 HEXACO 的情绪性/宜人性与大五划分不同）。',
  '价值观 PVQ-21：21 题，量表已翻转为越高越像我，并做 MRAT 中心化——正值表示该价值高于我自己的整体均值。',
  '成人依恋 ECR：36 题，每题 1～7 分，单数题为依恋回避、双数题为依恋焦虑，各取均分；类型按 4 分为界粗略划分。'
];
function comboPrompt(mode){
  const list=done.map(s=>s.name).join('、');
  const blocks=done.map(s=>`【${s.name}】\n`+(mode==='details'?ctx.detailText(s.T,s.a.vals,s.scores):s.T.summaryText(s.scores)));
  return [
    `我做了 ${done.length} 份公开的心理量表自测（${list}），都在本地按标准方法计分。下面是各份的${mode==='details'?'逐题作答和':''}结果，请你作为同时熟悉这些模型的心理学顾问，做一份跨量表的综合分析，而不是逐份复述：`,
    '', '各量表的计分方式：', ...SCALE_NOTES.filter((_,i)=>done.some(s=>s.id===REG[i].id)).map(n=>'- '+n), '',
    '1. 跨量表一致的主题：哪些特质在多份结果里相互印证？请具体指出是哪几处。',
    '2. 相互矛盾或有张力的地方（例如某个维度在一份量表里偏高、在另一份里却偏低），可能的解释是什么？',
    '3. 在此基础上给出一份完整的性格画像：核心动机、情绪应对方式、人际与亲密关系模式、价值取向、适合的工作与协作方式。',
    '4. 指出 2～3 个盲点或值得留意的模式。',
    '5. 给我 3～5 条具体、可执行的建议（分工作、关系、生活三个方面）。',
    '', '请用中文回答，结构清晰，避免空泛套话。以下是我的结果：', '', '——————————', ...blocks.join('\n\n——————————\n\n').split('\n')
  ].join('\n');
}
function prefillNote(prompt){ return encodeURIComponent(prompt).length>C.PREFILL_MAX ? '内容较长，AI 网站不能自动填好：点图标会先复制，再点「打开」过去粘贴发送。' : '点图标会复制并在 AI 网站里填好内容，过去直接发送即可。'; }

// ---- 合集首页 ----
if(PAGE==='hub'){
  $('doneCount').textContent=`本机已完成 ${done.length} / ${state.length}`;
  $('cards').innerHTML=state.map(s=>{
    const {a}=s; const st=a.complete?'done':a.answered>0?'doing':'todo';
    const chip = st==='done'?`<span class="lvl ok">已完成</span>`: st==='doing'?`<span class="lvl">进行中 · ${a.answered} / ${a.total}</span>`:`<span class="lvl grey">未开始</span>`;
    const prog = st==='doing'?`<div class="mini-track"><div class="mini-fill" style="width:${a.answered/a.total*100}%"></div></div>`:'';
    const summary = st==='done'?esc(s.T.brief(s.scores)) : st==='doing'?`上次答到第 ${a.answered} 题`:'—';
    const action = st==='done'?'查看结果':st==='doing'?'继续答题':'开始测试';
    const href = BASE+s.path+(st==='done'?'#result':'');
    return `<a class="tcard" href="${href}"><div class="tcard-head"><h2><span class="ticon" aria-hidden="true">${s.icon}</span>${s.name}</h2>${chip}</div><div class="meta">${s.meta}</div><p>${s.desc}</p>${prog}<div class="tcard-foot"><span class="tsum">${summary}</span><span class="secondary small btnlike">${action}</span></div></a>`;
  }).join('');
  const combo=$('combo');
  if(done.length>=2){
    $('comboTitle').textContent=`把已完成的 ${done.length} 份结果一起交给 AI，做一份跨量表的综合分析`;
    $('comboDesc').textContent=`提示词会说明每份量表的计分方式，并要求 AI 找出各测试之间相互印证或矛盾的地方，而不是逐份复述。${done.length<state.length?'未完成的测试不会包含在内。':''}`;
    $('comboCopy').onclick=()=>C.copyText(comboPrompt('summary'),'综合分析提示词（含全部结果）已复制，粘贴到任意 AI 即可。');
    C.aiButtons($('comboAi'), ()=>comboPrompt('summary'));
    $('comboNote').textContent='只含各测试的汇总结果；要连逐题作答一起给 AI，请到「结果总览」。';
    combo.hidden=false;
  } // 不足 2 份时面板保持隐藏（首页介绍里已经提到这个功能）
}

// ---- 结果总览 ----
if(PAGE==='overview'){
  $('doneCount').textContent=`已完成 ${done.length} / ${state.length}`;
  $('sections').innerHTML=state.map(s=>{
    const {a}=s; const st=a.complete?'done':a.answered>0?'doing':'todo';
    const sub = st==='done'?`${s.at?fmtDate(s.at)+' 完成 · ':''}${a.total} 题` : st==='doing'?'进行中':'未开始';
    let inner;
    if(st==='done') inner = (s.T.compact||s.T.renderResult)(s.scores, ctx);
    else if(st==='doing') inner = `<div class="cont"><div class="mini-track"><div class="mini-fill" style="width:${a.answered/a.total*100}%"></div></div><span>已答 ${a.answered} / ${a.total}</span><a class="secondary small btnlike" href="${BASE+s.path}">继续答题</a></div>`;
    else inner = `<div class="cont"><span>还没做这份测试。</span><a class="secondary small btnlike" href="${BASE+s.path}">开始测试（${s.meta.split('·').pop().trim()}）</a></div>`;
    return `<section class="osec${st!=='done'?' muted':''}"><div class="osec-head"><h2><span class="ticon" aria-hidden="true">${s.icon}</span>${s.name}</h2><span>${sub}</span>${st==='done'?`<a href="${BASE+s.path}#result">完整结果 →</a>`:''}</div>${inner}</section>`;
  }).join('');
  ctx.grow($('sections'));
  const ex=$('exportBox');
  if(done.length===0){ ex.style.display='none'; }
  else{
    let mode='summary';
    $('exportMode').addEventListener('click',e=>{ const b=e.target.closest('button[data-mode]'); if(!b) return; mode=b.dataset.mode; $('exportMode').querySelectorAll('button').forEach(x=>{ const on=x===b; x.classList.toggle('on',on); x.setAttribute('aria-checked',on); }); $('lenNote').textContent=lenNote(); });
    const lenNote=()=>{ const p=comboPrompt(mode); return `${mode==='details'?'逐题版':'汇总版'}约 ${p.length.toLocaleString()} 字。${prefillNote(p)}`; };
    $('lenNote').textContent=lenNote();
    $('copyAll').onclick=()=>C.copyText(comboPrompt(mode),'综合分析提示词（含全部结果）已复制，粘贴到任意 AI 即可。');
    $('copyPlain').onclick=()=>C.copyText(done.map(s=>`【${s.name}】\n`+(mode==='details'?ctx.detailText(s.T,s.a.vals,s.scores):s.T.summaryText(s.scores))).join('\n\n——————————\n\n'),'全部结果已复制到剪贴板。');
    document.querySelector('.dl-group').addEventListener('click',e=>{
      const b=e.target.closest('button[data-format]'); if(!b) return; const format=b.dataset.format;
      let content;
      if(format==='json') content=JSON.stringify({title:'心理自测结果总览',exportedAt:new Date().toISOString(),tests:done.map(s=>({id:s.id,name:s.name,scores:s.T.summaryRows(s.scores).map(r=>({name:r[0],score:r[1]})),...(mode==='details'?{answers:s.T.items.map((q,i)=>({questionNo:i+1,question:(s.T.stemBefore||'')+q+(s.T.stemAfter||''),score:s.a.vals[i]}))}:{})}))},null,2);
      else content=done.map(s=>`【${s.name}】\n`+(mode==='details'?ctx.detailText(s.T,s.a.vals,s.scores):s.T.summaryText(s.scores))).join('\n\n——————————\n\n');
      C.download(`心理自测结果总览${mode==='details'?'_逐题':''}_${C.stamp()}.${format}`, content, format);
    });
    C.aiButtons($('aiGroup'), ()=>comboPrompt(mode));
  }
}
})();
