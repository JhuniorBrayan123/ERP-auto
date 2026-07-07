import type { Page } from '@playwright/test';

export const DetraccionTargets = {

        selectTipoOperacion: (page: Page) =>
        page.locator('.v-select-header-form').filter({ hasText: /Operaci.n Sujeta a Detracción/i }),

    opcionOperacionBase: (page: Page) =>
        page.getByText('Operación Sujeta a Detracción').first(),

    opcionTransporteCarga: (page: Page) =>
        page.locator('div').filter({ hasText: /^Operación Sujeta a Detracción - Servicio de Transporte de Carga$/ }),

        selectMedioPago: (page: Page) =>
        page.getByText('Depósito en cuenta').first(),

    opcionMedioPago: (page: Page, nombre: string) =>
        page.getByText(nombre, { exact: true }),

    inputPorcentaje: (page: Page) =>
        page.locator('[id="pv_punto-venta_drapes:datos-detraccion_v-input:porcentaje"]'),

    inputNumeroCuenta: (page: Page) =>
        page.locator('[id="pv_punto-venta_drapes:datos-detraccion_v-input:numero-cuenta"]'),

    btnActualizar: (page: Page) =>
        page.getByRole('button', { name: 'Actualizar', exact: true }),

    btnCerrarModalExito: (page: Page) =>
        page.locator('.resultado-operacion > .v-modal > div').first(),

    btnCerrarModalConfig: (page: Page) =>
        page.locator('.v-modal > div').first(),

    
    btnAgregarDetalleCarga: (page: Page) =>
        page.getByRole('button', { name: 'Agregar detalle de carga' }),

    inputUbigeoOrigen: (page: Page) =>
        page.getByRole('textbox', { name: 'Ingresa distrito, ciudad o' }).first(),

    inputUbigeoDestino: (page: Page) =>
        page.getByRole('textbox', { name: 'Ingresa distrito, ciudad o' }),

    inputDireccionOrigen: (page: Page) =>
        page.getByRole('textbox', { name: 'Ingresa dirección de origen' }),

    inputDireccionDestino: (page: Page) =>
        page.getByRole('textbox', { name: 'Ingresa dirección de destino' }),

    inputValorTransporte: (page: Page) =>
        page.locator('[id="pv_punto-venta_drapes:detalle-transporte-carga_v-input:valor-referencial-transporte"]'),

    inputCargaEfectiva: (page: Page) =>
        page.locator('[id="pv_punto-venta_drapes:detalle-transporte-carga_v-input:valor-referencial-carga-efectiva"]'),

    inputCargaUtil: (page: Page) =>
        page.locator('[id="pv_punto-venta_drapes:detalle-transporte-carga_v-input:valor-referencial-carga-util"]'),

    inputDetalleViaje: (page: Page) =>
        page.getByRole('textbox', { name: 'Ingresa detalle del viaje' }),

    btnGuardarDetalleCarga: (page: Page) =>
        page.getByRole('button', { name: 'Guardar', exact: true }),

    
    btnAgregarTramoVehiculo: (page: Page) =>
        page.getByRole('button', { name: 'Agregar tramo y vehículo' }),

    inputConfiguracionVehicular: (page: Page) =>
        page.locator('[id="pv_punto-venta_drapes:informacion-tramo-vehiculo_v-input:configuracion-vehicular"]'),

    inputCargaUtilMetricasVehiculo: (page: Page) =>
        page.locator('[id="pv_punto-venta_drapes:informacion-tramo-vehiculo_v-input:carga-util-metricas-vehiculo"]'),

    inputDescripcionTramo: (page: Page) =>
        page.locator('[id="pv_punto-venta_drapes:informacion-tramo-vehiculo_v-input:description-tramo"]'),

    inputCargaEfectivaToneladas: (page: Page) =>
        page.locator('[id="pv_punto-venta_drapes:informacion-tramo-vehiculo_v-input:carga-efectiva-toneladas-metricas"]'),

    inputValorTransporteTramo: (page: Page) =>
        page.getByRole('textbox', { name: 'Ej. S/' }),

    inputValorReferencialTonelada: (page: Page) =>
        page.locator('[id="pv_punto-venta_drapes:informacion-tramo-vehiculo_v-input:valor-referencial-tonelada-metrica"]'),

    
    textoTipoCambioDetraccion: (page: Page) =>
        page.getByText('Tipo de cambio de detracción'),
};
