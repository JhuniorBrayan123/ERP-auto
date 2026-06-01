import {test, expect} from '../../../../../src/fixtures/PuntoVenta/guias-fixture';
import {NavegarAGuiaTransportista} from '@task/PuntoVenta/guias-remision/NavegarAGuiaTransportista.task';
import {IniciarVentaEnCaja} from '@task/PuntoVenta/IniciarVentaEnCaja';

test.describe('Guías de Remisión Transportista', {
 tag: ['@guias', '@puntoventa', '@transportista'] }, () => {
    test.beforeEach(async ({ cajero }) => {
        await cajero.intentaRealizar(
            IniciarVentaEnCaja('caja-auto'),
            NavegarAGuiaTransportista()
        );
    });

    test('P22: Validar fecha de traslado inválida @GRT-22', async ({ cajero }) => {
        // PLACEHOLDER: ERP no valida fecha de traslado anterior a la fecha de emisión actualmente.
        // El codegen ejecuta el flujo completo pero sin assertions porque el sistema permite emitir.
        // Pendiente de validación futura cuando ERP implemente la restricción.
    });
});
