// consts.tsx - 定数定義ファイル

export const CONSTANTS = {
  // メッセージタイプ
  MESSAGE_TYPES: {
    LOADING: "loading",
    API_KEY_MISSING: "API_KEY_MISSING",
    SUMMARY_EMPTY: "SUMMARY_EMPTY",
    SUMMARY_COMPLETE: "SUMMARY_COMPLETE",
    TEST_API_KEY: "TEST_API_KEY"
  },

  // API設定
  API: {
    MODEL: "gemini-2.5-flash-lite",
    TEST_PROMPT: "Hello, world!",
    SUMMARIZE_PROMPT: "以下のテキストを簡潔に要約してください。\n\n"
  },

  // ストレージキー
  STORAGE_KEYS: {
    USER_API_KEY: "userApiKey",
    POPUP_RESULT: "popupResult",
    POPUP_ERROR: "popupError"
  },

  // コンテキストメニュー
  CONTEXT_MENU: {
    ID: "summarizeText",
    TITLE: "Geminiでテキストを要約する",
    CONTEXTS: ["selection" as const]
  },

  // テキスト処理
  TEXT: {
    MAX_PREVIEW_LENGTH: 100,
    ELLIPSIS: "..."
  },

  // エラーメッセージ
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
