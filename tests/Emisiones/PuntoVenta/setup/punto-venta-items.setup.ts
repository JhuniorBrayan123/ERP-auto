import {expect, test as setup} from '@playwright/test';
import {ProductoFormPage} from '@pages/Logistica/ProductoFormPage';
import {RecetaFormPage} from '@pages/Logistica/RecetaFormPage';
import {ListaFormPage} from '@pages/Logistica/ListaFormPage';
import {ComboFormPage} from '@pages/Logistica/ComboFormPage';
import {ListaItemsPage} from '@pages/Logistica/ListaItemsPage';
import {
    generarRunId,
    generarMapaCodigos,
    guardarMapaCodigos,
    ITEM_TEMPLATES,
} from '@factories/item-factory';
import {
    crearProductoDesdeTemplate,
    crearRecetaDesdeTemplate,
    crearListaDesdeTemplate,
    crearComboDesdeTemplate,
} from './crear-item-setup.helpers';
import {ActivarSelectorObligatorio} from '@task/PuntoVenta/ActivarSelectorObligatorio.task';
import {EdicionItemPage} from '@pages/Logistica/EdicionItemPage';
import {
    cargarCheckpoint,
    iniciarCheckpoint,
    marcarDone,
    limpiarCheckpoint,
} from './setup-checkpoint';
import {shouldSkipSetup, markSetupComplete} from '@utils/setup-state';
import {resolve} from 'node:path';
import {copyFileSync, existsSync} from 'node:fs';

const SETUP_NAME = 'punto-venta-items';
setup.skip(!!process.env.SKIP_PV_ITEMS_SETUP, 'Setup de ítems PV omitido por SKIP_PV_ITEMS_SETUP');

// ─── Helpers de Logging Estructurado ──────────────────────────────────
const CASO_ACTUAL = 'Setup: Preparar ítems base para PuntoVenta / Emisiones';

function logInfo(paso: string, mensaje: string) {
    console.info(`[INFO][QA] - Caso: ${CASO_ACTUAL} | Paso: ${paso} | Mensaje: ${mensaje}`);
}

function logError(paso: string, error: unknown) {
    const motivo = error instanceof Error ? error.message : String(error);
    console.error(`[FAIL][QA] - Caso: ${CASO_ACTUAL} | Paso: ${paso} | Motivo: ${motivo}`);
}

// ─── Funciones Auxiliares ─────────────────────────────────────────────

/** Navega al módulo Productos y Stock */
async function navegarAItems(page: import('@playwright/test').Page): Promise<void> {
    await setup.step('Navegar al módulo de Productos y Stock', async () => {
        try {
            await page.getByText('Productos y servicios').click();
            await page.locator('[id="nvg_selects_cmp-header-selects_select:select-module-203-item-2007"]').click();
            await expect(page.getByRole('textbox', { name: 'Buscar por nombre, código o c' })).toBeVisible({timeout: 20000});
            await page.waitForLoadState('networkidle');
        } catch (error) {
            logError('Navegar al módulo de Productos', error);
            throw error;
        }
    });
}

/** Busca un ítem por código y retorna true si existe en la grilla */
async function itemExistePorCodigo(
    listaItems: ListaItemsPage,
    page: import('@playwright/test').Page,
    codigo: string,
): Promise<boolean> {
    // ERP almacena códigos sin guión (ej. "11111121726", no "111111-21726")
    const codigoLimpio = codigo.replace(/-/g, '');
    return await setup.step(`Verificar existencia del ítem con código ${codigoLimpio}`, async () => {
        try {
            await listaItems.searchByCode(codigoLimpio);
            const resultado = page.getByRole('table').getByText(codigoLimpio).first();
            const existe = await resultado.isVisible({timeout: 3_000}).catch(() => false);
            return existe;
        } catch (error) {
            logError(`Buscar existencia de ítem ${codigoLimpio}`, error);
            throw error;
        }
    });
}

// ─── Resolver de códigos dinámicos ────────────────────────────────────

