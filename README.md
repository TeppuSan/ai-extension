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

## 📖 セットアップ

### 前提条件
- Google Chrome ブラウザ
- Gemini API キー（[Google AI Studio](https://aistudio.google.com/)で取得）

### インストール方法
#### 1.　公開前
<!-- #### 1. Chrome Web Storeからインストール（推奨）
1. [Chrome Web Store](https://chrome.google.com/webstore/detail/sakutto-ai-summary)にアクセス
2. 「Chromeに追加」をクリック
3. 拡張機能をインストール -->

#### 2. 開発版としてインストール
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
```

## 🛠️ 使用方法

### 初回設定
1. 拡張機能のアイコンをクリック
2. 「🔧 APIキー設定」をクリック
3. Gemini APIキーを入力して保存

### 基本的な使い方
1. **テキスト選択**: 要約したいテキストをドラッグして選択
2. **右クリック**: 選択したテキスト上で右クリック
3. **要約実行**: 「Geminiでテキストを要約する」をクリック
4. **結果確認**: ページ内に要約結果がポップアップ表示

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
- ページの再読み込みを行ってください
- 拡張機能のサービスワーカーのコンソールログを確認

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

## 🙏 謝辞

- [Plasmo](https://www.plasmo.com/) - 素晴らしいChrome拡張機能フレームワーク
- [Google Gemini](https://ai.google.dev/gemini-api/) - 高精度なAI要約技術
- [Chrome Web Store](https://chrome.google.com/webstore/) - 拡張機能の配布プラットフォーム

## 📈 今後の予定

- [ ] 多言語対応の強化
- [ ] 要約のカスタマイズ機能
- [ ] 履歴機能の追加
- [ ] モバイル対応
- [ ] オフライン対応

## ⚠️ 注意事項

- **APIキーの管理**: 個人のAPIキーを適切に管理してください
- **利用制限**: Gemini APIの利用制限にご注意ください
- **プライバシー**: 機密情報の要約には十分ご注意ください
- **サポート**: 個人開発のため、サポートに限りがあります

---

**「サクッとAI要約」で、情報処理の新しいスタイルを体験してください！** 🚀

[Chrome Web Storeでインストール](https://chrome.google.com/webstore/detail/sakutto-ai-summary) | [GitHub](https://github.com/TeppuSan/ai-extension) | [プライバシーポリシー](privacy-policy.md)
