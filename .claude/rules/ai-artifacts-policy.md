# 生成物 — 手編集しないこと

| 生成物 | 原本 |
| --- | --- |
| `src/llmdocs.generated.ts` | `llmdocs/*.md`（`scripts/build-llmdocs.js` が埋め込む） |
| `dist/**` | `src/**`（`tsc`） |

手書き（編集してよい）:

- `llmdocs/00-guide.md` — コンポーネント名、オプション、エージェント向けの注意
- `plugins/cqi-cli/skills/*/SKILL.md`
- `context7.json`

Markdown を TypeScript に埋め込んでいるのは、`tsc` が `.md` を `dist/` に
コピーしないため。グローバルインストールされたパッケージからも読めるように
生成物をコミットしている。

再生成は `yarn build-llmdocs`（`yarn build` が先に実行する）。
