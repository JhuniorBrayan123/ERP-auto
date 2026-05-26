const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else if (file.endsWith('.spec.ts')) { 
            results.push(file);
        }
    });
    return results;
}

const dirs = ['tests/Emisiones/PuntoVenta/Cotizacion', 'tests/Emisiones/PuntoVenta/Pedido'];
let files = [];
dirs.forEach(d => {
    files = files.concat(walk(d));
});

files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    
    if (content.includes('CerrarCajaActiva')) return;
    
    const importStr = "import { CerrarCajaActiva } from '../../../../src/task/PuntoVenta/CerrarCaja.task';\n";
    
    // find first describe
    const firstDescribeMatch = content.match(/test\.describe\(/);
    if (!firstDescribeMatch) return;
    
    const insertIndex = firstDescribeMatch.index;
    content = content.slice(0, insertIndex) + importStr + '\n' + content.slice(insertIndex);
    
    const afterAllStr = `
    test.afterAll(async ({ browser }) => {
        const context = await browser.newContext();
        const page = await context.newPage();
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(CerrarCajaActiva());
        await context.close();
    });
`;
    // Replace the first '=> {' or ') => {' of the describe.
    // My files have: test.describe('PV-19...', () => {
    content = content.replace(/(test\.describe\([^,]+,\s*\(\)\s*=>\s*\{)/, "$1\n" + afterAllStr);
    
    fs.writeFileSync(f, content);
    console.log("Updated", f);
});
