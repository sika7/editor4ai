import {
  DirectoryGrepOptionsInput,
  fileGrep,
  GrepOptions,
  projectGrep,
} from '../search.js'
import {
  convertToRelativePaths,
  resolveSafeProjectPath,
} from '../util.js'
import { checkExcludedFiles, isExcludedFiles } from '../utils/validation.js'

/**
 * ファイル内でパターン検索を実行します
 *
 * @param params - パラメータオブジェクト
 * @param params.path - 検索対象のファイルパス
 * @param params.pattern - 検索するパターン（文字列または正規表現）
 * @param params.projectPath - プロジェクトのルートパス
 * @param params.excludedPattern - システムレベルで除外するパターンの配列
 * @param params.options - 検索オプション（正規表現、大文字小文字の区別など）
 * @returns 検索結果をJSON文字列として返します（相対パス形式）
 * @throws {Error} パスが制限されている場合
 *
 * @example
 * ```typescript
 * const result = await findInFileCore({
 *   path: './src/index.ts',
 *   pattern: 'function.*Core',
 *   projectPath: '/home/user/project',
 *   excludedPattern: ['.git'],
 *   options: { regex: true, caseSensitive: false }
 * });
 * ```
 */
export async function findInFileCore(params: {
  path: string
  pattern: string
  projectPath: string
  excludedPattern: string[]
  options?: GrepOptions
}) {
  const { path, pattern, projectPath, excludedPattern, options = {} } = params
  // プロジェクトルートのパスに丸める
  const safeFilePath = resolveSafeProjectPath(path, projectPath)
  checkExcludedFiles(safeFilePath, excludedPattern)

  const findResult = await fileGrep(safeFilePath, pattern, options)

  const text = JSON.stringify(findResult, null, 2)
  // 相対パスにして返す。
  const result = convertToRelativePaths(text, projectPath)

  return result
}

/**
 * プロジェクト全体でパターン検索を実行します
 *
 * @param params - パラメータオブジェクト
 * @param params.pattern - 検索するパターン（文字列または正規表現）
 * @param params.projectPath - プロジェクトのルートパス
 * @param params.excludedPattern - システムレベルで除外するパターンの配列
 * @param params.options - ディレクトリ検索オプション（ファイルタイプ、再帰検索など）
 * @returns プロジェクト全体の検索結果をJSON文字列として返します（相対パス形式）
 *
 * @example
 * ```typescript
 * const results = await projectGrepCore({
 *   pattern: 'TODO',
 *   projectPath: '/home/user/project',
 *   excludedPattern: ['.git', 'node_modules'],
 *   options: { fileTypes: ['.ts', '.js'], recursive: true }
 * });
 * ```
 */
export async function projectGrepCore(params: {
  pattern: string
  projectPath: string
  excludedPattern: string[]
  options?: DirectoryGrepOptionsInput
}) {
  const { pattern, projectPath, excludedPattern, options = {} } = params
  // プロジェクトルートのパスに丸める
  const safeFilePath = resolveSafeProjectPath('/', projectPath)
  const findResult = await projectGrep(safeFilePath, pattern, options)

  // 除外指定ファイルは見えないようにする
  findResult.results = findResult.results.filter(
    item => !isExcludedFiles(item.filePath, excludedPattern),
  )

  const text = JSON.stringify(findResult, null, 2)
  // 相対パスにして返す。
  const result = convertToRelativePaths(text, projectPath)

  return result
}