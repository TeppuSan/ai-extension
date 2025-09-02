/**
 * content.tsx - ページ内UI表示コンポーネント
 *
 * このファイルは、Webページ内に要約結果やエラーメッセージを表示する
 * Chrome拡張機能のコンテンツスクリプトです。
 *
 * 主な機能：
 * - background.ts からのメッセージ受信
 * - 要約結果のページ内表示
 * - エラーメッセージの表示
 * - ローディング状態の表示
 * - ユーザーインタラクションの処理
 */

import { useEffect, useState } from "react"
import { createRoot } from "react-dom/client"

import { CONSTANTS } from "./consts"

/**
 * エラー表示コンポーネント
 *
 * APIキー未設定や要約失敗などのエラーをユーザーに表示するコンポーネント
 * エラーの内容と解決方法を分かりやすく提示する
 *
 * @param errorMessage - 表示するエラーメッセージ
 * @param onClose - エラー表示を閉じる際のコールバック関数
 *
 * 表示内容：
 * - エラーの種類（APIキーエラーなど）
 * - エラーメッセージ
 * - 解決方法の手順
 * - 閉じるボタン
 *
 * スタイル：
 * - 赤色のテーマでエラーであることを強調
 * - 固定位置でページの右上に表示
 * - 高いz-indexで他の要素の上に表示
 */
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

/**
 * ローディング表示コンポーネント
 *
 * 要約処理中であることをユーザーに視覚的に伝えるコンポーネント
 * 処理が進行中であることを示し、ユーザーの待機を促す
 *
 * @param originalText - 要約対象の元テキスト（プレビュー用）
 * @param onClose - ローディング表示を閉じる際のコールバック関数
 *
 * 表示内容：
 * - 処理中であることを示すメッセージ
 * - 元のテキストのプレビュー
 * - アニメーション効果（視覚的なフィードバック）
 * - 閉じるボタン
 *
 * スタイル：
 * - オレンジ色のテーマで処理中であることを表現
 * - 固定位置でページの右上に表示
 * - 高いz-indexで他の要素の上に表示
 */
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

/**
 * 要約結果表示コンポーネント
 *
 * Gemini AI によって生成された要約結果をユーザーに表示するコンポーネント
 * 要約されたテキストと元のテキストを分かりやすく表示する
 *
 * @param summary - 要約されたテキスト
 * @param originalText - 元のテキスト（プレビュー用）
 * @param onClose - 要約結果表示を閉じる際のコールバック関数
 *
 * 表示内容：
 * - 要約されたテキスト（メインコンテンツ）
 * - 元のテキストのプレビュー
 * - コピーボタン（要約結果をクリップボードにコピー）
 * - 閉じるボタン
 *
 * スタイル：
 * - 緑色のテーマで成功・完了を表現
 * - 固定位置でページの右上に表示
 * - 高いz-indexで他の要素の上に表示
 * - スクロール可能なコンテンツエリア
 */
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
/**
 * メインコンテンツスクリプトコンポーネント
 *
 * このコンポーネントは、background.ts からのメッセージを受信し、
 * 適切なUIコンポーネントを表示するメインロジックを管理します。
 *
 * 状態管理：
 * - summaryData: 要約結果のデータ
 * - errorMessage: エラーメッセージ
 * - loadingData: ローディング状態のデータ
 *
 * 処理フロー：
 * 1. background.ts からのメッセージを受信
 * 2. メッセージタイプに応じて状態を更新
 * 3. 状態に基づいて適切なUIコンポーネントを表示
 *
 * 表示優先順位：
 * 1. エラーメッセージ（最優先）
 * 2. ローディング表示
 * 3. 要約結果表示
 * 4. 何も表示しない（初期状態）
 */