/**
 * Resuelve un código: si es un template key O un código base conocido,
 * retorna el código dinámico de esta ejecución.
 * Si no coincide con nada, retorna el valor tal cual (código externo/fijo).
 *
 * Esto es crítico para combos/listas/recetas: cuando un componente usa
 * codigoBusqueda '202020', el resolver lo convierte a '202020-21726' →
 * luego .replace(/-/g,'') → '20202021726' → búsqueda exacta (1 resultado).
 */
function crearResolver(mapaCodigos: Record<string, string>): (key: string) => string {
    const templateKeys = new Set(ITEM_TEMPLATES.map(t => t.key));

    // Reverse map: codigoBase → template key (para resolver '202020' → 'ITEM_EQUIVALENTE')
    const baseToKey = new Map<string, string>();
    for (const t of ITEM_TEMPLATES) {
        baseToKey.set(t.codigoBase, t.key);
    }

    return (key: string) => {
        // 1. Match directo por template key (ej. 'ITEM_EQUIVALENTE')
        if (templateKeys.has(key) && mapaCodigos[key]) {
            return mapaCodigos[key];
        }
        // 2. Match por código base (ej. '202020' → 'ITEM_EQUIVALENTE' → '202020-21726')
        const templateKey = baseToKey.get(key);
        if (templateKey && mapaCodigos[templateKey]) {
            return mapaCodigos[templateKey];
        }
        return key; // código externo no registrado, usar tal cual
    };
}

// ─── Setup principal ──────────────────────────────────────────────────

