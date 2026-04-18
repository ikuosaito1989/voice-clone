<!-- BEGIN:nextjs-agent-rules -->

# これはあなたの知っている Next.js ではない

このバージョンには破壊的変更があります。API、慣習、ファイル構成は、学習済みの知識と異なる可能性があります。コードを書く前に、`node_modules/next/dist/docs/` にある関連ガイドを読んでください。非推奨の警告も必ず確認してください。

# Codex ルール

- `useEffect` を使わないでください。
- `useEffect` を使わない判断基準と代替手段は、https://ja.react.dev/learn/you-might-not-need-an-effect を参照してください。
- コンポーネント設計や状態の持ち方は、https://react.dev/learn/thinking-in-react に従ってください。
- 代わりに、レンダー時の導出、イベントハンドラ、`ref`、サーバ主導のパターンを優先してください。
- 不要な `try/catch` は入れないでください。
- 実装を追加・変更するときは、新しいやり方を持ち込む前に、既存コードの構成、命名、責務分割、データ取得方法に合わせてください。
- Node.js 専用の依存や API を新たに追加しないでください。
- `node:crypto`、`fs`、`path` など Node runtime 前提の実装は、Edge/Cloudflare 互換な代替手段がない場合を除いて使わないでください。
- 依存追加や実装方針は、OpenNext/Cloudflare で動くことを優先してください。
- API を追加・変更した場合は、対応する OpenAPI 定義も更新してください。
- OpenAPI の `summary`、`description`、レスポンス説明など利用者向け文言は日本語で記述してください。
- API で `createdAt`、`updatedAt`、`clonedAt` などの日時を返す場合は、ISO 8601 文字列で返してください。
- DB にミリ秒 epoch の整数を保存する日時カラムは、Drizzle schema で `integer(..., { mode: "timestamp_ms" })` を使って定義してください。
<!-- END:nextjs-agent-rules -->
