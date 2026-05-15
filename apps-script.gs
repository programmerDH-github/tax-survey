// =====================================================
// Google Apps Script — 설문 폼 → 구글 스프레드시트 저장
// =====================================================
// 사용 방법:
//   1. Google Sheets 새 문서 생성
//   2. 확장 프로그램 > Apps Script 열기
//   3. 이 코드 전체 붙여넣기
//   4. 저장 후 [배포] > [새 배포] > 유형: 웹 앱
//   5. 액세스 권한: "모든 사용자" 로 설정 후 배포
//   6. 배포 URL을 index.html 의 SCRIPT_URL 에 붙여넣기

const SHEET_NAME = '2025년 귀속';
const SPREADSHEET_ID = '1s4C65OXYC_fDKB7aoGhSqYpEP3Vm5ifA2oMmn9vvbvA';

const COLUMNS = [
  '대표자',
  '주민등록번호',
  '아이디',
  '비밀번호',
  '연락처',
  '유입경로',
  '제출시각',
  '은행명',
  '계좌번호',
  '1차 안내(통화)',
  '추가문의사항',
];

function doPost(e) {
  try {
    const sheet = getOrCreateSheet();
    const data = JSON.parse(e.postData.contents);

    const row = [
      data.name || '',
      data.residentId || '',
      data.hometaxId || '',
      data.hometaxPw || '',
      data.phone || '',
      data.source || '',
      data.timestamp || new Date().toLocaleString('ko-KR'),
      data.bank || '',
      data.account || '',
      '',
      data.memo || '',
    ];

    sheet.appendRow(row);
    sheet.getRange(sheet.getLastRow(), 10).insertCheckboxes();

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(COLUMNS);
    sheet.getRange(1, 1, 1, COLUMNS.length)
      .setFontWeight('bold')
      .setBackground('#4a9068')
      .setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }

  return sheet;
}

// 조건부 서식 설정 — 최초 1회만 실행
function setupConditionalFormatting() {
  const sheet = getOrCreateSheet();
  const range = sheet.getRange('A2:K1000');

  const rule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=$J2=TRUE')
    .setBackground('#d9f7e2')
    .setFontColor('#276221')
    .setRanges([range])
    .build();

  const rules = sheet.getConditionalFormatRules();
  rules.push(rule);
  sheet.setConditionalFormatRules(rules);

  Logger.log('조건부 서식 설정 완료');
}

// 디버깅용 — 스프레드시트 연결 확인
function debugSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  Logger.log('스프레드시트 이름: ' + ss.getName());
  const sheets = ss.getSheets().map(s => s.getName());
  Logger.log('모든 시트 목록: ' + sheets.join(', '));
  const sheet = ss.getSheetByName(SHEET_NAME);
  Logger.log('시트 찾음: ' + (sheet !== null));
  if (sheet) Logger.log('마지막 행: ' + sheet.getLastRow());
}

// 테스트용 — Apps Script 편집기에서 직접 실행 가능
function testPost() {
  const mockEvent = {
    postData: {
      contents: JSON.stringify({
        timestamp: new Date().toLocaleString('ko-KR'),
        name: '이동훈',
        residentId: '930804-1234567',
        hometaxId: 'test_id',
        hometaxPw: 'test_pw',
        phone: '010-1234-5678',
        source: '검색',
        bank: '기업은행',
        account: '01012345678',
        memo: '이동훈의 테스트 제출입니다.',
      }),
    },
  };
  const result = doPost(mockEvent);
  Logger.log(result.getContent());
}
