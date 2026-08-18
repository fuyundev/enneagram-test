/* Schwartz 价值观问卷 PVQ-21（ESS 版）中文版。原文为「他」版（Male Form），此处改为「TA」。
   计分：量表 1=非常像我 … 6=完全不像我，先翻转成「越高越像我」(7-x)；每种价值取均分；再减去 21 题总均分（MRAT 中心化）得到相对重要性。 */
window.TEST = (function(){
const items = [
"想出新点子、发挥创意对TA来说很重要。TA喜欢以与众不同的方式做事。",
"富裕对TA来说很重要，TA希望自己有很多很多的钱并拥有许多昂贵的东西。",
"TA认为普天下人人平等很重要。TA相信生活中每个人都应当享有平等的机会。",
"对TA来说，发挥自己的才能很重要。TA希望以此得到人们的欣赏。",
"安全的生活环境对TA来说很重要。TA避免任何会危及自身安全的事情。",
"TA喜欢惊喜，总是寻求新鲜事物。TA认为丰富多彩的人生经历很重要。",
"TA认为人们应该懂得服从命令。在TA看来，任何情况下大家都要遵守规则，即使身边没人注意。",
"聆听不同的意见对TA来说很重要。即使TA和别人意见不合，TA仍然希望能够理解别人。",
"恭敬和谦虚对TA来说很重要。TA尽量避免引起别人的注意。",
"享受生活的乐趣对TA来说很重要。TA喜欢让自己尽情享乐。",
"自己的事自己做主对TA来说很重要。TA喜欢自由地筹划和安排，不依靠他人。",
"帮助身边的人对TA来说很重要。TA希望关心他们，使他们生活幸福。",
"成功对TA来说很重要。TA希望别人认可TA的成就。",
"国家能给TA完全的安全保障对TA来说非常重要。TA希望有一个能保护人民的强大国家。",
"TA总是寻找参与冒险的机会，希望过刺激有趣的生活。",
"举止得体对TA来说很重要。TA不希望做出任何会引起别人非议的事情。",
"别人对TA的尊重对TA来说很重要。TA希望别人按TA的主意办事。",
"保持对朋友忠心耿耿对TA来说很重要。TA希望为亲友付出一切。",
"TA坚信人们应该关爱大自然。爱护生态环境对TA来说很重要。",
"传统对TA很重要。TA尝试按照宗教或家庭传统风俗习惯为人处世。",
"TA把握每一个开心的机会。做能给自己带来乐趣的事对TA来说很重要。"
];
// 10 种基本价值（按 Schwartz 环形顺序排列）及对应题号
const values = [
  { key:'SD', name:'自主',   en:'Self-Direction', ids:[1,11],   desc:'独立思考与行动，选择、创造、探索。' },
  { key:'ST', name:'刺激',   en:'Stimulation',    ids:[6,15],   desc:'兴奋、新奇、挑战，生活要有变化。' },
  { key:'HE', name:'享乐',   en:'Hedonism',       ids:[10,21],  desc:'快乐、感官满足、享受生活。' },
  { key:'AC', name:'成就',   en:'Achievement',    ids:[4,13],   desc:'按社会标准展示能力、取得成功、被认可。' },
  { key:'PO', name:'权力',   en:'Power',          ids:[2,17],   desc:'社会地位与声望，支配资源与他人，财富。' },
  { key:'SE', name:'安全',   en:'Security',       ids:[5,14],   desc:'个人与社会的安全、和谐、稳定。' },
  { key:'CO', name:'遵从',   en:'Conformity',     ids:[7,16],   desc:'克制可能冒犯他人或违反规范的行为与冲动。' },
  { key:'TR', name:'传统',   en:'Tradition',      ids:[9,20],   desc:'尊重、接受并遵循文化或宗教传统，谦逊。' },
  { key:'BE', name:'仁慈',   en:'Benevolence',    ids:[12,18],  desc:'维护并增进身边人的福祉，忠诚、乐于助人。' },
  { key:'UN', name:'普世',   en:'Universalism',   ids:[3,8,19], desc:'理解、包容、保护所有人和自然的福祉，公平。' }
];
// 4 个高阶维度（享乐按 ESS 惯例归入「开放变化」）
const higher = [
  { name:'开放变化', en:'Openness to Change', keys:['SD','ST','HE'], desc:'追求独立与新奇' },
  { name:'自我提升', en:'Self-Enhancement',   keys:['AC','PO'],      desc:'追求个人成功与地位' },
  { name:'保守',     en:'Conservation',       keys:['SE','CO','TR'], desc:'追求秩序、稳定与延续' },
  { name:'自我超越', en:'Self-Transcendence', keys:['BE','UN'],      desc:'关注他人与世界的福祉' }
];
const mean = a => a.reduce((s,x)=>s+x,0)/a.length;
function score(vals){
  const r = vals.map(v=>7-v);           // 翻转：6 = 非常像我
  const mrat = mean(r);
  const vs = values.map(v=>{ const raw=mean(v.ids.map(n=>r[n-1])); return { ...v, raw, centered: raw-mrat }; });
  const hs = higher.map(h=>{ const sub=vs.filter(v=>h.keys.includes(v.key)); return { ...h, raw:mean(sub.map(v=>v.raw)), centered:mean(sub.map(v=>v.centered)) }; });
  return { mrat, values:vs, higher:hs };
}
function renderResult(S, c){
  const sorted=[...S.values].sort((a,b)=>b.centered-a.centered);
  const top=sorted.slice(0,3), bottom=sorted.slice(-3).reverse();
  const hi=`<div class="highlight"><div class="label">对你最重要的价值（相对于你的整体均值）</div><div class="type">${top.map(v=>v.name).join(' · ')}</div><p class="desc">${top.map(v=>`<b>${v.name}</b>：${v.desc}`).join('　')}</p><div class="wing">相对最不看重：${bottom.map(v=>`${v.name}（${(v.centered>=0?'+':'')+v.centered.toFixed(2)}）`).join('、')}</div></div>`;
  const rows=sorted.map(v=>c.diverging(v.name, v.centered, 2.5)).join('');
  const hrows=[...S.higher].sort((a,b)=>b.centered-a.centered).map(h=>c.diverging(h.name, h.centered, 2.5)).join('');
  return hi
    + `<h3 style="margin:18px 0 6px;font-size:16px">10 种基本价值 · 相对重要性</h3><div class="ranking">${rows}</div><p class="legend">条形以 0（你 21 题的总均分 ${S.mrat.toFixed(2)}）为中心：向右为高于你的平均、向左为低于。原始均分见汇总文本。</p>`
    + `<h3 style="margin:18px 0 6px;font-size:16px">4 个高阶维度</h3><div class="ranking">${hrows}</div><p class="legend">开放变化 = 自主 + 刺激 + 享乐；自我提升 = 成就 + 权力；保守 = 安全 + 遵从 + 传统；自我超越 = 仁慈 + 普世。这四个维度两两相对（开放变化 vs 保守，自我提升 vs 自我超越）。</p>`;
}
function summaryText(S){
  const sorted=[...S.values].sort((a,b)=>b.centered-a.centered);
  const lines=['个人价值观 PVQ-21 测试结果','',`总均分（MRAT）：${S.mrat.toFixed(2)}（1～6，越高表示整体越倾向选「像我」）`,'','10 种基本价值（按相对重要性排序；相对重要性 = 该价值均分 − 总均分）：'];
  sorted.forEach((v,i)=>lines.push(`${i+1}. ${v.name}（${v.en}）：相对 ${(v.centered>=0?'+':'')+v.centered.toFixed(2)}，原始均分 ${v.raw.toFixed(2)}`));
  lines.push('','4 个高阶维度：');
  [...S.higher].sort((a,b)=>b.centered-a.centered).forEach(h=>lines.push(`- ${h.name}（${h.en}）：相对 ${(h.centered>=0?'+':'')+h.centered.toFixed(2)}，原始均分 ${h.raw.toFixed(2)}`));
  lines.push('','说明：量表已翻转为「越高越像我」；正值表示该价值对我比自己的平均水平更重要，负值表示相对不那么重要。');
  return lines.join('\n');
}
function summaryRows(S){ return [...S.values.map(v=>[v.name,+v.centered.toFixed(2)]), ...S.higher.map(h=>[`高阶-${h.name}`,+h.centered.toFixed(2)]), ['总均分MRAT',+S.mrat.toFixed(2)]]; }
function brief(S){ const top=[...S.values].sort((a,b)=>b.centered-a.centered).slice(0,3); return '最看重 '+top.map(v=>v.name).join(' · '); }
function compact(S, c){
  const sorted=[...S.values].sort((a,b)=>b.centered-a.centered); const top=sorted.slice(0,3), bottom=sorted.slice(-3).reverse();
  const hi=`<div class="highlight"><div class="label">对你最重要的价值</div><div class="type">${top.map(v=>v.name).join(' · ')}</div><div class="wing">相对最不看重：${bottom.map(v=>v.name).join('、')}</div></div>`;
  const hrows=[...S.higher].sort((a,b)=>b.centered-a.centered).map(h=>c.diverging(h.name, h.centered, 2.5)).join('');
  return `<div class="grid2">${hi}<div class="ranking">${hrows}<div class="legend">4 个高阶维度，相对你自己的均值</div></div></div>`;
}
return {
  id:'pvq21', title:'个人价值观测试（PVQ-21）', storageKey:'pvq21Answers', filePrefix:'价值观PVQ21结果',
  scale:[{v:1,label:'非常像我'},{v:2,label:'像我'},{v:3,label:'有点像我'},{v:4,label:'不大像我'},{v:5,label:'不像我'},{v:6,label:'完全不像我'}],
  items, score, renderResult, compact, brief, summaryText, summaryRows,
  aiIntro: mode => `我刚完成了 Schwartz 价值观问卷 PVQ-21 中文版（21 题，每题描述一个人，我选择这个人和我有多像：1=非常像我 … 6=完全不像我；计分时已翻转为越高越像我，并做了 MRAT 中心化，即每种价值的均分减去我 21 题的总均分，得到「相对重要性」）。下面是我的${mode==='summary'?'10 种基本价值和 4 个高阶维度的得分':'逐题作答和各价值得分'}，请你作为熟悉 Schwartz 价值观理论的顾问帮我分析：`,
  aiQuestions:[
    '我的价值观结构大概是什么样：最看重和最不看重的分别是什么？在「开放变化 vs 保守」「自我提升 vs 自我超越」两条轴上我偏向哪边？',
    '这些价值优先级组合在一起，可能反映出怎样的动机、行为倾向和决策风格？',
    '有没有内部张力（例如同时高度看重两种相对的价值）？这在现实中可能怎样表现？',
    '这样的价值观在工作选择、人际关系、生活方式上有什么含义？什么样的环境会让我更如鱼得水，什么样的环境会让我不舒服？',
    '给我 3 条具体、可执行的建议，帮助我更一致地按自己的价值观生活。'
  ]
};
})();
(window.TESTS=window.TESTS||{})[window.TEST.id]=window.TEST;
