import {type Locator, type Page} from '@playwright/test';
import {
  mapColumnByFileHeader as applyColumnMapping,
  waitForColumnAssignmentStep,
} from '../../helpers/Logistica/column-mapping.helper';

/**
 * Page Object para el wizard de carga masiva de ítems desde Excel.
 *
 * Responsabilidades:
 * - Abrir el menú de opciones y entrar a carga masiva
 * - Cerrar popup/guía de bienvenida
 * - Seleccionar tipo de item por ID estable de card
 * - Subir archivo Excel
 * - Asignar columnas en la tabla de mapeo
 * - Seleccionar almacenes
 * - Procesar y volver al inicio
 *
 * NO contiene assertions — eso queda en el spec.
 * NO contiene lógica de manipulación de Excel — eso queda en el helper.
 */
export class CargaMasivaPage {
    constructor(private readonly page: Page) {
    }

    // ─── Locators ───────────────────────────────────────────────

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

    // ─── Paso 1: Abrir carga masiva ────────────────────────────

    /**
     * Abre el menú de opciones del módulo items y selecciona "Carga masiva".
     * Cierra el popup de guía si aparece.
     */
    async abrirCargaMasiva(): Promise<void> {
        await this.menuOpciones.click();
        await this.opcionCargaMasiva.click();

        // Cerrar el popup/guía de bienvenida que aparece la primera vez
        await this.botonCerrarPopup.click().catch(() => {
        });

        // Cerrar el overscreen de fondo si aparece
        await this.areaOverscreen.click().catch(() => {
        });
    }

    // ─── Paso 2: Seleccionar tipo de item ──────────────────────

    /**
     * Selecciona un tipo de item clickeando el botón "Seleccionar" de la card correcta.
     *
     * Busca la card por su texto visible (ej: "Productos", "Servicios")
     * dentro del contenedor .cmp-card-item y clickea su botón "Seleccionar".
     *
     * Esto reemplaza el frágil getByRole("button", { name: "Seleccionar" }).first()
     * del codegen y evita el problema de IDs duplicados dentro de la card.
     *
     * @param cardLabel - Texto visible de la card (ej: "Productos", "Servicios")
     */
    async seleccionarTipoItem(cardLabel: string): Promise<void> {
        // Usa getByText con exact: true para evitar que "Productos"
        // también matchee "Lista de productos" (substring)
        const card = this.page
            .locator('.cmp-card-item')
            .filter({has: this.page.getByText(cardLabel, {exact: true})});

        await card.getByRole('button', {name: 'Seleccionar'}).click();
    }

    // ─── Paso 3: Avanzar con Siguiente ─────────────────────────

    /** Clickea "Siguiente" para avanzar al próximo paso del wizard */
    async clickSiguiente(): Promise<void> {
        await this.botonSiguiente.click();
    }

    // ─── Paso 4: Subir archivo Excel ───────────────────────────

    /**
     * Sube un archivo Excel al input de carga masiva.
     * Usa setInputFiles directamente sobre el input[type="file"]
     * en lugar del botón "Seleccionar archivo" para mayor estabilidad.
     *
     * @param filePath - Ruta absoluta al archivo Excel temporal generado
     */
    async subirArchivo(filePath: string): Promise<void> {
        await this.inputArchivo.setInputFiles(filePath);
        // Esperar explícitamente el mensaje de subida exitosa para evitar
        // race conditions al hacer click en Siguiente muy rápido
        await this.page.getByText('Archivo subido correctamente').waitFor({state: 'visible'});
    }

    // ─── Paso 5: Asignación de columnas ────────────────────────

    /**
     * Espera la tabla de mapeo con dropdowns en `th` (no hay heading semántico real).
     */
    async waitForColumnAssignmentStep(): Promise<void> {
        await waitForColumnAssignmentStep(this.page);
    }

    /**
     * Delega en {@link mapColumnByFileHeader} del helper compartido.
     */
    async mapColumnByFileHeader(fileHeader: string, targetField: string): Promise<void> {
        await applyColumnMapping(this.page, fileHeader, targetField);
    }

    // ── Orquestación ──

