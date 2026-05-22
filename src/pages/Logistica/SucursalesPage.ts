import {Locator, Page} from '@playwright/test';

export class SucursalesPage {
    readonly page: Page;
    readonly menuPreferencias: Locator;
    readonly tabPreferenciasAvanzadas: Locator;
    readonly btnDesplegarCard: Locator;
    readonly switchTraslado: Locator;
    readonly btnGuardar: Locator;
    readonly modalFondo: Locator;

    constructor(page: Page) {
        this.page = page;
        // Definición de selectores enfocados en IDs y roles estables
        this.menuPreferencias = page.locator('[id="cfg_cmp-menu-configuracion.v-button:menu-2-4"]');
        this.tabPreferenciasAvanzadas = page.getByText('Preferencias avanzadas');
        this.btnDesplegarCard = page.locator('[id="config_cmp-items-preferencias-avanzadas_card-preference:abrir-card-configuraciones"]');

        // Mantenemos el slider del switch (apuntando al cuarto hijo de forma más segura o directo al slider si es único)
        this.switchTraslado = page.locator('div:nth-child(4) > .switch.flex-row > .v-switch > .switch-content > .switch > .slider');
        this.btnGuardar = page.getByRole('button', {name: 'Guardar'});
        this.modalFondo = page.locator('.v-modal > div').first();
    }

    /**
     * Activa la preferencia avanzada de traslado por confirmar
     */
    async activarPreferenciaTraslado() {
        await this.menuPreferencias.click();

        // Usamos el .nth(2) que tenías originalmente para el tab
        await this.tabPreferenciasAvanzadas.nth(2).click();

        // Aquí usamos tu nuevo ID para desplegar la sección
        await this.btnDesplegarCard.click();

        // Accionamos el switch y guardamos
        await this.switchTraslado.click();
        await this.btnGuardar.click();

        // Cerramos el modal haciendo clic fuera o en el fondo
        await this.modalFondo.click();
    }
}