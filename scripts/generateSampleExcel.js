const xlsx = require('xlsx');
const path = require('path');

const data = [
    { phone: '628111111111' },
    { phone: '628222222222' },
    { phone: '628333333333' },
    { phone: '628444444444' },
    { phone: '628555555555' },
    { phone: '628666666666' },
    { phone: '628777777777' },
    { phone: '628888888888' },
    { phone: '628999999999' },
    { phone: '628000000000' },
];

// Generate more sample phones for chunking test (e.g. 50 total)
for (let i = 11; i <= 50; i++) {
    data.push({ phone: `628${i.toString().padStart(9, '0')}` });
}

const worksheet = xlsx.utils.json_to_sheet(data);
const workbook = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(workbook, worksheet, 'Sample Phones');

const fileName = 'sample_phones.xlsx';
const filePath = path.join(process.cwd(), fileName);

xlsx.writeFile(workbook, filePath);

console.log(`Sample Excel file created successfully at: ${filePath}`);
console.log(`Total records: ${data.length}`);
