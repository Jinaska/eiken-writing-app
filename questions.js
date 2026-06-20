(function () {
  const params = new URLSearchParams(location.search);
  let levelId = params.get("level") || "grade-pre-1";
  if (!QUESTIONS[levelId]) levelId = "grade-pre-1";

  const levelsEl = document.getElementById("levels");
  const listEl = document.getElementById("q-list");
  const titleEl = document.getElementById("page-title");

  // レベル切替チップ
  LEVELS.forEach((lv) => {
    const a = document.createElement("a");
    a.className = "level-chip" + (lv.id === levelId ? " active" : "");
    a.href = `./questions.html?level=${lv.id}`;
    a.textContent = lv.label;
    levelsEl.appendChild(a);
  });

  const level = getLevel(levelId);
  titleEl.textContent = `${level.label} ライティング予想問題`;

  // 問題カード描画
  const qs = QUESTIONS[levelId] || [];
  qs.forEach((q, i) => {
    const card = document.createElement("div");
    card.className = "q-card";

    let pointsHtml = "";
    if (q.points && q.points.length) {
      const label = level.usePoints
        ? `POINTS（この中から${level.usePoints}つ選んで使う）`
        : "POINTS（理由の参考。これ以外でもOK）";
      pointsHtml =
        `<div class="q-points-label">${label}</div>` +
        `<div class="q-points">${q.points
          .map((p) => `<span>${p}</span>`)
          .join("")}</div>`;
    }

    card.innerHTML = `
      <div class="q-num">Question ${i + 1}</div>
      <div class="q-topic">${q.topic}</div>
      ${pointsHtml}
      <div class="q-actions">
        <a class="btn btn-primary"
           href="./review.html?level=${levelId}&q=${encodeURIComponent(q.id)}">
          この問題で採点
        </a>
      </div>
    `;
    listEl.appendChild(card);
  });

  if (!qs.length) {
    listEl.innerHTML = `<p class="lead">このレベルの問題は準備中です。</p>`;
  }
})();
