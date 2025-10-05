# Play DevContainer

Turborepoを使用したmonorepoプロジェクトのサンプル実装です。

## 📋 概要

このプロジェクトは、DevContainerを使用した開発環境で、以下の技術スタックを採用しています：

- **Backend**: Hono
- **データベース**: PostgreSQL + Prisma ORM
- **ロガー**: Pino
- **monorepo管理**: Turborepo
- **コードフォーマッター**: Biome
- **型チェック**: TypeScript

## 🏗️ プロジェクト構造

```
.
├── apps/
│   └── backend/       # Hono APIサーバー
├── packages/
│   ├── db/            # Prismaを使用したデータベース管理
│   └── logger/        # Pinoベースのロガー
├── .devcontainer/     # DevContainer設定
├── docker-compose.yml # Docker設定
└── turbo.json         # Turborepo設定
```

## 🚀 はじめに

### 前提条件

- Docker
  - 作者が使っているのはrancher desktop
  - colima, finchでは動作が不安定だった
- Visual Studio Code
- Dev Containers拡張機能

### セットアップ

1. リポジトリをクローン
   ```bash
   git clone [repository-url]
   cd play-devcontainer
   ```

2. VS CodeでDevContainerを開く
   - VS Codeでプロジェクトを開く
   - コマンドパレット（F1）から「Dev Containers: Reopen in Container」を選択

3. 依存関係のインストール（DevContainer内で自動実行）
   ```bash
   npm install
   ```

4. データベースのセットアップ
   ```bash
   turbo db:migrate:dev
   ```

5. GitHubの認証
   ```bash
   gh auth login
   ```

## 🔧 個人設定 (setup.personal.sh)

Dev Containerは、個人用のカスタマイズを可能にするため、コンテナ作成時に `.devcontainer/setup.personal.sh` を自動実行します。
このファイルは、dotfiles、エイリアス、カスタム設定などの個人設定用に設計されています。

### 使用方法

1. `.devcontainer/setup.personal.sh` を編集して、個人の好みに合わせた設定を追加できます：
1. Dec Containerを再ビルドします。

## 🛠️ 開発コマンド

[turbo.jsonc](./turbo.jsonc)参照

## 🐳 Docker環境

プロジェクトはDevContainerで動作し、以下のサービスが含まれています：

- **開発コンテナ**: Node.js 24、Git、GitHub CLI、Turborepo, Claude code
- **PostgreSQL**: データベースサーバー（ポート5432）
- **フォワードポート**:
  - 3000: Backend APIサーバー
  - 5432: PostgreSQL
  - 5555: Prisma Studio

## 🧪 テスト

```bash
# 全テストの実行
turbo test

# テストの単発実行
turbo test:run
```

## 技術選定

### Dev Container

OSSに対するサプライチェーン攻撃などの状況を鑑みて、Dev Container上での開発を基本とする。

### npm
pnpmではなくnpmを使っている。

pnpmはnode_modulesにコードを配布する前にマシン全体のキャッシュとしてstoreに一度インストールし、そこからnode_modulesにハードリンクを作成する。
Dev Containerではマシンに対して基本的に一つのコードベースしか開発しないので、グローバルストアを経由する利点が薄く、シンボリックリンクの解決などのオーバーヘッドがある分余計な挙動であると言える。

そのため、このリポジトリではnpmを採用した。

### [Turborepo](https://turborepo.com/)
npm workspaceはpnpm workspaceと比べて非力である。
- 各workspaceのコマンドの実行
- pnpm deploy互換の機能がない

これを解決するためにTurborepoを採用した。

## 課題

- [ ] GitHub認証: 現在は`gh auth login`を使っているが、より権限の狭い認証状態を得る方法を探している。
- [x] vscodeでの挙動が不安定（git, biome, typecheckなどが無効になる）
  - エラー: `Remote Extension host terminated unexpectedly 3 times within the last 5 minutes.`
  - colimaをやめて、rancher desktopやOrbStackにしたら安定した
- [ ] hono RPCでresponse型が推論されない
- [ ] backend APIでJWT bearer tokenを検証する
- [ ] frontendのことをREADMEに書く


## 📄 ライセンス

MIT