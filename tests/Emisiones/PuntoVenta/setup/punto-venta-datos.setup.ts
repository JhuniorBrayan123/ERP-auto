import {test as setup} from '@playwright/test';
import {PuntoVentaSetupPage} from '../../../../src/pages/PuntoVenta/PuntoVentaSetupPage';
import {CajaPage} from '../../../../src/pages/PuntoVenta/CajaPage';
import {
    CAMPOS_PV,
    CLIENTE_DNI_PV,
    CLIENTE_RUC_PV,
    VENDEDOR_PV,
} from '../../../../src/helpers/PuntoVenta/punto-venta-setup-data.helper';

// ─── Skip controlado por variable de entorno ─────────────────────────
setup.skip(!!process.env.SKIP_PV_SETUP, 'Setup de PuntoVenta omitido por SKIP_PV_SETUP');

setup('preparar datos base para PuntoVenta / Emisiones', async ({page}) => {
    setup.setTimeout(180_000);

    const pvSetup = new PuntoVentaSetupPage(page);
    const cajaPage = new CajaPage(page);

    await page.goto('/');

    // ══════════════════════════════════════════════════════════════════
    // 1. VENDEDOR
    // ══════════════════════════════════════════════════════════════════
    console.log('\n [PV Setup] Configurando VENDEDOR...');
    await pvSetup.navegarAVendedores();
    await pvSetup.asegurarVendedor(VENDEDOR_PV);

    // ══════════════════════════════════════════════════════════════════
    // 2. CAMPOS ADICIONALES (dentro de la caja de venta)
    // ══════════════════════════════════════════════════════════════════
    console.log('\n [PV Setup] Configurando CAMPOS ADICIONALES...');
    await pvSetup.navegarANuevaVenta();

    // Entrar a la caja — click directo con auto-wait de Playwright
    try {
        console.log('   Intentando "Continuar vendiendo"...');
        await page.getByRole('button', {name: 'Continuar vendiendo'}).first().click({timeout: 10_000});
        console.log('  ✓ Entró a la caja');
    } catch {
        console.log('   Caja cerrada, aperturando...');
        await cajaPage.abrirCajaCompleta();
        console.log('  ✓ Caja aperturada');
    }

    // Esperar a que la vista de venta cargue
    await page.waitForTimeout(3000);

    await pvSetup.abrirPanelDatos();
    await pvSetup.asegurarCamposAdicionales(CAMPOS_PV);
    await pvSetup.guardarDatos();

    // ══════════════════════════════════════════════════════════════════
    // 3. CLIENTE DNI (sin RUC — para boletas)
    // ══════════════════════════════════════════════════════════════════
    console.log('\n [PV Setup] Configurando CLIENTE DNI...');
    await pvSetup.asegurarClienteDNI(CLIENTE_DNI_PV);

    // ══════════════════════════════════════════════════════════════════
    // 4. CLIENTE RUC (para facturas)
    // ══════════════════════════════════════════════════════════════════
    console.log('\n [PV Setup] Configurando CLIENTE RUC...');
    await pvSetup.asegurarClienteRUC(CLIENTE_RUC_PV);

    console.log('\n [PV Setup] Datos base de PuntoVenta listos\n');
});
