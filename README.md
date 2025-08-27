# AI Extension - Gemini AIによるテキスト要約

Chrome拡張機能で、選択したテキストをGemini AIを使って要約できる拡張機能です。

## 🚀 機能

- **右クリック要約**: テキスト選択後に右クリックで要約実行
- **美しいUI**: ページ内に美しいポップアップで結果表示
- **高速処理**: Gemini 1.5 Flashモデルによる高速要約
- **シンプル操作**: 3ステップで簡単要約

## 📋 セットアップ手順

### 1. リポジトリのクローン
```bash
git clone [リポジトリURL]
cd ai-extension
```

### 2. 依存関係のインストール
```bash
npm install
# または
pnpm install
```

### 3. Gemini APIキーの取得
1. [Google AI Studio](https://makersuite.google.com/app/apikey)にアクセス
2. Googleアカウントでログイン
3. 「Create API Key」をクリック
4. APIキーをコピー

### 4. 環境変数の設定
プロジェクトルートに`.env`ファイルを作成し、以下の内容を記述：

```env
PLASMO_PUBLIC_GEMINI_API_KEY=あなたのGeminiAPIキーをここに入れてください
```

**重要**: `あなたのGeminiAPIキーをここに入れてください`の部分を、実際のAPIキーに置き換えてください。

### 5. 拡張機能のビルド
```bash
npm run build
```

### 6. Chromeへのインストール
1. Chromeで`chrome://extensions/`にアクセス
2. 「デベロッパーモード」を有効化
3. 「パッケージ化されていない拡張機能を読み込む」をクリック
4. `build/chrome-mv3-prod`フォルダを選択

## 📖 使用方法

### 基本的な使い方
1. **要約したいテキストを選択**
2. **右クリックして「Geminiでテキストを要約する」をクリック**
3. **ページ内に要約結果が表示されます**

### 詳細な手順
1. 任意のウェブページで要約したいテキストをドラッグして選択
2. 選択したテキスト上で右クリック
3. コンテキストメニューから「Geminiでテキストを要約する」を選択
4. 要約処理が開始され、結果がページ内にポップアップ表示
5. 結果を確認後、×ボタンでポップアップを閉じる

## ⚙️ 設定

### 環境変数
- `PLASMO_PUBLIC_GEMINI_API_KEY`: Gemini APIキー（必須）

### 権限
- `contextMenus`: 右クリックメニューの作成
- `activeTab`: アクティブなタブへのアクセス
- `host_permissions`: 全サイトでの動作

## 🛠️ 開発

### 開発サーバーの起動
```bash
npm run dev
```

### ビルド
```bash
npm run build
```

### パッケージ化
```bash
npm run package
```

## 🔧 カスタマイズ

### モデルの変更
Gemini AIのモデルを変更したい場合は、`background.ts`の71行目を編集してください：

```typescript
// ② 使用するモデルを指定
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" })
```

**利用可能モデル例**:
- `gemini-2.5-flash-lite`: 高速・軽量（推奨）
- `gemini-2.5-flash`: 高精度・多機能
- `gemini-2.5-pro`: 最高性能・思考機能

**詳細情報**:
 モデル変更の際は[Google AI Gemini モデル](https://ai.google.dev/gemini-api/docs/models?hl=ja)を参照してください。
 レート制限の詳細は[Google AI Gemini API レート制限](https://ai.google.dev/gemini-api/docs/rate-limits?hl=ja)をご確認ください。

### プロンプトの変更
要約の指示を変更したい場合は、`background.ts`の76行目を編集してください：

```typescript
const prompt = `以下のテキストを簡潔に要約してください。\n\n${text}`
```

**カスタマイズ例**:
- 要約の長さを指定: `「3行で要約してください」`
- 特定の観点で要約: `「技術的な観点で要約してください」`
- 言語を指定: `「英語で要約してください」`

**注意**: 変更後は必ず`npm run build`で再ビルドしてください。

## ⚠️ 注意事項

- **APIキーの管理**: `.env`ファイルはGitにコミットしないでください
- **インターネット接続**: Gemini APIを使用するため、インターネット接続が必要です
- **テキスト長**: 長いテキストは処理に時間がかかる場合があります
- **API制限**: Gemini APIの利用制限にご注意ください

## 🐛 トラブルシューティング

### よくある問題

#### 1. 右クリックメニューが表示されない
- 拡張機能が有効化されているか確認
- ページを再読み込みしてみてください

#### 2. 要約が実行されない
- `.env`ファイルにAPIキーが正しく設定されているか確認
- Chrome拡張機能のコンソールでエラーログを確認

#### 3. 結果が表示されない
- **ページの再読み込み**を行ってください
- **拡張機能のサービスワーカーのコンソールログ**を確認してください
  - Chrome拡張機能の管理ページ（`chrome://extensions/`）で拡張機能を開く
  - 「Service Worker」をクリックしてコンソールを確認
  - エラーメッセージやログを確認
- 拡張機能の権限設定を確認

### ログの確認方法
1. `chrome://extensions/`で拡張機能の「詳細」をクリック
2. 「Service Worker」の「ビューを検証」をクリック
3. コンソールでログを確認

## 📁 ファイル構成

```
ai-extension/
├── background.ts          # バックグラウンド処理（要約・メッセージ送信）
├── content.tsx           # 結果表示UI
├── popup.tsx            # 説明・ヘルプ画面
├── package.json         # 依存関係・設定
├── .env                 # 環境変数（APIキー）
└── README.md           # このファイル
```

## 🤝 貢献

バグ報告や機能要望は、GitHubのIssuesでお知らせください。

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 👨‍💻 作者

Teppu

---

**注意**: この拡張機能を使用する前に、必ず`.env`ファイルに有効なGemini APIキーを設定してください。
