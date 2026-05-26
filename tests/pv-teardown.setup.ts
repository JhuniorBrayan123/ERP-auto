import { test as setup } from '@playwright/test';
import { Cajero } from '../src/actors/cajero';
import { CerrarCajaActiva } from '../src/task/PuntoVenta/CerrarCaja.task';

setup('Cerrar Caja (Teardown global de Punto de Venta)', async ({ page }) => {
    // Al estar configurado en teardown con el storageState, 'page' ya está autenticada.
    const cajero = Cajero.con(page);
    await cajero.intentaRealizar(CerrarCajaActiva('caja-auto'));
    console.log(" Caja 'caja-auto' cerrada exitosamente en teardown global.");
});
