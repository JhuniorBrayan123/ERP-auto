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
import {FUNCTIONAL_CATALOG} from '../../utils/functional-catalog';
import {expectVisibleFunctional, runFunctionalStep} from '../../utils/functional-step';

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
    await runFunctionalStep(
        'Verificar stock actualizado en inventario',
        page,
        FUNCTIONAL_CATALOG.stock.buscarProducto,
        async () => {
            await movimientosNav.navegarAStockProductos();
            await stockVerificacion.buscarPorCodigo(codigoItem);
            if (textClickEquivalente) {
                await page.getByText(textClickEquivalente).click();
            }
            await stockVerificacion.clickVariosTexto();
        },
    );

    await runFunctionalStep(
        'Verificar movimiento reflejado en kardex',
        page,
        {
            ...FUNCTIONAL_CATALOG.kardex.abrirDetalleAlmacen,
            flowStep: 'Validar movimiento en kardex por almacén',
            userMessage: 'El flujo no logró confirmar el movimiento en la vista de kardex.',
            technicalDetail: 'Falla al abrir kardex por producto, abrir detalle de almacén o validar el código de movimiento.',
        },
        async () => {
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
        },
    );
};

export const crearAjusteConItem = async (
    registroMovimiento: RegistroMovimientoPage,
    codigoItem: string,
    nombreItem: string,
    page?: Page,
    textClickEquivalente?: string
) => {
    if (!page) {
        await test.step('Crear ajuste con ítem', async () => {
            await registroMovimiento.clickAgregarAjuste();
            await registroMovimiento.buscarItem(codigoItem);
            await registroMovimiento.seleccionarItemEnResultados(nombreItem);
        });
        return;
    }

    await runFunctionalStep('Crear ajuste con ítem', page, FUNCTIONAL_CATALOG.movimientos.definirAlmacenMotivo, async () => {
        await registroMovimiento.clickAgregarAjuste();
        await registroMovimiento.buscarItem(codigoItem);
        await registroMovimiento.seleccionarItemEnResultados(nombreItem);
        if (textClickEquivalente) {
            await page.getByText(textClickEquivalente).click();
        }
    });
};

export const registrarAjusteEIrAlListado = async (
    registroMovimiento: RegistroMovimientoPage,
    resultadoMovimiento: ResultadoMovimientoPage,
) => {
    await test.step('Registrar ajuste y volver al listado', async () => {
        await registroMovimiento.clickRegistrarAjuste();
        await resultadoMovimiento.irAlListado();
    });
};

export const definirCantidadYFactor = async (
    registroMovimiento: RegistroMovimientoPage,
    cantidad: string,
    factor: 'Agregar' | 'Quitar',
) => {
    await test.step(`Configurar cantidad y factor de ajuste (${factor})`, async () => {
        await registroMovimiento.llenarCantidad(cantidad);
        await registroMovimiento.seleccionarFactorAjuste(factor);
    });
};

