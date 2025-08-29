import { useEffect, useState } from "react"

function IndexPopup() {
  const [apiKey, setApiKey] = useState("") //初期常態は空文字
  const [isSaved, setIsSaved] = useState(false) //初期常態はfalse
  const [showSettings, setShowSettings] = useState(false) //初期常態はfalse

  useEffect(() => {
    // 保存済みのAPIキーを読み込み
    chrome.storage.local.get(["userApiKey"], (result) => {
      if (result.userApiKey) {
        setApiKey(result.userApiKey)
      }
    })
  }, [])

  const saveApiKey = () => {
    chrome.storage.local.set({ userApiKey: apiKey }, () => {
      setIsSaved(true)

      setTimeout(() => setIsSaved(false), 2000)
    })
  }

  if (showSettings) {
    return (
      <div style={{ width: "400px", padding: "20px" }}>
        <h2>🔧 APIキー設定</h2>

        <div style={{ marginBottom: "15px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold"
            }}>
            Gemini APIキー:
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="APIキーを入力"
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "14px"
            }}
          />
        </div>

        <button
          onClick={saveApiKey}
          style={{
            backgroundColor: "#007AFF",
            color: "white",
            padding: "8px 16px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginRight: "10px",
            fontSize: "14px"
          }}>
          保存
        </button>

        <button
          onClick={() => setShowSettings(false)}
          style={{
            backgroundColor: "#666",
            color: "white",
            padding: "8px 16px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px"
          }}>
          戻る
        </button>

        {isSaved && (
          <p style={{ color: "green", marginTop: "10px", fontSize: "14px" }}>
            ✅ APIキーが保存されました
          </p>
        )}

        <div style={{ marginTop: "20px", fontSize: "12px", color: "#666" }}>
          <h4>💡 設定手順:</h4>
          <ol style={{ marginLeft: "20px" }}>
            <li>
              <a href="https://aistudio.google.com/" target="_blank">
                Google AI Studio
              </a>
              でAPIキーを取得
            </li>
            <li>上記の入力欄にAPIキーを入力</li>
            <li>保存ボタンをクリック</li>
            <li>戻るボタンでメイン画面に戻る</li>
          </ol>
        </div>
      </div>
    )
  }

  return (
    <div style={{ width: "400px", padding: "20px" }}>
      <h2>🤖 サクッとAI要約</h2>

      <div style={{ marginBottom: "20px" }}>
        <p>
          📝 <strong>使用方法:</strong>
        </p>
        <ol style={{ marginLeft: "20px" }}>
          <li>ウェブページでテキストを選択</li>
          <li>右クリック → 「Geminiでテキストを要約する」</li>
          <li>要約結果がページ内に表示されます</li>
        </ol>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <p>
          ⚠️ <strong>注意:</strong>
        </p>
        <ul style={{ marginLeft: "20px" }}>
          <li>初回使用前にAPIキーの設定が必要です</li>
          <li>
            <a href="https://aistudio.google.com/" target="_blank">
              Google AI Studio
            </a>
            でAPIキーを取得してください
          </li>
        </ul>
      </div>

      <button
        onClick={() => setShowSettings(true)}
        style={{
          backgroundColor: "#007AFF",
          color: "white",
          padding: "10px 20px",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          width: "100%",
          fontSize: "14px"
        }}>
        🔧 APIキー設定
      </button>

      <div style={{ marginTop: "20px", fontSize: "12px", color: "#666" }}>
        <p>✅ 設定が完了すれば、すぐに使用できます！</p>
      </div>
    </div>
  )
}

export default IndexPopup
