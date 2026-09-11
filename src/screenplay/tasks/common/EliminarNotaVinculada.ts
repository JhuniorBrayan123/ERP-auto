import {type Page} from '@playwright/test';
import {BusquedaComprobantesPage} from '@pages/PuntoVenta/BusquedaComprobantesPage';
import {EliminarComprobante} from '@task/PuntoVenta/busqueda-comprobantes/EliminarComprobante';
import {ClickNuevaVenta} from '@interactions/PuntoVenta/ClickNuevaVenta';
import {recargarSiHayError} from '@utils/wait-helpers';
import {BC_MOTIVOS_ELIMINACION} from '@helpers/PuntoVenta/busqueda-comprobantes.data';

export interface DatosEliminacionNotaVinculada {
    correlativo: string;
    numeroCompleto: string;
}

const MAX_INTENTOS_MENU = 3;

// Solo para la limpieza de NC/ND: a veces, tras salir de caja, el menú
// "Ventas y compras" no llega a renderizar (glitch de la app). En vez de
// tocar navegarABusquedaComprobantes (compartida con otros flujos), este
// reintento vive localizado acá — recargarSiHayError ya existe para esto.
async function asegurarMenuVentasYCompras(page: Page): Promise<void> {
    for (let intento = 1; intento <= MAX_INTENTOS_MENU; intento++) {
        const visible = await page.getByText('Ventas y compras').isVisible().catch(() => false);
        if (visible) return;
        await recargarSiHayError(page);
    }
}

export const EliminarNotaVinculada = ({
    correlativo,
    numeroCompleto,
}: DatosEliminacionNotaVinculada) => {
    const fn = async (page: Page): Promise<void> => {
        const busqueda = new BusquedaComprobantesPage(page);

        await ClickNuevaVenta()(page);
        await busqueda.salirDeCaja();
        await asegurarMenuVentasYCompras(page);
        await page.getByText('Ventas y compras').click();
        await page.getByText('Búsqueda de comprobantes').click();
        await busqueda.filtrarPorCorrelativo(correlativo);

        await busqueda.abrirAccionesDeComprobante(numeroCompleto);
        await EliminarComprobante.conMotivo(BC_MOTIVOS_ELIMINACION.ERROR_DATOS)(page);
    };

    fn.displayName = `Eliminar nota vinculada ${numeroCompleto} (limpieza automatizada)`;
    return fn;
};
