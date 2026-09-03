import { test, expect } from '@fixtures/clientes-proveedores/vendedores.fixture';
import {
    CrearVendedor, LlenarFormularioBasicoVendedor,
} from '@screenplay/tasks/clientes-proveedores/vendedores/CrearVendedor';
import {
    BuscarVendedorEnListado,
    ValidarVendedorVisible,
} from '@screenplay/tasks/clientes-proveedores/vendedores/BuscarVendedor';
import { EliminarVendedor } from '@screenplay/tasks/clientes-proveedores/vendedores/EliminarVendedor';
import {
    generarVendedorDNI,
    generarVendedorConCodigoManual,
    generarVendedorRUC
} from '@data/clientes-proveedores/vendedores.data';
import {
    MensajeCreacionVendedorExitosaVisible, MensajeErrorCampoObligatorioVendedor, MensajeErrorNumericoDigitos,
    VendedorVisibleEnListado
} from "@screenplay/questions/clientes-proveedores/VendedorQuestions";
import {VendedoresTargets} from "@screenplay/targets/clientes-proveedores/VendedoresTargets";
import {CancelarCreacionVendedor} from "@screenplay/tasks/clientes-proveedores/vendedores/EditarVendedor";

test.describe('VD-01 | Creación de Vendedores', { tag: ['@vendedores', '@creacion', '@VD-01'] }, () => {

    test('VD-01.1: Crear vendedor con DNI', async ({ vendedorActor, page }) => {
        const datosVendedor = generarVendedorDNI();

        await vendedorActor.realiza(CrearVendedor(datosVendedor));

        
        await vendedorActor.realiza(BuscarVendedorEnListado(datosVendedor.numeroDocumento));
        const visible =         await vendedorActor.pregunta(ValidarVendedorVisible(datosVendedor.nombreRazonSocial));
        expect(visible).toBe(true);

        await vendedorActor.realiza(EliminarVendedor(datosVendedor.numeroDocumento));
    });

    test('VD-01.2: Crear vendedor con código manual', async ({ vendedorActor, page }) => {
        const datosVendedor = generarVendedorConCodigoManual();

        await vendedorActor.realiza(CrearVendedor(datosVendedor));

        
        await vendedorActor.realiza(BuscarVendedorEnListado(datosVendedor.numeroDocumento));
        const visible =         await vendedorActor.pregunta(ValidarVendedorVisible(datosVendedor.nombreRazonSocial));
        expect(visible).toBe(true);

        await vendedorActor.realiza(EliminarVendedor(datosVendedor.numeroDocumento));
    });
    test('SC-01: Crear vendedor válido con metas y zona de ventas @VE-01.1', async ({vendedorActor}) => {

        const datos = generarVendedorDNI();
        await vendedorActor.realiza(CrearVendedor(datos));
        await vendedorActor.realiza(MensajeCreacionVendedorExitosaVisible());
        await vendedorActor.realiza(BuscarVendedorEnListado(datos.numeroDocumento));
        await vendedorActor.realiza(VendedorVisibleEnListado(datos.nombreRazonSocial));

        await vendedorActor.realiza(EliminarVendedor(datos.numeroDocumento));
    });

    test('SC-02: Validar campos obligatorios al crear vendedor @VE-01.2', async ({vendedorActor, page}) => {

        const datos = generarVendedorRUC();
        datos.numeroDocumento = ''; // Forzamos vacío
        datos.nombreRazonSocial = '';
        datos.codigo = ''; // Forzamos vacío
        await VendedoresTargets.btnCrearVendedor(page).click();
        await vendedorActor.realiza(LlenarFormularioBasicoVendedor(datos));
        await VendedoresTargets.btnCrearVendedorForm(page).click();
        await vendedorActor.realiza(MensajeErrorCampoObligatorioVendedor());
        await VendedoresTargets.inputRazonSocial(page).click();
        await VendedoresTargets.inputRazonSocial(page).fill('editado-aceptado');
        await VendedoresTargets.inputNumeroDocumento(page).click();
        await VendedoresTargets.inputNumeroDocumento(page).fill('16565');
        await vendedorActor.realiza(MensajeErrorNumericoDigitos('11'));
        await vendedorActor.realiza(CancelarCreacionVendedor());
    });
});
