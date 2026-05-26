import { type Locator, type Page } from '@playwright/test';
import {esperarCargaOverlay} from "@utils/wait-helpers";

export class PedidoListaPage {
    constructor(private readonly page: Page) {}

    // ─── Locators ─────────────────────────────────────────────────────

    private get btnBuscarPedidos(): Locator {
        return this.page.getByRole('button', { name: 'Buscar pedidos' });
    }

    private get btnVerTodos(): Locator {
        return this.page.getByText('Ver todos');
    }

    private get inputNroPedido(): Locator {
        return this.page.getByRole('textbox', { name: 'N° de pedido' });
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

    // ─── Acciones de Búsqueda y Filtros ───────────────────────────────

    async clickBuscarPedidos(): Promise<void> {
        await this.btnBuscarPedidos.click();
    }

    async clickVerTodos(): Promise<void> {
        await this.btnVerTodos.click();
        await esperarCargaOverlay(this.page)
    }

    async filtrarPorNroPedido(numero: string): Promise<void> {
        await this.inputNroPedido.click();
        await this.inputNroPedido.fill(numero);
        // Esperamos un momento para que el debounce/filtro aplique
        await this.page.waitForTimeout(800);
    }

    // ─── Acciones sobre el Pedido ─────────────────────────────────────

    async abrirOpcionesPedido(): Promise<void> {
        await this.dropdownOpciones.first().click();
    }

    async clickVerPedido(): Promise<void> {
        await this.btnVerPedido.click();
    }

    async clickCargarPedido(): Promise<void> {
        await this.btnCargarPedido.click();
    }
}
