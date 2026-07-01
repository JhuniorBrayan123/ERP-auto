
import { expect } from '@playwright/test';
import { test } from '@fixtures/PuntoVenta/caja.fixture';
import { IrACierreDeCaja } from '@screenplay/tasks/caja/IrACierreDeCaja';
import { RegresarANuevaVenta } from '@screenplay/tasks/caja/AbrirMenuCaja';
import {
    DescargarCierreCajaExcel,
    DescargarCierreCajaPDF,
} from '@screenplay/tasks/cierre-caja/ConsultarItemsYDescuentos';
import { ArchivoDescargado } from '@screenplay/questions/cierre-caja/MovimientoVisibleEnCierre';

test.describe('Descargas del Cierre de Caja', () => {

    test('descargar Excel del cierre de caja y verificar extensión', async ({ cajero }) => {
        
        await cajero.realiza(IrACierreDeCaja());

        const nombreArchivo = await cajero.realizaYObtiene(DescargarCierreCajaExcel());

        
        const esExcel = await cajero.pregunta(ArchivoDescargado(nombreArchivo, 'xlsx'));
        expect(esExcel).toBe(true);

        await cajero.realiza(RegresarANuevaVenta());
    });

    test('descargar PDF del cierre de caja y verificar extensión', async ({ cajero }) => {
        
        await cajero.realiza(IrACierreDeCaja());

        const nombreArchivo = await cajero.realizaYObtiene(DescargarCierreCajaPDF());

        
        const esPDF = await cajero.pregunta(ArchivoDescargado(nombreArchivo, 'pdf'));
        expect(esPDF).toBe(true);

        await cajero.realiza(RegresarANuevaVenta());
    });
});
