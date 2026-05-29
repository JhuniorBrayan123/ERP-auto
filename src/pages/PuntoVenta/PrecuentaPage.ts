import { expect, type Page } from '@playwright/test';

export class PrecuentaPage {
    constructor(private readonly page: Page) {}

    async abrirPrecuenta(): Promise<void> {
        await this.page.getByRole('button', { name: 'PRECUENTA' }).click();
    }

    async abrirVistaPrevia(): Promise<void> {
        await this.page.getByRole('button', { name: 'VISTA PREVIA' }).click();
    }

    async cerrarVistaPrevia(): Promise<void> {
        await this.page.locator('.icon-close').click();
    }

    async zoomIn(veces: number = 1): Promise<void> {
        for (let i = 0; i < veces; i++) {
            await this.page.locator('.control > .plus').click();
        }
    }

    async validarTotalVisible(totalTexto: string): Promise<void> {
        await expect(this.page.getByText(totalTexto)).toBeVisible();
    }

    async validarItemEnPrecuenta(nombreItem: string): Promise<void> {
        await expect(this.page.getByText(nombreItem)).toBeVisible();
    }
}
