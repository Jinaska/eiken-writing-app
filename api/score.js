// ============================================================
//  /api/score  — AI採点 & 模範解答生成 (Vercel Serverless Function)
//  APIキーは環境変数 ANTHROPIC_API_KEY に設定してください。
//  （OpenAIを使いたい場合は下部のコメントを参照）
// ============================================================

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-6";

module.exports = async function handler(req, res) {
  // --- CORS（同一ドメインなら不要だが念のため） ---
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "POSTのみ対応しています。" });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error:
        "APIキーが設定されていません。環境変数 ANTHROPIC_API_KEY を設定してください。",
    });
  }

  // --- body の取得（Vercelは自動パースするが念のため） ---
  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }
  body = body || {};

  const {
    mode, level, topic, points = [], wordTarget, essay,
    usePoints = 0, reasons = 0, instructions = [],
  } = body;
  if (!topic) return res.status(400).json({ error: "topicがありません。" });

  const pointsText = points.length ? points.join(", ") : "（指定なし）";
  const instrText = instructions.length
    ? instructions.map((s) => "- " + s).join("\n")
    : "（指定なし）";

  // POINTSの使い方ルール（公式形式に準拠）
  let pointsRule;
  if (usePoints) {
    // 準1級など: POINTSから指定数を選んで使う
    pointsRule =
      `この問題は、上のPOINTS（${points.length}個）の中から${usePoints}つを「選んで使う」形式です（準1級など）。` +
      `${usePoints}つを適切に使って論を展開していれば内容点は満点を与えてよく、` +
      `残りのPOINTSに触れていなくても減点しないでください。` +
      `選んだPOINTSが${usePoints}つに満たない場合のみ内容点を下げてください。`;
  } else if (points.length) {
    // 2級など: POINTSは参考。使わなくてよい
    pointsRule =
      `この問題は「自分の意見＋理由を${reasons || 2}つ」書く形式です（2級など）。` +
      `POINTSはあくまで理由を考えるための参考であり、POINTS以外の観点から理由を書いても全く問題ありません。` +
      `POINTSを使ったか・いくつ使ったかでは絶対に減点しないでください。` +
      `理由が${reasons || 2}つ明確に述べられ、意見が一貫しているかで内容点を判断してください。`;
  } else {
    // 1級など: POINTSの提示なし。理由を自分で挙げる
    pointsRule =
      `この問題はPOINTSの提示がなく、自分の意見に対して理由を${reasons || 3}つ挙げて論じる形式です（1級など）。` +
      `理由が${reasons || 3}つ明確で説得力があるか、導入・本論・結論の構成が整っているかで内容点を判断してください。`;
  }

  // お題ずれの扱い（公式の減点ルール）
  const offTopicRule =
    `重要: 解答がTOPIC（QUESTION）の問いの答えになっていない、` +
    `またはお題から大きく外れていると判断される場合は、内容点を0点とし、総合点も最低レベルにしてください。`;

  let systemPrompt, userPrompt;

  if (mode === "model") {
    // ---------- 模範解答生成 ----------
    systemPrompt =
      "あなたは英検ライティング指導の専門家です。与えられたお題に対し、" +
      "そのレベルの満点に値する模範解答を英語で書いてください。" +
      "指示（instructions）に厳密に従い、自然で論理構成が明確な英文にしてください。";
    userPrompt =
      `レベル: ${level}\n` +
      `お題: ${topic}\n` +
      `指示:\n${instrText}\n` +
      `POINTS: ${pointsText}\n` +
      `POINTSの使い方: ${pointsRule}\n` +
      `目安語数: ${wordTarget}\n\n` +
      `この条件を満たす模範解答を英語のみで書いてください。前置きや説明は不要です。`;
  } else {
    // ---------- 採点 ----------
    systemPrompt =
      "あなたは英検ライティングの採点官です。英検の採点基準に沿って、" +
      "4つの観点（内容 / 構成 / 語彙 / 文法）でそれぞれ0〜4点、合計16点満点で採点します。" +
      "フィードバックは日本語で、学習者が次に何を直せばよいか具体的に書いてください。" +
      "必ず指定したJSON形式のみで出力し、JSON以外の文字は一切出力しないでください。";
    userPrompt =
      `# 採点対象\n` +
      `レベル: ${level}\n` +
      `お題: ${topic}\n` +
      `指示(instructions):\n${instrText}\n` +
      `POINTS: ${pointsText}\n` +
      `# 重要な採点ルール\n${pointsRule}\n${offTopicRule}\n\n` +
      `目安語数: ${wordTarget}\n\n` +
      `# 学習者の解答\n${essay}\n\n` +
      `# 出力形式（このJSONのみ。コードブロックも不要）\n` +
      `{\n` +
      `  "total": 合計点(0-16の整数),\n` +
      `  "maxTotal": 16,\n` +
      `  "criteria": [\n` +
      `    {"name":"内容","score":0-4,"max":4,"comment":"日本語の短評"},\n` +
      `    {"name":"構成","score":0-4,"max":4,"comment":"日本語の短評"},\n` +
      `    {"name":"語彙","score":0-4,"max":4,"comment":"日本語の短評"},\n` +
      `    {"name":"文法","score":0-4,"max":4,"comment":"日本語の短評"}\n` +
      `  ],\n` +
      `  "summary": "全体の総評（日本語・2〜4文）",\n` +
      `  "improvements": ["改善点1","改善点2","改善点3"],\n` +
      `  "corrected": "文法・語彙を直した添削後の英文"\n` +
      `}`;
  }

  try {
    const resp = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1500,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!resp.ok) {
      const t = await resp.text();
      return res
        .status(502)
        .json({ error: `AI APIエラー (${resp.status}): ${t.slice(0, 200)}` });
    }

    const data = await resp.json();
    const text =
      (data.content && data.content[0] && data.content[0].text) || "";

    if (mode === "model") {
      return res.status(200).json({ model: text.trim() });
    }

    // JSON抽出（前後にゴミがあっても拾う）
    const parsed = extractJson(text);
    if (!parsed) {
      return res
        .status(502)
        .json({ error: "採点結果の解析に失敗しました。もう一度お試しください。" });
    }
    return res.status(200).json(parsed);
  } catch (e) {
    return res.status(500).json({ error: "サーバー内部エラー: " + e.message });
  }
};

function extractJson(text) {
  if (!text) return null;
  // ```json ... ``` を除去
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1] : text;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(raw.slice(start, end + 1));
  } catch (e) {
    return null;
  }
}

// ------------------------------------------------------------
//  OpenAI を使いたい場合のメモ:
//  - ANTHROPIC_URL を https://api.openai.com/v1/chat/completions に
//  - headers を { "Authorization": `Bearer ${process.env.OPENAI_API_KEY}` }
//  - body を { model:"gpt-4o-mini", messages:[{role:"system",...},{role:"user",...}] }
//  - 返答は data.choices[0].message.content から取得
// ------------------------------------------------------------
