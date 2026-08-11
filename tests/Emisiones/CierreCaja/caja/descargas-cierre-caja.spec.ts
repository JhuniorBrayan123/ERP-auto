
import { expect } from '@playwright/test';
import { test } from '@fixtures/PuntoVenta/caja.fixture';
import { IrACierreDeCaja } from '@screenplay/tasks/caja/IrACierreDeCaja';
import { RegresarANuevaVenta } from '@screenplay/tasks/caja/AbrirMenuCaja';
import {
    DescargarCierreCajaExcel,
    DescargarCierreCajaPDF,
} from '@screenplay/tasks/cierre-caja/ConsultarItemsYDescuentos';
import { ArchivoDescargado } from '@screenplay/questions/cierre-caja/MovimientoVisibleEnCierre';

test.describe('CC-03 | Descargas del Cierre', {tag: ['@cierre-caja']}, () => {

    test('SC-01: Descargar Excel del cierre de caja y verificar extensión @CC-03.1', async ({ cajero }) => {
        
        await cajero.realiza(IrACierreDeCaja());

        const nombreArchivo = await cajero.realizaYObtiene(DescargarCierreCajaExcel());

        
        const esExcel = await cajero.pregunta(ArchivoDescargado(nombreArchivo, 'xlsx'));
        expect(esExcel).toBe(true);

        await cajero.realiza(RegresarANuevaVenta());
    });

    test('SC-02: Descargar PDF del cierre de caja y verificar extensión @CC-03.2', async ({ cajero }) => {
        
        await cajero.realiza(IrACierreDeCaja());

        const nombreArchivo = await cajero.realizaYObtiene(DescargarCierreCajaPDF());

        
        const esPDF = await cajero.pregunta(ArchivoDescargado(nombreArchivo, 'pdf'));
        expect(esPDF).toBe(true);

        await cajero.realiza(RegresarANuevaVenta());
    });
});
