import {expect, type Locator, type Page} from '@playwright/test';

/**
 * Page Object para Kardex total y Kardex por producto.
 *
 * Responsabilidades:
 * - Buscar por código en Kardex
 * - Expandir almacenes
 * - Acceder a Kardex por producto
 * - Ver detalle de movimiento
 * - Verificar código de movimiento (M001-I-xxxx, etc.)
 * - Cerrar modales de detalle
 * - Navegar a variantes dentro del Kardex
 */
export class KardexVerificacionPage {
    constructor(private readonly page: Page) {
    }

    private readonly overloadLoading = this.page.locator('[id="cmn_cmp-overload:loading"]');


    /** Evita clics interceptados por el overlay de carga del módulo Kardex. */
    public async esperarSinOverload(timeout = 35_000): Promise<void> {
        await this.overloadLoading.waitFor({state: 'hidden', timeout}).catch(() => {
        });
    }

    private verDetalleButtons(): Locator {
        return this.page.getByRole('button', {name: /ver detalle/i});
    }

    // ─── Búsqueda ───────────────────────────────────────────────

    /** Busca por código en Kardex total */
    async buscarPorCodigo(codigo: string): Promise<void> {
        await this.esperarSinOverload(25_000);
        const searchInput = this.page.getByRole('textbox', {name: 'Buscar por nombre, código o c'});
        await searchInput.click();
        await searchInput.fill(codigo);
        await searchInput.press('Enter');

        await this.esperarSinOverload(25_000);
        // Esperar a que la tabla renderice el ítem antes de buscar sus botones
        await expect(this.page.getByRole('table').getByText(codigo).first()).toBeVisible({timeout: 15000});
    }

    // ─── Almacenes ──────────────────────────────────────────────

    /** Click en "Varios*" para expandir almacenes */
    async clickAlmacenMultiple(): Promise<void> {
        await this.page
            .locator('div')
            .filter({hasText: /^Varios\*$/})
            .first()
            .click();
    }

    /** Click en "Varios*" por texto */
    async clickVariosTexto(): Promise<void> {
        await this.page.getByText('Varios*').first().click();
    }

    /** Click en "Varios*" nth */
    async clickVariosNth(index: number): Promise<void> {
        await this.page.getByText('Varios*').nth(index).click();
    }

    // ─── Kardex por producto ────────────────────────────────────

    /** Click en botón "Kardex por producto" (global o primera coincidencia) */
    async clickKardexPorProducto(): Promise<void> {
        await this.page.getByRole('button', {name: 'Kardex por producto'}).first().click();
        await this.esperarSinOverload();
        await expect(this.page.getByText('Información básica')).toBeVisible({timeout: 25_000});
        await this.verDetalleButtons().first().waitFor({state: 'visible', timeout: 25_000}).catch(() => {
        });
    }

    /** Click en botón "Kardex por producto" para un almacén en específico */
    async clickKardexPorProductoAlmacen(nombreAlmacen: string): Promise<void> {
        await this.page
            .getByRole('row')
            .filter({hasText: new RegExp(nombreAlmacen, 'i')})
            .getByRole('button', {name: 'Kardex por producto'})
            .first()
            .click();
        await this.esperarSinOverload();
        await this.verDetalleButtons().first().waitFor({state: 'visible', timeout: 25_000}).catch(() => {
        });
    }

