/* 大五人格问卷 BFI-2 中文版（张博等译）。计分键来自量表 PDF：R = 反向计分（6 - x）。 */
window.TEST = (function(){
const items = [
"性格外向，喜欢交际","心肠柔软，有同情心","缺乏条理","从容，善于处理压力","对艺术没有什么兴趣",
"性格坚定自信，敢于表达自己的观点","为人恭谦，尊重他人","比较懒","经历挫折后仍能保持积极心态","对许多不同的事物都感兴趣",
"很少觉得兴奋或者特别想要（做）什么","常常挑别人的毛病","可信赖的，可靠的","喜怒无常，情绪起伏较多","善于创造，能找到聪明的方法来做事",
"比较安静","对他人没有什么同情心","做事有计划有条理","容易紧张","着迷于艺术、音乐或文学",
"常常处于主导地位，像个领导一样","常与他人意见不和","很难开始行动起来去完成一项任务","觉得有安全感，对自己满意","不喜欢知识性或者哲学性强的讨论",
"不如别人有活力","宽宏大量","有时比较没有责任心","情绪稳定，不易生气","几乎没有什么创造性",
"有时会害羞，比较内向","乐于助人，待人无私","习惯让事物保持整洁有序","时常忧心忡忡，担心很多事情","重视艺术与审美",
"感觉自己很难对他人产生影响","有时对人比较粗鲁","有效率，做事有始有终","时常觉得悲伤","思想深刻",
"精力充沛","不相信别人，怀疑别人的意图","可靠的，总是值得他人信赖","能够控制自己的情绪","缺乏想象力",
"爱说话，健谈","有时对人冷淡，漠不关心","乱糟糟的，不爱收拾","很少觉得焦虑或者害怕","觉得诗歌、戏剧很无聊",
"更喜欢让别人来领头负责","待人谦逊礼让","有恒心，能坚持把事情做完","时常觉得郁郁寡欢","对抽象的概念和想法没什么兴趣",
"充满热情","把人往最好的方面想","有时候会做出一些不负责任的行为","情绪多变，容易愤怒","有创意，能想出新点子"
];
const R = new Set([3,4,5,8,9,11,12,16,17,22,23,24,25,26,28,29,30,31,36,37,42,44,45,47,48,49,50,51,55,58]); // 反向题号
const domains = [
  { key:'E', name:'外向性', en:'Extraversion', facets:[['社交',[1,16,31,46]],['果断',[6,21,36,51]],['活力',[11,26,41,56]]],
    hi:'偏外向：喜欢社交、敢于表达和主导、精力充沛，通常在与人互动中获得能量。', lo:'偏内向：更喜欢安静和独处，社交上比较保留，倾向让别人领头，节奏偏平缓。', mid:'外向与内向之间：能社交也能独处，取决于场合和状态。' },
  { key:'A', name:'宜人性', en:'Agreeableness', facets:[['同情',[2,17,32,47]],['谦恭',[7,22,37,52]],['信任',[12,27,42,57]]],
    hi:'偏宜人：体贴、乐于助人、尊重他人、倾向信任别人，在意关系和谐。', lo:'偏低：更直率、有竞争性、对人持怀疑或挑剔态度，不太在意是否让人舒服。', mid:'中等：既能合作体谅，也能在需要时坚持自己、提出异议。' },
  { key:'C', name:'尽责性', en:'Conscientiousness', facets:[['条理',[3,18,33,48]],['效率',[8,23,38,53]],['负责',[13,28,43,58]]],
    hi:'偏高：有条理、有计划、能坚持完成任务、靠得住，自我要求较高。', lo:'偏低：更随性、不太拘泥于计划和整洁，容易拖延或半途而废，但也更灵活。', mid:'中等：该认真时能认真，但不会事事追求完美和秩序。' },
  { key:'N', name:'负性情绪', en:'Negative Emotionality，即神经质', facets:[['焦虑',[4,19,34,49]],['抑郁',[9,24,39,54]],['易变',[14,29,44,59]]],
    hi:'偏高：容易紧张、担忧、情绪起伏大，遇挫折时更容易低落，压力反应较强。', lo:'偏低：情绪稳定、从容，不容易焦虑或恼怒，挫折后恢复较快。', mid:'中等：会有情绪波动，但通常能应对，与多数人相当。' },
  { key:'O', name:'开放性', en:'Open-Mindedness', facets:[['好奇',[10,25,40,55]],['审美',[5,20,35,50]],['想象',[15,30,45,60]]],
    hi:'偏高：好奇心强、喜欢思考抽象问题、重视艺术审美、想象力和创造力丰富。', lo:'偏低：更务实、偏好具体和熟悉的事物，对艺术和抽象讨论兴趣不大。', mid:'中等：对新想法持开放态度，但不特别追求新奇或艺术体验。' }
];
const mean = a => a.reduce((s,x)=>s+x,0)/a.length;
const val = (vals,n) => R.has(n) ? 6-vals[n-1] : vals[n-1];

function score(vals){
  return domains.map(d=>{
    const facets=d.facets.map(([name,ids])=>({name, value:mean(ids.map(n=>val(vals,n)))}));
    const all=d.facets.flatMap(([,ids])=>ids);
    return { key:d.key, name:d.name, en:d.en, value:mean(all.map(n=>val(vals,n))), facets, hi:d.hi, lo:d.lo, mid:d.mid };
  });
}
const lvl = v => v<2.5?'lo':v>3.5?'hi':'mid';
function renderResult(S, c){
  const dims=S.map(d=>{
    const l=lvl(d.value);
    return `<div class="dim">${c.bar(d.name,d.value,1,5,{tag:c.tag(l)})}<p class="desc">${d[l]}</p><div class="subs">${d.facets.map(f=>c.sub(f.name,f.value,1,5)).join('')}</div></div>`;
  }).join('');
  return `<div class="dims">${dims}</div><p class="legend">维度均分 1～5：低于 2.5 记为「偏低」，高于 3.5 记为「偏高」，其余为「中等」。子维度每个 4 题。</p>`;
}
function summaryText(S){
  const lines=['大五人格 BFI-2 测试结果（各维度均分，1～5 分）',''];
  S.forEach(d=>{ const l=lvl(d.value); lines.push(`${d.name}（${d.en}）：${d.value.toFixed(2)}　${l==='hi'?'偏高':l==='lo'?'偏低':'中等'}`); lines.push('   子维度：'+d.facets.map(f=>`${f.name} ${f.value.toFixed(2)}`).join('，')); });
  lines.push('','说明：反向题已换算；偏高/偏低以量表中点粗略划分（<2.5 偏低，>3.5 偏高），非常模比较。');
  return lines.join('\n');
}
function summaryRows(S){ const rows=[]; S.forEach(d=>{ rows.push([d.name,+d.value.toFixed(2)]); d.facets.forEach(f=>rows.push([`${d.name}-${f.name}`,+f.value.toFixed(2)])); }); return rows; }
const lvlText = l => l==='hi'?'高':l==='lo'?'低':'中';
function brief(S){ const s=[...S].sort((a,b)=>b.value-a.value); const hi=s[0], lo=s[s.length-1]; return `${hi.name} ${hi.value.toFixed(1)} ${lvlText(lvl(hi.value))} · ${lo.name} ${lo.value.toFixed(1)} ${lvlText(lvl(lo.value))}`; }
function compact(S, c){ return `<div class="grid2 bars">${S.map(d=>c.bar(d.name,d.value,1,5,{tag:c.tag(lvl(d.value))})).join('')}</div>`; }
return {
  id:'bfi2', title:'大五人格测试（BFI-2）', storageKey:'bfi2Answers', filePrefix:'大五人格BFI2结果',
  scale:[{v:1,label:'非常不同意'},{v:2,label:'不太同意'},{v:3,label:'态度中立'},{v:4,label:'比较同意'},{v:5,label:'非常同意'}],
  stemBefore:'我是一个', stemAfter:'的人',
  items, score, renderResult, compact, brief, summaryText, summaryRows,
  aiIntro: mode => `我刚完成了大五人格问卷 BFI-2 中文版（60 题，每题 1～5 分：1=非常不同意，5=非常同意；反向题已换算，每个维度 12 题取均分，另有 15 个子维度各 4 题）。下面是我的${mode==='summary'?'各维度得分':'逐题作答和各维度得分'}，请你作为熟悉大五人格模型的心理学顾问帮我分析：`,
  aiQuestions:[
    '逐一解读五个维度的得分，特别是子维度之间的差异（例如外向性里社交高但果断低说明什么）。',
    '综合五个维度，给出一个整体的性格画像：我在人际、工作、情绪应对上大概是什么样子。',
    '指出得分组合中值得留意的地方——哪些组合是优势，哪些可能带来困扰或盲点。',
    '这样的性格特点适合怎样的工作方式、协作方式和生活节奏？',
    '给我 3 条具体、可执行的建议，帮助我更好地发挥优势、补足短板。'
  ]
};
})();
(window.TESTS=window.TESTS||{})[window.TEST.id]=window.TEST;
