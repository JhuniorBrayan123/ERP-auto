/**
 * Page Object para la navegación al módulo de Punto de Venta.
 *
 * Navegación real (del codegen):
 * 1. Click en "Ventas y compras"
 * 2. Click en "Nueva venta"
 * 3. Si la caja requiere apertura → flujo de apertura
 * 4. Si ya está abierta → "Continuar vendiendo"
 */
import { expect, type Page } from '@playwright/test';

export class PuntoVentaNavigationPage {
    constructor(private readonly page: Page) {}

    /** Navega al módulo de Ventas desde el menú principal */
    async navegarAPuntoDeVenta(): Promise<void> {
        await this.page.getByText('Ventas y compras').click();
        await this.page.getByText('Nueva venta', { exact: true }).click();
    }

    /** Si la caja ya está abierta, click en "Continuar vendiendo" */
    async continuarVendiendo(): Promise<void> {
        await this.page.getByRole('button', { name: 'Continuar vendiendo' }).click();
    }

    /** Sale de la caja haciendo click en el ícono back */
    async salirDeCaja(): Promise<void> {
        await this.page.locator('.v-icon-back .icon').click();
    }

    /** Navega al listado de comprobantes emitidos (sale de caja primero) */
    async navegarABusquedaComprobantes(): Promise<void> {
        await this.salirDeCaja();
        await this.page.getByText('Ventas y compras').click();
        await this.page.getByText('Búsqueda de comprobantes').click();
    }

    /** Navega a Stock de productos (para validación cruzada) */
    async navegarAStockProductos(): Promise<void> {
        await this.page.getByText('Productos y servicios').click();
        await this.page.getByText('Stock de productos').click();
    }

    /** Navega a Kardex total (para validación cruzada) */
    async navegarAKardexTotal(): Promise<void> {
        await this.page.getByText('Productos y servicios').click();
        await this.page.getByText('Kardex total').click();
    }

    /** Regresa al PdV después de navegar a otro módulo */
    async volverAPuntoDeVenta(): Promise<void> {
        await this.page.locator('.v-icon-back > .icon').click();
        await this.page.getByText('Ventas y compras').click();
        await this.page.getByText('Nueva venta', { exact: true }).click();
    }
}
