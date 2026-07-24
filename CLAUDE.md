# CLAUDE.md — cqi-cli

CQI（Common Queue Interface）のコンテナを実行する CLI。リスナーがキューから
メッセージを取り、ディスパッチャが1件ずつ処理する。**コマンド名は `cqi`**、
npm パッケージ名は `cqi-cli`。

コンポーネントの実体は依存パッケージ `cqi-core` 側にある。**利用可能な
コンポーネント名を増やすのは基本的に `cqi-core` かプラグイン側の仕事。**

## 変更時の必須手順

**機能を追加した、オプションを増やした、既存の挙動を変えた — このいずれかを
したら、3か所すべてを更新してから終わること。**

| 更新先 | 対象 | やり方 |
| --- | --- | --- |
| ① ドキュメント | `README.md` | 使い方が変わったときのみ |
| ② ヘルプ | yargs の `.option(...)` の description | `src/command.ts` |
| ③ **LLMナレッジ** | `llmdocs/00-guide.md` | **コンポーネント名・オプション・注意点が変わったら必ず** |
| | `src/llmdocs.generated.ts` | **生成物。手編集しない** → `yarn build-llmdocs` |
| | `plugins/cqi-cli/skills/*/SKILL.md` | 手順や前提が変わったとき |
| | `context7.json` の `rules` | 新しい落とし穴が生まれたとき |

③ を忘れやすい。ドキュメントとヘルプは人間が読んで気づくが、**LLMナレッジが
古いことには誰も気づかない**（エージェントが黙って間違えるだけ）。

**この CLI はコマンドカタログを自動生成していない**（yargs のため、cobra 用の
`go-llm-cli-kit/catalog` が使えない）。オプションを増やしたら `00-guide.md` の
表を手で直すこと。ここだけは自動追随しない。

判断に迷ったときの目安:

- **`cqi-core` を更新した** → コンポーネント名が増減していないか確認し、
  `00-guide.md` の一覧表を直す。存在しない名前を案内するとエージェントは
  必ず失敗する
- 常駐・破壊的な性質に関わる変更 → `cqi-usage` の SKILL.md。
  **フォアグラウンド常駐であること**と**キュー消費が破壊的であること**は、
  エージェントが最も事故を起こす2点
- オプションを増やした → ② と `00-guide.md`

## リリース

`package.json` の `version` と `plugin.json` の `version` を揃える
（`yarn validate-plugin-skills` が検査）。npm への公開は `yarn publish`
（`prepublishOnly` でビルドが走る）。

## 確認

```bash
yarn build                    # 生成物の再生成 + tsc
git diff --exit-code -- src/llmdocs.generated.ts
yarn validate-plugin-skills
node dist/command.js llm | head
```

## 参照

- 標準: <https://github.com/ideamans/go-llm-cli-kit/blob/main/LLM.md>
- 生成物と原本の対応: `.claude/rules/ai-artifacts-policy.md`
- 再生成: `/regen-ai`
