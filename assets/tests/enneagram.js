/* 九型人格快速测试（54 题，每 6 题对应一型，第 1～6 题对应 1 号，以此类推）。从原 index.html 迁移到通用引擎，题目、计分与措辞保持不变。 */
window.TEST = (function(){
const items = [
"我总是注意到别人的错误，并向他直接指出来。", "大家觉得我总是一脸严肃，表情生硬。", "我力求尽善尽美，常常反思不足、自我批评、努力改进。", "我期望一切井然有序，无法对明知的错误或混乱视而不见。", "大家觉得我应该放松点，多一点人情味。", "只有每个步骤及细节都做对了，结果才会正确。",
"帮不到别人的时候我感到特别难受。", "我高兴帮助别人，却不习惯需要别人的帮助。", "我时常为别人的事四处跑，忙得不亦乐乎。", "当没有为别人的事而忙碌时，我会感到寂寞。", "大家很乐意向我诉说他们的困难。", "我会基于同情心站在朋友一边，即使他们犯错了。",
"我不觉得向别人展示自己的成功有什么难为情的。", "我喜欢当主角，受到众人的关注。", "我能轻易说服别人。", "我办事效率高，能迅速模仿别人快捷的办法。", "我精力充沛，喜欢不断追求更多的成功。", "不管什么场合，人们都能看到我最棒的一面。",
"我特别能感受悲伤，有时甚至享受这种感觉。", "我缺少很多别人拥有的东西。", "我常常有被遗弃的感觉。", "初见我的人觉得我表现冷漠而高傲。", "我常常不知道自己下一刻想要什么。", "我常在同一天内感受到喜怒哀乐的变化。",
"探索自然的奥秘，我感到其乐无穷。", "我很少主动去接近别人。", "我很少快速做出判断，而需要周密地考虑。", "要在众人面前表现自己会使我不自在甚至有点怯场。", "独自在宽敞的资料室收集各种信息，是一种享受。", "我特别需要独处的时间。",
"我总是设想最坏的结果，然后陷入苦恼之中。", "我常常试探或考验朋友的忠诚。", "所有罪名中，让我最厌恶的是欺骗。", "我有时自信自己掌握了权威，有时却想依赖别人的决定。", "上司最看重我尽忠职守，朋友也觉得我忠诚可靠。", "面对威胁，我一时焦急忧虑，一时激烈反抗。",
"我很在意自己是否依然年轻有活力，常担心自由被剥夺。", "我时常发现新开张的美食店，最新的服装款式，或新兴的游乐节目。", "我觉得有很多新鲜有趣的事情，人生真是好玩又快乐。", "我总是有许多新鲜有趣的计划，时间怎么也不够用。", "我只喜欢与有趣的人为友，对一些闷蛋却懒得交往，即使他们看来很有深度。", "我很少用心去听别人的心情，只喜欢说说俏皮话和笑话。",
"我看不起那些软弱的人。", "我享受掌握权力的感觉，喜欢迎接挑战。", "对那些行为过分的人，我一定好好教训他们。", "我敢于与人正面交锋，不害怕冲突。", "我总是禁不住要支持弱小的一方。", "我说了许多别人想说又没胆量说的话。",
"面对问题，我经常想“时间总是有的，改天再说吧”。", "我对朋友或家人很少表达反对意见。", "我常常不清楚自己有什么需要。", "我不要求获得任何关注。", "我特别容易认同别人的想法和做法。", "面对别人无理的指责，我常常只是沉默不想说话。"
];
const types = ["1号 完美型","2号 助人型","3号 成就型","4号 自我型","5号 理智型","6号 忠诚型","7号 活跃型","8号 领袖型","9号 和平型"];
const descs = [
  "追求正确与秩序，原则性强、自律负责，习惯反思与改进，但容易对自己和他人过于苛刻。",
  "热情体贴、乐于付出，重视人际关系，善于察觉他人需要，却常常忽略自己的感受。",
  "目标导向、高效务实，重视成果与形象，适应力强，有时会把自我价值绑在成就上。",
  "情感细腻、追求独特与真实，富有审美与创造力，情绪起伏较大，容易感到与众不同或被误解。",
  "好奇求知、独立冷静，喜欢观察与思考，重视私人空间，倾向先想清楚再行动。",
  "谨慎负责、忠诚可靠，善于预见风险、未雨绸缪，但容易焦虑和反复怀疑。",
  "乐观开朗、热爱新鲜与自由，兴趣广泛、点子多，害怕被束缚，有时难以坚持到底。",
  "果断有力、敢于担当，直面冲突、保护弱小，掌控欲较强，不喜欢示弱。",
  "随和包容、善于调解，追求和谐与安稳，容易顺从他人、回避冲突，有时会拖延。"
];
function score(vals){ const sums=Array(9).fill(0); vals.forEach((v,i)=>sums[Math.floor(i/6)]+=v); return sums; }
function analyze(sums){
  const max=Math.max(...sums), min=Math.min(...sums);
  const tops=sums.map((s,i)=>s===max?i:-1).filter(i=>i>=0);
  const order=sums.map((s,i)=>i).sort((a,b)=>sums[b]-sums[a]||a-b);
  // 区分度不足：分数几乎持平（极差 ≤3）或 ≥3 型并列最高，说明作答没有拉开选项，不下结论
  const flat = (max-min)<=3 || tops.length>=3;
  // 整体偏低：最高分 ≤12（平均每题不超过 2 分），倾向较弱
  const weak = !flat && max<=12;
  let wing=null;
  if(!flat && tops.length===1){ const t=tops[0], l=(t+8)%9, r=(t+1)%9; if(sums[l]!==sums[r]) wing=sums[l]>sums[r]?l:r; }
  return { max, min, tops, order, wing, flat, weak };
}
function highlight(sums){
  const { max, min, tops, wing, flat, weak } = analyze(sums);
  const weakNote = weak ? `<div class="wing">整体得分偏低（最高仅 ${max} 分），倾向较弱，结果仅供参考。</div>` : '';
  const inner = flat
    ? `<div class="label">结果区分度不足</div><div class="type">暂时无法判断明显倾向</div><p class="desc">你的各型得分非常接近（最高 ${max} 分、最低 ${min} 分）。这通常是作答时选项过于集中——比如大多数题都选了同一个分数。建议按第一直觉重新作答，尽量拉开「符合」与「不符合」的题目。</p>`
    : tops.length===1
    ? `<div class="label">得分最高的类型</div><div class="type">${types[tops[0]]}</div><p class="desc">${descs[tops[0]]}</p>${wing!==null?`<div class="wing">可能的翼型：${types[wing]}（${sums[wing]} 分）</div>`:''}${weakNote}`
    : `<div class="label">得分最高的类型（并列）</div><div class="type">${tops.map(i=>types[i]).join(' / ')}</div>${tops.map(i=>`<p class="desc"><b>${types[i]}</b>：${descs[i]}</p>`).join('')}${weakNote}`;
  return `<div class="highlight${flat?' flat':''}">${inner}</div>`;
}
function renderResult(sums, c){
  const { max, order, flat } = analyze(sums);
  const rows=order.map(i=>c.bar(types[i], sums[i], 0, 30, {best: !flat && sums[i]===max, digits:0})).join('');
  return highlight(sums) + `<div class="ranking">${rows}</div>`;
}
function compact(sums, c){
  const { max, order, flat } = analyze(sums);
  const rows=order.slice(0,3).map(i=>c.bar(types[i], sums[i], 0, 30, {best: !flat && sums[i]===max, digits:0})).join('');
  return `<div class="grid2 compact-enne">${highlight(sums)}<div class="ranking">${rows}<div class="legend">其余各型见完整结果</div></div></div>`;
}
function brief(sums){
  const { max, tops, wing, flat, weak } = analyze(sums);
  if(flat) return '区分度不足，暂无法判断';
  return `主型 ${tops.map(i=>types[i]).join(' / ')}${wing!==null?` · 翼 ${types[wing].slice(0,2)}`:''}${weak?'（倾向较弱）':''}`;
}
function summaryText(sums){
  const { max, min, tops, order, wing, flat, weak } = analyze(sums);
  const lines=['九型人格测试结果','',...order.map((i,k)=>`${k+1}. ${types[i]}：${sums[i]} 分`),''];
  if(flat){ lines.push(`各型得分非常接近（最高 ${max} 分、最低 ${min} 分），无法判断明显倾向，建议拉开选项重新作答。`); return lines.join('\n'); }
  lines.push(`得分最高：${tops.map(i=>types[i]).join('、')}（${max} 分）`);
  if(wing!==null) lines.push(`可能的翼型：${types[wing]}`);
  if(weak) lines.push('整体得分偏低，倾向较弱，结果仅供参考。');
  return lines.join('\n');
}
function summaryRows(sums){ return types.map((t,i)=>[t,sums[i]]); }
return {
  id:'enneagram', title:'九型人格快速测试', storageKey:'enneagramAnswers', filePrefix:'九型人格测试结果',
  scale:[{v:1,label:'完全不符合'},{v:2,label:'较不符合'},{v:3,label:'一般'},{v:4,label:'较符合'},{v:5,label:'完全符合'}],
  items, score, renderResult, compact, brief, summaryText, summaryRows, flatWarn:false,
  aiIntro: mode => '我刚完成了一份 54 题的九型人格快速测试（每题 1～5 分：1=完全不符合，5=完全符合；每 6 题对应一个类型，第 1～6 题对应 1 号，以此类推，每型总分 6～30 分）。下面是我的' + (mode==='summary' ? '各型得分' : '逐题作答和各型得分') + '，请你作为熟悉九型人格的顾问帮我分析：',
  aiQuestions: mode => [
    '我的主型最可能是哪一型？判断依据是什么、把握有多大？如果几型得分接近，如何区分？',
    '可能的翼型是什么？主型加翼型结合起来是怎样的性格画像？',
    '这一型的核心动机、核心恐惧，以及在压力状态和安全状态下的典型表现分别是什么？',
    (mode==='summary' ? '基于得分分布，' : '结合我的具体作答，') + '指出 2～3 个可能存在的盲点或需要留意的模式。',
    '给我 3 条具体、可执行的成长建议。'
  ]
};
})();
(window.TESTS=window.TESTS||{})[window.TEST.id]=window.TEST;
