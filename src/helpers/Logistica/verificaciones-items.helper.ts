import {test} from "../../fixtures/Logistica/items-fixture";
import {expect, Page} from "@playwright/test";
import {ItemFormBasePage} from "../../pages/Logistica/ItemFormBasePage";
import {ProductoFormPage} from "../../pages/Logistica/ProductoFormPage";
import {ComboFormPage} from "../../pages/Logistica/ComboFormPage";
import {RecetaFormPage} from "../../pages/Logistica/RecetaFormPage";
import {ListaFormPage} from "../../pages/Logistica/ListaFormPage";
import {CargaMasivaPage} from "../../pages/Logistica/CargaMasivaPage";
import type {ComponenteCombo, InsumoReceta, ProductoListaItem, StockConfig,} from "./item-data.types";
import { getCodigo as resolverCodigo } from "../../factories/item-factory";
import { buildMassiveExcel, cleanupTempFile } from "./masivo-excel.helper";

// ─── Cross-type: Crear y Confirmar ───────────────────────────────────

/**
 * Bloque común a TODOS los tests de creación PS-3:
 * ejecutar la función de crear → esperar botón de confirmación → ir a lista.
 *
 * @param form Cualquier PO que herede de ItemFormBasePage
 * @param crearFn La función de creación específica del tipo de item
 */
export const confirmarCreacionEIrALista = async (
    form: ItemFormBasePage,
    crearFn: () => Promise<void>,
) => {
    await test.step("Crear item y confirmar", async () => {
        await crearFn();
        await expect(
            form["page"].getByRole("button", {name: "Ir a lista de ítems"}),
        ).toBeVisible();
        await form.clickIrAListaItems();
    });
};

// ─── PS-3 Producto ───────────────────────────────────────────────────

/**
 * Prepara un producto: iniciar creación → nombre → precios → opciones avanzadas → stock → info adicional.
 * Soporta stock estricto, flexible o sin control.
 */
export const prepararProductoBase = async (
    productoForm: ProductoFormPage,
    nombre: string,
    precios: { venta: string; compra: string },
    opciones?: {
        stockConfig?: StockConfig;
        skipStock?: boolean;
    },
) => {
    await test.step("Preparar producto base", async () => {
        await productoForm.iniciarCreacionProducto();
        await productoForm.llenarNombre(nombre);
        //await productoForm.llenarCodigo(221122); // Este 221122 es para ICBPER // este se puede comentar si no se quiere llenar el código manualmente y esto es para eel ISC(112211) que es el mismo que el código pero se le suma un , si se quiere llenar el código manualmente y crear un producto base  se puede comentar esta línea y descomentar la línea de código que está en el helper de productoForm.llenarCodigo(codigo:number)
        await productoForm.llenarPrecios(precios.venta, precios.compra);
        await productoForm.expandirOpcionesAvanzadas();
        if (opciones?.stockConfig) {
            await productoForm.configurarStock(opciones.stockConfig);
        } else if (!opciones?.skipStock) {
            await productoForm.irATabStock();
        }
    });
};

// ─── PS-3 Combo ──────────────────────────────────────────────────────

/**
 * Prepara un combo: iniciar → nombre → precios → componentes → info adicional.
 */
export const prepararComboBase = async (
    comboForm: ComboFormPage,
    nombre: string,
    precios: { venta: string; compra: string },
    componentes: ComponenteCombo[],
) => {
    await test.step("Preparar combo base", async () => {
        await comboForm.iniciarCreacionCombo();
        await comboForm.llenarNombre(nombre);
        // await comboForm.llenarCodigo(636363);
        await comboForm.llenarPrecios(precios.venta, precios.compra);
        await comboForm.irATabComponentes();
        for (const comp of componentes) {
            // Resolver código dinámico si se pasó un KEY de factory (ej. PRODUCTO_SIMPLE)
            const codigoResuelto = resolverCodigo(comp.codigoBusqueda);
            const sufijoId = codigoResuelto.includes("-") ? codigoResuelto.split("-")[1] : "";
            
            const compResuelto = {
                ...comp,
                codigoBusqueda: codigoResuelto.replace(/-/g, ""),
                textoSeleccion: sufijoId ? `${comp.textoSeleccion} ${sufijoId}` : comp.textoSeleccion,
                variante: comp.variante && sufijoId ? `${comp.variante} ${sufijoId}` : comp.variante,
                equivalencia: comp.equivalencia // ERP NO le pone sufijo a la equivalencia
            };
            
            await comboForm.buscarYAgregarComponente(compResuelto);
        }
        await comboForm.expandirOpcionesAvanzadas();
        await comboForm.llenarInfoAdicional("AUTO-TEST", "AUTOMATIZADO");
    });
};

// ─── PS-3 Receta ─────────────────────────────────────────────────────

/**
 * Prepara una receta: iniciar → nombre → precios → insumos → info adicional.
 */
