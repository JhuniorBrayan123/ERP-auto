import {existsSync, readdirSync} from 'node:fs';
import {join, resolve} from 'node:path';
import type {Page} from '@playwright/test';
import {test as base} from './emision-fixture';
import {env} from '../../../config/env';
import {Cajero} from '@actors/cajero';
import {CajaPage} from '@pages/PuntoVenta/CajaPage';
import {EmisionPage} from '@pages/PuntoVenta/EmisionPage';
import {ClientePage} from '@pages/PuntoVenta/ClientePage';
import {ComprobantePage} from '@pages/PuntoVenta/ComprobantePage';
import {PostEmisionPage} from '@pages/PuntoVenta/PostEmisionPage';
import {BusquedaComprobantesPage} from '@pages/PuntoVenta/BusquedaComprobantesPage';
import {EmisionDatosOpcionalesPage} from '@pages/PuntoVenta/EmisionDatosOpcionalesPage';
import {esperarCargaOverlay} from '@utils/wait-helpers';
import {CAJAS, CLIENTES, ITEMS_PV} from '@helpers/PuntoVenta/emision-data.helper';
import type {ComprobanteInfo, DatosOpcionales} from '@helpers/PuntoVenta/busqueda-comprobantes.data';
import {detectAccount, detectEnvironmentFine} from '@utils/setup-state';
import {generarSlugCache} from '@factories/item-factory';

export function resolveActiveStorageState(): string {
    if (process.env.PW_STORAGE_STATE) return process.env.PW_STORAGE_STATE;

    // ✅ Usar la misma lógica que playwright.config.ts — detectar cuenta actual
    const envGroup = detectEnvironmentFine();
    const account = detectAccount();
    const slug = generarSlugCache(envGroup, account);
    const accountPath = resolve(process.cwd(), 'playwright', '.auth', `user.${slug}.json`);
    if (existsSync(accountPath)) return `playwright/.auth/user.${slug}.json`;

    const generic = resolve(process.cwd(), 'playwright', '.auth', 'user.json');
    if (existsSync(generic)) return generic;

    const authDir = resolve(process.cwd(), 'playwright', '.auth');
    if (existsSync(authDir)) {
        const files = readdirSync(authDir).filter(
            f => f.endsWith('.json')
                && f.startsWith('user.')
                && !f.includes('placeholder')
                && !f.endsWith('{}.json'),
        );
        if (files.length > 0) return join(authDir, files[0]);
    }
    throw new Error('[resolveActiveStorageState] No se encontró ningún storageState en playwright/.auth/');
}


export function resolveBaseUrl(): string {
    return env.baseUrl;
}

export type {ComprobanteInfo};

export type BusquedaComprobantesFixtures = {
    busquedaPage: BusquedaComprobantesPage;
    actor: import('@actors/cajero').Cajero;
};


export const test = base.extend<BusquedaComprobantesFixtures>({
    busquedaPage: async ({page}, use) => {
        await use(new BusquedaComprobantesPage(page));
    },
    actor: async ({page}, use) => {
        await use(Cajero.con(page));
    },
});

export {expect} from '@playwright/test';

export async function crearBoletaSemilla(page: Page): Promise<ComprobanteInfo> {
    const cajaPage = new CajaPage(page, CAJAS.VENTA.nombre);
    const comprobantePage = new ComprobantePage(page);
    const clientePage = new ClientePage(page);
    const emisionPage = new EmisionPage(page);
    const postEmision = new PostEmisionPage(page);

    await page.goto('/');
    await page.getByText('Ventas y compras').click();
    await page.getByText('Ver cajas').click();
    await cajaPage.asegurarCajaAbierta();

    await comprobantePage.seleccionarBoleta();
    await clientePage.seleccionarClienteDNI(
        CLIENTES.PERSONA_DNI.documento,
        `DNIDoc. Nacional de Identidad${CLIENTES.PERSONA_DNI.documento}99999999${CLIENTES.PERSONA_DNI.nombre}`,
    );
    await emisionPage.buscarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.codigo);
    await emisionPage.seleccionarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.nombre);
    const emision = await emisionPage.emitirConEfectivoExacto();
    const numeroCompleto = await postEmision.obtenerCorrelativoDinamico();
    const [serie, correlativo] = numeroCompleto.split('-');

    await emisionPage.clickNuevaVenta();

    const semilla: ComprobanteInfo = {
        tipo: 'Boleta',
        serie: serie ?? emision.serie,
        correlativo: correlativo ?? emision.correlativo,
        numeroCompleto: numeroCompleto || `${emision.serie}-${emision.correlativo}`,
        cliente: CLIENTES.PERSONA_DNI.nombre,
        estado: 'EMITIDO',
    };

    console.log(`[Semilla] Boleta creada: ${semilla.numeroCompleto}`);
    return semilla;
}

