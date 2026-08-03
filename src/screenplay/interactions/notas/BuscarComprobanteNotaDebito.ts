import {expect, type Page} from '@playwright/test';
import {NotaDebitoTargets} from '@screenplay/targets/notas-debito/NotaDebitoTargets';

export interface DatosBuscarComprobanteNotaDebito {
    tipoDocumento: 'Factura' | 'Boleta';
    serie: string;
    correlativo: string;
    indiceSerie?: number;
    maxReintentos?: number;
    esperaEntreReintentosMs?: number;
}

const TEXTO_ERROR_SUNAT =
    /el comprobante no fue aceptado por sunat|no se encontró el comprobante con los datos ingresados/i;

function regexCardComprobante(tipoDocumento: 'Factura' | 'Boleta', serie: string, correlativo: string): RegExp {
    const tipo = tipoDocumento === 'Boleta' ? 'boleta' : 'factura';
    return new RegExp(`${tipo}.*?${serie}\\s*-\\s*0*${correlativo}`, 'i');
}

/**
 * El comprobante queda VINCULADO cuando el HTML de la tarjeta (.card-info-doc)
 * o la grilla de ítems del comprobante cargada son visibles. El éxito se valida
 * con cualquiera de las dos señales para no depender del formato exacto del DOM.
 */
async function comprobanteVinculadoVisible(
    page: Page,
    tipoDocumento: 'Factura' | 'Boleta',
    serie: string,
    correlativo: string,
): Promise<boolean> {
    const cardVinculado = page.locator('.card-info-doc').filter({
        hasText: regexCardComprobante(tipoDocumento, serie, correlativo),
    });
    if (await cardVinculado.isVisible({timeout: 300}).catch(() => false)) {
        return true;
    }
    if (await NotaDebitoTargets.gridItems(page).isVisible({timeout: 300}).catch(() => false)) {
        return true;
    }
    return false;
}

async function errorSUNATVisible(page: Page): Promise<boolean> {
    return page
        .getByText(TEXTO_ERROR_SUNAT)
        .first()
        .isVisible({timeout: 300})
        .catch(() => false);
}

export const BuscarComprobanteNotaDebito = (datos: DatosBuscarComprobanteNotaDebito) => {
    const fn = async (page: Page): Promise<void> => {
        const maxReintentos = datos.maxReintentos ?? 5;
        const esperaEntreReintentosMs = datos.esperaEntreReintentosMs ?? 3_000;
        const indiceSerie = datos.indiceSerie ?? 3;

        // 1) Se llenan los filtros UNA sola vez: tipo de documento + serie + correlativo.
        await page.locator('div').filter({hasText: /^Factura$/}).nth(2).click();
        if (datos.tipoDocumento === 'Boleta') {
            await page.getByText('Boleta', {exact: true}).click();
        } else {
            await page.getByText('Factura').nth(2).click();
        }

        await page.locator('div').filter({hasText: new RegExp(`^${datos.serie}$`)}).nth(indiceSerie).click();
        await page.getByText(datos.serie).nth(1).click();

        const inputCorrelativo = NotaDebitoTargets.inputCorrelativo(page);
        await inputCorrelativo.click();
        await inputCorrelativo.fill(datos.correlativo);

        // 2) Reintentos: SOLO se vuelve a presionar Buscar (ojo). Si SUNAT aún no
        //    aceptó el comprobante, la búsqueda devuelve el error y se reintenta;
        //    en cuanto el HTML del comprobante queda armado/vinculado, se continúa.
        for (let intento = 1; intento <= maxReintentos; intento++) {
            await NotaDebitoTargets.btnBuscar(page).click();

            const deadline = Date.now() + 12_000;
            let resultado: 'error' | 'ok' | 'timeout' = 'timeout';
            while (Date.now() < deadline) {
                // El éxito tiene prioridad: si el comprobante ya quedó vinculado,
                // no importa que aún haya un error de SUNAT visible en pantalla.
                if (await comprobanteVinculadoVisible(page, datos.tipoDocumento, datos.serie, datos.correlativo)) {
                    resultado = 'ok';
                    break;
                }
                if (await errorSUNATVisible(page)) {
                    resultado = 'error';
                    break;
                }
                await page.waitForTimeout(400);
            }

            if (resultado === 'ok') {
                return;
            }
            if (resultado === 'error') {
                console.log(
                    `   [ND] ${datos.serie}-${datos.correlativo} aún no aceptado por SUNAT ` +
                    `(intento ${intento}/${maxReintentos}) — reintentando búsqueda`,
                );
                await page.waitForTimeout(esperaEntreReintentosMs);
                continue;
            }

            break;
        }

        // 3) Verificación final: si el comprobante quedó vinculado, se continúa el flujo.
        if (await comprobanteVinculadoVisible(page, datos.tipoDocumento, datos.serie, datos.correlativo)) {
            return;
        }

        const error = page.getByText(TEXTO_ERROR_SUNAT).first();
        if (await error.isVisible({timeout: 3_000}).catch(() => false)) {
            throw new Error(
                `SUNAT no aceptó el comprobante ${datos.serie}-${datos.correlativo} ` +
                `tras ${maxReintentos} reintentos`,
            );
        }

        await expect(
            page.locator('.card-info-doc').filter({
                hasText: regexCardComprobante(datos.tipoDocumento, datos.serie, datos.correlativo),
            }),
            `El comprobante ${datos.tipoDocumento} ${datos.serie}-${datos.correlativo} no se vinculó tras ${maxReintentos} intentos de búsqueda`,
        ).toBeVisible({timeout: 15_000});
        await expect(
            NotaDebitoTargets.gridItems(page),
            `La grilla de ítems del comprobante ${datos.serie}-${datos.correlativo} no se cargó tras ${maxReintentos} intentos`,
        ).toBeVisible({timeout: 15_000});
    };

    fn.displayName = `Buscar comprobante ${datos.tipoDocumento} ${datos.serie}-${datos.correlativo} (con reintento SUNAT)`;
    return fn;
};
