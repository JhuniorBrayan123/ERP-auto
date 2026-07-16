import {expect, test as setup} from '@playwright/test';
import {ProductoFormPage} from '@pages/Logistica/ProductoFormPage';
import {RecetaFormPage} from '@pages/Logistica/RecetaFormPage';
import {ListaFormPage} from '@pages/Logistica/ListaFormPage';
import {ComboFormPage} from '@pages/Logistica/ComboFormPage';
import {ListaItemsPage} from '@pages/Logistica/ListaItemsPage';
import {
    generarMapaCodigos,
    generarRunId,
    guardarMapaCodigos,
    guardarMapaEnCache,
    ITEM_TEMPLATES,
} from '@factories/item-factory';
import {
    crearComboDesdeTemplate,
    crearListaDesdeTemplate,
    crearProductoDesdeTemplate,
    crearRecetaDesdeTemplate,
} from './crear-item-setup.helpers';
import {EdicionItemPage} from '@pages/Logistica/EdicionItemPage';
import {cargarCheckpoint, iniciarCheckpoint, limpiarCheckpoint, marcarDone,} from './setup-checkpoint';
import {markSetupComplete, markSetupIncomplete, shouldSkipSetup} from '@utils/setup-state';
import {resolve} from 'node:path';
import {copyFileSync, existsSync, readFileSync} from 'node:fs';

const SETUP_NAME = 'punto-venta-items';
setup.skip(!!process.env.SKIP_PV_ITEMS_SETUP, 'Setup de ítems PV omitido por SKIP_PV_ITEMS_SETUP');

const CASO_ACTUAL = 'Setup: Preparar ítems base para PuntoVenta / Emisiones';

function logInfo(paso: string, mensaje: string) {
    console.info(`[INFO][QA] - Caso: ${CASO_ACTUAL} | Paso: ${paso} | Mensaje: ${mensaje}`);
}

function logError(paso: string, error: unknown) {
    const motivo = error instanceof Error ? error.message : String(error);
    console.error(`[FAIL][QA] - Caso: ${CASO_ACTUAL} | Paso: ${paso} | Motivo: ${motivo}`);
}

async function navegarAItems(page: import('@playwright/test').Page): Promise<void> {
    await setup.step('Navegar al módulo de Productos y Stock', async () => {
        try {
            await page.getByText('Productos y servicios').click();
            await page.locator('[id="nvg_selects_cmp-header-selects_select:select-module-203-item-2007"]').click();
            await expect(page.getByRole('textbox', {name: 'Buscar por nombre, código o c'})).toBeVisible({timeout: 20000});
            await page.waitForLoadState('networkidle');
        } catch (error) {
            logError('Navegar al módulo de Productos', error);
            throw error;
        }
    });
}

