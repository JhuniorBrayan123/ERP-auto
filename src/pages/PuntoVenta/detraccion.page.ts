import {expect, Page} from '@playwright/test';

export interface DetalleCarga {
    ubigeo: string;
    texto: string;
    direccion: string;
}

export interface TramoVehiculo {
    origen: DetalleCarga;
    destino: DetalleCarga;
    configuracionVehicular: string;
    cargaUtilMetricasVehiculo: string;
    descripcionTramo: string;
    cargaEfectivaToneladas: string;
    valorTransporte: string;
    valorReferencialTonelada: string;
    valorPreliminarCargaUtilNominal?: string;
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
    tramo?: TramoVehiculo;
}

export class DetraccionPage {
    constructor(private page: Page) {
    }

    async activarDetraccion(): Promise<void> {

        const switchComponent = this.page.locator('.switch-component').filter({hasText: /Detracci[oó]n/i});

        if (await switchComponent.isVisible().catch(() => false)) {
            await switchComponent.locator('.slider').click();
            await switchComponent.getByRole('button', {name: 'Editar'}).click();
        } else {

            await this.page.locator('div:nth-child(2) > .switch-component > .v-switch > .switch-content > .switch > .slider').click();
            await this.page.getByRole('button', {name: 'Editar'}).first().click();
        }
    }

    async configurarTransporteCarga(config: ConfigDetraccionTransporte): Promise<void> {

        const selectOperacion = this.page
            .locator('.v-select-header-form')
            .filter({hasText: 'Operación Sujeta a Detracción'});

        await selectOperacion.click();

        const dropdown = this.page.locator('.v-select-base-options.is-open');
        await expect(dropdown).toBeVisible();

        await dropdown
            .locator('.v-select-form-option')
            .filter({
                hasText: 'Operación Sujeta a Detracción - Servicio de Transporte de Carga'
            })
            .click();

        await expect(selectOperacion).toContainText('Transporte de Carga');

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
        const soloDigitos = config.numeroCuenta.replace(/\D/g, '');
        if (valCuenta.replace(/\D/g, '') !== soloDigitos) {
            await inputCuenta.clear();
            // Escribir dígito por dígito para que la máscara del ERP formatee el número de cuenta
            await inputCuenta.pressSequentially(soloDigitos, {delay: 50});
        }

        const btnAgregar = this.page.locator('[id$="v-button:agregar-detalle-carga"]').or(
            this.page.locator('div').filter({hasText: /^Agregar detalle de carga$/i}).last()
        ).or(this.page.getByText('Agregar detalle de carga').last());

        await btnAgregar.first().waitFor({state: 'visible', timeout: 5000}).catch(() => {
        });
        await btnAgregar.first().click({force: true});

        await this._llenarUbigeo(config.origen, 'origen');
        await this._llenarUbigeo(config.destino, 'destino');

        await this.page.locator('[id$="v-input:valor-referencial-transporte"]').fill(config.valorTransporte);
        await this.page.locator('[id$="v-input:valor-referencial-carga-efectiva"]').fill(config.cargaEfectiva);
        await this.page.locator('[id$="v-input:valor-referencial-carga-util"]').fill(config.cargaUtil);
        await this.page.getByRole('textbox', {name: 'Ingresa detalle del viaje'}).fill(config.detalleViaje);

        await this.page.getByRole('button', {name: 'Guardar', exact: true}).click();

        
        if (config.tramo) {
            await this.page.waitForTimeout(500);
            const btnSegundoDetalle = this.page.locator('[id$="v-button:agregar-detalle-carga"]').or(
                this.page.getByRole('button', {name: 'Agregar detalle de carga'}).last()
            );
            await btnSegundoDetalle.first().waitFor({state: 'visible', timeout: 5_000});
            await btnSegundoDetalle.first().click({force: true});

            await this.page.waitForTimeout(300);
            const btnTramo = this.page.getByRole('button', {name: 'Agregar tramo y vehículo'});
            await btnTramo.waitFor({state: 'visible', timeout: 5_000});
            await btnTramo.click();

            
            const t = config.tramo;
            await this._llenarUbigeo(t.origen, 'origen');
            await this._llenarUbigeo(t.destino, 'destino');

            await this.page.locator('[id$="v-input:configuracion-vehicular"]').fill(t.configuracionVehicular);
            await this.page.locator('[id$="v-input:carga-util-metricas-vehiculo"]').fill(t.cargaUtilMetricasVehiculo);
            await this.page.locator('[id$="v-input:description-tramo"]').fill(t.descripcionTramo);
            await this.page.locator('[id$="v-input:carga-efectiva-toneladas-metricas"]').fill(t.cargaEfectivaToneladas);
            await this.page.getByRole('textbox', {name: 'Ej. S/'}).fill(t.valorTransporte);
            await this.page.locator('[id$="v-input:valor-referencial-tonelada-metrica"]').fill(t.valorReferencialTonelada);

            if (t.valorPreliminarCargaUtilNominal) {
                await this.page.locator('[id$="v-input:valor-preliminar-carga-util-nominal"]').fill(t.valorPreliminarCargaUtilNominal);
            }

            
            await this.page.getByRole('button', {name: 'Guardar', exact: true}).click();
            await this.page.waitForTimeout(300);
            
            await this.page.getByRole('button', {name: 'Guardar', exact: true}).click();
        }

        await this.page.getByRole('button', {name: 'Actualizar'}).waitFor({state: 'visible'});
        await this.page.getByRole('button', {name: 'Actualizar'}).click();


        await this.page.getByText('¡Buen trabajo!').waitFor({state: 'visible'});
        await this.page.locator('.v-modal.is-open > .icon').last().click();


        await this.page.waitForTimeout(500);
        const configModalIcon = this.page.locator('.v-modal.is-open > .icon').first();
        if (await configModalIcon.isVisible()) {
            await configModalIcon.click();
        }
    }

