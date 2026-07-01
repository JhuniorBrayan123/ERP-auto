import {expect, type Locator, type Page, test} from '@playwright/test';
import {esperarCargaOverlay, esperarDebounce} from '@utils/wait-helpers';

export class GuiaRemitentePage {
    constructor(public readonly page: Page) {
    }

    private readonly nombreInputUbigeo =
        /Busca por distrito, ciudad, región o código de ubigeo/i;

    private seccionPunto(titulo: 'Punto de partida' | 'Punto de llegada'): Locator {
        return this.page
            .locator('article')
            .filter({has: this.page.getByText(titulo, {exact: true})});
    }

    private inputUbigeoEnSeccion(titulo: 'Punto de partida' | 'Punto de llegada'): Locator {
        return this.seccionPunto(titulo).getByRole('textbox', {name: this.nombreInputUbigeo});
    }

    private readonly inputDireccionPartida = this.page.locator(
        '[id="pv_cmp-guia-remision-remitente_cmp-card-inicio:form-inicio_v-input:direccion-partida"]'
    );

    get btnNuevaGuia() {
        return this.page.getByRole('button', {name: 'Nueva guía remisión remitente'});
    }

    get btnEmitir() {
        return this.page.getByRole('button', {name: 'Emitir'});
    }

    get btnGuardar() {
        return this.page.getByRole('button', {name: 'Guardar', exact: true});
    }

    get fechaEmisionPicker() {
        return this.page.locator('[id="pv_cmp-guia-remision-remitente_cmp-card-inicio:form-inicio_v-datepicker:fecha-emision"]');
    }

    get fechaTrasladoPicker() {
        return this.page.locator('[id="pv_cmp-guia-remision-remitente_cmp-card-inicio:form-inicio_v-datepicker:fecha-inicio-traslado"]');
    }

    get inputDestinatario() {
        return this.page.locator('input[id="pv_cmp-guia-remision-remitente_cmp-card-destinatario:form-destino_v-input:filtrar-entidad"]');
    }

    get inputTransportista() {
        return this.page.locator('input[id="pv_cmp-guia-remision-remitente_cmp-card-transporte:form-transporte-transportista_v-input:filtrar-entidad"]');
    }

    get inputConductor() {
        return this.page.locator('input[id="pv_cmp-guia-remision-remitente_cmp-card-transporte:form-transporte-conductor_v-input:filtrar-entidad"]');
    }

    get inputMTC() {
        return this.page.locator('[id="pv_cmp-guia-remision-remitente_cmp-card-transporte:form-transporte_v-input:registro-mtc"]');
    }

    get inputDam() {
        return this.page.getByRole('textbox', {name: /2024\/\d{3}-\d{4}/});
    }

    get inputBultos() {
        return this.page.getByRole('textbox', {name: 'Ej. 10'});
    }

    get inputBuscarItem() {
        return this.page.getByRole('textbox', {name: 'Escanea o busca por nombre, c'});
    }

    async abrirNuevaGuia() {
        await this.btnNuevaGuia.click();
        await esperarDebounce(this.page, 500, 'Esperando render de Nueva Guia');
    }

    private async seleccionarOpcionDropdown(triggerLocator: string | RegExp, opcionTexto: string, triggerIndex = 2) {
        await this.page.locator('div').filter({hasText: triggerLocator}).nth(triggerIndex).click();
        await this.page.locator('.v-select-base-options.is-open')
            .getByText(opcionTexto, {exact: true})
            .click();
    }

    async esperarFormularioEstable(timeout = 35_000): Promise<void> {
        await esperarCargaOverlay(this.page, timeout);
    }
    async seleccionarMotivo(motivo: string) {
        await this.esperarFormularioEstable();
        await this.seleccionarOpcionDropdown(/^VENTA$/, motivo);
    }

    async seleccionarModalidad(modalidad: 'PUBLICA' | 'PRIVADA') {
        await this.seleccionarOpcionDropdown(/^PRIVADA$/, modalidad, 3);
    }

    async seleccionarDestinatario(documento: string, resultadoTexto: string) {
        await this.inputDestinatario.click();
        await this.inputDestinatario.fill(documento);
        await this.page.locator('[id*="card-destinatario"][id*="seleccion-entidad"]')
            .filter({hasText: resultadoTexto})
            .click();
    }

    async seleccionarDestinatarioSiAplica(documento: string, resultadoTexto: string): Promise<void> {
        if (!(await this.inputDestinatario.isVisible().catch(() => false))) {
            return;
        }
        await this.seleccionarDestinatario(documento, resultadoTexto);
    }

    async seleccionarComprador(documento: string, resultadoTexto: string): Promise<void> {
        const seccionComprador = this.page
            .locator('article')
            .filter({has: this.page.getByText('Datos del comprador', {exact: true})});

        const inputComprador = seccionComprador.getByRole('textbox', {name: 'Digite N° de documento'});
        await inputComprador.click();
        await inputComprador.fill(documento);
        await seccionComprador
            .locator('[id*="seleccion-entidad"]')
            .filter({hasText: resultadoTexto})
            .first()
            .click();
    }

    private textoBusquedaUbigeo(ubigeo: string): string {
        return ubigeo.split('-')[0].trim();
    }

    private async resolverInputPuntoLlegada(): Promise<Locator> {
        const enSeccionLlegada = this.inputUbigeoEnSeccion('Punto de llegada');
        if (await enSeccionLlegada.isVisible().catch(() => false)) {
            return enSeccionLlegada;
        }
        
        return this.page.getByRole('textbox', {name: this.nombreInputUbigeo}).last();
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
    }

