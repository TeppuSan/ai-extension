/**
 * consts.tsx - 定数定義ファイル
 *
 * このファイルは、Chrome拡張機能全体で使用される定数と型定義を管理します。
 * 一元管理により、設定値の変更や型安全性の確保を実現しています。
 *
 * 主な内容：
 * - メッセージ通信の型定義
 * - API関連の設定値
 * - エラーメッセージの定義
 * - ストレージキーの管理
 * - UI表示用の定数
 */

/**
 * ローディング表示用のメッセージ型
 *
 * 要約処理中にcontent.tsxに送信されるメッセージの型定義
 * ユーザーに処理中であることを視覚的に伝えるために使用
 */
export interface LoadingMessage {
  type: "loading" // メッセージタイプ（固定値）
  summary: string // 表示する要約テキスト（通常は"読み込み中..."）
  originalText: string // 元のテキスト（プレビュー用、100文字まで）
}

/**
 * エラー表示用のメッセージ型
 *
 * APIキー未設定や要約失敗などのエラー時にcontent.tsxに送信されるメッセージの型定義
 * ユーザーにエラー内容と解決方法を伝えるために使用
 */
export interface ErrorMessage {
  type: "API_KEY_MISSING" | "SUMMARY_EMPTY" // エラーの種類
  message: string // エラーメッセージ（ユーザー向け）
}

/**
 * 要約完了表示用のメッセージ型
 *
 * 要約処理が正常に完了した際にcontent.tsxに送信されるメッセージの型定義
 * 要約結果をユーザーに表示するために使用
 */
export interface SummaryMessage {
  type: "SUMMARY_COMPLETE" // メッセージタイプ（固定値）
  summary: string // 要約されたテキスト
  originalText: string // 元のテキスト（プレビュー用、100文字まで）
}

/**
 * メッセージ型のユニオン型
 *
 * background.ts から content.tsx に送信されるすべてのメッセージの型定義
 * 型安全性を確保し、IDE補完を提供するために使用
 */
export type MessageType = LoadingMessage | ErrorMessage | SummaryMessage

/**
 * APIエラーの型定義
 *
 * Gemini API呼び出し時に発生するエラーを型安全に処理するための型定義
 * エラーの詳細情報を構造化して管理するために使用
 */
export interface ApiError {
  name: string // エラーの種類（例: "TypeError", "NetworkError"）
  message: string // エラーメッセージ（必須）
  stack?: string // スタックトレース（デバッグ用、オプショナル）
  code?: string // カスタムエラーコード（オプショナル）
  status?: number // HTTPステータスコード（オプショナル）
}

/**
 * Gemini APIレスポンスの型定義
 *
 * Gemini APIから返されるレスポンスの構造を定義
 * 型安全性を確保し、レスポンスの検証に使用
 */
export interface GeminiResponse {
  text: string // 生成されたテキスト（必須）
  candidates?: Array<{
    // 候補レスポンス（オプショナル）
    content: {
      parts: Array<{
        text: string
      }>
    }
  }>
}

/**
 * APIエラーレスポンスの型定義
 *
 * APIから返されるエラーレスポンスの構造を定義
 * 将来的なAPIエラーハンドリングの拡張に備えて定義
 */
export interface ApiErrorResponse {
  error: {
    code: number // エラーコード
    message: string // エラーメッセージ
    status: string // ステータス文字列
  }
}

/**
 * アプリケーション全体で使用される定数オブジェクト
 *
 * すべての設定値、メッセージ、キー名を一元管理
 * 変更時の影響範囲を最小限に抑え、保守性を向上させる
 */
export const CONSTANTS = {
  /**
   * 内部通信メッセージタイプ
   *
   * popup.tsx と background.ts 間の通信で使用されるメッセージタイプ
   * 拡張機能内部でのみ使用される通信プロトコル
   */
  INTERNAL_MESSAGES: {
    TEST_API_KEY: "TEST_API_KEY" // APIキーテスト要求のメッセージタイプ
  },

  /**
   * API設定
   *
   * Gemini API との通信に必要な設定値
   * モデル名、プロンプト、テスト用の設定を管理
   */
  API: {
    MODEL: "gemini-2.5-flash-lite", // 使用するAIモデル名
    TEST_PROMPT: "Hello, world!", // APIキーテスト用の簡単なプロンプト
    SUMMARIZE_PROMPT: "以下のテキストを簡潔に要約してください。\n\n" // 要約用プロンプト
  },

  /**
   * ストレージキー
   *
   * chrome.storage.local で使用されるキー名
   * データの永続化と一時的なデータ保存に使用
   */
  STORAGE_KEYS: {
    USER_API_KEY: "userApiKey", // ユーザーのAPIキー（永続保存）
    POPUP_RESULT: "popupResult", // ポップアップ表示用の要約結果（一時保存）
    POPUP_ERROR: "popupError" // ポップアップ表示用のエラーメッセージ（一時保存）
  },

  /**
   * コンテキストメニュー設定
   *
   * 右クリックメニューに表示される項目の設定
   * Chrome拡張機能のコンテキストメニューAPI用の設定値
   */
  CONTEXT_MENU: {
    ID: "summarizeText", // メニュー項目の一意ID
    TITLE: "Geminiでテキストを要約する", // メニューに表示されるテキスト
    CONTEXTS: ["selection" as const] // テキスト選択時のみ表示
  },

  /**
   * テキスト処理設定
   *
   * テキストの表示や処理に関する設定値
   * UI表示での長いテキストの省略処理に使用
   */
  TEXT: {
    MAX_PREVIEW_LENGTH: 100, // プレビュー表示時の最大文字数
    ELLIPSIS: "..." // 省略時の表示文字
  },

  /**
   * エラーメッセージ
   *
   * ユーザーに表示されるエラーメッセージの定義
   * 各エラーの種類に応じた適切なメッセージと解決方法を提供
   */
  ERROR_MESSAGES: {
    API_KEY_MISSING:
      "APIキーが設定されていません。拡張機能の設定でAPIキーを入力してください。",
    SUMMARY_EMPTY:
      "要約結果が取得できませんでした。テキストの内容を確認してください。",
    API_ERROR: "Gemini APIでエラーが発生しました。",
    API_KEY_INVALID: "APIキーが無効です。正しいAPIキーを設定してください。",
    QUOTA_ERROR:
      "APIの利用制限に達しました。しばらく時間をおいてから再試行してください。",
    NETWORK_ERROR:
      "ネットワークエラーが発生しました。インターネット接続を確認してください。"
  }
}