    /**
     * Método principal de asignación de columnas.
     *
     * 1. Espera a que el paso esté completamente renderizado
     * 2. Mapea cualquier columna que no fue auto-asignada por el sistema
     *
     * Actualmente mapea:
     * - PRECIO ESTÁNDAR → PRECIO ESTANDAR (necesario para la mayoría de tipos)
     *
     * Si todas las columnas ya están auto-mapeadas, no interactúa con
     * ningún dropdown y simplemente continúa.
     */
    async asignarColumnas(): Promise<void> {
        await this.waitForColumnAssignmentStep();

        // PRODUCTOS: el Excel trae DESCRIPCION (primera columna) pero el ERP valida "Nombre" como obligatorio.
        // Si el wizard deja por defecto "Descripción", forzamos el mapeo a "Nombre".
        //await this.mapColumnByFileHeader('DESCRIPCION', 'NOMBRE');

        // Mapear PRECIO ESTÁNDAR si no se auto-mapeó por diferencia de acentos
        await this.mapColumnByFileHeader('PRECIO ESTÁNDAR', 'PRECIO ESTANDAR');
    }

    // ─── Paso 6: Selección de almacenes ────────────────────────

    /**
     * Clickea "Seleccionar todos" para los almacenes.
     *
     * Patrón resiliente (igual que Precio Estándar):
     * - Espera a que el checkbox sea visible antes de clickear
     * - Si el paso de almacenes no aparece (no todos los tipos lo muestran),
     *   retorna silenciosamente en lugar de lanzar timeout
     */
    async seleccionarTodosAlmacenes(): Promise<void> {
        try {
            await this.checkboxTodosAlmacenes.waitFor({state: 'visible', timeout: 10_000});
            await this.checkboxTodosAlmacenes.click();
        } catch {
            // El paso de almacenes no apareció — no es requerido para este tipo de item
        }
    }

    // ─── Paso 7: Procesar ──────────────────────────────────────

    /** Clickea "Procesar" para iniciar la carga masiva */
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

        // El contenido del modal no siempre matchea bien con un locator por regex.
        // Leemos el contenedor padre del título para obtener el texto completo.
        const modalContainer = titulo.locator('xpath=ancestor::*[self::div or self::section][1]');
        const modalText = ((await modalContainer.textContent().catch(() => null)) ?? '').trim();

        if (modalText) {
            const normalized = modalText.replace(/\s+/g, ' ').trim();
            if (normalized.length > 0) {
                return normalized;
            }
        }

        // Fallback defensivo: buscar directamente en todo el body el patrón de validación.
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
                // Intentar siguiente candidato
            }
        }

        // Algunos modales se cierran clickeando fuera del contenido (overlay area).
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

        // Fallback final: click en la esquina superior derecha del modal
        // (donde está el ícono "X") cuando no hay selector estable.
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

    // ─── Paso 8: Volver al inicio ──────────────────────────────

    /**
     * Clickea "Ir al inicio" para regresar a la lista general de ítems.
     * Espera a que la página cargue completamente.
     */
    async clickIrAlInicio(): Promise<void> {
        await this.botonIrAlInicio.click();
        await this.page.waitForLoadState('networkidle');
    }

    // ─── Flujo completo ────────────────────────────────────────

    /**
     * Ejecuta el flujo completo de carga masiva:
     * 1. Seleccionar tipo → Siguiente
     * 2. Subir archivo → Siguiente
     * 3. Asignar columna ESTANDAR → Siguiente
     * 4. Seleccionar almacenes → Procesar
     *
     * @param cardLabel - Texto visible de la card del tipo de item
     * @param filePath - Ruta al archivo Excel temporal
     */
    async ejecutarFlujoCargaMasiva(cardLabel: string, filePath: string): Promise<void> {
        // Paso 1: Seleccionar tipo
        await this.seleccionarTipoItem(cardLabel);
        await this.clickSiguiente();

        // Paso 2: Subir archivo
        await this.subirArchivo(filePath);
        await this.clickSiguiente();

        // Paso 3: Asignar columna ESTANDAR → Precio estándar
        await this.asignarColumnas();
        await this.clickSiguiente();

        // Paso 4: Seleccionar almacenes y procesar
        await this.seleccionarTodosAlmacenes();
        await this.clickProcesar();
    }

    /**
     * Flujo especial SOLO para "Productos":
     * si el sistema falla al procesar pidiendo "Nombre" o "Descripción",
     * remapea la columna DESCRIPCION en función del mensaje y reintenta.
     */
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
                // Ya avanzó al siguiente paso, continuar flujo normal.
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
