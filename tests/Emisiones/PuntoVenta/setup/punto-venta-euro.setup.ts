import {test as setup} from '@playwright/test';
import {ITEMS_PV} from '@helpers/PuntoVenta/emision-data.helper';
import {asegurarConfiguracionEuro} from '@helpers/PuntoVenta/semillas-emision.helper';
import {markSetupComplete, shouldSkipSetup} from '@utils/setup-state';

const SETUP_NAME = 'punto-venta-euro';
setup.skip(!!process.env.SKIP_PV_EURO_SETUP, 'Setup de EURO PuntoVenta omitido por SKIP_PV_EURO_SETUP');

const CASO_ACTUAL = 'Setup: Asegurar configuración EURO (moneda, caja de venta y precio de ítem)';

setup(CASO_ACTUAL, async ({page}) => {
    if (shouldSkipSetup(SETUP_NAME)) {
        console.log(`[setup-state] ${SETUP_NAME} already completed, skipping`);
        return;
    }

    setup.setTimeout(240_000);

    console.log(`\n [PV EURO Setup] Asegurando configuración EURO (moneda, caja, precio ítem ${ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.codigo})...`);
    await asegurarConfiguracionEuro(page, ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.codigo);

    markSetupComplete(SETUP_NAME);
    console.log('\n [PV EURO Setup] Configuración EURO lista\n');
});
