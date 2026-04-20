import {type Locator, type Page} from '@playwright/test';
import {
  mapColumnByFileHeader as applyColumnMapping,
  waitForColumnAssignmentStep,
} from '../../helpers/Logistica/column-mapping.helper';

export class CargaMasivaPage {
    constructor(private readonly page: Page) {
    }

    private get menuOpciones(): Locator {
        return this.page.locator(
            '[id="lgt_cmp-items_cmp-datos-items.cmp-option-button:options"]',
        );
    }

    private get opcionCargaMasiva(): Locator {
        return this.page.locator(
            '[id="lgt_cmp-items_cmp-datos-items.li:carga-masiva"]',
        );
    }

    private get botonCerrarPopup(): Locator {
        return this.page.locator('.popup-container > .button-close > .icon');
    }

    private get areaOverscreen(): Locator {
        return this.page.locator('.cmp-overscreen.is-open > .area');
    }

    private get botonSiguiente(): Locator {
        return this.page.getByText('Siguiente');
    }

    private get inputArchivo(): Locator {
        return this.page.locator('input[type="file"]');
    }

    private get checkboxTodosAlmacenes(): Locator {
        return this.page
            .locator(
                '[id="lgt_items_creacion-masivos_cmp-asignacion-columnas:elegir-almacenes_v-checkbox:todos-almacenes"] div',
            )
            .filter({hasText: /^Seleccionar todos$/});
    }

    private get botonProcesar(): Locator {
        return this.page.getByText('Procesar');
    }

    private get botonIrAlInicio(): Locator {
        return this.page.getByRole('button', {name: 'Ir al inicio'});
    }

    private get modalErrorProcesarArchivoTitulo(): Locator {
        return this.page.getByText('ERROR AL PROCESAR ARCHIVO');
    }

    async abrirCargaMasiva(): Promise<void> {
        await this.menuOpciones.click();
        await this.opcionCargaMasiva.click();

        await this.botonCerrarPopup.click().catch(() => {
        });

        await this.areaOverscreen.click().catch(() => {
        });
    }

    async seleccionarTipoItem(cardLabel: string): Promise<void> {
        const card = this.page
            .locator('.cmp-card-item')
            .filter({has: this.page.getByText(cardLabel, {exact: true})});

        await card.getByRole('button', {name: 'Seleccionar'}).click();
    }

    async clickSiguiente(): Promise<void> {
        await this.botonSiguiente.click();
    }

    async subirArchivo(filePath: string): Promise<void> {
        await this.inputArchivo.setInputFiles(filePath);
        await this.page.getByText('Archivo subido correctamente').waitFor({state: 'visible'});
    }

    async waitForColumnAssignmentStep(): Promise<void> {
        await waitForColumnAssignmentStep(this.page);
    }

    async mapColumnByFileHeader(fileHeader: string, targetField: string): Promise<void> {
        await applyColumnMapping(this.page, fileHeader, targetField);
    }

    async asignarColumnas(): Promise<void> {
        await this.waitForColumnAssignmentStep();

        await this.mapColumnByFileHeader('PRECIO ESTÁNDAR', 'PRECIO ESTANDAR');
    }

    async seleccionarTodosAlmacenes(): Promise<void> {
        try {
            await this.checkboxTodosAlmacenes.waitFor({state: 'visible', timeout: 10_000});
            await this.checkboxTodosAlmacenes.click();
        } catch {
        }
    }

    async clickProcesar(): Promise<void> {
        await this.botonProcesar.click();
    }

    private async leerMensajeModalErrorProcesamiento(timeout = 3_000): Promise<string | null> {
        const titulo = this.modalErrorProcesarArchivoTitulo.first();
        try {
            await titulo.waitFor({state: 'visible', timeout});
        } catch {
            return null;
        }

        const modalContainer = titulo.locator('xpath=ancestor::*[self::div or self::section][1]');
        const modalText = ((await modalContainer.textContent().catch(() => null)) ?? '').trim();

        if (modalText) {
            const normalized = modalText.replace(/\s+/g, ' ').trim();
            if (normalized.length > 0) {
                return normalized;
            }
        }

        const bodyText = ((await this.page.locator('body').textContent().catch(() => null)) ?? '')
            .replace(/\s+/g, ' ')
            .trim();
        const bodyMatch = bodyText.match(/El campo\s+([A-Za-zÁÉÍÓÚáéíóúÑñ]+)\s+es obligatorio/i);
        if (bodyMatch) {
            return bodyMatch[0];
        }

        return 'ERROR AL PROCESAR ARCHIVO';
    }

