import {Page} from '@playwright/test';
import type {DatosClienteConSelector} from '../../types/cliente.types';

export class EmisionDatosOpcionalesPage {
    constructor(private readonly page: Page) {}

    async abrirDatosOpcionales(): Promise<void> {
        await this.page.getByRole('button', {name: 'Datos'}).click();
    }

    async llenarDatosOpcionales(cliente: DatosClienteConSelector): Promise<void> {
        // Seleccionar Vendedor / Cliente
        const inputVendedor = this.page.getByRole("textbox", {name: "Nombre del vendedor"});
        await inputVendedor.click();

        await inputVendedor.fill(cliente.documento);
        await this.page.locator(".card-entidad-cliente").filter({hasText: cliente.nombre}).first().click();

        // Llenar campos de datos opcionales
        await this.page.locator('[id="pv_ventas_cmp-punto-venta_v-drape:cmp-datos-opcionales_v-input:orden-compra"]').fill("121");
        await this.page.locator('[id="pv_ventas_cmp-punto-venta_v-drape:cmp-datos-opcionales_v-input:contrato"]').fill("12");
        await this.page.locator('[id="pv_ventas_cmp-punto-venta_v-drape:cmp-datos-opcionales_v-input:comentarios"]').fill("observacion para datos adicionales");
        await this.page.locator('[id="pv_ventas_cmp-punto-venta_v-drape:cmp-datos-opcionales_v-input:campo-texto-0"]').fill("texto");
        await this.page.locator('[id="pv_ventas_cmp-punto-venta_v-drape:cmp-datos-opcionales_v-input:campo-numero-0"]').fill("123123");

        // Guardar
        await this.page.getByRole("button", {name: "Guardar datos"}).click();
    }
}
