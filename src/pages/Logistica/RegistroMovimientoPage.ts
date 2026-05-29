import {expect, type Locator, type Page} from '@playwright/test';
import {FUNCTIONAL_CATALOG} from '../../utils/functional-catalog';
import {runFunctionalAction} from '../../utils/functional-step';
import {esperarDebounce} from '../../utils/wait-helpers';

export class RegistroMovimientoPage {
    constructor(private readonly page: Page) {
    }

    private get btnNuevoMovimiento(): Locator {
        return this.page.locator(
            '[id="lgt_movimientos_content_cmp-header-movimientos.cmp-option-button:nuevo-movimiento"]',
        );
    }

    private get searchInput(): Locator {
        return this.page.getByRole('textbox', {name: 'Buscar por nombre, código o c'});
    }

    public get cantidadInput(): Locator {
        return this.page.locator(
            '[id="lgt_reg-movimiento_cmp-grid-items-movimiento:body_v-grid:body-grilla_v-step:cantidad"]',
        );
    }

    async clickNuevoMovimiento(): Promise<void> {
        await this.btnNuevoMovimiento.click();
    }

    async clickAgregarIngreso(): Promise<void> {
        await this.page.getByText('Agregar ingreso').click();
    }

    async clickAgregarSalida(): Promise<void> {
        await this.page.getByText('Agregar salida').click();
    }

    async clickAgregarTraslado(): Promise<void> {
        await this.page.getByText('Agregar traslado').click();
    }

    async clickAgregarAjuste(): Promise<void> {
        await this.page.getByText('Agregar ajuste').click();
    }

    async seleccionarAlmacen(almacenActual: string, almacenDestino: string): Promise<void> {
        if (almacenActual === almacenDestino) {
            return;
        }
        await this.page
            .locator('div')
            .filter({hasText: new RegExp(`^${this.escapeRegex(almacenActual)}$`)})
            .nth(2)
            .click();
        await esperarDebounce(this.page, 500, 'Esperar renderizado de lista de almacenes (Vue dropdown)');
        await this.page.getByText(almacenDestino).click();
    }

    async seleccionarAlmacenNth(almacenActual: string, almacenDestino: string, nth: number = 2): Promise<void> {
        if (almacenActual === almacenDestino) {
            return;
        }
        await this.page
            .locator('div')
            .filter({hasText: new RegExp(`^${this.escapeRegex(almacenActual)}$`)})
            .nth(nth)
            .click();
        await esperarDebounce(this.page, 500, 'Esperar renderizado de lista de almacenes nth (Vue dropdown)');
        await this.page.getByText(almacenDestino).click();
    }

    async seleccionarAlmacenesTraslado(origenActual: string, origenDestino: string, destinoActual: string, destinoNuevo: string): Promise<void> {
        await this.seleccionarAlmacenNth(origenActual, origenDestino, 2);
        await this.seleccionarAlmacenNth(destinoActual, destinoNuevo, 3);
    }

    async seleccionarAlmacenesTraslado1(
        origenActual: string,
        origenNuevo: string,
        destinoActual: string,
        destinoNuevo: string,
    ): Promise<void> {
        await this.page.getByText(origenActual).first().click();
        await this.page.getByText(origenNuevo).first().click();
        await this.page.getByText(destinoActual).nth(2).click();
        await this.page.getByText(destinoNuevo).nth(1).click();
    }

    async seleccionarMotivo(motivoActual: string, motivoNuevo: string): Promise<void> {
        if (motivoActual === motivoNuevo) {
            return;
        }
        await this.page
            .locator('div')
            .filter({hasText: new RegExp(`^${this.escapeRegex(motivoActual)}$`)})
            .nth(2)
            .click();
        await esperarDebounce(this.page, 500, 'Esperar renderizado de lista de motivos (Vue dropdown)');
        await this.page.getByText(motivoNuevo, {exact: true}).click();
    }

    async seleccionarMotivoDirecto(motivo: string): Promise<void> {
        const opciones = this.page.locator('.v-select-base-options.is-open')
        await opciones.getByText(motivo, {exact: true}).click();
        await opciones.waitFor({state: 'hidden', timeout: 10_000});

    }

    async abrirSelectorMotivo(): Promise<void> {
        await this.page
            .locator('.motivo > .form-control > .v-select > .v-select-form > .v-select-base > .v-select-base-header > .v-select-header-base-form > .v-select-header-form > .v-select-header-form-arrow')
            .click();
    }

    async seleccionarMotivoAjuste(motivoActual: string, motivoNuevo: string): Promise<void> {
        if (motivoActual === motivoNuevo) {
            return;
        }
        await this.page
            .locator('div')
            .filter({hasText: new RegExp(`^${this.escapeRegex(motivoActual)}$`)})
            .nth(3)
            .click();
        await esperarDebounce(this.page, 500, 'Esperar renderizado de lista de motivos div (Vue dropdown)');
        await this.page.getByText(motivoNuevo, {exact: true}).click();
    }

    async buscarItem(codigo: string): Promise<void> {
        await runFunctionalAction(this.page, {
            ...FUNCTIONAL_CATALOG.movimientos.definirAlmacenMotivo,
            flowStep: 'Buscar ítem por código',
            userMessage: 'No se pudo buscar el ítem en la grilla.',
            technicalDetail: 'Falla al interactuar con el input de búsqueda de ítems.',
        }, async () => {
            await this.searchInput.click();
            await this.searchInput.fill(codigo);
            await esperarDebounce(this.page, 500, 'Debounce búsqueda ítem en ERP logistica');
        });
    }