    private async cerrarModalErrorProcesamiento(): Promise<void> {
        const closeCandidates: Locator[] = [
            this.page.locator('.cmp-carga-errores-validacion .button-close').first(),
            this.page.locator('.cmp-carga-errores-validacion .button-close .icon').first(),
            this.page.locator('.cmp-carga-errores-validacion .icon-close').first(),
            this.page.locator('.popup-container .button-close').first(),
            this.page.locator('.popup-container .button-close .icon').first(),
            this.page.locator('.cmp-modal .button-close').first(),
            this.page.locator('.cmp-modal .icon-close').first(),
            this.page.getByRole('button', {name: /cerrar|close|x/i}).first(),
        ];

        for (const locator of closeCandidates) {
            try {
                if (await locator.isVisible({timeout: 500})) {
                    await locator.click();
                    await this.modalErrorProcesarArchivoTitulo.first().waitFor({state: 'hidden', timeout: 2_000});
                    return;
                }
            } catch {
            }
        }

        await this.areaOverscreen.click().catch(() => {
        });
        await this.modalErrorProcesarArchivoTitulo.first().waitFor({state: 'hidden', timeout: 1_500}).catch(() => {
        });

        if (!(await this.modalErrorProcesarArchivoTitulo.first().isVisible().catch(() => false))) {
            return;
        }

        await this.page.keyboard.press('Escape').catch(() => {
        });
        await this.modalErrorProcesarArchivoTitulo.first().waitFor({state: 'hidden', timeout: 1_500}).catch(() => {
        });

        const modal = this.page.locator('.cmp-carga-errores-validacion').first();
        const modalVisible = await modal.isVisible().catch(() => false);
        if (modalVisible) {
            const box = await modal.boundingBox();
            if (box) {
                await this.page.mouse.click(box.x + box.width - 18, box.y + 18).catch(() => {
                });
                await this.modalErrorProcesarArchivoTitulo.first().waitFor({
                    state: 'hidden',
                    timeout: 1_500
                }).catch(() => {
                });
            }
        }
    }

    private async asegurarModalErrorCerradoAntesDeMapear(): Promise<void> {
        const abierto = await this.modalErrorProcesarArchivoTitulo.first().isVisible().catch(() => false);
        if (!abierto) return;

        await this.cerrarModalErrorProcesamiento();
        const sigueAbierto = await this.modalErrorProcesarArchivoTitulo.first().isVisible().catch(() => false);
        if (sigueAbierto) {
            throw new Error('No se pudo cerrar el modal de "ERROR AL PROCESAR ARCHIVO" para remapear columnas.');
        }
    }

    async clickIrAlInicio(): Promise<void> {
        await this.botonIrAlInicio.click();
        await this.page.waitForLoadState('networkidle');
    }

    async ejecutarFlujoCargaMasiva(cardLabel: string, filePath: string): Promise<void> {
        await this.seleccionarTipoItem(cardLabel);
        await this.clickSiguiente();

        await this.subirArchivo(filePath);
        await this.clickSiguiente();

        await this.asignarColumnas();
        await this.clickSiguiente();

        await this.seleccionarTodosAlmacenes();
        await this.clickProcesar();
    }

    async ejecutarFlujoCargaMasivaProductosConAutoRemapeo(cardLabel: string, filePath: string): Promise<void> {
        await this.seleccionarTipoItem(cardLabel);
        await this.clickSiguiente();

        await this.subirArchivo(filePath);
        await this.clickSiguiente();

        await this.asignarColumnas();

        for (let attempt = 0; attempt < 3; attempt++) {
            await this.clickSiguiente();

            const modalMessage = await this.leerMensajeModalErrorProcesamiento(4_000);
            if (!modalMessage) {
                await this.seleccionarTodosAlmacenes();
                await this.clickProcesar();
                return;
            }

            const msg = modalMessage.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
            if (msg.includes('CAMPO NOMBRE')) {
                await this.cerrarModalErrorProcesamiento();
                await this.asegurarModalErrorCerradoAntesDeMapear();
                await this.mapColumnByFileHeader('DESCRIPCION', 'NOMBRE');
                continue;
            }
            if (msg.includes('CAMPO DESCRIPCION')) {
                await this.cerrarModalErrorProcesamiento();
                await this.asegurarModalErrorCerradoAntesDeMapear();
                await this.mapColumnByFileHeader('DESCRIPCION', 'DESCRIPCION');
                continue;
            }

            throw new Error(`Modal de error no reconocido durante creación masiva de productos: "${modalMessage}"`);
        }

        throw new Error(
            'No se pudo avanzar en creación masiva de productos tras reintentos de remapeo dinámico de DESCRIPCION.',
        );
    }

}
