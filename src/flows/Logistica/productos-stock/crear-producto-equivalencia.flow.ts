import {test} from "@playwright/test";
import type {ProductoFormPage} from "@pages/Logistica/ProductoFormPage";
import type {ItemDetailPage} from "@pages/Logistica/ItemDetailPage";
import {buildUniqueItemName} from "@helpers/Logistica/unique-name.helper";
import {
    confirmarCreacionEIrALista,
    prepararProductoBase,
} from "@helpers/Logistica/verificaciones-items.helper";
import type {CasoEquivalenciaStock} from "@data/Logistica/productos-stock/equivalencias-stock.data";

interface Pages {
    productoForm: ProductoFormPage;
    itemDetail: ItemDetailPage;
}

export async function crearProductoConEquivalencia(
    pages: Pages,
    caso: CasoEquivalenciaStock,
): Promise<void> {
    const {productoForm, itemDetail} = pages;
    const nombre = buildUniqueItemName("producto", `equiv ${caso.desc}`);

    await prepararProductoBase(productoForm, nombre, caso.precios, {
        stockConfig: caso.stock,
    });

    await test.step("Configurar equivalencia", async () => {
        await productoForm.crearEquivalencia({
            nombre: caso.equivalencia.nombre,
            factor: caso.equivalencia.factor,
            tipoAfectacion: "Gravado",
            precioVenta: caso.equivalencia.precioVenta,
            precioCompra: caso.equivalencia.precioCompra,
            esPrimera: true,
        });
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

    await test.step("Verificar item creado", async () => {
        await itemDetail.verificarItemCompleto({
            verificarVentas: true,
            verificarCompras: true,
            verificarBitacora: true,
        });
    });
}
