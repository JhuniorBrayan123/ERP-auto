import {expect, test} from '@fixtures/Logistica/movimientos-fixture';
import {COMPROBANTE_TEST, ITEMS_TEST, PROVEEDOR_EXISTENTE,} from '@helpers/Logistica/movimiento-data.helper';
import {
    buscarYSeleccionarItem,
    navegarAIngresosYNuevo,
    registrarIngresoEIrAlListado
} from '@helpers/Logistica/verificaciones-movimientos.helper';

test.describe('MS-3 | Datos Adicionales de Movimientos @datos-adicionales', {tag: ['@logistica', '@movimientos']}, () => {

    // ═══════════════════════════════════════════════════════════════
    // Scenario 47: Registrar datos adicionales completos
    // ═══════════════════════════════════════════════════════════════
    test('Registrar datos adicionales completos @MS-3', async ({
                                                                   movimientosNav,
                                                                   registroMovimiento,
                                                                   datosOpcionales,
                                                                   resultadoMovimiento,
                                                                   listadoMovimientos,
                                                               }) => {

        await navegarAIngresosYNuevo(movimientosNav, registroMovimiento, true);
        await buscarYSeleccionarItem(registroMovimiento, ITEMS_TEST.PRODUCTO_ESTRICTO.codigo, ITEMS_TEST.PRODUCTO_ESTRICTO.nombre);

        await test.step('And: configurar datos opcionales completos', async () => {
            await datosOpcionales.abrirDatosOpcionales();
            await datosOpcionales.buscarProveedor(PROVEEDOR_EXISTENTE.numDocumento);
            await datosOpcionales.seleccionarProveedor(PROVEEDOR_EXISTENTE.nombre);
            await datosOpcionales.llenarCampoTexto(0, 'campo-texto-test-completo');
            await datosOpcionales.clickCampoFecha(0);
            await datosOpcionales.seleccionarDiaEnDatepickerVisible('15');
            await datosOpcionales.seleccionarCampoSeleccion('certificación');
            await datosOpcionales.guardarDatos();
        });

        await registrarIngresoEIrAlListado(registroMovimiento, resultadoMovimiento);

        await test.step('Then: verificar datos opcionales en detalle', async () => {
            await listadoMovimientos.abrirMenuAcciones();
            await listadoMovimientos.clickVerMovimiento();
            await listadoMovimientos.clickDatosOpcionalesEnDetalle();
            await listadoMovimientos.cerrarModal();
        });
    });

    // ═══════════════════════════════════════════════════════════════
    // Scenario 48: Agregar documento relacionado (comprobante)
    // ═══════════════════════════════════════════════════════════════
    test('Agregar documento relacionado (comprobante) @MS-3', async ({
                                                                         movimientosNav,
                                                                         registroMovimiento,
                                                                         datosOpcionales,
                                                                         resultadoMovimiento,
                                                                         listadoMovimientos,
                                                                         page,
                                                                     }) => {

        await navegarAIngresosYNuevo(movimientosNav, registroMovimiento, true);
        await buscarYSeleccionarItem(registroMovimiento, ITEMS_TEST.PRODUCTO_ESTRICTO.codigo, ITEMS_TEST.PRODUCTO_ESTRICTO.nombre);

        await test.step('When: agregar comprobante en datos opcionales', async () => {
            await datosOpcionales.abrirDatosOpcionales();
            await datosOpcionales.agregarComprobante(COMPROBANTE_TEST);
            await datosOpcionales.guardarDatos();
        });
        await registrarIngresoEIrAlListado(registroMovimiento, resultadoMovimiento);
        await test.step('Then: verificar comprobante en el detalle del movimiento', async () => {
            await listadoMovimientos.abrirMenuAcciones();
            await listadoMovimientos.clickVerMovimiento();
            await listadoMovimientos.clickDatosOpcionalesEnDetalle();
            await expect(
                page.getByText(`${COMPROBANTE_TEST.tipo} ${COMPROBANTE_TEST.serie}-${COMPROBANTE_TEST.numero} ${COMPROBANTE_TEST.cuc}`)
            ).toBeVisible();
            await listadoMovimientos.cerrarModal();
        });
    });

    // ═══════════════════════════════════════════════════════════════
    // Scenario 49: Valida documento incompleto (comprobante)
    // ═══════════════════════════════════════════════════════════════
    test('Valida documento incompleto @MS-3', async ({
                                                         movimientosNav,
                                                         registroMovimiento,
                                                         datosOpcionales,
                                                         page,
                                                     }) => {
        await navegarAIngresosYNuevo(movimientosNav, registroMovimiento, true);
        await test.step(' When : agregar datos adicionales', async () => {
            await datosOpcionales.abrirDatosOpcionales();
        });
        await test.step('Then : intentar guardar Documento incompleto', async () => {
            await datosOpcionales.agregarComprobanteParcial('FACTURA');
        });
        await test.step(' Assert: se visualiza el error al añadir', async () => {
            await expect(page.getByText('Campo obligatorio').first()).toBeVisible();
            await datosOpcionales.cancelarDatos();
        });
    });
});
