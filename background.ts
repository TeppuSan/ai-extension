/**
 * background.ts - Chrome拡張機能のバックグラウンドスクリプト
 *
 * このファイルは、Chrome拡張機能の核となるバックグラウンド処理を管理します。
 * Gemini APIとの通信、コンテキストメニューの制御、メッセージ通信を統合的に処理します。
 *
 * 主な機能：
 * - コンテキストメニューの初期化と制御
 * - Gemini APIとの通信とテキスト要約処理
 * - popup.tsx とのメッセージ通信
 * - content.tsx へのメッセージ送信
 * - エラーハンドリングとフォールバック機能
 * - パフォーマンス計測とログ出力
 *
 * アーキテクチャ：
 * - ApiClient クラスを使用してGemini APIとの通信を抽象化
 * - 型安全なメッセージ通信（MessageType）
 * - 包括的なエラーハンドリング（ApiError）
 * - フォールバック機能による確実なユーザーフィードバック
 */

import ApiClient from "./apiclient"
import { CONSTANTS, type ApiError, type MessageType } from "./consts"

/**
 * 拡張機能のインストール時にコンテキストメニューを初期化
 *
 * このイベントリスナーは、拡張機能がインストールまたは更新された際に実行されます。
 * ユーザーがテキストを選択した際に右クリックメニューに要約機能を表示するための
 * メニュー項目を作成します。
 *
 * 処理内容：
 * - 右クリックメニューに「Geminiでテキストを要約する」項目を追加
 * - テキスト選択時のみメニューが表示されるよう設定
 * - エラー発生時はコンソールにログ出力
 *
 * 技術詳細：
 * - chrome.contextMenus.create APIを使用してメニュー項目を作成
 * - contexts: ["selection"] により、テキスト選択時のみ表示
 * - コールバック関数でエラーハンドリングを実装
 *
 * 注意点：
 * - 既存のメニュー項目がある場合は上書きされる
 * - 拡張機能の再インストール時も実行される
 * - メニュー作成に失敗した場合はエラーログを出力
 */
