import {test} from '../../fixtures/Logistica/movimientos-fixture';
import {expect, Page} from '@playwright/test';
import {MovimientosNavigationPage} from '../../pages/Logistica/MovimientosNavigationPage';
import {StockVerificacionPage} from '../../pages/Logistica/StockVerificacionPage';
import {KardexVerificacionPage} from '../../pages/Logistica/KardexVerificacionPage';
import {RegistroMovimientoPage} from '../../pages/Logistica/RegistroMovimientoPage';
import {ResultadoMovimientoPage} from '../../pages/Logistica/ResultadoMovimientoPage';
import {MovimientoRapidoPage} from '../../pages/Logistica/MovimientoRapidoPage';
import {DatosOpcionalesPage} from '../../pages/Logistica/DatosOpcionalesPage';
import {ListadoMovimientosPage} from '../../pages/Logistica/ListadoMovimientosPage';
import {ITEMS_TEST} from "@helpers/Logistica/movimiento-data.helper";

export const verificarStockYKardex = async (
    movimientosNav: MovimientosNavigationPage,
    stockVerificacion: StockVerificacionPage,
    kardexVerificacion: KardexVerificacionPage,
    page: Page,
    codigoItem: string,
    almacen: string,
    patronCodigoVisible: RegExp,
    textClickEquivalente?: string
) => {
    await test.step('Then: verificar stock actualizado', async () => {
        await movimientosNav.navegarAStockProductos();
        await stockVerificacion.buscarPorCodigo(codigoItem);
        if (textClickEquivalente) {
            await page.getByText(textClickEquivalente).click();
        }
        await stockVerificacion.clickVariosTexto();
    });

    await test.step('And: verificar movimiento en kardex', async () => {
        await movimientosNav.navegarAKardexTotal();
        await page.waitForTimeout(2000);
        await kardexVerificacion.buscarPorCodigo(codigoItem);
        if (textClickEquivalente) {
            await page.getByText(textClickEquivalente).click();
        }
        await kardexVerificacion.clickVariosTexto();
        await kardexVerificacion.clickKardexPorProducto();
        await kardexVerificacion.abrirVerDetallePorAlmacen2(almacen);
        await kardexVerificacion.expectPatronCodigoMovimientoVisible(patronCodigoVisible);
        await kardexVerificacion.cerrarModalDetalle();
    });
};

export const crearAjusteConItem = async (
    registroMovimiento: RegistroMovimientoPage,
    codigoItem: string,
    nombreItem: string,
    page?: Page,
    textClickEquivalente?: string
) => {
    await test.step('When: crear ajuste con ítem', async () => {
        await registroMovimiento.clickAgregarAjuste();
        await registroMovimiento.buscarItem(codigoItem);
        await registroMovimiento.seleccionarItemEnResultados(nombreItem);
        if (page && textClickEquivalente) {
            await page.getByText(textClickEquivalente).click();
        }
    });
};

export const registrarAjusteEIrAlListado = async (
    registroMovimiento: RegistroMovimientoPage,
    resultadoMovimiento: ResultadoMovimientoPage,
) => {
    await test.step('And: registrar ajuste', async () => {
        await registroMovimiento.clickRegistrarAjuste();
        await resultadoMovimiento.irAlListado();
    });
};

export const definirCantidadYFactor = async (
    registroMovimiento: RegistroMovimientoPage,
    cantidad: string,
    factor: 'Agregar' | 'Quitar',
) => {
    await test.step(`And: definir cantidad y factor ${factor}`, async () => {
        await registroMovimiento.llenarCantidad(cantidad);
        await registroMovimiento.seleccionarFactorAjuste(factor);
    });
};

export const buscarYSeleccionarItem = async (
    registroMovimiento: RegistroMovimientoPage,
    codigoItem: string,
    nombreItem: string,
) => {
    await test.step('And: buscar y seleccionar producto', async () => {
        await registroMovimiento.buscarItem(codigoItem);
        await registroMovimiento.seleccionarItemEnResultados(nombreItem);
    });
}