export const prepararRecetaBase = async (
    recetaForm: RecetaFormPage,
    nombre: string,
    precios: { venta: string; compra: string },
    insumos: InsumoReceta[],
) => {
    await test.step("Preparar receta base", async () => {
        await recetaForm.iniciarCreacionReceta();
        // await recetaForm.llenarCodigo(332211) // Este código es para crear una receta base con codigo y volver a usarlo
        await recetaForm.llenarNombre(nombre);
        await recetaForm.llenarPrecios(precios.venta, precios.compra);
        await recetaForm.irATabInsumos();
        for (const insumo of insumos) {
            const codigoResuelto = resolverCodigo(insumo.codigoBusqueda);
            const sufijoId = codigoResuelto.includes("-") ? codigoResuelto.split("-")[1] : "";
            
            const insumoResuelto = {
                ...insumo,
                codigoBusqueda: codigoResuelto.replace(/-/g, ""),
                textoSeleccion: sufijoId ? `${insumo.textoSeleccion} ${sufijoId}` : insumo.textoSeleccion,
                variante: insumo.variante && sufijoId ? `${insumo.variante} ${sufijoId}` : insumo.variante,
                equivalencia: insumo.equivalencia // ERP NO le pone sufijo a la equivalencia
            };
            
            await recetaForm.buscarYAgregarInsumo(insumoResuelto);
        }
        await recetaForm.expandirOpcionesAvanzadas();
        await recetaForm.llenarInfoAdicional("AUTO-TEST", "AUTOMATIZADO");
    });
};

// ─── PS-3 Lista ──────────────────────────────────────────────────────

/**
 * Prepara una lista: iniciar → nombre → descripción → productos.
 */
export const prepararListaBase = async (
    listaForm: ListaFormPage,
    nombre: string,
    descripcion: string,
    productos: ProductoListaItem[],
) => {
    await test.step("Preparar lista base", async () => {
        await listaForm.iniciarCreacionLista();
        await listaForm.llenarNombre(nombre);
        // await listaForm.llenarCodigo(434344); // Este código es para crear una lista base con codigo y volver a usarlo Solo aplica una vez por cuenta 443444
        await listaForm.llenarDescripcion(descripcion);
        for (const prod of productos) {
            const codigoResuelto = resolverCodigo(prod.codigoBusqueda);
            const sufijoId = codigoResuelto.includes("-") ? codigoResuelto.split("-")[1] : "";
            
            const prodResuelto = {
                ...prod,
                codigoBusqueda: codigoResuelto.replace(/-/g, ""),
                textoSeleccion: sufijoId ? `${prod.textoSeleccion} ${sufijoId}` : prod.textoSeleccion,
                variante: prod.variante && sufijoId ? `${prod.variante} ${sufijoId}` : prod.variante,
                equivalencia: prod.equivalencia // ERP NO le pone sufijo a la equivalencia
            };
            
            await listaForm.buscarYAgregarProducto(prodResuelto);
        }
    });
};

// ─── PS-2 Carga Masiva ───────────────────────────────────────────────

/**
 * Flujo completo de test de carga masiva:
 * buildExcel → ejecutar carga → verificar éxito → ir inicio → buscar item → verificar en tabla → cleanup.
 */
export const ejecutarTestCargaMasiva = async (
    page: Page,
    cargaMasiva: CargaMasivaPage,
    tipoItem: string,
    config: { cardLabel: string },
    usarAutoRemapeo: boolean = false,
) => {

    let tempFilePath = "";
    let textoBusqueda = "";

    await test.step("Preparar Excel con nombre único", async () => {
        const result = await buildMassiveExcel(tipoItem as any, "masivo");
        tempFilePath = result.tempFilePath;
        textoBusqueda = result.textoBusqueda;
        console.log(`  → Nombre generado: ${result.nombreGenerado}`);
    });

    await test.step(`Seleccionar tipo ${config.cardLabel} y subir archivo`, async () => {
        if (usarAutoRemapeo) {
            await cargaMasiva.ejecutarFlujoCargaMasivaProductosConAutoRemapeo(
                config.cardLabel,
                tempFilePath,
            );
        } else {
            await cargaMasiva.ejecutarFlujoCargaMasiva(
                config.cardLabel,
                tempFilePath,
            );
        }
    });

    await test.step("Verificar que la carga finalizó correctamente", async () => {
        await expect(
            page.getByRole("button", {name: "Ir al inicio"}),
        ).toBeVisible({
            timeout: 30_000,
        });
    });

    await test.step("Volver al inicio", async () => {
        await cargaMasiva.clickIrAlInicio();
    });

    await test.step("Verificar item creado buscando por nombre en la lista", async () => {
        await page
            .getByRole("textbox", {name: "Buscar por nombre, código o c"})
            .click();
        await page
            .getByRole("textbox", {name: "Buscar por nombre, código o c"})
            .fill(textoBusqueda);
        await page
            .locator(
                '[id="lgt_items_cmp-filtro-items:filtro:filtro_section_v-input:button_search"]',
            )
            .click();
        await page.waitForLoadState("networkidle");

        await expect(
            page.getByRole("table").getByText(textoBusqueda).first(),
        ).toBeAttached({timeout: 15_000});
    });

    cleanupTempFile(tempFilePath);
};
