# node:24-slim (Production Docker Image)

## 選定理由

本番環境のDockerコンテナ（`apps/backend/Dockerfile`）で`node:24-slim`を採用した理由は、**開発容易性（問題発生リスクの少なさ）とイメージサイズのバランス**を重視したためである。

### 主な判断基準

1. **イメージサイズの小ささ**
   - 通常の`node:24`（約1GB）に比べて大幅に削減（約150-200MB）
   - 必要最小限のパッケージのみを含む

2. **セキュリティ問題の少なさ**
   - 攻撃面を縮小（不要なパッケージを含まない）
   - alpineには劣るが、十分なセキュリティレベル

3. **開発容易性の高さ**
   - Debian/glibcベースで互換性問題が少ない
   - トラブルシューティングが容易

## 代替案との比較

### node:alpine

**採用を見送った理由**:

alpineはイメージサイズ（50-100MB）とセキュリティ面で優れているが、以下の問題により**開発容易性を優先**して採用を見送った。

#### 1. musl libcとglibcの互換性問題

Alpine Linuxはmusl libcを使用しており、一般的なglibc環境との間に以下の互換性問題がある：

- **Node.js公式バイナリが動作しない**
  - Node.js公式サイト（nodejs.org）のバイナリは全てglibcビルド
  - Alpine上で使用するには非公式ビルド（unofficial-builds.nodejs.org）が必要
  - 参考: [Node.js公式Issue](https://github.com/nodejs/build/issues/1140)

- **ABIレベルでの非互換**
  - muslとglibcは**ABI互換性がない**（意図的に互換を目指していない）
  - Alpine上でglibcをインストールすることは非推奨（システムの不安定化）
  - 参考: [Chainguard Academy - glibc vs. musl](https://edu.chainguard.dev/chainguard/chainguard-images/about/images-compiled-programs/glibc-vs-musl/)

- **Thread stack sizeの違い**
  - musl: デフォルト128KB
  - glibc: 2-10MB（リソースリミットに応じて変動）
  - マルチスレッドコードでクラッシュのリスク

- **Node.jsの公式サポート状況**
  - glibc: Tier 1サポート（本番環境推奨）
  - musl/Alpine: 実験的サポート
  - 公式ドキュメント: "For production applications, run Node.js on supported platforms only."

#### 2. ネイティブモジュール（node-gyp）のビルド問題

Alpine環境では、ネイティブモジュールのビルドに追加の依存関係が必要となる：

- **必須パッケージの追加インストール**
  - `python3`, `make`, `g++`等のビルドツールが必要
  - これらはデフォルトのAlpineイメージに含まれていない
  - 参考: [node-gyp support in alpine linux](https://dev.to/grigorkh/node-gyp-support-in-alpine-linux-4d0f)

- **一般的なエラー**
  - "Can't find Python executable 'python'" during `npm install`
  - node-gypのコンパイルエラーが頻発
  - 参考: [Docker Node Alpine Image Build Fails on node-gyp](https://stackoverflow.com/questions/54428608/)

- **回避策のコスト**
  ```dockerfile
  RUN apk add --no-cache --virtual .gyp python make g++ \
      && npm install \
      && apk del .gyp
  ```
  - ビルドプロセスの複雑化
  - CI/CDでのビルド時間増加

- **プリビルトバイナリの問題**
  - 多くの人気モジュールはプリビルトバイナリを提供
  - しかし、これらは**glibc前提**でビルドされている
  - Alpine（musl）では再ビルドが必要になるケースが多い

#### 3. Prisma固有の問題

本プロジェクトではPrisma ORMを使用しており、Alpine環境での以下の問題が報告されている：

- **OpenSSL関連の問題**
  - Alpine 3.21等の新しいバージョンでPrismaが失敗する
  - 手動でのOpenSSLインストールが回避策として必要
  - 参考: [Prisma failing on changed OpenSSL path in Alpine 3.21](https://github.com/nodejs/docker-node/issues/2175)

- **Prisma公式の推奨事項**
  - Prisma公式ドキュメントは`node:slim`を推奨
  - "Don't install glibc on Alpine as that would prevent Prisma from running successfully"
  - 参考: [How to use Prisma in Docker](https://www.prisma.io/docs/guides/docker)

- **バージョン固有の回避策**
  - OpenSSLエラーを避けるため、特定のAlpineバージョン（例: node:18-alpine3.20）に固定する必要
  - これはセキュリティアップデートの柔軟性を損なう

### node:24（非slim）

**採用を見送った理由**:

- イメージサイズが大きすぎる（約1GB）
- 不要なパッケージが多く含まれ、攻撃面が広い
- slimで十分な機能性が得られるため、過剰

### Chainguard等のDistroless/Minimal Images

**検討していない**:

- 評価不足
- 再選定時の候補として検討可能

## node:slimの利点

### 1. glibc環境の安定性

- Debian/glibcベースで広範な互換性
- Node.jsの公式サポート対象（Tier 1）
- ネイティブモジュールが追加設定なしで動作するケースが多い

### 2. トラブルシューティングの容易性

- Debian環境のため、ドキュメント・コミュニティサポートが豊富
- デバッグツールが充実（Alpine/muslでは一部のサニタイザーが非対応）

### 3. 推奨されるベストプラクティス

複数の情報源が`node:slim`を第一選択肢として推奨：

> "Always try building your Node.js applications using the node:<version>-slim image first and switch to the 'fat' node:<version> variant only if you see some node-gyp-related failures."
>
> 引用元: [A Deeper Look into Node.js Docker Images](https://labs.iximiuz.com/tutorials/how-to-choose-nodejs-container-image)

> "For most cases, the slimmer and more efficient choice is node:<version>-slim. If security vulnerabilities (CVEs) and image size aren't your top priorities, go with node:<version>-slim for a smoother experience."

## トレードオフの受け入れ

### セキュリティ面での妥協

- **alpineには劣る**が、開発容易性を優先
- DevContainerでの開発環境セキュリティは別途確保
- 本番環境では、コンテナ自体のセキュリティよりもアプリケーションレベルのセキュリティを重視

### イメージサイズの受け入れ

- Alpine（50-100MB）と比較して1.5〜4倍大きい（150-200MB）
- **プロダクトの性質から十分許容できる**
  - デプロイ頻度が高くない
  - ネットワーク帯域・ストレージコストが制約にならない
  - プルタイム・起動時間は許容範囲

## Dockerfile構成との整合性

現在の`apps/backend/Dockerfile`はマルチステージビルドを採用：

1. **Builder**: Turborepoでの依存関係抽出
2. **Installer**: `npm ci`での依存関係インストール
3. **Runner**: 最終実行イメージ

この構成では、すべてのステージで`node:24-slim`を使用することで：
- ビルド環境と実行環境の一貫性を確保
- node-gyp等のビルドツールが必要な場合も追加設定不要

## 批判的考察

### セキュリティ優先度の矛盾

DevContainerでセキュリティを最優先する一方、本番イメージでalpineを選ばないのは**一貫性に欠ける**との批判が可能。

**反論**:
- DevContainerは開発者環境のホスト保護が目的
- 本番コンテナは既にオーケストレーション層（Kubernetes等）で分離されている前提
- 開発容易性を下げると、セキュリティパッチの適用速度が遅れるリスク

また[bunへの移行](./nodejs-runtime.md)によって、スムーズにalpineへ移行できる可能性がある。

### 将来的なリスク

1. **Alpineエコシステムの成熟**
   - 今後、PrismaやNode.js公式のmuslサポートが改善される可能性
   - その場合、slimを選んだことが技術的負債になる可能性

2. **イメージサイズの肥大化**
   - 依存関係の増加でslimイメージも大きくなる傾向
   - 一定のサイズを超えた場合、alpineへの移行コストが高くなる

### 再選定の検討が必要なケース

以下の状況では、Alpineへの移行を検討すべき：

1. **デプロイ頻度の大幅な増加**
   - CI/CDでのイメージプル時間が問題になる場合

2. **コスト制約の顕在化**
   - レジストリストレージ・ネットワーク転送コストが無視できなくなる場合

3. **PrismaのAlpineサポート改善**
   - 公式ドキュメントがAlpineを推奨するようになった場合

4. **セキュリティ要件の厳格化**
   - CVEスキャンで許容できない脆弱性が頻発する場合
   - コンプライアンス要件でイメージサイズの最小化が求められる場合

## TODO解決

Dockerfileの`# TODO: fix node version when use for production`について：

- **想定される意図**: Node.js 24のLTSステータス確認
- **対応方針**: Node.js 24が2024年10月にLTSに移行済みのため、TODOは解決済みと考えられる
- **推奨アクション**: TODOコメントを削除するか、具体的な懸念を明記

---

**結論**: `node:24-slim`は**開発容易性と運用安定性を優先した現実的な選択**である。Alpineのイメージサイズ・セキュリティ優位性よりも、glibc互換性・Prismaサポート・トラブルシューティングの容易性を重視した。プロダクトの性質とチームの運用能力を考慮し、現時点での最適解として採用している。
