// background.ts (バックグラウンドでGemini APIと連携)
import { GoogleGenAI } from "@google/genai"

// コンテキストメニューに項目を追加します
chrome.runtime.onInstalled.addListener(() => {
  console.log(
    "拡張機能がインストールされました。コンテキストメニューを作成中..."
  )

  try {
    chrome.contextMenus.create(
      {
        id: "summarizeText",
        title: "Geminiでテキストを要約する",
        contexts: ["selection"]
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

  if (info.menuItemId === "summarizeText" && info.selectionText) {
    console.log(
      "選択されたテキスト:",
      info.selectionText.substring(0, 100) + "..."
    )
    await summarizeText(info.selectionText, tab)
  }
})

// 拡張機能の起動確認
chrome.runtime.onStartup.addListener(() => {
  console.log("拡張機能が起動しました")
})

// メッセージ受信リスナー（デバッグ用）現在は実行されない
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   console.log("メッセージを受信しました:", message)
//   sendResponse({ status: "received" })
// })

async function summarizeText(text: string, tab: chrome.tabs.Tab) {
  console.log("テキスト要約を開始します")

  // 保存済みのAPIキーを取得
  const { userApiKey } = await chrome.storage.local.get(["userApiKey"])

  if (!userApiKey) {
    // APIキーが設定されていない場合
    if (tab && tab.id) {
      try {
        await chrome.tabs.sendMessage(tab.id, {
          type: "API_KEY_MISSING",
          message:
            "APIキーが設定されていません。拡張機能の設定でAPIキーを入力してください。"
        })
      } catch (error) {
        console.log("content.tsxへのメッセージ送信に失敗しました")
      }
    }
    return
  }

  console.log("APIキーの状況: 設定済み")

  // 保存済みのAPIキーでGemini APIを呼び出し
  const ai = new GoogleGenAI({ apiKey: userApiKey })

  try {
    console.log("Gemini APIにリクエストを送信中...")

    const prompt = `以下のテキストを簡潔に要約してください。\n\n${text}`

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
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
      if (tab && tab.id) {
        try {
          await chrome.tabs.sendMessage(tab.id, {
            type: "SUMMARY_EMPTY",
            message:
              "要約結果が取得できませんでした。テキストの内容を確認してください。"
          })
        } catch (error) {
          console.log("content.tsxへのメッセージ送信に失敗しました")
        }
      }
      return
    }

    // content.tsxに要約結果を送信
    if (tab && tab.id) {
      try {
        await chrome.tabs.sendMessage(tab.id, {
          type: "SUMMARY_COMPLETE",
          summary: summary,
          originalText:
            // 100文字を超えた場合は...で省略
            text.substring(0, 100) + (text.length > 100 ? "..." : "")
        })
        console.log("content.tsxに要約結果を送信しました")
      } catch (error) {
        console.log(
          "content.tsxが読み込まれていないか、メッセージ送信に失敗しました"
        )
      }
    }
  } catch (error) {
    console.error("Gemini APIでのエラーです:", error)

    // APIキーが間違っている場合のエラーハンドリング
    let errorMessage = "Gemini APIでエラーが発生しました。"
    let messageType = "SUMMARY_EMPTY"

    if (error.message && error.message.includes("API_KEY_INVALID")) {
      errorMessage = "APIキーが無効です。正しいAPIキーを設定してください。"
      messageType = "SUMMARY_EMPTY"
    } else if (error.message && error.message.includes("quota")) {
      errorMessage =
        "APIの利用制限に達しました。しばらく時間をおいてから再試行してください。"
      messageType = "SUMMARY_EMPTY"
    } else if (error.message && error.message.includes("network")) {
      errorMessage =
        "ネットワークエラーが発生しました。インターネット接続を確認してください。"
      messageType = "SUMMARY_EMPTY"
    }

    // content.tsxにエラーメッセージを送信
    if (tab && tab.id) {
      try {
        await chrome.tabs.sendMessage(tab.id, {
          type: messageType,
          message: errorMessage
        })
        console.log("content.tsxにエラーメッセージを送信しました")
      } catch (sendError) {
        console.log("content.tsxへのエラーメッセージ送信に失敗しました")
      }
    }
  }
}
