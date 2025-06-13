import { runScript } from '../script.js'

/**
 * スクリプトを実行します
 *
 * @param params - パラメータオブジェクト
 * @param params.name - スクリプトの名前（識別用）
 * @param params.scriptCmd - 実行するスクリプトコマンド
 * @param params.projectPath - プロジェクトのルートパス
 * @returns スクリプト実行結果
 */
export async function runScriptCore(params: {
  name: string
  scriptCmd: string
  projectPath: string
}) {
  const { name, scriptCmd, projectPath } = params
  const result = await runScript(name, scriptCmd, projectPath)

  return result
}