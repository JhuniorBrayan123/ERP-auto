import { test, expect } from '@playwright/test';
import { env } from '../config/env';

test('Check combos filtro', async ({ page, request }) => {
    await page.goto('/');
    const token = await page.evaluate(() => localStorage.getItem('AccessToken'));
    
    console.log('\\n============================');
    console.log('GET /Logistica/api/v1/kardexs/total/combos/filtro');
    
    // El endpoint q descubrimos
    const response = await request.get(`${env.apiUrl}Logistica/api/v1/kardexs/total/combos/filtro`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.ok()) {
        const body = await response.json();
        console.log(JSON.stringify(body, null, 2));
    } else {
        console.log('Error', response.status(), response.statusText());
    }
});
