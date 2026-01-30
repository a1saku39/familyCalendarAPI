# 最小構成版での動作確認

Cross-Origin-Opener-Policy エラーが出ていますが、これは**警告**であり、通常はアプリの動作を妨げません。

## 🎯 確実に動作させる方法

すべてを1ファイルにまとめた **minimal.html** を作成しました。

### 使い方

#### 1. GASエディタで minimal をアップロード

1. GASエディタを開く
2. 「+」→「HTML」
3. ファイル名を `minimal` にする
4. **minimal.html** の全内容をコピー＆ペースト
5. 保存

#### 2. Code.gs の doGet を変更

```javascript
function doGet() {
  getOrCreateSpreadsheetId();
  
  return HtmlService.createHtmlOutputFromFile('minimal')
    .setTitle('Family Calendar')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
```

#### 3. デプロイ

1. 保存
2. デプロイ → デプロイを管理 → 編集
3. 新バージョン → デプロイ

## ✅ 確認すること

minimal.html で以下が動作するか確認：

1. ページが表示される
2. 「予定を読み込む」ボタンをクリックして、正常に読み込める
3. 「予定を追加」ボタンで予定を追加できる
4. ページをリロードしても予定が残っている

## 🔍 それでもダメな場合

以下の情報を教えてください：

### 1. ブラウザのコンソール（F12）のエラー

すべての赤いエラーメッセージをコピーしてください。

### 2. GASエディタで Code.gs を実行

1. Code.gsを開く
2. 関数のドロップダウンから `getAllEvents` を選択
3. 実行ボタンをクリック
4. 実行ログに何が表示されるか教えてください

### 3. スプレッドシートの確認

1. GASエディタで、関数のドロップダウンから `getSpreadsheetUrl` を選択
2. 実行
3. 実行ログに表示されるURLを開く
4. スプレッドシートが作成されているか確認

## 💡 Cross-Origin-Opener-Policy について

このエラーは：
- ⚠️ **警告**であり、エラーではない
- 🔒 Google のセキュリティポリシーによるもの
- ✅ **アプリの機能には影響しない**（ほとんどの場合）

カレンダーが表示されて、予定の追加・表示ができていれば、このエラーは**無視してOK**です。
