import { test as base } from '@playwright/test';
import { MovimientosNavigationPage } from '../../pages/Logistica/MovimientosNavigationPage';
import { RegistroMovimientoPage } from '../../pages/Logistica/RegistroMovimientoPage';
import { ResultadoMovimientoPage } from '../../pages/Logistica/ResultadoMovimientoPage';
import { ListadoMovimientosPage } from '../../pages/Logistica/ListadoMovimientosPage';
import { StockVerificacionPage } from '../../pages/Logistica/StockVerificacionPage';
import { KardexVerificacionPage } from '../../pages/Logistica/KardexVerificacionPage';
import { DatosOpcionalesPage } from '../../pages/Logistica/DatosOpcionalesPage';
import { MovimientoRapidoPage } from '../../pages/Logistica/MovimientoRapidoPage';
import { KardexApi } from '../../services/Logistica/KardexApi';
import { AlmacenesApi } from '../../services/Logistica/AlmacenesApi';
import { getAccessToken } from '../../helpers/Logistica/get-access-token.helper';

type MovimientosFixtures = {
  movimientosNav: MovimientosNavigationPage;
  registroMovimiento: RegistroMovimientoPage;
  resultadoMovimiento: ResultadoMovimientoPage;
  listadoMovimientos: ListadoMovimientosPage;
  stockVerificacion: StockVerificacionPage;
  kardexVerificacion: KardexVerificacionPage;
  datosOpcionales: DatosOpcionalesPage;
  movimientoRapido: MovimientoRapidoPage;
  kardexApi: KardexApi;
};

export const test = base.extend<MovimientosFixtures>({
  movimientosNav: [async ({ page }, use) => {
    const nav = new MovimientosNavigationPage(page);
    await page.goto('/');
    await use(nav);
  }, { auto: true }],

  registroMovimiento: async ({ page }, use) => {
    await use(new RegistroMovimientoPage(page));
  },

  resultadoMovimiento: async ({ page }, use) => {
    await use(new ResultadoMovimientoPage(page));
  },

  listadoMovimientos: async ({ page }, use) => {
    await use(new ListadoMovimientosPage(page));
  },

  stockVerificacion: async ({ page }, use) => {
    await use(new StockVerificacionPage(page));
  },

  kardexVerificacion: async ({ page }, use) => {
    await use(new KardexVerificacionPage(page));
  },

  datosOpcionales: async ({ page }, use) => {
    await use(new DatosOpcionalesPage(page));
  },

  movimientoRapido: async ({ page }, use) => {
    await use(new MovimientoRapidoPage(page));
  },

  kardexApi: async ({ request, page }, use) => {
    const token = await getAccessToken(page);
    const almacenesApi = new AlmacenesApi(request, token);
    const almacenesQuery = await almacenesApi.buildAlmacenesQuery();
    await use(new KardexApi(request, token, almacenesQuery));
  },
});

export { expect } from '@playwright/test';
