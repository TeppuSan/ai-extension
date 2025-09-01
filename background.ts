// background.ts (バックグラウンドでGemini APIと連携)
import { GoogleGenAI } from "@google/genai"

import { CONSTANTS } from "./consts"

// コンテキストメニューに項目を追加します
chrome.runtime.onInstalled.addListener(() => {
  console.log(
    "拡張機能がインストールされました。コンテキストメニューを作成中..."
  )

  try {
    chrome.contextMenus.create(
      {
        id: CONSTANTS.CONTEXT_MENU.ID,
        title: CONSTANTS.CONTEXT_MENU.TITLE,
        contexts: CONSTANTS.CONTEXT_MENU.CONTEXTS
      },
      () => {
        if (chrome.runtime.lastError) {
          console.error(
            "コンテキストメニュー作成エラー:",
            chrome.runtime.lastError
          )
        } else {
          console.log("コンテキストメニューが正常に作成されました")
        }
      }
    )
  } catch (error) {
    console.error("コンテキストメニュー作成時のエラー:", error)
  }
})

// コンテキストメニューがクリックされたときのイベントリスナー
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  console.log("コンテキストメニューがクリックされました:", info.menuItemId)
  console.log("選択されたテキスト:", info.selectionText)

  if (info.menuItemId === CONSTANTS.CONTEXT_MENU.ID && info.selectionText) {
    console.log(
      "選択されたテキスト:",
      info.selectionText.substring(0, CONSTANTS.TEXT.MAX_PREVIEW_LENGTH) +
        CONSTANTS.TEXT.ELLIPSIS
    )
    await summarizeText(info.selectionText, tab)
  }
})

// 拡張機能の起動確認
chrome.runtime.onStartup.addListener(() => {
  console.log("拡張機能が起動しました")
})

// メッセージ受信リスナー
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("メッセージを受信しました:", message)

  if (message.type === CONSTANTS.MESSAGE_TYPES.TEST_API_KEY) {
    // 非同期処理を別関数で実行
    testApiKey().then(sendResponse)
    return true // 非同期レスポンスを示す
  }

  // その他のメッセージ
  sendResponse({ status: "received" })
})

// APIキーテスト関数
async function testApiKey() {
  try {
    console.log("APIキーテストを開始します")
    const { [CONSTANTS.STORAGE_KEYS.USER_API_KEY]: userApiKey } =
      await chrome.storage.local.get([CONSTANTS.STORAGE_KEYS.USER_API_KEY])

    if (!userApiKey) {
      console.log("APIキーが設定されていません")
      return { status: "API_KEY_MISSING" }
    }

    console.log("APIキーをテストします")
    const ai = new GoogleGenAI({ apiKey: userApiKey })
    const result = await ai.models.generateContent({
      model: CONSTANTS.API.MODEL,
      contents: [CONSTANTS.API.TEST_PROMPT]
    })

    console.log("APIキーが有効です")
    return { status: "API_KEY_VALID" }
  } catch (error) {
    console.error("APIキーテストエラー:", error)
    return { status: "API_KEY_INVALID" }
  }
}

// content.tsxにメッセージ送信する関数（フォールバック付き）
async function sendMessageToContent(tab: chrome.tabs.Tab, message: any) {
  if (tab && tab.id) {
    try {
      await chrome.tabs.sendMessage(tab.id, message)
      return true // 送信成功
    } catch (error) {
      console.log("content.tsxへのメッセージ送信に失敗しました:", error)
      return false // 送信失敗
    }
  }
  return false
}

// ポップアップで結果を表示する関数
function showResultInPopup(summary: string, originalText: string) {
  // ポップアップを開いて結果を表示
  chrome.action.openPopup()

  // 結果をストレージに保存（ポップアップで読み取り用）
  chrome.storage.local.set({
    [CONSTANTS.STORAGE_KEYS.POPUP_RESULT]: {
      summary: summary,
      originalText: originalText,
      timestamp: Date.now()
    }
  })
}

// ポップアップでエラーを表示する関数
function showErrorInPopup(errorMessage: string) {
  // ポップアップを開いてエラーを表示
  chrome.action.openPopup()

  // エラーをストレージに保存（ポップアップで読み取り用）
  chrome.storage.local.set({
    [CONSTANTS.STORAGE_KEYS.POPUP_ERROR]: {
      message: errorMessage,
      timestamp: Date.now()
    }
  })
}

