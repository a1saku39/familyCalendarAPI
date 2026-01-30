# Family Calendar 📅

家族で共有できるモダンなカレンダーアプリケーション

## 概要

Family Calendarは、家族の予定を一元管理し、誰でもどこからでもアクセスできるように設計されたカレンダーアプリです。

### 主な機能

✨ **美しいUI** - グラスモーフィズムとダークモードで洗練されたデザイン  
📱 **レスポンシブ** - PC、スマホ、タブレットに対応  
🎨 **カテゴリー分け** - 家族、学校、仕事、記念日で色分け  
☁️ **クラウド同期** - Google スプレッドシートで家族全員とリアルタイム共有  
🔒 **安全** - Googleアカウントで認証可能

## ファイル構成

### オリジナル版（ローカル環境用）
- `index.html` - メインHTMLファイル
- `styles.css` - スタイルシート
- `app.js` - JavaScriptロジック（localStorageを使用）
- `walkthrough.md` - 使い方ガイド

### Google Apps Script版（クラウド共有用）
- `Code.gs` - サーバーサイドコード
- `index_GAS.html` - GAS用HTMLファイル
- `script_GAS.js` - GAS用JavaScriptファイル
- `styles.css` - スタイルシート（共通）
- `GAS_SETUP.md` - **詳細なセットアップガイド**

## 使い方

### ローカル環境で試す場合

1. `index.html` をブラウザで開く
2. 予定を追加・編集・削除できます
3. データはブラウザのlocalStorageに保存されます（端末ごとに独立）

### 家族で共有する場合（推奨）

**`GAS_SETUP.md` を参照してください。**

簡単な流れ：
1. Google Apps Scriptプロジェクトを作成
2. 必要なファイルをアップロード
3. ウェブアプリとしてデプロイ
4. 発行されたURLを家族と共有

詳細な手順は **GAS_SETUP.md** に記載されています。

## スクリーンショット

カレンダーの特徴：
- 月曜日始まりのカレンダー表示
- カテゴリーごとに色分けされた予定
- サイドバーで直近の予定を確認
- モーダルで簡単に予定を追加・編集

## 技術スタック

- **フロントエンド**: HTML, CSS, JavaScript（Vanilla）
- **バックエンド**: Google Apps Script
- **データベース**: Google Spreadsheet
- **フォント**: Google Fonts (Outfit, Zen Kaku Gothic New)
- **アイコン**: Font Awesome

## カスタマイズ

### カテゴリーを追加したい場合

1. `index_GAS.html` でカテゴリーのUI要素を追加
2. `styles.css` で色を定義
3. 必要に応じて `Code.gs` のデータ構造を調整

### デザインを変更したい場合

`styles.css` の以下の変数を編集：
```css
:root {
    --accent-family: #3b82f6;   /* 家族の色 */
    --accent-school: #10b981;   /* 学校の色 */
    --accent-work: #f59e0b;     /* 仕事の色 */
    --accent-birthday: #ec4899; /* 記念日の色 */
}
```

## ライセンス

このプロジェクトは個人・家族での使用を目的としています。

## サポート

質問やバグ報告がある場合は、プロジェクトの作成者に連絡してください。

---

家族で楽しく予定を共有しましょう！ 🎉
