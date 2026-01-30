// ========================================
// Family Calendar - Google Apps Script
// ========================================

// スプレッドシートIDを取得または作成
function getOrCreateSpreadsheetId() {
  let ssId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  
  if (!ssId) {
    ssId = setupSpreadsheet();
  }
  
  return ssId;
}

// ウェブアプリのエントリーポイント
function doGet() {
  // スプレッドシートの初期化
  getOrCreateSpreadsheetId();
  
  return HtmlService.createTemplateFromFile('index_GAS')
    .evaluate()
    .setTitle('Family Calendar')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// HTMLにファイルを含めるためのヘルパー関数
function include(filename) {
  try {
    if (filename === 'styles') {
      return HtmlService.createHtmlOutputFromFile('styles').getContent();
    } else if (filename === 'script') {
      return HtmlService.createHtmlOutputFromFile('script_GAS').getContent();
    }
  } catch (error) {
    Logger.log('Error including ' + filename + ': ' + error);
    return '/* Error including ' + filename + ' */';
  }
  return '';
}

// スプレッドシートの初期設定
function setupSpreadsheet() {
  const ss = SpreadsheetApp.create('Family Calendar Data');
  const sheet = ss.getSheets()[0];
  sheet.setName('Events');
  
  // ヘッダー行を設定
  sheet.getRange(1, 1, 1, 7).setValues([
    ['ID', 'タイトル', '日付', '時間', 'カテゴリー', '説明', '作成日時']
  ]);
  
  // ヘッダーの書式設定
  sheet.getRange(1, 1, 1, 7)
    .setFontWeight('bold')
    .setBackground('#4a5568')
    .setFontColor('#ffffff');
  
  // 列幅を調整
  sheet.setColumnWidth(1, 150); // ID
  sheet.setColumnWidth(2, 200); // タイトル
  sheet.setColumnWidth(3, 120); // 日付
  sheet.setColumnWidth(4, 100); // 時間
  sheet.setColumnWidth(5, 120); // カテゴリー
  sheet.setColumnWidth(6, 300); // 説明
  sheet.setColumnWidth(7, 180); // 作成日時
  
  // スプレッドシートIDを保存
  const ssId = ss.getId();
  PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', ssId);
  
  Logger.log('スプレッドシートを作成しました: ' + ss.getUrl());
  return ssId;
}

// スプレッドシートを取得
function getSpreadsheet() {
  const ssId = getOrCreateSpreadsheetId();
  return SpreadsheetApp.openById(ssId);
}

// Eventsシートを取得
function getEventsSheet() {
  const ss = getSpreadsheet();
  return ss.getSheetByName('Events');
}

// ========================================
// データ操作関数
// ========================================

// 全イベントを取得
function getAllEvents() {
  try {
    const sheet = getEventsSheet();
    const lastRow = sheet.getLastRow();
    
    if (lastRow <= 1) {
      return [];
    }
    
    const data = sheet.getRange(2, 1, lastRow - 1, 7).getValues();
    
    return data.map(row => ({
      id: row[0],
      title: row[1],
      date: formatDateToString(row[2]),
      time: row[3],
      category: row[4],
      description: row[5],
      createdAt: row[6]
    })).filter(event => event.id); // 空行を除外
  } catch (error) {
    Logger.log('getAllEvents error: ' + error);
    return [];
  }
}

// イベントを追加
function addEvent(eventData) {
  try {
    const sheet = getEventsSheet();
    const id = Utilities.getUuid();
    const now = new Date();
    
    sheet.appendRow([
      id,
      eventData.title,
      new Date(eventData.date),
      eventData.time || '',
      eventData.category,
      eventData.description || '',
      now
    ]);
    
    return {
      success: true,
      id: id,
      message: 'イベントを追加しました'
    };
  } catch (error) {
    Logger.log('addEvent error: ' + error);
    return {
      success: false,
      message: 'エラー: ' + error.message
    };
  }
}

// イベントを更新
function updateEvent(eventData) {
  try {
    const sheet = getEventsSheet();
    const lastRow = sheet.getLastRow();
    
    if (lastRow <= 1) {
      return { success: false, message: 'イベントが見つかりません' };
    }
    
    const data = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    
    for (let i = 0; i < data.length; i++) {
      if (data[i][0] === eventData.id) {
        const rowNumber = i + 2;
        sheet.getRange(rowNumber, 2, 1, 5).setValues([[
          eventData.title,
          new Date(eventData.date),
          eventData.time || '',
          eventData.category,
          eventData.description || ''
        ]]);
        
        return {
          success: true,
          message: 'イベントを更新しました'
        };
      }
    }
    
    return { success: false, message: 'イベントが見つかりません' };
  } catch (error) {
    Logger.log('updateEvent error: ' + error);
    return {
      success: false,
      message: 'エラー: ' + error.message
    };
  }
}

// イベントを削除
function deleteEvent(eventId) {
  try {
    const sheet = getEventsSheet();
    const lastRow = sheet.getLastRow();
    
    if (lastRow <= 1) {
      return { success: false, message: 'イベントが見つかりません' };
    }
    
    const data = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    
    for (let i = 0; i < data.length; i++) {
      if (data[i][0] === eventId) {
        sheet.deleteRow(i + 2);
        return {
          success: true,
          message: 'イベントを削除しました'
        };
      }
    }
    
    return { success: false, message: 'イベントが見つかりません' };
  } catch (error) {
    Logger.log('deleteEvent error: ' + error);
    return {
      success: false,
      message: 'エラー: ' + error.message
    };
  }
}

// ========================================
// ヘルパー関数
// ========================================

// 日付をYYYY-MM-DD形式の文字列に変換
function formatDateToString(date) {
  if (!date) return '';
  
  if (typeof date === 'string') return date;
  
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

// スプレッドシートのURLを取得（デバッグ用）
function getSpreadsheetUrl() {
  const ss = getSpreadsheet();
  return ss.getUrl();
}
