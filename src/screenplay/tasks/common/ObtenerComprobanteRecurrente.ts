import {test, type Page} from '@playwright/test';
import {
    cargarSeeds,
    claveDeSeed,
    reclamarSeed,
    registrarSeedNuevo,
    type TipoSeed,
} from '@factories/comprobante-recurrente-factory';
import {detectAccount, detectEnvironmentGroup} from '@utils/setup-state';
import {CLIENTES, ITEMS_PV} from '@helpers/PuntoVenta/emision-data.helper';
import {SunatEstadoApi} from '@services/PuntoVenta/SunatEstadoApi';
import {getCachedToken} from '@fixtures/auth/token-cache.fixture';
import {EmitirComprobanteOrigen, type ResultadoComprobanteOrigen} from './EmitirComprobanteOrigen';

export const ObtenerComprobanteRecurrente = (tipo: TipoSeed) => {
    const fn = async (page: Page): Promise<ResultadoComprobanteOrigen> => {
        const envGroup = detectEnvironmentGroup();
        const account = detectAccount();
        const clave = claveDeSeed(tipo);

        const previo = cargarSeeds(envGroup, account)?.[clave];
        if (previo && !previo.vinculado) {
            reclamarSeed(tipo, envGroup, account);
            return {
                serie: previo.serie,
                correlativo: previo.correlativo,
                comprobanteId: previo.comprobanteId,
                numero: previo.numero,
            };
        }

        // Cold path: no reusable seed. SUNAT acceptance for a fresh comprobante
        // can take up to ~6min — bump only this branch's timeout, not the
        // project default, so warm-path tests keep their normal budget.
        test.setTimeout(600_000);

        const fresco = await EmitirComprobanteOrigen({
            tipoComprobante: tipo,
            cliente: CLIENTES.EMPRESA_RUC_AUTO,
            item: ITEMS_PV.ESTRICTO_GRAVADO_2,
        })(page);

        const token = await getCachedToken(page);
        const sunatApi = new SunatEstadoApi(page.request, token);
        const estado = await sunatApi.esperarEstadoFinal(fresco.comprobanteId, {
            timeout: 360_000,
            pollingInterval: 10_000,
        });

        if (!estado.aceptado) {
            // No cache write on non-acceptance — degrades to today's behaviour,
            // where CrearNota*ConVinculacion re-checks SUNAT itself.
            return fresco;
        }

        registrarSeedNuevo(tipo, fresco, envGroup, account);
        return fresco;
    };

    fn.displayName = `Obtener comprobante recurrente (${tipo})`;
    return fn;
};
