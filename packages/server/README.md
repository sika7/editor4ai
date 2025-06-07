# @sika7/editor4ai-server

MCP Server for file operations and development tools - A powerful MCP (Model Context Protocol) server that provides AI assistants with safe and controlled access to file system operations and development workflows.

## インストール

```bash
npm install @sika7/editor4ai-server
```

## 概要

`@sika7/editor4ai-server`は、AI開発ツール用のMCPサーバーです。`@sika7/editor4ai-lib`のコア機能をMCPプロトコル経由で提供し、AI（Claude、GPT等）がファイルシステム操作、検索、開発ワークフローを安全に実行できるインターフェイスを提供します。

## 主な機能

### MCP対応ツール群

#### ファイル操作ツール
- `fileReed`: ファイル内容の読み取り（行番号、範囲指定対応）
- `fileWrite`: ファイルの作成・上書き
- `editLinesInFile`: 指定行の編集・置換
- `insertLinesInFile`: 新しい行の挿入
- `deleteLinesInFile`: 指定行の削除
- `fileDelete`: ファイルの削除
- `fileMoveOrRename`: ファイル・ディレクトリの移動・リネーム

#### ディレクトリ操作ツール
- `directoryTree`: プロジェクト構造のツリー表示
- `fileList`: ディレクトリ内ファイル一覧
- `createDirectory`: ディレクトリ作成
- `removeDirectory`: ディレクトリ削除

#### 検索・Grepツール
- `findInFile`: ファイル内検索（正規表現対応）
- `projectGrep`: プロジェクト全体横断検索
- フィルタリング、除外パターン、コンテキスト表示

#### スクリプト実行ツール
- カスタムnpmスクリプトの実行
- フォーマット、テスト、ビルドなどの開発ワークフロー

### 設定管理
- プロジェクト別設定
- セキュリティポリシー
- ログ設定

## セットアップ

### 1. グローバルインストール

```bash
npm install -g @sika7/editor4ai-server
```

### 2. 設定ファイル作成

`~/.config/editor4ai/config.yaml` に設定ファイルを配置します。

```yaml
log_path: '/path/to/logs'
excluded_files:
  - '**/*.pem'
  - '**/*.key'

current_project: 'project1'
projects:
  project1:
    src: '/path/to/project1/src'
    scripts:
      build: 'npm run build'
      test: 'npm run test'
    excluded_files:
      - '**/.env'
      - 'logs/**/*.log'
```

### 3. MCPクライアント設定

#### Claude Desktop の場合

`claude_desktop_config.json` に追加：

```json
{
  "mcpServers": {
    "editor4ai": {
      "command": "editor4ai",
      "args": []
    }
  }
}
```

#### カスタムMCPクライアントの場合

```typescript
import { StdioServerTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'

const transport = new StdioServerTransport({
  command: 'editor4ai',
  args: []
})

const client = new Client({ name: "my-app", version: "1.0.0" }, {
  capabilities: {}
})

await client.connect(transport)
```

## 使用例

### 基本的なファイル操作

```
# ファイル読み取り
Human: プロジェクトのREADME.mdを読んで

AI: [fileReed tool で README.md を読み取り]

# ファイル編集
Human: src/index.ts の5行目を修正して

AI: [editLinesInFile tool で指定行を編集]

# 新しいファイル作成
Human: 新しいコンポーネントファイルを作成して

AI: [fileWrite tool で新しいファイルを作成]
```

### プロジェクト検索

```
Human: "useState" を使っているファイルを全て見つけて

AI: [projectGrep tool でプロジェクト全体を検索]
```

### 開発ワークフロー

```
Human: コードをフォーマットしてテストを実行して

AI: [script_fmt と script_test ツールを順次実行]
```

## セキュリティ機能

### パストラバーサル防止
- プロジェクトルート外へのアクセス制限
- 相対パス・絶対パスの安全性チェック
- シンボリックリンク攻撃の防止

### アクセス制御
- 設定ファイルで許可された操作のみ実行
- ファイルタイプ・パターンによる制限
- スクリプト実行の白リスト方式

### ログ・監査
- 全操作のログ記録
- エラートラッキング
- セキュリティイベントの監視

## 開発・デバッグ

### ローカル開発

```bash
# 依存関係インストール
npm install

# TypeScriptビルド
npm run build

# 開発モード（MCPインスペクター使用）
npm run dev

# 本番実行
npm start
```

### MCPインスペクターでのデバッグ

```bash
# インスペクター起動（開発時）
npm run dev
```

ブラウザで `http://localhost:3000` にアクセスしてMCPツールをテスト可能。

### ログ確認

```bash
# システムログ
tail -f /path/to/logs/system.log

# エラーログ
tail -f /path/to/logs/error.log
```

## 設定オプション

### プロジェクト設定

```json
{
  "current_project": "project-name",
  "projects": {
    "project-name": {
      "root": "/absolute/path/to/project",
      "scripts": {
        "script-name": "npm run command"
      },
      "exclude_patterns": ["node_modules/**", "*.log"],
      "max_file_size": 10485760
    }
  },
  "log_path": "/path/to/logs",
  "log_level": "info"
}
```

### スクリプト設定例

```json
{
  "scripts": {
    "fmt": "prettier --write .",
    "test": "vitest run",
    "test:watch": "vitest",
    "build": "tsc && vite build",
    "lint": "eslint . --fix",
    "typecheck": "tsc --noEmit"
  }
}
```

## トラブルシューティング

### よくある問題

#### 1. 権限エラー
```bash
# ファイル権限の確認
ls -la /path/to/project

# 実行権限の付与
chmod +x ~/.local/bin/editor4ai
```

#### 2. 設定ファイルが見つからない
```bash
# 設定ファイルの場所確認
echo $HOME/.config/editor4ai/config.yaml

# 設定ファイルの作成
touch ~/.config/editor4ai/config.yaml
```

### ログパス

ログファイルは以下のパスに保存されます：

- システムログとリクエストログ: `~/.local/state/editor4ai/logs/mcp-{YYYY-MM-DD}.log`
- ログファイルは日付ごとに作成され、30日経過したファイルは自動的に削除されます

## パフォーマンス

- **メモリ使用量**: 通常 50-100MB
- **ファイル処理**: 最大10MB（設定可能）
- **同時接続**: 1つのMCPクライアントあたり
- **レスポンス時間**: 一般的なファイル操作で < 100ms

## ライセンス

Apache License 2.0 - 詳細は [LICENSE](LICENSE) ファイルを参照してください。

## 貢献

プロジェクトへの貢献をお待ちしています。詳細は [CONTRIBUTING.md](../../CONTRIBUTING.md) を参照してください。

## サポート

- バグレポート: GitHub Issues
- 機能リクエスト: GitHub Discussions
- ドキュメント: [docs/](../../docs/) ディレクトリ
