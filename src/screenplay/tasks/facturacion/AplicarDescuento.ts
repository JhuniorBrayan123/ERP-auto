import { type Page } from '@playwright/test';
import { EmisionPage } from '@pages/PuntoVenta/EmisionPage';
import { VentaGridTargets } from '@screenplay/targets/facturacion/VentaGridTargets';

export const AplicarDescuentoGlobal = (params: {
    valor: string;
    tipo: 'porcentaje' | 'monto';
}) => {
    const fn = async (page: Page): Promise<void> => {
        const emisionPage = new EmisionPage(page);
        await emisionPage.abrirDescuentoGlobal();
        await emisionPage.llenarDescuentoGlobal(params.valor);
        await emisionPage.aplicarDescuentoGlobal();
    };
    fn.displayName = `Aplicar descuento global: ${params.valor} (${params.tipo})`;
    return fn;
};

export const AplicarDescuentoItem = (params: {
    indiceItem: number;
    valor: string;
    tipo: 'porcentaje' | 'monto';
}) => {
    const fn = async (page: Page): Promise<void> => {
        
        await VentaGridTargets.btnEditarItem(page, params.indiceItem).click();

        
        const emisionPage = new EmisionPage(page);
        if (params.tipo === 'monto') {
            await emisionPage.seleccionarTipoDescuentoMonto();
        } else {
            await emisionPage.seleccionarTipoDescuentoPorcentaje();
        }

        
        await VentaGridTargets.inputDescuento(page, params.indiceItem).fill(params.valor);

        
        await VentaGridTargets.btnAceptarEdicion(page, params.indiceItem).click();
    };
    fn.displayName = `Aplicar descuento ${params.tipo}: ${params.valor} en ítem ${params.indiceItem}`;
    return fn;
};
