/* 各页面共用：toast、复制、下载、AI 站点按钮、本地存储读取。挂在 window.Common 上。 */
window.Common = (function(){
let toastTimer;
function toast(msg, isError, action){
  const t=document.getElementById('toast'); if(!t) return;
  t.textContent=msg; t.classList.toggle('error',!!isError); t.classList.toggle('actionable',!!action);
  if(action){ const a=document.createElement('a'); a.textContent=action.label; a.onclick=()=>{ action.fn(); t.classList.remove('show'); }; t.appendChild(a); }
  t.classList.add('show'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>t.classList.remove('show'), action?5000:2200);
}
function copyTextSync(text){ // 同步复制（用于紧接着要打开新窗口的场景）
  const t=document.createElement('textarea'); t.value=text; t.setAttribute('readonly',''); t.style.cssText='position:fixed;top:0;left:0;opacity:0;pointer-events:none';
  document.body.appendChild(t); t.select(); t.setSelectionRange(0,text.length); let ok=false; try{ ok=document.execCommand('copy'); }catch(e){} t.remove();
  if(navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).catch(()=>{});
  return ok;
}
async function copyText(text, okMsg){
  try{ await navigator.clipboard.writeText(text); toast(okMsg); }
  catch(e){ const ok=copyTextSync(text); toast(ok?okMsg:'复制失败，请手动选择文本复制。', !ok); }
}
function csv(rows){ return rows.map(row=>row.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(',')).join('\n'); }
function stamp(){ const d=new Date(); return `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`; }
function download(name, content, format){
  const mime=format==='json'?'application/json;charset=utf-8':format==='csv'?'text/csv;charset=utf-8':'text/plain;charset=utf-8';
  const blob=new Blob([(format==='csv'?'\uFEFF':'')+content],{type:mime}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob);
  a.download=name; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  toast(`${format.toUpperCase()} 文件已开始下载。`);
}
// 全站测试注册表（顺序 = 首页展示顺序）；n = 题数，minutes = 预计用时
const REG=[
  {id:'enneagram', icon:'🌀', name:'九型人格',      path:'enneagram/',  storageKey:'enneagramAnswers', n:54, minutes:8, meta:'54 题 · 5 点量表 · 约 8 分钟', desc:'九种性格类型的得分、主型与可能的翼型。'},
  {id:'bfi2',      icon:'🌿', name:'大五人格 BFI-2', path:'bfi2/',      storageKey:'bfi2Answers',      n:60, minutes:8, meta:'60 题 · 5 点量表 · 约 8 分钟', desc:'外向性、宜人性、尽责性、负性情绪、开放性五个维度，外加 15 个子维度。目前学术研究中最主流的人格模型。'},
  {id:'hexaco',    icon:'🔮', name:'HEXACO 六因素',  path:'hexaco/',    storageKey:'hexaco60Answers',  n:60, minutes:8, meta:'60 题 · 5 点量表 · 约 8 分钟', desc:'在大五之外多出「诚实-谦逊」维度，情绪性与宜人性的划分也不同，可与大五对照着看。'},
  {id:'pvq21',     icon:'🧭', name:'价值观 PVQ-21',  path:'values/',    storageKey:'pvq21Answers',     n:21, minutes:4, meta:'21 题 · 6 点量表 · 约 4 分钟', desc:'Schwartz 十种基本价值的相对重要性，以及开放变化 / 保守、自我提升 / 自我超越两条轴。'},
  {id:'ecr',       icon:'💞', name:'成人依恋 ECR',   path:'attachment/', storageKey:'ecrAnswers',      n:36, minutes:6, meta:'36 题 · 7 点量表 · 约 6 分钟', desc:'亲密关系中的依恋回避与依恋焦虑两个维度，以及安全 / 痴迷 / 疏离 / 恐惧四种类型倾向。'}
];
// 某个测试在本机的进度（只看题数，不需要加载它的配置）
function progressOf(reg){
  let saved={}; try{ saved=JSON.parse(localStorage.getItem(reg.storageKey)||'{}'); }catch(e){}
  let answered=0; for(let i=1;i<=reg.n;i++) if(Number(saved['q'+i])) answered++;
  return { answered, total:reg.n, complete: answered===reg.n };
}
const isTouch = !(window.matchMedia && window.matchMedia('(hover:hover) and (pointer:fine)').matches);
const isWechat = /MicroMessenger/i.test(navigator.userAgent);
const AI_SITES=[
  {key:'chatgpt', name:'ChatGPT', url:'https://chatgpt.com/', prefill:q=>`https://chatgpt.com/?q=${q}`},
  {key:'claude', name:'Claude', url:'https://claude.ai/new', prefill:q=>`https://claude.ai/new?q=${q}`},
  {key:'deepseek', name:'DeepSeek', url:'https://chat.deepseek.com/'},
  {key:'kimi', name:'Kimi', url:'https://www.kimi.com/'},
  {key:'doubao', name:'豆包', url:'https://www.doubao.com/chat/'},
  {key:'qwen', name:'千问', url:'https://chat.qwen.ai/'}
];
const PREFILL_MAX=6000; // URL 过长会被服务端拒绝，超过则只复制不预填
// 在容器里渲染 AI 站点按钮；getPrompt() 返回要发送的完整文本。
// 交接方式：点击 → 同步复制 → 在按钮下方展开一块常驻引导（已复制 → 打开 X → 粘贴发送）。
// 桌面端（有鼠标）额外立刻新开标签页；触屏设备只复制不跳转，由用户点引导里的「打开」——
// 因为手机上新页面一打开本页就看不见了，toast 来不及看，用户到了 AI 页面不知道要粘贴。
function aiButtons(container, getPrompt){
  const LOGOS=window.AI_LOGOS||{};
  container.innerHTML = AI_SITES.map(a=>`<button type="button" class="ai-btn" data-ai="${a.key}">${LOGOS[a.key]?`<img src="${LOGOS[a.key]}" alt="" aria-hidden="true">`:''}${a.name}</button>`).join('');
  const panel=document.createElement('div'); panel.className='handoff'; panel.hidden=true; container.insertAdjacentElement('afterend',panel);
  container.addEventListener('click',e=>{
    const b=e.target.closest('button[data-ai]'); if(!b) return;
    const site=AI_SITES.find(a=>a.key===b.dataset.ai); const prompt=getPrompt(); if(!prompt) return;
    let url=site.url, prefilled=false;
    if(site.prefill){ const q=encodeURIComponent(prompt); if(q.length<=PREFILL_MAX){ url=site.prefill(q); prefilled=true; } }
    const ok=copyTextSync(prompt); // 必须在点击事件内同步执行
    container.querySelectorAll('.ai-btn').forEach(x=>x.classList.toggle('picked',x===b));
    const step1 = ok ? `<span class="hstep ok">✓ 已复制「提示词 + 结果」到剪贴板</span>` : `<span class="hstep bad">复制没有成功，请先用下方「复制文本」手动复制</span>`;
    const step2 = `<a class="hopen primary" href="${url}" target="_blank" rel="noopener">打开 ${site.name} ↗</a>`;
    const step3 = `<span class="hstep">${prefilled ? '打开后内容已填好，直接发送' : '打开后在输入框长按 / 右键 → 粘贴，发送'}</span>`;
    const wx = isWechat ? `<span class="hstep warn">微信内可能打不开外部网站或无法粘贴：请点右上角「···」→「在浏览器中打开」后再操作。</span>` : '';
    panel.innerHTML = step1+step2+step3+wx; panel.hidden=false;
    if(!ok){ const d=container.closest('.export-box')?.querySelector('details.more'); if(d) d.open=true; } // 复制失败时把手动复制的按钮展开出来
    if(!isTouch){ window.open(url,'_blank','noopener'); toast(ok?`已复制，并打开了 ${site.name}${prefilled?'（内容已填好）':'，粘贴发送即可'}。`:`已打开 ${site.name}，但复制失败，请手动复制。`, !ok); }
    else if(ok) toast(`已复制，点「打开 ${site.name}」继续。`);
  });
}
// 读取某个测试在本机保存的答案：返回 {vals:[...], answered, total, complete}
function loadAnswers(T){
  let saved={}; try{ saved=JSON.parse(localStorage.getItem(T.storageKey)||'{}'); }catch(e){}
  const vals=T.items.map((_,i)=>Number(saved['q'+(i+1)])||0);
  const answered=vals.filter(Boolean).length;
  return { vals, answered, total:T.items.length, complete: answered===T.items.length && answered>0 };
}
const esc = s => String(s).replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
if(isWechat) document.addEventListener('DOMContentLoaded',()=>document.body.classList.add('wechat'));
return { toast, copyTextSync, copyText, csv, stamp, download, AI_SITES, PREFILL_MAX, aiButtons, loadAnswers, esc, REG, progressOf, isTouch, isWechat };
})();