export async function crearFacturaSemilla(page: Page): Promise<ComprobanteInfo> {
    const cajaPage = new CajaPage(page, CAJAS.VENTA.nombre);
    const comprobantePage = new ComprobantePage(page);
    const clientePage = new ClientePage(page);
    const emisionPage = new EmisionPage(page);
    const postEmision = new PostEmisionPage(page);

    await page.goto('/');
    await page.getByText('Ventas y compras').click();
    await page.getByText('Ver cajas').click();
    await cajaPage.asegurarCajaAbierta();

    await comprobantePage.seleccionarFactura();
    await clientePage.seleccionarClienteRUCAuto();
    await emisionPage.buscarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.codigo);
    await emisionPage.seleccionarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.nombre);
    const emision = await emisionPage.emitirConEfectivoExacto();
    const numeroCompleto = await postEmision.obtenerCorrelativoDinamico();
    const [serie, correlativo] = numeroCompleto.split('-');

    await emisionPage.clickNuevaVenta();

    const semilla: ComprobanteInfo = {
        tipo: 'Factura',
        serie: serie ?? emision.serie,
        correlativo: correlativo ?? emision.correlativo,
        numeroCompleto: numeroCompleto || `${emision.serie}-${emision.correlativo}`,
        cliente: CLIENTES.EMPRESA_RUC_AUTO.nombre,
        estado: 'EMITIDO',
    };

    console.log(`[Semilla] Factura creada: ${semilla.numeroCompleto}`);
    return semilla;
}

export async function crearBoletaConDatosOpcionales(page: Page): Promise<ComprobanteInfo> {
    const cajaPage = new CajaPage(page, CAJAS.VENTA.nombre);
    const comprobantePage = new ComprobantePage(page);
    const clientePage = new ClientePage(page);
    const emisionPage = new EmisionPage(page);
    const postEmision = new PostEmisionPage(page);
    const datosOpcionalesPage = new EmisionDatosOpcionalesPage(page);

    await page.goto('/');
    await page.getByText('Ventas y compras').click();
    await page.getByText('Ver cajas').click();
    await cajaPage.asegurarCajaAbierta();

    await comprobantePage.seleccionarBoleta();
    await clientePage.seleccionarClienteDNI(
        CLIENTES.PERSONA_DNI.documento,
        `DNIDoc. Nacional de Identidad${CLIENTES.PERSONA_DNI.documento}99999999${CLIENTES.PERSONA_DNI.nombre}`,
    );
    await emisionPage.buscarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.codigo);
    await emisionPage.seleccionarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.nombre);

    
    await datosOpcionalesPage.abrirDatosOpcionales();
    await datosOpcionalesPage.llenarDatosOpcionales(CLIENTES.PERSONA_AUTO);
    await esperarCargaOverlay(page);

    const emision = await emisionPage.emitirConEfectivoExacto();
    const numeroCompleto = await postEmision.obtenerCorrelativoDinamico();
    const [serie, correlativo] = numeroCompleto.split('-');

    await emisionPage.clickNuevaVenta();

    const datosOpcionales: DatosOpcionales = {
        vendedorNombre: CLIENTES.PERSONA_AUTO.nombre,
        ordenCompra: '121',
        contrato: '12',
        comentarios: 'observacion para datos adicionales',
        campoTexto0: 'texto',
        campoNumero0: '123123',
    };

    const semilla: ComprobanteInfo = {
        tipo: 'Boleta',
        serie: serie ?? emision.serie,
        correlativo: correlativo ?? emision.correlativo,
        numeroCompleto: numeroCompleto || `${emision.serie}-${emision.correlativo}`,
        cliente: CLIENTES.PERSONA_DNI.nombre,
        estado: 'EMITIDO',
        datosOpcionales,
    };

    console.log(`[Semilla] Boleta con datos opcionales creada: ${semilla.numeroCompleto}`);
    return semilla;
}
