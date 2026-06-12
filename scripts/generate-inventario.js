const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

const SPEC_DIR = path.resolve(__dirname, '..', 'tests');
const OUTPUT = path.resolve(__dirname, '..', 'docs', 'inventario-tests-automatizados.xlsx');

// ── Recopilar tests desde todos los .spec.ts ──
function collectTests() {
    const entries = [];
    const files = walkSpecFiles(SPEC_DIR);

    for (const filePath of files) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const relPath = path.relative(path.resolve(__dirname, '..'), filePath).replace(/\\/g, '/');

        // Extract all test() descriptions
        const testRegex = /test\(['"]([^'"]+)['"]/g;
        let match;
        while ((match = testRegex.exec(content)) !== null) {
            const description = match[1].trim();

            // Extract ID from description: MS-1, PV-01, GRR-01, GRT-17, PS-2, C1, etc.
            let id = '';
            const idMatch = description.match(/(?:^|\s)((?:MS|PV|GRR|GRT|PS|C)\s*[\d]+[A-Za-z]?)/);
            if (idMatch) id = idMatch[1].replace(/\s+/g, '').trim();
            // Fallback: try tag-based ID from filename
            if (!id) {
                const fileIdMatch = relPath.match(/([A-Z]{2,3}[-_]\d+)/);
                if (fileIdMatch) id = fileIdMatch[1].replace(/_/g, '-');
            }

            // Determine module
            let module = 'OTROS';
            const lower = filePath.toLowerCase();
            if (lower.includes('logistica') && (lower.includes('movimiento') || lower.includes('ms-'))) {
                module = 'LOGISTICA - Movimientos';
            } else if (lower.includes('logistica') && (lower.includes('producto') || lower.includes('ps-'))) {
                module = 'LOGISTICA - Productos & Stock';
            } else if (lower.includes('guiasremision') && lower.includes('remitente')) {
                module = 'GUIAS - Remitente (GRR)';
            } else if (lower.includes('guiasremision') && lower.includes('transportista')) {
                module = 'GUIAS - Transportista (GRT)';
            } else if (lower.includes('cotizacion')) {
                module = 'COTIZACIONES';
            } else if (lower.includes('pedido')) {
                module = 'PEDIDOS';
            } else if (lower.includes('emisiones') && lower.includes('puntoventa')) {
                module = 'PUNTO VENTA';
            } else if (lower.includes('utility') || lower.includes('analyze')) {
                module = 'UTILITY (framework)';
            }

            // Extract tags from file
            const tagRegex = /@[\w-]+/g;
            const tags = (content.match(tagRegex) || []).filter(t =>
                t !== '@punto-venta' && t !== '@guias'
            );
            const uniqueTags = [...new Set(tags)].join(', ');

            entries.push({
                module,
                id,
                description,
                tags: uniqueTags || (id ? '@' + id.split('-')[0] : ''),
                file: relPath,
            });
        }
    }

    // Sort by module then numeric ID
    entries.sort((a, b) => {
        if (a.module !== b.module) return a.module.localeCompare(b.module);
        const numA = parseInt(a.id.replace(/[^0-9]/g, '')) || 9999;
        const numB = parseInt(b.id.replace(/[^0-9]/g, '')) || 9999;
        if (numA !== numB) return numA - numB;
        return a.id.localeCompare(b.id);
    });

    return entries;
}

function walkSpecFiles(dir) {
    const results = [];
    const list = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of list) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (entry.name.startsWith('_') || entry.name === 'setup') continue;
            results.push(...walkSpecFiles(full));
        } else if (entry.name.endsWith('.spec.ts') && !entry.name.startsWith('_')) {
            results.push(full);
        }
    }
    return results;
}

// ── Estilos ──
const headerStyle = {
    font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2F5496' } },
    alignment: { vertical: 'middle', horizontal: 'center', wrapText: true },
    border: {
        top: { style: 'thin' }, bottom: { style: 'thin' },
        left: { style: 'thin' }, right: { style: 'thin' }
    }
};

