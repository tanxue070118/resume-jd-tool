const resumeInput = document.querySelector("#resume-text");
const jdInput = document.querySelector("#jd-text");
const form = document.querySelector("#match-form");
const scoreEl = document.querySelector("#score");
const scoreLabel = document.querySelector("#score-label");
const scoreMeter = document.querySelector("#score-meter");
const matchedTags = document.querySelector("#matched-tags");
const missingTags = document.querySelector("#missing-tags");
const adviceList = document.querySelector("#advice-list");
const loadSampleButton = document.querySelector("#load-sample");
const clearButton = document.querySelector("#clear-form");

const stopwords = new Set([
  "我们",
  "你们",
  "他们",
  "以及",
  "或者",
  "进行",
  "负责",
  "相关",
  "以上",
  "以下",
  "具有",
  "能够",
  "熟悉",
  "优先",
  "岗位",
  "职责",
  "要求",
  "工作",
  "公司",
  "团队",
  "the",
  "and",
  "for",
  "with",
  "you",
  "are",
  "our",
  "will",
  "can",
  "from",
  "this",
  "that",
]);

const skillTerms = [
  "用户运营",
  "内容运营",
  "社群运营",
  "数据分析",
  "活动策划",
  "项目管理",
  "产品运营",
  "新媒体",
  "增长",
  "转化",
  "留存",
  "复盘",
  "调研",
  "竞品",
  "Excel",
  "SQL",
  "Python",
  "PPT",
  "A/B",
  "CRM",
  "SOP",
  "私域",
  "投放",
  "剪辑",
  "文案",
  "沟通",
  "协作",
];

const sampleResume = `教育背景
某大学 市场营销 本科

社团宣传部成员
参与社团活动宣传与内容分发，负责活动推文撰写、海报文案整理和社群通知，支持 5 场校园活动完成招募与现场执行。
负责活动前社群答疑和现场签到协调，沉淀常见问题话术，减少重复沟通成本。

校园二手交易活动
协助完成活动规则说明、报名信息整理和现场动线协调。
将报名同学信息按品类进行整理，方便现场摊位安排和物品展示。
活动结束后整理用户反馈，汇总交易流程、宣传节奏和现场管理中可优化的问题。

技能
Excel 数据整理，公众号推文，活动文案，社群通知，用户沟通，PPT 汇报。`;

const sampleJd = `岗位：用户运营实习生

岗位职责：
1. 负责社群日常运营，完成活动通知、用户答疑和内容分发。
2. 协助策划线上活动，跟进报名、转化和用户反馈。
3. 整理活动数据，进行基础复盘，输出优化建议。

任职要求：
1. 有社群运营、内容运营或校园活动经验优先。
2. 熟悉 Excel、PPT，具备良好的沟通和文案能力。
3. 对用户增长、活动转化和数据分析感兴趣。`;

