import {test} from "@fixtures/Logistica/items-fixture";
import {buildUniqueItemName} from "@helpers/Logistica/unique-name.helper";
import {
    confirmarCreacionEIrALista,
    prepararProductoBase,
} from "@helpers/Logistica/verificaciones-items.helper";

test.describe(
    "PS-03 | Creación de Productos — Variantes y Equivalentes",
    {tag: ["@logistica", "@productos-stock"]},
    () => {

        test("SC-09: crear y borrar atributo, luego agregar variantes @PS-03.9", async ({
                                                                                  productoForm,
                                                                                  itemDetail,
                                                                              }) => {
            const nombre = buildUniqueItemName("producto", "con variantes");
            const nomTemp = buildUniqueItemName("producto", "temp-sc09");

            await prepararProductoBase(
                productoForm,
                nombre,
                {venta: "25", compra: "15"},
                {
                    stockConfig: {
                        tipo: "flexible",
                        cantidadMaxima: "500",
                        cantidadMinima: "10",
                    },
                },
            );

            await test.step("1. Crear atributo temporal", async () => {
                await productoForm.irATabVariantes();
                await productoForm.crearAtributoVariante(nomTemp, ["opcion 1", "opcion 2", "opcion 3"]);
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

        test("SC-10: crear producto con equivalencia y ver en detalle @PS-03.10", async ({
                                                                                  productoForm,
                                                                                  itemDetail,
                                                                              }) => {
            const nombre = buildUniqueItemName("producto", "con equivalencia");

            await prepararProductoBase(
                productoForm,
                nombre,
                {venta: "30", compra: "20"},
                {
                    stockConfig: {
                        tipo: "flexible",
                        cantidadMaxima: "300",
                        cantidadMinima: "5",
                    },
                },
            );

            await test.step("Configurar equivalencia", async () => {
                await productoForm.irATabEquivalencias();

                await productoForm.crearEquivalencia({
                    nombre: "Pack 6 unidades",
                    factor: 6,
                    tipoAfectacion: "Gravado",
                    precioVenta: "150",
                    precioCompra: "100",
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


    },
);
