import {test} from "@fixtures/Logistica/items-fixture";
import {buildUniqueItemName} from "@helpers/Logistica/unique-name.helper";
import {
    confirmarCreacionEIrALista,
    prepararProductoBase,
} from "@helpers/Logistica/verificaciones-items.helper";
import type {StockConfig} from "@app-types/item-data.types";

interface CasoPrueba {
    id: string;
    tag: string;
    desc: string;
    precios: { venta: string; compra: string };
    stock: StockConfig;
    equivalencia: { nombre: string; factor: number; precioVenta: string; precioCompra: string };
}

const casos: CasoPrueba[] = [
    {
        id: "15", tag: "@PS-03.15", desc: "sin control",
        precios: {venta: "25", compra: "15"},
        stock: {tipo: "sin_control"},
        equivalencia: {nombre: "Pack 6 unidades", factor: 6, precioVenta: "120", precioCompra: "80"},
    },
    {
        id: "16", tag: "@PS-03.16", desc: "flexible",
        precios: {venta: "30", compra: "20"},
        stock: {tipo: "flexible", cantidadMaxima: "300", cantidadMinima: "5"},
        equivalencia: {nombre: "Pack 6 unidades", factor: 6, precioVenta: "150", precioCompra: "100"},
    },
    {
        id: "17", tag: "@PS-03.17", desc: "estricto",
        precios: {venta: "40", compra: "25"},
        stock: {tipo: "estricto", cantidadMaxima: "200", cantidadMinima: "10"},
        equivalencia: {nombre: "Caja x 12", factor: 12, precioVenta: "400", precioCompra: "250"},
    },
];

test.describe("PS-03 | Creación de Productos con Equivalencias — Control de Stock", () => {

    casos.forEach(({id, tag, desc, precios, stock, equivalencia}) => {
        test(`SC-${id}: crear producto con equivalencia — stock ${desc} ${tag}`, async ({
                                                                                  productoForm,
                                                                                  itemDetail,
                                                                              }) => {
            const nombre = buildUniqueItemName("producto", `equiv ${desc}`);

            await prepararProductoBase(productoForm, nombre, precios, {stockConfig: stock});

            await test.step("Configurar equivalencia", async () => {
                await productoForm.crearEquivalencia({
                    nombre: equivalencia.nombre,
                    factor: equivalencia.factor,
                    tipoAfectacion: "Gravado",
                    precioVenta: equivalencia.precioVenta,
                    precioCompra: equivalencia.precioCompra,
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
        });
    });
});
