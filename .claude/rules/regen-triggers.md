---
paths:
  - "src/command.ts"
  - "llmdocs/*.md"
  - "package.json"
---

# 埋め込みリファレンスの原本に触れました

`llmdocs/*.md` を編集したなら `yarn build-llmdocs` を実行して
`src/llmdocs.generated.ts` を一致させること。CI が再生成して差分が出たら落ちます。

`src/command.ts` のオプションを増減したなら、**`llmdocs/00-guide.md` のオプション表を
手で直すこと**。この CLI は yargs のためコマンドカタログを自動生成しておらず、
ここは自動では追随しません。

`src/llmdocs.generated.ts` は直接編集しないこと。
