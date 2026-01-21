export const parseTableToMarkdown = (input: string): string => {
    const lines = input.trim().split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) return '';

    // Detect delimiter: Check the first line for tab or comma
    const firstLine = lines[0];
    // Heuristic: If tab exists, assume tab-separated (common for Excel copy-paste)
    const isTab = firstLine.includes('\t');
    const delimiter = isTab ? '\t' : ','; // Default to comma if no tab, or simple space if logic needed

    // Parse Headers
    // Split by delimiter and trim each cell
    const headers = firstLine.split(delimiter).map(h => h.trim());

    // Parse Body
    const body = lines.slice(1).map(line => {
        const cells = line.split(delimiter).map(c => c.trim());
        // Handle cases where comma-separated values might have fewer cells
        return cells;
    });

    // Determine max columns (in case some rows have extra data, though headers usually define it)
    // We stick to header count for the markdown table structure
    const colCount = headers.length;

    // Build Markdown
    // Header Row
    let md = `\n| ${headers.join(' | ')} |\n`;

    // Separator Row
    md += `| ${headers.map(() => '---').join(' | ')} |\n`;

    // Body Rows
    body.forEach(row => {
        // Normalize row length to match headers
        const normalizedRow = [...row];
        while (normalizedRow.length < colCount) normalizedRow.push('');
        // Truncate if too many? or just show them. Markdown tables can be messy if mismatched.
        // We'll just slice to colCount to keep it valid
        const validRow = normalizedRow.slice(0, colCount);

        md += `| ${validRow.join(' | ')} |\n`;
    });

    return md;
};
