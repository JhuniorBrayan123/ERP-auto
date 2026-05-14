// tests/fixtures/erp-test.ts
import {expect, test as base} from '@playwright/test';

type RuntimeIssue = {
    type: 'console' | 'pageerror' | 'requestfailed' | 'http' | 'websocket';
    severity: 'warning' | 'critical';
    url?: string;
    status?: number;
    message: string;
};

const CRITICAL_MESSAGES = [
    /Failed to fetch/i,
    /Failed to complete negotiation/i,
    /Failed to start the connection/i,
    /Error al conectar con SignalR/i,
    /WebSocket.*failed/i,
    /unsupported MIME type/i,
    /service-worker/i,
    /Unexpected response code: 404/i,
    /Unable to connect to the server/i,
];

const ERP_CRITICAL_URLS = [
    /erpperuapi/i,
    /smartclic/i,
    /Logistica/i,
    /MSSeguridad/i,
    /MSPlanillas/i,
    /Finanzas/i,
    /PuntoVenta/i,
    /hub/i,
    /signalr/i,
    /service-worker/i,
];

function isCriticalMessage(text: string): boolean {
    return CRITICAL_MESSAGES.some((pattern) => pattern.test(text));
}

function isCriticalUrl(url: string): boolean {
    return ERP_CRITICAL_URLS.some((pattern) => pattern.test(url));
}

export const test = base.extend({
    page: async ({page}, use, testInfo) => {
        const issues: RuntimeIssue[] = [];

        const addIssue = (issue: RuntimeIssue) => {
            issues.push(issue);
        };

        page.on('console', (msg) => {
            const text = msg.text();

            if (
                ['error', 'warning'].includes(msg.type()) &&
                isCriticalMessage(text)
            ) {
                addIssue({
                    type: 'console',
                    severity: 'critical',
                    message: text,
                });
            }
        });

        page.on('pageerror', (error) => {
            addIssue({
                type: 'pageerror',
                severity: 'critical',
                message: error.message,
            });
        });

        page.on('requestfailed', (request) => {
            const url = request.url();

            if (isCriticalUrl(url)) {
                addIssue({
                    type: 'requestfailed',
                    severity: 'critical',
                    url,
                    message: request.failure()?.errorText ?? 'Request failed',
                });
            }
        });

        page.on('response', (response) => {
            const status = response.status();
            const url = response.url();

            if (isCriticalUrl(url) && status >= 400) {
                addIssue({
                    type: 'http',
                    severity: status >= 500 ? 'critical' : 'warning',
                    url,
                    status,
                    message: `HTTP ${status} en ${url}`,
                });
            }
        });

        page.on('websocket', (ws) => {
            const url = ws.url();

            ws.on('socketerror', (error) => {
                if (isCriticalUrl(url)) {
                    addIssue({
                        type: 'websocket',
                        severity: 'critical',
                        url,
                        message: `WebSocket error: ${error}`,
                    });
                }
            });

            ws.on('close', () => {
                if (isCriticalUrl(url)) {
                    addIssue({
                        type: 'websocket',
                        severity: 'warning',
                        url,
                        message: `WebSocket cerrado: ${url}`,
                    });
                }
            });
        });

        await use(page);

        if (issues.length > 0) {
            await testInfo.attach('erp-runtime-issues.json', {
                body: JSON.stringify(issues, null, 2),
                contentType: 'application/json',
            });
        }

        const criticalIssues = issues.filter((issue) => issue.severity === 'critical');

        expect(
            criticalIssues,
            `Se detectaron errores críticos de runtime:\n${JSON.stringify(criticalIssues, null, 2)}`
        ).toEqual([]);
    },
});

export {expect};