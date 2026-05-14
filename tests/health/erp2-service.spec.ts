// tests/health/erp2-services.spec.ts
import {expect, test} from '@playwright/test';

const services = [
    {
        name: 'Seguridad',
        url: process.env.API_SEGURIDAD_HEALTH,
    },
    {
        name: 'Logística',
        url: process.env.API_LOGISTICA_HEALTH,
    },
    {
        name: 'Finanzas',
        url: process.env.API_FINANZAS_HEALTH,
    },
    {
        name: 'Punto de venta',
        url: process.env.API_PUNTO_VENTA_HEALTH,
    },
];

for (const service of services) {
    test(`health check - ${service.name}`, async ({request}) => {
        if (!service.url) {
            throw new Error(`No se configuró URL de health para ${service.name}`);
        }

        const response = await request.get(service.url);

        expect(
            response.ok(),
            `${service.name} no está saludable. Status: ${response.status()}`
        ).toBeTruthy();
    });
}