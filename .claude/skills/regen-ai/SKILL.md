---
name: regen-ai
description: 埋め込みLLMリファレンスを再生成して検証する。llmdocs の編集後、オプションやコンポーネントの変更後に使う。
allowed-tools: Bash(yarn:*) Bash(node:*) Bash(git status:*) Bash(git diff:*) Read
---

# regen-ai

`src/llmdocs.generated.ts` を `llmdocs/*.md` に合わせ直します。

1. `git status --short` — 既存の差分を把握する。
2. `yarn build` — 生成物の再構築と `tsc`。
3. `yarn validate-plugin-skills`。
4. `node dist/command.js llm | head` で描画を確認する。

自動生成されるのは Markdown の埋め込みだけです。オプションやコンポーネント名を
変えた場合は `llmdocs/00-guide.md` の表を手で直す必要があります。

このスキルは Claude Code ローカル用で、配布プラグインには含みません。
