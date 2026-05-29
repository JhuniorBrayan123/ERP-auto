import {test} from '@fixtures/Logistica/movimientos-fixture';
import {RegistroMovimientoPage} from '@pages/Logistica/RegistroMovimientoPage';
import {ResultadoMovimientoPage} from '@pages/Logistica/ResultadoMovimientoPage';
import {FUNCTIONAL_CATALOG} from '@utils/functional-catalog';
import {runFunctionalStep} from '@utils/functional-step';

export const definirAlmacenYMotivo = async (
    registroMovimiento: RegistroMovimientoPage,
    almacenOrigen: string,
    almacenDestino: string,
    motivoGral: string,
    motivoEspecifico: string
) => {
    await runFunctionalStep('Seleccionar almacén y motivo del movimiento', undefined, FUNCTIONAL_CATALOG.movimientos.definirAlmacenMotivo, async () => {
        await registroMovimiento.seleccionarAlmacen(almacenOrigen, almacenDestino);
        await registroMovimiento.seleccionarMotivo(motivoGral, motivoEspecifico);
    });
};

export const definirCantidadYFactor = async (
    registroMovimiento: RegistroMovimientoPage,
    cantidad: string,
    factor: 'Agregar' | 'Quitar',
) => {
    await test.step(`Configurar cantidad y factor de ajuste (${factor})`, async () => {
        await registroMovimiento.llenarCantidad(cantidad);
        await registroMovimiento.seleccionarFactorAjuste(factor);
    });
};

export const buscarYSeleccionarItem = async (
    registroMovimiento: RegistroMovimientoPage,
    codigoItem: string,
    nombreItem: string,
) => {
    await test.step('Buscar y seleccionar producto del movimiento', async () => {
        await registroMovimiento.buscarItem(codigoItem);
        await registroMovimiento.seleccionarItemEnResultados(nombreItem);
    });
}

export const definirCantidadYRegistrarIngreso = async (
    registroMovimiento: RegistroMovimientoPage,
    cantidad: string,
    resultadoMovimiento?: ResultadoMovimientoPage
) => {
    await runFunctionalStep('Registrar ingreso con cantidad definida', undefined, FUNCTIONAL_CATALOG.movimientos.registrarIngreso, async () => {
        await registroMovimiento.llenarCantidad(cantidad);
        await registroMovimiento.clickRegistrarIngreso();
        if (resultadoMovimiento) {
            await resultadoMovimiento.irAlListado();
        }
    });
};

export const registrarIngresoEIrAlListado = async (
    registroMovimiento: RegistroMovimientoPage,
    resultadoMovimiento: ResultadoMovimientoPage
) => {
    await runFunctionalStep('Registrar ingreso y volver al listado', undefined, FUNCTIONAL_CATALOG.movimientos.registrarIngreso, async () => {
        await registroMovimiento.clickRegistrarIngreso();
        await resultadoMovimiento.irAlListado();
    });
};

export const registrarAjusteEIrAlListado = async (
    registroMovimiento: RegistroMovimientoPage,
    resultadoMovimiento: ResultadoMovimientoPage,
) => {
    await test.step('Registrar ajuste y volver al listado', async () => {
        await registroMovimiento.clickRegistrarAjuste();
        await resultadoMovimiento.irAlListado();
    });
};

export const registrarSalidaYDespachar = async (
    registroMovimiento: RegistroMovimientoPage,
    resultadoMovimiento: ResultadoMovimientoPage,
    usarMetodoAvanzado: boolean = false
) => {
    await runFunctionalStep(
        'Registrar salida con despacho y volver al listado',
        undefined,
        {
            ...FUNCTIONAL_CATALOG.movimientos.registrarIngreso,
            flowStep: 'Registrar salida y despacharla',
            userMessage: 'No se pudo registrar y despachar la salida de almacén.',
            technicalDetail: 'Falla al registrar salida o confirmar despacho.',
        },
        async () => {
            if (usarMetodoAvanzado) {
                await registroMovimiento.clickTextoRegistrarSalida();
            } else {
                await registroMovimiento.clickRegistrarSalida();
            }
            await registroMovimiento.clickRegistrarYDespachar();
            await resultadoMovimiento.irAlListado();
        },
    );
};

export const registrarTrasladoEIrAlListado = async (
    registroMovimiento: RegistroMovimientoPage,
    resultadoMovimiento: ResultadoMovimientoPage
) => {
    await runFunctionalStep(
        'Registrar traslado y volver al listado',
        undefined,
        {
            ...FUNCTIONAL_CATALOG.movimientos.registrarIngreso,
            flowStep: 'Registrar traslado entre almacenes',
            userMessage: 'No se pudo registrar el traslado entre almacenes.',
            technicalDetail: 'Falla al confirmar el registro del traslado.',
        },
        async () => {
            await registroMovimiento.clickRegistrarTraslado();
            await resultadoMovimiento.irAlListado();
        },
    );
};
