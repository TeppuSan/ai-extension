// content.tsx (ページ内で要約結果を表示します)
import { useEffect, useState } from "react"
import { createRoot } from "react-dom/client"

import { CONSTANTS } from "./consts"

// エラー表示コンポーネント
function ErrorDisplay({
  errorMessage,
  onClose
}: {
  errorMessage: string
  onClose: () => void
}) {
  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        width: "400px",
        backgroundColor: "#ffebee",
        border: "2px solid #f44336",
        borderRadius: "12px",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
        zIndex: 10000,
        fontFamily: "Arial, sans-serif",
        overflow: "hidden"
      }}>
      {/* ヘッダー */}
      <div
        style={{
          backgroundColor: "#f44336",
          color: "white",
          padding: "12px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
        <h3 style={{ margin: 0, fontSize: "16px" }}>⚠️ APIキーエラー</h3>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "white",
            fontSize: "20px",
            cursor: "pointer",
            padding: "0",
            width: "24px",
            height: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
          ×
        </button>
      </div>

      {/* エラーメッセージ */}
      <div style={{ padding: "16px" }}>
        <p
          style={{
            margin: 0,
            fontSize: "14px",
            color: "#333",
            lineHeight: "1.5",
            marginBottom: "16px"
          }}>
          {errorMessage}
        </p>

        {/* 解決方法 */}
        <div
          style={{
            backgroundColor: "#fff3e0",
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #ffb74d"
          }}>
          <h4
            style={{
              margin: "0 0 8px 0",
              fontSize: "14px",
              color: "#e65100"
            }}>
            💡 解決方法:
          </h4>
          <ol
            style={{
              margin: "0",
              paddingLeft: "20px",
              fontSize: "13px",
              color: "#333"
            }}>
            <li>拡張機能のアイコンをクリック</li>
            <li>「🔧 APIキー設定」をクリック</li>
            <li>Gemini APIキーを入力して保存</li>
            <li>再度テキストを選択して右クリック</li>
          </ol>
        </div>
      </div>

      {/* フッター */}
      <div
        style={{
          padding: "12px 16px",
          borderTop: "1px solid #ffcdd2",
          backgroundColor: "#fce4ec",
          fontSize: "12px",
          color: "#c2185b",
          textAlign: "center"
        }}>
        AI Extension - エラー情報
      </div>
    </div>
  )
}

