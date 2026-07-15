import { type Page } from '@playwright/test';
import { SeleccionarTipoComprobante } from '@screenplay/interactions/facturacion/SeleccionarTipoComprobante';
import { BuscarYSeleccionarCliente } from '@screenplay/interactions/facturacion/BuscarYSeleccionarCliente';
import { BuscarYAgregarProducto } from '@screenplay/interactions/facturacion/BuscarYAgregarProducto';
import { EmitirCotizacionVF, type ResultadoEmisionVF } from '@screenplay/interactions/cotizacion/EmitirCotizacionVF';
import { LlenarObservaciones } from '@screenplay/interactions/common/LlenarObservaciones';
import { CotizacionTargets } from '@screenplay/targets/cotizacion/CotizacionTargets';
import { FacturacionTargets } from '@screenplay/targets/facturacion/FacturacionTargets';
import type { DatosCliente, ItemVenta } from '@app-types/emision.types';

export interface DatosCotizacionVF {
    cliente?: DatosCliente & { textoSelector?: string };
    items: ItemVenta[];
    validezOferta?: string;
    igv?: string;
    observaciones?: string;
    incluirImagenes?: boolean;
    incluirDescripcion?: boolean;
    clienteSinDoc?: { nombre: string; direccion: string };
}

export const CrearCotizacionVF = (datos: DatosCotizacionVF) => {
    const fn = async (page: Page): Promise<ResultadoEmisionVF> => {
        // 1. Seleccionar tipo de comprobante: COTIZACIÓN
        await SeleccionarTipoComprobante('COTIZACION')(page);

        // 2. Cliente
        if (datos.clienteSinDoc) {
            await CotizacionTargets.switchClienteSinDoc(page).click();
            await CotizacionTargets.inputRazonSocialSinDoc(page).fill(datos.clienteSinDoc.nombre);
            await CotizacionTargets.inputDireccionSinDoc(page).fill(datos.clienteSinDoc.direccion);
        } else if (datos.cliente) {
            await BuscarYSeleccionarCliente(datos.cliente)(page);
        }

        // 3. Vigencia de oferta
        if (datos.validezOferta) {
            await CotizacionTargets.selectorVigencia(page).click();
            await CotizacionTargets.opcionVigencia(page, datos.validezOferta).click();
        }

        // 4. IGV
        if (datos.igv) {
            await CotizacionTargets.selectorIGV(page).click();
            await CotizacionTargets.opcionIGV(page, datos.igv).click();
        }

        // 5. Imágenes y descripción
        if (datos.incluirImagenes) {
            await CotizacionTargets.switchIncluirImagenes(page).click();
        }
        if (datos.incluirDescripcion) {
            await CotizacionTargets.switchIncluirDescripcion(page).click();
        }

        // 6. Agregar productos
        for (const item of datos.items) {
            await BuscarYAgregarProducto(item)(page);
        }

        // 7. Observaciones
        if (datos.observaciones) {
            await LlenarObservaciones(datos.observaciones)(page);
        }

        // 8. Emitir + capturar resultado
        const resultado = await EmitirCotizacionVF()(page);

        return resultado;
    };

    fn.displayName = datos.cliente
        ? `Crear Cotización VF — ${datos.cliente.nombre}`
        : datos.clienteSinDoc
            ? `Crear Cotización VF — ${datos.clienteSinDoc.nombre} (sin doc)`
            : 'Crear Cotización VF — sin cliente';
    return fn;
};
