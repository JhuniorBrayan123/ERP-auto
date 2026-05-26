const fs = require('fs');
const path = require('path');

const files = [
    'tests/Emisiones/PuntoVenta/Cotizacion/PV-19-cotizacion-emision.spec.ts',
    'tests/Emisiones/PuntoVenta/Cotizacion/PV-19-cotizacion-imagen-vigencia.spec.ts',
    'tests/Emisiones/PuntoVenta/Pedido/PV-20-pedido-emision.spec.ts',
    'tests/Emisiones/PuntoVenta/Pedido/PV-20-pedido-validaciones.spec.ts',
    'tests/Emisiones/PuntoVenta/Pedido/PV-20-pedido-compartir-descargar.spec.ts',
    'tests/Emisiones/PuntoVenta/Pedido/PV-20-pedido-busqueda-correlativo.spec.ts',
    'tests/Emisiones/PuntoVenta/Pedido/PV-20-pedido-lista.spec.ts',
    'tests/Emisiones/PuntoVenta/Pedido/PV-20-pedido-buscar-cargar.spec.ts'
];

files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');

    // 1. Quitar el import de CerrarCajaActiva
    content = content.replace(/import\s*\{\s*CerrarCajaActiva\s*\}\s*from\s*'.*CerrarCaja\.task';?\n/g, '');

    // 2. Quitar el bloque afterAll
    // Como inyectamos esto literalmente, podemos usar Regex para matchear desde test.afterAll hasta });
    content = content.replace(/\s*test\.afterAll\(async\s*\(\{ browser \}\)\s*=>\s*\{[\s\S]*?await context\.close\(\);\s*\}\);\n/g, '');

    // 3. Reemplazar el fixture por @playwright/test
    content = content.replace(/from\s*'@fixtures\/PuntoVenta\/emision-fixture';/g, "from '@playwright/test';");
    content = content.replace(/from\s*"@fixtures\/PuntoVenta\/emision-fixture";/g, 'from "@playwright/test";');

    fs.writeFileSync(f, content);
    console.log("Cleaned:", f);
});
