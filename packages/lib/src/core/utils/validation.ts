import { isExcluded } from '../util.js'

/**
 * 指定されたファイルパスが除外パターンに一致するかチェックし、
 * 一致する場合はエラーをスローします
 *
 * @param filePath - チェックするファイルパス
 * @param excludedPattern - 除外パターンの配列
 * @throws {Error} ファイルパスが除外パターンに一致する場合
 */
export function checkExcludedFiles(
  filePath: string,
  excludedPattern: string[],
) {
  // 除外ファイルをチェック
  if (isExcluded(filePath, excludedPattern)) {
    throw new Error('指定されたパスはツールにより制限されています')
  }
}

/**
 * 指定されたファイルパスが除外パターンに一致するかチェックします
 *
 * @param filePath - チェックするファイルパス
 * @param excludedPattern - 除外パターンの配列
 * @returns 除外パターンに一致する場合はtrue、それ以外はfalse
 */
export function isExcludedFiles(filePath: string, excludedPattern: string[]) {
  // 除外ファイルをチェック
  if (isExcluded(filePath, excludedPattern)) return true
  return false
}