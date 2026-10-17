# 転職先候補リスト（共同編集サイト）

あゆ美さんの転職先候補を2人で管理するパスコード制のWebアプリ。

## 構成

- `index.html` … フロントエンド（検索・絞り込み・ステータス/スター/メモ編集）
- `api/` … Vercel Serverless Functions
  - `login.js` … パスコード認証（Cookie発行）
  - `me.js` … 認証状態チェック
  - `listings.js` … 一覧取得・追加
  - `listings/[id].js` … 更新・削除
- `lib/` … 認証・Vercel Blobストアの共通処理
- `data/seed.json` … 初期データ106件（初回アクセス時にBlobへ自動投入）

## 必要な環境変数

| 変数 | 説明 |
|---|---|
| `SITE_PASSCODE` | サイトのパスコード（2人に共有） |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blobの読み書きトークン（Storage接続で自動設定） |
| `API_KEY` | 週次ウォッチからの追加用APIキー（`x-api-key`ヘッダ） |

## デプロイ

VercelダッシュボードからこのリポジトリをImportするだけ。Framework Presetは「Other」。
