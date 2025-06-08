// ライブラリのメインエクスポート
export {
  Core,
  checkExcludedFiles,
  isExcludedFiles,
  directoryTreeCore,
  createDirectoryCore,
  removeDirectoryCore,
  listFilesCore,
  findInFileCore,
  projectGrepCore,
  readFileCore,
  writeFileCore,
  deleteFileCore,
  fileMoveOrRenameCore,
  mulchInsertLinesInFileCore,
  mulchEditLinesInFileCore,
  mulchDeleteLinesInFileCore,
  runScriptCore,
} from './core/main.js'

// 型定義もエクスポート
export type {
  ReadFileOptions,
  MulchEditLines,
  MulchInsertLines,
  MulchLines,
} from './core/files.js'

export type {
  DirectoryGrepOptionsInput,
  GrepOptions,
  FileGrepArgs,
  ProjectGrepArgs,
} from './core/search.js'

// Zod schemas をエクスポート（値として）
export {
  DirectoryGrepOptionsSchema,
  FileGrepOptionsSchema,
} from './core/search.js'

// ユーティリティ関数も必要に応じてエクスポート
export {
  convertToRelativePaths,
  isExcluded,
  resolveSafeProjectPath,
  getConfigPath,
  generateRequestId,
} from './core/util.js'

// ログシステムもエクスポート
export { createSystemLogger, createRequestErrorLogger } from './core/logs.js'
