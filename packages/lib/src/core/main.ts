import {
  createDirectory,
  generateDirectoryTree,
  removeDirectory,
} from './directory.js'
import {
  deleteFile,
  fileMoveOrRename,
  listFiles,
  mulchDeleteLines,
  MulchEditLines,
  mulchEditLines,
  MulchInsertLines,
  mulchInsertLines,
  MulchLines,
  ReadFileOptions,
  readTextFileWithOptions,
  writeTextFile,
} from './files.js'
import { createSystemLogger } from './logs.js'
import { runScript } from './script.js'
import {
  DirectoryGrepOptionsInput,
  fileGrep,
  GrepOptions,
  projectGrep,
} from './search.js'
import {
  convertToRelativePaths,
  isExcluded,
  resolveSafeProjectPath,
} from './util.js'

const log = createSystemLogger()

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

/**
 * Core - 便利なラッパークラス
 *
 * projectPathとexcludedPatternを保持し、各種Core関数の呼び出しを簡潔にします。
 * このクラスを使用することで、毎回projectPathとexcludedPatternを
 * 指定する必要がなくなります。
 *
 * @example
 * ```typescript
 * const core = new Core('/home/user/project', ['.git', '.env']);
 *
 * // ファイルを読み込む
 * const content = await core.readFile('./src/index.ts');
 *
 * // プロジェクト全体で検索
 * const searchResults = await core.projectGrep('TODO');
 * ```
 */
export class Core {
  private projectPath: string
  private excludedPattern: string[]

  /**
   * Coreクラスのインスタンスを作成します
   *
   * @param projectPath - プロジェクトのルートパス
   * @param excludedPattern - システムレベルで除外するパターンの配列
   */
  constructor(projectPath: string, excludedPattern: string[]) {
    this.projectPath = projectPath
    this.excludedPattern = excludedPattern
  }

  /**
   * ディレクトリツリーを生成します
   *
   * @param path - ツリーを生成するディレクトリのパス
   * @param exclude - 除外するファイル/ディレクトリパターンの配列
   * @returns ディレクトリツリーの文字列表現（相対パス）
   */
  async directoryTree(path: string, exclude: string[]) {
    return await directoryTreeCore({
      path,
      exclude,
      projectPath: this.projectPath,
      excludedPattern: this.excludedPattern,
    })
  }

  async createDirectory(path: string) {
    return await createDirectoryCore({
      path,
      projectPath: this.projectPath,
      excludedPattern: this.excludedPattern,
    })
  }

  async removeDirectory(path: string) {
    return await removeDirectoryCore({
      path,
      projectPath: this.projectPath,
      excludedPattern: this.excludedPattern,
    })
  }

  async listFiles(path: string, filter: string = '') {
    return await listFilesCore({
      path,
      projectPath: this.projectPath,
      excludedPattern: this.excludedPattern,
      filter,
    })
  }

  /**
   * ファイル内でパターン検索を実行します
   *
   * @param path - 検索対象のファイルパス
   * @param pattern - 検索するパターン（文字列または正規表現）
   * @param options - 検索オプション（正規表現、大文字小文字の区別など）
   * @returns 検索結果をJSON文字列として返します（相対パス形式）
   */
  async findInFile(path: string, pattern: string, options: GrepOptions = {}) {
    return await findInFileCore({
      path,
      pattern,
      projectPath: this.projectPath,
      excludedPattern: this.excludedPattern,
      options,
    })
  }

  /**
   * プロジェクト全体でパターン検索を実行します
   *
   * @param pattern - 検索するパターン（文字列または正規表現）
   * @param options - ディレクトリ検索オプション（ファイルタイプ、再帰検索など）
   * @returns プロジェクト全体の検索結果をJSON文字列として返します（相対パス形式）
   */
  async projectGrep(pattern: string, options: DirectoryGrepOptionsInput = {}) {
    return await projectGrepCore({
      pattern,
      projectPath: this.projectPath,
      excludedPattern: this.excludedPattern,
      options,
    })
  }

  async readFile(path: string, options: ReadFileOptions = {}) {
    return await readFileCore({
      path,
      projectPath: this.projectPath,
      excludedPattern: this.excludedPattern,
      options,
    })
  }

  async writeFile(path: string, content: string) {
    return await writeFileCore({
      path,
      content,
      projectPath: this.projectPath,
      excludedPattern: this.excludedPattern,
    })
  }

  async deleteFile(path: string) {
    return await deleteFileCore({
      path,
      projectPath: this.projectPath,
      excludedPattern: this.excludedPattern,
    })
  }

  async fileMoveOrRename(srcPath: string, distPath: string) {
    return await fileMoveOrRenameCore({
      srcPath,
      distPath,
      projectPath: this.projectPath,
      excludedPattern: this.excludedPattern,
    })
  }

  async mulchInsertLinesInFile(
    path: string,
    editlines: MulchInsertLines[],
    afterMode: boolean = false,
  ) {
    return await mulchInsertLinesInFileCore({
      path,
      editlines,
      projectPath: this.projectPath,
      excludedPattern: this.excludedPattern,
      afterMode,
    })
  }

  async mulchEditLinesInFile(
    path: string,
    editlines: MulchEditLines[],
    previewFlg: boolean = true,
  ) {
    return await mulchEditLinesInFileCore({
      path,
      editlines,
      projectPath: this.projectPath,
      excludedPattern: this.excludedPattern,
      previewFlg,
    })
  }

  async mulchDeleteLinesInFile(
    path: string,
    editlines: MulchLines[],
  ): Promise<string> {
    return await mulchDeleteLinesInFileCore({
      path,
      editlines,
      projectPath: this.projectPath,
      excludedPattern: this.excludedPattern,
    })
  }

  /**
   * スクリプトを実行します
   *
   * @param name - スクリプトの名前（識別用）
   * @param scriptCmd - 実行するスクリプトコマンド
   * @returns スクリプト実行結果
   */
  async runScript(name: string, scriptCmd: string) {
    return await runScriptCore({
      name,
      scriptCmd,
      projectPath: this.projectPath,
    })
  }
}
