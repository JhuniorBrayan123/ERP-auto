import {type Page} from '@playwright/test';
import {ClientePage} from './ClientePage';
import {type ConductorData, ConductorPage} from './ConductorPage';
import type {
    CampoAdicionalPVConfig,
    ClienteSetupData,
    VendedorData,
} from '@helpers/PuntoVenta/punto-venta-setup-data.helper';
import {esperarCargaOverlay} from "@utils/wait-helpers";

export class PuntoVentaSetupPage {
    private readonly clientePage: ClientePage;
    private readonly conductorPage: ConductorPage;

    constructor(private readonly page: Page) {
        this.clientePage = new ClientePage(page);
        this.conductorPage = new ConductorPage(page);
    }

    async navegarAVendedores(): Promise<void> {
        await this.page.getByText('Clientes y proveedores').click();
        await this.page.getByText('Vendedores').click();
    }

    async navegarAConductores(): Promise<void> {
        await this.salirDeCaja();
        await this.page.getByText('Clientes y proveedores').click();
        await this.page.getByText('Conductores').click();
    }

    private async salirDeCaja(): Promise<void> {
        await this.page.locator('.v-icon-back .icon').click();
    }

    async navegarANuevaVenta(): Promise<void> {
        await this.page.getByText('Ventas y compras').click();
        await this.page.getByText('Nueva venta', {exact: true}).click();
    }

    async continuarVendiendo(): Promise<void> {
        await this.page.getByRole('button', {name: 'Continuar vendiendo'}).click();
    }

    private async vendedorExiste(documento: string, nombre: string): Promise<boolean> {
        const inputBusqueda = this.page.locator(
            '[id="pv_vendedores_cmp-lista-proveedores-filtro:filters_v-input:busqueda-compuesta"]',
        );

        await inputBusqueda.waitFor({state: 'visible', timeout: 30_000});
        await inputBusqueda.click();
        await inputBusqueda.fill(documento);
        await inputBusqueda.press('Enter');
        await this.page.waitForTimeout(2000);

        const resultado = this.page.getByText(nombre).first();
        const existe = await resultado.isVisible().catch(() => false);

        await inputBusqueda.clear();
        await inputBusqueda.press('Enter');
        await this.page.waitForTimeout(500);

        return existe;
    }

    private async crearVendedor(datos: VendedorData): Promise<void> {
        await this.page.locator(
            '[idx="pv_cmp-header-relacionado-entidad_opciones_add_relacionado_vendedor:button"]',
        ).click();

        const inputDoc = this.page.locator(
            '[id="pv_proveedores_form-registro-relacionado-entidad:form_basico:v-input:num-document"]',
        );
        await inputDoc.click();
        await inputDoc.fill(datos.documento);

        await this.page
            .getByRole('textbox', {name: 'Ej. Ladrillería Distribuidora'})
            .fill(datos.nombre);

        const inputMetaMonto = this.page.locator(
            '[id="pv_vendedores_form-registro-relacionado-entidad:form_basico:v-input:meta-monto"]',
        );
        await inputMetaMonto.click();
        await inputMetaMonto.fill(datos.metaMonto);

        const inputMetaCantidad = this.page.locator(
            '[id="pv_vendedores_form-registro-relacionado-entidad:form_basico:v-input:meta-cantidad"]',
        );
        await inputMetaCantidad.click();
        await inputMetaCantidad.fill(datos.metaCantidad);

        const inputZona = this.page.getByRole('textbox', {name: 'Lima sur'});
        await inputZona.click();
        await inputZona.fill(datos.zona);

        await this.page
            .getByRole('textbox', {name: 'Ej. Calle Los Manzanos 120,'})
            .fill(datos.direccion);

        const inputTel = this.page.getByRole('textbox', {name: 'Ej. 954588556'});
        await inputTel.click();
        await inputTel.fill(datos.telefono);

        const inputEmail = this.page.getByRole('textbox', {name: 'Ej. usuario@correo.com'});
        await inputEmail.click();
        await inputEmail.fill(datos.email);

        await this.page.getByRole('button', {name: 'Crear vendedor'}).click();

        await this.page.locator('.v-modal > div').first().click();
    }