    async configurarDetraccionSimple(config: {
        porcentaje: string;
        numeroCuenta: string;
    }): Promise<void> {

        const inputPorcentaje = this.page.locator('[id$="v-input:porcentaje"]');
        await inputPorcentaje.waitFor({state: 'visible'});
        await inputPorcentaje.clear();
        await inputPorcentaje.fill(config.porcentaje);

        const inputCuenta = this.page.locator('[id$="v-input:numero-cuenta"]');
        await inputCuenta.waitFor({state: 'visible'});
        await inputCuenta.clear();
        await inputCuenta.pressSequentially(config.numeroCuenta.replace(/\D/g, ''), {delay: 50});

        await this.page.getByRole('button', {name: 'Actualizar'}).click();

        await this.page.getByText('¡Buen trabajo!').waitFor({state: 'visible'});
        await this.page.locator('.v-modal.is-open > .icon').last().click();

        await this.page.waitForTimeout(500);
        const configModalIcon = this.page.locator('.v-modal.is-open > .icon').first();
        if (await configModalIcon.isVisible()) {
            await configModalIcon.click();
        }
    }

    private async _llenarUbigeo(detalle: DetalleCarga, tipo: 'origen' | 'destino'): Promise<void> {
        const inputDireccion = tipo === 'origen'
            ? 'Ingresa dirección de origen'
            : 'Ingresa dirección de destino';

        const inputUbigeo = tipo === 'origen'
            ? this.page.getByRole('textbox', {name: 'Ingresa distrito, ciudad o'}).first()
            : this.page.getByRole('textbox', {name: 'Ingresa distrito, ciudad o'});

        await inputUbigeo.waitFor({state: 'visible'});
        await inputUbigeo.click();
        await inputUbigeo.fill(detalle.ubigeo);

        await this.page.getByText(detalle.texto).waitFor({state: 'visible'});
        await this.page.getByText(detalle.texto).click();

        const inputDir = this.page.getByRole('textbox', {name: inputDireccion});
        await inputDir.waitFor({state: 'visible'});
        await inputDir.fill(detalle.direccion);
    }
}