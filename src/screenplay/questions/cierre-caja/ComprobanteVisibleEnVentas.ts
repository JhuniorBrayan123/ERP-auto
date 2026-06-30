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

// ─── Question: ComprobanteVisibleEnVentas ─────────────────────────────────────
/**
 * Verifica si el contenedor de la tabla de Ventas contiene la información
 * del comprobante esperado. Retorna true si está presente.
 */
export const ComprobanteVisibleEnVentas = (datos: DatosComprobanteEsperado) => {
    const fn = async (page: Page): Promise<boolean> => {
        const contenedor = CierreCajaTargets.contenedorPrincipal(page);

        if (datos.serie) {
            try {
                // Buscamos dentro de un <td> porque getByRole('cell') puede fallar si la tabla tiene estilos flex
                await contenedor.locator('td').getByText(String(datos.serie), { exact: false }).first().waitFor({ state: 'visible', timeout: 5000 });
            } catch (e) {
                throw new Error(`Validación fallida: No se encontró la serie '${datos.serie}' visible en la tabla.`);
            }
        }

        if (datos.correlativo) {
            const correlativoLimpio = Number(datos.correlativo).toString();
            try {
                // Buscamos exactamente el número del correlativo dentro de un <td>
                await contenedor.locator('td').getByText(correlativoLimpio, { exact: true }).first().waitFor({ state: 'visible', timeout: 5000 });
            } catch (e) {
                throw new Error(`Validación fallida: No se encontró el correlativo '${correlativoLimpio}' visible en la tabla.`);
            }
        }

        if (datos.tipoDocumento) {
            try {
                await contenedor.locator('td').getByText(datos.tipoDocumento, { exact: false }).first().waitFor({ state: 'visible', timeout: 3000 });
            } catch (e) {
                throw new Error(`Validación fallida: No se encontró el tipo de documento '${datos.tipoDocumento}' visible en la tabla.`);
            }
        }

        if (datos.cliente) {
            try {
                await contenedor.getByText(datos.cliente, { exact: false }).first().waitFor({ state: 'visible', timeout: 3000 });
            } catch (e) {
                throw new Error(`Validación fallida: No se encontró el cliente '${datos.cliente}' visible en la tabla.`);
            }
        }

        if (datos.estado) {
            try {
                await contenedor.getByText(datos.estado, { exact: true }).first().waitFor({ state: 'visible', timeout: 3000 });
            } catch (e) {
                throw new Error(`Validación fallida: No se encontró el estado '${datos.estado}' visible en la tabla.`);
            }
        }

        return true;
    };

    fn.displayName = `¿Comprobante visible en Ventas? ${JSON.stringify(datos)}`;
    return fn;
};

// ─── Question: AccionesDisponiblesDeComprobante ───────────────────────────────
/**
 * Retorna las opciones disponibles en el menú de acciones del comprobante (primera fila).
 */
export const AccionesDisponiblesDeComprobante = () => {
    const fn = async (page: Page): Promise<string[]> => {
        await VentasCajaTargets.btnAccionesFila(page, 0).click();

        const listaOpciones = page.locator('.opciones-container .opcion-item .v-text');
        const textos = await listaOpciones.allTextContents();

        // Cerrar el dropdown después de leer
        await page.keyboard.press('Escape');

        return textos.map(t => t.trim()).filter(Boolean);
    };

    fn.displayName = 'Leer acciones disponibles del comprobante';
    return fn;
};

// ─── Question: VerPagoEsVisible ───────────────────────────────────────────────
/**
 * Verifica si la opción "Ver Pago" está disponible en el menú de acciones del comprobante.
 */
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

// ─── Question: DatosDelPago ───────────────────────────────────────────────────
/**
 * Retorna los métodos de pago visibles en el modal "Ver Pago".
 * Precondición: el modal ya debe estar abierto.
 */
export interface InfoPago {
    metodosPago: string[];
    numeroDocumento: string;
}

export const DatosDelPago = () => {
    const fn = async (page: Page): Promise<InfoPago> => {
        const modal = page.locator('.v-dialog, .v-modal, .modal-content, .modal, .payment-info').filter({ hasText: /pago/i }).first();

        // Extraer el número del documento desde la estructura del DOM provista
        const tituloLocator = page.locator('.payment-info .v-text.v-h4.regular').first();
        const tituloTexto = await tituloLocator.textContent({ timeout: 5000 }).catch(() => '') ?? '';

        // Extraer todos los métodos de pago listados (.method-name-date span)
        const metodosLocator = page.locator('.method-name-date > span.v-text.success, .method-name-date span.bold');
        let metodos: string[] = [];

        const count = await metodosLocator.count();
        if (count > 0) {
            metodos = await metodosLocator.allTextContents();
        } else {
            // Fallback: buscar textos conocidos de métodos de pago en el modal
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
