const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

const dataDir = path.resolve(__dirname, '..', 'src', 'data');
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.xlsx'));

async function inspect() {
  const results = [];
  for (const file of files) {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(path.join(dataDir, file));
    wb.eachSheet((sheet, id) => {
      if (id > 1) return; // Solo primera hoja
      const headerRow = sheet.getRow(1);
      const headers = [];
      headerRow.eachCell((cell, colNumber) => {
        headers.push(`${colNumber}:${cell.value}`);
      });
      const nombreCol = headers.find(h => h.toUpperCase().includes('NOMBRE'));
      const row2 = sheet.getRow(2);
      let nombreVal = '';
      if (nombreCol) {
        const colNum = parseInt(nombreCol.split(':')[0]);
        nombreVal = row2.getCell(colNum).value || '';
      }
      results.push({
        file,
        sheet: sheet.name,
        headers: headers.join(' | '),
        nombreColumn: nombreCol || 'NOT FOUND',
        nombreValue: nombreVal,
      });
    });
  }
  results.forEach(r => {
    console.log(`FILE: ${r.file}`);
    console.log(`  SHEET: ${r.sheet}`);
    console.log(`  HEADERS: ${r.headers}`);
    console.log(`  NOMBRE COL: ${r.nombreColumn}`);
    console.log(`  NOMBRE VAL: ${r.nombreValue}`);
    console.log('');
  });
}

inspect().catch(console.error);