// ローディング表示コンポーネント
function LoadingDisplay({
  originalText,
  onClose
}: {
  originalText: string
  onClose: () => void
}) {
  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        width: "400px",
        backgroundColor: "white",
        border: "2px solid #ffa726",
        borderRadius: "12px",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
        zIndex: 10000,
        fontFamily: "Arial, sans-serif",
        overflow: "hidden"
      }}>
      {/* ヘッダー */}
      <div
        style={{
          backgroundColor: "#ffa726",
          color: "white",
          padding: "12px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
        <h3 style={{ margin: 0, fontSize: "16px" }}>⏳ 要約処理中...</h3>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "white",
            fontSize: "20px",
            cursor: "pointer",
            padding: "0",
            width: "24px",
            height: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
          ×
        </button>
      </div>

      {/* 元のテキスト */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #eee" }}>
        <div style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>
          元のテキスト:
        </div>
        <div style={{ fontSize: "14px", color: "#333" }}>{originalText}</div>
      </div>

      {/* ローディングメッセージ */}
      <div style={{ padding: "16px", textAlign: "center" }}>
        <div
          style={{ fontSize: "16px", color: "#ffa726", marginBottom: "8px" }}>
          🤖 Gemini AIが要約中...
        </div>
        <div style={{ fontSize: "14px", color: "#666" }}>
          しばらくお待ちください
        </div>
      </div>

      {/* フッター */}
      <div
        style={{
          padding: "12px 16px",
          borderTop: "1px solid #eee",
          backgroundColor: "#fff3e0",
          fontSize: "12px",
          color: "#e65100",
          textAlign: "center"
        }}>
        AI Extension - 処理中
      </div>
    </div>
  )
}

// 要約結果表示コンポーネント
function SummaryResult({
  summary,
  originalText,
  onClose
}: {
  summary: string
  originalText: string
  onClose: () => void
}) {
  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        width: "400px",
        maxHeight: "500px",
        backgroundColor: "white",
        border: "2px solid #007AFF",
        borderRadius: "12px",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
        zIndex: 10000,
        fontFamily: "Arial, sans-serif",
        overflow: "hidden"
      }}>
      {/* ヘッダー */}
      <div
        style={{
          backgroundColor: "#007AFF",
          color: "white",
          padding: "12px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
        <h3 style={{ margin: 0, fontSize: "16px" }}>🤖 Gemini要約結果</h3>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "white",
            fontSize: "20px",
            cursor: "pointer",
            padding: "0",
            width: "24px",
            height: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
          ×
        </button>
      </div>

      {/* 元のテキスト */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #eee" }}>
        <div style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>
          元のテキスト:
        </div>
        <div style={{ fontSize: "14px", color: "#333" }}>{originalText}</div>
      </div>

      {/* 要約結果 */}
      <div style={{ padding: "16px", maxHeight: "300px", overflowY: "auto" }}>
        <div style={{ fontSize: "14px", lineHeight: "1.6", color: "#333" }}>
          {summary}
        </div>
      </div>

      {/* フッター */}
      <div
        style={{
          padding: "12px 16px",
          borderTop: "1px solid #eee",
          backgroundColor: "#f8f9fa",
          fontSize: "12px",
          color: "#666",
          textAlign: "center"
        }}>
        AI Extension - Gemini要約
      </div>
    </div>
  )
}

// メインのcontent script
function ContentScript() {
  const [summaryData, setSummaryData] = useState<{
    summary: string
    originalText: string
  } | null>(null)

  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [loadingData, setLoadingData] = useState<{
    originalText: string
  } | null>(null)

  useEffect(() => {
    const handleMessage = (message: any) => {
      console.log("メッセージを受信しました:", message)

      if (message.type === CONSTANTS.MESSAGE_TYPES.SUMMARY_COMPLETE) {
        setSummaryData({
          summary: message.summary,
          originalText: message.originalText
        })
        setErrorMessage(null) // エラーメッセージをクリア
        setLoadingData(null) // ローディングデータをクリア
      } else if (message.type === CONSTANTS.MESSAGE_TYPES.API_KEY_MISSING) {
        setErrorMessage(message.message)
        setSummaryData(null) // 要約データをクリア
        setLoadingData(null) // ローディングデータをクリア
      } else if (message.type === CONSTANTS.MESSAGE_TYPES.SUMMARY_EMPTY) {
        setErrorMessage(message.message)
        setSummaryData(null) // 要約データをクリア
        setLoadingData(null) // ローディングデータをクリア
      } else if (message.type === CONSTANTS.MESSAGE_TYPES.LOADING) {
        setLoadingData({
          originalText: message.originalText
        })
        setErrorMessage(null) // エラーメッセージをクリア
        setSummaryData(null) // 要約データをクリア
      }
    }

    chrome.runtime.onMessage.addListener(handleMessage)

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage)
    }
  }, [])

  // エラーメッセージがある場合はエラー表示を優先
  if (errorMessage) {
    return (
      <ErrorDisplay
        errorMessage={errorMessage}
        onClose={() => setErrorMessage(null)}
      />
    )
  }

  // ローディング中の場合
  if (loadingData) {
    return (
      <LoadingDisplay
        originalText={loadingData.originalText}
        onClose={() => setLoadingData(null)}
      />
    )
  }

  // 要約データがない場合は何も表示しない
  if (!summaryData) return null

  return (
    <SummaryResult
      summary={summaryData.summary}
      originalText={summaryData.originalText}
      onClose={() => setSummaryData(null)}
    />
  )
}

// DOMにマウント
function initializeContentScript() {
  // 既存のコンテナがあれば削除
  const existingContainer = document.getElementById("ai-extension-content")
  if (existingContainer) {
    existingContainer.remove()
  }

  const container = document.createElement("div")
  container.id = "ai-extension-content"
  document.body.appendChild(container)

  // React 18の正しい構文でルートを作成
  const root = createRoot(container)
  root.render(<ContentScript />)
}

// DOMの準備が完了してから初期化
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeContentScript)
} else {
  initializeContentScript()
}
