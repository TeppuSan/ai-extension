import { useState } from "react"

function IndexPopup() {
  return (
    <div
      style={{
        width: "400px",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f8f9fa"
      }}>
      {/* ヘッダー */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <h1
          style={{
            color: "#007AFF",
            fontSize: "24px",
            margin: "0 0 10px 0"
          }}>
          🤖 AI Extension
        </h1>
        <p
          style={{
            color: "#666",
            fontSize: "14px",
            margin: "0"
          }}>
          Gemini AIによるテキスト要約
        </p>
      </div>

      {/* 使い方の手順 */}
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
        <h2
          style={{
            color: "#333",
            fontSize: "18px",
            margin: "0 0 15px 0"
          }}>
          📖 使い方
        </h2>

        <div style={{ marginBottom: "15px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "10px"
            }}>
            <span
              style={{
                backgroundColor: "#007AFF",
                color: "white",
                borderRadius: "50%",
                width: "24px",
                height: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                marginRight: "10px"
              }}>
              1
            </span>
            <span style={{ fontSize: "14px", color: "#333" }}>
              要約したいテキストを選択
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "10px"
            }}>
            <span
              style={{
                backgroundColor: "#007AFF",
                color: "white",
                borderRadius: "50%",
                width: "24px",
                height: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                marginRight: "10px"
              }}>
              2
            </span>
            <span style={{ fontSize: "14px", color: "#333" }}>
              右クリックして「Geminiでテキストを要約する」をクリック
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center"
            }}>
            <span
              style={{
                backgroundColor: "#007AFF",
                color: "white",
                borderRadius: "50%",
                width: "24px",
                height: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                marginRight: "10px"
              }}>
              3
            </span>
            <span style={{ fontSize: "14px", color: "#333" }}>
              ページ内に要約結果が表示されます
            </span>
          </div>
        </div>
      </div>

      {/* 注意事項 */}
      <div
        style={{
          backgroundColor: "#fff3cd",
          border: "1px solid #ffeaa7",
          borderRadius: "8px",
          padding: "15px",
          marginTop: "20px"
        }}>
        <h3
          style={{
            color: "#856404",
            fontSize: "14px",
            margin: "0 0 8px 0"
          }}>
          ⚠️ 注意事項
        </h3>
        <p
          style={{
            color: "#856404",
            fontSize: "12px",
            margin: "0",
            lineHeight: "1.4"
          }}>
          • Gemini APIキーが設定されている必要があります
          <br />
          • インターネット接続が必要です
          <br />• 長いテキストは処理に時間がかかる場合があります
        </p>
      </div>

      {/* フッター */}
      <div
        style={{
          textAlign: "center",
          marginTop: "20px",
          paddingTop: "15px",
          borderTop: "1px solid #eee"
        }}>
        <p
          style={{
            color: "#999",
            fontSize: "11px",
            margin: "0"
          }}>
          AI Extension v0.0.1
        </p>
      </div>
    </div>
  )
}

export default IndexPopup