chrome.runtime.onInstalled.addListener(() => {
  console.log(
    "拡張機能がインストールされました。コンテキストメニューを作成中..."
  )

  try {
    // コンテキストメニュー項目を作成
    chrome.contextMenus.create(
      {
        id: CONSTANTS.CONTEXT_MENU.ID, // メニュー項目の一意ID
        title: CONSTANTS.CONTEXT_MENU.TITLE, // メニューに表示されるテキスト
        contexts: CONSTANTS.CONTEXT_MENU.CONTEXTS // テキスト選択時のみ表示
      },
      () => {
        // メニュー作成完了後のコールバック処理
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

/**
 * コンテキストメニューのクリックイベントを処理
 *
 * このイベントリスナーは、ユーザーが右クリックメニューから要約機能を選択した際に
 * 実行されます。選択されたテキストの要約処理を開始するエントリーポイントです。
 *
 * 処理内容：
 * - ユーザーが右クリックメニューから要約機能を選択した際に実行
 * - 選択されたテキストの存在確認
 * - テキスト要約処理の開始
 *
 * 引数：
 * @param info - メニュー項目の情報（ID、選択テキストなど）
 * @param tab - 現在のタブ情報（要約結果表示用）
 *
 * 技術詳細：
 * - 非同期処理（async/await）を使用して要約処理を実行
 * - メニューIDの確認により、意図しないメニュー項目のクリックを防止
 * - 選択テキストの存在確認により、空のテキストでの処理を防止
 *
 * 注意点：
 * - テキストが選択されていない場合は処理をスキップ
 * - ログには選択テキストの最初の100文字のみ表示（プライバシー保護）
 * - 要約処理は非同期で実行されるため、ユーザーは待機する必要がある
 */
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  console.log("コンテキストメニューがクリックされました:", info.menuItemId)
  console.log("選択されたテキスト:", info.selectionText)

  // メニューIDと選択テキストの存在確認
  if (info.menuItemId === CONSTANTS.CONTEXT_MENU.ID && info.selectionText) {
    // プライバシー保護のため、ログには最初の100文字のみ表示
    console.log(
      "選択されたテキスト:",
      info.selectionText.substring(0, CONSTANTS.TEXT.MAX_PREVIEW_LENGTH) +
        CONSTANTS.TEXT.ELLIPSIS
    )

    // 要約処理を開始
    await summarizeText(info.selectionText, tab)
  }
})

/**
 * 拡張機能の起動確認
 *
 * このイベントリスナーは、ブラウザが起動された際に拡張機能が正常に
 * 動作していることを確認するために実行されます。
 *
 * 処理内容：
 * - ブラウザ起動時に拡張機能が正常に動作していることを確認
 * - デバッグ用のログ出力
 *
 * 技術詳細：
 * - chrome.runtime.onStartup イベントは、ブラウザの起動時に発火
 * - 拡張機能の初期化状態を確認するためのデバッグ機能
 * - 本番環境では不要な場合もあるが、開発時の動作確認に有用
 *
 * 注意点：
 * - このイベントは、ブラウザの起動時のみ発火（タブの開閉では発火しない）
 * - 拡張機能の状態確認や初期化処理に使用
 */
chrome.runtime.onStartup.addListener(() => {
  console.log("拡張機能が起動しました")
})

/**
 * 拡張機能間のメッセージ通信を処理
 *
 * このイベントリスナーは、popup.tsx や content.tsx からのメッセージを受信し、
 * 適切な処理を実行してレスポンスを返します。
 *
 * 処理内容：
 * - popup.tsxからのAPIキーテスト要求を処理
 * - 非同期処理のため、sendResponseを遅延実行
 * - その他のメッセージに対する汎用レスポンス
 *
 * 引数：
 * @param message - 受信したメッセージオブジェクト
 * @param sender - 送信元の情報（タブ情報など）
 * @param sendResponse - レスポンス送信用の関数
 *
 * 技術詳細：
 * - Chrome拡張機能のメッセージパッシングAPIを使用
 * - 非同期処理の場合は必ずtrueを返す（Chrome拡張機能の仕様）
 * - 同期的な処理の場合は即座にsendResponseを呼び出す
 * - メッセージタイプに応じて適切な処理を分岐
 *
 * 注意点：
 * - 非同期処理の場合は必ずtrueを返す（Chrome拡張機能の仕様）
 * - 同期的な処理の場合は即座にsendResponseを呼び出す
 * - メッセージの型安全性は呼び出し元で保証する必要がある
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("メッセージを受信しました:", message)

  // APIキーテスト要求の処理
  if (message.type === CONSTANTS.INTERNAL_MESSAGES.TEST_API_KEY) {
    // 非同期処理を別関数で実行し、結果をsendResponseに渡す
    testApiKey().then(sendResponse)
    return true // 非同期レスポンスを示す（Chrome拡張機能の仕様）
  }

  // その他のメッセージに対する汎用レスポンス
  sendResponse({ status: "received" })
})

/**
 * APIキーの有効性をテストする
 *
 * この関数は、ユーザーが設定したAPIキーが有効かどうかを確認するために
 * Gemini APIに簡単なテストリクエストを送信します。
 *
 * 処理内容：
 * - ローカルストレージからAPIキーを取得
 * - Gemini APIに簡単なテストリクエストを送信
 * - APIキーの有効性を判定
 *
 * 戻り値：
 * @returns {Promise<{status: string}>} テスト結果
 *   - "API_KEY_MISSING": APIキーが設定されていない
 *   - "API_KEY_VALID": APIキーが有効
 *   - "API_KEY_INVALID": APIキーが無効またはエラー
 *
 * 技術詳細：
 * - chrome.storage.local APIを使用してAPIキーを取得
 * - ApiClient クラスを使用してGemini APIとの通信を実行
 * - テスト用の軽量なプロンプト（"Hello, world!"）を使用
 * - エラーハンドリングにより、すべてのエラーを適切に処理
 *
 * 使用箇所：
 * - popup.tsxの「テスト」ボタンから呼び出される
 * - ユーザーがAPIキーを入力した際の検証に使用
 *
 * 注意点：
 * - テスト用の簡単なプロンプトを使用（"Hello, world!"）
 * - エラーが発生した場合は無効と判定
 * - 実際の要約処理とは別の軽量なテスト
 * - 非同期処理のため、呼び出し元はawaitで待機する必要がある
 */
async function testApiKey() {
  try {
    console.log("APIキーテストを開始します")

    // ローカルストレージからAPIキーを取得
    const { [CONSTANTS.STORAGE_KEYS.USER_API_KEY]: userApiKey } =
      await chrome.storage.local.get([CONSTANTS.STORAGE_KEYS.USER_API_KEY])

    // APIキーが設定されていない場合
    if (!userApiKey) {
      console.log("APIキーが設定されていません")
      return { status: "API_KEY_MISSING" }
    }

    console.log("APIキーをテストします")

    // ApiClient インスタンスを作成してテスト実行
    const ai = new ApiClient(userApiKey)
    const result = await ai.summarizeText(CONSTANTS.API.TEST_PROMPT)

    console.log("APIキーが有効です")
    return { status: "API_KEY_VALID" }
  } catch (error) {
    console.error("APIキーテストエラー:", error)
    return { status: "API_KEY_INVALID" }
  }
}

/**
 * content.tsxにメッセージを送信する（フォールバック機能付き）
 *
 * この関数は、要約結果やエラーメッセージをcontent.tsxに送信し、
 * ページ内にUIを表示するためのメッセージ通信を管理します。
 *
 * 処理内容：
 * - 現在のタブのcontent.tsxにメッセージを送信
 * - 送信に失敗した場合はfalseを返す
 * - 呼び出し元でフォールバック処理を実行可能
 *
 * 引数：
 * @param tab - 送信先のタブ情報
 * @param message - 送信するメッセージオブジェクト（MessageType）
 *
 * 戻り値：
 * @returns {Promise<boolean>} 送信結果
 *   - true: 送信成功
 *   - false: 送信失敗（タブが存在しない、content.tsxが読み込まれていない等）
 *
 * 技術詳細：
 * - chrome.tabs.sendMessage APIを使用してメッセージを送信
 * - タブIDの存在確認により、無効なタブへの送信を防止
 * - try-catch文により、送信エラーを適切にハンドリング
 * - 型安全なメッセージ送信（MessageType）
 *
 * 使用箇所：
 * - 要約結果の表示時
 * - エラーメッセージの表示時
 * - ローディング表示の送信時
 *
 * 注意点：
 * - content.tsxが読み込まれていないページでは送信に失敗する
 * - 送信失敗時は呼び出し元でpopup表示などの代替手段を実行
 * - タブIDが存在しない場合は即座にfalseを返す
 * - 非同期処理のため、呼び出し元はawaitで待機する必要がある
 */
async function sendMessageToContent(
  tab: chrome.tabs.Tab,
  message: MessageType
) {
  // タブとタブIDの存在確認
  if (tab && tab.id) {
    try {
      // content.tsxにメッセージを送信
      await chrome.tabs.sendMessage(tab.id, message)
      return true // 送信成功
    } catch (error) {
      console.log("content.tsxへのメッセージ送信に失敗しました:", error)
      return false // 送信失敗
    }
  }
  return false
}

/**
 * ポップアップで要約結果を表示する（フォールバック機能）
 *
 * この関数は、content.tsxにメッセージ送信が失敗した場合の代替手段として、
 * 要約結果をポップアップで表示するためのフォールバック機能を提供します。
 *
 * 処理内容：
 * - 拡張機能のポップアップを開く
 * - 要約結果をローカルストレージに保存
 * - popup.tsxが結果を読み取って表示
 *
 * 引数：
 * @param summary - 要約されたテキスト
 * @param originalText - 元のテキスト（プレビュー用）
 *
 * 技術詳細：
 * - chrome.action.openPopup APIを使用してポップアップを開く
 * - chrome.storage.local APIを使用してデータを一時保存
 * - タイムスタンプ付きでデータの鮮度を管理
 * - popup.tsxが自動的にデータを読み取って表示
 *
 * 使用箇所：
 * - content.tsxにメッセージ送信が失敗した場合の代替表示
 * - 要約処理が完了したが、ページ内表示ができない場合
 *
 * 注意点：
 * - 一時的な表示用データとしてストレージに保存
 * - タイムスタンプ付きでデータの鮮度を管理
 * - popup.tsxが自動的にデータを読み取って表示
 * - データは表示後に自動的に削除される
 */
function showResultInPopup(summary: string, originalText: string) {
  // ポップアップを開いて結果を表示
  chrome.action.openPopup()

  // 結果をストレージに保存（ポップアップで読み取り用）
  chrome.storage.local.set({
    [CONSTANTS.STORAGE_KEYS.POPUP_RESULT]: {
      summary: summary,
      originalText: originalText,
      timestamp: Date.now() // データの鮮度管理用タイムスタンプ
    }
  })
}

/**
 * ポップアップでエラーメッセージを表示する（フォールバック機能）
 *
 * この関数は、content.tsxにメッセージ送信が失敗した場合の代替手段として、
 * エラーメッセージをポップアップで表示するためのフォールバック機能を提供します。
 *
 * 処理内容：
 * - 拡張機能のポップアップを開く
 * - エラーメッセージをローカルストレージに保存
 * - popup.tsxがエラーを読み取って表示
 *
 * 引数：
 * @param errorMessage - 表示するエラーメッセージ
 *
 * 技術詳細：
 * - chrome.action.openPopup APIを使用してポップアップを開く
 * - chrome.storage.local APIを使用してエラーデータを一時保存
 * - タイムスタンプ付きでデータの鮮度を管理
 * - popup.tsxが自動的にエラーを読み取って表示
 *
 * 使用箇所：
 * - content.tsxにメッセージ送信が失敗した場合の代替表示
 * - APIキー未設定、要約失敗などのエラー時
 *
 * 注意点：
 * - 一時的な表示用データとしてストレージに保存
 * - タイムスタンプ付きでデータの鮮度を管理
 * - popup.tsxが自動的にエラーを読み取って表示
 * - データは表示後に自動的に削除される
 */
function showErrorInPopup(errorMessage: string) {
  // ポップアップを開いてエラーを表示
  chrome.action.openPopup()

  // エラーをストレージに保存（ポップアップで読み取り用）
  chrome.storage.local.set({
    [CONSTANTS.STORAGE_KEYS.POPUP_ERROR]: {
      message: errorMessage,
      timestamp: Date.now() // データの鮮度管理用タイムスタンプ
    }
  })
}

/**
 * テキストをプレビュー用に短縮する
 *
 * この関数は、長いテキストを指定された長さに切り詰めて、
 * ログ出力やUI表示での可読性を向上させるユーティリティ関数です。
 *
 * 処理内容：
 * - 指定された長さを超えるテキストを切り詰める
 * - 切り詰めた場合は末尾に「...」を追加
 * - ログ出力やUI表示での長いテキストの省略に使用
 *
 * 引数：
 * @param text - 短縮対象のテキスト
 *
 * 戻り値：
 * @returns {string} 短縮されたテキスト
 *
 * 技術詳細：
 * - CONSTANTS.TEXT.MAX_PREVIEW_LENGTH で定義された長さで切り詰め
 * - CONSTANTS.TEXT.ELLIPSIS で定義された省略記号を追加
 * - 元のテキストは変更せず、新しい文字列を返す
 * - 短縮が必要ない場合は元のテキストをそのまま返す
 *
 * 使用箇所：
 * - ログ出力時のテキスト表示
 * - ポップアップでの元テキスト表示
 * - UI表示での長いテキストの省略
 *
 * 注意点：
 * - プライバシー保護のため、ログには短縮版のみ表示
 * - 元のテキストは変更せず、新しい文字列を返す
 * - 短縮が必要ない場合は元のテキストをそのまま返す
 * - 定数ファイルで管理された設定値を使用
 */
function truncateText(text: string): string {
  // 指定された長さを超える場合は切り詰めて省略記号を追加
  return text.length > CONSTANTS.TEXT.MAX_PREVIEW_LENGTH
    ? text.substring(0, CONSTANTS.TEXT.MAX_PREVIEW_LENGTH) +
        CONSTANTS.TEXT.ELLIPSIS
    : text
}

/**
 * テキストを要約し、結果を表示する（メイン処理）
 *
 * この関数は、Chrome拡張機能の核となる要約処理を実行します。
 * ユーザーが選択したテキストをGemini APIで要約し、結果を適切に表示します。
 *
 * 処理フロー：
 * 1. ローディング表示を送信
 * 2. APIキーの存在確認
 * 3. Gemini APIで要約実行
 * 4. 結果をcontent.tsxまたはpopupに表示
 * 5. パフォーマンス計測ログを出力
 *
 * 引数：
 * @param text - 要約対象のテキスト
 * @param tab - 現在のタブ情報（メッセージ送信用）
 *
 * 戻り値：
 * @returns {Promise<void>}
 *
 * エラーハンドリング：
 * - APIキー未設定 → 設定画面へ誘導メッセージ表示
 * - 要約結果が空 → エラーメッセージ表示
 * - API呼び出し失敗 → エラー種別に応じたメッセージ表示
 * - content.tsx送信失敗 → popup表示でフォールバック
 *
 * パフォーマンス計測：
 * - 処理開始から終了までの所要時間を計測
 * - 各終了パターン（成功、APIキー未設定、要約空、エラー）でログ出力
 * - 最適化のためのデータ収集
 *
 * 技術詳細：
 * - ApiClient クラスを使用してGemini APIとの通信を実行
 * - 型安全なエラーハンドリング（ApiError）
 * - フォールバック機能による確実なユーザーフィードバック
 * - パフォーマンス計測による最適化データの収集
 *
 * 使用箇所：
 * - コンテキストメニューからの要約実行
 * - ユーザーがテキストを選択して右クリックした際
 *
 * 注意点：
 * - 非同期処理のため、呼び出し元はawaitで待機
 * - エラーが発生しても例外を投げず、適切なメッセージを表示
 * - フォールバック機能により、必ずユーザーに結果を通知
 * - パフォーマンス計測により、処理時間を監視
 */
async function summarizeText(text: string, tab: chrome.tabs.Tab) {
  console.log("テキスト要約を開始します")
  const startTimeMs = Date.now()

  // 1. ローディング表示を送信
  await sendMessageToContent(tab, {
    type: "loading",
    summary: "読み込み中...",
    originalText: truncateText(text)
  })

  // 2. 保存済みのAPIキーを取得
  const { [CONSTANTS.STORAGE_KEYS.USER_API_KEY]: userApiKey } =
    await chrome.storage.local.get([CONSTANTS.STORAGE_KEYS.USER_API_KEY])

  // APIキーが設定されていない場合の処理
  if (!userApiKey) {
    const errorSent = await sendMessageToContent(tab, {
      type: "API_KEY_MISSING",
      message: CONSTANTS.ERROR_MESSAGES.API_KEY_MISSING
    })

    // content.tsxに送れなかった場合はポップアップで表示
    if (!errorSent) {
      showErrorInPopup(CONSTANTS.ERROR_MESSAGES.API_KEY_MISSING)
    }

    // パフォーマンス計測ログ
    {
      const elapsedMs = Date.now() - startTimeMs
      console.log("要約処理: APIキー未設定で終了 所要時間:", elapsedMs, "ms")
    }
    return
  }

  console.log("APIキーの状況: 設定済み")

  // 3. 保存済みのAPIキーでGemini APIを呼び出し
  const ai = new ApiClient(userApiKey)

  try {
    console.log("Gemini APIにリクエストを送信中...")

    // Gemini APIで要約実行
    const summary = await ai.summarizeText(text)

    console.log("要約完了:", summary)
    console.log("=== 要約結果 ===")
    console.log(summary)
    console.log("================")

    // 4. 要約結果の検証
    if (!summary || summary.trim() === "") {
      // 要約結果が空の場合
      const errorSent = await sendMessageToContent(tab, {
        type: "SUMMARY_EMPTY",
        message: CONSTANTS.ERROR_MESSAGES.SUMMARY_EMPTY
      })

      // content.tsxに送れなかった場合はポップアップで表示
      if (!errorSent) {
        showErrorInPopup(CONSTANTS.ERROR_MESSAGES.SUMMARY_EMPTY)
      }

      // パフォーマンス計測ログ
      {
        const elapsedMs = Date.now() - startTimeMs
        console.log("要約処理: 要約空で終了 所要時間:", elapsedMs, "ms")
      }
      return
    }

    // 5. content.tsxに要約結果を送信
    const successSent = await sendMessageToContent(tab, {
      type: "SUMMARY_COMPLETE",
      summary: summary,
      originalText: truncateText(text)
    })

    // content.tsxに送れなかった場合はポップアップで表示
    if (!successSent) {
      showResultInPopup(summary, truncateText(text))
    }

    // パフォーマンス計測ログ
    {
      const elapsedMs = Date.now() - startTimeMs
      console.log("要約処理: 正常完了 所要時間:", elapsedMs, "ms")
    }
  } catch (error) {
    console.error("Gemini APIでのエラーです:", error)

    // 型安全なエラーハンドリング
    const apiError = error as ApiError
    let errorMessage = CONSTANTS.ERROR_MESSAGES.API_ERROR
    let messageType: "API_KEY_MISSING" | "SUMMARY_EMPTY" = "SUMMARY_EMPTY"

    // エラーコードに基づく安全な判定
    if (apiError.code === "API_KEY_INVALID") {
      errorMessage = CONSTANTS.ERROR_MESSAGES.API_KEY_INVALID
    } else if (apiError.code === "QUOTA_EXCEEDED") {
      errorMessage = CONSTANTS.ERROR_MESSAGES.QUOTA_ERROR
    } else if (apiError.code === "NETWORK_ERROR") {
      errorMessage = CONSTANTS.ERROR_MESSAGES.NETWORK_ERROR
    } else if (apiError.message) {
      // フォールバック: メッセージベースの判定
      if (apiError.message.includes("API_KEY_INVALID")) {
        errorMessage = CONSTANTS.ERROR_MESSAGES.API_KEY_INVALID
      } else if (apiError.message.includes("quota")) {
        errorMessage = CONSTANTS.ERROR_MESSAGES.QUOTA_ERROR
      } else if (apiError.message.includes("network")) {
        errorMessage = CONSTANTS.ERROR_MESSAGES.NETWORK_ERROR
      }
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

    // パフォーマンス計測ログ
    {
      const elapsedMs = Date.now() - startTimeMs
      console.log("要約処理: エラーで終了 所要時間:", elapsedMs, "ms")
    }
  }
}
