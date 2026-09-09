import { expect, Locator, Page } from '@playwright/test';
import { esperarCargaOverlaySiVisible } from '@utils/wait-helpers';

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
    valorPreliminarCargaEfectiva?: string;
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

        const switchComponent = this.page.locator('.switch-component').filter({ hasText: /Detracci[oó]n/i });

        if (await switchComponent.isVisible().catch(() => false)) {
            await switchComponent.locator('.slider').click();
            await switchComponent.getByRole('button', { name: 'Editar' }).click();
        } else {

            await this.page.locator('div:nth-child(2) > .switch-component > .v-switch > .switch-content > .switch > .slider').click();
            await this.page.getByRole('button', { name: 'Editar' }).first().click();
        }
    }

    async configurarTransporteCarga(config: ConfigDetraccionTransporte): Promise<void> {
        await esperarCargaOverlaySiVisible(this.page);

        const selectOperacion = this.page
            .locator('.v-select-header-form')
            .filter({ hasText: 'Operación Sujeta a Detracción' });

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
            await selectMetodoPago.click({ force: true });
            const opcionMetodoPago = this.page.getByText(config.metodoPago).last();
            await opcionMetodoPago.waitFor({ state: 'visible' });
            await opcionMetodoPago.click({ force: true });
        }

        const inputPorcentaje = this.page.locator('[id$="v-input:porcentaje"]');
        await inputPorcentaje.waitFor({ state: 'visible' });
        const valPorcentaje = await inputPorcentaje.inputValue();
        if (valPorcentaje !== config.porcentaje) {
            await inputPorcentaje.clear();
            await inputPorcentaje.fill(config.porcentaje);
        }

        const inputCuenta = this.page.locator('[id$="v-input:numero-cuenta"]');
        await inputCuenta.waitFor({ state: 'visible' });
        const valCuenta = await inputCuenta.inputValue();
        const soloDigitos = config.numeroCuenta.replace(/\D/g, '');
        if (valCuenta.replace(/\D/g, '') !== soloDigitos) {
            await inputCuenta.clear();
            // Escribir dígito por dígito para que la máscara del ERP formatee el número de cuenta
            await inputCuenta.pressSequentially(soloDigitos, { delay: 50 });
        }

        const btnAgregar = this.page.locator('[id="pv_punto-venta_drapes:datos-detraccion_v-button:agregar-detalle-carga"]')

        await btnAgregar.first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {
        });
        await btnAgregar.first().click({ force: true });
        await esperarCargaOverlaySiVisible(this.page);

        await this._llenarUbigeo(config.origen, 'origen');
        await this._llenarUbigeo(config.destino, 'destino');

        await this.page.locator('[id$="v-input:valor-referencial-transporte"]').fill(config.valorTransporte);
        await this.page.locator('[id$="v-input:valor-referencial-carga-efectiva"]').fill(config.cargaEfectiva);
        await this.page.locator('[id$="v-input:valor-referencial-carga-util"]').fill(config.cargaUtil);
        await this.page.getByRole('textbox', { name: 'Ingresa detalle del viaje' }).fill(config.detalleViaje);

        await this.page.getByRole('button', { name: 'Guardar', exact: true }).click();


        if (config.tramo) {

            await this.page.waitForTimeout(800);
            const btnAgregarDetalle = this.page.getByRole('button', { name: 'Agregar detalle de carga' });
            await expect(btnAgregarDetalle.first()).toBeVisible({ timeout: 7_000 });
            await btnAgregarDetalle.first().click();


            await this.page.waitForTimeout(500);
            const btnTramo = this.page.getByRole('button', { name: 'Agregar tramo y vehículo' });
            await expect(btnTramo).toBeVisible({ timeout: 7_000 });
            await btnTramo.click();


            const t = config.tramo;
            const tramoContainer = this.page.locator('.informacion-tramo-vehiculo.active');

            await this._llenarUbigeoEnContainer(tramoContainer, t.origen, 'origen');
            await this._llenarUbigeoEnContainer(tramoContainer, t.destino, 'destino');

            await this.page.locator('[id$="v-input:configuracion-vehicular"]').fill(t.configuracionVehicular);
            await this.page.locator('[id$="v-input:carga-util-metricas-vehiculo"]').fill(t.cargaUtilMetricasVehiculo);
            await this.page.locator('[id$="v-input:description-tramo"]').fill(t.descripcionTramo);
            await this.page.locator('[id$="v-input:carga-efectiva-toneladas-metricas"]').fill(t.cargaEfectivaToneladas);
            await this.page.getByRole('textbox', { name: 'Ej. S/' }).fill(t.valorTransporte);

            if (t.valorPreliminarCargaEfectiva) {
                await this.page.locator('[id$="v-input:valor-preliminar-carga-efectiva"]').fill(t.valorPreliminarCargaEfectiva);
            }

            await this.page.locator('[id$="v-input:valor-referencial-tonelada-metrica"]').fill(t.valorReferencialTonelada);

            if (t.valorPreliminarCargaUtilNominal) {
                await this.page.locator('[id$="v-input:valor-preliminar-carga-util-nominal"]').fill(t.valorPreliminarCargaUtilNominal);
            }


            await this.page.getByRole('button', { name: 'Guardar', exact: true }).click();
            await this.page.waitForTimeout(500);

            await this.page.getByRole('button', { name: 'Guardar', exact: true }).click();
        }

        
        
        
        
        
        
        
        
        
        
        
        
        
        await this.page.waitForTimeout(1500);
        
        
        const btnCerrar = this.page.locator('.v-modal > div').first();
        if (await btnCerrar.isVisible().catch(() => false)) {
            await btnCerrar.click();
        }

        
        await this.page.locator('.v-modal.is-open').last().waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {});
        await this.page.waitForTimeout(500);
    }

    async seleccionarOperacionTransporteCarga(datos?: { porcentaje: string; numeroCuenta: string }): Promise<void> {
        const checkboxId = 'pv_punto-venta_cmp-factura-boleta-header_v-switch:documento-detraccion';
        const isChecked = await this.page.evaluate((id) => {
            const el = document.getElementById(id) as HTMLInputElement;
            return el?.checked ?? false;
        }, checkboxId);

        if (!isChecked) {
            await this.page.evaluate((id) => {
                const el = document.getElementById(id) as HTMLInputElement;
                if (el && !el.checked) {
                    el.checked = true;
                    el.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }, checkboxId);
            await this.page.waitForTimeout(500);
        }

        await this.page.locator('[id="pv_punto-venta_cmp-factura-boleta-header_div:editar-datos-detraccion"]').click();

        await this.page
            .locator('.v-select-header-form')
            .filter({ hasText: 'Operación Sujeta a Detracción' })
            .click();

        await this.page
            .locator('.v-select-base-options.is-open')
            .locator('.v-select-form-option')
            .filter({ hasText: 'Operación Sujeta a Detracción - Servicio de Transporte de Carga' })
            .click();

        
        if (datos) {
            const inputPorcentaje = this.page.locator('[id$="v-input:porcentaje"]');
            await inputPorcentaje.waitFor({ state: 'visible' });
            await inputPorcentaje.clear();
            await inputPorcentaje.fill(datos.porcentaje);

            const inputCuenta = this.page.locator('[id$="v-input:numero-cuenta"]');
            await inputCuenta.waitFor({ state: 'visible' });
            await inputCuenta.clear();
            
            await inputCuenta.pressSequentially(datos.numeroCuenta.replace(/\D/g, ''), { delay: 50 });
        }

        await this.page.getByRole('button', { name: 'Actualizar', exact: true }).click();

        await expect(this.page.getByText('¡Buen trabajo!')).toBeVisible({ timeout: 10_000 });
        await this.page.locator('.v-modal.is-open > .icon').last().click();

        await this.page.waitForTimeout(500);
        const modalIcon = this.page.locator('.v-modal.is-open > .icon').first();
        if (await modalIcon.isVisible()) {
            await modalIcon.click();
        }
    }

    async configurarDetraccionSimple(config: {
        porcentaje: string;
        numeroCuenta: string;
    }): Promise<void> {

        const inputPorcentaje = this.page.locator('[id$="v-input:porcentaje"]');
        await inputPorcentaje.waitFor({ state: 'visible' });
        await inputPorcentaje.clear();
        await inputPorcentaje.fill(config.porcentaje);

        const inputCuenta = this.page.locator('[id$="v-input:numero-cuenta"]');
        await inputCuenta.waitFor({ state: 'visible' });
        await inputCuenta.clear();
        await inputCuenta.pressSequentially(config.numeroCuenta.replace(/\D/g, ''), { delay: 50 });

        await this.page.getByRole('button', { name: 'Actualizar' }).click();

        await this.page.getByText('¡Buen trabajo!').waitFor({ state: 'visible' });
        await this.page.locator('.v-modal.is-open > .icon').last().click();

        await this.page.waitForTimeout(500);
        const configModalIcon = this.page.locator('.v-modal.is-open > .icon').first();
        if (await configModalIcon.isVisible()) {
            await configModalIcon.click();
        }
    }

    private async _llenarUbigeoEnContainer(container: Locator, detalle: DetalleCarga, tipo: 'origen' | 'destino'): Promise<void> {
        const inputUbigeo = tipo === 'origen'
            ? container.getByRole('textbox', { name: 'Ingresa distrito, ciudad o' }).first()
            : container.getByRole('textbox', { name: 'Ingresa distrito, ciudad o' }).last();

        await inputUbigeo.waitFor({ state: 'visible' });
        await inputUbigeo.click();
        await inputUbigeo.fill(detalle.ubigeo);

        await this.page.getByText(detalle.texto).waitFor({ state: 'visible' });
        await this.page.getByText(detalle.texto).click();
    }

    private async _llenarUbigeo(detalle: DetalleCarga, tipo: 'origen' | 'destino'): Promise<void> {
        const inputDireccion = tipo === 'origen'
            ? 'Ingresa dirección de origen'
            : 'Ingresa dirección de destino';

        const inputUbigeo = tipo === 'origen'
            ? this.page.getByRole('textbox', { name: 'Ingresa distrito, ciudad o' }).first()
            : this.page.getByRole('textbox', { name: 'Ingresa distrito, ciudad o' });

        await inputUbigeo.waitFor({ state: 'visible' });
        await inputUbigeo.click();
        await inputUbigeo.fill(detalle.ubigeo);

        await this.page.getByText(detalle.texto).waitFor({ state: 'visible' });
        await this.page.getByText(detalle.texto).click();

        const inputDir = this.page.getByRole('textbox', { name: inputDireccion });
        await inputDir.waitFor({ state: 'visible' });
        await inputDir.fill(detalle.direccion);
    }
}