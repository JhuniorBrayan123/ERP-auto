import {expect, type Locator, type Page} from '@playwright/test';
import {esperarCargaOverlay, esperarDebounce} from '@utils/wait-helpers';

export class GuiaTransportistaPage {
    constructor(public readonly page: Page) {
    }

    private readonly nombreInputUbigeo =
        /Busca por distrito, ciudad, región o código de ubigeo/i;

    private seccionUbigeo(titulo: 'Datos de partida' | 'Punto de llegada'): Locator {
        return this.page
            .locator('article')
            .filter({has: this.page.getByText(titulo, {exact: true})});
    }

    private inputUbigeoEnSeccion(titulo: 'Datos de partida' | 'Punto de llegada'): Locator {
        return this.seccionUbigeo(titulo).getByRole('textbox', {name: this.nombreInputUbigeo});
    }

    get btnNuevaGuia() {
        return this.page.getByRole('button', {name: 'Nueva guía remisión transportista'});
    }

    get btnEmitir() {
        return this.page.getByRole('button', {name: 'Emitir'});
    }

    get inputPlaca() {
        return this.page.getByRole('textbox', {name: 'Ej. A1A000'});
    }

    get inputLicencia() {
        return this.page.getByRole('textbox', {name: 'Ej. A23456723'});
    }

    get inputMTC() {
        return this.page.locator('[id*="card-transporte"][id*="registro-mtc"]');
    }

