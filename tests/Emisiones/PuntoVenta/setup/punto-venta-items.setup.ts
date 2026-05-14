import {expect, test as setup} from '@playwright/test';
import {ProductoFormPage} from '../../../../src/pages/Logistica/ProductoFormPage';
import {RecetaFormPage} from '../../../../src/pages/Logistica/RecetaFormPage';
import {ListaFormPage} from '../../../../src/pages/Logistica/ListaFormPage';
import {ListaItemsPage} from '../../../../src/pages/Logistica/ListaItemsPage';
import type {InsumoReceta, ProductoListaItem} from '../../../../src/helpers/Logistica/item-data.types';

setup.skip(!!process.env.SKIP_PV_ITEMS_SETUP, 'Setup de ítems PV omitido por SKIP_PV_ITEMS_SETUP');

// ─── Helpers locales ──────────────────────────────────────────────────

/** Navega al módulo Productos y Stock */
async function navegarAItems(page: import('@playwright/test').Page): Promise<void> {
    await page.getByText('Productos y servicios').click();
    await page.locator(
        '[id="nvg_selects_cmp-header-selects_select:select-module-203-item-2007"]',
    ).click();
    await page.waitForLoadState('networkidle');
}

/** Busca un ítem por código y retorna true si existe en la grilla */
async function itemExistePorCodigo(
    listaItems: ListaItemsPage,
    page: import('@playwright/test').Page,
    codigo: string,
): Promise<boolean> {
    await listaItems.searchByCode(codigo);
    const resultado = page.getByRole('table').getByText(codigo).first();
    const existe = await resultado.isVisible({timeout: 3_000}).catch(() => false);
    await listaItems.clearSearch();
    return existe;
}

// ─── Setup principal ──────────────────────────────────────────────────

