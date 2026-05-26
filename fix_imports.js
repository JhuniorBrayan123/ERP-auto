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

const files = walk('tests/Emisiones/PuntoVenta');

const replacements = [
    { from: "SeleccionarTipoComprobante'", to: "SeleccionarTipoComprobante.task'" },
    { from: "SeleccionarCliente'", to: "SeleccionarCliente.task'" },
    { from: "SeleccionarClienteSinDoc'", to: "SeleccionarClienteSinDoc.task'" },
    { from: "BuscarYAgregarItemSimple'", to: "BuscarYAgregarItemSimple.task'" },
    { from: "EmitirCotizacion'", to: "EmitirCotizacion.task'" },
    { from: "ConfigurarVigenciaCotizacion'", to: "ConfigurarVigenciaCotizacion.task'" },
    { from: "ActivarImagenDescripcion'", to: "ActivarImagenDescripcion.task'" },
    { from: "IntentarEmitirSinItems'", to: "IntentarEmitirSinItems.task'" }
];

files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    let changed = false;
    replacements.forEach(r => {
        if (content.includes(r.from)) {
            // Only replace in imports
            content = content.split('\n').map(line => {
                if (line.startsWith('import ') && line.includes(r.from)) {
                    return line.replace(r.from, r.to);
                }
                return line;
            }).join('\n');
            changed = true;
        }
    });
    if (changed) {
        fs.writeFileSync(f, content);
        console.log(`Updated ${f}`);
    }
});
