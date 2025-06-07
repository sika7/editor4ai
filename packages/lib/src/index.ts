// ライブラリのメインエクスポート
export { Core } from './lib/main.js'

// 型定義もエクスポート
export type {
  ReadFileOptions,
  MulchEditLines,
  MulchInsertLines,
  MulchLines,
} from './lib/files.js'

export type {
  DirectoryGrepOptionsInput,
  GrepOptions,
  FileGrepArgs,
  ProjectGrepArgs,
} from './lib/search.js'

// Zod schemas をエクスポート（値として）
export {
  DirectoryGrepOptionsSchema,
  FileGrepOptionsSchema,
} from './lib/search.js'

// ユーティリティ関数も必要に応じてエクスポート
export {
  convertToRelativePaths,
  isExcluded,
  resolveSafeProjectPath,
  getConfigPath,
  generateRequestId,
} from './lib/util.js'

// ログシステムもエクスポート
export { createSystemLogger, createRequestErrorLogger } from './lib/logs.js'