    async seleccionarPuntoPartida(ubigeo: string): Promise<void> {
        await this.seleccionarUbigeo(this.inputUbigeoEnSeccion('Punto de partida'), ubigeo);
    }

    async seleccionarPuntoLlegada(ubigeo: string): Promise<void> {
        await this.seleccionarUbigeo(await this.resolverInputPuntoLlegada(), ubigeo);
    }

    async completarPuntoPartidaYLlegada(
        puntoPartida: string,
        puntoLlegada: string,
        direccionPartida: string,
        direccionLlegada: string
    ): Promise<void> {
        await this.seleccionarPuntoPartida(puntoPartida);
        await this.seleccionarPuntoLlegada(puntoLlegada);

        await this.inputDireccionPartida.click();
        await this.inputDireccionPartida.fill(direccionPartida);

        const inputDireccionLlegada = this.seccionPunto('Punto de llegada')
            .getByRole('textbox', {name: /Ej\. Calle Manzanos/i});
        await inputDireccionLlegada.click();
        await inputDireccionLlegada.fill(direccionLlegada);
    }

    async seleccionarConductor(documento: string) {
        await this.inputConductor.click();
        await this.inputConductor.fill(documento);
        await this.page
            .locator('[id*="card-transporte"][id*="conductor"][id*="seleccion-entidad"]')
            .filter({hasText: new RegExp(documento)})
            .first()
            .click();
    }

    async completarPlacaYLicencia(placa: string, licencia: string) {
        await this.page.getByRole('textbox', {name: 'Ej. A1A000'}).click();
        await this.page.getByRole('textbox', {name: 'Ej. A1A000'}).fill(placa);
        await this.page.getByRole('textbox', {name: 'Ej. A23456723'}).click();
        await this.page.getByRole('textbox', {name: 'Ej. A23456723'}).fill(licencia);
    }

    async seleccionarTransportista(documento: string) {
        await this.inputTransportista.click();
        await this.inputTransportista.fill(documento);
        await this.page
            .locator('[id*="card-transporte"][id*="transportista"][id*="seleccion-entidad"]')
            .filter({hasText: new RegExp(documento)})
            .first()
            .click();
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
        await this.page.getByText(codigoONombre, {exact: false}).first().click();
    }

    async definirPesoTotal(tipo: 'Kg' | 'Tn', peso: string) {
        await this.page.locator('div').filter({hasText: /^Peso total \(Kg\)$/}).nth(3).click();
        await this.page.locator('.v-select-base-options.is-open')
            .getByText(`Peso total (${tipo})`, {exact: true})
            .click();
        await this.page.getByRole('textbox', {name: tipo}).click();
        await this.page.getByRole('textbox', {name: tipo}).fill(peso);
    }

    async anadirContenedor(numero: string, precinto: string) {
        await this.page.locator('div').filter({hasText: /^Sin Contenedor$/}).nth(3).click();
        await this.page.getByText('Con Contenedor').click();
        await this.page.locator('[id="pv_cmp-guia-remision-remitente_cmp-card-inicio:form-inicio_v-input:contenedor-1"]').fill(numero);
        await this.page.locator('[id="pv_cmp-guia-remision-remitente_cmp-card-inicio:form-inicio_v-input:precinto-1"]').click();
        await this.page.locator('[id="pv_cmp-guia-remision-remitente_cmp-card-inicio:form-inicio_v-input:precinto-1"]').fill(precinto);
    }

    async seleccionarTrasladoVehiculosM1() {
        await this.page.locator('.v-checkbox-default-label.v-h6 > span').first().click();
    }

    async seleccionarTipoOperacion(tipo: 'VENTA' | 'COMPRA') {
        await this.esperarFormularioEstable();
        await this.seleccionarOpcionDropdown(/^VENTA$/, tipo);
    }

    async vincularComprobanteEnModal(serie: string, correlativo: string) {
        await test.step('Vincular comprobante a la guía', async () => {
            await this.page.getByRole('button', {name: 'Vincular comprobante'}).click();
            await this.page.locator(
                `[id="pv_cmp-guia-remision-remitente_cmp-modal-vincular-comprobante:form-vincular-comprobante_v-select:serie-comprobante"] div`
            ).filter({hasText: new RegExp(`^${serie}$`)}).click();
            await this.page.getByText(serie).nth(1).click();
            await this.page.getByRole('textbox', {name: 'Ej. 0075'}).click();
            await this.page.getByRole('textbox', {name: 'Ej. 0075'}).fill(correlativo);
            await this.page.getByRole('button', {name: 'Buscar'}).click();

            await expect(this.page.locator('body')).toContainText(`${serie}-${correlativo}`);
            await this.page.getByRole('button', {name: 'Vincular y crear guía'}).click();
            await expect(this.page.getByText('Comprobante vinculado')).toBeVisible();
        });
    }


    async activarContenedorSinDatos() {
        await this.page.locator('div').filter({hasText: /^Sin Contenedor$/}).nth(2).click();
        await this.page.getByText('Con Contenedor').click();
    }

    async seleccionarProveedor(documento: string) {
        const inputProveedor = this.page.locator('input[id="pv_cmp-guia-remision-remitente_cmp-card-inicio:form-inicio-proveedor_v-input:filtrar-entidad"]');
        await inputProveedor.click();
        await inputProveedor.fill(documento);
        const resultado = this.page
            .locator('[id*="form-inicio-proveedor"][id*="seleccion-entidad"]')
            .filter({hasText: new RegExp(documento, 'i')})
            .first();
        await expect(resultado).toBeVisible({ timeout: 10_000 });
        await resultado.click();
    }

    async emitirGuia() {
        await this.btnEmitir.click();
    }

    async guardarGuia() {
        await this.btnGuardar.click();
    }
}
