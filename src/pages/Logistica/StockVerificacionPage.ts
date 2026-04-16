import {expect, type Page} from '@playwright/test';

/**
 * Page Object para la pantalla de Stock de productos.
 *
 * Responsabilidades:
 * - Buscar ítems por código
 * - Expandir almacenes (click en "Varios*")
 * - Verificar stock comprometido
 * - Abrir Kardex desde stock (popup)
 * - Navegar a variantes dentro de stock
 */
export class StockVerificacionPage {
    constructor(private readonly page: Page) {
    }

    // ─── Búsqueda ───────────────────────────────────────────────

    /** Busca un ítem por código en Stock de productos */
    async buscarPorCodigo(codigo: string): Promise<void> {
        const searchInput = this.page.getByRole('textbox', {name: 'Buscar por nombre, código o c'});
        await searchInput.click();
        await searchInput.fill(codigo);

        // Esperar a que la tabla renderice el ítem antes de proceder a la expansión de almacenes
        await expect(this.page.getByRole('table').getByText(codigo).first()).toBeVisible({timeout: 15000});
    }

    // ─── Almacenes / Expansión ──────────────────────────────────

    /** Click en "Varios*" para expandir almacenes disponibles */
    async clickAlmacenMultiple(): Promise<void> {
        await this.page
            .locator('div')
            .filter({hasText: /^Varios\*$/})
            .first() // Prevenir strict mode violation
            .click();
    }

    /** Click en celda de almacén "Varios*" por row (variante de locator) */
    async clickAlmacenMultipleEnTabla(): Promise<void> {
        await this.page.getByRole('cell', {name: 'Varios*'}).click();
    }

    /** Click en "Varios*" nth(index) para múltiples almacenes */
    async clickAlmacenMultipleNth(index: number): Promise<void> {
        await this.page.getByText('Varios*').nth(index).click();
    }

    /** Click texto "Varios*" en la tabla (por getByText) */
    async clickVariosTexto(): Promise<void> {
        await this.page.getByText('Varios*').first().click(); // Prevenir strict mode violation
    }

    /** Click en un almacén específico en la tabla */
    async clickAlmacenEnTabla(nombre: string): Promise<void> {
        await this.page.getByRole('table').getByText(nombre).click();
    }

    /** Click en "Stock comprometido" */
    async clickStockComprometido(): Promise<void> {
        await this.page.getByText('Stock comprometido').click();
    }

    /** Click en la flecha para expandir stock (.arrow) */
    async clickFlechaExpandir(): Promise<void> {
        await this.page.locator('.arrow').click();
    }

    // ─── Variantes ──────────────────────────────────────────────

    /** Click en una variante específica dentro del stock */
    async clickVariante(nombre: string): Promise<void> {
        await this.page.getByText(nombre).click();
    }

    // ─── Kardex desde stock ─────────────────────────────────────

    /**
     * Abre el Kardex desde Stock de productos (popup).
     * Retorna la referencia a la nueva página.
     */
    async abrirKardexDesdeStock(): Promise<Page> {
        const popupPromise = this.page.waitForEvent('popup');
        await this.page.getByRole('button', {name: 'Ver Kardex'}).first().click();
        return popupPromise;
    }

    /**
     * Abre el Kardex de un almacén específico por fila.
     * Útil cuando existen múltiples almacenes expandidos ("Varios*").
     */
    async abrirKardexPorAlmacen(nombreAlmacen: string): Promise<Page> {
        const popupPromise = this.page.waitForEvent('popup');
        await this.page.getByRole('row').filter({hasText: new RegExp(nombreAlmacen, 'i')}).getByRole('button', {name: 'Ver Kardex'}).first().click();
        return popupPromise;
    }

    /**
     * Abre el Kardex de una variante por fila con botón.
     * Retorna la referencia al popup.
     */
    async abrirKardexVariante(rowName: string): Promise<Page> {
        const popupPromise = this.page.waitForEvent('popup');
        await this.page.getByRole('row', {name: rowName}).getByRole('button').click();
        return popupPromise;
    }
}