    async asegurarVendedor(datos: VendedorData): Promise<boolean> {
        console.log(`   Verificando vendedor ${datos.documento}...`);

        const existe = await this.vendedorExiste(datos.documento, datos.nombre);

        if (existe) {
            console.log(`   Vendedor "${datos.nombre}" ya existe`);
            return false;
        }

        console.log(`   Creando vendedor "${datos.nombre}"...`);
        await this.crearVendedor(datos);
        await this.page.waitForTimeout(2000);

        const creadoOk = await this.vendedorExiste(datos.documento, datos.nombre);
        if (creadoOk) {
            console.log(`   Vendedor "${datos.nombre}" creado y verificado en la grilla`);
        } else {
            console.warn(`  Vendedor "${datos.nombre}" creado, pero no se encontró en la grilla`);
        }

        return true;
    }

    private async clienteExiste(documento: string): Promise<boolean> {
        await this.clientePage.buscarCliente(documento);
        await this.page.waitForTimeout(1500);

        const resultado = this.page.getByText(documento).first();
        const existe = await resultado.isVisible().catch(() => false);

        try {
            await this.page.locator('#undefined_delete').click({timeout: 2000});
        } catch {

            await this.page.keyboard.press('Escape');
        }

        return existe;
    }

    async asegurarClienteDNI(datos: ClienteSetupData): Promise<boolean> {
        console.log(`  Verificando cliente DNI ${datos.documento}...`);

        const existe = await this.clienteExiste(datos.documento);

        if (existe) {
            console.log(`  Cliente DNI "${datos.documento}" ya existe`);
            return false;
        }

        console.log(`   Creando cliente DNI "${datos.documento}"...`);
        await this.clientePage.crearClienteDNI({
            documento: datos.documento,
            direccion: datos.direccion,
            telefono: datos.telefono,
            email: datos.email,
        });
        await this.page.locator('#undefined_delete').click().catch(() => {
        });
        console.log(`  ✓ Cliente DNI "${datos.documento}" creado exitosamente`);
        return true;
    }

    async asegurarClienteRUC(datos: ClienteSetupData): Promise<boolean> {
        console.log(`  Verificando cliente RUC ${datos.documento}...`);

        const existe = await this.clienteExiste(datos.documento);

        if (existe) {
            console.log(`  Cliente RUC "${datos.documento}" ya existe`);
            return false;
        }

        console.log(`  🔧 Creando cliente RUC "${datos.documento}"...`);
        await this.clientePage.crearClienteRUC({
            documento: datos.documento, 
            razonSocial: datos.razonSocial!,
            direccion: datos.direccion,
            telefono: datos.telefono,
            email: datos.email,
        });
        await this.page.locator('#undefined_delete').click().catch(() => {
        });
        console.log(`  ✓ Cliente RUC "${datos.documento}" creado exitosamente`);
        return true;
    }

    async abrirPanelDatos(): Promise<void> {
        await this.page.getByRole('button', {name: 'Datos'}).click();
        await this.page.waitForTimeout(1000);
    }

    private async campoExiste(nombre: string): Promise<boolean> {
        const campo = this.page.getByText(nombre, {exact: true}).first();
        return await campo.isVisible().catch(() => false);
    }

    private async crearCampo(campo: CampoAdicionalPVConfig): Promise<void> {
        await this.page.getByText('Nuevo campo adicional').click();

        switch (campo.tipo) {
            case 'texto':
                await this.page.getByText('Campo de texto').click();
                break;
            case 'fecha':
                await this.page.getByText('Campo de fecha').click();
                break;
            case 'seleccion':
                await this.page.getByText('Campo de selección').click();
                break;
            case 'numero':
                await this.page.getByText('Campo de número').click();
                break;
        }

        if (campo.tipo === 'seleccion') {
            await this.crearCampoSeleccion(campo);
        } else {
            await this.crearCampoGenerico(campo);
        }
    }

