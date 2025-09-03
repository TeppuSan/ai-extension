# サクッとAI要約 - Chrome拡張機能

[![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-サクッとAI要約-blue?logo=google-chrome)](https://chrome.google.com/webstore/detail/sakutto-ai-summary)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Plasmo](https://img.shields.io/badge/Plasmo-0.90.5-purple.svg)](https://www.plasmo.com/)

> 選択したテキストを右クリックするだけ！Google Gemini AIが瞬時に要約し、長文もわかりやすく整理します。

## 🚀 機能

- **⚡ ワンクリック要約**: テキスト選択 → 右クリック → 要約完了
- **🤖 高精度AI**: Gemini 2.5 Flashによる文脈理解
- **🔒 プライバシー重視**: APIキーはローカル保存、外部送信なし
- **🎯 幅広い用途**: 学習、業務、研究、情報収集に対応
- **✨ 美しいUI**: ページ内に美しいポップアップで結果表示
- **🔄 フォールバック機能**: content.tsxが無効な場合、ポップアップで結果表示（開発版のみ）

## 📖 セットアップ

### 前提条件
- Google Chrome ブラウザ
- Gemini API キー（[Google AI Studio](https://aistudio.google.com/)で取得）

### インストール方法

#### 1. Chrome Web Storeからインストール（審査待ち）
> **⚠️ 現在審査中**: Chrome Web Storeでの公開は審査待ちです。  
> 現在のWeb Store版にはフォールバック機能（ポップアップ表示）が実装されていません。

<!-- #### 1. Chrome Web Storeからインストール（推奨）
1. [Chrome Web Store](https://chrome.google.com/webstore/detail/sakutto-ai-summary)にアクセス
2. 「Chromeに追加」をクリック
3. 拡張機能をインストール -->

#### 2. 開発版としてインストール
> **✅ 最新機能**: 開発版にはフォールバック機能（ポップアップ表示）が実装されています。
```bash
# リポジトリをクローン
git clone https://github.com/TeppuSan/ai-extension.git
cd ai-extension

# 依存関係をインストール
npm install

# ビルド
npm run build

# Chrome拡張機能として読み込み
# chrome://extensions/ で「パッケージ化されていない拡張機能を読み込む」
# build/chrome-mv3-prod フォルダを選択

# ⚠️ 重要: インストール後は既に開いているページを更新してください
# content.tsxが正しく読み込まれるために必要です
```

## 🛠️ 使用方法

### 初回設定
1. 拡張機能のアイコンをクリック
2. 「🔧 APIキー設定」をクリック
3. Gemini APIキーを入力して保存

### 基本的な使い方
1. **テキスト選択**: 要約したいテキストをドラッグして選択
2. **右クリック**: 選択したテキスト上で右クリック
3. **要約実行**: 「AI要約」をクリック
4. **結果確認**: ページ内に要約結果が表示（開発版ではポップアップ表示も対応）

## 💡 活用シーン

### 📚 学習支援
- **教科書・論文**: 長い文章の要点を素早く把握
- **参考書**: 複雑な内容を簡潔に整理
- **学習効率**: 理解度が格段に向上

### 💼 業務効率化
- **報告書**: 重要なポイントを素早く抽出
- **マニュアル**: 手順の要点を明確化
- **資料**: 大量情報の効率的な読解

### 🔍 情報収集
- **ニュース**: 記事の核心を素早く理解
- **ブログ**: 長文の要点を把握
- **調査**: 複数情報の比較・分析

### 🧪 研究活動
- **学術論文**: 研究内容の要点把握
- **調査報告**: データの効率的な読解
- **文献**: 関連研究の素早い理解

## 🔧 技術仕様

### 技術スタック
- **フレームワーク**: [Plasmo](https://www.plasmo.com/) v0.90.5
- **AI API**: Google Gemini 2.5 Flash
- **言語**: TypeScript + React
- **ビルド**: Manifest V3対応

### 利用可能モデル

#### 現在使用モデル
- **`gemini-2.5-flash-lite`** (推奨・デフォルト)
  - **場所**: `consts.tsx` の 16行目
  - **設定**: `API.MODEL: "gemini-2.5-flash-lite"`
  - **特徴**: 高速・軽量・コスト効率が良い
  - **用途**: 一般的な要約タスクに最適

#### その他のモデル
- **`gemini-2.5-flash`**: 高精度・多機能
  - より高度な分析が可能
  - 複雑な文脈理解
  - より詳細な要約

- **`gemini-2.5-pro`**: 最高性能・思考機能
  - 最高レベルの精度
  - 複雑な推論が可能
  - 高度な分析タスク

#### モデル変更方法（開発者向け）
```typescript
// consts.tsx の 16行目を編集
API: {
  MODEL: "gemini-2.5-flash", // または "gemini-2.5-pro"
  // ... その他の設定
}
```

#### 現在の仕様（v1.0.0）
- **デフォルトモデル**: `gemini-2.5-flash-lite`
- **要約プロンプト**: `consts.tsx` の 18行目
- **テストプロンプト**: `consts.tsx` の 17行目
- **プレビュー文字数**: `consts.tsx` の 35行目（100文字）
- **タイムアウト**: 30秒（Gemini API標準）

#### モデル変更について
- **デフォルト**: `gemini-2.5-flash-lite`を使用
- **カスタマイズ**: `consts.tsx`の`API.MODEL`を変更
- **詳細情報**: [Google AI Gemini モデル](https://ai.google.dev/gemini-api/docs/models?hl=ja)を参照
- **レート制限**: [Google AI Gemini API レート制限](https://ai.google.dev/gemini-api/docs/quotas?hl=ja)をご確認

### 権限
- **`contextMenus`**: 右クリックメニューの作成
- **`activeTab`**: アクティブなタブへのアクセス
- **`storage`**: APIキーのローカル保存
- **`host_permissions`**: Gemini APIへの通信のみ

### セキュリティ
- **APIキー**: ローカルストレージに暗号化保存
- **データ送信**: Gemini APIのみ（外部サーバーなし）
- **プライバシー**: ユーザーデータの最小限収集

## 📱 対応ブラウザ

- ✅ Google Chrome (推奨)
- ✅ Microsoft Edge
- ✅ Brave
- ✅ その他のChromiumベースブラウザ

## 🔒 プライバシー

### データの取り扱い
- **APIキー**: ローカルに保存（外部送信なし）
- **選択テキスト**: Gemini APIのみに送信
- **要約結果**: 一時表示のみ（保存なし）
- **ログ**: デバッグ用のみ（個人情報なし）

### プライバシーポリシー
詳細は[プライバシーポリシー](privacy-policy.md)をご確認ください。

## 🚨 トラブルシューティング

### よくある問題

#### 右クリックメニューが表示されない
- 拡張機能が有効化されているか確認
- ページを再読み込みしてみてください

#### 要約が実行されない
- APIキーが正しく設定されているか確認
- Chrome拡張機能のコンソールでエラーログを確認

#### 結果が表示されない
- **Web Store版**: content.tsxが読み込まれていない場合、結果表示されません
  - ただし、要約処理は実行されているため、サービスワーカーで動作確認は可能
- **開発版**: ページ内ポップアップまたはポップアップで結果表示
- **重要**: 拡張機能インストール後は既に開いているページを更新してください
- 拡張機能のサービスワーカーのコンソールログを確認

#### content.tsxが読み込まれない問題
- **原因**: 拡張機能インストール後に既に開いているページを更新していない
- **症状**: 
  - 右クリックメニューに「AI要約」が表示されない
  - 要約を実行してもページ内に結果が表示されない
- **対策**: 
  1. 拡張機能インストール後、既に開いているページを更新（F5またはCtrl+R）
  2. 複数のタブが開いている場合は、すべてのタブを更新
  3. 新しいタブで開いたページは更新不要
- **確認方法**: 右クリックメニューに「AI要約」が表示されるか確認
- **開発版の利点**: content.tsxが読み込まれていなくても、ポップアップで結果表示されるため必要な情報は取得可能

#### フォールバック機能について
- **Web Store版**: フォールバック機能は未実装（審査待ち）
  - content.tsxが読み込まれていない場合、結果表示されません
  - 拡張機能のアイコンをクリックしても結果は確認できません
  - ただし、要約処理は実行されているため、サービスワーカーで動作確認は可能
- **開発版**: content.tsxが無効な場合、自動的にポップアップで結果表示
- **重要なポイント**: 
  - **開発版のみ**: content.tsxが読み込まれていなくても、要約機能は正常に動作
  - **開発版のみ**: 結果はポップアップで表示されるため、必要な情報は確実に取得可能
  - **開発版のみ**: ページ内表示とポップアップ表示の両方に対応

### ログの確認方法
1. `chrome://extensions/`で拡張機能の「詳細」をクリック
2. 「Service Worker」の「ビューを検証」をクリック
3. コンソールでログを確認

## 🤝 貢献

### バグ報告・機能要望
- [GitHub Issues](https://github.com/TeppuSan/ai-extension/issues)で報告
- 詳細な再現手順を含めて報告してください

### プルリクエスト
1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。詳細は[LICENSE](LICENSE)ファイルをご確認ください。

## 👨‍💻 開発者

**Teppu** - 個人開発者

- **GitHub**: [@TeppuSan](https://github.com/TeppuSan)
- **連絡先**: [starvampire.teppu@gmail.com](mailto:starvampire.teppu@gmail.com)

## ⚠️ 注意事項

- **APIキーの管理**: 個人のAPIキーを適切に管理してください
- **利用制限**: Gemini APIの利用制限にご注意ください
- **プライバシー**: 機密情報の要約には十分ご注意ください
- **サポート**: 個人開発のため、サポートに限りがあります

---

**「サクッとAI要約」で、情報処理の新しいスタイルを体験してください！** 🚀

[Chrome Web Storeでインストール](https://chrome.google.com/webstore/detail/sakutto-ai-summary) | [GitHub](https://github.com/TeppuSan/ai-extension) | [プライバシーポリシー](privacy-policy.md)
