import {test} from "@fixtures/Logistica/items-fixture";
import {CASOS_EQUIVALENCIA_STOCK} from "@data/Logistica/productos-stock/equivalencias-stock.data";
import {crearProductoConEquivalencia} from "@flows/Logistica/productos-stock/crear-producto-equivalencia.flow";

test.describe("PS-03 | Creación de Productos con Equivalencias — Control de Stock", () => {

    for (const caso of CASOS_EQUIVALENCIA_STOCK) {
        test(caso.titulo, async ({productoForm, itemDetail}) => {
            await crearProductoConEquivalencia({productoForm, itemDetail}, caso);
        });
    }
});