export const buscarYSeleccionarItem = async (
    registroMovimiento: RegistroMovimientoPage,
    codigoItem: string,
    nombreItem: string,
) => {
    await test.step('Buscar y seleccionar producto del movimiento', async () => {
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
    await runFunctionalStep(
        'Verificar movimiento en kardex desde stock',
        undefined,
        {
            ...FUNCTIONAL_CATALOG.kardex.abrirDetalleAlmacen,
            flowStep: 'Validar movimiento en kardex desde la vista de stock',
            userMessage: 'No se pudo validar el movimiento en kardex desde la vista de stock.',
            technicalDetail: 'Falla al abrir kardex, abrir detalle por almacén o validar código de movimiento.',
        },
        async () => {
            const kardexPage = await stockVerificacion.abrirKardexDesdeStock();
            const kardexPopup = new KardexVerificacionPage(kardexPage);
            await kardexPopup.abrirVerDetallePorAlmacen2(almacen);
            await expectVisibleFunctional(kardexPage, kardexPage.getByText(patronCodigo).first(), {
                ...FUNCTIONAL_CATALOG.kardex.abrirDetalleAlmacen,
                flowStep: 'Confirmar código de movimiento visible en kardex',
                userMessage: 'No se visualizó el código de movimiento esperado en kardex.',
                technicalDetail: `El patrón ${patronCodigo} no estuvo visible en el detalle de kardex.`,
            });
            if (clickCodigo) {
                await kardexPopup.clickCodigoMovimientoRegex(patronCodigo);
            }
            await kardexPopup.cerrarModalDetalle();
        },
    );
};

export const navegarAIngresosYNuevo = async (
    movimientosNav: MovimientosNavigationPage,
    registroMovimiento: RegistroMovimientoPage,
    desdeMenu: boolean = false
) => {
    await test.step('Abrir ingresos y crear nuevo movimiento', async () => {
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
    await runFunctionalStep('Seleccionar almacén y motivo del movimiento', undefined, FUNCTIONAL_CATALOG.movimientos.definirAlmacenMotivo, async () => {
        await registroMovimiento.seleccionarAlmacen(almacenOrigen, almacenDestino);
        await registroMovimiento.seleccionarMotivo(motivoGral, motivoEspecifico);
    });
};

export const definirCantidadYRegistrarIngreso = async (
    registroMovimiento: RegistroMovimientoPage,
    cantidad: string,
    resultadoMovimiento?: ResultadoMovimientoPage
) => {
    await runFunctionalStep('Registrar ingreso con cantidad definida', undefined, FUNCTIONAL_CATALOG.movimientos.registrarIngreso, async () => {
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
    await runFunctionalStep('Registrar ingreso y volver al listado', undefined, FUNCTIONAL_CATALOG.movimientos.registrarIngreso, async () => {
        await registroMovimiento.clickRegistrarIngreso();
        await resultadoMovimiento.irAlListado();
    });
};

export const registrarSalidaYDespachar = async (
    registroMovimiento: RegistroMovimientoPage,
    resultadoMovimiento: ResultadoMovimientoPage,
    usarMetodoAvanzado: boolean = false
) => {
    await runFunctionalStep(
        'Registrar salida con despacho y volver al listado',
        undefined,
        {
            ...FUNCTIONAL_CATALOG.movimientos.registrarIngreso,
            flowStep: 'Registrar salida y despacharla',
            userMessage: 'No se pudo registrar y despachar la salida de almacén.',
            technicalDetail: 'Falla al registrar salida o confirmar despacho.',
        },
        async () => {
        if (usarMetodoAvanzado) {
            await registroMovimiento.clickTextoRegistrarSalida();
        } else {
            await registroMovimiento.clickRegistrarSalida();
        }
        await registroMovimiento.clickRegistrarYDespachar();
        await resultadoMovimiento.irAlListado();
        },
    );
};

export const registrarTrasladoEIrAlListado = async (
    registroMovimiento: RegistroMovimientoPage,
    resultadoMovimiento: ResultadoMovimientoPage
) => {
    await runFunctionalStep(
        'Registrar traslado y volver al listado',
        undefined,
        {
            ...FUNCTIONAL_CATALOG.movimientos.registrarIngreso,
            flowStep: 'Registrar traslado entre almacenes',
            userMessage: 'No se pudo registrar el traslado entre almacenes.',
            technicalDetail: 'Falla al confirmar el registro del traslado.',
        },
        async () => {
        await registroMovimiento.clickRegistrarTraslado();
        await resultadoMovimiento.irAlListado();
        },
    );
};

export const verificarStockPorCodigoYClick = async (
    movimientosNav: MovimientosNavigationPage,
    stockVerificacion: StockVerificacionPage,
    codigoItem: string,
    accionAdicional?: () => Promise<void>
) => {
    await runFunctionalStep('Verificar stock del producto', undefined, FUNCTIONAL_CATALOG.stock.buscarProducto, async () => {
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
    await runFunctionalStep(
        'Verificar kardex total del movimiento',
        page,
        {
            ...FUNCTIONAL_CATALOG.kardex.abrirDetalleAlmacen,
            flowStep: 'Validar movimiento en kardex total',
            userMessage: 'No se pudo verificar el movimiento esperado en kardex total.',
            technicalDetail: 'Falla en búsqueda, selección de opción kardex o apertura de detalle por almacén.',
        },
        async () => {
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
        },
    );
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
    return await runFunctionalStep('Crear ingreso estándar para precondición', page, FUNCTIONAL_CATALOG.movimientos.registrarIngreso, async () => {
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
        await registroMovimiento.clickRegistrarIngreso()
        await resultadoMovimiento.irAlListado();
    });
};

export const buscarItemEnListadoRapidoYAcceder = async (
    movimientoRapido: MovimientoRapidoPage,
    page: Page,
    codigoItem: string
) => {
    await runFunctionalStep(
        'Buscar ítem en listado rápido y acceder',
        page,
        {
            ...FUNCTIONAL_CATALOG.movimientos.definirAlmacenMotivo,
            screen: 'Movimientos rápidos',
            flowStep: 'Buscar ítem en listado rápido',
            userMessage: 'No se pudo buscar el ítem en el listado rápido.',
            technicalDetail: `Falla en la búsqueda o acceso al ítem ${codigoItem} en movimientos rápidos.`,
        },
        async () => {
        await movimientoRapido.buscarItemPorCodigo(codigoItem);
        await page
            .locator('[id="lgt_items_cmp-filtro-items:filtro:filtro_section_v-input:button_search"]')
            .click();
        await page.waitForLoadState('networkidle');
        },
    );
};

export const configurarYRetirarStockRapido = async (
    movimientoRapido: MovimientoRapidoPage,
    almacen: string,
    motivoGral: string,
    motivoEspecifico: string,
    cantidad: string
) => {
    await test.step('Configurar retiro de stock rápido', async () => {
        await movimientoRapido.seleccionarAlmacenRapido(almacen);
        await movimientoRapido.seleccionarMotivoSalidaDesdeDiv(motivoGral, motivoEspecifico);
        await movimientoRapido.llenarCantidadRapida(cantidad);
    });

    await test.step('Confirmar retiro de stock rápido', async () => {
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
    await test.step('Configurar retiro de stock rápido (variante 2)', async () => {
        await movimientoRapido.seleccionarAlmacenRapido2(almacen);
        await movimientoRapido.seleccionarMotivoSalidaDesdeDiv(motivoGral, motivoEspecifico);
        await movimientoRapido.llenarCantidadRapida(cantidad);
    });

    await test.step('Confirmar retiro de stock rápido (variante 2)', async () => {
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
    await test.step('Configurar aumento de stock rápido', async () => {
        if (almacen) await movimientoRapido.seleccionarAlmacenRapido(almacen);
        if (motivoGral) await movimientoRapido.seleccionarMotivoIngresoRapido(motivoGral, motivoEspecifico);
        await movimientoRapido.llenarCantidadRapida(cantidad);
    });
    await test.step('Confirmar aumento de stock rápido', async () => {
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
    await runFunctionalStep(
        'Crear salida para precondición',
        undefined,
        {
            ...FUNCTIONAL_CATALOG.movimientos.registrarIngreso,
            flowStep: 'Generar salida base para escenario',
            userMessage: 'No se pudo crear la salida base para la precondición del caso.',
            technicalDetail: 'Falla al crear, registrar o despachar la salida de precondición.',
        },
        async () => {
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
        },
    );
};

export const eliminarMovimientoDesdeListado = async (
    listadoMovimientos: ListadoMovimientosPage,
    usarIcono: boolean = false
) => {
    await runFunctionalStep(
        'Eliminar movimiento desde el listado',
        undefined,
        {
            ...FUNCTIONAL_CATALOG.movimientos.editarMovimiento,
            flowStep: 'Eliminar movimiento desde el listado',
            userMessage: 'No se pudo eliminar el movimiento desde el listado.',
            technicalDetail: 'Falla al abrir acciones, confirmar eliminación o cerrar modal.',
        },
        async () => {
        if (usarIcono) {
            await listadoMovimientos.abrirMenuAccionesIcono();
        } else {
            await listadoMovimientos.abrirMenuAcciones();
        }
        await listadoMovimientos.clickEliminarMovimiento();
        await listadoMovimientos.confirmarEliminacion();
        await listadoMovimientos.cerrarModal();
        },
    );
};

export const verificarEventoEnBitacora = async (
    listadoMovimientos: ListadoMovimientosPage,
    evento: string
) => {
    await runFunctionalStep(`Validar bitácora con evento ${evento}`, undefined, FUNCTIONAL_CATALOG.movimientos.verificarBitacora, async () => {
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
    await runFunctionalStep('Verificar apertura de bitácora', undefined, FUNCTIONAL_CATALOG.movimientos.verificarBitacora, async () => {
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
    await runFunctionalStep('Verificar stock del producto masivo', undefined, FUNCTIONAL_CATALOG.stock.buscarProducto, async () => {
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
    await test.step('Configurar datos opcionales con proveedor y campos adicionales', async () => {
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
    await runFunctionalStep(
        'Navegar a traslados y crear nuevo',
        undefined,
        {
            ...FUNCTIONAL_CATALOG.movimientos.navegarIngresos,
            screen: 'Movimientos > Traslados',
            flowStep: 'Ingresar a traslados y abrir nuevo registro',
            userMessage: 'No se pudo abrir la pantalla de traslados para crear un nuevo movimiento.',
            technicalDetail: 'Falla en navegación hacia traslados o apertura del formulario.',
        },
        async () => {
        await movimientosNav.navegarATraslados();
        await registroMovimiento.clickAgregarTraslado();
        },
    );
};

// ─── Helpers MS-2 Salida ──────────────────────────────────────────────

export const navegarASalidasYNuevo = async (
    movimientosNav: MovimientosNavigationPage,
    registroMovimiento: RegistroMovimientoPage,
    desdeMenu: boolean = false,
    usarAgregar: boolean = false,
) => {
    await runFunctionalStep(
        'Navegar a salidas y crear nueva',
        undefined,
        {
            ...FUNCTIONAL_CATALOG.movimientos.navegarIngresos,
            screen: 'Movimientos > Salidas',
            flowStep: 'Ingresar a salidas y abrir nuevo registro',
            userMessage: 'No se pudo abrir la pantalla de salidas para crear un nuevo movimiento.',
            technicalDetail: 'Falla en navegación hacia salidas o apertura del formulario.',
        },
        async () => {
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
        },
    );
};

// ─── Helpers MS-5 Edición ─────────────────────────────────────────────

export const verificarBitacoraEdicion = async (
    listadoMovimientos: ListadoMovimientosPage,
    eventos: string[],
    cerrarAlternativo: boolean = false,
) => {
    await runFunctionalStep(`Validar bitácora de edición (${eventos.join(', ')})`, undefined, FUNCTIONAL_CATALOG.movimientos.verificarBitacora, async () => {
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
    await runFunctionalStep(
        `Editar cantidad del movimiento a ${cantidad}`,
        undefined,
        FUNCTIONAL_CATALOG.movimientos.editarMovimiento,
        async () => {
        await listadoMovimientos.abrirMenuAcciones();
        await listadoMovimientos.clickEditarMovimiento();
        await registroMovimiento.llenarCantidad(cantidad);
        if (tipo === 'ingreso') {
            await registroMovimiento.clickActualizarIngreso();
        } else {
            await registroMovimiento.clickActualizarSalida();
        }
        await listadoMovimientos.cerrarModal();
        },
    );
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
    await runFunctionalStep(
        'Crear ingreso base para clonación',
        undefined,
        FUNCTIONAL_CATALOG.movimientos.clonarMovimiento,
        async () => {
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
        },
    );
};

export const clonarMovimientoDesdeListado = async (
    listadoMovimientos: ListadoMovimientosPage,
    registroMovimiento: RegistroMovimientoPage,
    antesDeConfirmar?: () => Promise<void>,
) => {
    await runFunctionalStep('Clonar movimiento desde listado', undefined, FUNCTIONAL_CATALOG.movimientos.clonarMovimiento, async () => {
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
    await runFunctionalStep('Abrir acciones de impresión desde ingresos', undefined, FUNCTIONAL_CATALOG.movimientos.accionesImpresion, async () => {
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
    await runFunctionalStep('Abrir carga masiva y subir excel', page, FUNCTIONAL_CATALOG.movimientos.cargaMasiva, async () => {
        await listadoMovimientos.clickIconoOpciones();
        await listadoMovimientos.clickCrearDesdeExcel();
        await page.locator('.popup-container > .button-close > .icon').click();
        await movimientoRapido.seleccionarcardProductos();
        await page.getByText('Siguiente').click();
        await page.locator('input[type="file"]').setInputFiles(excelPath);
        await page.getByText('Siguiente').click();
    });

    await runFunctionalStep('Procesar carga masiva de movimientos', page, FUNCTIONAL_CATALOG.movimientos.cargaMasiva, async () => {
        await page.getByText('Procesar').click();
        await expectVisibleFunctional(page, page.getByRole('button', {name: 'Ir al inicio'}), {
            ...FUNCTIONAL_CATALOG.movimientos.cargaMasiva,
            flowStep: 'Validar finalización de carga masiva',
            userMessage: 'La carga masiva no finalizó correctamente para regresar al inicio.',
            technicalDetail: 'No apareció el botón "Ir al inicio" después de procesar el excel.',
        });
        await page.getByRole('button', {name: 'Ir al inicio'}).click();
    });
};
