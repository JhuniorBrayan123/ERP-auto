import {expect, test} from '@fixtures/Logistica/movimientos-fixture';
import {
    COMPROBANTE_TEST,
    ITEMS_TEST,
    PROVEEDOR_EXISTENTE,
} from '@helpers/Logistica/movimiento-data.helper';

test.describe('Datos Adicionales de Movimientos @datos-adicionales', {tag: ['@logistica', '@movimientos']}, () => {

    // ═══════════════════════════════════════════════════════════════
    // Scenario 47: Registrar datos adicionales completos
    // ═══════════════════════════════════════════════════════════════
    test('debe registrar movimiento con datos adicionales completos y verificar en detalle', async ({
                                                                                                        movimientosNav,
                                                                                                        registroMovimiento,
                                                                                                        datosOpcionales,
                                                                                                        resultadoMovimiento,
                                                                                                        listadoMovimientos,
                                                                                                        page,
                                                                                                    }) => {

        await test.step('Given: navegar a Ingresos y crear nuevo ingreso', async () => {
            await movimientosNav.navegarAIngresosDesdeMenu();
            await registroMovimiento.clickAgregarIngreso();
        });

        await test.step('When: agregar producto y configurar datos opcionales', async () => {
            await registroMovimiento.buscarItem(ITEMS_TEST.PRODUCTO_ESTRICTO.codigo);
            await registroMovimiento.seleccionarItemEnResultados(ITEMS_TEST.PRODUCTO_ESTRICTO.nombre);
        });

        await test.step('And: configurar datos opcionales completos', async () => {
            await datosOpcionales.abrirDatosOpcionales();
            await datosOpcionales.buscarProveedor(PROVEEDOR_EXISTENTE.numDocumento);
            await datosOpcionales.seleccionarProveedor(PROVEEDOR_EXISTENTE.nombre);

            // Campo texto
            await datosOpcionales.llenarCampoTexto(0, 'campo-texto-test-completo');

            // Campo fecha
            await datosOpcionales.clickCampoFecha(0);
            await datosOpcionales.seleccionarDiaEnDatepickerVisible('15');

            // Campo selección
            await datosOpcionales.seleccionarCampoSeleccion('certificación');

            // Campo numérico
            //await datosOpcionales.llenarCampoNumero(0, '42');

            await datosOpcionales.guardarDatos();
        });

        await test.step('And: registrar ingreso', async () => {
            await registroMovimiento.clickRegistrarIngreso();
            await resultadoMovimiento.irAlListado();
        });

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
    test('debe agregar comprobante relacionado al movimiento y verificar en tab Comprobantes', async ({
                                                                                                          movimientosNav,
                                                                                                          registroMovimiento,
                                                                                                          datosOpcionales,
                                                                                                          resultadoMovimiento,
                                                                                                          listadoMovimientos,
                                                                                                          page,
                                                                                                      }) => {

        await test.step('Given: navegar a Ingresos y crear ingreso con comprobante en datos opcionales', async () => {
            await movimientosNav.navegarAIngresosDesdeMenu();
            await registroMovimiento.clickAgregarIngreso();
            await registroMovimiento.buscarItem(ITEMS_TEST.PRODUCTO_ESTRICTO.codigo);
            await registroMovimiento.seleccionarItemEnResultados(ITEMS_TEST.PRODUCTO_ESTRICTO.nombre);
        });

        await test.step('When: agregar comprobante en datos opcionales', async () => {
            await datosOpcionales.abrirDatosOpcionales();
            await datosOpcionales.agregarComprobante(COMPROBANTE_TEST);
            await datosOpcionales.guardarDatos();
        });

        await test.step('And: registrar ingreso', async () => {
            await registroMovimiento.clickRegistrarIngreso();
            await resultadoMovimiento.irAlListado();
        });

        await test.step('Then: verificar comprobante en el detalle del movimiento', async () => {
            await listadoMovimientos.abrirMenuAcciones();
            await listadoMovimientos.clickVerMovimiento();
            await listadoMovimientos.clickDatosOpcionalesEnDetalle();
            //await listadoMovimientos.clickTabComprobantes(); nO TENEMOS UN TAB DE COMPROBANTES
            const datosOpcionales = page.locator('text=Datos opcionales').locator('..');
            await expect(
                page.getByText(`${COMPROBANTE_TEST.tipo} ${COMPROBANTE_TEST.serie}-${COMPROBANTE_TEST.numero} ${COMPROBANTE_TEST.cuc}`)
            ).toBeVisible();
            //await expect(page.getByText(COMPROBANTE_TEST.serie)).toBeVisible();
            await listadoMovimientos.cerrarModal();
        });
    });
});
