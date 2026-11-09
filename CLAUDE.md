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
（`yarn validate-plugin-skills` が検査）。npm への公開は下の「npm への公開」
（タグを打つだけ。手元から `yarn publish` しない）。

## npm への公開

`v*` のタグを push すると `.github/workflows/publish.yml` がテストとビルドのあと npm に**そのまま公開する**
（承認待ちにしない）。認証は npm の Trusted Publishing（GitHub Actions の OIDC）で、`NPM_TOKEN` などのシークレットは使わない。
provenance は自動で付く。

```bash
# package.json の version を上げてコミット・push してから
git tag vX.Y.Z && git push origin vX.Y.Z
```

タグは plugins/cqi-cli/.claude-plugin/plugin.json の version とも突き合わせる。

- タグと package.json の version が違えば落ちる。npm に同じ版があれば何もしない
- プレリリース（`1.2.0-beta.0`）は `latest` ではなく識別子の dist-tag（`beta`）で出る
- 手元から `npm publish` しない（トークンを置かない）
- タグを打ち直さずに出し直すときは、Actions の「Publish to npm」を workflow_dispatch で起動する（選んだブランチの package.json の版を出す）
- PR で `publish.yml` を変えると、公開せずにビルドと `npm pack --dry-run` までが走る
- package.json の `repository` はこのリポジトリを指すこと。provenance の検証で照合され、違うと公開が `E422` で落ちる（ワークフローが先に検査する）
- 前提: npmjs.com の `cqi-cli` の設定で、Trusted Publisher に GitHub Actions・`ideamans/cqi-cli`・`publish.yml`・権限 **publish** を登録してあること。
  stage publish の権限だけだと `npm publish` は `E403 OIDC permission denied` になる

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