    get inputTUCE() {
        return this.page.getByRole('textbox', {name: /Ej\. 1234567891\//});
    }

    get inputBuscarItem() {
        return this.page.getByRole('textbox', {name: 'Escanea o busca por nombre, c'});
    }

    get inputPeso() {
        return this.page.getByRole('textbox', {name: 'Kg'});
    }

    get inputPagadorFlete() {
        return this.page.locator(
            'input[id="pv_cmp-guia-remision-transportista_cmp-card-inicio:form-inicio_v-input:filtrar-entidad"][placeholder="Digite N° de documento"]'
        ).last();
    }

    async abrirNuevaGuia() {
        await this.btnNuevaGuia.click();
        await esperarDebounce(this.page, 500, 'Esperando render de Nueva Guia Transportista');
    }

    private cardBusquedaEntidad(etiqueta: 'Buscar remitente' | 'Buscar destinatario' | 'Buscar conductor'): Locator {
        return this.page
            .getByText(new RegExp(`^${etiqueta}`))
            .locator('xpath=ancestor::article[1]');
    }

    private async seleccionarEntidadEnCard(
        card: Locator,
        documento: string
    ): Promise<void> {
        const input = card.getByRole('textbox', {name: 'Digite N° de documento'}).first();
        await expect(input).toBeVisible();
        await input.click();
        await input.fill(documento);
        await this.page
            .locator('.v-input-dropdown.is-open article')
            .filter({hasText: new RegExp(documento)})
            .first()
            .click();
        await esperarCargaOverlay(this.page);
    }

    async seleccionarRemitente(documento: string) {
        await this.seleccionarEntidadEnCard(this.cardBusquedaEntidad('Buscar remitente'), documento);
    }

    async seleccionarDestinatario(documento: string) {
        await this.seleccionarEntidadEnCard(this.cardBusquedaEntidad('Buscar destinatario'), documento);
    }

    async seleccionarConductor(documento: string) {
        await this.seleccionarEntidadEnCard(this.cardBusquedaEntidad('Buscar conductor'), documento);
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
        const input = this.page.locator(
            '[id*="card-transporte"][id*="transportista"][id*="filtrar-entidad"]'
        );
        if (!(await input.isVisible().catch(() => false))) {
            return;
        }
        await input.click();
        await input.fill(documento);
        await this.page
            .locator('[id*="card-transporte"][id*="transportista"][id*="seleccion-entidad"]')
            .filter({hasText: new RegExp(documento)})
            .first()
            .click();
        await esperarCargaOverlay(this.page);
    }

    async seleccionarRetorno(tipo: 'Retorno de vehículo con envases o embalajes vacíos' | 'Retorno de vehículo vacío' | 'Transporte subcontratado') {
        const selectRetorno = this.page.locator('.v-select-header-form')
            .filter({hasText: /Retorno de vehículo|Transporte subcontratado/})
            .first();
        await selectRetorno.click();
        await this.page.locator('.v-select-base-options.is-open')
            .getByText(tipo, {exact: true})
            .click();
    }

    async seleccionarSubcontratador(documento: string) {
        const input = this.page.locator(
            'input[id="pv_cmp-guia-remision-transportista_cmp-card-inicio:form-inicio_v-input:filtrar-entidad"][placeholder="Digite N° de RUC, nombre o razón social"]'
        ).last();
        await input.click();
        await input.fill(documento);
        await this.page.locator('.v-input-dropdown.is-open article')
            .filter({hasText: new RegExp(documento)})
            .first()
            .click();
        await esperarCargaOverlay(this.page);
    }

    async seleccionarPagadorFlete(tipo: 'remitente' | 'destinatario' | 'otros_terceros' | 'subcontratador') {
        const label: Record<string, string> = {
            remitente: 'Remitente',
            destinatario: 'Destinatario',
            otros_terceros: 'Otros(Terceros)',
            subcontratador: 'Subcontratador',
        };
        await this.page.locator('div').filter({hasText: /^Remitente$/}).nth(3).click();
        await this.page.locator('.v-select-base-options.is-open')
            .getByText(label[tipo], {exact: true})
            .click();
        await esperarCargaOverlay(this.page);
    }

    async completarPagadorFleteData(documento: string) {
        await this.inputPagadorFlete.fill(documento);
        const resultado = this.page.locator('.v-input-dropdown.is-open article')
            .filter({hasText: new RegExp(documento, 'i')})
            .first();
        await expect(resultado).toBeVisible({ timeout: 10_000 });
        await resultado.click();
        await esperarCargaOverlay(this.page);
    }

    private textoBusquedaUbigeo(ubigeo: string): string {
        return ubigeo.split('-')[0].trim();
    }

    private async seleccionarUbigeo(input: Locator, ubigeo: string): Promise<void> {
        const busqueda = this.textoBusquedaUbigeo(ubigeo);

        await expect(input).toBeVisible();
        await input.click();
        await input.fill(busqueda);

        const panelAbierto = this.page.locator('.v-select-base-options.is-open');
        const opcion = panelAbierto.getByText(ubigeo, {exact: false}).first();

        await expect(opcion).toBeVisible({timeout: 10_000});
        await opcion.click();
        await esperarDebounce(this.page, 300, 'Esperando cierre de ubigeo');
        await esperarCargaOverlay(this.page);
    }

    private async resolverInputPuntoLlegada(): Promise<Locator> {
        const enSeccionLlegada = this.inputUbigeoEnSeccion('Punto de llegada');
        if (await enSeccionLlegada.isVisible().catch(() => false)) {
            return enSeccionLlegada;
        }
        return this.page.getByRole('textbox', {name: this.nombreInputUbigeo}).last();
    }

    async completarPuntoPartidaYLlegada(
        origen: string,
        destino: string,
        direccionPartida: string,
        direccionLlegada: string
    ) {
        await this.seleccionarUbigeo(this.inputUbigeoEnSeccion('Datos de partida'), origen);
        await this.seleccionarUbigeo(await this.resolverInputPuntoLlegada(), destino);

        const inputDireccionPartida = this.seccionUbigeo('Datos de partida')
            .locator('[id="pv_cmp-guia-remision-transportista_cmp-card-ubigeo:form-ubigeo_v-input:direccion-partida"]')
        await inputDireccionPartida.click();
        await inputDireccionPartida.fill(direccionPartida);

        const inputDireccionLlegada = this.page
            .locator('[id="pv_cmp-guia-remision-transportista_cmp-card-ubigeo:form-ubigeo_v-input:direccion-destion"]')
        await inputDireccionLlegada.click();
        await inputDireccionLlegada.fill(direccionLlegada);
    }

    async buscarYSeleccionarItem(codigo: string) {
        await this.inputBuscarItem.click();
        await this.inputBuscarItem.fill(codigo);
        await this.page.getByText(codigo, {exact: false}).first().click();
    }

    async definirPesoTotal(peso: string) {
        await this.page.locator('div').filter({hasText: /^Peso total \(Kg\)$/}).nth(3).click();
        await this.page.locator('.v-select-base-options.is-open')
            .getByText('Peso total (Kg)', {exact: true})
            .click();
        await this.inputPeso.click();
        await this.inputPeso.fill(peso);
    }

    async vincularComprobante(
        tipo: 'BOLETA_DE_VENTA' | 'FACTURA',
        serie: string,
        correlativo: string,
        rucProveedor: string
    ) {
        await esperarCargaOverlay(this.page);
        const botonVincular = this.page.locator('[id="pv_cmp-guia-remision-transportista_cmp-head-guia:form-head_v-button:vincular-comprobante"]');
        await botonVincular.first().click();
        await this.page.locator('[id="pv_cmp-guia-remision-transportista_agregar-comprobante:form-drape-agregar-comprobante_v-button:agrega-comprobante"]').first().click();
        const selectTipo = this.page.locator('[idx="pv_cmp-guia-remision-transportista_card-vincular-comprobante:form-agregar-comprobante_v-select:tipo-comprobante"]');
        await selectTipo.first().click();
        const opcion = tipo === 'BOLETA_DE_VENTA' ? 'BOLETA DE VENTA' : 'FACTURA';
        await this.page.locator('.v-select-base-options.is-open')
            .getByText(opcion, {exact: true})
            .click();
        await this.page.locator('[id="pv_cmp-guia-remision-transportista_card-vincular-comprobante:form-agregar-comprobante_v-input:comprobante-serie"  ]').fill(serie);
        await this.page.locator('[id="pv_cmp-guia-remision-transportista_card-vincular-comprobante:form-agregar-comprobante_v-input:comprobante-correlativo"]').fill(correlativo);
        await this.page.locator('[id="pv_cmp-guia-remision-transportista_card-vincular-comprobante:form-agregar-comprobante_v-input:comprobante-ruc"]').fill(rucProveedor);
        await this.page.getByRole('button', {name: 'Añadir'}).click();
        await this.page.getByRole('button', {name: 'Guardar comprobante'}).click();
    }

    async completarAutorizacionEspecial(numeroAutorizacion: string, tuce?: string) {
        await this.page.locator('[id="pv_cmp-guia-remision-transportista_cmp-card-transporte:form-transporte_v-checkbox:autoriza-traslado-carga"]').locator('..').click();
        await this.page.locator('[id="pv_cmp-guia-remision-transportista_cmp-card-transporte:form-transporte_v-input:numero-autorizacion"]').fill(numeroAutorizacion);
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
