import {Locator, Page} from '@playwright/test';

export class SucursalesPage {
    readonly page: Page;
    readonly menuPreferencias: Locator;
    readonly btnDesplegarCard: Locator;
    readonly switchTraslado: Locator;
    readonly btnGuardar: Locator;
    readonly modalFondo: Locator;

    constructor(page: Page) {
        this.page = page;

        this.menuPreferencias = page.locator('[id="cfg_cmp-menu-configuracion.v-button:menu-2-4"]');
        this.btnDesplegarCard = page
            .locator('.v-card-preference')
            .filter({hasText: 'Preferencias avanzadas'})
            .locator('[id="cfg_cmp-ventas-preferencias-avanzadas.icon:campos-adicionales"]');
        this.switchTraslado = page.locator('div:nth-child(4) > .switch.flex-row > .v-switch > .switch-content > .switch > .slider');
        this.btnGuardar = page.locator('[id="config_cmp-items-preferencias-avanzadas:form_cmp-preferencias-avanzadas-form_v-button:guardar-parametros"]')
        this.modalFondo = page.locator('.v-modal > div').first();
    }

    async activarPreferenciaTraslado() {
        await this.menuPreferencias.click();
        await this.btnDesplegarCard.click();
        await this.switchTraslado.click();
        await this.btnGuardar.click();
        await this.modalFondo.click();
    }
}