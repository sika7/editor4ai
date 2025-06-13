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

export function checkExcludedFiles(
  filePath: string,
  excludedPattern: string[],
) {
  // 除外ファイルをチェック
  if (isExcluded(filePath, excludedPattern)) {
    throw new Error('指定されたパスはツールにより制限されています')
  }
}

export function isExcludedFiles(filePath: string, excludedPattern: string[]) {
  // 除外ファイルをチェック
  if (isExcluded(filePath, excludedPattern)) return true
  return false
}

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
 * projectPathとexcludedPatternを保持し、関数呼び出しを簡潔にします
 */
export class Core {
  private projectPath: string
  private excludedPattern: string[]

  constructor(projectPath: string, excludedPattern: string[]) {
    this.projectPath = projectPath
    this.excludedPattern = excludedPattern
  }

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

  async findInFile(path: string, pattern: string, options: GrepOptions = {}) {
    return await findInFileCore({
      path,
      pattern,
      projectPath: this.projectPath,
      excludedPattern: this.excludedPattern,
      options,
    })
  }

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

  async runScript(name: string, scriptCmd: string) {
    return await runScriptCore({
      name,
      scriptCmd,
      projectPath: this.projectPath,
    })
  }
}
