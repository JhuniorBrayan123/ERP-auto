/**
 * Helpers de movimientos masivos y movimientos rápidos.
 * Extraído de verificaciones-movimientos.helper.ts
 */
import {test} from '@fixtures/Logistica/movimientos-fixture';
import {Page} from '@playwright/test';
import {MovimientosNavigationPage} from '@pages/Logistica/MovimientosNavigationPage';
import {ListadoMovimientosPage} from '@pages/Logistica/ListadoMovimientosPage';
import {MovimientoRapidoPage} from '@pages/Logistica/MovimientoRapidoPage';
import {FUNCTIONAL_CATALOG} from '@utils/functional-catalog';
import {expectVisibleFunctional, runFunctionalStep} from '@utils/functional-step';

export const buscarItemEnListadoRapidoYAcceder = async (
    movimientoRapido: MovimientoRapidoPage,
    page: Page,
    codigoItem: string
) => {
    await runFunctionalStep(
        'Buscar ítem en listado rápido y acceder', page,
        {
            ...FUNCTIONAL_CATALOG.movimientos.definirAlmacenMotivo,
            screen: 'Movimientos rápidos',
            flowStep: 'Buscar ítem en listado rápido',
            userMessage: 'No se pudo buscar el ítem en el listado rápido.',
            technicalDetail: `Falla en la búsqueda o acceso al ítem ${codigoItem} en movimientos rápidos.`
        },
        async () => {
            await movimientoRapido.buscarItemPorCodigo(codigoItem);
            await page.locator('[id="lgt_items_cmp-filtro-items:filtro:filtro_section_v-input:button_search"]').click();
            await page.waitForLoadState('networkidle');
        },
    );
};

export const configurarYRetirarStockRapido = async (
    movimientoRapido: MovimientoRapidoPage,
    almacen: string,
    motivoGral: string,
    motivoEspecifico: string,
    cantidad: string
) => {
    await test.step('Configurar retiro de stock rápido', async () => {
        await movimientoRapido.seleccionarAlmacenRapido(almacen);
        await movimientoRapido.seleccionarMotivoSalidaDesdeDiv(motivoGral, motivoEspecifico);
        await movimientoRapido.llenarCantidadRapida(cantidad);
    });
    await test.step('Confirmar retiro de stock rápido', async () => {
        await movimientoRapido.clickBtnRetirarStock();
        await movimientoRapido.cerrarModalConfirmacion();
    });
};

export const configurarYRetirarStockRapido2 = async (
    movimientoRapido: MovimientoRapidoPage,
    almacen: string,
    motivoGral: string,
    motivoEspecifico: string,
    cantidad: string
) => {
    await test.step('Configurar retiro de stock rápido (variante 2)', async () => {
        await movimientoRapido.seleccionarAlmacenRapido2(almacen);
        await movimientoRapido.seleccionarMotivoSalidaDesdeDiv(motivoGral, motivoEspecifico);
        await movimientoRapido.llenarCantidadRapida(cantidad);
    });
    await test.step('Confirmar retiro de stock rápido (variante 2)', async () => {
        await movimientoRapido.clickBtnRetirarStock();
        await movimientoRapido.cerrarModalConfirmacion();
    });
};

export const configurarYAumentarStockRapido = async (
    movimientoRapido: MovimientoRapidoPage,
    almacen: string,
    motivoGral: string,
    motivoEspecifico: string,
    cantidad: string
) => {
    await test.step('Configurar aumento de stock rápido', async () => {
        if (almacen) await movimientoRapido.seleccionarAlmacenRapido(almacen);
        if (motivoGral) await movimientoRapido.seleccionarMotivoIngresoRapido(motivoGral, motivoEspecifico);
        await movimientoRapido.llenarCantidadRapida(cantidad);
    });
    await test.step('Confirmar aumento de stock rápido', async () => {
        await movimientoRapido.clickBtnAumentarStock();
        await movimientoRapido.cerrarModalConfirmacion();
    });
};

export const navegarAIngresosYAbrirAccionesImpresion = async (
    movimientosNav: MovimientosNavigationPage,
    listadoMovimientos: ListadoMovimientosPage,
    desdeMenu: boolean = false,
) => {
    await runFunctionalStep('Abrir acciones de impresión desde ingresos', undefined, FUNCTIONAL_CATALOG.movimientos.accionesImpresion, async () => {
        if (desdeMenu) {
            await movimientosNav.navegarAIngresosDesdeMenu();
        } else {
            await movimientosNav.navegarAIngresos();
        }
        await listadoMovimientos.clickTabPorIndice(0);
        await listadoMovimientos.abrirMenuAcciones();
        await listadoMovimientos.clickImprimirDescargarEnviar();
    });
};

export const cargarMovimientoMasivoDesdeExcel = async (
    listadoMovimientos: ListadoMovimientosPage,
    movimientoRapido: MovimientoRapidoPage,
    page: Page,
    excelPath: string,
) => {
    await runFunctionalStep('Abrir carga masiva y subir excel', page, FUNCTIONAL_CATALOG.movimientos.cargaMasiva, async () => {
        await listadoMovimientos.clickIconoOpciones();
        await listadoMovimientos.clickCrearDesdeExcel();
        await page.locator('.popup-container > .button-close > .icon').click();
        await movimientoRapido.seleccionarcardProductos();
        await page.getByText('Siguiente').click();
        await page.locator('input[type="file"]').setInputFiles(excelPath);
        await page.getByText('Siguiente').click();
    });

    await runFunctionalStep('Procesar carga masiva de movimientos', page, FUNCTIONAL_CATALOG.movimientos.cargaMasiva, async () => {
        await page.getByText('Procesar').click();
        await expectVisibleFunctional(page, page.getByRole('button', {name: 'Ir al inicio'}), {
            ...FUNCTIONAL_CATALOG.movimientos.cargaMasiva,
            flowStep: 'Validar finalización de carga masiva',
            userMessage: 'La carga masiva no finalizó correctamente para regresar al inicio.',
            technicalDetail: 'No apareció el botón "Ir al inicio" después de procesar el excel.',
        });
        await page.getByRole('button', {name: 'Ir al inicio'}).click();
    });
};