setup('preparar ítems base para PuntoVenta / Emisiones', async ({page}) => {
    setup.setTimeout(300_000); // 5 min — crea hasta 4 ítems

    await page.goto('/');
    await navegarAItems(page);

    const listaItems = new ListaItemsPage(page);
    const productoForm = new ProductoFormPage(page);
    const recetaForm = new RecetaFormPage(page);
    const listaForm = new ListaFormPage(page);

    // ══════════════════════════════════════════════════════════════════
    // 1. PRODUCTO CON ISC FIJO — código 112211
    // ══════════════════════════════════════════════════════════════════
    const COD_ISC = '112211';
    console.log(`\n [PV Items] Verificando producto ISC (${COD_ISC})...`);

    if (await itemExistePorCodigo(listaItems, page, COD_ISC)) {
        console.log(`   Producto ISC "${COD_ISC}" ya existe`);
    } else {
        console.log(`   Creando producto ISC "${COD_ISC}"...`);

        await productoForm.iniciarCreacionProducto();
        await productoForm.llenarCodigo(112211);
        await productoForm.llenarNombre('Producto con ISC fijo 27-4-');
        await productoForm.llenarPrecios('11.52', '3.5');
        await productoForm.expandirOpcionesAvanzadas();

        // Stock flexible
        await productoForm.irATabStock();
        await productoForm.seleccionarControlStock('flexible');
        await productoForm.llenarInfoAdicional('REGRESION', 'AUTO-TEST', 'AUTOMATIZADO');

        // ISC monto fijo
        await productoForm.configurarISC({
            tipoSistema: 'Aplicación al monto fijo',
            monto: '1.5',
        });

        // Crear y volver a lista
        await productoForm.crearProducto();
        await expect(page.getByRole('button', {name: 'Ir a lista de ítems'})).toBeVisible({timeout: 15_000});
        await productoForm.clickIrAListaItems();
        console.log(`  ✓ Producto ISC "${COD_ISC}" creado`);
    }

    // ══════════════════════════════════════════════════════════════════
    // 2. PRODUCTO CON ICBPER — código 221122
    // ══════════════════════════════════════════════════════════════════
    const COD_ICBPER = '221122';
    console.log(`\n [PV Items] Verificando producto ICBPER (${COD_ICBPER})...`);

    if (await itemExistePorCodigo(listaItems, page, COD_ICBPER)) {
        console.log(`   Producto ICBPER "${COD_ICBPER}" ya existe`);
    } else {
        console.log(`   Creando producto ICBPER "${COD_ICBPER}"...`);

        await productoForm.iniciarCreacionProducto();
        await productoForm.llenarCodigo(221122);
        await productoForm.llenarNombre('Producto con ICBPER 27-4-');
        await productoForm.llenarPrecios('10', '10');
        await productoForm.expandirOpcionesAvanzadas();

        // Stock flexible
        await productoForm.irATabStock();
        await productoForm.seleccionarControlStock('flexible');
        await productoForm.llenarInfoAdicional('REGRESION', 'AUTO-TEST', 'AUTOMATIZADO');

        // ICBPER
        await productoForm.activarICBPER();

        // Crear y volver a lista
        await productoForm.crearProducto();
        await expect(page.getByRole('button', {name: 'Ir a lista de ítems'})).toBeVisible({timeout: 15_000});
        await productoForm.clickIrAListaItems();
        console.log(`  ✓ Producto ICBPER "${COD_ICBPER}" creado`);
    }

    // ══════════════════════════════════════════════════════════════════
    // 3. RECETA CON INSUMOS ESTRICTOS — código 332211
    // ══════════════════════════════════════════════════════════════════
    const COD_RECETA = '332211';
    console.log(`\n [PV Items] Verificando receta (${COD_RECETA})...`);

    if (await itemExistePorCodigo(listaItems, page, COD_RECETA)) {
        console.log(`   Receta "${COD_RECETA}" ya existe`);
    } else {
        console.log(`   Creando receta "${COD_RECETA}"...`);

        const insumos: InsumoReceta[] = [
            {codigoBusqueda: '464646', textoSeleccion: 'Nuevo insumo test1'},
            {codigoBusqueda: '444666', textoSeleccion: 'nuevo insumo con', equivalencia: 'equivalenteX2 insumo'},
        ];

        await recetaForm.iniciarCreacionReceta();
        await recetaForm.llenarCodigo(332211);
        await recetaForm.llenarNombre('Receta insumos estrictos 27-4');
        await recetaForm.llenarPrecios('50.22', '15.45');
        await recetaForm.irATabInsumos();
        for (const insumo of insumos) {
            await recetaForm.buscarYAgregarInsumo(insumo);
        }
        await recetaForm.expandirOpcionesAvanzadas();
        await recetaForm.llenarInfoAdicional('AUTO-TEST', 'AUTOMATIZADO');

        // Crear y volver a lista
        await recetaForm.crearReceta();
        await expect(page.getByRole('button', {name: 'Ir a lista de ítems'})).toBeVisible({timeout: 15_000});
        await recetaForm.clickIrAListaItems();
        console.log(`  ✓ Receta "${COD_RECETA}" creada`);
    }

    // ══════════════════════════════════════════════════════════════════
    // 4. LISTA ITEMS FLEXIBLES — código 443444
    // ══════════════════════════════════════════════════════════════════
    const COD_LISTA = '443444';
    console.log(`\n [PV Items] Verificando lista (${COD_LISTA})...`);

    if (await itemExistePorCodigo(listaItems, page, COD_LISTA)) {
        console.log(`   Lista "${COD_LISTA}" ya existe`);
    } else {
        console.log(`   Creando lista "${COD_LISTA}"...`);

        const productos: ProductoListaItem[] = [
            {codigoBusqueda: '121212', textoSeleccion: 'item para combos gravado'},
            {codigoBusqueda: '313131', textoSeleccion: 'item con variante flexible', variante: 'Variante 1 flexible'},
            {codigoBusqueda: '202020', textoSeleccion: 'item equivalente flexible', equivalencia: 'Equivalente X2'},
            {codigoBusqueda: '545454', textoSeleccion: 'item selector flexible'},
        ];

        await listaForm.iniciarCreacionLista();
        await listaForm.llenarCodigo(443444);
        await listaForm.llenarNombre('Lista items flexibles 27-4-');
        await listaForm.llenarDescripcion('Lista para prueba Nota de Venta');
        for (const prod of productos) {
            await listaForm.buscarYAgregarProducto(prod);
        }

        // Crear y volver a lista
        await listaForm.crearLista();
        await expect(page.getByRole('button', {name: 'Ir a lista de ítems'})).toBeVisible({timeout: 15_000});
        await listaForm.clickIrAListaItems();
        console.log(`  ✓ Lista "${COD_LISTA}" creada`);
    }

    const COD_ALMACEN_AUTO = '808080';
    console.log(`\n [PV Items] Verificando producto ALMACEN-AUTO (${COD_ALMACEN_AUTO})...`);

    if (await itemExistePorCodigo(listaItems, page, COD_ALMACEN_AUTO)) {
        console.log(`   Producto ALMACEN-AUTO "${COD_ALMACEN_AUTO}" ya existe`);
    } else {
        console.log(`   Creando producto ALMACEN-AUTO "${COD_ALMACEN_AUTO}"...`);

        await productoForm.iniciarCreacionProducto();
        await productoForm.llenarCodigo(808080);
        await productoForm.llenarNombre('Item solo almacen-auto');
        await productoForm.llenarPrecios('10.55', '3.5');
        await productoForm.expandirOpcionesAvanzadas();

        // Configuración de stock estricto en almacén único
        await productoForm.irATabStock();
        await productoForm.seleccionarAlmacenEspecifico('ALMACEN-AUTO');
        await productoForm.seleccionarControlStock('estricto');
        await productoForm.llenarCantidadesStock('1');

        await productoForm.llenarInfoAdicional('REGRESION', 'AUTO-TEST', 'AUTOMATIZADO');

        // Crear y volver a lista
        await productoForm.crearProducto();
        await expect(page.getByRole('button', {name: 'Ir a lista de ítems'})).toBeVisible({timeout: 15_000});
        await productoForm.clickIrAListaItems();
        console.log(`  ✓ Producto ALMACEN-AUTO "${COD_ALMACEN_AUTO}" creado`);
    }

    console.log('\n [PV Items] Todos los ítems de PuntoVenta están listos\n');
});
