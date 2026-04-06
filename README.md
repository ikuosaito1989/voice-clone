# 🎙️ こんなの作ろうとおもっている

## 画面の流れ

```mermaid
flowchart TD
    LP[LPページ] --> REC[ボイス録音画面<br/>特定の文章を読み上げ]
    REC --> LOADING[ボイスクローン作成中画面]
    LOADING --> WAIT[一定時間待機]
    WAIT --> CHECK[再アクセス]
    CHECK --> DONE[ボイスクローン完成済み画面]
```

---

## 処理の流れ

```mermaid
flowchart TD
    REC[ボイス録音]
        --> R2_UPLOAD[R2へ音声アップロード]

    R2_UPLOAD
        --> D1_SAVE[D1に録音情報を保存]

    D1_SAVE
        --> KAGGLE[KaggleでQwen3-TTS実行<br/>ボイスクローン生成]

    KAGGLE
        --> R2_CLONE[R2へクローン音声アップロード]

    R2_CLONE
        --> D1_UPDATE[D1のステータスを完了に更新]

    D1_UPDATE
        --> MAIL[メール通知送信]
```

---

## JWTログインの試し方

`/api/auth/login` は D1 の `users` テーブルを見て、bcrypt でパスワード照合します。

### 1. テーブルを作る

```bash
wrangler d1 execute voice-clone --local --file=db/migrate/20260406204200_create_users.sql
```

リモートに作る場合:

```bash
wrangler d1 execute voice-clone --remote --file=db/migrate/20260406204200_create_users.sql
```

### 2. ユーザーを作る

ローカル DB に作る場合:

```bash
pnpm create:user --email demo@example.com --password password --name "Demo User"
```

リモート DB に作る場合:

```bash
pnpm create:user --email admin@example.com --password password --role admin --remote
```

SQL だけ確認したい場合:

```bash
pnpm create:user --email demo@example.com --password password --dry-run
```

### 3. ログイン API を叩く

```bash
curl -i -X POST http://localhost:3000/api/auth/login \
  -H 'content-type: application/json' \
  -d '{"email":"demo@example.com","password":"password"}'
```

`JWT_SECRET` を設定していない場合は開発用のデフォルト値で署名します。本番では必ず `JWT_SECRET` を設定してください。
