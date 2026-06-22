(function () {
  const API_URL = "/api/score";

  const params = new URLSearchParams(location.search);
  const levelId = params.get("level") || "grade-pre-1";
  const sId = params.get("s");
  const level = getLevel(levelId);
  const meta = (typeof SUMMARY_META !== "undefined" && SUMMARY_META[levelId]) || {
    words: "60〜70語",
    instructions: [],
  };
  const list = (typeof SUMMARIES !== "undefined" && SUMMARIES[levelId]) || [];
  const item = list.find((x) => x.id === sId) || list[0];

  const $ = (id) => document.getElementById(id);
  const essayEl = $("essay");
  const errorEl = $("error");
  const resultEl = $("result");
  const modelResultEl = $("model-result");

  $("level-label").textContent = `${level.label} English Summary`;
  $("back-link").href = `./questions.html?level=${levelId}`;

  if (!item) {
    $("title").textContent = "要約問題が見つかりませんでした";
    return;
  }
  $("title").textContent = item.title || "";
  $("passage").textContent = item.passage;
  $("word-target").textContent = `目安: ${meta.words}`;

  // 複数の要約本文を切り替えるチップ
  if (list.length > 1) {
    const bar = document.createElement("div");
    bar.className = "levels";
    list.forEach((s, i) => {
      const a = document.createElement("a");
      a.className = "level-chip" + (s.id === item.id ? " active" : "");
      a.href = `./summary.html?level=${levelId}&s=${encodeURIComponent(s.id)}`;
      a.textContent = `要約 ${i + 1}`;
      bar.appendChild(a);
    });
    const pb = document.querySelector(".prompt-box");
    pb.parentNode.insertBefore(bar, pb);
  }

  if (meta.instructions && meta.instructions.length) {
    $("instructions-wrap").innerHTML =
      `<ul class="instructions">${meta.instructions
        .map((l) => `<li>${l}</li>`)
        .join("")}</ul>`;
  }

  // ---- 下書き自動保存 ----
  const draftKey = `sumdraft:${levelId}:${item.id}`;
  essayEl.value = localStorage.getItem(draftKey) || "";

  function countWords(t) {
    const m = t.trim().match(/[A-Za-z0-9'\-]+/g);
    return m ? m.length : 0;
  }
  function updateCount() {
    const n = countWords(essayEl.value);
    const el = $("word-count");
    el.textContent = `${n} words`;
    el.classList.toggle("over", n > 75);
  }
  let saveTimer;
  essayEl.addEventListener("input", () => {
    updateCount();
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      localStorage.setItem(draftKey, essayEl.value);
      $("save-state").textContent = "下書きを保存しました";
      setTimeout(() => ($("save-state").textContent = ""), 1500);
    }, 500);
  });
  updateCount();

  async function callApi(payload) {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      let msg = `サーバーエラー (${res.status})`;
      try {
        const j = await res.json();
        if (j.error) msg = j.error;
      } catch (e) {}
      throw new Error(msg);
    }
    return res.json();
  }
  function showError(msg) {
    errorEl.style.display = "block";
    errorEl.innerHTML =
      `<strong>採点できませんでした。</strong><br />${msg}<br />` +
      `<span style="font-size:12px;">ローカルで開いている場合はAPIが動きません。READMEのデプロイ手順を参照してください。</span>`;
  }
  function clearError() {
    errorEl.style.display = "none";
    errorEl.textContent = "";
  }

  // ---- AI採点 ----
  $("score-btn").addEventListener("click", async () => {
    clearError();
    resultEl.innerHTML = "";
    const summary = essayEl.value.trim();
    if (countWords(summary) < 10) {
      showError("要約を入力してから採点してください。");
      return;
    }
    const btn = $("score-btn");
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner"></span> 採点中…`;
    try {
      const data = await callApi({
        mode: "summary",
        level: level.label,
        levelId: levelId,
        passage: item.passage,
        wordTarget: meta.words,
        essay: summary,
      });
      renderScore(data);
    } catch (e) {
      showError(e.message);
    } finally {
      btn.disabled = false;
      btn.textContent = "AI採点する";
    }
  });

  function renderScore(d) {
    const crit = d.criteria || [];
    const barsHtml = crit
      .map((c) => {
        const pct = c.max ? Math.round((c.score / c.max) * 100) : 0;
        return `
          <div class="score-bar">
            <div class="label"><span>${c.name}</span>
              <span>${c.score} / ${c.max}</span></div>
            <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
            ${c.comment ? `<div style="font-size:13px;color:var(--muted);margin-top:4px;">${c.comment}</div>` : ""}
          </div>`;
      })
      .join("");
    resultEl.innerHTML = `
      <div class="result">
        <div class="score-head">
          <span class="score-total">${d.total}</span>
          <span class="score-max">/ ${d.maxTotal} 点</span>
        </div>
        <div class="score-bars">${barsHtml}</div>
        ${d.summary ? `<h4>総評</h4><div class="feedback">${d.summary}</div>` : ""}
        ${
          d.improvements && d.improvements.length
            ? `<h4>改善のヒント</h4><ul style="font-size:14px;padding-left:20px;margin:4px 0;">${d.improvements
                .map((x) => `<li>${x}</li>`)
                .join("")}</ul>`
            : ""
        }
      </div>`;
    resultEl.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // ---- 模範解答 ----
  $("model-btn").addEventListener("click", async () => {
    clearError();
    // 公式解答例があればそれを表示
    if (item.officialModel) {
      renderModel(item.officialModel, true);
      return;
    }
    const cacheKey = `summodel:${levelId}:${item.id}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      renderModel(cached, false);
      return;
    }
    const btn = $("model-btn");
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner"></span> 生成中…`;
    try {
      const data = await callApi({
        mode: "summary-model",
        level: level.label,
        levelId: levelId,
        passage: item.passage,
        wordTarget: meta.words,
      });
      localStorage.setItem(cacheKey, data.model || "");
      renderModel(data.model || "", false);
    } catch (e) {
      showError(e.message);
    } finally {
      btn.disabled = false;
      btn.textContent = "模範解答を見る";
    }
  });

  function renderModel(text, isOfficial) {
    modelResultEl.innerHTML = `
      <div class="result">
        <h4 style="margin-top:0;">${isOfficial ? "公式の解答例" : "模範解答の例（AI生成）"}</h4>
        <div class="model-answer">${text}</div>
        <div style="font-size:12px;color:var(--muted);margin-top:8px;">
          ${isOfficial ? "※ 英検公式の解答例です。" : "※ AIが生成した解答例です。表現は何通りも考えられます。"}
        </div>
      </div>`;
    modelResultEl.scrollIntoView({ behavior: "smooth", block: "start" });
  }
})();
