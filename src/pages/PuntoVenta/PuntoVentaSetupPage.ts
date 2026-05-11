/**
 * Page Object de setup idempotente para PuntoVenta.
 *
 * Aplica el patrón "Find or Create": antes de crear cualquier dato,
 * verifica si ya existe. Si existe → skip. Si no → crear.
 *
 * Compone internamente:
 *  - ClientePage (reutiliza formularios de creación de cliente)
 *  - PuntoVentaNavigationPage (reutiliza navegación del módulo)
 *
 * Sigue la arquitectura OOP del POM:
 *  - Encapsula locators privados
 *  - Expone solo métodos semánticos de alto nivel
 *  - Delega la creación de clientes a ClientePage (composición)
 */
import {type Page} from '@playwright/test';
import {ClientePage} from './ClientePage';
import type {
    CampoAdicionalPVConfig,
    ClienteSetupData,
    VendedorData,
} from '../../helpers/PuntoVenta/punto-venta-setup-data.helper';

export class PuntoVentaSetupPage {
    private readonly clientePage: ClientePage;

    constructor(private readonly page: Page) {
        this.clientePage = new ClientePage(page);
    }

    // ═══════════════════════════════════════════════════════════════════
    // Navegación interna
    // ═══════════════════════════════════════════════════════════════════

    /** Navega al módulo Vendedores desde el menú principal */
    async navegarAVendedores(): Promise<void> {
        await this.page.getByText('Clientes y proveedores').click();
        await this.page.getByText('Vendedores').click();
    }

    /** Navega a Ventas y compras → Nueva venta (para entrar a la caja) */
    async navegarANuevaVenta(): Promise<void> {
        await this.page.getByText('Ventas y compras').click();
        await this.page.getByText('Nueva venta', {exact: true}).click();
    }

    /** Entra a la caja existente (click Continuar vendiendo) */
    async continuarVendiendo(): Promise<void> {
        await this.page.getByRole('button', {name: 'Continuar vendiendo'}).click();
    }

    // ═══════════════════════════════════════════════════════════════════
    // VENDEDOR — Find or Create
    // ═══════════════════════════════════════════════════════════════════

    /**
     * Verifica si un vendedor ya existe buscando por documento en la grilla.
     *
     * Flujo: llenar input de búsqueda → Enter → esperar grilla → buscar nombre
     *
     * Input real: id="pv_vendedores_cmp-lista-proveedores-filtro:filters_v-input:busqueda-compuesta"
     *
     * @returns true si el vendedor ya está registrado
     */
    private async vendedorExiste(documento: string, nombre: string): Promise<boolean> {
        const inputBusqueda = this.page.locator(
            '[id="pv_vendedores_cmp-lista-proveedores-filtro:filters_v-input:busqueda-compuesta"]',
        );

        // Esperar a que la grilla cargue
        await inputBusqueda.waitFor({state: 'visible', timeout: 15_000});
        await inputBusqueda.click();
        await inputBusqueda.fill(documento);
        await inputBusqueda.press('Enter');
        await this.page.waitForTimeout(2000);

        // Buscar el nombre del vendedor en los resultados de la grilla
        const resultado = this.page.getByText(nombre).first();
        const existe = await resultado.isVisible().catch(() => false);

        // Limpiar búsqueda
        await inputBusqueda.clear();
        await inputBusqueda.press('Enter');
        await this.page.waitForTimeout(500);

        return existe;
    }