// テキストをプレビュー用に短縮する関数
function truncateText(text: string): string {
  return text.length > CONSTANTS.TEXT.MAX_PREVIEW_LENGTH
    ? text.substring(0, CONSTANTS.TEXT.MAX_PREVIEW_LENGTH) +
        CONSTANTS.TEXT.ELLIPSIS
    : text
}

async function summarizeText(text: string, tab: chrome.tabs.Tab) {
  console.log("テキスト要約を開始します")

  // ローディング表示を送信
  await sendMessageToContent(tab, {
    type: CONSTANTS.MESSAGE_TYPES.LOADING,
    summary: "読み込み中...",
    originalText: truncateText(text)
  })

  // 保存済みのAPIキーを取得
  const { [CONSTANTS.STORAGE_KEYS.USER_API_KEY]: userApiKey } =
    await chrome.storage.local.get([CONSTANTS.STORAGE_KEYS.USER_API_KEY])

  if (!userApiKey) {
    // APIキーが設定されていない場合
    const errorSent = await sendMessageToContent(tab, {
      type: CONSTANTS.MESSAGE_TYPES.API_KEY_MISSING,
      message: CONSTANTS.ERROR_MESSAGES.API_KEY_MISSING
    })

    // content.tsxに送れなかった場合はポップアップで表示
    if (!errorSent) {
      showErrorInPopup(CONSTANTS.ERROR_MESSAGES.API_KEY_MISSING)
    }
    return
  }

  console.log("APIキーの状況: 設定済み")

  // 保存済みのAPIキーでGemini APIを呼び出し
  const ai = new GoogleGenAI({ apiKey: userApiKey })

  try {
    console.log("Gemini APIにリクエストを送信中...")

    const prompt = CONSTANTS.API.SUMMARIZE_PROMPT + text

    const result = await ai.models.generateContent({
      model: CONSTANTS.API.MODEL,
      contents: [prompt]
    })
    const summary = result.text

    console.log("要約完了:", summary)
    console.log("=== 要約結果 ===")
    console.log(summary)
    console.log("================")

    // 要約結果の検証
    if (!summary || summary.trim() === "") {
      // 要約結果が空の場合
      const errorSent = await sendMessageToContent(tab, {
        type: CONSTANTS.MESSAGE_TYPES.SUMMARY_EMPTY,
        message: CONSTANTS.ERROR_MESSAGES.SUMMARY_EMPTY
      })

      // content.tsxに送れなかった場合はポップアップで表示
      if (!errorSent) {
        showErrorInPopup(CONSTANTS.ERROR_MESSAGES.SUMMARY_EMPTY)
      }
      return
    }

    // content.tsxに要約結果を送信
    const successSent = await sendMessageToContent(tab, {
      type: CONSTANTS.MESSAGE_TYPES.SUMMARY_COMPLETE,
      summary: summary,
      originalText: truncateText(text)
    })

    // content.tsxに送れなかった場合はポップアップで表示
    if (!successSent) {
      showResultInPopup(summary, truncateText(text))
    }
  } catch (error) {
    console.error("Gemini APIでのエラーです:", error)

    // APIキーが間違っている場合のエラーハンドリング
    let errorMessage = CONSTANTS.ERROR_MESSAGES.API_ERROR
    let messageType = CONSTANTS.MESSAGE_TYPES.SUMMARY_EMPTY

    if (error.message && error.message.includes("API_KEY_INVALID")) {
      errorMessage = CONSTANTS.ERROR_MESSAGES.API_KEY_INVALID
    } else if (error.message && error.message.includes("quota")) {
      errorMessage = CONSTANTS.ERROR_MESSAGES.QUOTA_ERROR
    } else if (error.message && error.message.includes("network")) {
      errorMessage = CONSTANTS.ERROR_MESSAGES.NETWORK_ERROR
    }

    // content.tsxにエラーメッセージを送信
    const errorSent = await sendMessageToContent(tab, {
      type: messageType,
      message: errorMessage
    })

    // content.tsxに送れなかった場合はポップアップで表示
    if (!errorSent) {
      showErrorInPopup(errorMessage)
    }
  }
}
