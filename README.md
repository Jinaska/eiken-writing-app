# 英作文トレーナー（AI採点つきライティング練習アプリ）

英検形式のライティング練習アプリです。レベル（3級〜1級）とお題を選んで英作文を書くと、
AIが観点別に採点し、フィードバックと模範解答を返します。

## 何ができる？

- 3級〜1級のお題リスト（級を切り替え可能）
- 英作文の入力（下書きは自動保存）
- **AI採点**: 内容 / 構成 / 語彙 / 文法 の4観点・16点満点＋総評＋改善ヒント＋添削
- **模範解答**をその場で生成（一度生成したものはキャッシュ）

## 構成

```
eiken-writing-app/
├── index.html          トップ（レベル選択）
├── questions.html      問題一覧（級切替）
├── review.html         採点画面（入力＋AI採点＋模範解答）
├── css/style.css
├── js/
│   ├── questions-data.js  問題データ（ここを編集すれば問題を追加できます）
│   ├── questions.js
│   └── review.js
├── api/
│   └── score.js        AI採点のサーバー関数（APIキーを安全に保持）
├── vercel.json
├── package.json
├── .env.example
└── .gitignore
```

## ⚠️ ローカルで `index.html` を直接開いても採点は動きません

採点は `api/score.js`（サーバー関数）が動いて初めて使えます。
ローカルでもデプロイ後でも、下記のどちらかの手順が必要です。

---

## いちばん簡単な公開方法：GitHub + Vercel（無料）

### 1. APIキーを取得
[Anthropic Console](https://console.anthropic.com/) でAPIキー（`sk-ant-...`）を発行します。
※ APIの利用には少額の料金がかかります（採点1回あたり数円程度）。

### 2. GitHubにアップロード
このフォルダ（`eiken-writing-app`）をGitHubのリポジトリにpushします。
`.env` は `.gitignore` 済みなので**キーは公開されません**。

### 3. Vercelにデプロイ
1. [vercel.com](https://vercel.com/) にGitHubアカウントでログイン
2. 「Add New… → Project」から、上のリポジトリをImport
3. デプロイ前に **Settings → Environment Variables** で以下を登録:
   - Name: `ANTHROPIC_API_KEY`
   - Value: 発行したAPIキー
4. 「Deploy」を押す

数十秒で `https://〇〇.vercel.app` のURLが発行されます。これを生徒さんに渡せばOKです。

---

## ローカルで試す（任意）

```bash
npm i -g vercel        # 初回のみ
cd eiken-writing-app
cp .env.example .env   # .env を編集して自分のAPIキーを入れる
vercel dev             # http://localhost:3000 で起動
```

---

## 問題を追加・編集するには

`js/questions-data.js` の `QUESTIONS` を編集するだけです。例:

```js
"grade-2": [
  { id: "g2-7",
    topic: "Do you think AI will change how we study English?",
    points: ["Efficiency", "Motivation", "Cost"] },
  // ...
],
```

`id` は他と重複しない一意の文字列にしてください（下書き保存やキャッシュのキーに使います）。

## OpenAI(ChatGPT)を使いたい場合

`api/score.js` の末尾コメントに切り替え方法を記載しています。

## 注意

- 「英検」は公益財団法人 日本英語検定協会の登録商標です。本アプリは同協会とは関係ありません。
- 採点・模範解答はAIによる目安です。実際の採点とは異なる場合があります。
