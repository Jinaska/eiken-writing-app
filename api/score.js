// ============================================================
//  /api/score  — AI採点 & 模範解答生成 (Vercel Serverless Function)
//  APIキーは環境変数 ANTHROPIC_API_KEY に設定してください。
//  （OpenAIを使いたい場合は下部のコメントを参照）
// ============================================================

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-6";

module.exports = async function handler(req, res) {
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

let body = req.body;
if (typeof body === "string") {
try { body = JSON.parse(body); } catch (e) { body = {}; }
}
body = body || {};

const { mode, level, topic, points = [], wordTarget, essay } = body;
if (!topic) return res.status(400).json({ error: "topicがありません。" });

const pointsText = points.length ? points.join(", ") : "（指定なし）";

let systemPrompt, userPrompt;

if (mode === "model") {
systemPrompt =
"あなたは英検ライティング指導の専門家です。与えられたお題に対し、" +
"そのレベルの満点に値する模範解答を英語で書いてください。" +
"自然で、論理構成が明確な英文にしてください。";
userPrompt =
`レベル: ${level}\n` +
`お題: ${topic}\n` +
`観点(POINTS): ${pointsText}\n` +
`目安語数: ${wordTarget}\n\n` +
`この条件を満たす模範解答を英語のみで書いてください。前置きや説明は不要です。`;
} else {
systemPrompt =
"あなたは英検ライティングの採点官です。英検の採点基準に沿って、" +
"4つの観点（内容 / 構成 / 語彙 / 文法）でそれぞれ0〜4点、合計16点満点で採点します。" +
"フィードバックは日本語で、学習者が次に何を直せばよいか具体的に書いてください。" +
"必ず指定したJSON形式のみで出力し、JSON以外の文字は一切出力しないでください。";
userPrompt =
`# 採点対象\n` +
`レベル: ${level}\n` +
`お題: ${topic}\n` +
`観点(POINTS): ${pointsText}\n` +
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