    /**
     * Crea un vendedor llenando todo el formulario.
     * Locators extraídos del codegen: casos.ts líneas 722-774
     */
    private async crearVendedor(datos: VendedorData): Promise<void> {
        // Abrir formulario — botón "+ Crear vendedor"
        // Usa idx (no id): pv_cmp-header-relacionado-entidad_opciones_add_relacionado_vendedor:button
        await this.page.locator(
            '[idx="pv_cmp-header-relacionado-entidad_opciones_add_relacionado_vendedor:button"]',
        ).click();

        // Documento
        const inputDoc = this.page.locator(
            '[id="pv_proveedores_form-registro-relacionado-entidad:form_basico:v-input:num-document"]',
        );
        await inputDoc.click();
        await inputDoc.fill(datos.documento);

        // Nombre
        await this.page
            .getByRole('textbox', {name: 'Ej. Ladrillería Distribuidora'})
            .fill(datos.nombre);

        // Meta monto
        const inputMetaMonto = this.page.locator(
            '[id="pv_vendedores_form-registro-relacionado-entidad:form_basico:v-input:meta-monto"]',
        );
        await inputMetaMonto.click();
        await inputMetaMonto.fill(datos.metaMonto);

        // Meta cantidad
        const inputMetaCantidad = this.page.locator(
            '[id="pv_vendedores_form-registro-relacionado-entidad:form_basico:v-input:meta-cantidad"]',
        );
        await inputMetaCantidad.click();
        await inputMetaCantidad.fill(datos.metaCantidad);

        // Zona
        const inputZona = this.page.getByRole('textbox', {name: 'Lima sur'});
        await inputZona.click();
        await inputZona.fill(datos.zona);

        // Dirección
        await this.page
            .getByRole('textbox', {name: 'Ej. Calle Los Manzanos 120,'})
            .fill(datos.direccion);

        // Teléfono
        const inputTel = this.page.getByRole('textbox', {name: 'Ej. 954588556'});
        await inputTel.click();
        await inputTel.fill(datos.telefono);

        // Email
        const inputEmail = this.page.getByRole('textbox', {name: 'Ej. usuario@correo.com'});
        await inputEmail.click();
        await inputEmail.fill(datos.email);

        // Confirmar creación (botón submit del formulario)
        await this.page.getByRole('button', {name: 'Crear vendedor'}).click();

        // Cerrar modal de confirmación
        await this.page.locator('.v-modal > div').first().click();
    }

    /**
     * Asegura que el vendedor exista. Si no existe, lo crea.
     * Después de crear, verifica que aparezca en la grilla (validación post-creación).
     * @returns true si se creó (dato nuevo), false si ya existía
     */
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

        // Validación post-creación: verificar que ahora sí aparece en la grilla
        const creadoOk = await this.vendedorExiste(datos.documento, datos.nombre);
        if (creadoOk) {
            console.log(`   Vendedor "${datos.nombre}" creado y verificado en la grilla`);
        } else {
            console.warn(`  Vendedor "${datos.nombre}" creado, pero no se encontró en la grilla`);
        }

