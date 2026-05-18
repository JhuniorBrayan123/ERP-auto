/**
 * Helpers de verificación de bitácora de movimientos.
 * Extraído de verificaciones-movimientos.helper.ts
 */
import {ListadoMovimientosPage} from '@pages/Logistica/ListadoMovimientosPage';
import {FUNCTIONAL_CATALOG} from '../../../utils/functional-catalog';
import {runFunctionalStep} from '../../../utils/functional-step';

export const verificarEventoEnBitacora = async (
    listadoMovimientos: ListadoMovimientosPage,
    evento: string
) => {
    await runFunctionalStep(`Validar bitácora con evento ${evento}`, undefined, FUNCTIONAL_CATALOG.movimientos.verificarBitacora, async () => {
        await listadoMovimientos.abrirMenuAcciones();
        await listadoMovimientos.clickVerBitacora();
        await listadoMovimientos.clickEventoBitacora(evento);
        await listadoMovimientos.cerrarBitacora();
    });
};

export const abrirYCerrarBitacora = async (
    listadoMovimientos: ListadoMovimientosPage,
    cerrarAlternativo: boolean = false
) => {
    await runFunctionalStep('Verificar apertura de bitácora', undefined, FUNCTIONAL_CATALOG.movimientos.verificarBitacora, async () => {
        await listadoMovimientos.abrirMenuAcciones();
        await listadoMovimientos.clickVerBitacora();
        if (cerrarAlternativo) {
            await listadoMovimientos.cerrarBitacoraAlternativo();
        } else {
            await listadoMovimientos.cerrarBitacora();
        }
    });
};

export const verificarBitacoraEdicion = async (
    listadoMovimientos: ListadoMovimientosPage,
    eventos: string[],
    cerrarAlternativo: boolean = false,
) => {
    await runFunctionalStep(`Validar bitácora de edición (${eventos.join(', ')})`, undefined, FUNCTIONAL_CATALOG.movimientos.verificarBitacora, async () => {
        await listadoMovimientos.abrirMenuAcciones();
        await listadoMovimientos.clickVerBitacora();
        for (const evento of eventos) {
            await listadoMovimientos.clickEventoBitacora(evento);
        }
        if (cerrarAlternativo) {
            await listadoMovimientos.cerrarBitacoraAlternativo();
        } else {
            await listadoMovimientos.cerrarBitacora();
        }
    });
};
