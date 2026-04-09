const fs = require('fs');
const Papa = require('papaparse');

const csvContent = fs.readFileSync('mainexcel.csv', 'utf16le');
const results = Papa.parse(csvContent, { header: true });

const titleMapping = {};
results.data.forEach(row => {
  const original = row["problem_statement"];
  const revised = row["Revised Statement"];
  if (original && revised) {
    titleMapping[original.toLowerCase().trim()] = revised.toLowerCase().trim();
  }
});

console.log(JSON.stringify(titleMapping, null, 2));
