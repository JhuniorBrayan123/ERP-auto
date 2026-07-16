import {type Page} from '@playwright/test';
import {SeleccionarTipoComprobante} from '@screenplay/interactions/facturacion/SeleccionarTipoComprobante';
import {BuscarYSeleccionarCliente} from '@screenplay/interactions/facturacion/BuscarYSeleccionarCliente';
import {BuscarYAgregarProducto} from '@screenplay/interactions/facturacion/BuscarYAgregarProducto';
import {LlenarObservaciones} from '@screenplay/interactions/common/LlenarObservaciones';
import {EmitirPedidoVF} from '@screenplay/interactions/pedido/EmitirPedidoVF';
import {type ResultadoEmisionVF} from '@screenplay/interactions/cotizacion/EmitirCotizacionVF';
import {PedidoTargets} from '@screenplay/targets/pedido/PedidoTargets';
import type {DatosCliente, ItemVenta} from '@app-types/emision.types';

export interface DatosPedidoVF {
    cliente?: DatosCliente & { textoSelector?: string };
    items: ItemVenta[];
    observaciones?: string;
    clienteSinDoc?: { nombre: string; direccion: string };
}

export const CrearPedidoVF = (datos: DatosPedidoVF) => {
    const fn = async (page: Page): Promise<ResultadoEmisionVF> => {
        await SeleccionarTipoComprobante('PEDIDO')(page);

        if (datos.clienteSinDoc) {
            await PedidoTargets.switchClienteSinDoc(page).click();
            await PedidoTargets.inputRazonSocialSinDoc(page).fill(datos.clienteSinDoc.nombre);
            await PedidoTargets.inputDireccionSinDoc(page).fill(datos.clienteSinDoc.direccion);
        } else if (datos.cliente) {
            await BuscarYSeleccionarCliente(datos.cliente)(page);
        }

        for (const item of datos.items) {
            await BuscarYAgregarProducto(item)(page);
        }

        if (datos.observaciones) {
            await LlenarObservaciones(datos.observaciones)(page);
        }

        const resultado = await EmitirPedidoVF()(page);

        return resultado;
    };

    fn.displayName = datos.cliente
        ? `Crear Pedido VF — ${datos.cliente.nombre}`
        : datos.clienteSinDoc
            ? `Crear Pedido VF — ${datos.clienteSinDoc.nombre} (sin doc)`
            : 'Crear Pedido VF — sin cliente';
    return fn;
};