    /**
     * En la pestaña "Kardex por producto", elige el almacén en el filtro superior.
     * Sin esto el panel Stock puede quedar vacío y no aparece ningún "VER DETALLE".
     */
    // async seleccionarAlmacenFiltroKardexPorProducto(nombreAlmacen: string): Promise<void> {
    //     await this.esperarSinOverload();
    //     const scope = this.page.getByRole('article');
    //     await expect(scope.getByText('Información básica')).toBeVisible({timeout: 15_000});
    //
    //     // ── Abrir el dropdown: clickea el select/combobox junto al label "Almacén" ──
    //     // Estrategia 1: combobox o select dentro del article
    //     const dropdown = scope.getByRole('combobox').first();
    //     if (await dropdown.isVisible().catch(() => false)) {
    //         await dropdown.click();
    //     } else {
    //         // Estrategia 2: el contenedor del label "Almacén" + su control hermano
    //         const labelAlmacen = scope.getByText('Almacén', {exact: true}).first();
    //         // Sube al padre y busca el elemento clickeable dentro (select, button, input)
    //         await labelAlmacen
    //             .locator('..')
    //             .locator('select, input, button, .v-select__selection, [role="button"]')
    //             .first()
    //             .click();
    //     }
    //
    //     await this.page.waitForTimeout(400);
    //
    //     // ── Seleccionar la opción del almacén ────────────────────────────────────
    //     const strip = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    //     const parts = strip(nombreAlmacen)
    //         .split(/\s+/)
    //         .filter(Boolean)
    //         .map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    //     const nombreRx = new RegExp(parts.join('.*'), 'i');
    //
    //     // Las opciones del dropdown aparecen fuera del article
    //     const opcion = this.page
    //         .getByRole('option', {name: nombreRx})
    //         .or(this.page.locator('.v-list-item, li').filter({hasText: nombreRx}))
    //         .first();
    //
    //     await opcion.waitFor({state: 'visible', timeout: 5_000});
    //     await opcion.click();
    //
    //     await this.esperarSinOverload();
    //
    //     // ── Scroll a VER DETALLE ─────────────────────────────────────────────────
    //     const verDetallePrimero = this.verDetalleButtons().first();
    //     await verDetallePrimero.waitFor({state: 'attached', timeout: 25_000});
    //     await verDetallePrimero.scrollIntoViewIfNeeded();
    //     await verDetallePrimero.waitFor({state: 'visible', timeout: 10_000});
    // }

    // ─── Variantes ──────────────────────────────────────────────

    /** Click en una variante dentro del Kardex */
    async clickVarianteEnKardex(nombre: string): Promise<void> {
        await this.page.getByText(nombre).click();
    }

    /** Abre Kardex de variante por fila con botón (popup) */
    async abrirKardexVariante(rowName: string): Promise<void> {
        await this.page.getByRole('row', {name: rowName}).getByRole('button').click();
    }

    // ─── Ver detalle ────────────────────────────────────────────

    /**
     * Click en "VER DETALLE" (puede haber múltiples).
     * @param indice 0-indexed. first() = 0, nth(1) = 1
     */
    async abrirVerDetalle(indice: number = 0): Promise<void> {
        await this.esperarSinOverload();
        const btn = this.verDetalleButtons();
        if (indice === 0) {
            await btn.first().waitFor({state: 'visible', timeout: 25_000});
            await btn.first().click();
        } else {
            await btn.nth(indice).waitFor({state: 'visible', timeout: 25_000});
            await btn.nth(indice).click();
        }
    }

    /**
     * Click en "VER DETALLE" asociado estrictamente a un almacén en concreto.
     * Evita abrir el detalle de otro almacén con un movimiento más reciente.
     * Busca la tarjeta contenedora que posea tanto el nombre del almacén como el botón "VER DETALLE".
     */
    async abrirVerDetallePorAlmacen(nombreAlmacen: string): Promise<void> {
        const strip = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const parts = strip(nombreAlmacen)
            .split(/\s+/)
            .filter(Boolean)
            .map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
        const nombreRx = new RegExp(parts.join('.*'), 'i');

        const cardAlmacen = this.page
            .locator('div, article, section')
            .filter({hasText: nombreRx})
            .filter({
                has: this.page.locator(
                    'button[id="lgt_kardexs_cmp-cards-almacen:card-almacen_v-button:ver-detalle"]'
                ),
            })
            .first();

        await cardAlmacen.scrollIntoViewIfNeeded();

        // ✅ Apunta solo al <button>, no a los divs con el mismo ID
        const boton = cardAlmacen.locator(
            'button[id="lgt_kardexs_cmp-cards-almacen:card-almacen_v-button:ver-detalle"]'
        ).first();

        await boton.waitFor({state: 'visible', timeout: 10_000});
        await boton.click();

        await this.esperarSinOverload();
    }

    // ─── Verificación de movimiento ─────────────────────────────