function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^\u4e00-\u9fa5a-z0-9+#/.\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractWords(text) {
  const normalized = normalize(text);
  const latinWords = normalized.match(/[a-z][a-z0-9+#/.]{1,}/g) || [];
  const chineseWords = normalized.match(/[\u4e00-\u9fa5]{2,}/g) || [];
  const terms = skillTerms.filter((term) =>
    normalized.includes(term.toLowerCase())
  );
  return [...latinWords, ...chineseWords, ...terms]
    .map((word) => word.trim())
    .filter((word) => word.length >= 2 && !stopwords.has(word))
    .filter((word, index, arr) => arr.indexOf(word) === index);
}

function rankKeywords(jdText) {
  const words = extractWords(jdText);
  const normalized = normalize(jdText);
  return words
    .map((word) => {
      const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const count = (normalized.match(new RegExp(escaped, "g")) || []).length;
      const skillBoost = skillTerms.some(
        (term) => term.toLowerCase() === word.toLowerCase()
      )
        ? 2
        : 0;
      return { word, score: count + skillBoost };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 18)
    .map((item) => item.word);
}

function hasAny(text, terms) {
  const normalized = normalize(text);
  return terms.some((term) => normalized.includes(term.toLowerCase()));
}

function buildAdvice(resumeText, jdText, missing, score) {
  const advice = [];
  const resume = normalize(resumeText);

  if (score < 50) {
    advice.push("当前匹配偏低，先把目标岗位最重要的 5 个关键词写进真实经历。");
  } else if (score < 75) {
    advice.push("已有一定匹配度，建议把缺失关键词补进项目经历和技能模块。");
  } else {
    advice.push("匹配度不错，下一步重点是把结果、规模和面试故事准备清楚。");
  }

  if (!/[0-9]/.test(resume)) {
    advice.push("简历里缺少数字。可以补充人数、频次、周期、规模或结果变化。");
  }

  if (!hasAny(resume, ["提升", "增长", "降低", "完成", "支持", "转化", "复盘"])) {
    advice.push("经历表达偏任务清单，建议加入动作后的结果或沉淀。");
  }

  if (hasAny(jdText, ["数据", "分析", "复盘"]) && !hasAny(resume, ["数据", "分析", "复盘", "Excel", "SQL"])) {
    advice.push("JD 强调数据能力，简历中要补充数据整理、复盘或工具使用场景。");
  }

  if (hasAny(jdText, ["沟通", "协作", "跨部门"]) && !hasAny(resume, ["沟通", "协作", "对接", "协调"])) {
    advice.push("JD 强调协作沟通，建议补一段对接用户、同学、老师或业务方的经历。");
  }

  if (missing.length > 0) {
    advice.push(`优先补充这些词对应的真实经历：${missing.slice(0, 5).join("、")}。`);
  }

  return advice.slice(0, 6);
}

function renderTags(container, tags, fallback) {
  container.innerHTML = "";
  const visible = tags.slice(0, 12);
  if (visible.length === 0) {
    const empty = document.createElement("span");
    empty.textContent = fallback;
    container.appendChild(empty);
    return;
  }
  visible.forEach((tag) => {
    const chip = document.createElement("span");
    chip.textContent = tag;
    container.appendChild(chip);
  });
}

function renderAdvice(items) {
  adviceList.innerHTML = "";
  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    adviceList.appendChild(li);
  });
}

function labelForScore(score) {
  if (score >= 80) return "较强匹配";
  if (score >= 65) return "可以优化";
  if (score >= 45) return "需要补强";
  return "差距较大";
}

function analyze() {
  const resumeText = resumeInput.value.trim();
  const jdText = jdInput.value.trim();

  if (!resumeText || !jdText) {
    scoreEl.textContent = "0";
    scoreLabel.textContent = "等待分析";
    scoreMeter.style.width = "0%";
    renderTags(matchedTags, [], "等待输入");
    renderTags(missingTags, [], "等待输入");
    renderAdvice(["请同时粘贴简历和岗位 JD，再生成报告。"]);
    return;
  }

  const keywords = rankKeywords(jdText);
  const resumeNormalized = normalize(resumeText);
  const matched = keywords.filter((word) =>
    resumeNormalized.includes(word.toLowerCase())
  );
  const missing = keywords.filter((word) => !matched.includes(word));
  const coverage = keywords.length === 0 ? 0 : matched.length / keywords.length;

  const structurePoints = [
    /项目|经历|实习|工作|社团|活动/.test(resumeText),
    /技能|工具|能力|证书/.test(resumeText),
    /[0-9]/.test(resumeText),
    /提升|增长|降低|完成|支持|转化|复盘|沉淀/.test(resumeText),
  ].filter(Boolean).length;

  const score = Math.min(
    98,
    Math.round(coverage * 72 + structurePoints * 7 + Math.min(resumeText.length / 260, 8))
  );

  scoreEl.textContent = String(score);
  scoreLabel.textContent = labelForScore(score);
  scoreMeter.style.width = `${score}%`;
  renderTags(matchedTags, matched, "暂无覆盖关键词");
  renderTags(missingTags, missing, "暂无明显缺失");
  renderAdvice(buildAdvice(resumeText, jdText, missing, score));
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  analyze();
});

loadSampleButton.addEventListener("click", () => {
  resumeInput.value = sampleResume;
  jdInput.value = sampleJd;
  analyze();
});

clearButton.addEventListener("click", () => {
  resumeInput.value = "";
  jdInput.value = "";
  analyze();
});
