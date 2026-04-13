import {type Page} from '@playwright/test';

/**
 * Navegación específica entre submódulos de Logística > Movimientos.
 *
 * Encapsula la navegación lateral del ERP:
 * - Productos y servicios → Ingresos / Salidas / Ajustes / Traslados
 * - Productos y servicios → Stock de productos
 * - Productos y servicios → Kardex total
 * - Productos y servicios → Búsqueda de ítems (Productos / Insumos)
 *
 * Los IDs de los selectores del menú son estables y propios del ERP.
 */
export class MovimientosNavigationPage {
    constructor(private readonly page: Page) {
    }

    // ─── Menú principal ─────────────────────────────────────────

    /** Click en "Productos y servicios" del menú lateral */
    private async clickProductosYServicios(): Promise<void> {
        await this.page.getByText('Productos y servicios').first().click();
    }

    // ─── Submódulos de Movimientos ──────────────────────────────

    /** Navega a Logística > Ingresos */
    async navegarAIngresos(): Promise<void> {
        await this.clickProductosYServicios();
        await this.page.getByText('Ingresos', {exact: true}).click();
    }

    /** Navega a Logística > Salidas */
    async navegarASalidas(): Promise<void> {
        await this.clickProductosYServicios();
        await this.page.locator('.v-popu, .popup-container, nav')
            .getByText('Salidas', {exact: true})
            .first()
            .click();
    }

    /** Navega a Logística > Ajustes */
    async navegarAAjustes(): Promise<void> {
        await this.clickProductosYServicios();
        await this.page.getByText('Ajustes').click();
    }

    /** Navega a Logística > Traslados */
    async navegarATraslados(): Promise<void> {
        await this.clickProductosYServicios();
        await this.page.getByText('Traslados', {exact: true}).click();
    }

    // ─── Submódulos de Verificación ─────────────────────────────

    /** Navega a Productos y servicios > Stock de productos */
    async navegarAStockProductos(): Promise<void> {
        await this.clickProductosYServicios();
        await this.page.getByText('Stock de productos').click();
    }

    /** Navega a Productos y servicios > Kardex total */
    async navegarAKardexTotal(): Promise<void> {
        await this.clickProductosYServicios();
        await this.page.getByText('Kardex total').click();
    }

    // ─── Submódulos de Ítems (para movimientos rápidos) ─────────

    /** Navega a Logística > Búsqueda de ítems (Productos) */
    async navegarAItemsProductos(): Promise<void> {
        await this.clickProductosYServicios();
        await this.page
            .locator('[id="nvg_selects_cmp-header-selects_select:select-module-203-item-2007"]')
            .click();
    }

    /** Navega a Logística > Insumos (usando ID de menú) */
    async navegarAItemsInsumos(): Promise<void> {
        await this.clickProductosYServicios();
        await this.page
            .locator('[id="nvg_selects_cmp-header-selects_select:select-module-202-item-2006"]')
            .click();
    }

    /** Navega a Ingresos usando el ID de menú directamente */
    async navegarAIngresosDesdeMenu(): Promise<void> {
        await this.clickProductosYServicios();
        await this.page
            .locator('[id="nvg_selects_cmp-header-selects_select:select-module-204-item-2008"]')
            .click();
    }

    /** Navega a Salidas usando el ID de menú directamente */
    async navegarASalidasDesdeMenu(): Promise<void> {
        await this.clickProductosYServicios();
        await this.page
            .locator('[id="nvg_selects_cmp-header-selects_select:select-module-204-item-2009"]')
            .click();
    }

    /** Navega a Ajustes usando el ID de menú directamente */
    async navegarAAjustesDesdeMenu(): Promise<void> {
        await this.clickProductosYServicios();
        await this.page
            .locator('[id="nvg_selects_cmp-header-selects_select:select-module-204-item-2011"]')
            .click();
    }

    // ─── Configuración (para traslado por confirmar) ────────────

    /** Navega a Configuración > Sistema > Sucursales (URL directa) */
    async navegarAConfiguracionSucursales(): Promise<void> {
        const baseUrl = process.env.BASE_URL || '';
        await this.page.goto(`${baseUrl}configuracion/sistema/sucursales`);
    }
}
