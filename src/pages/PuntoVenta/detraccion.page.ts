import {expect, Page} from '@playwright/test';

export interface DetalleCarga {
    ubigeo: string;
    texto: string;
    direccion: string;
}

export interface ConfigDetraccionTransporte {
    tipoOperacion: string;
    metodoPago: string;
    porcentaje: string;
    numeroCuenta: string;
    origen: DetalleCarga;
    destino: DetalleCarga;
    valorTransporte: string;
    cargaEfectiva: string;
    cargaUtil: string;
    detalleViaje: string;
}

export class DetraccionPage {
    constructor(private page: Page) {
    }

    async activarDetraccion(): Promise<void> {
        // Encontrar el switch específico de Detracción (más estable que nth-child)
        const switchComponent = this.page.locator('.switch-component').filter({hasText: /Detracci[oó]n/i});

        if (await switchComponent.isVisible().catch(() => false)) {
            await switchComponent.locator('.slider').click();
            await switchComponent.getByRole('button', {name: 'Editar'}).click();
        } else {
            // Fallback al código original
            await this.page.locator('div:nth-child(2) > .switch-component > .v-switch > .switch-content > .switch > .slider').click();
            await this.page.getByRole('button', {name: 'Editar'}).first().click();
        }
    }

    async configurarTransporteCarga(config: ConfigDetraccionTransporte): Promise<void> {
        // 1. Abrir select
        const selectOperacion = this.page
            .locator('.v-select-header-form')
            .filter({hasText: 'Operación Sujeta a Detracción'});

        await selectOperacion.click();

// 2. Esperar dropdown abierto
        const dropdown = this.page.locator('.v-select-base-options.is-open');
        await expect(dropdown).toBeVisible();

// 3. Seleccionar opción exacta
        await dropdown
            .locator('.v-select-form-option')
            .filter({
                hasText: 'Operación Sujeta a Detracción - Servicio de Transporte de Carga'
            })
            .click();

// 4. Validar selección aplicada (opcional pero recomendado)
        await expect(selectOperacion).toContainText('Transporte de Carga');

        // 2. Método de Pago
        const selectMetodoPago = this.page.locator('[id$="v-select:medio-pago"]').or(
            this.page.getByText('Depósito en cuenta').first()
        );
        const textoActual = await selectMetodoPago.textContent();

        if (!textoActual?.includes(config.metodoPago)) {
            await selectMetodoPago.click({force: true});
            const opcionMetodoPago = this.page.getByText(config.metodoPago).last();
            await opcionMetodoPago.waitFor({state: 'visible'});
            await opcionMetodoPago.click({force: true});
        }
        // 3. Porcentaje y cuenta — condicionales
        const inputPorcentaje = this.page.locator('[id$="v-input:porcentaje"]');
        await inputPorcentaje.waitFor({state: 'visible'});
        const valPorcentaje = await inputPorcentaje.inputValue();
        if (valPorcentaje !== config.porcentaje) {
            await inputPorcentaje.clear();
            await inputPorcentaje.fill(config.porcentaje);
        }

        const inputCuenta = this.page.locator('[id$="v-input:numero-cuenta"]');
        await inputCuenta.waitFor({state: 'visible'});
        const valCuenta = await inputCuenta.inputValue();
        if (valCuenta !== config.numeroCuenta) {
            await inputCuenta.clear();
            await inputCuenta.fill(config.numeroCuenta);
        }

        // 4. Agregar detalle de carga
        const btnAgregar = this.page.locator('[id$="v-button:agregar-detalle-carga"]').or(
            this.page.locator('div').filter({hasText: /^Agregar detalle de carga$/i}).last()
        ).or(this.page.getByText('Agregar detalle de carga').last());

        await btnAgregar.first().waitFor({state: 'visible', timeout: 5000}).catch(() => {
        });
        await btnAgregar.first().click({force: true});

        // 5. Ubigeos — secuencial con espera
        await this._llenarUbigeo(config.origen, 'origen');
        await this._llenarUbigeo(config.destino, 'destino');

        // 6. Valores referenciales
        await this.page.locator('[id$="v-input:valor-referencial-transporte"]').fill(config.valorTransporte);
        await this.page.locator('[id$="v-input:valor-referencial-carga-efectiva"]').fill(config.cargaEfectiva);
        await this.page.locator('[id$="v-input:valor-referencial-carga-util"]').fill(config.cargaUtil);
        await this.page.getByRole('textbox', {name: 'Ingresa detalle del viaje'}).fill(config.detalleViaje);

        // 7. Guardar y actualizar
        await this.page.getByRole('button', {name: 'Guardar', exact: true}).click();
        await this.page.getByRole('button', {name: 'Actualizar'}).waitFor({state: 'visible'});
        await this.page.getByRole('button', {name: 'Actualizar'}).click();
        await this.page.locator('.v-modal > div').first().click();
    }

    /**
     * Configura detracción simple (sin detalle de transporte de carga).
     * Se usa para facturas en moneda extranjera con detracción.
     *
     * Basado en: casos.ts líneas 1976-1993
     */
    async configurarDetraccionSimple(config: {
        porcentaje: string;
        numeroCuenta: string;
    }): Promise<void> {
        // Porcentaje
        const inputPorcentaje = this.page.locator('[id$="v-input:porcentaje"]');
        await inputPorcentaje.waitFor({state: 'visible'});
        await inputPorcentaje.clear();
        await inputPorcentaje.fill(config.porcentaje);

        // Número de cuenta
        const inputCuenta = this.page.locator('[id$="v-input:numero-cuenta"]');
        await inputCuenta.waitFor({state: 'visible'});
        await inputCuenta.clear();
        await inputCuenta.fill(config.numeroCuenta);

        // Actualizar y cerrar modal
        await this.page.getByRole('button', {name: 'Actualizar'}).click();
        await this.page.locator('.v-modal > div').first().click();
    }

    private async _llenarUbigeo(detalle: DetalleCarga, tipo: 'origen' | 'destino'): Promise<void> {
        const inputDireccion = tipo === 'origen'
            ? 'Ingresa dirección de origen'
            : 'Ingresa dirección de destino';

        // Esperar que el input de ubigeo esté disponible según tipo
        const inputUbigeo = tipo === 'origen'
            ? this.page.getByRole('textbox', {name: 'Ingresa distrito, ciudad o'}).first()
            : this.page.getByRole('textbox', {name: 'Ingresa distrito, ciudad o'});

        await inputUbigeo.waitFor({state: 'visible'});
        await inputUbigeo.click();
        await inputUbigeo.fill(detalle.ubigeo);

        // Esperar resultado y clickear
        await this.page.getByText(detalle.texto).waitFor({state: 'visible'});
        await this.page.getByText(detalle.texto).click();

        // Esperar que aparezca el input de dirección tras seleccionar ubigeo
        const inputDir = this.page.getByRole('textbox', {name: inputDireccion});
        await inputDir.waitFor({state: 'visible'});
        await inputDir.fill(detalle.direccion);
    }
}