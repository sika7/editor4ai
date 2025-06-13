import {
  MulchEditLines,
  MulchInsertLines,
  MulchLines,
  ReadFileOptions,
} from './files.js'
import {
  DirectoryGrepOptionsInput,
  GrepOptions,
} from './search.js'
import {
  directoryTreeCore,
  createDirectoryCore,
  removeDirectoryCore,
  listFilesCore,
  readFileCore,
  writeFileCore,
  deleteFileCore,
  fileMoveOrRenameCore,
  findInFileCore,
  projectGrepCore,
  mulchInsertLinesInFileCore,
  mulchEditLinesInFileCore,
  mulchDeleteLinesInFileCore,
  runScriptCore,
} from './operations/index.js'

// Re-export all operations for backward compatibility
export {
  directoryTreeCore,
  createDirectoryCore,
  removeDirectoryCore,
  listFilesCore,
  readFileCore,
  writeFileCore,
  deleteFileCore,
  fileMoveOrRenameCore,
  findInFileCore,
  projectGrepCore,
  mulchInsertLinesInFileCore,
  mulchEditLinesInFileCore,
  mulchDeleteLinesInFileCore,
  runScriptCore,
} from './operations/index.js'

// Re-export validation functions for backward compatibility
export {
  checkExcludedFiles,
  isExcludedFiles,
} from './utils/index.js'

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

  /**
   * ディレクトリを作成します
   *
   * @param path - 作成するディレクトリのパス
   * @returns 作成結果のメッセージ
   */
  async createDirectory(path: string) {
    return await createDirectoryCore({
      path,
      projectPath: this.projectPath,
      excludedPattern: this.excludedPattern,
    })
  }

  /**
   * ディレクトリを削除します
   *
   * @param path - 削除するディレクトリのパス
   * @returns 削除結果のメッセージ
   */
  async removeDirectory(path: string) {
    return await removeDirectoryCore({
      path,
      projectPath: this.projectPath,
      excludedPattern: this.excludedPattern,
    })
  }

  /**
   * ディレクトリ内のファイル一覧を取得します
   *
   * @param path - 一覧を取得するディレクトリのパス
   * @param filter - ファイル名のフィルター（オプション）
   * @returns ファイル一覧の文字列（改行区切り、相対パス）
   */
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

  /**
   * ファイルを読み込みます
   *
   * @param path - 読み込むファイルのパス
   * @param options - 読み込みオプション（行数制限など）
   * @returns ファイルの内容
   */
  async readFile(path: string, options: ReadFileOptions = {}) {
    return await readFileCore({
      path,
      projectPath: this.projectPath,
      excludedPattern: this.excludedPattern,
      options,
    })
  }

  /**
   * ファイルに内容を書き込みます
   *
   * @param path - 書き込むファイルのパス
   * @param content - 書き込む内容
   * @returns 書き込み結果のメッセージ（相対パス形式）
   */
  async writeFile(path: string, content: string) {
    return await writeFileCore({
      path,
      content,
      projectPath: this.projectPath,
      excludedPattern: this.excludedPattern,
    })
  }

  /**
   * ファイルを削除します
   *
   * @param path - 削除するファイルのパス
   * @returns 削除結果のメッセージ（相対パス形式）
   */
  async deleteFile(path: string) {
    return await deleteFileCore({
      path,
      projectPath: this.projectPath,
      excludedPattern: this.excludedPattern,
    })
  }

  /**
   * ファイルを移動またはリネームします
   *
   * @param srcPath - 移動元のファイルパス
   * @param distPath - 移動先のファイルパス
   * @returns 移動/リネーム結果のメッセージ（相対パス形式）
   */
  async fileMoveOrRename(srcPath: string, distPath: string) {
    return await fileMoveOrRenameCore({
      srcPath,
      distPath,
      projectPath: this.projectPath,
      excludedPattern: this.excludedPattern,
    })
  }

  /**
   * ファイルの複数の位置に行を挿入します
   *
   * @param path - 編集するファイルのパス
   * @param editlines - 挿入する行の情報の配列
   * @param afterMode - trueの場合、指定行の後に挿入（デフォルト: false）
   * @returns 挿入結果のメッセージ（相対パス形式）
   */
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

  /**
   * ファイルの複数の行を編集します
   *
   * @param path - 編集するファイルのパス
   * @param editlines - 編集する行の情報の配列
   * @param previewFlg - プレビューモードの有効/無効（デフォルト: true）
   * @returns 編集結果のオブジェクト（メッセージは相対パス形式）
   */
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

  /**
   * ファイルの複数の行を削除します
   *
   * @param path - 編集するファイルのパス
   * @param editlines - 削除する行の情報の配列
   * @returns 削除結果のメッセージ（相対パス形式）
   */
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