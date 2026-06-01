import {Page} from '@playwright/test';
import {GuiaTransportistaPage} from '@pages/PuntoVenta/guias-remision/GuiaTransportistaPage';
import {GUIAS_DATA} from '@helpers/PuntoVenta/guias-data.helper';
import {runFunctionalAction} from '@utils/functional-step';

export type EmitirGuiaTransportistaData = {
    peso: string;
    items: Array<{ codigoONombre: string }>;
    vincularComprobante?: {
        tipo: 'BOLETA_DE_VENTA' | 'FACTURA';
        serie: string;
        correlativo: string;
        rucProveedor: string;
    };
    pagadorFlete?: 'remitente' | 'destinatario' | 'otros_terceros' | 'subcontratador';
    pagadorFleteData?: {
        documento: string;
    };
    retorno?: 'retorno-vehiculo' | 'transporte-subcontratado';
    subcontratador?: {
        documento: string;
    };
    autorizacionEspecial?: {
        numeroAutorizacion: string;
        tuce?: string;
    };
    decrementarCantidad?: boolean;
    fechaInicioTraslado?: string;
};

export const EmitirGuiaTransportistaTask = (data: EmitirGuiaTransportistaData) => {
    return async (page: Page) => {
        const guiaPage = new GuiaTransportistaPage(page);

        await runFunctionalAction(page, {
            module: 'Emisiones',
            screen: 'Guía de Remisión Transportista',
            flowStep: 'Completar datos de la guía transportista',
            userMessage: 'No se pudo completar los datos de la guía',
            technicalDetail: 'Error al llenar datos del formulario',
            failureCategory: 'SCRIPT'
        }, async () => {

            await guiaPage.seleccionarRemitente(GUIAS_DATA.REMITENTE.DNI);
            await guiaPage.seleccionarDestinatario(GUIAS_DATA.DESTINATARIO.RUC);

            // Vincular comprobante
            if (data.vincularComprobante) {
                const { tipo, serie, correlativo, rucProveedor } = data.vincularComprobante;
                await page.getByRole('button', { name: 'Vincular comprobante' }).click();
                await page.getByRole('button', { name: 'Vincular comprobante' }).click();
                if (tipo === 'BOLETA_DE_VENTA') {
                    await page.getByText('Boleta de venta').click();
                } else {
                    await page.getByText('Factura').click();
                }
                await page.getByRole('textbox', { name: 'Serie' }).fill(serie);
                await page.getByRole('textbox', { name: 'Correlativo' }).fill(correlativo);
                await page.getByRole('textbox', { name: 'RUC Proveedor' }).fill(rucProveedor);
                await page.getByRole('button', { name: 'Añadir' }).click();
                await page.getByRole('button', { name: 'Cerrar' }).click();
                await page.getByRole('button', { name: 'Guardar comprobante' }).click();
            }

            // Pagador de flete
            if (data.pagadorFlete) {
                const pagadorLabel: Record<string, string> = {
                    remitente: 'Remitente',
                    destinatario: 'Destinatario',
                    otros_terceros: 'Otros(Terceros)',
                    subcontratador: 'Subcontratador',
                };
                await page.getByText(pagadorLabel[data.pagadorFlete]).click();
            }

            // Datos del pagador de flete (documento)
            if (data.pagadorFleteData) {
                await page.getByRole('textbox', { name: /Digite N.° de RUC, nombre o/ }).fill(data.pagadorFleteData.documento);
            }

            // Retorno
            if (data.retorno === 'transporte-subcontratado') {
                await page.getByRole('button', { name: 'Retorno de vehículo con' }).click();
                await page.getByText('Transporte subcontratado').click();
            } else if (data.retorno === 'retorno-vehiculo') {
                await page.getByRole('button', { name: 'Retorno de vehículo con' }).click();
            }

            // Subcontratador
            if (data.subcontratador) {
                await page.getByRole('textbox', { name: /Digite N.° de RUC, nombre o/ }).fill(data.subcontratador.documento);
            }

            // Autorización especial
            if (data.autorizacionEspecial) {
                await page.getByRole('checkbox', { name: 'Autorización Especial' }).check();
                await page.getByRole('textbox', { name: 'Número de autorización' }).fill(data.autorizacionEspecial.numeroAutorizacion);
                if (data.autorizacionEspecial.tuce) {
                    await page.getByRole('textbox', { name: /TUCE/ }).fill(data.autorizacionEspecial.tuce);
                }
            }

            // Decrementar cantidad
            if (data.decrementarCantidad) {
                await page.getByRole('button', { name: /decrementar|decrement/i }).click();
            }

            // Fecha inicio traslado
            if (data.fechaInicioTraslado) {
                await page.getByRole('textbox', { name: /fecha.*inicio.*traslado/i }).fill(data.fechaInicioTraslado);
            }

            await guiaPage.emitirGuia();
        });
    };
};
