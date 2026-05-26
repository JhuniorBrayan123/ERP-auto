const fs = require('fs');

let config = fs.readFileSync('playwright.config.ts', 'utf8');

// 1. Agregar teardown al proyecto PuntoVenta
if (!config.includes('teardown: "pv-teardown"')) {
    config = config.replace(
        /(name:\s*"PuntoVenta",[\s\S]*?dependencies:\s*\["setup"\],(?:\/\/.+)?\n)/,
        "$1            teardown: \"pv-teardown\",\n"
    );
}

// 2. Agregar la definición del proyecto pv-teardown al final del array projects
if (!config.includes('name: "pv-teardown"')) {
    const teardownProject = `
        {
            name: "pv-teardown",
            testMatch: "**/pv-teardown.setup.ts",
            use: {
                ...devices["Desktop Chrome"],
                storageState: "playwright/.auth/user.json",
            }
        },`;
    
    // Lo agregamos justo antes de la llave de cierre de projects
    // Buscaremos "name: "Logistica"," y su bloque
    config = config.replace(/(\}\s*,\s*\{\s*name:\s*"Logistica")/, teardownProject + "\n$1");
}

fs.writeFileSync('playwright.config.ts', config);
console.log("playwright.config.ts updated");
