const fs = require('fs');
const path = require('path');
const file = path.resolve('playwright/.auth/setup-state.json');

if (fs.existsSync(file)) {
    const state = JSON.parse(fs.readFileSync(file, 'utf-8'));
    let count = 0;
    if (state.profiles) {
        for (const profileKey of Object.keys(state.profiles)) {
            const setups = state.profiles[profileKey].setups;
            if (setups && setups['punto-venta-items']) {
                delete setups['punto-venta-items'];
                count++;
                console.log('Reset:', profileKey);
            }
        }
    }
    fs.writeFileSync(file, JSON.stringify(state, null, 2));
    console.log('Profiles reseteados:', count);
} else {
    console.log('El archivo setup-state.json no existe. No hay nada que resetear.');
}

const dynamicItemsFile = path.resolve('playwright/.auth/dynamic-items.json');
if (fs.existsSync(dynamicItemsFile)) {
    const dynamicItems = JSON.parse(fs.readFileSync(dynamicItemsFile, 'utf-8'));
    console.log('dynamic-items.json COMBO_ESTRICTO:', dynamicItems['COMBO_ESTRICTO'] ?? 'NO EXISTE (correcto)');
} else {
    console.log('dynamic-items.json COMBO_ESTRICTO: NO EXISTE (correcto)');
}
