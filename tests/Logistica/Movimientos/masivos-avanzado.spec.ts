import { test } from '@playwright/test';
import * as path from 'node:path';

function getDataFile(nombre: string) {
    const basePath = path.resolve(process.cwd(), 'src', 'data');

    const files: Record<string, string> = {
        productos: 'FORMATO_SUBIDA_PRODUCTOS.xlsx',
        servicios: 'FORMATO_SUBIDA_SERVICIOS.xlsx',
        combos: 'FORMATO_SUBIDA_COMBOS.xlsx',
        insumos: 'FORMATO_SUBIDA_INSUMOS.xlsx',
        recetas: 'FORMATO_SUBIDA_RECETA.xlsx',
        listas:'FORMATO_SUBIDA_LISTAS.xlsx',
    };

    const fileName = files[nombre];

    if (!fileName) {
        throw new Error(`Archivo no configurado para: ${nombre}`);
    }

    return path.join(basePath, fileName);
}

test('subir productos', async ({ page }) => {
    const filePath = getDataFile('productos');
    await page.locator('input[type="file"]').setInputFiles(filePath);
});

test('subir servicios', async ({ page }) => {
    const filePath = getDataFile('servicios');
    await page.locator('input[type="file"]').setInputFiles(filePath);
});