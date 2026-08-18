/* 亲密关系经历量表 ECR 中文版（李同归、加藤和生，2006，心理学报）。
   题号与 Brennan 等原量表一致：单数题 = 依恋回避，双数题 = 依恋焦虑；R = 反向计分（8 - x）。 */
window.TEST = (function(){
const items = [
"总的来说，我不喜欢让恋人知道自己内心深处的感觉。",
"我担心我会被抛弃。",
"我觉得跟恋人亲近是一件惬意的事情。",
"我很担心我的恋爱关系。",
"当恋人开始要跟我亲近时，我发现我自己在退缩。",
"我担心恋人不会像我关心他/她那样地关心我。",
"当恋人希望跟我非常亲近时，我会觉得不自在。",
"我有点担心会失去恋人。",
"我觉得对恋人开诚布公，不是一件很舒服的事情。",
"我常常希望恋人对我的感情和我对恋人的感情一样强烈。",
"我想与恋人亲近，但我又总是会退缩不前。",
"我常常想与恋人形影不离，但有时这样会把恋人吓跑。",
"当恋人跟我过分亲密的时候，我会感到内心紧张。",
"我担心一个人独处。",
"我愿意把我内心的想法和感觉告诉恋人，我觉得这是一件自在的事情。",
"我想跟恋人非常亲密的愿望，有时会把恋人吓跑。",
"我试图避免与恋人变得太亲近。",
"我需要我的恋人一再地保证他/她是爱我的。",
"我觉得我比较容易与恋人亲近。",
"我觉得自己在要求恋人把更多的感觉，以及对恋爱关系的投入程度表现出来。",
"我发现让我依赖恋人，是一件困难的事情。",
"我并不是常常担心被恋人抛弃。",
"我倾向于不跟恋人过分亲密。",
"如果我无法得到恋人的注意和关心，我会心烦意乱或者生气。",
"我跟恋人什么事情都讲。",
"我发现恋人并不愿意像我所想的那样跟我亲近。",
"我经常与恋人讨论我所遇到的问题以及我关心的事情。",
"如果我还没有恋人的话，我会感到有点焦虑和不安。",
"我觉得依赖恋人是很自在的事情。",
"如果恋人不能像我所希望的那样在我身边时，我会感到灰心丧气。",
"我并不在意从恋人那里寻找安慰、听取劝告、得到帮助。",
"如果在我需要的时候，恋人却不在我身边，我会感到沮丧。",
"在需要的时候，我向恋人求助，是很有用的。",
"当恋人不赞同我时，我觉得确实是我不好。",
"我会在很多事情上向恋人求助，包括寻求安慰和得到承诺。",
"当恋人不花时间和我在一起时，我会感到怨恨。"
];
const R = new Set([3,15,19,25,27,29,31,33,35,22]);
const mean = a => a.reduce((s,x)=>s+x,0)/a.length;
const val = (vals,n) => R.has(n) ? 8-vals[n-1] : vals[n-1];
const styles = {
  secure:   { name:'安全型',           en:'Secure',      desc:'在亲密关系中比较放松：既能自在地亲近和依赖对方，也不太担心被抛弃。遇到矛盾时更倾向直接沟通。' },
  preoccupied:{ name:'痴迷型（倾注型）', en:'Preoccupied', desc:'渴望亲密、也愿意亲近，但对关系缺乏安全感：容易担心对方不够在乎自己、需要反复确认，情绪比较容易被关系牵动。' },
  dismissing: { name:'疏离型（轻视型）', en:'Dismissing',  desc:'不太担心被抛弃，但对亲密和依赖有些不自在：更看重独立，习惯自己消化情绪，对方靠得太近时会想退开。' },
  fearful:  { name:'恐惧型',           en:'Fearful',     desc:'既渴望亲密又害怕受伤：担心被抛弃，同时又难以真正信任和依赖对方，容易在靠近与退缩之间摇摆。' }
};
function score(vals){
  const avoidIds=[], anxIds=[]; for(let n=1;n<=36;n++) (n%2?avoidIds:anxIds).push(n);
  const avoid=mean(avoidIds.map(n=>val(vals,n))), anx=mean(anxIds.map(n=>val(vals,n)));
  const hiAv=avoid>4, hiAn=anx>4;
  const key = !hiAv&&!hiAn?'secure': hiAn&&!hiAv?'preoccupied': hiAv&&!hiAn?'dismissing':'fearful';
  const nearAv=Math.abs(avoid-4)<0.5, nearAn=Math.abs(anx-4)<0.5;
  return { avoid, anx, style:{key,...styles[key]}, nearAv, nearAn };
}
function quad(S){
  const W=300,H=300,P=34; const x=P+(S.avoid-1)/6*(W-2*P), y=H-P-(S.anx-1)/6*(H-2*P); const mx=P+(W-2*P)/2, my=H-P-(H-2*P)/2;
  return `<svg class="quad" viewBox="0 0 ${W} ${H}" role="img" aria-label="依恋二维图：横轴回避 ${S.avoid.toFixed(2)}，纵轴焦虑 ${S.anx.toFixed(2)}">
<rect class="q1" x="${P}" y="${my}" width="${mx-P}" height="${H-P-my}"/><rect class="q2" x="${P}" y="${P}" width="${mx-P}" height="${my-P}"/>
<rect class="q3" x="${mx}" y="${my}" width="${W-P-mx}" height="${H-P-my}"/><rect class="q4" x="${mx}" y="${P}" width="${W-P-mx}" height="${my-P}"/>
<rect class="box" x="${P}" y="${P}" width="${W-2*P}" height="${H-2*P}" fill="none"/>
<line class="grid" x1="${mx}" y1="${P}" x2="${mx}" y2="${H-P}"/><line class="grid" x1="${P}" y1="${my}" x2="${W-P}" y2="${my}"/>
<text class="lbl" x="${(P+mx)/2}" y="${H-P-8}" text-anchor="middle">安全型</text><text class="lbl" x="${(P+mx)/2}" y="${P+16}" text-anchor="middle">痴迷型</text>
<text class="lbl" x="${(mx+W-P)/2}" y="${H-P-8}" text-anchor="middle">疏离型</text><text class="lbl" x="${(mx+W-P)/2}" y="${P+16}" text-anchor="middle">恐惧型</text>
<text x="${W/2}" y="${H-8}" text-anchor="middle">依恋回避 →（1 … 7）</text>
<text transform="translate(12 ${H/2}) rotate(-90)" text-anchor="middle">依恋焦虑 →（1 … 7）</text>
<circle class="dot" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="7"/></svg>`;
}
function renderResult(S, c){
  const near = (S.nearAv||S.nearAn) ? `<div class="wing">你的${[S.nearAv?'回避':'',S.nearAn?'焦虑':''].filter(Boolean).join('和')}分数很接近中点（4 分），类型归属并不明显，更适合看成介于相邻类型之间。</div>` : '';
  const lvA=c.level(S.avoid,3.5,4.5), lvN=c.level(S.anx,3.5,4.5);
  return `<div class="highlight"><div class="label">依恋类型倾向（按中点粗略归类）</div><div class="type">${S.style.name}</div><p class="desc">${S.style.desc}</p>${near}</div>
<div class="dims">
<div class="dim">${c.bar('依恋回避',S.avoid,1,7,{tag:c.tag(lvA)})}<p class="desc">对亲密和依赖的不适程度。分数越高，越倾向保持距离、不愿依赖或袒露；越低越能自在地亲近。</p></div>
<div class="dim">${c.bar('依恋焦虑',S.anx,1,7,{tag:c.tag(lvN)})}<p class="desc">对被抛弃、不被爱的担忧程度。分数越高，越容易担心关系、需要确认；越低越有安全感。</p></div>
</div>${quad(S)}<p class="legend">两个维度各 18 题取均分（1～7）。四种类型按 4 分为界划分：低回避低焦虑 = 安全型，低回避高焦虑 = 痴迷型，高回避低焦虑 = 疏离型，高回避高焦虑 = 恐惧型。</p>`;
}
function summaryText(S){
  return ['成人依恋 ECR 测试结果（1～7 分）','',`依恋回避（Avoidance）：${S.avoid.toFixed(2)}`,`依恋焦虑（Anxiety）：${S.anx.toFixed(2)}`,'',`类型倾向：${S.style.name}（${S.style.en}）${(S.nearAv||S.nearAn)?'——但分数接近中点，类型归属不明显':''}`,'','说明：反向题已换算；两个维度各 18 题取均分；类型以 4 分为界粗略划分，非常模比较。'].join('\n');
}
function summaryRows(S){ return [['依恋回避',+S.avoid.toFixed(2)],['依恋焦虑',+S.anx.toFixed(2)],['类型倾向',S.style.name]]; }
function brief(S){ return `回避 ${S.avoid.toFixed(1)} · 焦虑 ${S.anx.toFixed(1)} · ${S.style.name.replace(/（.*）/,'')}${(S.nearAv||S.nearAn)?'（不明显）':''}`; }
function compact(S, c){
  const lvA=c.level(S.avoid,3.5,4.5), lvN=c.level(S.anx,3.5,4.5);
  const near=(S.nearAv||S.nearAn)?'<div class="wing">分数接近中点，类型归属不明显</div>':'';
  return `<div class="grid2 ecr-compact"><div><div class="highlight"><div class="label">依恋类型倾向</div><div class="type">${S.style.name}</div>${near}</div><div class="ranking">${c.bar('依恋回避',S.avoid,1,7,{tag:c.tag(lvA)})}${c.bar('依恋焦虑',S.anx,1,7,{tag:c.tag(lvN)})}</div></div>${quad(S)}</div>`;
}
return {
  id:'ecr', title:'成人依恋测试（ECR）', storageKey:'ecrAnswers', filePrefix:'成人依恋ECR结果',
  scale:[{v:1,label:'非常不同意'},{v:2,label:'不同意'},{v:3,label:'有点不同意'},{v:4,label:'中立'},{v:5,label:'有点同意'},{v:6,label:'同意'},{v:7,label:'非常同意'}],
  items, score, renderResult, compact, brief, summaryText, summaryRows,
  aiIntro: mode => `我刚完成了亲密关系经历量表 ECR 中文版（36 题，每题 1～7 分：1=非常不同意，7=非常同意；单数题测依恋回避，双数题测依恋焦虑，反向题已换算，各取均分）。下面是我的${mode==='summary'?'两个维度得分和类型倾向':'逐题作答、两个维度得分和类型倾向'}，请你作为熟悉成人依恋理论的心理咨询顾问帮我分析：`,
  aiQuestions: mode => [
    '解读我在依恋回避和依恋焦虑两个维度上的位置，以及对应的依恋风格倾向；如果分数接近中点，请说明这意味着什么。',
    '这种依恋模式在亲密关系中通常会怎样表现：亲近、冲突、分离、需要支持时分别可能出现什么反应？',
    (mode==='summary'?'基于得分，':'结合我具体的作答（哪些题分高、哪些题分低），')+'指出 2～3 个值得留意的模式或矛盾之处。',
    '这种依恋模式可能的形成原因有哪些？它和我在其他关系（朋友、家人）中的表现可能有什么关联？',
    '给我 3 条具体、可执行的建议，帮助我在关系中更有安全感、沟通得更好。'
  ]
};
})();
(window.TESTS=window.TESTS||{})[window.TEST.id]=window.TEST;