async function itemExistePorCodigo(
    listaItems: ListaItemsPage,
    page: import('@playwright/test').Page,
    codigo: string,
): Promise<boolean> {

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

function crearResolver(mapaCodigos: Record<string, string>): (key: string) => string {
    const templateKeys = new Set(ITEM_TEMPLATES.map(t => t.key));

    const baseToKey = new Map<string, string>();
    for (const t of ITEM_TEMPLATES) {
        baseToKey.set(t.codigoBase, t.key);
    }

    return (key: string) => {

        if (templateKeys.has(key) && mapaCodigos[key]) {
            return mapaCodigos[key];
        }

        const templateKey = baseToKey.get(key);
        if (templateKey && mapaCodigos[templateKey]) {
            return mapaCodigos[templateKey];
        }
        return key;
    };
}

setup(CASO_ACTUAL, async ({page}) => {

    const isPrd = (process.env.APP_ENV ?? '').trim().toLowerCase() === 'prd';
    if (!isPrd) {
        const dynamicItemsFile = resolve(process.cwd(), 'playwright', '.auth', 'dynamic-items.json');
        let needsToRun = false;
        if (existsSync(dynamicItemsFile)) {
            try {
                const dynamicItems = JSON.parse(readFileSync(dynamicItemsFile, 'utf-8'));
                const dynamicItemsRaw = dynamicItems as Record<string, unknown>;
                const nombresGuardados = dynamicItemsRaw.__nombres as Record<string, string> | undefined;
                for (const template of ITEM_TEMPLATES) {
                    if (!template.fase) continue;
                    if (!dynamicItems[template.key]) {
                        console.log(`[setup-state] Ítem faltante en cache: ${template.key}. Forzando setup...`);
                        needsToRun = true;
                        break;
                    }
                    const nombreGuardado = nombresGuardados?.[template.key];
                    if (nombreGuardado && nombreGuardado !== template.nombre) {
                        console.log(`[setup-state] Template "${template.key}" cambió de nombre ("${nombreGuardado}" → "${template.nombre}"). Forzando recreación...`);
                        delete dynamicItems[template.key];
                        needsToRun = true;
                    }
                }
            } catch (e) {
                needsToRun = true;
            }
        } else {
            needsToRun = true;
        }
        if (needsToRun) {
            markSetupIncomplete(SETUP_NAME);
        }
    }

    if (shouldSkipSetup(SETUP_NAME)) {
        console.log(`[setup-state] ${SETUP_NAME} already completed, skipping`);
        return;
    }

    if (isPrd) {
        const prdItemsFile = resolve(process.cwd(), 'playwright', 'dynamic-items.prd.json');
        if (!existsSync(prdItemsFile)) {
            throw new Error(`[setup-state] PRD: archivo de ítems fijo no encontrado: ${prdItemsFile}.`);
        }
        const prdData = readFileSync(prdItemsFile, 'utf-8');
        const prdMapa = JSON.parse(prdData) as Record<string, unknown>;
        const prdNombres = prdMapa.__nombres as Record<string, string> | undefined;

        let prdNeedsCreate = false;
        for (const template of ITEM_TEMPLATES) {
            if (!template.fase) continue;
            if (!prdMapa[template.key]) {
                console.log(`[setup-state] PRD: ítem faltante en JSON: ${template.key}. Se creará en el ERP...`);
                prdNeedsCreate = true;
                break;
            }
            const nombreGuardado = prdNombres?.[template.key];
            if (nombreGuardado && nombreGuardado !== template.nombre) {
                console.log(`[setup-state] PRD: template "${template.key}" cambió de nombre ("${nombreGuardado}" → "${template.nombre}"). Se recreará...`);
                delete prdMapa[template.key];
                prdNeedsCreate = true;
            }
        }

        if (!prdNeedsCreate) {
            copyFileSync(prdItemsFile, resolve(process.cwd(), 'playwright', '.auth', 'dynamic-items.json'));
            console.log(`[setup-state] PRD: todos los ítems presentes. Cargando desde dynamic-items.prd.json`);
            try {
                const envGroup = 'prd';
                const account = (process.env.USER_EMAIL ?? '').trim().toLowerCase() || 'unknown';
                guardarMapaEnCache(prdMapa as import('@factories/item-factory').DynamicItemsMap, envGroup, account);
            } catch {
                console.warn('[setup-state] No se pudo guardar cache PRD — no crítico');
            }
            markSetupComplete(SETUP_NAME);
            return;
        }

        console.log(`[setup-state] PRD: hay ítems que crear. Continuando con setup en modo PRD...`);
    }

    setup.setTimeout(1_800_000);


    const dynamicItemsFile = resolve(process.cwd(), 'playwright', '.auth', 'dynamic-items.json');
    const existingRunId: string | null = (() => {
        try {
            if (existsSync(dynamicItemsFile)) {
                const mapa = JSON.parse(readFileSync(dynamicItemsFile, 'utf-8'));
                return mapa.RUN_ID ?? null;
            }
        } catch {
        }
        return null;
    })();

    const checkpointPrevio = cargarCheckpoint();
    let RUN_ID: string;
    let itemsDone: Set<string>;

    if (checkpointPrevio && existingRunId && checkpointPrevio.RUN_ID !== existingRunId) {

        logInfo('Checkpoint', `Checkpoint obsoleto (RUN_ID ${checkpointPrevio.RUN_ID}) ≠ mapa actual (${existingRunId}). Descartando checkpoint.`);
        limpiarCheckpoint();
        RUN_ID = existingRunId;
        itemsDone = new Set<string>();
        iniciarCheckpoint(RUN_ID);
        logInfo('Checkpoint', `Reanudando desde mapa existente con RUN_ID ${RUN_ID}`);
    } else if (checkpointPrevio) {
        RUN_ID = checkpointPrevio.RUN_ID;
        itemsDone = new Set(checkpointPrevio.done);
        logInfo('Checkpoint', `Reanudando RUN_ID ${RUN_ID} — ${itemsDone.size} ítems ya creados`);
    } else if (existingRunId) {

        RUN_ID = existingRunId;
        itemsDone = new Set<string>();
        iniciarCheckpoint(RUN_ID);
        logInfo('Checkpoint', `Sin checkpoint previo. Usando RUN_ID del mapa existente: ${RUN_ID}`);
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

    const templatesOrdenados = ITEM_TEMPLATES
        .filter(t => t.fase)
        .sort((a, b) => a.fase! - b.fase!);

    for (const template of templatesOrdenados) {
        const codigo = dc(template.key);

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
            throw error;
        }
    }

    await setup.step('Crear selectores en ITEM_SELECTOR_GRAVADO (454545)', async () => {
        try {
            logInfo('Post-setup', 'Configurando selectores en ITEM_SELECTOR_GRAVADO (454545)...');

            const listaItemsEdit = new ListaItemsPage(page);
            await listaItemsEdit.searchAndEdit('454545');

            const edicionItemPage = new EdicionItemPage(page);
            await edicionItemPage.waitForFormLoad();
            await edicionItemPage.goToSelectoresTab();
            await page.waitForTimeout(1000);

            if (!await edicionItemPage.isSelectorCreado()) {
                
                await edicionItemPage.clickAnadirSelector();
                await page.waitForTimeout(500);
                await edicionItemPage.clickNuevoSelector();
                await page.waitForTimeout(1000);

                
                await edicionItemPage.fillSelectorNombre('Selectores manuales simples');
                await page.waitForTimeout(500);

                
                await edicionItemPage.clickCrearSelectorInventario();
                await page.waitForTimeout(500);
                await edicionItemPage.buscarYAgregarItemSelector('111111');

                
                
                await edicionItemPage.clickCrearSelectorLibre();
                await page.waitForTimeout(500);
                await edicionItemPage.fillManualOptionNombre(1, 'Selector manual 1');
                await edicionItemPage.fillManualOptionPrecio(1, '5.00');
                await page.waitForTimeout(300);

                
                await edicionItemPage.clickAnadirOpcion();
                await page.waitForTimeout(500);
                await edicionItemPage.fillManualOptionNombre(2, 'Selector manual 2');
                await edicionItemPage.fillManualOptionPrecio(2, '10.00');
                await page.waitForTimeout(300);

                
                await edicionItemPage.clickAnadirOpcion();
                await page.waitForTimeout(500);
                await edicionItemPage.fillManualOptionNombre(3, 'Selector manual 3');
                await edicionItemPage.fillManualOptionPrecio(3, '15.00');
                await page.waitForTimeout(300);

                
                await edicionItemPage.clickCrearSelector();

                
                await edicionItemPage.waitForObligatorioSwitch();
                await edicionItemPage.setSelectorObligatorioSwitch();

                await edicionItemPage.clickActualizarProducto();
                await edicionItemPage.closeSuccessModal();
                logInfo('Post-setup', '✓ Selectores creados y switch obligatorio activado en 454545');
            } else {
                logInfo('Post-setup', 'Selector ya existe en 454545 — saltando creación');
            }
        } catch (error) {
            logError('Crear selectores en 454545', error);
            throw error;
        }
    });

    guardarMapaCodigos(mapaCodigos);

    const envGroup = isPrd ? 'prd' : 'crt-group';
    const account = (process.env.USER_EMAIL ?? '').trim().toLowerCase() || 'unknown';
    guardarMapaEnCache(mapaCodigos, envGroup, account);

    if (isPrd) {
        const prdItemsFile = resolve(process.cwd(), 'playwright', 'dynamic-items.prd.json');
        try {
            const {writeFileSync: wf} = await import('node:fs');
            wf(prdItemsFile, JSON.stringify(mapaCodigos, null, 2), 'utf-8');
            logInfo('PRD', `dynamic-items.prd.json actualizado con los nuevos ítems creados`);
        } catch {
            console.warn('[setup-state] No se pudo actualizar dynamic-items.prd.json — hazlo manualmente');
        }
    }

    limpiarCheckpoint();
    markSetupComplete(SETUP_NAME);
    logInfo('Setup Completo', `Todos los ítems de PuntoVenta están listos (RUN_ID: ${RUN_ID}) — checkpoint limpiado`);
});
