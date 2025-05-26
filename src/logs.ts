import {
  appendFileSync,
  mkdirSync,
  existsSync,
  readdirSync,
  unlinkSync,
} from 'fs'
import { dirname, join } from 'path'

import { parseISO, differenceInDays } from 'date-fns'

import { getLogPath } from './util.js'

const MAX_AGE_DAYS = 30

type logLevel = 'INFO' | 'DEBUG' | 'WARNING' | 'ERROR'

// 型定義
type SystemLogEntry = {
  timestamp: string
  level: logLevel
  message: string
  data?: any
}

type RequestLogEntry = {
  timestamp: string
  status: number
  message: string
  project: string
  file: string
  request_id: string
}

function getLogDir(logKind: string) {
  const logDir = getLogPath(['logs', logKind])
  if (!existsSync(logDir)) mkdirSync(logDir, { recursive: true })

  return logDir
}

function getLogFilePath(logKind: string) {
  const logDir = getLogDir(logKind)

  const date = new Date().toISOString().slice(0, 10) // "2025-05-23"
  return join(logDir, `mcp-${logKind}-${date}.log`)
}

// ログ出力処理
async function writeLog(
  logPath: string,
  entry: RequestLogEntry | SystemLogEntry,
) {
  appendFileSync(logPath, JSON.stringify(entry) + '\n', { encoding: 'utf-8' })
}

const systemLogPath = getLogFilePath('system')
const systemLogDir = getLogDir('system')

export function createSystemLogger(logPath = systemLogPath) {
  const logDir = dirname(logPath)
  if (!existsSync(logDir)) mkdirSync(logDir, { recursive: true })

  // ロガー関数（純粋関数 → 副作用）
  return ({
    logLevel = 'INFO',
    message,
    data,
  }: {
    logLevel?: logLevel
    message: string
    data?: any
  }) => {
    const entry: SystemLogEntry = {
      timestamp: new Date().toISOString(),
      level: logLevel,
      message,
      data,
    }
    writeLog(logPath, entry)
  }
}

const requestLogPath = getLogFilePath('request')
const requestLogDir = getLogDir('request')

export function createRequestErrorLogger(logPath = requestLogPath) {
  const logDir = dirname(logPath)
  if (!existsSync(logDir)) mkdirSync(logDir, { recursive: true })

  // ロガー関数（純粋関数 → 副作用）
  return (
    status: number,
    message: string,
    project: string,
    file: string,
    request_id: string,
  ) => {
    const entry: RequestLogEntry = {
      timestamp: new Date().toISOString(),
      status,
      message,
      project,
      file,
      request_id,
    }
    writeLog(logPath, entry)
  }
}

export function deleteOldLogs(logDir: string) {
  const files = readdirSync(logDir)
  const log = createSystemLogger()

  for (const file of files) {
    const match = file.match(/^mcp-[a-zA-Z0-9_-]+-(\d{4}-\d{2}-\d{2})\.log$/)
    if (!match) continue

    const fileDate = parseISO(match[1])
    const age = differenceInDays(new Date(), fileDate)

    if (age >= MAX_AGE_DAYS) {
      const fullPath = join(logDir, file)
      try {
        unlinkSync(fullPath)
        log({ logLevel: 'INFO', message: `🧹 削除: ${file} (${age}日経過)` })
      } catch (err) {
        log({ logLevel: 'ERROR', message: `⚠️ 削除失敗: ${file}`, data: err })
      }
    }
  }
}

deleteOldLogs(systemLogDir)
deleteOldLogs(requestLogDir)