export const verificarKardexDesdeStock = async (
    stockVerificacion: StockVerificacionPage,
    almacen: string,
    patronCodigo: RegExp,
    clickCodigo: boolean = false,
) => {
    await test.step('And: verificar movimiento en kardex', async () => {
        const kardexPage = await stockVerificacion.abrirKardexDesdeStock();
        const kardexPopup = new KardexVerificacionPage(kardexPage);
        await kardexPopup.abrirVerDetallePorAlmacen2(almacen);
        await expect(kardexPage.getByText(patronCodigo).first()).toBeVisible();
        if (clickCodigo) {
            await kardexPopup.clickCodigoMovimientoRegex(patronCodigo);
        }
        await kardexPopup.cerrarModalDetalle();
    });
};

export const navegarAIngresosYNuevo = async (
    movimientosNav: MovimientosNavigationPage,
    registroMovimiento: RegistroMovimientoPage,
    desdeMenu: boolean = false
) => {
    await test.step('Given: navegar a Ingresos y crear nuevo ingreso', async () => {
        // Comentado para evitar fallos en PRD (los IDs varían). Siempre usamos navegación por texto.
        if (desdeMenu) {
            await movimientosNav.navegarAIngresosDesdeMenu();
        } else {
            await movimientosNav.navegarAIngresos();
        }
        await registroMovimiento.clickNuevoMovimiento();
    });
};

export const definirAlmacenYMotivo = async (
    registroMovimiento: RegistroMovimientoPage,
    almacenOrigen: string,
    almacenDestino: string,
    motivoGral: string,
    motivoEspecifico: string
) => {
    await test.step('When: seleccionar almacén y motivo', async () => {
        await registroMovimiento.seleccionarAlmacen(almacenOrigen, almacenDestino);
        await registroMovimiento.seleccionarMotivo(motivoGral, motivoEspecifico);
    });
};

export const definirCantidadYRegistrarIngreso = async (
    registroMovimiento: RegistroMovimientoPage,
    cantidad: string,
    resultadoMovimiento?: ResultadoMovimientoPage
) => {
    await test.step('And: definir cantidad y registrar ingreso', async () => {
        await registroMovimiento.llenarCantidad(cantidad);
        await registroMovimiento.clickRegistrarIngreso();
        if (resultadoMovimiento) {
            await resultadoMovimiento.irAlListado();
        }
    });
};

export const registrarIngresoEIrAlListado = async (
    registroMovimiento: RegistroMovimientoPage,
    resultadoMovimiento: ResultadoMovimientoPage
) => {
    await test.step('And: registrar ingreso', async () => {
        await registroMovimiento.clickRegistrarIngreso();
        await resultadoMovimiento.irAlListado();
    });
};

export const registrarSalidaYDespachar = async (
    registroMovimiento: RegistroMovimientoPage,
    resultadoMovimiento: ResultadoMovimientoPage,
    usarMetodoAvanzado: boolean = false
) => {
    await test.step('And: registrar salida con despacho e ir al listado', async () => {
        if (usarMetodoAvanzado) {
            await registroMovimiento.clickTextoRegistrarSalida();
        } else {
            await registroMovimiento.clickRegistrarSalida();
        }
        await registroMovimiento.clickRegistrarYDespachar();
        await resultadoMovimiento.irAlListado();
    });
};

export const registrarTrasladoEIrAlListado = async (
    registroMovimiento: RegistroMovimientoPage,
    resultadoMovimiento: ResultadoMovimientoPage
) => {
    await test.step('And: registrar traslado', async () => {
        await registroMovimiento.clickRegistrarTraslado();
        await resultadoMovimiento.irAlListado();
    });
};