        return true;
    }

    // ═══════════════════════════════════════════════════════════════════
    // CLIENTES — Find or Create (delega a ClientePage)
    // ═══════════════════════════════════════════════════════════════════

    /**
     * Verifica si un cliente ya existe buscando en el selector de clientes
     * de la caja de venta.
     */
    private async clienteExiste(documento: string): Promise<boolean> {
        await this.clientePage.buscarCliente(documento);
        await this.page.waitForTimeout(1500);

        // Si aparece el documento en la lista de resultados, el cliente existe
        const resultado = this.page.getByText(documento).first();
        const existe = await resultado.isVisible().catch(() => false);

        // Limpiar el buscador presionando Escape o limpiando
        try {
            await this.page.locator('#undefined_delete').click({timeout: 2000});
        } catch {
            // Si no hay botón de borrar, presionar Escape
            await this.page.keyboard.press('Escape');
        }

        return existe;
    }

    /**
     * Asegura que un cliente DNI exista. Si no existe, lo crea.
     * Delega la creación al ClientePage ya existente (composición OOP).
     */
    async asegurarClienteDNI(datos: ClienteSetupData): Promise<boolean> {
        console.log(`  🔍 Verificando cliente DNI ${datos.documento}...`);

        const existe = await this.clienteExiste(datos.documento);

        if (existe) {
            console.log(`  ✅ Cliente DNI "${datos.documento}" ya existe`);
            return false;
        }

        console.log(`  🔧 Creando cliente DNI "${datos.documento}"...`);
        await this.clientePage.crearClienteDNI({
            documento: datos.documento,
            direccion: datos.direccion,
            telefono: datos.telefono,
            email: datos.email,
        });
        // Cerrar modal/overlay de confirmación si aparece
        await this.page.locator('#undefined_delete').click().catch(() => {
        });
        console.log(`  ✓ Cliente DNI "${datos.documento}" creado exitosamente`);
        return true;
    }

    /**
     * Asegura que un cliente RUC exista. Si no existe, lo crea.
     * Delega la creación al ClientePage ya existente (composición OOP).
     */
    async asegurarClienteRUC(datos: ClienteSetupData): Promise<boolean> {
        console.log(`  🔍 Verificando cliente RUC ${datos.documento}...`);

        const existe = await this.clienteExiste(datos.documento);

        if (existe) {
            console.log(`  ✅ Cliente RUC "${datos.documento}" ya existe`);
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
        // Cerrar modal/overlay de confirmación si aparece
        await this.page.locator('#undefined_delete').click().catch(() => {
        });
        console.log(`  ✓ Cliente RUC "${datos.documento}" creado exitosamente`);
        return true;
    }

    // ═══════════════════════════════════════════════════════════════════
    // CAMPOS ADICIONALES — Find or Create
    // ═══════════════════════════════════════════════════════════════════

    /** Abre el panel de Datos opcionales/adicionales dentro de la caja */
    async abrirPanelDatos(): Promise<void> {
        await this.page.getByRole('button', {name: 'Datos'}).click();
        await this.page.waitForTimeout(1000);
    }

    /**
     * Verifica si un campo adicional ya existe buscando su nombre
     * en el panel de datos opcionales.
     */
    private async campoExiste(nombre: string): Promise<boolean> {
        const campo = this.page.getByText(nombre, {exact: true}).first();
        return await campo.isVisible().catch(() => false);
    }

    /**
     * Crea un campo adicional según su tipo.
     *
     * El ERP usa IDs diferentes para campo de selección vs campos genéricos:
     * - Genérico (texto/fecha/número): ...cmp-gestion-campo-adicional-generico_v-input:...
     * - Selección: ...cmp-gestion-campo-adicional-seleccion_v-input:...
     */
    private async crearCampo(campo: CampoAdicionalPVConfig): Promise<void> {
        // 1. Click en "Nuevo campo adicional"
        await this.page.getByText('Nuevo campo adicional').click();

        // 2. Seleccionar tipo
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

    /**
     * Crea un campo genérico (texto, fecha, número).
     * IDs con path: cmp-gestion-campo-adicional-generico
     */
    private async crearCampoGenerico(campo: CampoAdicionalPVConfig): Promise<void> {
        const BASE = 'pv_ventas_cmp-punto-venta_v-modal:cmp-gestion-campo-adicional-generico_v-input';

        // Nombre
        const inputNombre = this.page.locator(`[id="${BASE}:nombre-campo"]`);
        await inputNombre.click();
        await inputNombre.fill(campo.nombre);

        // Documentos → Todos
        await this.page.getByText('Selecciona documentos').click();
        await this.page.getByText('Todos', {exact: true}).first().click();
        await this.page.locator('.v-multiselect-form-header .vector').click();
        await this.page.waitForTimeout(300);

        // Crear campo
        await this.page.locator(`[id="${BASE}:guardar-campo"]`).click();

        // Cerrar modal de confirmación
        await this.page.locator('.v-modal > div').first().click();
    }

    /**
     * Crea un campo de selección con opciones.
     * IDs con path: cmp-gestion-campo-adicional-seleccion
     */
    private async crearCampoSeleccion(campo: CampoAdicionalPVConfig): Promise<void> {
        const BASE = 'pv_ventas_cmp-punto-venta_v-modal:cmp-gestion-campo-adicional-seleccion_v-input';
        // Nombre
        const inputNombre = this.page.locator(`[id="${BASE}:nombre-campo"]`);
        await inputNombre.click();
        await inputNombre.fill(campo.nombre);

        // Documentos → Todos
        await this.page.getByText('Selecciona documentos').click();
        await this.page.getByText('Todos', {exact: true}).first().click();
        await this.page.locator('.v-multiselect-form-header .vector').click();
        await this.page.waitForTimeout(300);

        // Opciones (certificación, producción, etc.)
        if (campo.opciones) {
            for (let i = 0; i < campo.opciones.length; i++) {
                const inputOpcion = this.page.locator(`[id="${BASE}:opcion-${i}"]`);
                await inputOpcion.click();
                await inputOpcion.fill(campo.opciones[i]);
            }

            // Marcar la primera opción como valor por defecto (usa v-checkbox, no v-input)
            // El input está oculto detrás de un <span> custom — forzar click
            await this.page.locator(
                '[id="pv_ventas_cmp-punto-venta_v-modal:cmp-gestion-campo-adicional-seleccion_v-checkbox:valor-por-defecto-0"]',
            ).check({force: true});
        }

        // Crear campo (usa v-button en lugar de v-input)
        await this.page.locator(
            '[id="pv_ventas_cmp-punto-venta_v-modal:cmp-gestion-campo-adicional-seleccion_v-button:guardar-campo"]',
        ).click();

        // Cerrar modal de confirmación
        await this.page.locator('.v-modal > div').first().click();
    }

    /**
     * Asegura que todos los campos adicionales existan.
     * Itera sobre la lista de configuraciones, verificando uno a uno.
     * @returns true si se creó al menos un campo nuevo
     */
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

    /** Guarda los datos opcionales */
    async guardarDatos(): Promise<void> {
        await this.page.getByRole('button', {name: 'Guardar datos'}).click();
    }
}
