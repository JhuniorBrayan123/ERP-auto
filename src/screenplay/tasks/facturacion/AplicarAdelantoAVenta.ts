import { expect, type Page } from '@playwright/test';
import { esperarDebounce } from '@utils/wait-helpers';
import { SeleccionarTipoComprobante } from '@screenplay/interactions/facturacion/SeleccionarTipoComprobante';
import { BuscarYSeleccionarCliente } from '@screenplay/interactions/facturacion/BuscarYSeleccionarCliente';
import { BuscarYAgregarProducto } from '@screenplay/interactions/facturacion/BuscarYAgregarProducto';
import { ConfirmarPago } from '@screenplay/interactions/facturacion/ConfirmarPago';
import { FacturacionTargets } from '@screenplay/targets/facturacion/FacturacionTargets';
import { AdelantosTargets } from '@screenplay/targets/facturacion/AdelantosTargets';
import type { DatosCliente, ItemVenta } from '@helpers/PuntoVenta/emision.types';
import type { ResultadoEmision } from './EmitirComprobanteSimple';

type TipoComprobante = 'BOLETA' | 'FACTURA' | 'NOTA DE VENTA';

export interface DatosAplicarAdelanto {
    tipoComprobante: TipoComprobante;
    cliente: DatosCliente & { textoSelector?: string };
    productos: ItemVenta[];
    adelanto: {
        serie: string;       
        correlativo: string; 
    };
}

export const AplicarAdelantoAVenta = (datos: DatosAplicarAdelanto) => {
    const fn = async (page: Page): Promise<ResultadoEmision> => {
        await SeleccionarTipoComprobante(datos.tipoComprobante)(page);
        await BuscarYSeleccionarCliente(datos.cliente)(page);

        
        await AdelantosTargets.flechaExpandir(page).click();

        
        await AdelantosTargets.dropdownSerie(page).click();
        
        if (datos.tipoComprobante === 'BOLETA') {
            await AdelantosTargets.opcionSerieBoleta(page).click();
        } else if (datos.tipoComprobante === 'FACTURA') {
            await AdelantosTargets.opcionSerieFactura(page).click();
        } else {
            await AdelantosTargets.opcionSerieNotaVenta(page).click();
        }

        
        await AdelantosTargets.inputCorrelativo(page).fill(datos.adelanto.correlativo);
        await esperarDebounce(page, 500, 'Esperar antes de presionar Enter para correlativo');
        await AdelantosTargets.inputCorrelativo(page).press('Enter');
        await esperarDebounce(page, 800, 'Esperar tras presionar Enter para filtrar adelanto');

        
        await AdelantosTargets.checkboxPrimerAdelanto(page).click();

        
        for (const producto of datos.productos) {
            await BuscarYAgregarProducto(producto)(page);
            // Agregar el ítem nuevamente para incrementar la cantidad a 2 y asegurar
            // que el monto de la venta sea estrictamente mayor al adelanto aplicado.
            await BuscarYAgregarProducto(producto)(page);
        }

        const resultado = await ConfirmarPago('efectivo')(page);
        await expect(FacturacionTargets.mensajeExito(page)).toBeVisible({ timeout: 15_000 });
        await FacturacionTargets.btnNuevaVenta(page).click();
        await page.waitForLoadState('networkidle').catch(() => {});

        const numero = `${resultado.serie}-${String(resultado.correlativo).padStart(8, '0')}`;
        return { ...resultado, numero };
    };
    fn.displayName = `Aplicar adelanto ${datos.adelanto.serie}-${datos.adelanto.correlativo} a venta`;
    return fn;
};