setup(CASO_ACTUAL, async ({page}) => {
    // ── Auto-skip si ya completado ───────────────────────────────────
    if (shouldSkipSetup(SETUP_NAME)) {
        console.log(`[setup-state] ${SETUP_NAME} already completed, skipping`);
        return;
    }

    // ── PRD: usar JSON fijo (no crear items nuevos) ──────────────────
    const isPrd = (process.env.APP_ENV ?? '').trim().toLowerCase() === 'prd';
    if (isPrd) {
        const prdItemsFile = resolve(process.cwd(), 'playwright', 'dynamic-items.prd.json');
        if (!existsSync(prdItemsFile)) {
            throw new Error(`[setup-state] PRD: archivo de ítems fijo no encontrado: ${prdItemsFile}. Ejecutar setup en CRT o copiar dynamic-items.prd.json`);
        }
        copyFileSync(prdItemsFile, resolve(process.cwd(), 'playwright', '.auth', 'dynamic-items.json'));
        console.log(`[setup-state] PRD: ítems fijos copiados desde dynamic-items.prd.json`);
        markSetupComplete(SETUP_NAME);
        return;
    }

    setup.setTimeout(600_000); // 10 min — crea hasta 17 ítems (incluye combos, variantes y equivalencias)

    // ── Resolver RUN_ID: reusar checkpoint o generar nuevo ─────────────
    const checkpointPrevio = cargarCheckpoint();
    let RUN_ID: string;
    let itemsDone: Set<string>;

    if (checkpointPrevio) {
        RUN_ID = checkpointPrevio.RUN_ID;
        itemsDone = new Set(checkpointPrevio.done);
        logInfo('Checkpoint', `Reanudando RUN_ID ${RUN_ID} — ${itemsDone.size} ítems ya creados`);
    } else {
        RUN_ID = generarRunId();
        itemsDone = new Set<string>();
        iniciarCheckpoint(RUN_ID);
        logInfo('Checkpoint', `Nuevo RUN_ID ${RUN_ID} — checkpoint creado`);
    }

    const mapaCodigos = generarMapaCodigos(RUN_ID);
    const dc = (key: string) => mapaCodigos[key];
    const resolverCodigo = crearResolver(mapaCodigos);

    logInfo('Códigos dinámicos', `Se crearán ${ITEM_TEMPLATES.filter(t => t.fase).length} ítems con sufijo -${RUN_ID}`);

    // ── Navegación ─────────────────────────────────────────────────────
    await setup.step('Navegación inicial al sistema', async () => {
        try {
            await page.goto('/');
            await navegarAItems(page);
        } catch (error) {
            logError('Navegación inicial', error);
            throw error;
        }
    });

    const listaItems = new ListaItemsPage(page);
    const productoForm = new ProductoFormPage(page);
    const recetaForm = new RecetaFormPage(page);
    const listaForm = new ListaFormPage(page);
    const comboForm = new ComboFormPage(page);

    // ── 1. Crear ítems en orden de fases ───────────────────────────────
    const templatesOrdenados = ITEM_TEMPLATES
        .filter(t => t.fase)
        .sort((a, b) => a.fase! - b.fase!);

    for (const template of templatesOrdenados) {
        const codigo = dc(template.key);

        // ── Checkpoint: saltar ítems ya creados en un intento anterior ──
        if (itemsDone.has(template.key)) {
            logInfo('Checkpoint', `"${template.key}" (${codigo}) ya marcado done — saltando`);
            continue;
        }

        if (await itemExistePorCodigo(listaItems, page, codigo)) {
            logInfo('Validación', `"${template.key}" (${codigo}) ya existe en ERP — saltando`);
            marcarDone(template.key);
            continue;
        }

        logInfo('Creación', `Creando "${template.key}" (${codigo}) [fase ${template.fase}]...`);

        try {
            switch (template.tipo) {
                case 'producto':
                    await crearProductoDesdeTemplate(page, productoForm, codigo, template);
                    break;
                case 'receta':
                    await crearRecetaDesdeTemplate(page, recetaForm, codigo, template, resolverCodigo);
                    break;
                case 'lista':
                    await crearListaDesdeTemplate(page, listaForm, codigo, template, resolverCodigo);
                    break;
                case 'combo':
                    await crearComboDesdeTemplate(page, comboForm, codigo, template, resolverCodigo);
                    break;
            }
            marcarDone(template.key);
            logInfo('Creación', `✓ "${template.key}" (${codigo}) creado y marcado en checkpoint`);
        } catch (error) {
            logError(`Crear ${template.tipo} "${template.key}"`, error);
            throw error; // checkpoint queda intacto → próximo intento retoma desde aquí
        }
    }

    // ── 2. Post-setup: activar selector obligatorio ───────────────────
    await setup.step('Activar selector obligatorio en ITEM_SELECTOR_GRAVADO', async () => {
        try {
            logInfo('Post-setup', 'Activando switch obligatorio en ITEM_SELECTOR_GRAVADO (454545)...');

            // Navegar a Productos y Stock (el setup puede haber dejado el page en otro estado)
            await page.goto('/');
            await navegarAItems(page);

            // Buscar y editar el item 454545
            const listaItemsEdit = new ListaItemsPage(page);
            await listaItemsEdit.searchAndEdit('454545');

            // Esperar carga del formulario de edición
            const edicionItemPage = new EdicionItemPage(page);
            await edicionItemPage.waitForFormLoad();

            // Ir al tab Selectores y activar switch
            await edicionItemPage.goToSelectoresTab();
            const changed = await edicionItemPage.setSelectorObligatorioSwitch();

            if (changed) {
                await edicionItemPage.clickActualizarProducto();
                await edicionItemPage.closeSuccessModal();
                logInfo('Post-setup', '✓ Selector obligatorio activado y guardado');
            } else {
                logInfo('Post-setup', '✓ Selector obligatorio ya estaba activo — sin cambios');
            }
        } catch (error) {
            logError('Activar selector obligatorio', error);
            throw error;
        }
    });

    // ── Guardar mapa de códigos dinámicos ──────────────────────────────
    guardarMapaCodigos(mapaCodigos);
    limpiarCheckpoint();
    markSetupComplete(SETUP_NAME);
    logInfo('Setup Completo', `Todos los ítems de PuntoVenta están listos (RUN_ID: ${RUN_ID}) — checkpoint limpiado`);
});
