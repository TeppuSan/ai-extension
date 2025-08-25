// content.tsx (ページ内で要約結果を表示します)
import { useEffect, useState } from "react"
import { createRoot } from "react-dom/client"

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

  useEffect(() => {
    // background.tsからのメッセージを受信
    const handleMessage = (message: any) => {
      if (message.type === "SUMMARY_COMPLETE") {
        setSummaryData({
          summary: message.summary,
          originalText: message.originalText
        })
      }
    }

    // メッセージリスナーを登録
    chrome.runtime.onMessage.addListener(handleMessage)

    // クリーンアップ
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage)
    }
  }, [])

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
const container = document.createElement("div")
container.id = "ai-extension-content"
document.body.appendChild(container)

const root = createRoot(container)
root.render(<ContentScript />)
