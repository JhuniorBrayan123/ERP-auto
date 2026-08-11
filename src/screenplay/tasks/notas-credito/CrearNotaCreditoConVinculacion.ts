import {expect, type Page} from '@playwright/test';
import {ComprobantePage} from '@pages/PuntoVenta/ComprobantePage';
import {NotaCreditoTargets} from '../../targets/notas-credito/NotaCreditoTargets';
import {VincularComprobanteTargets} from '../../targets/common/VincularComprobanteTargets';
import {type DatosVinculacion, VincularComprobante} from '../../interactions/notas/VincularComprobante';
import {
    type MotivoNotaCredito,
    SeleccionarMotivoNotaCredito
} from '../../interactions/notas/SeleccionarMotivoNotaCredito';
import {LlenarMotivoNotaCredito} from '../../interactions/notas/LlenarMotivoTexto';
import {ActivarRetornoStock, DesactivarRetornoStock} from '../../interactions/notas/ActivarRetornoStock';
import {EmitirNotaCreditoConDevolucion, type ResultadoEmisionNota} from '../../interactions/notas/EmitirNotaCredito';
import {EditarItemNotaCredito} from "@helpers/PuntoVenta/EditarItemNotaCredito";

export interface DatosCrearNotaCreditoVinculada {
    vinculacion: DatosVinculacion;
    motivo: MotivoNotaCredito;
    textoMotivo: string;
    retornoStock?: boolean;
    devolucionPorItem?: boolean;
    monto?: string;
    nuevoDescuento?: string;
    cantidadBonificar?: string;
    precioBonificacion?: string;
    cantidadDevolver?: string;
    nuevaDescripcion?: string;
}


export const CrearNotaCreditoConVinculacion = (datos: DatosCrearNotaCreditoVinculada) => {
    const fn = async (page: Page): Promise<ResultadoEmisionNota> => {
        const comprobantePage = new ComprobantePage(page);
        await comprobantePage.seleccionarNotaCredito();

        await VincularComprobante(datos.vinculacion)(page);

        await VincularComprobanteTargets.btnVincularYCrearNC(page).click();

        await expect(NotaCreditoTargets.gridItems(page)).toBeVisible({timeout: 15_000});

        await SeleccionarMotivoNotaCredito(datos.motivo)(page);

        if (datos.retornoStock === true) {
            await ActivarRetornoStock()(page);
        } else if (datos.retornoStock === false) {
            await DesactivarRetornoStock()(page);
        }

        if (datos.devolucionPorItem) {
            await EditarItemNotaCredito({
                motivo: datos.motivo,
                nuevoDescuento: datos.nuevoDescuento,
                cantidadBonificar: datos.cantidadBonificar,
                precioBonificacion: datos.precioBonificacion,
                cantidadDevolver: datos.cantidadDevolver,
                nuevaDescripcion: datos.nuevaDescripcion
            })(page);
        }

        await LlenarMotivoNotaCredito(datos.textoMotivo)(page);

        if (datos.monto) {
            const inputMonto = NotaCreditoTargets.inputMonto(page);
            await inputMonto.click();
            await inputMonto.fill(datos.monto);
        }
        
        const requierePagoModal = datos.motivo !== 'Corrección por error en la descripción';
        return EmitirNotaCreditoConDevolucion(requierePagoModal)(page);
    };

    fn.displayName = `Crear NC ${datos.motivo} desde ${datos.vinculacion.tipoDocumento} ${datos.vinculacion.serie}-${datos.vinculacion.correlativo}`;
    return fn;
};
