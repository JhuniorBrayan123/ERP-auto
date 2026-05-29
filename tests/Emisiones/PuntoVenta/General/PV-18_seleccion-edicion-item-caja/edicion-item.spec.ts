import {expect, test} from "@playwright/test";
import {Cajero} from "../../../../../src/actors/cajero";
import {IniciarVentaEnCaja} from "@task/PuntoVenta/IniciarVentaEnCaja";
import {EditarPrecioDeItem} from "@task/PuntoVenta/EditarPrecioDeItem.task";
import {IntentarPrecioInvalido} from "@task/PuntoVenta/IntentarPrecioInvalido.task";
import {AbrirTotales} from "../../../../../src/interactions/PuntoVenta/AbrirTotales";
import {DesplegarPanelCalculos} from "../../../../../src/interactions/PuntoVenta/DesplegarPanelCalculos";
import {CerrarTotales} from "../../../../../src/interactions/PuntoVenta/CerrarTotales";
import {ClickAceptarModal} from "../../../../../src/interactions/PuntoVenta/ClickAceptarModal";
import {MensajeVisible} from "@question/PuntoVenta/MensajeVisible";
import {ITEMS_PV} from "@helpers/PuntoVenta/emision-data.helper";
import {EmisionPage} from "@pages/PuntoVenta/EmisionPage";
import {calcularTotales} from "@utils/calculadora-impuestos";
import {validarCamposEspecificos, validarTotales} from "@utils/validar-totales";

test.describe("Selección, edición de ítem en caja de venta — Edición de ítem", {tag: ['@punto-venta', '@seleccion-edicion-item', '@edicion-item']}, () => {
    test.beforeEach(async ({page}) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(IniciarVentaEnCaja());
    });

    test("SC-22: Editar el precio unitario de un ítem en el carrito @PV-18.22", async ({
                                                                                 page,
                                                                             }) => {
        const cajero = Cajero.con(page);
        const emision = new EmisionPage(page);
        const nuevoPrecio = 20;

        await cajero.intentaRealizar(
            EditarPrecioDeItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL, String(nuevoPrecio)),
        );

        const esperados = calcularTotales(nuevoPrecio);

        await cajero.intentaRealizar(AbrirTotales());
        const popupTotales = await emision.capturarTotalesPopup();
        validarCamposEspecificos(popupTotales, [
            {label: "Operaciones Gravadas", esperado: esperados.baseImponible},
        ]);
        await cajero.intentaRealizar(CerrarTotales());

        const resumen = await emision.capturarResumenPedido();
        validarTotales(resumen, esperados);
    });

    test("SC-23: Bloquear edición con precio inválido @PV-18.23", async ({page}) => {
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

    test("SC-24: Editar el nombre de un producto en el carrito @PV-18.24", async ({
                                                                            page,
                                                                        }) => {
        const cajero = Cajero.con(page);
        const emision = new EmisionPage(page);
        await emision.buscarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.codigo);
        await emision.seleccionarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.nombre);

        await cajero.intentaRealizar(DesplegarPanelCalculos());
        const totalesAntes = await emision.capturarResumenPedido();
        console.log('[SC-24] Totales antes de editar nombre:', totalesAntes);
        await emision.abrirEdicionItem();
        const inputDescripcion = page.locator('[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-item:item_v-input:descripcion"]');
        await inputDescripcion.fill("Nombre de item editado");
        await emision.cerrarEdicionItem();

        const totalesDespues = await emision.capturarResumenPedido();
        console.log('[SC-24] Totales después de editar nombre:', totalesDespues);

        expect(totalesDespues['Subtotal']).toBe(totalesAntes['Subtotal']);
        expect(totalesDespues['IGV']).toBe(totalesAntes['IGV']);
        expect(totalesDespues['Total']).toBe(totalesAntes['Total']);
    });
});
