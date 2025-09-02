/**
 * apiclient.ts - Gemini API クライアントクラス
 *
 * このファイルは、Gemini API との通信を管理し、型安全なエラーハンドリングを提供します。
 * 要約機能の核となるAPI呼び出しロジックをカプセル化しています。
 *
 * 主な機能：
 * - Gemini API への要約リクエスト送信
 * - 型安全なエラーハンドリング
 * - エラーコードの自動抽出
 * - レスポンスの検証
 */

import { GoogleGenAI } from "@google/genai"

import { CONSTANTS, type ApiError, type GeminiResponse } from "./consts"

/**
 * Gemini API クライアントクラス
 *
 * このクラスは、Gemini API との通信を管理し、型安全なエラーハンドリングを提供します。
 * 要約機能の核となるAPI呼び出しロジックをカプセル化しています。
 *
 * 使用例：
 * ```typescript
 * const client = new ApiClient(apiKey)
 * const summary = await client.summarizeText("要約したいテキスト")
 * ```
 */
export default class ApiClient {
  /** Gemini AI インスタンス */
  private ai: GoogleGenAI

  /** 使用するAIモデル名 */
  private model: string

  /**
   * ApiClient のコンストラクタ
   *
   * @param apiKey - Gemini API キー
   * @param model - 使用するAIモデル（デフォルト: gemini-2.5-flash-lite）
   *
   * 処理内容：
   * - GoogleGenAI インスタンスを初期化
   * - モデル名を設定（指定がない場合は定数から取得）
   *
   * 注意点：
   * - APIキーが無効な場合、後続のAPI呼び出しでエラーが発生
   * - モデル名は定数ファイルで管理されている
   */
  constructor(apiKey: string, model: string = CONSTANTS.API.MODEL) {
    this.ai = new GoogleGenAI({ apiKey })
    this.model = model
  }

  /**
   * Gemini API にコンテンツ生成リクエストを送信
   *
   * @param prompt - AIに送信するプロンプトテキスト
   * @returns Promise<string> - 生成されたテキスト
   *
   * 処理内容：
   * 1. Gemini API にリクエストを送信
   * 2. レスポンスの検証（空でないかチェック）
   * 3. エラーが発生した場合は型安全なエラー処理
   *
   * エラーハンドリング：
   * - APIキー無効、クォータ超過、ネットワークエラーなど
   * - すべてのエラーは ApiError 型に変換される
   *
   * 使用箇所：
   * - summarizeText メソッドから呼び出される
   * - 直接的なコンテンツ生成が必要な場合
   *
   * 注意点：
   * - 非同期処理のため await で待機が必要
   * - エラーが発生した場合は例外を投げる
   * - レスポンスが空の場合はエラーとして処理
   */
  async generateContent(prompt: string): Promise<string> {
    try {
      // Gemini API にリクエストを送信
      const result = await this.ai.models.generateContent({
        model: this.model,
        contents: [prompt]
      })

      // 型安全なレスポンス処理
      // API から空のレスポンスが返された場合の検証
      if (!result || !result.text) {
        throw new Error("API response is empty or invalid")
      }

      return result.text
    } catch (error) {
      // 型安全なエラーハンドリング
      // すべてのエラーを ApiError 型に変換して再投げ
      const apiError = this.handleApiError(error)
      throw apiError
    }
  }

  /**
   * テキストを要約する（メイン機能）
   *
   * @param text - 要約対象のテキスト
   * @returns Promise<string> - 要約されたテキスト
   *
   * 処理内容：
   * 1. 要約用プロンプトと元テキストを結合
   * 2. generateContent メソッドを呼び出してAPI実行
   * 3. 要約結果を返す
   *
   * 使用箇所：
   * - background.ts の summarizeText 関数から呼び出される
   * - ユーザーが右クリックで要約を実行した際のメイン処理
   *
   * 注意点：
   * - プロンプトは定数ファイルで管理されている
   * - エラーが発生した場合は ApiError 型の例外が投げられる
   * - 非同期処理のため await で待機が必要
   *
   * 例：
   * ```typescript
   * const summary = await client.summarizeText("長いテキスト...")
   * console.log(summary) // "要約されたテキスト"
   * ```
   */
  async summarizeText(text: string): Promise<string> {
    // 要約用プロンプトと元テキストを結合
    const prompt = CONSTANTS.API.SUMMARIZE_PROMPT + text

    // generateContent メソッドを呼び出してAPI実行
    return this.generateContent(prompt)
  }

