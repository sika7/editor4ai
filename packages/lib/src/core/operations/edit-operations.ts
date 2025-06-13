import {
  MulchEditLines,
  mulchEditLines,
  MulchInsertLines,
  mulchInsertLines,
  MulchLines,
  mulchDeleteLines,
} from '../files.js'
import {
  convertToRelativePaths,
  resolveSafeProjectPath,
} from '../util.js'
import { checkExcludedFiles } from '../utils/validation.js'

/**
 * ファイルの複数の位置に行を挿入します
 *
 * @param params - パラメータオブジェクト
 * @param params.path - 編集するファイルのパス
 * @param params.editlines - 挿入する行の情報の配列
 * @param params.projectPath - プロジェクトのルートパス
 * @param params.excludedPattern - システムレベルで除外するパターンの配列
 * @param params.afterMode - trueの場合、指定行の後に挿入（デフォルト: false）
 * @returns 挿入結果のメッセージ（相対パス形式）
 * @throws {Error} パスが制限されている場合
 */
export async function mulchInsertLinesInFileCore(params: {
  path: string
  editlines: MulchInsertLines[]
  projectPath: string
  excludedPattern: string[]
  afterMode?: boolean
}) {
  const {
    path,
    editlines,
    projectPath,
    excludedPattern,
    afterMode = false,
  } = params
  // プロジェクトルートのパスに丸める
  const safeFilePath = resolveSafeProjectPath(path, projectPath)
  checkExcludedFiles(safeFilePath, excludedPattern)

  const message = await mulchInsertLines(safeFilePath, editlines, afterMode)
  const result = convertToRelativePaths(message, projectPath)

  return result
}

/**
 * ファイルの複数の行を編集します
 *
 * @param params - パラメータオブジェクト
 * @param params.path - 編集するファイルのパス
 * @param params.editlines - 編集する行の情報の配列
 * @param params.projectPath - プロジェクトのルートパス
 * @param params.excludedPattern - システムレベルで除外するパターンの配列
 * @param params.previewFlg - プレビューモードの有効/無効（デフォルト: true）
 * @returns 編集結果のオブジェクト（メッセージは相対パス形式）
 * @throws {Error} パスが制限されている場合
 */
export async function mulchEditLinesInFileCore(params: {
  path: string
  editlines: MulchEditLines[]
  projectPath: string
  excludedPattern: string[]
  previewFlg?: boolean
}) {
  const {
    path,
    editlines,
    projectPath,
    excludedPattern,
    previewFlg = true,
  } = params
  // プロジェクトルートのパスに丸める
  const safeFilePath = resolveSafeProjectPath(path, projectPath)
  checkExcludedFiles(safeFilePath, excludedPattern)

  const result = await mulchEditLines(safeFilePath, editlines, previewFlg)
  result.message = convertToRelativePaths(result.message, projectPath)

  return result
}

/**
 * ファイルの複数の行を削除します
 *
 * @param params - パラメータオブジェクト
 * @param params.path - 編集するファイルのパス
 * @param params.editlines - 削除する行の情報の配列
 * @param params.projectPath - プロジェクトのルートパス
 * @param params.excludedPattern - システムレベルで除外するパターンの配列
 * @returns 削除結果のメッセージ（相対パス形式）
 * @throws {Error} パスが制限されている場合
 */
export async function mulchDeleteLinesInFileCore(params: {
  path: string
  editlines: MulchLines[]
  projectPath: string
  excludedPattern: string[]
}): Promise<string> {
  const { path, editlines, projectPath, excludedPattern } = params
  // プロジェクトルートのパスに丸める
  const safeFilePath = resolveSafeProjectPath(path, projectPath)
  checkExcludedFiles(safeFilePath, excludedPattern)

  const message = await mulchDeleteLines(safeFilePath, editlines)
  const result = convertToRelativePaths(message, projectPath)

  return result
}