export const verificarStockPorCodigoYClick = async (
    movimientosNav: MovimientosNavigationPage,
    stockVerificacion: StockVerificacionPage,
    codigoItem: string,
    accionAdicional?: () => Promise<void>
) => {
    await test.step('Then: verificar stock', async () => {
        await movimientosNav.navegarAStockProductos();
        await stockVerificacion.buscarPorCodigo(codigoItem);
        if (accionAdicional) {
            await accionAdicional();
        } else {
            await stockVerificacion.clickVariosTexto();
        }
    });
};

export const verificarKardexTotalEstandar = async (
    movimientosNav: MovimientosNavigationPage,
    kardexVerificacion: KardexVerificacionPage,
    page: Page,
    codigoItem: string,
    almacen: string,
    patronCodigoVisible: RegExp,
    accionAdicionalBotonOpcion?: () => Promise<void>
) => {
    await test.step('And: verificar kardex total', async () => {
        await movimientosNav.navegarAKardexTotal();
        await page.waitForTimeout(2000);
        await kardexVerificacion.buscarPorCodigo(codigoItem);
        if (accionAdicionalBotonOpcion) {
            await accionAdicionalBotonOpcion();
        } else {
            await kardexVerificacion.clickVariosTexto();
        }
        await kardexVerificacion.clickKardexPorProducto();
        await kardexVerificacion.abrirVerDetallePorAlmacen2(almacen);
        await kardexVerificacion.expectPatronCodigoMovimientoVisible(patronCodigoVisible);
        await kardexVerificacion.cerrarModalDetalle();
    });
};

export const crearIngresoEstandarParaPrecondicion = async (
    movimientosNav: MovimientosNavigationPage,
    registroMovimiento: RegistroMovimientoPage,
    resultadoMovimiento: ResultadoMovimientoPage,
    page: Page,
    codigoItem: string,
    nombreItem: string,
    cantidad: string,
    desdeMenu: boolean = false
) => {
    await test.step('Arrange: crear ingreso estandar para precondición', async () => {
        if (desdeMenu) {
            await movimientosNav.navegarAIngresosDesdeMenu();
        } else {
            await movimientosNav.navegarAIngresos();
        }
        await registroMovimiento.clickAgregarIngreso();
        if (codigoItem === '111111') {
            await page.waitForTimeout(2000);
        }
        await registroMovimiento.buscarItem(codigoItem);
        if (nombreItem.includes('Pproducto')) {
            await page.getByText(nombreItem).click();
        } else {
            await registroMovimiento.seleccionarItemEnResultados(nombreItem);
        }
        await registroMovimiento.llenarCantidad(cantidad);
        await registroMovimiento.clickRegistrarIngreso();
        await resultadoMovimiento.irAlListado();
    });
};

export const buscarItemEnListadoRapidoYAcceder = async (
    movimientoRapido: MovimientoRapidoPage,
    page: Page,
    codigoItem: string
) => {
    await test.step('When: buscar ítem en listado rápido y acceder', async () => {
        await movimientoRapido.buscarItemPorCodigo(codigoItem);
        await page
            .locator('[id="lgt_items_cmp-filtro-items:filtro:filtro_section_v-input:button_search"]')
            .click();
        await page.waitForLoadState('networkidle');
    });
};

export const configurarYRetirarStockRapido = async (
    movimientoRapido: MovimientoRapidoPage,
    almacen: string,
    motivoGral: string,
    motivoEspecifico: string,
    cantidad: string
) => {
    await test.step('And: configurar movimiento y retirar stock', async () => {
        await movimientoRapido.seleccionarAlmacenRapido(almacen);
        await movimientoRapido.seleccionarMotivoSalidaDesdeDiv(motivoGral, motivoEspecifico);
        await movimientoRapido.llenarCantidadRapida(cantidad);
    });

    await test.step('Then: confirmar retirar stock', async () => {
        await movimientoRapido.clickBtnRetirarStock();
        await movimientoRapido.cerrarModalConfirmacion();
    });
};
export const configurarYRetirarStockRapido2 = async (
    movimientoRapido: MovimientoRapidoPage,
    almacen: string,
    motivoGral: string,
    motivoEspecifico: string,
    cantidad: string
) => {
    await test.step('And: configurar movimiento y retirar stock', async () => {
        await movimientoRapido.seleccionarAlmacenRapido2(almacen);
        await movimientoRapido.seleccionarMotivoSalidaDesdeDiv(motivoGral, motivoEspecifico);
        await movimientoRapido.llenarCantidadRapida(cantidad);
    });

    await test.step('Then: confirmar retirar stock', async () => {
        await movimientoRapido.clickBtnRetirarStock();
        await movimientoRapido.cerrarModalConfirmacion();
    });
};

