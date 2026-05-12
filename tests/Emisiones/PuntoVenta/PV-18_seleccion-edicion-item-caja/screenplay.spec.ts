import {expect, test} from "@playwright/test";
import {Cajero} from "../../../../src/actors/cajero";
import {IniciarVentaEnCaja} from "@task/PuntoVenta/IniciarVentaEnCaja";
import {BuscarYAgregarProducto} from "@task/PuntoVenta/BuscarYAgregarProducto";
import {LimpiarCarrito} from "@task/PuntoVenta/LimpiarCarrito";
import {TotalDeVenta} from "@question/PuntoVenta/TotalVenta";

test('Limpiar carrito reinicia el total a 0.00', async ({page}) => {
    const cajero = Cajero.con(page);
    await cajero.intentaRealizar(IniciarVentaEnCaja(), BuscarYAgregarProducto('443444'), LimpiarCarrito());
    const total = await cajero.pregunta(TotalDeVenta);
    expect(total).toBe('0.00');
});