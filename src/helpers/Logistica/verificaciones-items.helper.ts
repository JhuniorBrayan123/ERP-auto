import {test} from "@fixtures/Logistica/items-fixture";
import {expect, Page} from "@playwright/test";
import {ItemFormBasePage} from "@pages/Logistica/ItemFormBasePage";
import {ProductoFormPage} from "@pages/Logistica/ProductoFormPage";
import {ComboFormPage} from "@pages/Logistica/ComboFormPage";
import {RecetaFormPage} from "@pages/Logistica/RecetaFormPage";
import {ListaFormPage} from "@pages/Logistica/ListaFormPage";
import {CargaMasivaPage} from "@pages/Logistica/CargaMasivaPage";
import type {ComponenteCombo, InsumoReceta, ProductoListaItem, StockConfig,} from "./item-data.types";
import {getCodigo as resolverCodigo} from "../../factories/item-factory";
import {buildMassiveExcel, cleanupTempFile} from "./masivo-excel.helper";

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

        await productoForm.llenarPrecios(precios.venta, precios.compra);
        await productoForm.expandirOpcionesAvanzadas();
        if (opciones?.stockConfig) {
            await productoForm.configurarStock(opciones.stockConfig);
        } else if (!opciones?.skipStock) {
            await productoForm.irATabStock();
        }
    });
};

export const prepararComboBase = async (
    comboForm: ComboFormPage,
    nombre: string,
    precios: { venta: string; compra: string },
    componentes: ComponenteCombo[],
) => {
    await test.step("Preparar combo base", async () => {
        await comboForm.iniciarCreacionCombo();
        await comboForm.llenarNombre(nombre);

        await comboForm.llenarPrecios(precios.venta, precios.compra);
        await comboForm.irATabComponentes();
        for (const comp of componentes) {

            const codigoResuelto = resolverCodigo(comp.codigoBusqueda);
            const sufijoId = codigoResuelto.includes("-") ? codigoResuelto.split("-")[1] : "";

            const compResuelto = {
                ...comp,
                codigoBusqueda: codigoResuelto.replace(/-/g, ""),
                textoSeleccion: sufijoId ? `${comp.textoSeleccion} ${sufijoId}` : comp.textoSeleccion,
                variante: comp.variante && sufijoId ? `${comp.variante} ${sufijoId}` : comp.variante,
                equivalencia: comp.equivalencia
            };

            await comboForm.buscarYAgregarComponente(compResuelto);
        }
        await comboForm.expandirOpcionesAvanzadas();
        await comboForm.llenarInfoAdicional("AUTO-TEST", "AUTOMATIZADO");
    });
};

export const prepararRecetaBase = async (
    recetaForm: RecetaFormPage,
    nombre: string,
    precios: { venta: string; compra: string },
    insumos: InsumoReceta[],
) => {
    await test.step("Preparar receta base", async () => {
        await recetaForm.iniciarCreacionReceta();

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
                equivalencia: insumo.equivalencia
            };

            await recetaForm.buscarYAgregarInsumo(insumoResuelto);
        }
        await recetaForm.expandirOpcionesAvanzadas();
        await recetaForm.llenarInfoAdicional("AUTO-TEST", "AUTOMATIZADO");
    });
};

export const prepararListaBase = async (
    listaForm: ListaFormPage,
    nombre: string,
    descripcion: string,
    productos: ProductoListaItem[],
) => {
    await test.step("Preparar lista base", async () => {
        await listaForm.iniciarCreacionLista();
        await listaForm.llenarNombre(nombre);

        await listaForm.llenarDescripcion(descripcion);
        for (const prod of productos) {
            const codigoResuelto = resolverCodigo(prod.codigoBusqueda);
            const sufijoId = codigoResuelto.includes("-") ? codigoResuelto.split("-")[1] : "";

            const prodResuelto = {
                ...prod,
                codigoBusqueda: codigoResuelto.replace(/-/g, ""),
                textoSeleccion: sufijoId ? `${prod.textoSeleccion} ${sufijoId}` : prod.textoSeleccion,
                variante: prod.variante && sufijoId ? `${prod.variante} ${sufijoId}` : prod.variante,
                equivalencia: prod.equivalencia
            };

            await listaForm.buscarYAgregarProducto(prodResuelto);
        }
    });
};

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