export const configurarYAumentarStockRapido = async (
    movimientoRapido: MovimientoRapidoPage,
    almacen: string,
    motivoGral: string,
    motivoEspecifico: string,
    cantidad: string
) => {
    await test.step('And: configurar movimiento y aumentar stock', async () => {
        if (almacen) await movimientoRapido.seleccionarAlmacenRapido(almacen);
        if (motivoGral) await movimientoRapido.seleccionarMotivoIngresoRapido(motivoGral, motivoEspecifico);
        await movimientoRapido.llenarCantidadRapida(cantidad);
    });
    await test.step('Then: confirmar aumentar stock', async () => {
        await movimientoRapido.clickBtnAumentarStock();
        await movimientoRapido.cerrarModalConfirmacion();
    });
};

export const crearSalidaEstandarParaPrecondicion = async (
    movimientosNav: MovimientosNavigationPage,
    registroMovimiento: RegistroMovimientoPage,
    resultadoMovimiento: ResultadoMovimientoPage,
    codigoItem: string,
    nombreItem: string,
    cantidad: string,
    variante?: string
) => {
    await test.step('Arrange: crear salida para precondición', async () => {
        await movimientosNav.navegarASalidas();
        await registroMovimiento.clickAgregarSalida();
        await registroMovimiento.buscarItem(codigoItem);
        await registroMovimiento.seleccionarItemEnResultados(nombreItem);
        if (variante) {
            await registroMovimiento.seleccionarVariante(variante);
        }
        await registroMovimiento.llenarCantidad(cantidad);
        await registroMovimiento.clickTextoRegistrarSalida();
        await registroMovimiento.clickRegistrarYDespachar();
        await resultadoMovimiento.irAlListado();
    });
};

export const eliminarMovimientoDesdeListado = async (
    listadoMovimientos: ListadoMovimientosPage,
    usarIcono: boolean = false
) => {
    await test.step('Act: eliminar el movimiento desde el listado', async () => {
        if (usarIcono) {
            await listadoMovimientos.abrirMenuAccionesIcono();
        } else {
            await listadoMovimientos.abrirMenuAcciones();
        }
        await listadoMovimientos.clickEliminarMovimiento();
        await listadoMovimientos.confirmarEliminacion();
        await listadoMovimientos.cerrarModal();
    });
};

export const verificarEventoEnBitacora = async (
    listadoMovimientos: ListadoMovimientosPage,
    evento: string
) => {
    await test.step(`Assert: verificar bitácora de ${evento}`, async () => {
        await listadoMovimientos.abrirMenuAcciones();
        await listadoMovimientos.clickVerBitacora();
        await listadoMovimientos.clickEventoBitacora(evento);
        await listadoMovimientos.cerrarBitacora();
    });
};

