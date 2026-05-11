import {test as setup} from '@playwright/test';
import {MovimientosNavigationPage} from '@pages/Logistica/MovimientosNavigationPage';
import {RegistroMovimientoPage} from '@pages/Logistica/RegistroMovimientoPage';
import {DatosAdicionalesSetupPage} from '@pages/Logistica/DatosAdicionalesSetupPage';
import {PROVEEDOR_EXISTENTE, PROVEEDOR_TEST,} from '@helpers/Logistica/movimiento-data.helper';
import {CAMPOS_AJUSTES, CAMPOS_INGRESOS, CAMPOS_TRASLADOS,} from '@helpers/Logistica/datos-adicionales-config';


setup.skip(!!process.env.SKIP_DATOS_SETUP, 'Setup de datos omitido por SKIP_DATOS_SETUP');

setup('preparar datos adicionales y proveedor para movimientos', async ({page}) => {
    setup.setTimeout(180_000);

    const nav = new MovimientosNavigationPage(page);
    const registro = new RegistroMovimientoPage(page);
    const datosSetup = new DatosAdicionalesSetupPage(page);

    await page.goto('/');

    // ══════════════════════════════════════════════════════════════════
    // 1. INGRESOS: proveedor + campos adicionales
    // ══════════════════════════════════════════════════════════════════
    console.log('\n [Setup] Configurando INGRESOS...');
    await nav.navegarAIngresosDesdeMenu();
    await registro.clickAgregarIngreso();
    await datosSetup.abrirPanel();

    // Proveedor (entidad global, se crea una vez y aplica para todos los tipos)
    await datosSetup.asegurarProveedor(PROVEEDOR_TEST, PROVEEDOR_EXISTENTE.nombre);

    // Campos adicionales de Ingresos
    await datosSetup.asegurarCampos(CAMPOS_INGRESOS);

    await datosSetup.guardarDatos();

    // ══════════════════════════════════════════════════════════════════
    // 2. TRASLADOS: campos adicionales
    // ══════════════════════════════════════════════════════════════════
    console.log('\n [Setup] Configurando TRASLADOS...');
    await nav.navegarATraslados();
    await registro.clickAgregarTraslado();
    await datosSetup.abrirPanel();

    await datosSetup.asegurarCampos(CAMPOS_TRASLADOS);

    await datosSetup.guardarDatos();

    // ══════════════════════════════════════════════════════════════════
    // 3. AJUSTES: campos adicionales
    // ══════════════════════════════════════════════════════════════════
    console.log('\n [Setup] Configurando AJUSTES...');
    await nav.navegarAAjustes();
    await registro.clickAgregarAjuste();
    await datosSetup.abrirPanel();

    await datosSetup.asegurarCampos(CAMPOS_AJUSTES);

    await datosSetup.guardarDatos();

    // ══════════════════════════════════════════════════════════════════
    // 4. SALIDAS: cliente
    // ══════════════════════════════════════════════════════════════════
    console.log('\n [Setup] Configurando SALIDAS...');
    await nav.navegarASalidasDesdeMenu();
    await registro.clickAgregarSalida();
    await datosSetup.abrirPanel();

    await datosSetup.asegurarCliente(PROVEEDOR_TEST, PROVEEDOR_EXISTENTE.nombre);

    await datosSetup.guardarDatos();

    console.log('\n [Setup] Datos adicionales, proveedor y cliente listos\n');
});
