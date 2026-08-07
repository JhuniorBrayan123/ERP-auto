import {type Page} from '@playwright/test';
import {validarRetornoDineroCaja} from '@helpers/PuntoVenta/verificar-monto-caja.helper';
import type {CajasApi} from '@services/PuntoVenta/CajasApi';

/**
 * Verifica que tras la anulación el monto en SOLES de la caja retorna al valor inicial.
 */
export const VerificarRetornoDineroCaja = ({
    cajasApi,
    montoInicial,
    nombreCaja,
}: {
    cajasApi: CajasApi;
    montoInicial: number;
    nombreCaja: string;
}) => {
    const fn = async (_page: Page): Promise<void> => {
        await validarRetornoDineroCaja({
            cajasApi,
            montoInicial,
            montoDespuesVenta: montoInicial,
            retornoDinero: true,
            nombreCaja,
        });
    };

    fn.displayName = `Verificar retorno de dinero en caja tras anulación (delta neto ~0)`;
    return fn;
};