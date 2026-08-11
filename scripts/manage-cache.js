const { existsSync, readFileSync, writeFileSync, unlinkSync } = require('node:fs');
const { resolve } = require('node:path');

const CACHE_FILE = resolve(process.cwd(), 'playwright', '.auth', 'dynamic-items.json');
const STATE_FILE = resolve(process.cwd(), 'playwright', '.auth', 'setup-state.json');
const args = process.argv.slice(2);

if (args.includes('--force-setup')) {
    if (!existsSync(STATE_FILE)) {
        console.log('No existe setup-state.json. El setup ya correra desde cero.');
        process.exit(0);
    }
    const state = JSON.parse(readFileSync(STATE_FILE, 'utf-8'));
    let found = false;
    for (const profile of Object.keys(state.profiles || {})) {
        if (state.profiles[profile]?.setups?.['punto-venta-items']) {
            delete state.profiles[profile].setups['punto-venta-items'];
            console.log('OK: punto-venta-items reseteado en perfil: ' + profile);
            found = true;
        }
    }
    if (found) {
        writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
        console.log('Ahora corre: npm run setup:items');
    } else {
        console.log('No habia setup de items marcado como completo.');
    }
    process.exit(0);
}

if (args.includes('--reset-prd')) {
    const key = args[args.indexOf('--reset-prd') + 1];
    const prdFile = resolve(process.cwd(), 'playwright', 'dynamic-items.prd.json');
    if (!key) {
        console.error('Indica la clave. Ej: node scripts/manage-cache.js --reset-prd RECETA_INSUMOS');
        process.exit(1);
    }
    if (!existsSync(prdFile)) {
        console.log('No existe dynamic-items.prd.json');
        process.exit(0);
    }
    const prd = JSON.parse(readFileSync(prdFile, 'utf-8'));
    if (!(key in prd)) {
        console.log('La clave ' + key + ' no existe en dynamic-items.prd.json');
        process.exit(0);
    }
    const codigoAnterior = prd[key];
    delete prd[key];
    writeFileSync(prdFile, JSON.stringify(prd, null, 2), 'utf-8');
    console.log('OK: ' + key + ' (' + codigoAnterior + ') eliminado de dynamic-items.prd.json');
    console.log('Siguiente paso:');
    console.log('  1. Cambia el codigo del item en el ERP PRD a "Automatico"');
    console.log('  2. node scripts/manage-cache.js --force-setup');
    console.log('  3. npm run setup:items');
    process.exit(0);
}

if (!existsSync(CACHE_FILE)) {
    console.log('No se encontro dynamic-items.json en playwright/.auth/');
    console.log('Ejecuta el setup primero para generar el cache.');
    process.exit(0);
}

let data;
try {
    data = JSON.parse(readFileSync(CACHE_FILE, 'utf-8'));
} catch {
    console.error('Error al leer dynamic-items.json archivo corrupto.');
    process.exit(1);
}

const nombres = data.__nombres || {};

if (args.includes('--reset-all')) {
    unlinkSync(CACHE_FILE);
    console.log('Cache eliminado completamente. El proximo setup creara todo desde cero.');
    process.exit(0);
}

if (args.includes('--reset')) {
    const key = args[args.indexOf('--reset') + 1];
    if (!key) {
        console.error('Indica la clave. Ej: node scripts/manage-cache.js --reset RECETA_INSUMOS');
        process.exit(1);
    }
    if (!(key in data)) {
        console.log('La clave ' + key + ' no existe en el cache.');
        const claves = Object.keys(data).filter(function(k) { return k !== '__nombres' && k !== 'RUN_ID'; });
        console.log('Claves disponibles: ' + claves.join(', '));
        process.exit(0);
    }
    const codigoAnterior = data[key];
    delete data[key];
    writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2), 'utf-8');
    console.log('OK: ' + key + ' (codigo: ' + codigoAnterior + ') eliminado del cache.');
    console.log('    El setup lo recreara con el nuevo template al correr nuevamente.');
    process.exit(0);
}

const runId = data.RUN_ID || '(desconocido)';
const claves = Object.keys(data).filter(function(k) { return k !== '__nombres' && k !== 'RUN_ID'; });

console.log('\nCache de items dinamicos');
console.log('  RUN_ID: ' + runId);
console.log('  Archivo: playwright/.auth/dynamic-items.json');
console.log('  Total items: ' + claves.length + '\n');
console.log('----------------------------------------------------------------------');

claves.forEach(function(key) {
    const codigo = data[key];
    const nombre = nombres[key] || '(sin nombre guardado)';
    console.log('  ' + key.padEnd(35) + ' ' + String(codigo).padEnd(22) + ' ' + nombre);
});

console.log('----------------------------------------------------------------------');
console.log('\nComandos utiles:');
console.log('  node scripts/manage-cache.js --reset RECETA_INSUMOS  -> remueve una entrada del cache');
console.log('  node scripts/manage-cache.js --reset-all              -> limpia todo el cache');
console.log('  node scripts/manage-cache.js --force-setup            -> fuerza que el setup de items corra de nuevo\n');

