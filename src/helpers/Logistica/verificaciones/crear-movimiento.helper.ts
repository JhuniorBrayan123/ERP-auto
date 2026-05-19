/**
 * Helpers para crear movimientos como precondición de tests.
 * Extraído de verificaciones-movimientos.helper.ts
 */
import {test} from '@fixtures/Logistica/movimientos-fixture';
import {Page} from '@playwright/test';
import {MovimientosNavigationPage} from '@pages/Logistica/MovimientosNavigationPage';
import {RegistroMovimientoPage} from '@pages/Logistica/RegistroMovimientoPage';
import {ResultadoMovimientoPage} from '@pages/Logistica/ResultadoMovimientoPage';
import {FUNCTIONAL_CATALOG} from '@utils/functional-catalog';
import {runFunctionalStep} from '@utils/functional-step';
import {MovimientoApi, MovimientoCreado} from '@services/Logistica/MovimientoApi';
import {esperarCargaOverlay} from '@utils/wait-helpers';

export const crearAjusteConItem = async (
    registroMovimiento: RegistroMovimientoPage,
    codigoItem: string,
    nombreItem: string,
    page?: Page,
    textClickEquivalente?: string
) => {
    if (!page) {
        await test.step('Crear ajuste con ítem', async () => {
            await registroMovimiento.clickAgregarAjuste();
            await registroMovimiento.buscarItem(codigoItem);
            await registroMovimiento.seleccionarItemEnResultados(nombreItem);
        });
        return;
    }

    await runFunctionalStep('Crear ajuste con ítem', page, FUNCTIONAL_CATALOG.movimientos.definirAlmacenMotivo, async () => {
        await registroMovimiento.clickAgregarAjuste();
        await registroMovimiento.buscarItem(codigoItem);
        await registroMovimiento.seleccionarItemEnResultados(nombreItem);
        if (textClickEquivalente) {
            await page.getByText(textClickEquivalente).click();
        }
    });
};

export const crearIngresoEstandarParaPrecondicion = async (
    movimientosNav: MovimientosNavigationPage,
    registroMovimiento: RegistroMovimientoPage,
    resultadoMovimiento: ResultadoMovimientoPage,
    page: Page,
    codigoItem: string,
    nombreItem: string,
    cantidad: string,
    desdeMenu: boolean = false
) => {
    return await runFunctionalStep('Crear ingreso estándar para precondición', page, FUNCTIONAL_CATALOG.movimientos.registrarIngreso, async () => {
        if (desdeMenu) {
            await movimientosNav.navegarAIngresosDesdeMenu();
        } else {
            await movimientosNav.navegarAIngresos();
        }

        await registroMovimiento.clickAgregarIngreso();

        if (codigoItem === '111111') {
            await esperarCargaOverlay(page);
        }

        await registroMovimiento.buscarItem(codigoItem);
        await registroMovimiento.seleccionarItemEnResultados(nombreItem);
        await registroMovimiento.llenarCantidad(cantidad);
        await registroMovimiento.clickRegistrarIngreso()
        await resultadoMovimiento.irAlListado();
    });
};

export const crearIngresoEstandarParaPrecondicion2 = async (
    movimientosNav: MovimientosNavigationPage,
    registroMovimiento: RegistroMovimientoPage,
    resultadoMovimiento: ResultadoMovimientoPage,
    page: Page,
    codigoItem: string,
    nombreItem: string,
    cantidad: string,
    desdeMenu: boolean = false
): Promise<MovimientoCreado> => {
    let ingresoCreado!: MovimientoCreado;

    await runFunctionalStep(
        'Crear ingreso estándar para precondición',
        page,
        FUNCTIONAL_CATALOG.movimientos.registrarIngreso,
        async () => {
            if (desdeMenu) {
                await movimientosNav.navegarAIngresosDesdeMenu();
            } else {
                await movimientosNav.navegarAIngresos();
            }

            await registroMovimiento.clickAgregarIngreso();

            if (codigoItem === '111111') {
                await esperarCargaOverlay(page);
            }

            await registroMovimiento.buscarItem(codigoItem);
            await registroMovimiento.seleccionarItemEnResultados(nombreItem);

            await registroMovimiento.llenarCantidad(cantidad);

            const ingresoResponsePromise = page.waitForResponse((response) =>
                response.url().includes('/Logistica/api/v1/movimientos/ingresos') &&
                response.request().method() === 'POST' &&
                response.ok(),
            );

            await registroMovimiento.clickRegistrarIngreso();

            const ingresoResponse = await ingresoResponsePromise;
            const ingresoBody = await ingresoResponse.json();

            ingresoCreado = MovimientoApi.parseMovimientoCreado(ingresoBody);

            await resultadoMovimiento.irAlListado();
        },
    );

    return ingresoCreado;
};

export const crearSalidaEstandarParaPrecondicion = async (
    movimientosNav: MovimientosNavigationPage,
    registroMovimiento: RegistroMovimientoPage,
    resultadoMovimiento: ResultadoMovimientoPage,
    codigoItem: string,
    nombreItem: string,
    cantidad: string,
    variante?: string
) => {
    await runFunctionalStep(
        'Crear salida para precondición',
        undefined,
        {
            ...FUNCTIONAL_CATALOG.movimientos.registrarIngreso,
            flowStep: 'Generar salida base para escenario',
            userMessage: 'No se pudo crear la salida base para la precondición del caso.',
            technicalDetail: 'Falla al crear, registrar o despachar la salida de precondición.',
        },
        async () => {
            await movimientosNav.navegarASalidas();
            await registroMovimiento.clickAgregarSalida();
            await registroMovimiento.buscarItem(codigoItem);
            await registroMovimiento.seleccionarItemEnResultados(nombreItem);
            if (variante) {
                await registroMovimiento.seleccionarVariante(variante);
            }
            await registroMovimiento.llenarCantidad(cantidad);
            await registroMovimiento.clickTextoRegistrarSalida();
            await registroMovimiento.clickRegistrarYDespachar();
            await resultadoMovimiento.irAlListado();
        },
    );
};

export const crearIngresoBaseParaClonacion = async (
    movimientosNav: MovimientosNavigationPage,
    registroMovimiento: RegistroMovimientoPage,
    resultadoMovimiento: ResultadoMovimientoPage,
    codigoItem: string,
    nombreItem: string,
    opciones?: {
        waitAntes?: Page;
        seleccionarEquivalente?: string;
        configurarDatos?: () => Promise<void>;
    }
) => {
    await runFunctionalStep(
        'Crear ingreso base para clonación',
        undefined,
        FUNCTIONAL_CATALOG.movimientos.clonarMovimiento,
        async () => {
            await movimientosNav.navegarAIngresos();
            await registroMovimiento.clickAgregarIngreso();
            if (opciones?.waitAntes) {
                await esperarCargaOverlay(opciones.waitAntes);
            }
            await registroMovimiento.buscarItem(codigoItem);
            await registroMovimiento.seleccionarItemEnResultados(nombreItem);
            if (opciones?.seleccionarEquivalente) {
                await registroMovimiento.seleccionarEquivalente(opciones.seleccionarEquivalente);
            }
            if (opciones?.configurarDatos) {
                await opciones.configurarDatos();
            }
            await registroMovimiento.clickRegistrarIngreso();
            await resultadoMovimiento.irAlListado();
        },
    );
};
