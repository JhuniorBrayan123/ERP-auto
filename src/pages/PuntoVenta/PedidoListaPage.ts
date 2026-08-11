import {type Locator, type Page} from '@playwright/test';
import {esperarCargaOverlay} from "@utils/wait-helpers";

export class PedidoListaPage {
    constructor(private readonly page: Page) {
    }

    private get btnBuscarPedidos(): Locator {
        return this.page.getByRole('button', {name: 'Buscar pedidos'});
    }

    private get btnListarPedidos(): Locator {
        return this.page.getByText('Ver todos');
    }


    private get inputNroPedido(): Locator {
        return this.page.getByRole('textbox', {name: 'N° de pedido'});
    }

    private get dropdownOpciones(): Locator {
        return this.page.locator('[id="pv_punto-venta_cmp-pedido_cmp-lista-pedido_cmp-dropdown:opciones-pedido"]');
    }

    private get btnVerPedido(): Locator {
        return this.page.getByText('Ver pedido');
    }

    private get btnCargarPedido(): Locator {
        return this.page.getByText('Cargar pedido');
    }

    async clickBuscarPedidos(): Promise<void> {
        await this.btnBuscarPedidos.click();
    }

    async clickVerTodos(): Promise<void> {
        await this.btnListarPedidos.click();
        await esperarCargaOverlay(this.page)
    }

    async filtrarPorNroPedido(numero: string): Promise<void> {
        await this.inputNroPedido.click();
        await this.inputNroPedido.fill(numero);

        await this.page.waitForTimeout(800);
    }

    async abrirOpcionesPedido(): Promise<void> {
        await this.dropdownOpciones.first().click();
    }

    async clickVerPedido(): Promise<Page> {
        const popupPromise = this.page.waitForEvent('popup');
        await this.btnVerPedido.click();
        return popupPromise;
    }

    async clickCargarPedido(): Promise<void> {
        await this.btnCargarPedido.click();
    }
}
