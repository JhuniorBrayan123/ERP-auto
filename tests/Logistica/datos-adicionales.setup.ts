import {test as setup} from '@playwright/test';
import {MovimientosNavigationPage} from '@pages/Logistica/MovimientosNavigationPage';
import {RegistroMovimientoPage} from '@pages/Logistica/RegistroMovimientoPage';
import {DatosAdicionalesSetupPage} from '@pages/Logistica/DatosAdicionalesSetupPage';
import {PROVEEDOR_EXISTENTE, PROVEEDOR_TEST,} from '@helpers/Logistica/movimiento-data.helper';
import {CAMPOS_AJUSTES, CAMPOS_INGRESOS, CAMPOS_TRASLADOS,} from '@helpers/Logistica/datos-adicionales-config';
import {shouldSkipSetup, markSetupComplete} from '@utils/setup-state';

const SETUP_NAME = 'datos-adicionales';

setup.skip(!!process.env.SKIP_DATOS_SETUP, 'Setup de datos omitido por SKIP_DATOS_SETUP');

setup('preparar datos adicionales y proveedor para movimientos', async ({page}) => {
    
    if (shouldSkipSetup(SETUP_NAME)) {
        console.log(`[setup-state] ${SETUP_NAME} already completed, skipping`);
        return;
    }
    setup.setTimeout(180_000);

    const nav = new MovimientosNavigationPage(page);
    const registro = new RegistroMovimientoPage(page);
    const datosSetup = new DatosAdicionalesSetupPage(page);

    await page.goto('/');

    console.log('\n [Setup] Configurando INGRESOS...');
    await nav.navegarAIngresosDesdeMenu();
    await registro.clickAgregarIngreso();
    await datosSetup.abrirPanel();

    await datosSetup.asegurarProveedor(PROVEEDOR_TEST, PROVEEDOR_EXISTENTE.nombre);

    await datosSetup.asegurarCampos(CAMPOS_INGRESOS);

    await datosSetup.guardarDatos();

    console.log('\n [Setup] Configurando TRASLADOS...');
    await nav.navegarATraslados();
    await registro.clickAgregarTraslado();
    await datosSetup.abrirPanel();

    await datosSetup.asegurarCampos(CAMPOS_TRASLADOS);

    await datosSetup.guardarDatos();

    console.log('\n [Setup] Configurando AJUSTES...');
    await nav.navegarAAjustes();
    await registro.clickAgregarAjuste();
    await datosSetup.abrirPanel();

    await datosSetup.asegurarCampos(CAMPOS_AJUSTES);

    await datosSetup.guardarDatos();

    console.log('\n [Setup] Configurando SALIDAS...');
    await nav.navegarASalidasDesdeMenu();
    await registro.clickAgregarSalida();
    await datosSetup.abrirPanel();

    await datosSetup.asegurarCliente(PROVEEDOR_TEST, PROVEEDOR_EXISTENTE.nombre);

    await datosSetup.guardarDatos();

    console.log('\n [Setup] Datos adicionales, proveedor y cliente listos\n');

    markSetupComplete(SETUP_NAME);
});
