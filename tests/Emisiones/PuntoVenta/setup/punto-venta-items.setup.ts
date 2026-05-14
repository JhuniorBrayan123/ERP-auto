import {expect, test as setup} from '@playwright/test';
import {ProductoFormPage} from '@pages/Logistica/ProductoFormPage';
import {RecetaFormPage} from '@pages/Logistica/RecetaFormPage';
import {ListaFormPage} from '@pages/Logistica/ListaFormPage';
import {ListaItemsPage} from '@pages/Logistica/ListaItemsPage';
import type {InsumoReceta, ProductoListaItem} from '@helpers/Logistica/item-data.types';

setup.skip(!!process.env.SKIP_PV_ITEMS_SETUP, 'Setup de ítems PV omitido por SKIP_PV_ITEMS_SETUP');

// ─── Helpers de Logging Estructurado ──────────────────────────────────
const CASO_ACTUAL = 'Setup: Preparar ítems base para PuntoVenta / Emisiones';

function logInfo(paso: string, mensaje: string) {
    console.info(`[INFO][QA] - Caso: ${CASO_ACTUAL} | Paso: ${paso} | Mensaje: ${mensaje}`);
}

function logError(paso: string, error: unknown) {
    const motivo = error instanceof Error ? error.message : String(error);
    console.error(`[FAIL][QA] - Caso: ${CASO_ACTUAL} | Paso: ${paso} | Motivo: ${motivo}`);
}

// ─── Funciones Auxiliares ─────────────────────────────────────────────

/** Navega al módulo Productos y Stock */
async function navegarAItems(page: import('@playwright/test').Page): Promise<void> {
    await setup.step('Navegar al módulo de Productos y Stock', async () => {
        try {
            await page.getByText('Productos y servicios').click();
            await page.locator('[id="nvg_selects_cmp-header-selects_select:select-module-203-item-2007"]').click();
            await page.waitForLoadState('networkidle');
        } catch (error) {
            logError('Navegar al módulo de Productos', error);
            throw error;
        }
    });
}

/** Busca un ítem por código y retorna true si existe en la grilla */
async function itemExistePorCodigo(
    listaItems: ListaItemsPage,
    page: import('@playwright/test').Page,
    codigo: string,
): Promise<boolean> {
    return await setup.step(`Verificar existencia del ítem con código ${codigo}`, async () => {
        try {
            await listaItems.searchByCode(codigo);
            const resultado = page.getByRole('table').getByText(codigo).first();
            const existe = await resultado.isVisible({timeout: 3_000}).catch(() => false);
            await listaItems.clearSearch();
            return existe;
        } catch (error) {
            logError(`Buscar existencia de ítem ${codigo}`, error);
            throw error;
        }
    });
}

// ─── Setup principal ──────────────────────────────────────────────────

