import {
  deleteFile,
  fileMoveOrRename,
  ReadFileOptions,
  readTextFileWithOptions,
  writeTextFile,
} from '../files.js'
import {
  convertToRelativePaths,
  resolveSafeProjectPath,
} from '../util.js'
import { checkExcludedFiles } from '../utils/validation.js'

/**
 * ファイルを読み込みます
 *
 * @param params - パラメータオブジェクト
 * @param params.path - 読み込むファイルのパス
 * @param params.projectPath - プロジェクトのルートパス
 * @param params.excludedPattern - システムレベルで除外するパターンの配列
 * @param params.options - 読み込みオプション（行数制限など）
 * @returns ファイルの内容
 * @throws {Error} パスが制限されている場合
 */
export async function readFileCore(params: {
  path: string
  projectPath: string
  excludedPattern: string[]
  options?: ReadFileOptions
}) {
  const { path, projectPath, excludedPattern, options = {} } = params
  // プロジェクトルートのパスに丸める
  const safeFilePath = resolveSafeProjectPath(path, projectPath)
  checkExcludedFiles(safeFilePath, excludedPattern)

  const results = await readTextFileWithOptions(safeFilePath, options)

  return results
}

/**
 * ファイルに内容を書き込みます
 *
 * @param params - パラメータオブジェクト
 * @param params.path - 書き込むファイルのパス
 * @param params.content - 書き込む内容
 * @param params.projectPath - プロジェクトのルートパス
 * @param params.excludedPattern - システムレベルで除外するパターンの配列
 * @returns 書き込み結果のメッセージ（相対パス形式）
 * @throws {Error} パスが制限されている場合
 */
export async function writeFileCore(params: {
  path: string
  content: string
  projectPath: string
  excludedPattern: string[]
}) {
  const { path, content, projectPath, excludedPattern } = params
  // プロジェクトルートのパスに丸める
  const safeFilePath = resolveSafeProjectPath(path, projectPath)
  checkExcludedFiles(safeFilePath, excludedPattern)

  const message = await writeTextFile(safeFilePath, content)
  // 相対パスにして返す。
  const result = convertToRelativePaths(message, projectPath)

  return result
}

/**
 * ファイルを削除します
 *
 * @param params - パラメータオブジェクト
 * @param params.path - 削除するファイルのパス
 * @param params.projectPath - プロジェクトのルートパス
 * @param params.excludedPattern - システムレベルで除外するパターンの配列
 * @returns 削除結果のメッセージ（相対パス形式）
 * @throws {Error} パスが制限されている場合
 */
export async function deleteFileCore(params: {
  path: string
  projectPath: string
  excludedPattern: string[]
}) {
  const { path, projectPath, excludedPattern } = params
  // プロジェクトルートのパスに丸める
  const safeFilePath = resolveSafeProjectPath(path, projectPath)
  checkExcludedFiles(safeFilePath, excludedPattern)

  const message = await deleteFile(safeFilePath)
  const result = convertToRelativePaths(message, projectPath)

  return result
}

/**
 * ファイルを移動またはリネームします
 *
 * @param params - パラメータオブジェクト
 * @param params.srcPath - 移動元のファイルパス
 * @param params.distPath - 移動先のファイルパス
 * @param params.projectPath - プロジェクトのルートパス
 * @param params.excludedPattern - システムレベルで除外するパターンの配列
 * @returns 移動/リネーム結果のメッセージ（相対パス形式）
 * @throws {Error} パスが制限されている場合
 */
export async function fileMoveOrRenameCore(params: {
  srcPath: string
  distPath: string
  projectPath: string
  excludedPattern: string[]
}) {
  const { srcPath, distPath, projectPath, excludedPattern } = params
  // プロジェクトルートのパスに丸める
  const safeSrcPath = resolveSafeProjectPath(srcPath, projectPath)
  checkExcludedFiles(safeSrcPath, excludedPattern)
  const safeDistPath = resolveSafeProjectPath(distPath, projectPath)
  checkExcludedFiles(safeDistPath, excludedPattern)

  const message = await fileMoveOrRename(safeSrcPath, safeDistPath)
  const result = convertToRelativePaths(message, projectPath)
  return result
}