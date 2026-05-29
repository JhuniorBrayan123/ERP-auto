import {test as setup} from '@playwright/test';
import {PuntoVentaSetupPage} from '@pages/PuntoVenta/PuntoVentaSetupPage';
import {CajaPage} from '@pages/PuntoVenta/CajaPage';
import {
    CAMPOS_PV,
    CLIENTE_DNI_PV,
    CLIENTE_RUC_PV,
    VENDEDOR_PV,
} from '@helpers/PuntoVenta/punto-venta-setup-data.helper';
import {shouldSkipSetup, markSetupComplete} from '@utils/setup-state';

const SETUP_NAME = 'punto-venta-datos';

setup.skip(!!process.env.SKIP_PV_SETUP, 'Setup de PuntoVenta omitido por SKIP_PV_SETUP');

setup('preparar datos base para PuntoVenta / Emisiones', async ({page}) => {
    
    if (shouldSkipSetup(SETUP_NAME)) {
        console.log(`[setup-state] ${SETUP_NAME} already completed, skipping`);
        return;
    }
    setup.setTimeout(180_000);

    const pvSetup = new PuntoVentaSetupPage(page);
    const cajaPage = new CajaPage(page);

    await page.goto('/');

    console.log('\n [PV Setup] Configurando VENDEDOR...');
    await pvSetup.navegarAVendedores();
    await pvSetup.asegurarVendedor(VENDEDOR_PV);

    console.log('\n [PV Setup] Configurando CAMPOS ADICIONALES...');
    await pvSetup.navegarANuevaVenta();

    try {
        console.log('   Intentando "Continuar vendiendo"...');
        await page.getByRole('button', {name: 'Continuar vendiendo'}).first().click({timeout: 10_000});
        console.log('  ✓ Entró a la caja');
    } catch {
        console.log('   Caja cerrada, aperturando...');
        await cajaPage.abrirCajaCompleta();
        console.log('  ✓ Caja aperturada');
    }

    await page.waitForTimeout(3000);

    await pvSetup.abrirPanelDatos();
    await pvSetup.asegurarCamposAdicionales(CAMPOS_PV);
    await pvSetup.guardarDatos();

    console.log('\n [PV Setup] Configurando CLIENTE DNI...');
    await pvSetup.asegurarClienteDNI(CLIENTE_DNI_PV);

    console.log('\n [PV Setup] Configurando CLIENTE RUC...');
    await pvSetup.asegurarClienteRUC(CLIENTE_RUC_PV);

    console.log('\n [PV Setup] Datos base de PuntoVenta listos\n');

    markSetupComplete(SETUP_NAME);
});
