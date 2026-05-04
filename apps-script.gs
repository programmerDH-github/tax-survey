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

const SHEET_NAME = 'Sheet1';

const COLUMNS = [
  '제출시각',
  '성명',
  '연락처',
  '유입경로',
  '주민등록번호',
  '홈택스아이디',
  '홈택스비밀번호',
  '신용카드',
  '직불/체크카드',
  '현금영수증',
  '은행명',
  '계좌번호',
  '추가문의사항',
];

function doPost(e) {
  try {
    const sheet = getOrCreateSheet();
    const data = JSON.parse(e.postData.contents);

    const row = [
      data.timestamp || new Date().toLocaleString('ko-KR'),
      data.name || '',
      data.phone || '',
      data.source || '',
      data.residentId || '',
      data.hometaxId || '',
      data.hometaxPw || '',
      data.creditCard || '',
      data.debitCard || '',
      data.cashReceipt || '',
      data.bank || '',
      data.account || '',
      data.memo || '',
    ];

    sheet.appendRow(row);

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
  const ss = SpreadsheetApp.getActiveSpreadsheet();
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

// 테스트용 — Apps Script 편집기에서 직접 실행 가능
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
        creditCard: '3,500,000',
        debitCard: '1,200,000',
        cashReceipt: '450,000',
        bank: '국민은행',
        account: '123456789012',
        memo: '테스트 제출입니다.',
      }),
    },
  };
  const result = doPost(mockEvent);
  Logger.log(result.getContent());
}