    private async crearCampoGenerico(campo: CampoAdicionalPVConfig): Promise<void> {
        const BASE = 'pv_ventas_cmp-punto-venta_v-modal:cmp-gestion-campo-adicional-generico_v-input';

        const inputNombre = this.page.locator(`[id="${BASE}:nombre-campo"]`);
        await inputNombre.click();
        await inputNombre.fill(campo.nombre);

        
        await this.page.getByText('Selecciona documentos').click();
        await this.page.locator('.v-checkbox-default-label:visible').filter({hasText: /^Todos$/}).first().click();
        await this.page.locator('.v-multiselect-form-header .vector').click();
        await this.page.waitForTimeout(300);

        await this.page.locator(`[id="${BASE}:guardar-campo"]`).click();

        await this.page.locator('.v-modal > div').first().click();
    }

    private async crearCampoSeleccion(campo: CampoAdicionalPVConfig): Promise<void> {
        const BASE = 'pv_ventas_cmp-punto-venta_v-modal:cmp-gestion-campo-adicional-seleccion_v-input';
        const inputNombre = this.page.locator(`[id="${BASE}:nombre-campo"]`);
        await inputNombre.click();
        await inputNombre.fill(campo.nombre);

        
        await this.page.getByText('Selecciona documentos').click();
        await this.page.locator('.v-checkbox-default-label:visible').filter({hasText: /^Todos$/}).first().click();
        await this.page.locator('.v-multiselect-form-header .vector').click();
        await this.page.waitForTimeout(300);

        if (campo.opciones) {
            for (let i = 0; i < campo.opciones.length; i++) {
                const inputOpcion = this.page.locator(`[id="${BASE}:opcion-${i}"]`);
                await inputOpcion.click();
                await inputOpcion.fill(campo.opciones[i]);
            }

            await this.page.locator(
                '[id="pv_ventas_cmp-punto-venta_v-modal:cmp-gestion-campo-adicional-seleccion_v-checkbox:valor-por-defecto-0"]',
            ).check({force: true});
        }

        await this.page.locator(
            '[id="pv_ventas_cmp-punto-venta_v-modal:cmp-gestion-campo-adicional-seleccion_v-button:guardar-campo"]',
        ).click();

        await this.page.locator('.v-modal > div').first().click();
    }

    async asegurarCamposAdicionales(campos: CampoAdicionalPVConfig[]): Promise<boolean> {
        let creadoAlguno = false;

        for (const campo of campos) {
            const yaExiste = await this.campoExiste(campo.nombre);

            if (yaExiste) {
                console.log(`     Campo ${campo.tipo} "${campo.nombre}" ya existe`);
            } else {
                console.log(`     Creando campo ${campo.tipo} "${campo.nombre}"...`);
                await this.crearCampo(campo);
                await this.page.waitForTimeout(800);
                console.log(`     Campo ${campo.tipo} "${campo.nombre}" creado`);
                creadoAlguno = true;
            }
        }

        if (!creadoAlguno) {
            console.log('   Todos los campos adicionales ya existen');
        }

        return creadoAlguno;
    }

    async asegurarConductor(datos: ConductorData): Promise<boolean> {
        console.log(`   Verificando conductor ${datos.documento}...`);

        await this.navegarAConductores();
        await esperarCargaOverlay(this.page)
        const existe = await this.conductorExiste(datos.documento);

        if (existe) {
            console.log(`  Conductor "${datos.nombre}" ya existe`);
            return false;
        }

        console.log(`  Creando conductor "${datos.nombre}"...`);
        await this.conductorPage.crearConductor(datos);
        await this.page.waitForTimeout(2000);
        console.log(`  Conductor "${datos.nombre}" creado exitosamente`);
        return true;
    }

    private async conductorExiste(documento: string): Promise<boolean> {
        await this.conductorPage.buscarConductor(documento);

        const resultado = this.page.locator('tbody').getByText(documento).first();
        return await resultado.isVisible().catch(() => false);
    }

    async guardarDatos(): Promise<void> {
        await this.page.getByRole('button', {name: 'Guardar datos'}).click();
    }
}