setup(CASO_ACTUAL, async ({page}) => {
    setup.setTimeout(300_000); // 5 min — crea hasta 6 ítems

    await setup.step('Navegación inicial al sistema', async () => {
        try {
            await page.goto('/');
            await navegarAItems(page);
        } catch (error) {
            logError('Navegación inicial', error);
            throw error; // Se relanza para permitir captura de artifacts (screenshot/video)
        }
    });

    const listaItems = new ListaItemsPage(page);
    const productoForm = new ProductoFormPage(page);
    const recetaForm = new RecetaFormPage(page);
    const listaForm = new ListaFormPage(page);

    // ══════════════════════════════════════════════════════════════════
    // 1. PRODUCTO CON ISC FIJO
    // ══════════════════════════════════════════════════════════════════
    await setup.step('Procesar Producto con ISC fijo (112211)', async () => {
        const COD_ISC = '112211';
        logInfo('Validación ISC', `Verificando producto ISC (${COD_ISC})...`);

        try {
            if (await itemExistePorCodigo(listaItems, page, COD_ISC)) {
                logInfo('Validación ISC', `Producto ISC "${COD_ISC}" ya existe`);
            } else {
                logInfo('Creación ISC', `Creando producto ISC "${COD_ISC}"...`);

                await setup.step('Llenar información básica (ISC)', async () => {
                    await productoForm.iniciarCreacionProducto();
                    await productoForm.llenarCodigo(112211);
                    await productoForm.llenarNombre('Producto con ISC fijo 27-4-');
                    await productoForm.llenarPrecios('11.52', '3.5');
                    await productoForm.expandirOpcionesAvanzadas();
                });

                await setup.step('Configurar stock flexible (ISC)', async () => {
                    await productoForm.irATabStock();
                    await productoForm.seleccionarControlStock('flexible');
                    await productoForm.llenarInfoAdicional('REGRESION', 'AUTO-TEST', 'AUTOMATIZADO');
                });

                await setup.step('Configurar impuestos ISC', async () => {
                    await productoForm.configurarISC({
                        tipoSistema: 'Aplicación al monto fijo',
                        monto: '1.5',
                    });
                });

                await setup.step('Guardar producto ISC y verificar redirección', async () => {
                    await productoForm.crearProducto();
                    await expect(
                        page.getByRole('button', {name: 'Ir a lista de ítems'}),
                        `El botón 'Ir a lista de ítems' no apareció tras crear el producto ISC ${COD_ISC}.`
                    ).toBeVisible({timeout: 15_000});
                    await productoForm.clickIrAListaItems();
                });

                logInfo('Creación ISC', `✓ Producto ISC "${COD_ISC}" creado exitosamente`);
            }
        } catch (error) {
            logError('Crear producto con ISC fijo', error);
            throw error;
        }
    });

    // ══════════════════════════════════════════════════════════════════
    // 2. PRODUCTO CON ICBPER
    // ══════════════════════════════════════════════════════════════════
    await setup.step('Procesar Producto con ICBPER (221122)', async () => {
        const COD_ICBPER = '221122';
        logInfo('Validación ICBPER', `Verificando producto ICBPER (${COD_ICBPER})...`);

        try {
            if (await itemExistePorCodigo(listaItems, page, COD_ICBPER)) {
                logInfo('Validación ICBPER', `Producto ICBPER "${COD_ICBPER}" ya existe`);
            } else {
                logInfo('Creación ICBPER', `Creando producto ICBPER "${COD_ICBPER}"...`);

                await setup.step('Llenar información básica (ICBPER)', async () => {
                    await productoForm.iniciarCreacionProducto();
                    await productoForm.llenarCodigo(221122);
                    await productoForm.llenarNombre('Producto con ICBPER 27-4-');
                    await productoForm.llenarPrecios('10', '10');
                    await productoForm.expandirOpcionesAvanzadas();
                });

                await setup.step('Configurar stock flexible (ICBPER)', async () => {
                    await productoForm.irATabStock();
                    await productoForm.seleccionarControlStock('flexible');
                    await productoForm.llenarInfoAdicional('REGRESION', 'AUTO-TEST', 'AUTOMATIZADO');
                });

                await setup.step('Activar impuesto ICBPER', async () => {
                    await productoForm.activarICBPER();
                });

                await setup.step('Guardar producto ICBPER y verificar', async () => {
                    await productoForm.crearProducto();
                    await expect(
                        page.getByRole('button', {name: 'Ir a lista de ítems'}),
                        `El botón 'Ir a lista de ítems' no apareció tras crear el producto ICBPER ${COD_ICBPER}.`
                    ).toBeVisible({timeout: 15_000});
                    await productoForm.clickIrAListaItems();
                });

                logInfo('Creación ICBPER', `✓ Producto ICBPER "${COD_ICBPER}" creado exitosamente`);
            }
        } catch (error) {
            logError('Crear producto con ICBPER', error);
            throw error;
        }
    });

    // ══════════════════════════════════════════════════════════════════
    // 3. RECETA CON INSUMOS ESTRICTOS
    // ══════════════════════════════════════════════════════════════════
    await setup.step('Procesar Receta con Insumos (332211)', async () => {
        const COD_RECETA = '332211';
        logInfo('Validación Receta', `Verificando receta (${COD_RECETA})...`);

        try {
            if (await itemExistePorCodigo(listaItems, page, COD_RECETA)) {
                logInfo('Validación Receta', `Receta "${COD_RECETA}" ya existe`);
            } else {
                logInfo('Creación Receta', `Creando receta "${COD_RECETA}"...`);

                const insumos: InsumoReceta[] = [
                    {codigoBusqueda: '464646', textoSeleccion: 'Nuevo insumo test1'},
                    {codigoBusqueda: '444666', textoSeleccion: 'nuevo insumo con', equivalencia: 'equivalenteX2 insumo'},
                ];

                await setup.step('Llenar información básica de la Receta', async () => {
                    await recetaForm.iniciarCreacionReceta();
                    await recetaForm.llenarCodigo(332211);
                    await recetaForm.llenarNombre('Receta insumos estrictos 27-4');
                    await recetaForm.llenarPrecios('50.22', '15.45');
                });

                await setup.step('Agregar insumos a la Receta', async () => {
                    await recetaForm.irATabInsumos();
                    for (const insumo of insumos) {
                        await recetaForm.buscarYAgregarInsumo(insumo);
                    }
                });

                await setup.step('Configurar opciones avanzadas de la Receta', async () => {
                    await recetaForm.expandirOpcionesAvanzadas();
                    await recetaForm.llenarInfoAdicional('AUTO-TEST', 'AUTOMATIZADO');
                });

                await setup.step('Guardar Receta y verificar', async () => {
                    await recetaForm.crearReceta();
                    await expect(
                        page.getByRole('button', {name: 'Ir a lista de ítems'}),
                        `El botón 'Ir a lista de ítems' no apareció tras crear la receta ${COD_RECETA}.`
                    ).toBeVisible({timeout: 15_000});
                    await recetaForm.clickIrAListaItems();
                });

                logInfo('Creación Receta', `✓ Receta "${COD_RECETA}" creada exitosamente`);
            }
        } catch (error) {
            logError('Crear Receta con Insumos', error);
            throw error;
        }
    });

    // ══════════════════════════════════════════════════════════════════
    // 4. LISTA ITEMS FLEXIBLES
    // ══════════════════════════════════════════════════════════════════
    await setup.step('Procesar Lista de Ítems (443444)', async () => {
        const COD_LISTA = '443444';
        logInfo('Validación Lista', `Verificando lista (${COD_LISTA})...`);

        try {
            if (await itemExistePorCodigo(listaItems, page, COD_LISTA)) {
                logInfo('Validación Lista', `Lista "${COD_LISTA}" ya existe`);
            } else {
                logInfo('Creación Lista', `Creando lista "${COD_LISTA}"...`);

                const productos: ProductoListaItem[] = [
                    {codigoBusqueda: '121212', textoSeleccion: 'item para combos gravado'},
                    {codigoBusqueda: '313131', textoSeleccion: 'item con variante flexible', variante: 'Variante 1 flexible'},
                    {codigoBusqueda: '202020', textoSeleccion: 'item equivalente flexible', equivalencia: 'Equivalente X2'},
                    {codigoBusqueda: '545454', textoSeleccion: 'item selector flexible'},
                ];

                await setup.step('Llenar información básica de la Lista', async () => {
                    await listaForm.iniciarCreacionLista();
                    await listaForm.llenarCodigo(443444);
                    await listaForm.llenarNombre('Lista items flexibles 27-4-');
                    await listaForm.llenarDescripcion('Lista para prueba Nota de Venta');
                });

                await setup.step('Agregar productos a la Lista', async () => {
                    for (const prod of productos) {
                        await listaForm.buscarYAgregarProducto(prod);
                    }
                });

                await setup.step('Guardar Lista y verificar', async () => {
                    await listaForm.crearLista();
                    await expect(
                        page.getByRole('button', {name: 'Ir a lista de ítems'}),
                        `El botón 'Ir a lista de ítems' no apareció tras crear la lista ${COD_LISTA}.`
                    ).toBeVisible({timeout: 15_000});
                    await listaForm.clickIrAListaItems();
                });

                logInfo('Creación Lista', `✓ Lista "${COD_LISTA}" creada exitosamente`);
            }
        } catch (error) {
            logError('Crear Lista de Ítems', error);
            throw error;
        }
    });

    // ══════════════════════════════════════════════════════════════════
    // 5. PRODUCTO ALMACEN-AUTO
    // ══════════════════════════════════════════════════════════════════
    await setup.step('Procesar Producto ALMACEN-AUTO', async () => {
        const COD_ALMACEN_AUTO = '83838383';
        logInfo('Validación ALMACEN-AUTO', `Verificando producto ALMACEN-AUTO (${COD_ALMACEN_AUTO})...`);

        try {
            if (await itemExistePorCodigo(listaItems, page, COD_ALMACEN_AUTO)) {
                logInfo('Validación ALMACEN-AUTO', `Producto ALMACEN-AUTO "${COD_ALMACEN_AUTO}" ya existe`);
            } else {
                logInfo('Creación ALMACEN-AUTO', `Creando producto ALMACEN-AUTO "${COD_ALMACEN_AUTO}"...`);

                await setup.step('Llenar información básica', async () => {
                    await productoForm.iniciarCreacionProducto();
                    await productoForm.llenarCodigo(Number(COD_ALMACEN_AUTO));
                    await productoForm.llenarNombre('Item solo almacen-auto X2');
                    await productoForm.llenarPrecios('10.55', '3.5');
                    await productoForm.expandirOpcionesAvanzadas();
                });

                await setup.step('Configurar stock estricto en almacén único', async () => {
                    await productoForm.irATabStock();
                    await productoForm.seleccionarAlmacenEspecifico('ALMACEN-AUTO');
                    await productoForm.seleccionarControlStock('estricto');
                    await productoForm.llenarCantidadesStock('1');
                    await productoForm.llenarInfoAdicional('REGRESION', 'AUTO-TEST', 'AUTOMATIZADO');
                });

                await setup.step('Guardar producto y verificar', async () => {
                    await productoForm.crearProducto();
                    await expect(
                        page.getByRole('button', {name: 'Ir a lista de ítems'}),
                        `El botón 'Ir a lista de ítems' no apareció tras crear producto ALMACEN-AUTO ${COD_ALMACEN_AUTO}.`
                    ).toBeVisible({timeout: 15_000});
                    await productoForm.clickIrAListaItems();
                });

                logInfo('Creación ALMACEN-AUTO', `✓ Producto ALMACEN-AUTO "${COD_ALMACEN_AUTO}" creado exitosamente`);
            }
        } catch (error) {
            logError('Crear Producto ALMACEN-AUTO', error);
            throw error;
        }
    });

    // ══════════════════════════════════════════════════════════════════
    // 6. PRODUCTO ALMACEN-VENTAS
    // ══════════════════════════════════════════════════════════════════
    await setup.step('Procesar Producto ALMACEN-VENTAS', async () => {
        const COD_ALMACEN_VENTAS = '38383838';
        logInfo('Validación ALMACEN-VENTAS', `Verificando producto ALMACEN-VENTAS (${COD_ALMACEN_VENTAS})...`);

        try {
            if (await itemExistePorCodigo(listaItems, page, COD_ALMACEN_VENTAS)) {
                logInfo('Validación ALMACEN-VENTAS', `Producto ALMACEN-VENTAS "${COD_ALMACEN_VENTAS}" ya existe`);
            } else {
                logInfo('Creación ALMACEN-VENTAS', `Creando producto ALMACEN-VENTAS "${COD_ALMACEN_VENTAS}"...`);

                await setup.step('Llenar información básica', async () => {
                    await productoForm.iniciarCreacionProducto();
                    await productoForm.llenarCodigo(Number(COD_ALMACEN_VENTAS));
                    await productoForm.llenarNombre('Item solo almacen-venta');
                    await productoForm.llenarPrecios('10.55', '3.5');
                    await productoForm.expandirOpcionesAvanzadas();
                });

                await setup.step('Configurar stock estricto en almacén único', async () => {
                    await productoForm.irATabStock();
                    await productoForm.seleccionarAlmacenEspecifico('ALMACÉN DE VENTAS');
                    await productoForm.seleccionarControlStock('estricto');
                    await productoForm.llenarCantidadesStock('1');
                    await productoForm.llenarInfoAdicional('REGRESION', 'AUTO-TEST', 'AUTOMATIZADO');
                });

                await setup.step('Guardar producto y verificar', async () => {
                    await productoForm.crearProducto();
                    await expect(
                        page.getByRole('button', {name: 'Ir a lista de ítems'}),
                        `El botón 'Ir a lista de ítems' no apareció tras crear producto ALMACEN-VENTAS ${COD_ALMACEN_VENTAS}.`
                    ).toBeVisible({timeout: 15_000});
                    await productoForm.clickIrAListaItems();
                });

                logInfo('Creación ALMACEN-VENTAS', `✓ Producto ALMACEN-VENTAS "${COD_ALMACEN_VENTAS}" creado exitosamente`);
            }
        } catch (error) {
            logError('Crear Producto ALMACEN-VENTAS', error);
            throw error;
        }
    });

    logInfo('Setup Completo', 'Todos los ítems de PuntoVenta están listos');
});