    async seleccionarItemEnResultados(nombre: string): Promise<void> {
        await runFunctionalAction(this.page, {
            ...FUNCTIONAL_CATALOG.movimientos.definirAlmacenMotivo,
            flowStep: 'Seleccionar ítem en resultados',
            userMessage: 'No se pudo seleccionar el ítem en los resultados de búsqueda.',
            technicalDetail: 'Falla al hacer click en el resultado con el texto esperado.',
        }, async () => {
            const itemEnResultados = this.page.getByText(nombre);
            await expect(itemEnResultados).toBeVisible({timeout: 10_000});
            await itemEnResultados.click();
        });
    }

    async seleccionarItemTextoCompleto(textoCompleto: string): Promise<void> {
        await this.page.getByText(textoCompleto).click();
    }

    async seleccionarVariante(nombreVariante: string): Promise<void> {
        await this.page.getByText(nombreVariante).click();
    }

    async seleccionarEquivalente(nombreEquivalente: string): Promise<void> {
        await this.page.getByText(nombreEquivalente).click();
    }

    async llenarCantidad(cantidad: string): Promise<void> {
        await this.cantidadInput.click();
        await this.cantidadInput.fill(cantidad);
    }

    async seleccionarFactorAjuste(tipo: 'Agregar' | 'Quitar'): Promise<void> {
        await this.page
            .locator('div')
            .filter({hasText: /^Agregar$/})
            .nth(1)
            .click();

        if (tipo === 'Agregar') {
            await this.page
                .locator('[id="lgt_reg-movimiento_cmp-grid-items-movimiento:body_v-grid:body-grilla_v-select:factor_v-option:opcion-1"]')
                .getByText('Agregar')
                .click();
        } else {
            await this.page.getByText('Quitar').click();
        }
    }

    async clickRegistrarIngreso(): Promise<void> {
        await runFunctionalAction(this.page, FUNCTIONAL_CATALOG.movimientos.registrarIngreso, async () => {
            await this.page.getByRole('button', {name: 'REGISTRAR INGRESO'}).click();
        });
    }

    async clickRegistrarSalida(): Promise<void> {
        await runFunctionalAction(this.page, {
            ...FUNCTIONAL_CATALOG.movimientos.registrarIngreso,
            flowStep: 'Registrar salida de almacén',
            userMessage: 'No se pudo registrar la salida de almacén.',
            technicalDetail: 'Falla al ejecutar la acción de registro de salida.',
        }, async () => {
            await this.page.locator('div').filter({hasText: /^REGISTRAR SALIDA$/}).first().click();
        });
    }

    async clickRegistrarYDespachar(): Promise<void> {
        await runFunctionalAction(this.page, {
            ...FUNCTIONAL_CATALOG.movimientos.registrarIngreso,
            flowStep: 'Confirmar registro y despacho',
            userMessage: 'No se pudo completar el registro y despacho de la salida.',
            technicalDetail: 'Falla al confirmar la operación Registrar y despachar.',
        }, async () => {
            await this.page.getByText('Registrar y despachar').click();
        });
    }

    async clickRegistrarSoloSalida(): Promise<void> {
        await this.page.getByText('Registrar', {exact: true}).click();
    }

    async clickTextoRegistrarSalida(): Promise<void> {
        await this.page.getByText('REGISTRAR SALIDA').click();
    }

    async clickRegistrarTraslado(): Promise<void> {
        await this.page.getByRole('button', {name: 'REGISTRAR TRASLADO'}).click();
    }

    async clickRegistrarAjuste(): Promise<void> {
        await this.page.getByRole('button', {name: 'REGISTRAR AJUSTE'}).click();
    }

    async clickActualizarIngreso(): Promise<void> {
        await this.page.getByRole('button', {name: 'ACTUALIZAR INGRESO'}).click();
    }

    async clickActualizarSalida(): Promise<void> {
        await this.page.getByRole('button', {name: 'ACTUALIZAR SALIDA'}).click();
    }

    async clickClonarIngreso(): Promise<void> {
        
        await expect(
            this.page.locator('.v-select-header-form.form').first()
        ).not.toHaveText('Seleccionar', {timeout: 15000});

        await this.page.locator('table tbody tr').first().waitFor({state: 'visible'});

        await this.page.getByRole('button', {name: 'CLONAR INGRESO'}).click();
    }

    async clickLimpiar(): Promise<void> {
        await this.page.getByRole('button', {name: 'LIMPIAR'}).click();
    }

    async clickLimpiarConfirmacion(): Promise<void> {
        await this.page.getByRole('button', {name: 'Limpiar', exact: true}).click();
        await esperarDebounce(this.page, 1000, 'Animación y limpieza de items de la tabla tras confirmación');
    }

    async clickCancelar(): Promise<void> {
        await this.page.getByRole('button', {name: 'CANCELAR'}).click();
    }

    async clickDatosOpcionales(): Promise<void> {
        await this.page.getByRole('button', {name: 'Datos opcionales'}).click();
    }

    async cerrarModal(): Promise<void> {
        await this.page.locator('.v-modal > div').first().click();
    }

    async eliminarItemGrilla(): Promise<void> {
        await this.page
            .locator('[id="lgt_reg-movimiento_cmp-grid-items-movimiento:body_v-grid:body-grilla_div:btn-eliminar-item"]')
            .click();
    }

    async clickCeldaCantidad(): Promise<void> {
        await this.page.locator('td:nth-child(2) > .cantidad').click();
    }

    private escapeRegex(str: string): string {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}
