import {
  createDirectory,
  generateDirectoryTree,
  removeDirectory,
} from '../directory.js'
import { listFiles } from '../files.js'
import { createSystemLogger } from '../logs.js'
import {
  convertToRelativePaths,
  resolveSafeProjectPath,
} from '../util.js'
import { checkExcludedFiles, isExcludedFiles } from '../utils/validation.js'

const log = createSystemLogger()

/**
 * ディレクトリツリーを生成します
 *
 * @param params - パラメータオブジェクト
 * @param params.path - ツリーを生成するディレクトリのパス
 * @param params.exclude - 除外するファイル/ディレクトリパターンの配列
 * @param params.projectPath - プロジェクトのルートパス
 * @param params.excludedPattern - システムレベルで除外するパターンの配列
 * @returns ディレクトリツリーの文字列表現（相対パス）
 * @throws {Error} パスが制限されている場合
 *
 * @example
 * ```typescript
 * const tree = await directoryTreeCore({
 *   path: './src',
 *   exclude: ['node_modules', '*.log'],
 *   projectPath: '/home/user/project',
 *   excludedPattern: ['.git', '.env']
 * });
 * ```
 */
export async function directoryTreeCore(params: {
  path: string
  exclude: string[]
  projectPath: string
  excludedPattern: string[]
}) {
  const { path, exclude, projectPath, excludedPattern } = params
  // プロジェクトルートのパスに丸める
  const safeFilePath = resolveSafeProjectPath(path, projectPath)
  checkExcludedFiles(safeFilePath, excludedPattern)

  const mergeExcluded = [...excludedPattern, ...exclude]
  log({ logLevel: 'INFO', message: '除外パターン', data: mergeExcluded })
  const tree = await generateDirectoryTree(safeFilePath, {
    exclude: mergeExcluded,
  })
  // 相対パスにして返す。
  const result = convertToRelativePaths(tree, projectPath)

  return result
}

/**
 * ディレクトリを作成します
 *
 * @param params - パラメータオブジェクト
 * @param params.path - 作成するディレクトリのパス
 * @param params.projectPath - プロジェクトのルートパス
 * @param params.excludedPattern - システムレベルで除外するパターンの配列
 * @returns 作成結果のメッセージ
 * @throws {Error} パスが制限されている場合
 */
export async function createDirectoryCore(params: {
  path: string
  projectPath: string
  excludedPattern: string[]
}) {
  const { path, projectPath, excludedPattern } = params
  // プロジェクトルートのパスに丸める
  const safeFilePath = resolveSafeProjectPath(path, projectPath)
  checkExcludedFiles(safeFilePath, excludedPattern)

  const result = await createDirectory(safeFilePath)
  return result
}

/**
 * ディレクトリを削除します
 *
 * @param params - パラメータオブジェクト
 * @param params.path - 削除するディレクトリのパス
 * @param params.projectPath - プロジェクトのルートパス
 * @param params.excludedPattern - システムレベルで除外するパターンの配列
 * @returns 削除結果のメッセージ
 * @throws {Error} パスが制限されている場合
 */
export async function removeDirectoryCore(params: {
  path: string
  projectPath: string
  excludedPattern: string[]
}) {
  const { path, projectPath, excludedPattern } = params
  // プロジェクトルートのパスに丸める
  const safeFilePath = resolveSafeProjectPath(path, projectPath)
  checkExcludedFiles(safeFilePath, excludedPattern)

  const result = await removeDirectory(safeFilePath)
  return result
}

/**
 * ディレクトリ内のファイル一覧を取得します
 *
 * @param params - パラメータオブジェクト
 * @param params.path - 一覧を取得するディレクトリのパス
 * @param params.projectPath - プロジェクトのルートパス
 * @param params.excludedPattern - システムレベルで除外するパターンの配列
 * @param params.filter - ファイル名のフィルター（オプション）
 * @returns ファイル一覧の文字列（改行区切り、相対パス）
 * @throws {Error} パスが制限されている場合
 */
export async function listFilesCore(params: {
  path: string
  projectPath: string
  excludedPattern: string[]
  filter?: string
}) {
  const { path, projectPath, excludedPattern, filter = '' } = params
  // プロジェクトルートのパスに丸める
  const safeFilePath = resolveSafeProjectPath(path, projectPath)
  checkExcludedFiles(safeFilePath, excludedPattern)

  const files = await listFiles(safeFilePath, filter)
  // 許可されたファイルのみ表示
  const items = files.filter(item => !isExcludedFiles(item, excludedPattern))

  // 相対パスにして返す。
  const result = convertToRelativePaths(items.join('\n'), projectPath)

  return result
}