function ContentScript() {
  // 要約結果の状態管理
  const [summaryData, setSummaryData] = useState<{
    summary: string
    originalText: string
  } | null>(null)

  // エラーメッセージの状態管理
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // ローディング状態の状態管理
  const [loadingData, setLoadingData] = useState<{
    originalText: string
  } | null>(null)

  /**
   * background.ts からのメッセージを受信するためのuseEffect
   *
   * メッセージタイプに応じて適切な状態を更新し、UIを制御する
   * 各メッセージタイプに対応した処理を実行
   */
  useEffect(() => {
    /**
     * メッセージハンドラー関数
     *
     * @param message - background.ts から受信したメッセージオブジェクト
     *
     * 処理内容：
     * - メッセージタイプを判定
     * - 対応する状態を更新
     * - 他の状態をクリア（表示の重複を防ぐ）
     */
    const handleMessage = (message: any) => {
      console.log("メッセージを受信しました:", message)

      // 要約完了メッセージの処理
      if (message.type === "SUMMARY_COMPLETE") {
        setSummaryData({
          summary: message.summary,
          originalText: message.originalText
        })
        setErrorMessage(null) // エラーメッセージをクリア
        setLoadingData(null) // ローディングデータをクリア
      }
      // APIキー未設定エラーメッセージの処理
      else if (message.type === "API_KEY_MISSING") {
        setErrorMessage(message.message)
        setSummaryData(null) // 要約データをクリア
        setLoadingData(null) // ローディングデータをクリア
      }
      // 要約結果が空のエラーメッセージの処理
      else if (message.type === "SUMMARY_EMPTY") {
        setErrorMessage(message.message)
        setSummaryData(null) // 要約データをクリア
        setLoadingData(null) // ローディングデータをクリア
      }
      // ローディング表示メッセージの処理
      else if (message.type === "loading") {
        setLoadingData({
          originalText: message.originalText
        })
        setErrorMessage(null) // エラーメッセージをクリア
        setSummaryData(null) // 要約データをクリア
      }
    }

    // Chrome拡張機能のメッセージリスナーを登録
    chrome.runtime.onMessage.addListener(handleMessage)

    // クリーンアップ関数：コンポーネントのアンマウント時にリスナーを削除
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage)
    }
  }, [])

  /**
   * 条件付きレンダリング：表示優先順位に基づいてUIを決定
   *
   * 優先順位：
   * 1. エラーメッセージ（最優先）
   * 2. ローディング表示
   * 3. 要約結果表示
   * 4. 何も表示しない（初期状態）
   */

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

  // 要約結果を表示
  return (
    <SummaryResult
      summary={summaryData.summary}
      originalText={summaryData.originalText}
      onClose={() => setSummaryData(null)}
    />
  )
}

/**
 * コンテンツスクリプトの初期化関数
 *
 * この関数は、WebページにReactコンポーネントをマウントし、
 * Chrome拡張機能のUIを表示可能にする初期化処理を行います。
 *
 * 処理内容：
 * 1. 既存のコンテナがあれば削除（重複マウントを防ぐ）
 * 2. 新しいコンテナ要素を作成
 * 3. ページのbodyにコンテナを追加
 * 4. ReactのcreateRootでコンポーネントをマウント
 *
 * 注意点：
 * - ページの読み込み完了後に実行される必要がある
 * - 既存のコンテナを削除することで重複表示を防ぐ
 * - コンテナのIDは一意である必要がある
 */
function initializeContentScript() {
  // 既存のコンテナがあれば削除（重複マウントを防ぐ）
  const existingContainer = document.getElementById("ai-extension-content")
  if (existingContainer) {
    existingContainer.remove()
  }

  // 新しいコンテナ要素を作成
  const container = document.createElement("div")
  container.id = "ai-extension-content"

  // ページのbodyにコンテナを追加
  document.body.appendChild(container)

  // React 18の正しい構文でルートを作成
  const root = createRoot(container)
  root.render(<ContentScript />)
}

/**
 * DOMの準備状態に応じた初期化処理
 *
 * ページの読み込み状態を確認し、適切なタイミングでコンテンツスクリプトを初期化
 *
 * 処理内容：
 * - ページがまだ読み込み中の場合は、DOMContentLoadedイベントを待つ
 * - ページの読み込みが完了している場合は、即座に初期化を実行
 *
 * 注意点：
 * - DOMContentLoadedイベントは、HTMLの解析が完了した時点で発火
 * - 画像やスタイルシートの読み込み完了は待たない
 * - これにより、早期にUIを表示可能にする
 */
if (document.readyState === "loading") {
  // ページがまだ読み込み中の場合は、DOMContentLoadedイベントを待つ
  document.addEventListener("DOMContentLoaded", initializeContentScript)
} else {
  // ページの読み込みが完了している場合は、即座に初期化を実行
  initializeContentScript()
}
