# @mcp-code/lib

Core file operations library for MCP-Code - A lightweight TypeScript library for safe and efficient file operations, search functionality, and project management.

## インストール

```bash
npm install @mcp-code/lib
```

## 概要

`@mcp-code/lib`は、MCP-Codeプロジェクトのコアライブラリです。ファイルシステム操作、検索機能、差分計算、ログ管理などの基本機能を提供し、他のパッケージから再利用できるように設計されています。

## 主な機能

### ファイル操作 (files.ts)
- **ファイル読み取り**: テキストファイルの安全な読み込み
- **ファイル書き込み**: 新規ファイル作成・既存ファイル上書き
- **行編集**: 指定行範囲の編集・置換
- **行挿入**: 特定位置への行挿入
- **行削除**: 指定行・行範囲の削除
- **ファイル・ディレクトリ操作**: 作成、削除、移動、リネーム

### 検索・Grep機能 (search.ts)
- **ファイル内検索**: 正規表現対応のGrep機能
- **プロジェクト全体検索**: 複数ファイル横断検索
- **フィルタリング**: ファイルタイプ、除外パターン指定
- **コンテキスト表示**: マッチ行の前後行表示

### ディレクトリ操作 (directory.ts)
- **ディレクトリ作成・削除**: 再帰的な操作対応
- **ディレクトリ一覧**: ツリー表示、フィルタリング
- **パス解決**: 安全なパス操作

### 差分計算 (diff.ts)
- **文字列差分**: 行レベルでの差分検出
- **ファイル差分**: ファイル間の変更点表示

### スクリプト実行 (script.ts)
- **npmスクリプト実行**: package.jsonスクリプトの実行
- **出力キャプチャ**: 実行結果の取得

### ログ管理 (logs.ts)
- **構造化ログ**: JSON形式でのログ出力
- **エラートラッキング**: リクエスト単位でのエラー管理
- **ログレベル制御**: 出力レベルの調整

### ユーティリティ (util.ts)
- **パス操作**: 相対パス変換、安全性チェック
- **設定管理**: 設定ファイルの読み込み
- **ID生成**: ユニークなリクエストID生成

## 使用例

### 基本的な使用方法

```typescript
import { Core } from '@mcp-code/lib'

// Coreクラスのインスタンス作成
const core = new Core('/path/to/project')

// ファイル読み取り
const content = await core.fileRead('src/index.ts')

// ファイル書き込み
await core.fileWrite('output.txt', 'Hello, World!')

// プロジェクト内検索
const results = await core.projectGrep('function', {
  fileTypes: ['.ts', '.js'],
  context: 2
})
```

### 型安全な検索オプション

```typescript
import { DirectoryGrepOptionsSchema, type DirectoryGrepOptionsInput } from '@mcp-code/lib'

const searchOptions: DirectoryGrepOptionsInput = {
  regex: true,
  caseSensitive: false,
  maxResults: 100,
  context: 3,
  fileTypes: ['.ts', '.tsx'],
  exclude: ['node_modules', 'dist']
}

// Zodスキーマで検証
const validatedOptions = DirectoryGrepOptionsSchema.parse(searchOptions)
```

### ログの設定

```typescript
import { createSystemLogger, createRequestErrorLogger } from '@mcp-code/lib'

const systemLog = createSystemLogger('/path/to/logs')
const errorLog = createRequestErrorLogger('/path/to/logs')

systemLog.info('System started')
errorLog.error('Request failed', { requestId: 'req-123', error: 'File not found' })
```

## 設計原則

- **型安全性**: TypeScriptとZodスキーマによる実行時型チェック
- **セキュリティ**: パストラバーサル攻撃防止、安全なファイルアクセス
- **モジュラー設計**: 機能ごとに分離された独立したモジュール
- **テスタビリティ**: 各機能の単体テスト対応
- **軽量性**: 最小限の依存関係で高パフォーマンス

## 依存関係

### 本番依存関係
- `date-fns`: 日付処理
- `fast-xml-parser`: XML解析
- `fs-extra`: 拡張ファイルシステム操作
- `js-yaml`: YAML解析
- `minimatch`: ファイルパターンマッチング
- `papaparse`: CSV解析
- `toml`: TOML解析
- `yaml`: YAML処理
- `zod`: スキーマ検証・型安全性

### 開発依存関係
- `typescript`: TypeScriptコンパイラ
- `@types/*`: 型定義ファイル

## ビルド・開発

```bash
# 依存関係のインストール
npm install

# TypeScriptビルド
npm run build

# 開発モード（ウォッチモード）
npm run dev

# クリーンビルド
npm run clean && npm run build
```

## ライセンス

Apache License 2.0 - 詳細は [LICENSE](LICENSE) ファイルを参照してください。

## 貢献

プロジェクトへの貢献をお待ちしています。詳細は [CONTRIBUTING.md](../../CONTRIBUTING.md) を参照してください。
