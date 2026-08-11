import {test} from "@fixtures/Logistica/items-fixture";
import {CASOS_VARIANTES_STOCK} from "@data/Logistica/productos-stock/variantes-stock.data";
import {crearProductoConVariantes} from "@flows/Logistica/productos-stock/crear-producto-variantes.flow";

test.describe("PS-03 | Variantes — crear/borrar atributo y agregar variantes", () => {

    for (const caso of CASOS_VARIANTES_STOCK) {
        test(caso.titulo, async ({productoForm, itemDetail}) => {
            await crearProductoConVariantes({productoForm, itemDetail}, caso);
        });
    }
});