    /**
     * Verifica que un código de movimiento está visible (M001-I-xxxx, etc.).
     * Usa patrón regex para no depender de un código hardcodeado.
     */
    async clickCodigoMovimiento(patron: string): Promise<void> {
        await this.page.getByText(patron).click();
    }

    /**
     * Click en código de movimiento usando regex pattern.
     * Útil para verificar que el movimiento fue creado.
     */
    async clickCodigoMovimientoRegex(regex: RegExp): Promise<void> {
        await this.page.getByText(regex).first().click();
    }

    /**
     * Assert: al menos un código coincide con el patrón (evita strict mode cuando hay muchos M001-* en la tabla).
     */
    async expectPatronCodigoMovimientoVisible(patron: RegExp): Promise<void> {
        await expect(this.page.getByText(patron).first()).toBeVisible({timeout: 15_000});
    }

    // ─── Modales ────────────────────────────────────────────────

    /** Cerrar modal de detalle */
    async cerrarModalDetalle(): Promise<void> {
        const candidatos: Locator[] = [
            this.page.locator('.v-modal .button-close .icon').first(),
            this.page.locator('.v-modal .button-close').first(),
            this.page.locator('.v-dialog--active .button-close .icon').first(),
            this.page.getByRole('button', {name: /^Cerrar$/i}).first(),
            this.page.locator('.v-modal > div').first(),
        ];

        for (const loc of candidatos) {
            try {
                if (await loc.isVisible({timeout: 1_500})) {
                    await loc.click({timeout: 5_000});
                    await this.page.locator('.v-dialog--active').waitFor({
                        state: 'hidden',
                        timeout: 3_000
                    }).catch(() => {
                    });
                    return;
                }
            } catch {
                // siguiente candidato
            }
        }

        await this.page.keyboard.press('Escape');
    }

    // ─── Datos opcionales desde detalle ─────────────────────────

    /** Click en "Datos opcionales" dentro del modal de detalle */
    async clickDatosOpcionales(): Promise<void> {
        await this.page.getByText('Datos opcionales').click();
    }

    /** Click en "Datos opcionales" como div (variante para ajustes) */
    async clickDatosOpcionalesDiv(): Promise<void> {
        await this.page
            .locator('div')
            .filter({hasText: /^Datos opcionales$/})
            .first()
            .click();
    }

    /** Verifica que el acordeón de datos opcionales tenga contenido visible */
    async expectDatosOpcionalesVisible(): Promise<void> {
        // Espera que el acordeón esté expandido y tenga algo dentro
        const contenido = this.page
            .locator('div')
            .filter({hasText: /^Datos opcionales$/})
            .first()
            .locator('..')  // sube al padre contenedor del acordeón
            .locator('div, span, p')
            .filter({hasText: /.+/}) // cualquier texto no vacío
            .first();

        await expect(contenido).toBeVisible({timeout: 5_000});
    }

    // ─── Navegación dentro del Kardex popup ─────────────────────

    /** Para páginas popup de Kardex: navegar a diferentes secciones */
    async navegarAIngresosDesdeKardex(): Promise<void> {
        await this.page.getByText('Ingresos').click();
    }

    async navegarASalidasDesdeKardex(): Promise<void> {
        await this.page.getByText('Salidas').click();
    }

    /** Navegar a Productos y servicios > Stock (dentro del popup) */
    async navegarAStockDesdePopup(): Promise<void> {
        await this.page.getByText('Productos y servicios').click();
        await this.page.getByText('Stock de productos').click();
    }

    /** Navegar al submódulo de kardex desde popup usando ID del select */
    async navegarAKardexDesdePopup(): Promise<void> {
        await this.page.getByText('Productos y servicios').click();
        await this.page
            .locator('.select-2 > .popup-container > .v-popup > span > .v-select > .v-select-plain > .v-select-base > .v-select-base-header > .v-select-header-plain > div > .v-select-header-plain-arrow')
            .click();
        await this.page
            .locator('[id="nvg_selects_cmp-header-selects_select:select-module-206-item-2016"]')
            .click();
    }

    /** Navegar a Kardex total desde popup (alternativa simple) */
    async navegarAKardexTotalDesdePopup1(): Promise<void> {
        await this.page.getByText('Productos y servicios').click();
        await this.page.getByText('Kardex total').click();
    }
}
