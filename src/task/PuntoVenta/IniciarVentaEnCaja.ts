// 📁 src/task/PuntoVenta/IniciarVentaEnCaja.ts
// Task: Navega a Ver cajas → Continuar vendiendo
import { Page } from '@playwright/test';

export const IniciarVentaEnCaja = () =>
    async (page: Page): Promise<void> => {
        await page.getByText('Ventas y compras').click();
        await page.getByText('Ver cajas').click();
        await page.getByRole('button', { name: 'Continuar vendiendo' }).click();
    };
