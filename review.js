(function () {
  // ---- API エンドポイント -------------------------------------------------
  // Vercel等にデプロイすると /api/score が使えます。
  // 別ドメインのAPIを使う場合はここを書き換えてください。
  const API_URL = "/api/score";

  // ---- パラメータから問題を特定 ------------------------------------------
  const params = new URLSearchParams(location.search);
  const levelId = params.get("level") || "grade-pre-1";
  const qId = params.get("q");
  const level = getLevel(levelId);
  const qList = QUESTIONS[levelId] || [];
  const q = qList.find((x) => x.id === qId) || qList[0];

  // ---- DOM ----------------------------------------------------------------
  const $ = (id) => document.getElementById(id);
  const essayEl = $("essay");
  const errorEl = $("error");
  const resultEl = $("result");
  const modelResultEl = $("model-result");

  // ---- 問題表示 -----------------------------------------------------------
  $("level-label").textContent = `${level.label} Writing`;
  $("topic").textContent = q ? q.topic : "問題が見つかりませんでした";
  $("word-target").textContent = `目安: ${level.words}`;
  $("back-link").href = `./questions.html?level=${levelId}`;

  if (q && q.points && q.points.length) {
    $("points-wrap").innerHTML =
      `<div class="q-points-label" style="margin-top:8px;">POINTS</div>` +
      `<div class="q-points">${q.points
        .map((p) => `<span>${p}</span>`)
        .join("")}</div>`;
  }

  // ---- 下書き自動保存（localStorage） -------------------------------------
  const draftKey = `draft:${levelId}:${q ? q.id : "x"}`;
  essayEl.value = localStorage.getItem(draftKey) || "";

  function countWords(t) {
    const m = t.trim().match(/[A-Za-z0-9'\-]+/g);
    return m ? m.length : 0;
  }
  function updateCount() {
    const n = countWords(essayEl.value);
    const el = $("word-count");
    el.textContent = `${n} words`;
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

  // ---- 共通: APIを呼ぶ ----------------------------------------------------
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

  // ---- AI採点 -------------------------------------------------------------
  $("score-btn").addEventListener("click", async () => {
    clearError();
    resultEl.innerHTML = "";
    const essay = essayEl.value.trim();
    if (countWords(essay) < 5) {
      showError("英作文を入力してから採点してください。");
      return;
    }
    const btn = $("score-btn");
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner"></span> 採点中…`;
    try {
      const data = await callApi({
        mode: "score",
        level: level.label,
        levelId: levelId,
        topic: q.topic,
        points: q.points || [],
        wordTarget: level.words,
        essay: essay,
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
        ${d.corrected ? `<h4>添削後の例</h4><div class="model-answer">${d.corrected}</div>` : ""}
      </div>`;
    resultEl.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // ---- 模範解答 -----------------------------------------------------------
  $("model-btn").addEventListener("click", async () => {
    clearError();
    const cacheKey = `model:${levelId}:${q.id}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      renderModel(cached);
      return;
    }
    const btn = $("model-btn");
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner"></span> 生成中…`;
    try {
      const data = await callApi({
        mode: "model",
        level: level.label,
        levelId: levelId,
        topic: q.topic,
        points: q.points || [],
        wordTarget: level.words,
      });
      localStorage.setItem(cacheKey, data.model || "");
      renderModel(data.model || "");
    } catch (e) {
      showError(e.message);
    } finally {
      btn.disabled = false;
      btn.textContent = "模範解答を見る";
    }
  });

  function renderModel(text) {
    modelResultEl.innerHTML = `
      <div class="result">
        <h4 style="margin-top:0;">模範解答の例</h4>
        <div class="model-answer">${text}</div>
        <div style="font-size:12px;color:var(--muted);margin-top:8px;">
          ※ AIが生成した解答例です。表現は何通りも考えられます。
        </div>
      </div>`;
    modelResultEl.scrollIntoView({ behavior: "smooth", block: "start" });
  }
})();