export const abrirYCerrarBitacora = async (
    listadoMovimientos: ListadoMovimientosPage,
    cerrarAlternativo: boolean = false
) => {
    await test.step('Then: verificar apertura de bitácora', async () => {
        await listadoMovimientos.abrirMenuAcciones();
        await listadoMovimientos.clickVerBitacora();
        if (cerrarAlternativo) {
            await listadoMovimientos.cerrarBitacoraAlternativo();
        } else {
            await listadoMovimientos.cerrarBitacora();
        }
    });
};
export const verificarstockmasivo = async (
    movimientosNav: MovimientosNavigationPage,
    stockVerificacion: StockVerificacionPage,
    nthClicks: number[] = [0],
) => {
    await test.step('And: verificar stock del producto', async () => {
        await movimientosNav.navegarAStockProductos();
        await stockVerificacion.buscarPorCodigo(ITEMS_TEST.MASIVO_PROD.codigo);
        for (const nth of nthClicks) {
            await stockVerificacion.clickAlmacenMultipleNth(nth);
        }
    });

}

export const configurarDatosOpcionalesEstandar = async (
    datosOpcionales: DatosOpcionalesPage,
    numDocumentoProveedor: string,
    nombreProveedor: string
) => {
    await test.step('And: configurar datos opcionales con proveedor y campos adicionales', async () => {
        await datosOpcionales.abrirDatosOpcionales();
        await datosOpcionales.buscarProveedor(numDocumentoProveedor);
        await datosOpcionales.seleccionarProveedor(nombreProveedor);
        await datosOpcionales.llenarCampoTexto(0, 'auto');
        await datosOpcionales.clickCampoFecha(0);
        await datosOpcionales.seleccionarDiaEnDatepickerVisible('15');
        await datosOpcionales.llenarCampoNumero(0, '98989898989898989');
        await datosOpcionales.guardarDatos();
    });
};

// ─── Helpers MS-4 Traslado ────────────────────────────────────────────

export const navegarATrasladosYNuevo = async (
    movimientosNav: MovimientosNavigationPage,
    registroMovimiento: RegistroMovimientoPage,
) => {
    await test.step('Given: navegar a Traslados y crear nuevo', async () => {
        await movimientosNav.navegarATraslados();
        await registroMovimiento.clickAgregarTraslado();
    });
};

// ─── Helpers MS-2 Salida ──────────────────────────────────────────────

export const navegarASalidasYNuevo = async (
    movimientosNav: MovimientosNavigationPage,
    registroMovimiento: RegistroMovimientoPage,
    desdeMenu: boolean = false,
    usarAgregar: boolean = false,
) => {
    await test.step('Given: navegar a Salidas y crear nueva', async () => {
        if (desdeMenu) {
            await movimientosNav.navegarASalidasDesdeMenu();
        } else {
            await movimientosNav.navegarASalidas();
        }
        if (usarAgregar) {
            await registroMovimiento.clickAgregarSalida();
        } else {
            await registroMovimiento.clickNuevoMovimiento();
        }
    });
};

// ─── Helpers MS-5 Edición ─────────────────────────────────────────────

export const verificarBitacoraEdicion = async (
    listadoMovimientos: ListadoMovimientosPage,
    eventos: string[],
    cerrarAlternativo: boolean = false,
) => {
    await test.step(`Assert: verificar bitácora (${eventos.join(', ')})`, async () => {
        await listadoMovimientos.abrirMenuAcciones();
        await listadoMovimientos.clickVerBitacora();
        for (const evento of eventos) {
            await listadoMovimientos.clickEventoBitacora(evento);
        }
        if (cerrarAlternativo) {
            await listadoMovimientos.cerrarBitacoraAlternativo();
        } else {
            await listadoMovimientos.cerrarBitacora();
        }
    });
};

export const editarCantidadDeMovimiento = async (
    listadoMovimientos: ListadoMovimientosPage,
    registroMovimiento: RegistroMovimientoPage,
    cantidad: string,
    tipo: 'ingreso' | 'salida' = 'ingreso',
) => {
    await test.step(`Act: editar cantidad a ${cantidad}`, async () => {
        await listadoMovimientos.abrirMenuAcciones();
        await listadoMovimientos.clickEditarMovimiento();
        await registroMovimiento.llenarCantidad(cantidad);
        if (tipo === 'ingreso') {
            await registroMovimiento.clickActualizarIngreso();
        } else {
            await registroMovimiento.clickActualizarSalida();
        }
        await listadoMovimientos.cerrarModal();
    });
};

