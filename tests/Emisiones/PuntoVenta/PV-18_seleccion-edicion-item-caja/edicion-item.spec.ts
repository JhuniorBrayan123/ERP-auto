import { expect, test } from "@playwright/test";
import { Cajero } from "../../../../src/actors/cajero";
import { IniciarVentaEnCaja } from "@task/PuntoVenta/IniciarVentaEnCaja";
import { EditarPrecioDeItem } from "@task/PuntoVenta/EditarPrecioDeItem.task";
import { IntentarPrecioInvalido } from "@task/PuntoVenta/IntentarPrecioInvalido.task";
import { EditarNombreDeItem } from "@task/PuntoVenta/EditarNombreDeItem.task";
import { AbrirTotales } from "../../../../src/interactions/PuntoVenta/AbrirTotales";
import { CerrarTotales } from "../../../../src/interactions/PuntoVenta/CerrarTotales";
import { ClickAceptarModal } from "../../../../src/interactions/PuntoVenta/ClickAceptarModal";
import { MensajeVisible } from "@question/PuntoVenta/MensajeVisible";
import { ITEMS_PV } from "@helpers/PuntoVenta/emision-data.helper";
import {
  CalculosTotales,
  FilaEnTotales,
} from "@question/PuntoVenta/FilaEnTotales";

test.describe("Selección, edición de ítem en caja de venta — Edición de ítem", () => {
  test.beforeEach(async ({ page }) => {
    const cajero = Cajero.con(page);
    await cajero.intentaRealizar(IniciarVentaEnCaja());
  });

  test("SC-22: Editar el precio unitario de un ítem en el carrito", async ({
    page,
  }) => {
    const cajero = Cajero.con(page);
    await cajero.intentaRealizar(
      EditarPrecioDeItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL, "20"),
    );
    await cajero.intentaRealizar(AbrirTotales());
    expect(
      await cajero.pregunta(FilaEnTotales("Operaciones Gravadas", "16.95")),
    ).toBe(true);
    await cajero.intentaRealizar(CerrarTotales());
    expect(await cajero.pregunta(CalculosTotales("IGV", "S/ 3.05"))).toBe(true);
    expect(await cajero.pregunta(CalculosTotales("Subtotal", "S/ 16.95"))).toBe(
      true,
    );
    expect(
      await cajero.pregunta(CalculosTotales("Descuento global", "S/ 0.00")),
    ).toBe(true);
  });

  test("SC-23: Bloquear edición con precio inválido", async ({ page }) => {
    const cajero = Cajero.con(page);
    await cajero.intentaRealizar(
      IntentarPrecioInvalido(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL, "0.0000."),
    );
    expect(
      await cajero.pregunta(
        MensajeVisible(
          "El valor unitario que se ingresa en la lista de ítems no puede ser negativo ni cero",
        ),
      ),
    ).toBe(true);
    await cajero.intentaRealizar(ClickAceptarModal());
  });

  test("SC-24: Editar el nombre de un producto en el carrito", async ({
    page,
  }) => {
    const cajero = Cajero.con(page);
    await cajero.intentaRealizar(
      EditarNombreDeItem(
        ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL,
        "Nombre de item editado",
      ),
    );
    await cajero.intentaRealizar(AbrirTotales());
    expect(
      await cajero.pregunta(FilaEnTotales("Operaciones Gravadas", "8.69")),
    ).toBe(true);
    await cajero.intentaRealizar(CerrarTotales());
    expect(await cajero.pregunta(CalculosTotales("IGV", "S/ 1.56"))).toBe(true);
    expect(await cajero.pregunta(CalculosTotales("Subtotal", "S/ 8.69"))).toBe(
      true,
    );
  });
});
