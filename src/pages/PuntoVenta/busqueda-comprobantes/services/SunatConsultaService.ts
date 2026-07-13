import {type Page} from '@playwright/test';
import {EstadoSunat} from '@helpers/PuntoVenta/sunat-estados.helper';
import {throwFunctionalError} from '@utils/functional-error';
import {FUNCTIONAL_CATALOG} from '@utils/functional-catalog';

const ESTADOS_EXITOSOS = [EstadoSunat.ACEPTADA, EstadoSunat.ACEPTADA_OBSERVADA];
const ESTADOS_TRANSITORIOS = [EstadoSunat.PENDIENTE_ENVIO, EstadoSunat.PENDIENTE_RESPUESTA, EstadoSunat.NO_DISPONIBLE];

export class SunatConsultaService {
    constructor(private readonly page: Page) {
    }

    public ultimoComprobanteConsulta: {
        idEstadoSunat: number;
        estadoDescripcion: string;
        serieDescripcion: string;
        correlativoDocumento: number;
        idComprobanteERP: number;
    } | null = null;

    async consultarPorCorrelativo(correlativo: string): Promise<void> {
        const consultaPromise = this.page.waitForResponse(
            (resp) => resp.url().includes('DocumentosContables/Consultas') && resp.status() === 200,
            {timeout: 15_000},
        );

        const inputCorrelativo = this.page.locator(
            '[id="pv_comprobantes_cmp-grid-comprobantes-header:header-grilla_v-input:Correlativo"]',
        );
        await inputCorrelativo.click();
        await inputCorrelativo.fill(correlativo);
        await inputCorrelativo.press('Enter');

        try {
            const response = await consultaPromise;
            const body = await response.json();
            const data = body.ComprobantesCollectionResponse?.Data ?? [];

            if (data.length > 0) {
                const comp = data[0];
                this.ultimoComprobanteConsulta = {
                    idEstadoSunat: comp.IdestadoSunat ?? 0,
                    estadoDescripcion: comp.EstadoDescripcion ?? '',
                    serieDescripcion: comp.SerieDescripcion ?? '',
                    correlativoDocumento: comp.CorrelativoDocumento ?? 0,
                    idComprobanteERP: comp.IdComprobanteERP ?? 0,
                };
                console.log(
                    `   Filtrado: ${this.ultimoComprobanteConsulta.serieDescripcion}-${correlativo}` +
                    ` | Estado: ${this.ultimoComprobanteConsulta.estadoDescripcion}` +
                    ` | SUNAT: ${this.ultimoComprobanteConsulta.idEstadoSunat}`,
                );
            }
        } catch {
            console.log(`  Filtrado por correlativo: ${correlativo} (sin interceptar Consultas)`);
        }
    }

    async validarEstadoSunat(): Promise<'EXITOSO' | 'TRANSITORIO' | 'DEFINITIVO'> {
        try {
            if (!this.ultimoComprobanteConsulta) {
                console.warn('  No hay datos de Consultas — no se puede validar SUNAT');
                return 'TRANSITORIO';
            }

            let {idEstadoSunat} = this.ultimoComprobanteConsulta;
            const {serieDescripcion, correlativoDocumento} = this.ultimoComprobanteConsulta;
            const compId = `${serieDescripcion}-${correlativoDocumento}`;

            if (ESTADOS_EXITOSOS.includes(idEstadoSunat)) {
                console.log(`   SUNAT: ${compId} → ACEPTADA (estado ${idEstadoSunat})`);
                return 'EXITOSO';
            }

            if (ESTADOS_TRANSITORIOS.includes(idEstadoSunat)) {
                console.log(`   SUNAT: ${compId} → procesando (estado ${idEstadoSunat}). Esperando 8s...`);
                await this.page.waitForTimeout(8000);

                const consultaPromise = this.page.waitForResponse(
                    (resp) => resp.url().includes('DocumentosContables/Consultas') && resp.status() === 200,
                    {timeout: 15_000},
                );

                const inputCorrelativo = this.page.locator(
                    '[id="pv_comprobantes_cmp-grid-comprobantes-header:header-grilla_v-input:Correlativo"]',
                );
                await inputCorrelativo.click();
                await inputCorrelativo.fill(correlativoDocumento.toString());

                try {
                    const response = await consultaPromise;
                    const body = await response.json();
                    const data = body.ComprobantesCollectionResponse?.Data ?? [];
                    if (data.length > 0) {
                        idEstadoSunat = data[0].IdestadoSunat ?? 0;
                    }
                } catch {
                    console.warn(`   No se pudo re-interceptar Consultas para ${compId}`);
                }

                if (ESTADOS_EXITOSOS.includes(idEstadoSunat)) {
                    console.log(`  ✓ SUNAT: ${compId} → ACEPTADA en re-consulta (estado ${idEstadoSunat})`);
                    return 'EXITOSO';
                } else {
                    console.warn(
                        `  ️ SUNAT: ${compId} → sigue sin aceptar (estado final ${EstadoSunat[idEstadoSunat] || idEstadoSunat}).` +
                        ` El test NO falla — SUNAT sigue demorada.`,
                    );
                    return 'TRANSITORIO';
                }
            }

            console.warn(
                `   SUNAT: ${compId} → estado definitivo NO aceptado (${EstadoSunat[idEstadoSunat] || idEstadoSunat}).` +
                ` El test NO falla — requiere revisión manual.`,
            );
            return 'DEFINITIVO';
        } catch (error) {
            return await throwFunctionalError({
                page: this.page,
                ...FUNCTIONAL_CATALOG.puntoVenta.validarSunat,
                cause: error,
            });
        }
    }
}
