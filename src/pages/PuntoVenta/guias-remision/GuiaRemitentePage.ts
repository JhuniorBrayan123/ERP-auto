import {expect, type Locator, type Page} from '@playwright/test';
import {runFunctionalAction} from '../../../utils/functional-step';
import {esperarDebounce} from '../../../utils/wait-helpers';

export class GuiaRemitentePage {
    constructor(public readonly page: Page) {}

    // Modals y botones globales
    get btnNuevaGuia() { return this.page.getByRole('button', { name: 'Nueva guía remisión remitente' }); }
    get btnEmitir() { return this.page.getByRole('button', { name: 'Emitir' }); }
    get btnGuardar() { return this.page.getByRole('button', { name: 'Guardar', exact: true }); }
    
    // Locators Principales
    get fechaEmisionPicker() { return this.page.locator('[id="pv_cmp-guia-remision-remitente_cmp-card-inicio:form-inicio_v-datepicker:fecha-emision"]'); }
    get fechaTrasladoPicker() { return this.page.locator('[id="pv_cmp-guia-remision-remitente_cmp-card-inicio:form-inicio_v-datepicker:fecha-inicio-traslado"]'); }
    get inputDestinatario() { return this.page.locator('[id="pv_cmp-guia-remision-remitente_cmp-card-destinatario:form-destino_v-input:filtrar-entidad"]'); }
    get inputTransportista() { return this.page.locator('[id="pv_cmp-guia-remision-remitente_cmp-card-transporte:form-transporte-transportista_v-input:filtrar-entidad"]'); }
    get inputConductor() { return this.page.locator('[id="pv_cmp-guia-remision-remitente_cmp-card-transporte:form-transporte-conductor_v-input:filtrar-entidad"]'); }
    get inputMTC() { return this.page.locator('[id="pv_cmp-guia-remision-remitente_cmp-card-transporte:form-transporte_v-input:registro-mtc"]'); }
    get inputDam() { return this.page.getByRole('textbox', { name: 'Ej. 2024/123-4567-40-' }); }
    get inputBultos() { return this.page.getByRole('textbox', { name: 'Ej. 10' }); }
    get inputBuscarItem() { return this.page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }); }

    async abrirNuevaGuia() {
        await this.btnNuevaGuia.click();
        await esperarDebounce(this.page, 500, 'Esperando render de Nueva Guia');
    }

    async seleccionarMotivo(motivo: string) {
        await this.page.locator('div').filter({ hasText: /^VENTA$/ }).nth(2).click();
        await this.page.getByText(motivo, { exact: true }).click();
    }

    async seleccionarModalidad(modalidad: 'PUBLICA' | 'PRIVADA') {
        await this.page.locator('div').filter({ hasText: /^PRIVADA$/ }).nth(3).click();
        await this.page.getByText(modalidad, { exact: true }).click();
    }

    async seleccionarDestinatario(documento: string, resultadoTexto: string) {
        await this.inputDestinatario.click();
        await this.inputDestinatario.fill(documento);
        await this.page.locator('[id="pv_cmp-guia-remision-remitente_cmp-card-destinatario:form-destino_item:seleccion-entidad_div-0"]').click();
    }

    async completarPuntoPartidaYLlegada(origenUbigeo: string, destinoUbigeo: string, partidaDireccion: string) {
        await this.page.getByRole('article').filter({ hasText: 'Datos de inicio de' }).locator('input[type="text"]').click();
        await this.page.getByRole('article').filter({ hasText: 'Datos de inicio de' }).locator('input[type="text"]').fill(origenUbigeo.split('-')[0].trim());
        await this.page.getByText(origenUbigeo).first().click();

        await this.page.getByRole('textbox', { name: 'Busca por distrito, ciudad,' }).click();
        await this.page.getByRole('textbox', { name: 'Busca por distrito, ciudad,' }).fill(destinoUbigeo.split('-')[0].trim());
        await this.page.getByText(destinoUbigeo).last().click();

        await this.page.locator('[id="pv_cmp-guia-remision-remitente_cmp-card-inicio:form-inicio_v-input:direccion-partida"]').click();
        await this.page.locator('[id="pv_cmp-guia-remision-remitente_cmp-card-inicio:form-inicio_v-input:direccion-partida"]').fill(partidaDireccion);
    }

    async seleccionarConductor(documento: string) {
        await this.inputConductor.click();
        await this.inputConductor.fill(documento);
        await this.page.getByText(new RegExp(documento)).click();
    }

    async completarPlacaYLicencia(placa: string, licencia: string) {
        await this.page.getByRole('textbox', { name: 'Ej. A1A000' }).click();
        await this.page.getByRole('textbox', { name: 'Ej. A1A000' }).fill(placa);
        await this.page.getByRole('textbox', { name: 'Ej. A23456723' }).click();
        await this.page.getByRole('textbox', { name: 'Ej. A23456723' }).fill(licencia);
    }

    async seleccionarTransportista(documento: string) {
        await this.page.getByRole('textbox', { name: 'Digite N° de documento' }).click();
        await this.page.getByRole('textbox', { name: 'Digite N° de documento' }).fill(documento);
        await this.page.getByText(new RegExp(documento)).click();
    }

    async completarMTC(mtc: string) {
        await this.inputMTC.click();
        await this.inputMTC.fill(mtc);
    }

    async completarDam(dam: string) {
        await this.inputDam.click();
        await this.inputDam.fill(dam);
    }

    async completarBultos(bultos: string) {
        await this.inputBultos.click();
        await this.inputBultos.fill(bultos);
    }

    async buscarYSeleccionarItem(codigoONombre: string) {
        await this.inputBuscarItem.click();
        await this.inputBuscarItem.fill(codigoONombre);
        await this.page.getByText(codigoONombre, { exact: false }).first().click();
    }

    async definirPesoTotal(tipo: 'Kg' | 'Tn', peso: string) {
        await this.page.locator('div').filter({ hasText: /^Peso total \(Kg\)$/ }).nth(3).click();
        await this.page.getByText(`Peso total (${tipo})`).first().click();
        await this.page.getByRole('textbox', { name: tipo }).click();
        await this.page.getByRole('textbox', { name: tipo }).fill(peso);
    }

    async anadirContenedor(numero: string, precinto: string) {
        await this.page.locator('div').filter({ hasText: /^Sin Contenedor$/ }).nth(3).click();
        await this.page.getByText('Con Contenedor').click();
        await this.page.locator('[id="pv_cmp-guia-remision-remitente_cmp-card-inicio:form-inicio_v-input:contenedor-1"]').fill(numero);
        await this.page.locator('[id="pv_cmp-guia-remision-remitente_cmp-card-inicio:form-inicio_v-input:precinto-1"]').click();
        await this.page.locator('[id="pv_cmp-guia-remision-remitente_cmp-card-inicio:form-inicio_v-input:precinto-1"]').fill(precinto);
    }

    async seleccionarTrasladoVehiculosM1() {
        await this.page.locator('.v-checkbox-default-label.v-h6 > span').first().click();
    }

    async seleccionarTipoOperacion(tipo: 'VENTA' | 'COMPRA') {
        await this.page.locator('div').filter({ hasText: /^VENTA$/ }).nth(2).click();
        await this.page.getByText(tipo, { exact: true }).click();
    }

    async seleccionarProveedor(documento: string) {
        const inputProveedor = this.page.locator('[id="pv_cmp-guia-remision-remitente_cmp-card-inicio:form-inicio-proveedor_v-input:filtrar-entidad"]');
        await inputProveedor.click();
        await inputProveedor.fill(documento);
        await this.page.getByText(new RegExp(documento)).first().click();
    }

    async emitirGuia() {
        await this.btnEmitir.click();
    }

    async guardarGuia() {
        await this.btnGuardar.click();
    }
}
