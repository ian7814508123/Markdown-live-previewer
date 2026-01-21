import * as XLSX from 'xlsx';
import { parseTableToMarkdown } from './tableParser';

export const parseExcelToMarkdown = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                if (!data) return resolve('');

                const workbook = XLSX.read(data, { type: 'array' });

                // Get the first sheet
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];

                // Convert to CSV string, then use our existing table parser
                // Using CSV as an intermediate format is robust enough for simple tables
                const csv = XLSX.utils.sheet_to_csv(sheet);

                // Use the existing CSV/Table parser
                const md = parseTableToMarkdown(csv);
                resolve(md);
            } catch (err) {
                console.error("Excel parse error:", err);
                reject(err);
            }
        };

        reader.onerror = (err) => reject(err);

        reader.readAsArrayBuffer(file);
    });
};
