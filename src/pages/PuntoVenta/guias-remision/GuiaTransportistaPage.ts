import {type Page} from '@playwright/test';
import {esperarDebounce} from '@utils/wait-helpers';

export class GuiaTransportistaPage {
    constructor(public readonly page: Page) {
    }

    get btnNuevaGuia() {
        return this.page.getByRole('button', {name: 'Nueva guía remisión transportista'});
    }

    get btnEmitir() {
        return this.page.getByRole('button', {name: 'Emitir'});
    }

    get inputRemitente() {
        return this.page.locator('[id="pv_cmp-guia-remision-transportista_cmp-card-remitente:form_v-input:filtrar-entidad"]');
    }

    get inputDestinatario() {
        return this.page.locator('[id="pv_cmp-guia-remision-transportista_cmp-card-destinatario:form_v-input:filtrar-entidad"]');
    }

    get inputConductor() {
        return this.page.locator('[id="pv_cmp-guia-remision-transportista_cmp-card-transporte:form-transporte-conductor_v-input:filtrar-entidad"]');
    }

    get inputPlaca() {
        return this.page.getByRole('textbox', {name: 'Ej. A1A000'});
    }

    get inputLicencia() {
        return this.page.getByRole('textbox', {name: 'Ej. A23456723'});
    }

    get inputMTC() {
        return this.page.locator('[id="pv_cmp-guia-remision-transportista_cmp-card-transporte:form-transporte_v-input:registro-mtc"]');
    }

