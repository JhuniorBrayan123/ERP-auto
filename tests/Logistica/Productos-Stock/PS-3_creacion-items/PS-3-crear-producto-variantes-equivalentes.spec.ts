import {test} from "@fixtures/Logistica/items-fixture";
import {buildUniqueItemName} from "@helpers/Logistica/unique-name.helper";
import {
    confirmarCreacionEIrALista,
    prepararProductoBase,
} from "@helpers/Logistica/verificaciones-items.helper";

test.describe(
    "PS-03 | Creación de Productos con Variantes y Equivalentes",
    {tag: ["@logistica", "@productos-stock", "@variantes", "@equivalentes"]},
    () => {

        test("SC-09: crear producto con variantes y ver en detalle @PS-03.9", async ({
                                                                              productoForm,
                                                                              itemDetail,
                                                                          }) => {
            const nombre = buildUniqueItemName("producto", "con variantes");

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

            await test.step("Configurar atributo y variantes", async () => {
                await productoForm.irATabVariantes();

                // Crear atributo "Talla" con opciones S, M, L
                await productoForm.crearAtributoVariante("Talla", ["S", "M", "L"]);

                // Agregar variante "Talla S"
                await productoForm.agregarVariante(0, "Talla S", {
                    cantidadMaxima: "100",
                    cantidadMinima: "5",
                });

                // Agregar variante "Talla M"
                await productoForm.agregarVariante(1, "Talla M", {
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

            await test.step("Verificar item creado", async () => {
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
                await productoForm.irATabVariantes();

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

        test("SC-11: crear producto con variantes y equivalencia @PS-03.11", async ({
                                                                              productoForm,
                                                                              itemDetail,
                                                                          }) => {
            const nombre = buildUniqueItemName("producto", "variantes y equivalencia");

            await prepararProductoBase(
                productoForm,
                nombre,
                {venta: "40", compra: "25"},
                {
                    stockConfig: {
                        tipo: "flexible",
                        cantidadMaxima: "400",
                        cantidadMinima: "20",
                    },
                },
            );

            await test.step("Configurar atributo, variantes y equivalencia", async () => {
                await productoForm.irATabVariantes();

                // Crear atributo "Color" con opciones Rojo, Azul
                await productoForm.crearAtributoVariante("Color", ["Rojo", "Azul"]);

                // Agregar variante "Rojo"
                await productoForm.agregarVariante(0, "Rojo", {
                    cantidadMaxima: "200",
                    cantidadMinima: "10",
                });

                // Agregar variante "Azul"
                await productoForm.agregarVariante(1, "Azul", {
                    cantidadMaxima: "200",
                    cantidadMinima: "10",
                });

                // Crear equivalencia
                await productoForm.crearEquivalencia({
                    nombre: "Caja x 12",
                    factor: 12,
                    tipoAfectacion: "Gravado",
                    precioVenta: "400",
                    precioCompra: "250",
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
