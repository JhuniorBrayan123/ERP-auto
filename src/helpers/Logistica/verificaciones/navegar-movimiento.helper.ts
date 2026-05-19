/**
 * Helpers de navegación a secciones de movimientos.
 * Extraído de verificaciones-movimientos.helper.ts
 */
import {test} from '../../../fixtures/Logistica/movimientos-fixture';
import {MovimientosNavigationPage} from '../../../pages/Logistica/MovimientosNavigationPage';
import {RegistroMovimientoPage} from '../../../pages/Logistica/RegistroMovimientoPage';
import {FUNCTIONAL_CATALOG} from '../../../utils/functional-catalog';
import {runFunctionalStep} from '../../../utils/functional-step';

export const navegarAIngresosYNuevo = async (
    movimientosNav: MovimientosNavigationPage,
    registroMovimiento: RegistroMovimientoPage,
    desdeMenu: boolean = false
) => {
    await test.step('Abrir ingresos y crear nuevo movimiento', async () => {
        if (desdeMenu) {
            await movimientosNav.navegarAIngresosDesdeMenu();
        } else {
            await movimientosNav.navegarAIngresos();
        }
        await registroMovimiento.clickNuevoMovimiento();
    });
};

export const navegarATrasladosYNuevo = async (
    movimientosNav: MovimientosNavigationPage,
    registroMovimiento: RegistroMovimientoPage,
) => {
    await runFunctionalStep(
        'Navegar a traslados y crear nuevo',
        undefined,
        {
            ...FUNCTIONAL_CATALOG.movimientos.navegarIngresos,
            screen: 'Movimientos > Traslados',
            flowStep: 'Ingresar a traslados y abrir nuevo registro',
            userMessage: 'No se pudo abrir la pantalla de traslados para crear un nuevo movimiento.',
            technicalDetail: 'Falla en navegación hacia traslados o apertura del formulario.',
        },
        async () => {
            await movimientosNav.navegarATraslados();
            await registroMovimiento.clickAgregarTraslado();
        },
    );
};

export const navegarASalidasYNuevo = async (
    movimientosNav: MovimientosNavigationPage,
    registroMovimiento: RegistroMovimientoPage,
    desdeMenu: boolean = false,
    usarAgregar: boolean = false,
) => {
    await runFunctionalStep(
        'Navegar a salidas y crear nueva',
        undefined,
        {
            ...FUNCTIONAL_CATALOG.movimientos.navegarIngresos,
            screen: 'Movimientos > Salidas',
            flowStep: 'Ingresar a salidas y abrir nuevo registro',
            userMessage: 'No se pudo abrir la pantalla de salidas para crear un nuevo movimiento.',
            technicalDetail: 'Falla en navegación hacia salidas o apertura del formulario.',
        },
        async () => {
            if (desdeMenu) {
                await movimientosNav.navegarASalidasDesdeMenu();
            } else {
                await movimientosNav.navegarASalidas();
            }
            if (usarAgregar) {
                await registroMovimiento.clickAgregarSalida();
            } else {
                await registroMovimiento.clickNuevoMovimiento();
            }
        },
    );
};
