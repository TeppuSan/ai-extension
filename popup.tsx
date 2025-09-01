import { useEffect, useState } from "react"

import { CONSTANTS } from "./consts"

function IndexPopup() {
  const [apiKey, setApiKey] = useState("") //初期常態は空文字
  const [isSaved, setIsSaved] = useState(false) //初期常態はfalse
  const [showSettings, setShowSettings] = useState(false) //初期常態はfalse
  const [testResult, setTestResult] = useState<string | null>(null) //初期常態はnull
  const [popupResult, setPopupResult] = useState<{
    summary: string
    originalText: string
  } | null>(null)
  const [popupError, setPopupError] = useState<string | null>(null)

  useEffect(() => {
    // 保存済みのAPIキーを読み込み
    chrome.storage.local.get(
      [CONSTANTS.STORAGE_KEYS.USER_API_KEY],
      (result) => {
        if (result[CONSTANTS.STORAGE_KEYS.USER_API_KEY]) {
          setApiKey(result[CONSTANTS.STORAGE_KEYS.USER_API_KEY])
        }
      }
    )

    // フォールバック結果をチェック
    chrome.storage.local.get(
      [CONSTANTS.STORAGE_KEYS.POPUP_RESULT, CONSTANTS.STORAGE_KEYS.POPUP_ERROR],
      (result) => {
        if (result[CONSTANTS.STORAGE_KEYS.POPUP_RESULT]) {
          setPopupResult(result[CONSTANTS.STORAGE_KEYS.POPUP_RESULT])
          // 表示後はストレージから削除
          chrome.storage.local.remove([CONSTANTS.STORAGE_KEYS.POPUP_RESULT])
        }
        if (result[CONSTANTS.STORAGE_KEYS.POPUP_ERROR]) {
          setPopupError(result[CONSTANTS.STORAGE_KEYS.POPUP_ERROR].message)
          // 表示後はストレージから削除
          chrome.storage.local.remove([CONSTANTS.STORAGE_KEYS.POPUP_ERROR])
        }
      }
    )
  }, [])

  useEffect(() => {
    chrome.action.openPopup()
  }, [])

  const saveApiKey = () => {
    chrome.storage.local.set(
      { [CONSTANTS.STORAGE_KEYS.USER_API_KEY]: apiKey },
      () => {
        setIsSaved(true)

        setTimeout(() => setIsSaved(false), 2000)
      }
    )
  }

  const testApiKey = async () => {
    try {
      const response = await chrome.runtime.sendMessage({
        type: CONSTANTS.MESSAGE_TYPES.TEST_API_KEY
      })
      console.log("APIキーのテスト結果:", response)
      const resStatus = response.status

      if (resStatus === "API_KEY_VALID") {
        setTestResult("success")
      } else if (resStatus === "API_KEY_INVALID") {
        setTestResult("invalid")
      } else if (resStatus === "API_KEY_MISSING") {
        setTestResult("missing")
      }

      setTimeout(() => setTestResult(null), 3000)
    } catch (error) {
      console.error("APIキーテストエラー:", error)
      setTestResult("error")
      setTimeout(() => setTestResult(null), 3000)
    }
  }

  // フォールバック結果表示コンポーネント
  if (popupResult) {
    return (
      <div style={{ width: "400px", padding: "20px" }}>
        <h2>🤖 要約結果</h2>
        <div style={{ marginBottom: "15px" }}>
          <div
            style={{
              fontSize: "12px",
              color: "#ff6b35",
              marginBottom: "8px",
              padding: "8px",
              backgroundColor: "#fff3e0",
              borderRadius: "4px"
            }}>
            💡 このポップアップで結果を表示しています
            <br />
            通常はページ内に表示されますが、一部のページではこちらで表示されます
          </div>
          <div style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>
            元のテキスト:
          </div>
          <div
            style={{ fontSize: "14px", color: "#333", marginBottom: "15px" }}>
            {popupResult.originalText}
          </div>
          <div style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>
            要約結果:
          </div>
          <div style={{ fontSize: "14px", lineHeight: "1.6", color: "#333" }}>
            {popupResult.summary}
          </div>
        </div>
      </div>
    )
  }

  // フォールバックエラー表示コンポーネント
  if (popupError) {
    return (
      <div style={{ width: "400px", padding: "20px" }}>
        <h2>⚠️ エラー</h2>
        <div style={{ marginBottom: "15px" }}>
          <p style={{ color: "red", fontSize: "14px" }}>{popupError}</p>
        </div>
        <div
          style={{
            fontSize: "12px",
            color: "#ff6b35",
            marginBottom: "4px",
            padding: "8px",
            backgroundColor: "#fff3e0",
            borderRadius: "4px"
          }}>
          💡 このポップアップでエラーを表示しています
          <br />
          通常はページ内に表示されますが、一部のページではこちらで表示されます
        </div>
      </div>
    )
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
          onClick={testApiKey}
          style={{
            backgroundColor: "#28a745",
            color: "white",
            padding: "8px 16px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginRight: "10px",
            fontSize: "14px"
          }}>
          テスト
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

        {testResult && (
          <div style={{ marginTop: "10px", fontSize: "14px" }}>
            {testResult === "success" && (
              <p style={{ color: "green" }}>✅ APIキーテストに成功しました</p>
            )}
            {testResult === "invalid" && (
              <p style={{ color: "red" }}>❌ APIキーテストに失敗しました</p>
            )}
            {testResult === "missing" && (
              <p style={{ color: "red" }}>❌ APIキーが設定されていません</p>
            )}
            {testResult === "error" && (
              <p style={{ color: "red" }}>❌ テスト中にエラーが発生しました</p>
            )}
          </div>
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
            <li>
              テストボタンでAPIキーの有効性を確認
              <br />
              (※成功時リクエスト数を1回消費します)
            </li>
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
          <li>要約結果がページ内にポップアップ表示されます</li>
          <li>
            ※ページ内に表示できない場合は、このポップアップで結果を確認できます
          </li>
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