  /**
   * APIエラーを型安全に処理する（プライベートメソッド）
   *
   * @param error - キャッチしたエラー（unknown型）
   * @returns ApiError - 型安全なエラーオブジェクト
   *
   * 処理内容：
   * 1. エラーの型を判定（Error オブジェクトかどうか）
   * 2. Error オブジェクトの場合は詳細情報を抽出
   * 3. その他の場合は汎用エラーオブジェクトを作成
   * 4. エラーコードとステータスコードを自動抽出
   *
   * 使用箇所：
   * - generateContent メソッドの catch ブロック内
   * - すべてのAPI呼び出しエラーを統一された形式に変換
   *
   * 注意点：
   * - プライベートメソッド（外部からは呼び出せない）
   * - unknown 型のエラーを安全に処理
   * - エラーコードの抽出は extractErrorCode メソッドに委譲
   * - ステータスコードの抽出は extractErrorStatus メソッドに委譲
   */
  private handleApiError(error: unknown): ApiError {
    // Errorオブジェクトの場合（標準的なJavaScriptエラー）
    if (error instanceof Error) {
      return {
        name: error.name, // エラーの種類（例: "TypeError", "NetworkError"）
        message: error.message, // エラーメッセージ
        stack: error.stack, // スタックトレース（デバッグ用）
        code: this.extractErrorCode(error.message), // カスタムエラーコード
        status: this.extractErrorStatus(error.message) // HTTPステータスコード
      }
    }

    // その他の場合（予期しないエラー）
    return {
      name: "UnknownError",
      message: "An unknown error occurred",
      code: "UNKNOWN_ERROR"
    }
  }

  /**
   * エラーメッセージからエラーコードを抽出（プライベートメソッド）
   *
   * @param message - エラーメッセージ
   * @returns string | undefined - 抽出されたエラーコード、該当なしの場合は undefined
   *
   * 処理内容：
   * エラーメッセージの内容を解析して、適切なエラーコードを返す
   *
   * 対応するエラーコード：
   * - "API_KEY_INVALID" - APIキーが無効
   * - "QUOTA_EXCEEDED" - API利用制限に達した
   * - "NETWORK_ERROR" - ネットワーク関連のエラー
   * - "TIMEOUT_ERROR" - タイムアウトエラー
   *
   * 使用箇所：
   * - handleApiError メソッドから呼び出される
   * - エラーメッセージの解析に使用
   *
   * 注意点：
   * - プライベートメソッド（外部からは呼び出せない）
   * - 大文字小文字を区別しない検索
   * - 複数のキーワードに該当する場合は最初に見つかったものを返す
   * - 該当するエラーコードがない場合は undefined を返す
   *
   * 例：
   * ```typescript
   * extractErrorCode("API key is invalid") // "API_KEY_INVALID"
   * extractErrorCode("Quota exceeded") // "QUOTA_EXCEEDED"
   * extractErrorCode("Network timeout") // "TIMEOUT_ERROR"
   * ```
   */
  private extractErrorCode(message: string): string | undefined {
    // APIキーが無効な場合
    if (message.includes("API_KEY_INVALID")) return "API_KEY_INVALID"

    // クォータ（利用制限）に達した場合
    if (message.includes("quota")) return "QUOTA_EXCEEDED"

    // ネットワーク関連のエラー
    if (message.includes("network")) return "NETWORK_ERROR"

    // タイムアウトエラー
    if (message.includes("timeout")) return "TIMEOUT_ERROR"

    // 該当するエラーコードがない場合
    return undefined
  }

  /**
   * エラーメッセージからステータスコードを抽出（プライベートメソッド）
   *
   * @param message - エラーメッセージ
   * @returns number | undefined - 抽出されたステータスコード、該当なしの場合は undefined
   *
   * 処理内容：
   * エラーメッセージからHTTPステータスコードを正規表現で抽出
   *
   * 検索パターン：
   * - "status: 404" → 404
   * - "status 500" → 500
   * - "Status: 401" → 401
   * - "STATUS 403" → 403
   *
   * 使用箇所：
   * - handleApiError メソッドから呼び出される
   * - HTTPステータスコードの解析に使用
   *
   * 注意点：
   * - プライベートメソッド（外部からは呼び出せない）
   * - 大文字小文字を区別しない検索（/i フラグ）
   * - コロン（:）とスペースの有無に関係なく抽出
   * - 数字以外の文字は無視
   * - 該当するステータスコードがない場合は undefined を返す
   *
   * 例：
   * ```typescript
   * extractErrorStatus("Error status: 404") // 404
   * extractErrorStatus("HTTP status 500") // 500
   * extractErrorStatus("Status: 401 Unauthorized") // 401
   * extractErrorStatus("No status code") // undefined
   * ```
   */
  private extractErrorStatus(message: string): number | undefined {
    // 正規表現でステータスコードを抽出
    // パターン: "status" + コロンまたはスペース + 数字
    const statusMatch = message.match(/status[:\s]*(\d+)/i)

    // マッチした場合は数字を整数に変換して返す
    // マッチしなかった場合は undefined を返す
    return statusMatch ? parseInt(statusMatch[1]) : undefined
  }
}
