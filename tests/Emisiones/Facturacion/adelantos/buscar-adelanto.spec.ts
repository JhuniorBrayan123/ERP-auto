import { test, expect } from '@fixtures/PuntoVenta/facturacion.fixture';
import { EmitirDocumentoDeAdelanto } from '@screenplay/tasks/facturacion/EmitirDocumentoDeAdelanto';
import { SeleccionarTipoComprobante } from '@screenplay/interactions/facturacion/SeleccionarTipoComprobante';
import { BuscarYSeleccionarCliente } from '@screenplay/interactions/facturacion/BuscarYSeleccionarCliente';
import { AdelantosTargets } from '@screenplay/targets/facturacion/AdelantosTargets';
import { CLIENTES, ITEMS_PV } from '@helpers/PuntoVenta/emision-data.helper';
import { esperarDebounce } from '@utils/wait-helpers';

test.describe('Facturación — Buscar adelanto', () => {

    test('Busca un adelanto por serie y correlativo desde Vista Facturación', async ({ page, cajero }) => {
        const adelanto = await cajero.realizaYObtiene(
            EmitirDocumentoDeAdelanto({
                tipoComprobante: 'BOLETA',
                cliente: CLIENTES.PERSONA_DNI,
                producto: ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL,
                metodoPago: 'efectivo',
            })
        );

        await cajero.realiza(
            SeleccionarTipoComprobante('BOLETA'),
            BuscarYSeleccionarCliente(CLIENTES.PERSONA_DNI),
        );

        await AdelantosTargets.flechaExpandir(page).click();
        await AdelantosTargets.dropdownSerie(page).click();
        await AdelantosTargets.opcionSerieBoleta(page).click();
        await AdelantosTargets.inputCorrelativo(page).fill(adelanto.correlativo);
        await esperarDebounce(page, 500, 'Esperar antes de Enter');
        await AdelantosTargets.inputCorrelativo(page).press('Enter');
        await esperarDebounce(page, 1000, 'Esperar carga de adelanto');

        const checkbox = AdelantosTargets.checkboxPrimerAdelanto(page);
        await expect(checkbox).toBeVisible({ timeout: 10_000 });
    });
});
