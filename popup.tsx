/**
 * popup.tsx - 拡張機能ポップアップUI
 *
 * このファイルは、Chrome拡張機能のポップアップ画面を管理する
 * Reactコンポーネントです。ユーザーの設定とフォールバック表示を担当します。
 *
 * 主な機能：
 * - APIキーの設定と保存
 * - APIキーのテスト機能
 * - フォールバック結果の表示
 * - エラーメッセージの表示
 * - 設定画面の表示切り替え
 */

import { useEffect, useState } from "react"

import { CONSTANTS } from "./consts"

/**
 * メインポップアップコンポーネント
 *
 * 拡張機能のポップアップ画面全体を管理するコンポーネント
 * ユーザーの設定操作とフォールバック表示を統合的に処理
 *
 * 状態管理：
 * - apiKey: ユーザーが入力したAPIキー
 * - isSaved: APIキーの保存状態
 * - showSettings: 設定画面の表示状態
 * - testResult: APIキーテストの結果
 * - popupResult: フォールバック表示用の要約結果
 * - popupError: フォールバック表示用のエラーメッセージ
 */
function IndexPopup() {
  // APIキーの状態管理（初期状態は空文字）
  const [apiKey, setApiKey] = useState("")

  // APIキーの保存状態管理（初期状態はfalse）
  const [isSaved, setIsSaved] = useState(false)

  // 設定画面の表示状態管理（初期状態はfalse）
  const [showSettings, setShowSettings] = useState(false)

  // APIキーテスト結果の状態管理（初期状態はnull）
  const [testResult, setTestResult] = useState<string | null>(null)

  // フォールバック表示用の要約結果状態管理
  const [popupResult, setPopupResult] = useState<{
    summary: string
    originalText: string
  } | null>(null)

  // フォールバック表示用のエラーメッセージ状態管理
  const [popupError, setPopupError] = useState<string | null>(null)

  /**
   * コンポーネント初期化時のuseEffect
   *
   * ポップアップが開かれた際に、保存済みの設定とフォールバックデータを読み込む
   *
   * 処理内容：
   * 1. 保存済みのAPIキーをローカルストレージから読み込み
   * 2. フォールバック表示用の要約結果をチェック
   * 3. フォールバック表示用のエラーメッセージをチェック
   * 4. 表示後は一時データをストレージから削除
   */
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
    // content.tsx にメッセージ送信が失敗した場合の代替表示用データ
    chrome.storage.local.get(
      [CONSTANTS.STORAGE_KEYS.POPUP_RESULT, CONSTANTS.STORAGE_KEYS.POPUP_ERROR],
      (result) => {
        // 要約結果のフォールバック表示
        if (result[CONSTANTS.STORAGE_KEYS.POPUP_RESULT]) {
          setPopupResult(result[CONSTANTS.STORAGE_KEYS.POPUP_RESULT])
          // 表示後はストレージから削除（一時データのため）
          chrome.storage.local.remove([CONSTANTS.STORAGE_KEYS.POPUP_RESULT])
        }

        // エラーメッセージのフォールバック表示
        if (result[CONSTANTS.STORAGE_KEYS.POPUP_ERROR]) {
          setPopupError(result[CONSTANTS.STORAGE_KEYS.POPUP_ERROR].message)
          // 表示後はストレージから削除（一時データのため）
          chrome.storage.local.remove([CONSTANTS.STORAGE_KEYS.POPUP_ERROR])
        }
      }
    )
  }, [])

  /**
   * ポップアップ表示のuseEffect
   *
   * コンポーネントがマウントされた際にポップアップを開く
   * 注意：この処理は実際には不要な場合が多い（Chromeが自動で開くため）
   */
  useEffect(() => {
    chrome.action.openPopup()
  }, [])

  /**
   * APIキーを保存する関数
   *
   * ユーザーが入力したAPIキーをローカルストレージに保存し、
   * 保存完了のフィードバックを表示する
   *
   * 処理内容：
   * 1. 入力されたAPIキーをローカルストレージに保存
   * 2. 保存完了状態を一時的に表示（2秒間）
   * 3. 2秒後に保存完了状態をリセット
   *
   * 注意点：
   * - APIキーは機密情報のため、ローカルストレージにのみ保存
   * - 外部サーバーには送信されない
   */
  const saveApiKey = () => {
    chrome.storage.local.set(
      { [CONSTANTS.STORAGE_KEYS.USER_API_KEY]: apiKey },
      () => {
        setIsSaved(true)

        // 2秒後に保存完了状態をリセット
        setTimeout(() => setIsSaved(false), 2000)
      }
    )
  }

  /**
   * APIキーの有効性をテストする関数
   *
   * background.ts にAPIキーテスト要求を送信し、
   * 結果に応じてユーザーにフィードバックを提供する
   *
   * 処理内容：
   * 1. background.ts にAPIキーテスト要求を送信
   * 2. レスポンスのステータスに応じて結果を判定
   * 3. テスト結果を3秒間表示
   * 4. エラーが発生した場合はエラー状態を表示
   *
   * テスト結果：
   * - "success": APIキーが有効
   * - "invalid": APIキーが無効
   * - "missing": APIキーが設定されていない
   * - "error": テスト実行中にエラーが発生
   *
   * 注意点：
   * - 非同期処理のため await で待機
   * - テスト結果は3秒後に自動的にクリア
   * - エラーが発生した場合も適切にハンドリング
   */
  const testApiKey = async () => {
    try {
      // background.ts にAPIキーテスト要求を送信
      const response = await chrome.runtime.sendMessage({
        type: CONSTANTS.INTERNAL_MESSAGES.TEST_API_KEY
      })
      console.log("APIキーのテスト結果:", response)
      const resStatus = response.status

      // レスポンスステータスに応じて結果を判定
      if (resStatus === "API_KEY_VALID") {
        setTestResult("success")
      } else if (resStatus === "API_KEY_INVALID") {
        setTestResult("invalid")
      } else if (resStatus === "API_KEY_MISSING") {
        setTestResult("missing")
      }

      // 3秒後にテスト結果をクリア
      setTimeout(() => setTestResult(null), 3000)
    } catch (error) {
      console.error("APIキーテストエラー:", error)
      setTestResult("error")
      // エラー時も3秒後に結果をクリア
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
