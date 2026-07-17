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
    stock?: StockConfig;
}

const casos: CasoPrueba[] = [
    {
        id: "12", tag: "@PS-03.12", desc: "sin control",
        precios: {venta: "25", compra: "15"},
    },
    {
        id: "13", tag: "@PS-03.13", desc: "flexible",
        precios: {venta: "30", compra: "18"},
        stock: {tipo: "flexible", cantidadMaxima: "500", cantidadMinima: "10"},
    },
    {
        id: "14", tag: "@PS-03.14", desc: "estricto",
        precios: {venta: "35", compra: "22"},
        stock: {tipo: "estricto", cantidadMaxima: "300", cantidadMinima: "5"},
    },
];

const TEMP_OPCIONES = ["opcion 1", "opcion 2", "opcion 3"];

test.describe("PS-03 | Variantes — crear/borrar atributo y agregar variantes", () => {

    casos.forEach(({id, tag, desc, precios, stock}) => {
        test(`SC-${id}: crear y borrar atributo, luego agregar variantes — ${desc} ${tag}`, async ({
                                                                                          productoForm,
                                                                                          itemDetail,
                                                                                      }) => {
            const nombre = buildUniqueItemName("producto", `variantes ${desc}`);
            const nomTemp = `temp-sc-${id}`;

            await prepararProductoBase(
                productoForm,
                nombre,
                precios,
                stock ? {stockConfig: stock} : undefined,
            );

            await test.step("1. Crear atributo temporal", async () => {
                await productoForm.irATabVariantes();
                await productoForm.crearAtributoVariante(nomTemp, TEMP_OPCIONES);
            });

            await test.step("2. Borrar atributo creado", async () => {
                await productoForm.eliminarAtributoCreado(nomTemp);
            });

            await test.step("3. Agregar variantes con atributos existentes", async () => {
                await productoForm.agregarVariante(0, "Variante 1", {
                    cantidadMaxima: "100",
                    cantidadMinima: "5",
                });
                await productoForm.agregarVariante(1, "Variante 2", {
                    cantidadMaxima: "200",
                    cantidadMinima: "10",
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

            await test.step("Verificar item creado con variantes", async () => {
                await itemDetail.verificarItemCompleto({
                    verificarVentas: true,
                    verificarCompras: true,
                    verificarBitacora: true,
                });
            });
        });
    });
});
