/* 结果渲染小工具（答题页与结果总览页共用），挂在 window.ResultCtx。 */
window.ResultCtx = (function(){
const esc = window.Common.esc;
const fmt = (x, d=2) => (Math.round(x*Math.pow(10,d))/Math.pow(10,d)).toFixed(d);
const pct = (v,min,max) => Math.max(0,Math.min(100,(v-min)/(max-min)*100));
return {
  fmt, pct, esc,
  bar(name, value, min, max, o={}){
    const w=pct(value,min,max);
    return `<div class="row${o.best?' best':''}"><span class="name">${esc(name)}${o.tag||''}</span><div class="track"><div class="fill" data-w="${w}"></div></div><span class="val">${o.text!=null?o.text:fmt(value,o.digits==null?2:o.digits)}</span></div>`;
  },
  sub(name, value, min, max, o={}){
    const w=pct(value,min,max);
    return `<div class="sub"><span>${esc(name)}</span><div class="track"><div class="fill" data-w="${w}"></div></div><span class="val">${o.text!=null?o.text:fmt(value,o.digits==null?2:o.digits)}</span></div>`;
  },
  diverging(name, value, range, o={}){ // 以 0 为中心的双向条
    const half=Math.max(0,Math.min(50,Math.abs(value)/range*50));
    const style = value>=0 ? `left:50%;` : `left:${50-half}%;`;
    const cls = value>=0 ? 'fill' : 'fill neg';
    return `<div class="diverging"><span class="name">${esc(name)}${o.tag||''}</span><div class="track"><div class="${cls}" style="${style}" data-w="${half}"></div></div><span class="val">${(value>=0?'+':'')+fmt(value,2)}</span></div>`;
  },
  level(v, lo, hi){ return v<lo?'lo':v>hi?'hi':'mid'; },
  tag(l, textLo='偏低', textMid='中等', textHi='偏高'){ return `<span class="lvl ${l}">${l==='lo'?textLo:l==='hi'?textHi:textMid}</span>`; },
  // 作答区分度：绝大多数题选了同一个分数时给出提醒
  flatness(vals){ const cnt={}; vals.forEach(v=>cnt[v]=(cnt[v]||0)+1); const top=Math.max(...Object.values(cnt)); return { top, ratio: top/vals.length, distinct:Object.keys(cnt).length }; },
  // 让条形从 0 长到目标宽度（后台标签页 rAF 可能被节流，加个 setTimeout 兜底）
  grow(root){ const f=()=>root.querySelectorAll('.fill[data-w]').forEach(el=>el.style.width=el.dataset.w+'%'); requestAnimationFrame(()=>requestAnimationFrame(f)); setTimeout(f,120); },
  // 逐题结果纯文本
  detailText(T, vals, scores){
    const LABELS=Object.fromEntries(T.scale.map(s=>[s.v,s.label]));
    return [`${T.title} 逐题结果`,...T.items.map((q,i)=>`${i+1}. ${(T.stemBefore||'')+q+(T.stemAfter||'')}\n   我的选择：${vals[i]}（${LABELS[vals[i]]||''}）`),'——————————',T.summaryText(scores)].join('\n\n');
  }
};
})();