    get inputTUCE() {
        return this.page.getByRole('textbox', {name: /Ej\. 1234567891\//});
    }

    get inputTransportista() {
        return this.page.locator('[id="pv_cmp-guia-remision-transportista_cmp-card-transporte:form-transporte_item:seleccion-entidad"]');
    }

    get inputBuscarItem() {
        return this.page.getByRole('textbox', {name: 'Escanea o busca por nombre, c'});
    }

    get inputPeso() {
        return this.page.getByRole('textbox', {name: 'Kg'});
    }

    get inputBuscarPuntoLlegada() {
        return this.page.getByRole('textbox', {name: 'Busca por distrito, ciudad,'});
    }

    get inputDireccion() {
        return this.page.getByRole('textbox', {name: /Ej\. Calle Manzanos 202/});
    }

    get inputDocTransportista() {
        return this.page.getByRole('textbox', {name: 'Digite N° de documento'});
    }

    get inputPagadorFlete() {
        return this.page.getByRole('textbox', {name: /Digite N.° de RUC, nombre o/});
    }

    get inputSubcontratador() {
        return this.page.getByRole('textbox', {name: /Digite N.° de RUC, nombre o/});
    }

    async abrirNuevaGuia() {
        await this.btnNuevaGuia.click();
        await esperarDebounce(this.page, 500, 'Esperando render de Nueva Guia Transportista');
    }

    async seleccionarRemitente(documento: string) {
        await this.inputRemitente.click();
        await this.inputRemitente.fill(documento);
        await this.page.getByText(new RegExp(documento)).click();
    }

    async seleccionarDestinatario(documento: string) {
        await this.inputDestinatario.click();
        await this.inputDestinatario.fill(documento);
        await this.page.getByText(new RegExp(documento)).click();
    }

    async seleccionarConductor(documento: string) {
        await this.inputConductor.click();
        await this.inputConductor.fill(documento);
        await this.page.getByText(documento).first().click();
    }

    async completarPlacaYLicencia(placa: string, licencia: string) {
        await this.inputPlaca.click();
        await this.inputPlaca.fill(placa);
        await this.inputLicencia.click();
        await this.inputLicencia.fill(licencia);
    }

    async completarMTC(mtc: string) {
        await this.inputMTC.click();
        await this.inputMTC.fill(mtc);
    }

    async completarTUCE(tuce: string) {
        await this.inputTUCE.click();
        await this.inputTUCE.fill(tuce);
    }

    async seleccionarTransportista(documento: string) {
        await this.inputDocTransportista.click();
        await this.inputDocTransportista.fill(documento);
        await this.page.getByText(new RegExp(documento)).first().click();
    }

    async seleccionarRetorno(tipo: 'retorno-vehiculo' | 'transporte-subcontratado') {
        await this.page.getByRole('button', {name: /Retorno de vehículo con/}).click();
        if (tipo === 'transporte-subcontratado') {
            await this.page.getByText('Transporte subcontratado').click();
        }
    }

    async seleccionarSubcontratador(documento: string) {
        await this.page.getByRole('textbox', {name: /Digite N.° de RUC, nombre o/}).fill(documento);
        await this.page.getByText(new RegExp(documento)).first().click();
    }

    async seleccionarPagadorFlete(tipo: 'remitente' | 'destinatario' | 'otros_terceros' | 'subcontratador') {
        const label: Record<string, string> = {
            remitente: 'Remitente',
            destinatario: 'Destinatario',
            otros_terceros: 'Otros(Terceros)',
            subcontratador: 'Subcontratador',
        };
        await this.page.locator('div').filter({hasText: /^Remitente$/}).nth(3).click();
        // Scope to open dropdown to avoid strict mode when trigger === option
        await this.page.locator('.v-select-base-options.is-open')
            .getByText(label[tipo], {exact: true})
            .click();
    }

    async completarPagadorFleteData(documento: string) {
        await this.inputPagadorFlete.fill(documento);
        await this.page.getByText(new RegExp(documento)).first().click();
    }

    async completarPuntoPartidaYLlegada(origen: string, destino: string, direccion: string) {
        await this.inputBuscarPuntoLlegada.first().click();
        await this.inputBuscarPuntoLlegada.first().fill(origen.split('-')[0].trim());
        await this.page.getByText(origen).first().click();

        await this.inputBuscarPuntoLlegada.click();
        await this.inputBuscarPuntoLlegada.fill(destino.split('-')[0].trim());
        await this.page.getByText(destino).last().click();

        await this.inputDireccion.click();
        await this.inputDireccion.fill(direccion);
    }

    async buscarYSeleccionarItem(codigo: string) {
        await this.inputBuscarItem.click();
        await this.inputBuscarItem.fill(codigo);
        await this.page.getByText(codigo, {exact: false}).first().click();
    }

    async definirPesoTotal(peso: string) {
        await this.page.locator('div').filter({hasText: /^Peso total \(Kg\)$/}).nth(3).click();
        await this.page.getByText('Peso total (Kg)').first().click();
        await this.inputPeso.click();
        await this.inputPeso.fill(peso);
    }

    async vincularComprobante(
        tipo: 'BOLETA_DE_VENTA' | 'FACTURA',
        serie: string,
        correlativo: string,
        rucProveedor: string
    ) {
        await this.page.getByRole('button', {name: 'Vincular comprobante'}).click();
        await this.page.getByRole('button', {name: 'Vincular comprobante'}).click();
        if (tipo === 'BOLETA_DE_VENTA') {
            await this.page.getByText('Boleta de venta').click();
        } else {
            await this.page.getByText('Factura').click();
        }
        await this.page.getByRole('textbox', {name: 'Serie'}).fill(serie);
        await this.page.getByRole('textbox', {name: 'Correlativo'}).fill(correlativo);
        await this.page.getByRole('textbox', {name: 'RUC Proveedor'}).fill(rucProveedor);
        await this.page.getByRole('button', {name: 'Añadir'}).click();
        await this.page.getByRole('button', {name: 'Cerrar'}).click();
        await this.page.getByRole('button', {name: 'Guardar comprobante'}).click();
    }

    async completarAutorizacionEspecial(numeroAutorizacion: string, tuce?: string) {
        await this.page.getByRole('checkbox', {name: 'Autorización Especial'}).check();
        await this.page.getByRole('textbox', {name: 'Número de autorización'}).fill(numeroAutorizacion);
        if (tuce) {
            await this.page.getByRole('textbox', {name: /TUCE/}).fill(tuce);
        }
    }

    async decrementarCantidad() {
        await this.page.locator('[id*="cambia-cantidad-items_step"][id$="div:decrement"]').click();
    }

    async emitirGuia() {
        await this.btnEmitir.click();
    }
}
