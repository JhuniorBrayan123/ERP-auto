import {expect, test} from "@playwright/test";
import {Cajero} from "../../../../src/actors/cajero";
import {BuscarYAgregarProducto} from "../../../../src/task/PuntoVenta/BuscarYAgregarProducto";
import {LimpiarCarrito} from "../../../../src/task/PuntoVenta/LimpiarCarrito";
import {TotalDeVenta} from "../../../../src/question/PuntoVenta/TotalVenta";


test('Limpiar carrito reinicia el total a 0.00', async ({page}) => {
    const cajero = Cajero.con(page);
    await cajero.intentaRealizar(BuscarYAgregarProducto('443444'), LimpiarCarrito());
    const total = await cajero.pregunta(TotalDeVenta);
    expect(total).toBe('0.00');
});