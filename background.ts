// background.ts (バックグラウンドでGemini APIと連携)
import { GoogleGenerativeAI } from "@google/generative-ai"

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

// メッセージ受信リスナー（デバッグ用）
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("メッセージを受信しました:", message)
  sendResponse({ status: "received" })
})

async function summarizeText(text: string, tab: chrome.tabs.Tab) {
  console.log("テキスト要約を開始します")

  const API_KEY = process.env.PLASMO_PUBLIC_GEMINI_API_KEY
  console.log("APIキーの状況:", API_KEY ? "設定済み" : "未設定")

  if (!API_KEY) {
    console.error("APIキーが設定されていません。")
    return
  }

  // ① GoogleGenerativeAIクラスのインスタンスを作成
  const genAI = new GoogleGenerativeAI(API_KEY)
  // ② 使用するモデルを指定
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" })

  try {
    console.log("Gemini APIにリクエストを送信中...")

    const prompt = `以下のテキストを簡潔に要約してください。\n\n${text}`

    // ③ モデルにプロンプトを送信し、応答を取得
    const result = await model.generateContent(prompt)
    const response = await result.response
    const summary = response.text()

    console.log("要約完了:", summary)
    console.log("=== 要約結果 ===")
    console.log(summary)
    console.log("================")

    // ④ content.tsxに要約結果を送信
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
    console.error("Gemini APIでのエラーですわ:", error)
  }
}
