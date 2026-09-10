import {test} from "@playwright/test";
import type {ProductoFormPage} from "@pages/Logistica/ProductoFormPage";
import type {ItemDetailPage} from "@pages/Logistica/ItemDetailPage";
import {buildUniqueItemName} from "@helpers/Logistica/unique-name.helper";
import {
    confirmarCreacionEIrALista,
    prepararProductoBase,
} from "@helpers/Logistica/verificaciones-items.helper";
import type {CasoVariantesStock} from "@data/Logistica/productos-stock/variantes-stock.data";
import {TEMP_OPCIONES} from "@data/Logistica/productos-stock/variantes-stock.data";

interface Pages {
    productoForm: ProductoFormPage;
    itemDetail: ItemDetailPage;
}

export async function crearProductoConVariantes(
    pages: Pages,
    caso: CasoVariantesStock,
): Promise<void> {
    const {productoForm, itemDetail} = pages;
    const nombre = buildUniqueItemName("producto", `variantes ${caso.desc}`);
    const nomTemp = `temp-sc-${caso.id}`;

    await prepararProductoBase(
        productoForm,
        nombre,
        caso.precios,
        caso.stock ? {stockConfig: caso.stock} : undefined,
    );

    await test.step("1. Crear atributo temporal", async () => {
        await productoForm.irATabVariantes();
        await productoForm.crearAtributoVariante(nomTemp, [...TEMP_OPCIONES]);
    });

    await test.step("2. Borrar atributo creado", async () => {
        await productoForm.eliminarAtributoCreado(nomTemp);
    });

    await test.step("3. Agregar variantes con atributos existentes", async () => {
        await productoForm.agregarVariante(
            0, "Variante 1",
            caso.stock ? {cantidadMaxima: "100", cantidadMinima: "5"} : undefined,
        );
        await productoForm.agregarVariante(
            1, "Variante 2",
            caso.stock ? {cantidadMaxima: "200", cantidadMinima: "10"} : undefined,
        );
    });

    await test.step("Llenar información adicional", async () => {
        await productoForm.llenarInfoAdicional(
            "REGRESION",
            "AUTO-TEST",
            "AUTOMATIZADO",
        );
    });

    await confirmarCreacionEIrALista(productoForm, () =>
        productoForm.crearProducto(),
    );

    await test.step("Verificar item creado con variantes", async () => {
        await itemDetail.verificarItemCompleto({
            verificarVentas: true,
            verificarCompras: true,
            verificarBitacora: true,
        });
    });
}
