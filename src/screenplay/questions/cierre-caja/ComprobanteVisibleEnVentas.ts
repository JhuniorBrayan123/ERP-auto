import { type Page } from '@playwright/test';
import { CierreCajaTargets } from '@screenplay/targets/cierre-caja/CierreCajaTargets';
import { VentasCajaTargets } from '@screenplay/targets/cierre-caja/VentasCajaTargets';

export interface DatosComprobanteEsperado {
    tipoDocumento?: string;
    serie?: string;
    correlativo?: string;
    cliente?: string;
    moneda?: string;
    estado?: string;
}


export const ComprobanteVisibleEnVentas = (datos: DatosComprobanteEsperado) => {
    const fn = async (page: Page): Promise<boolean> => {
        const contenedor = CierreCajaTargets.contenedorPrincipal(page);

        if (datos.serie) {
            try {
                await contenedor.locator('.serie:visible, .mobile-serie-correlativo:visible').getByText(String(datos.serie), { exact: false }).first().waitFor({ state: 'visible', timeout: 5000 });
            } catch (e) {
                throw new Error(`Validación fallida: No se encontró la serie '${datos.serie}' visible en la tabla.`);
            }
        }

        if (datos.correlativo) {
            const correlativoLimpio = Number(datos.correlativo).toString();
            try {
                await contenedor.locator('.correlativo:visible, .mobile-serie-correlativo:visible').getByText(correlativoLimpio, { exact: false }).first().waitFor({ state: 'visible', timeout: 5000 });
            } catch (e) {
                throw new Error(`Validación fallida: No se encontró el correlativo '${correlativoLimpio}' visible en la tabla.`);
            }
        }

        if (datos.tipoDocumento) {
            try {
                await contenedor.locator('.tipo-comprobante:visible, .mobile-tipo:visible').getByText(datos.tipoDocumento, { exact: false }).first().waitFor({ state: 'visible', timeout: 3000 });
            } catch (e) {
                throw new Error(`Validación fallida: No se encontró el tipo de documento '${datos.tipoDocumento}' visible en la tabla.`);
            }
        }

        if (datos.cliente) {
            try {
                await contenedor.locator('.razon-social:visible, .mobile-razon-social:visible').getByText(datos.cliente, { exact: false }).first().waitFor({ state: 'visible', timeout: 3000 });
            } catch (e) {
                throw new Error(`Validación fallida: No se encontró el cliente '${datos.cliente}' visible en la tabla.`);
            }
        }

        if (datos.estado) {
            try {
                await contenedor.locator('.label-estado-comprobante:visible').getByText(datos.estado, { exact: true }).first().waitFor({ state: 'visible', timeout: 3000 });
            } catch (e) {
                throw new Error(`Validación fallida: No se encontró el estado '${datos.estado}' visible en la tabla.`);
            }
        }

        return true;
    };

    fn.displayName = `¿Comprobante visible en Ventas? ${JSON.stringify(datos)}`;
    return fn;
};


export const AccionesDisponiblesDeComprobante = () => {
    const fn = async (page: Page): Promise<string[]> => {
        await VentasCajaTargets.btnAccionesFila(page, 0).click();

        const listaOpciones = page.locator('.opciones-container .opcion-item .v-text');
        const textos = await listaOpciones.allTextContents();

        
        await page.keyboard.press('Escape');

        return textos.map(t => t.trim()).filter(Boolean);
    };

    fn.displayName = 'Leer acciones disponibles del comprobante';
    return fn;
};


export const VerPagoEsVisible = () => {
    const fn = async (page: Page): Promise<boolean> => {
        await VentasCajaTargets.btnAccionesFila(page, 0).click();
        const opcionVerPago = VentasCajaTargets.opcionVerPago(page);
        const visible = await opcionVerPago.isVisible({ timeout: 3_000 }).catch(() => false);
        await page.keyboard.press('Escape');
        return visible;
    };

    fn.displayName = '¿"Ver Pago" es visible en las acciones del comprobante?';
    return fn;
};


export interface InfoPago {
    metodosPago: string[];
    numeroDocumento: string;
}

export const DatosDelPago = () => {
    const fn = async (page: Page): Promise<InfoPago> => {
        const modal = page.locator('.v-dialog, .v-modal, .modal-content, .modal, .payment-info').filter({ hasText: /pago/i }).first();

        
        const tituloLocator = page.locator('.payment-info .v-text.v-h4.regular').first();
        const tituloTexto = await tituloLocator.textContent({ timeout: 5000 }).catch(() => '') ?? '';

        // Extraer todos los métodos de pago listados (.method-name-date span)
        const metodosLocator = page.locator('.method-name-date > span.v-text.success, .method-name-date span.bold');
        let metodos: string[] = [];

        const count = await metodosLocator.count();
        if (count > 0) {
            metodos = await metodosLocator.allTextContents();
        } else {
            
            const posiblesMetodos = ['EFECTIVO', 'POS VISA', 'VOUCHER', 'MASTERCARD', 'YAPE', 'NIUBIZ'];
            for (const metodo of posiblesMetodos) {
                const existe = await page.getByText(metodo, { exact: true }).isVisible().catch(() => false);
                if (existe) metodos.push(metodo);
            }
        }

        return {
            metodosPago: metodos.map(m => m.trim()).filter(Boolean),
            numeroDocumento: tituloTexto.trim(),
        };
    };

    fn.displayName = 'Leer datos del modal Ver Pago';
    return fn;
};