const cellStyle = {
    alignment: { vertical: 'top', wrapText: true },
    border: {
        top: { style: 'thin' }, bottom: { style: 'thin' },
        left: { style: 'thin' }, right: { style: 'thin' }
    }
};

const moduleColors = {
    'LOGISTICA - Movimientos': 'FFFCE4D6',
    'LOGISTICA - Productos & Stock': 'FFD9E2F3',
    'PUNTO VENTA': 'FFE2EFDA',
    'GUIAS - Remitente (GRR)': 'FFD9D2E9',
    'GUIAS - Transportista (GRT)': 'FFE4DFEC',
    'COTIZACIONES': 'FFFFF2CC',
    'PEDIDOS': 'FFD6E4F0',
    'OTROS': 'FFF2F2F2',
    'UTILITY (framework)': 'FFF2F2F2',
};

function getModuleColor(mod) {
    return moduleColors[mod] || 'FFF2F2F2';
}

async function main() {
    const entries = collectTests();

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'QA Automation - ERP Peru 2';
    workbook.created = new Date();

    // ── Sheet 1: Todos los Tests ──
    const ws = workbook.addWorksheet('Tests Automatizados', {
        views: [{ state: 'frozen', ySplit: 1 }]
    });

    ws.columns = [
        { header: '#', key: 'num', width: 5 },
        { header: 'Modulo', key: 'module', width: 30 },
        { header: 'ID', key: 'id', width: 14 },
        { header: 'Descripcion', key: 'description', width: 70 },
        { header: 'Tags', key: 'tags', width: 35 },
        { header: 'Archivo', key: 'file', width: 80 },
    ];

    // Header
    const headerRow = ws.addRow(['#', 'Modulo', 'ID', 'Descripcion', 'Tags', 'Archivo']);
    headerRow.eachCell((cell) => { cell.style = headerStyle; });
    ws.autoFilter = 'A1:F' + (entries.length + 1);

    // Data
    let idx = 1;
    for (const entry of entries) {
        const row = ws.addRow([idx++, entry.module, entry.id, entry.description, entry.tags, entry.file]);
        const color = getModuleColor(entry.module);
        row.eachCell((cell) => {
            cell.style = {
                ...cellStyle,
                fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: color } }
            };
        });
        row.getCell(3).font = { bold: true };
    }

    // Column widths auto
    ws.getColumn(1).width = 5;
    ws.getColumn(2).width = 32;
    ws.getColumn(3).width = 16;
    ws.getColumn(4).width = 72;
    ws.getColumn(5).width = 38;
    ws.getColumn(6).width = 82;

    // ── Sheet 2: Resumen ──
    const ws2 = workbook.addWorksheet('Resumen por Modulo');
    ws2.columns = [
        { header: 'Modulo', key: 'module', width: 35 },
        { header: 'Cantidad de Tests', key: 'count', width: 22 },
    ];

    const hdr2 = ws2.addRow(['Modulo', 'Cantidad de Tests']);
    hdr2.eachCell((cell) => { cell.style = headerStyle; });

    const counts = {};
    for (const e of entries) {
        counts[e.module] = (counts[e.module] || 0) + 1;
    }

    let total = 0;
    for (const [mod, count] of Object.entries(counts)) {
        total += count;
        const row = ws2.addRow([mod, count]);
        const color = getModuleColor(mod);
        row.eachCell((cell) => {
            cell.style = {
                ...cellStyle,
                fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: color } }
            };
        });
    }
    const totalRow = ws2.addRow(['TOTAL', total]);
    totalRow.eachCell((cell) => {
        cell.style = { ...cellStyle, font: { bold: true, size: 12 } };
    });

    // ── Save ──
    if (!fs.existsSync(path.dirname(OUTPUT))) {
        fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
    }
    await workbook.xlsx.writeFile(OUTPUT);
    console.log('Excel generado: ' + OUTPUT);
    console.log('Total tests: ' + entries.length);
}

main().catch(console.error);