// ─── Helpers MS-6 Clonación ───────────────────────────────────────────

export const crearIngresoBaseParaClonacion = async (
    movimientosNav: MovimientosNavigationPage,
    registroMovimiento: RegistroMovimientoPage,
    resultadoMovimiento: ResultadoMovimientoPage,
    codigoItem: string,
    nombreItem: string,
    opciones?: {
        waitAntes?: Page;
        seleccionarEquivalente?: string;
        configurarDatos?: () => Promise<void>;
    }
) => {
    await test.step('Arrange: crear ingreso base para clonación', async () => {
        await movimientosNav.navegarAIngresos();
        await registroMovimiento.clickAgregarIngreso();
        if (opciones?.waitAntes) {
            await opciones.waitAntes.waitForTimeout(2000);
        }
        await registroMovimiento.buscarItem(codigoItem);
        await registroMovimiento.seleccionarItemEnResultados(nombreItem);
        if (opciones?.seleccionarEquivalente) {
            await registroMovimiento.seleccionarEquivalente(opciones.seleccionarEquivalente);
        }
        if (opciones?.configurarDatos) {
            await opciones.configurarDatos();
        }
        await registroMovimiento.clickRegistrarIngreso();
        await resultadoMovimiento.irAlListado();
    });
};

export const clonarMovimientoDesdeListado = async (
    listadoMovimientos: ListadoMovimientosPage,
    registroMovimiento: RegistroMovimientoPage,
    antesDeConfirmar?: () => Promise<void>,
) => {
    await test.step('Act: clonar movimiento', async () => {
        await listadoMovimientos.abrirMenuAcciones();
        await listadoMovimientos.clickClonarMovimiento();
        if (antesDeConfirmar) {
            await antesDeConfirmar();
        }
        await registroMovimiento.clickClonarIngreso();
        await listadoMovimientos.cerrarModal();
    });
};

// ─── Helpers MS-8 Acciones / Impresión ────────────────────────────────

export const navegarAIngresosYAbrirAccionesImpresion = async (
    movimientosNav: MovimientosNavigationPage,
    listadoMovimientos: ListadoMovimientosPage,
    desdeMenu: boolean = false,
) => {
    await test.step('Given: navegar a Ingresos y abrir acciones de impresión', async () => {
        if (desdeMenu) {
            await movimientosNav.navegarAIngresosDesdeMenu();
        } else {
            await movimientosNav.navegarAIngresos();
        }
        await listadoMovimientos.clickTabPorIndice(0);
        await listadoMovimientos.abrirMenuAcciones();
        await listadoMovimientos.clickImprimirDescargarEnviar();
    });
};

// ─── Helpers MS-7 Movimientos Masivos ─────────────────────────────────

export const cargarMovimientoMasivoDesdeExcel = async (
    listadoMovimientos: ListadoMovimientosPage,
    movimientoRapido: MovimientoRapidoPage,
    page: Page,
    excelPath: string,
) => {
    await test.step('When: abrir carga masiva y subir excel', async () => {
        await listadoMovimientos.clickIconoOpciones();
        await listadoMovimientos.clickCrearDesdeExcel();
        await page.locator('.popup-container > .button-close > .icon').click();
        await movimientoRapido.seleccionarcardProductos();
        await page.getByText('Siguiente').click();
        await page.locator('input[type="file"]').setInputFiles(excelPath);
        await page.getByText('Siguiente').click();
    });

    await test.step('And: procesar la carga', async () => {
        await page.getByText('Procesar').click();
        await expect(page.getByRole('button', {name: 'Ir al inicio'})).toBeVisible({timeout: 30_000});
        await page.getByRole('button', {name: 'Ir al inicio'}).click();
    });
};
