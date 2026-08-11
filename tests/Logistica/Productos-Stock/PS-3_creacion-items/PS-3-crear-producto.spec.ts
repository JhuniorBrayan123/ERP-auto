import {test} from "@fixtures/Logistica/items-fixture";
import {buildUniqueItemName} from "@helpers/Logistica/unique-name.helper";
import {confirmarCreacionEIrALista, prepararProductoBase,} from "@helpers/Logistica/verificaciones-items.helper";

test.describe(
    "PS-03 | Creación de Productos",
    {tag: ["@logistica", "@productos-stock"]},
    () => {
        test("SC-01: crear producto gravado con control estricto @PS-03.1", async ({
                                                                             productoForm,
                                                                             itemDetail,
                                                                         }) => {
            const nombre = buildUniqueItemName("producto", "gravado estricto");
            await prepararProductoBase(
                productoForm,
                nombre,
                {venta: "10", compra: "10"},
                {
                    stockConfig: {
                        tipo: "estricto",
                        cantidadMaxima: "1001",
                        cantidadMinima: "100",
                    },
                },
            );
            await test.step("Llenar información adicional", async () => {
                await productoForm.llenarInfoAdicional(
                    "REGRESION",
                    "AUTO-TEST",
                    "AUTOMATIZADO",
                );
            });
            await test.step("Llenar campos adicionales", async () => {
                await productoForm.irATabCamposAdicionales();
                await productoForm.llenarCampoAdicionalTexto("item Automatizado");
                
                await productoForm.llenarCampoAdicionalNumerico("1");
            });
            await confirmarCreacionEIrALista(productoForm, () =>
                productoForm.crearProducto(),
            );
            await test.step("Verificar item creado en detalle", async () => {
                await itemDetail.verificarItemCompleto({
                    verificarVentas: true,
                    verificarCompras: true,
                    verificarBitacora: true,
                });
            });
        });

        test("SC-02: crear producto gravado sin control de stock @PS-03.2", async ({
                                                                             productoForm,
                                                                             itemDetail,
                                                                         }) => {
            const nombre = buildUniqueItemName("producto", "gravado sin control");

            await prepararProductoBase(
                productoForm,
                nombre,
                {venta: "10", compra: "10"},
                {skipStock: true},
            );

            await test.step("Configurar sin stock + info adicional", async () => {
                await productoForm.irATabStock();
                
                await productoForm.llenarInfoAdicional(
                    "REGRESION",
                    "AUTO-TEST",
                    "AUTOMATIZADO",
                );
            });

            await confirmarCreacionEIrALista(productoForm, () =>
                productoForm.crearProducto(),
            );

            await test.step("Verificar bitácora", async () => {
                await itemDetail.verificarItemDesdeMenu({verificarBitacora: true});
            });
        });

        test("SC-03: crear producto gravado con control flexible @PS-03.3", async ({
                                                                             productoForm,
                                                                             itemDetail,
                                                                         }) => {
            const nombre = buildUniqueItemName("producto", "gravado flexible");

            await prepararProductoBase(
                productoForm,
                nombre,
                {venta: "11.25", compra: "11.25"},
                {
                    stockConfig: {
                        tipo: "flexible",
                        cantidadMaxima: "101",
                        cantidadMinima: "10",
                    },
                },
            );

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

            await test.step("Verificar item completo", async () => {
                await itemDetail.verificarItemCompleto({
                    verificarVentas: true,
                    verificarCompras: true,
                    verificarBitacora: true,
                });
            });
        });

        test("SC-04: crear producto exonerado con control estricto @PS-03.4", async ({
                                                                               productoForm,
                                                                               itemDetail,
                                                                           }) => {
            const nombre = buildUniqueItemName("producto", "exonerado estricto");

            await prepararProductoBase(
                productoForm,
                nombre,
                {venta: "12.22", compra: "15.25"},
                {
                    stockConfig: {
                        tipo: "estricto",
                        cantidadMaxima: "11",
                        cantidadMinima: "11",
                    },
                },
            );

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

            await test.step("Verificar item completo", async () => {
                await itemDetail.verificarItemCompleto({
                    verificarVentas: true,
                    verificarCompras: true,
                    verificarBitacora: true,
                });
            });
        });

        test("SC-05: crear producto con ICBPER @PS-03.5", async ({
                                                           productoForm,
                                                           itemDetail,
                                                       }) => {
            const nombre = buildUniqueItemName("producto", "con ICBPER");

            await prepararProductoBase(
                productoForm,
                nombre,
                {venta: "10", compra: "10"},
                {skipStock: true},
            );

            await test.step("Configurar stock flexible + info adicional", async () => {
                await productoForm.irATabStock();
                await productoForm.seleccionarControlStock("flexible");
                await productoForm.llenarInfoAdicional(
                    "REGRESION",
                    "AUTO-TEST",
                    "AUTOMATIZADO",
                );
            });

            await test.step("Activar ICBPER", async () => {
                await productoForm.activarICBPER();
            });

            await confirmarCreacionEIrALista(productoForm, () =>
                productoForm.crearProducto(),
            );

            await test.step("Verificar item", async () => {
                await itemDetail.verificarItemCompleto({verificarBitacora: true});
            });
        });

        test("SC-06: crear producto con ISC sistema al valor @PS-03.6", async ({
                                                                         productoForm,
                                                                         itemDetail,
                                                                     }) => {
            const nombre = buildUniqueItemName("producto", "con ISC valor");

            await prepararProductoBase(
                productoForm,
                nombre,
                {venta: "15", compra: "15.25"},
                {skipStock: true},
            );

            await test.step("Configurar stock flexible + info adicional", async () => {
                await productoForm.irATabStock();
                await productoForm.seleccionarControlStock("flexible");
                await productoForm.llenarInfoAdicional(
                    "REGRESION",
                    "AUTO-TEST",
                    "AUTOMATIZADO",
                );
            });

            await test.step("Configurar ISC sistema al valor", async () => {
                await productoForm.configurarISC({
                    tipoSistema: "Sistema al valor",
                    monto: "2.5",
                });
            });

            await confirmarCreacionEIrALista(productoForm, () =>
                productoForm.crearProducto(),
            );

            await test.step("Verificar item en detalle", async () => {
                await itemDetail.verificarItemDesdeMenu({
                    verificarVentas: true,
                    verificarCompras: true,
                    verificarBitacora: true,
                });
            });
        });

        test("SC-07: crear producto con ISC monto fijo @PS-03.7", async ({
                                                                   productoForm,
                                                                   itemDetail,
                                                               }) => {
            const nombre = buildUniqueItemName("producto", "con ISC fijo");

            await prepararProductoBase(
                productoForm,
                nombre,
                {venta: "11.52", compra: "3.5"},
                {skipStock: true},
            );

            await test.step("Configurar stock flexible + info adicional", async () => {
                await productoForm.irATabStock();
                await productoForm.seleccionarControlStock("flexible");
                await productoForm.llenarInfoAdicional(
                    "REGRESION",
                    "AUTO-TEST",
                    "AUTOMATIZADO",
                );
            });

            await test.step("Configurar ISC monto fijo", async () => {
                await productoForm.configurarISC({
                    tipoSistema: "Aplicación al monto fijo",
                    monto: "1.5",
                });
            });

            await confirmarCreacionEIrALista(productoForm, () =>
                productoForm.crearProducto(),
            );

            await test.step("Verificar item completo", async () => {
                await itemDetail.verificarItemCompleto({
                    verificarVentas: true,
                    verificarCompras: true,
                    verificarBitacora: true,
                });
            });
        });
        test("SC-08: crear producto gravado con control estricto solo un almacen @PS-03.8", async ({
                                                                                             productoForm,
                                                                                             itemDetail,
                                                                                         }) => {
            const nombre = buildUniqueItemName("producto", "gravado estricto");
            await prepararProductoBase(
                productoForm,
                nombre,
                {venta: "10", compra: "10"},
                {
                    stockConfig: {
                        tipo: "estricto",
                        cantidadMaxima: "10",
                        cantidadMinima: "10",
                    },
                },
            );
            await test.step("Llenar información adicional", async () => {
                await productoForm.llenarInfoAdicional(
                    "REGRESION",
                    "AUTO-TEST",
                    "AUTOMATIZADO",
                );
            });
            await test.step("Llenar campos adicionales", async () => {
                await productoForm.irATabCamposAdicionales();
                await productoForm.llenarCampoAdicionalTexto("item Automatizado");
                
                await productoForm.llenarCampoAdicionalNumerico("1");
            });
            await confirmarCreacionEIrALista(productoForm, () =>
                productoForm.crearProducto(),
            );
            await test.step("Verificar item creado en detalle", async () => {
                await itemDetail.verificarItemCompleto({
                    verificarVentas: true,
                    verificarCompras: true,
                    verificarBitacora: true,
                });
            });
        });

    },
);
