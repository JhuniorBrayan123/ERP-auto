import { type Locator, type Page } from '@playwright/test';

export class CotizacionOpcionesPage {
    constructor(private readonly page: Page) {}

    // ─── Toggles de Cotización ────────────────────────────────────────

    private get toggleIncluirImagenes(): Locator {
        return this.page.locator('label').filter({ hasText: 'Incluir imágenes' });
    }

    private get toggleIncluirDescripcion(): Locator {
        return this.page.locator('label').filter({ hasText: 'Incluir descripción' });
    }

    async activarIncluirImagenes(): Promise<void> {
        // En el codegen, el click se hace en el label del switch
        await this.toggleIncluirImagenes.click();
    }

    async activarIncluirDescripcion(): Promise<void> {
        await this.toggleIncluirDescripcion.click();
    }

    // ─── Vigencia de Oferta ───────────────────────────────────────────

    private get selectorVigencia(): Locator {
        // En el codegen se usa un texto como "0 días", pero busquemos un placeholder más general si existe.
        // Si no, el dropdown de días por defecto muestra "0 días" al empezar.
        return this.page.locator('div').filter({ hasText: /^0 días$/ }).nth(1);
    }

    async seleccionarVigencia(dias: string): Promise<void> {
        // El dropdown dice "0 días", le damos click para abrir y luego click en "40 días" o el texto exacto
        await this.selectorVigencia.click();
        await this.page.getByText(dias, { exact: true }).click();
    }
}
