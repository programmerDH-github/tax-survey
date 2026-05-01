// =====================================================
// Google Apps Script — 설문 폼 → 구글 스프레드시트 + 드라이브 저장
// =====================================================
// 코드 수정 후 [배포] > [배포 관리] > 연필 아이콘 > 버전: 새 버전 > 배포
// (URL은 그대로 유지됩니다)

const SHEET_NAME = 'Sheet1';
const DRIVE_FOLDER_NAME = '종합소득세_첨부파일'; // 구글 드라이브에 생성될 폴더명

const COLUMNS = [
  '제출시각',
  '성명',
  '연락처',
  '유입경로',
  '주민등록번호',
  '홈택스아이디',
  '홈택스비밀번호',
  '은행명',
  '계좌번호',
  '추가문의사항',
  '첨부파일링크',
];

function doPost(e) {
  try {
    const sheet = getOrCreateSheet();
    const data = JSON.parse(e.postData.contents);

    let fileUrl = '';
    if (data.file && data.file.data) {
      fileUrl = saveFileToDrive(data.file, data.name);
    }

    const row = [
      data.timestamp || new Date().toLocaleString('ko-KR'),
      data.name || '',
      data.phone || '',
      data.source || '',
      data.residentId || '',
      data.hometaxId || '',
      data.hometaxPw || '',
      data.bank || '',
      data.account || '',
      data.memo || '',
      fileUrl,
    ];

    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success', fileUrl }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function saveFileToDrive(fileData, submitterName) {
  const folder = getOrCreateFolder(DRIVE_FOLDER_NAME);
  const timestamp = new Date().toISOString().slice(0, 10); // 2025-05-01
  const safeName = (submitterName || '미입력').replace(/[^가-힣a-zA-Z0-9]/g, '_');
  const fileName = `${timestamp}_${safeName}_${fileData.name}`;

  const decoded = Utilities.base64Decode(fileData.data);
  const blob = Utilities.newBlob(decoded, fileData.type, fileName);
  const file = folder.createFile(blob);

  // 링크 공유 설정 (URL이 있으면 볼 수 있음)
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  return file.getUrl();
}

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(COLUMNS);
    sheet.getRange(1, 1, 1, COLUMNS.length)
      .setFontWeight('bold')
      .setBackground('#4f8ef7')
      .setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function getOrCreateFolder(name) {
  const folders = DriveApp.getFoldersByName(name);
  if (folders.hasNext()) return folders.next();
  return DriveApp.createFolder(name);
}

// 테스트용
function testPost() {
  const mockEvent = {
    postData: {
      contents: JSON.stringify({
        timestamp: new Date().toLocaleString('ko-KR'),
        name: '홍길동',
        phone: '010-1234-5678',
        source: '검색',
        residentId: '900101-1234567',
        hometaxId: 'test_id',
        hometaxPw: 'test_pw',
        bank: '국민은행',
        account: '123456789012',
        memo: '테스트 제출입니다.',
        file: null,
      }),
    },
  };
  const result = doPost(mockEvent);
  Logger.log(result.getContent());
}
