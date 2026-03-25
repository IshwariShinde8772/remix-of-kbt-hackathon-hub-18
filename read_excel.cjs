const XLSX = require('xlsx');
const fs = require('fs');

try {
  const workbook = XLSX.readFile('public/mainexcel.xlsx');
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet);
  console.log(JSON.stringify(data, null, 2));
} catch (err) {
  console.error('Error reading excel file:', err);
}
