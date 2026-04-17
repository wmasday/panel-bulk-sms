require('dotenv').config();
const xlsx = require('xlsx');
const path = require('path');
const { Phone, Group, sequelize } = require('../models');

async function importExcel() {
    // Usage: node scripts/importExcel.js <file_path> <group_prefix> [chunk_size] [type]
    const args = process.argv.slice(2);
    if (args.length < 2) {
        console.log('Usage: node scripts/importExcel.js <file_path> <group_prefix> [chunk_size] [type]');
        console.log('Example: node scripts/importExcel.js contacts.xlsx "Marketing" 500 whatsapp');
        process.exit(1);
    }

    const [filePath, groupPrefix, chunkSizeArg, typeArg] = args;
    const chunkSize = parseInt(chunkSizeArg) || 500;
    const type = typeArg || 'whatsapp';
    const resolvedPath = path.resolve(filePath);

    console.log(`--- Excel Import Started ---`);
    console.log(`File: ${resolvedPath}`);
    console.log(`Prefix: ${groupPrefix}`);
    console.log(`Chunk Size: ${chunkSize}`);
    console.log(`Type: ${type}`);

    try {
        const workbook = xlsx.readFile(resolvedPath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);

        if (data.length === 0) {
            console.error('Error: Excel file is empty.');
            process.exit(1);
        }

        // Identify phone column
        const firstRow = data[0];
        const phoneKey = Object.keys(firstRow).find(k => k.toLowerCase() === 'phone');
        
        let phoneList = [];
        if (phoneKey) {
            phoneList = data.map(row => row[phoneKey]).filter(p => p !== undefined && p !== null);
        } else {
            // Fallback to the first column
            const firstKey = Object.keys(firstRow)[0];
            console.log(`Warning: "phone" column not found. Using the first column: "${firstKey}"`);
            phoneList = data.map(row => row[firstKey]).filter(p => p !== undefined && p !== null);
        }

        // Clean phone numbers (convert to string, trim)
        phoneList = phoneList.map(p => String(p).trim()).filter(p => p !== "");

        if (phoneList.length === 0) {
            console.error('Error: No phone numbers found in the selected column.');
            process.exit(1);
        }

        console.log(`Found ${phoneList.length} phone numbers. Starting import...`);

        const t = await sequelize.transaction();

        try {
            let totalGroups = 0;
            let totalPhones = 0;

            for (let i = 0; i < phoneList.length; i += chunkSize) {
                const chunk = phoneList.slice(i, i + chunkSize);
                const groupIndex = Math.floor(i / chunkSize) + 1;
                const title = `${groupPrefix} ${groupIndex}`;

                const group = await Group.create({
                    title: title,
                    type: type,
                    status: true
                }, { transaction: t });

                const phoneRecords = chunk.map(p => ({
                    phone: p,
                    group_id: group.id,
                    type: type,
                    status: true
                }));

                await Phone.bulkCreate(phoneRecords, { transaction: t });
                
                totalGroups++;
                totalPhones += chunk.length;
                console.log(`Created group: ${title} (${chunk.length} phones)`);
            }

            await t.commit();
            console.log(`--- Import Successful ---`);
            console.log(`Total Groups: ${totalGroups}`);
            console.log(`Total Phones: ${totalPhones}`);
        } catch (error) {
            await t.rollback();
            throw error;
        }

    } catch (error) {
        console.error('--- Import Failed ---');
        console.error(error.message);
        process.exit(1);
    }
}

importExcel();
