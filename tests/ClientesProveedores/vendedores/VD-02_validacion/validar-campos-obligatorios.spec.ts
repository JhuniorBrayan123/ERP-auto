import { test, expect } from '@fixtures/clientes-proveedores/vendedores.fixture';
import {
    AbrirCrearVendedor,
    CrearVendedor,
    CrearVendedorIncompleto
} from '@screenplay/tasks/clientes-proveedores/vendedores/CrearVendedor';
import { CuerpoContieneTexto } from '@screenplay/questions/clientes-proveedores/ClienteQuestions';
import {VendedoresTargets} from "@screenplay/targets/clientes-proveedores/VendedoresTargets";
import {generarVendedorIncompleto} from "@data/clientes-proveedores/vendedores.data";

test.describe('VD-02 | Validación de campos obligatorios', { tag: ['@vendedores', '@validacion', '@VD-02'] }, () => {

    test('VD-02.1: Validar que nombre/razón social es obligatorio para RUC', async ({ vendedorActor, page }) => {
        const datos= generarVendedorIncompleto();
        await vendedorActor.realiza(CrearVendedorIncompleto(datos));

        let hayObligatorio = false, hayRequerido = false, hayLabelNombre = false;
        try { await vendedorActor.pregunta(CuerpoContieneTexto('Campo obligatorio')); hayObligatorio = true; } catch { }
        expect(hayObligatorio).toBe(true);
    });
});
