/**
 * Helpers de acciones sobre listado de movimientos (eliminar, editar, clonar).
 * Extraído de verificaciones-movimientos.helper.ts
 */
import {ListadoMovimientosPage} from '@pages/Logistica/ListadoMovimientosPage';
import {RegistroMovimientoPage} from '@pages/Logistica/RegistroMovimientoPage';
import {FUNCTIONAL_CATALOG} from '@utils/functional-catalog';
import {runFunctionalStep} from '@utils/functional-step';

export const eliminarMovimientoDesdeListado = async (
    listadoMovimientos: ListadoMovimientosPage,
    usarIcono: boolean = false
) => {
    await runFunctionalStep(
        'Eliminar movimiento desde el listado', undefined,
        {
            ...FUNCTIONAL_CATALOG.movimientos.editarMovimiento,
            flowStep: 'Eliminar movimiento desde el listado',
            userMessage: 'No se pudo eliminar el movimiento desde el listado.',
            technicalDetail: 'Falla al abrir acciones, confirmar eliminación o cerrar modal.'
        },
        async () => {
            if (usarIcono) {
                await listadoMovimientos.abrirMenuAccionesIcono();
            } else {
                await listadoMovimientos.abrirMenuAcciones();
            }
            await listadoMovimientos.clickEliminarMovimiento();
            await listadoMovimientos.confirmarEliminacion();
            await listadoMovimientos.cerrarModal();
        },
    );
};

export const editarCantidadDeMovimiento = async (
    listadoMovimientos: ListadoMovimientosPage,
    registroMovimiento: RegistroMovimientoPage,
    cantidad: string,
    tipo: 'ingreso' | 'salida' = 'ingreso',
) => {
    await runFunctionalStep(`Editar cantidad del movimiento a ${cantidad}`, undefined, FUNCTIONAL_CATALOG.movimientos.editarMovimiento, async () => {
        await listadoMovimientos.abrirMenuAcciones();
        await listadoMovimientos.clickEditarMovimiento();
        await registroMovimiento.llenarCantidad(cantidad);
        if (tipo === 'ingreso') {
            await registroMovimiento.clickActualizarIngreso();
        } else {
            await registroMovimiento.clickActualizarSalida();
        }
        await listadoMovimientos.cerrarModal();
    });
};

export const clonarMovimientoDesdeListado = async (
    listadoMovimientos: ListadoMovimientosPage,
    registroMovimiento: RegistroMovimientoPage,
    antesDeConfirmar?: () => Promise<void>,
) => {
    await runFunctionalStep('Clonar movimiento desde listado', undefined, FUNCTIONAL_CATALOG.movimientos.clonarMovimiento, async () => {
        await listadoMovimientos.abrirMenuAcciones();
        await listadoMovimientos.clickClonarMovimiento();
        if (antesDeConfirmar) {
            await antesDeConfirmar();
        }
        await registroMovimiento.clickClonarIngreso();
        await listadoMovimientos.cerrarModal();
    });
};
