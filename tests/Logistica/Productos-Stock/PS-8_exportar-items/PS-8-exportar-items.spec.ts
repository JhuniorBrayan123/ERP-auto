import {expect, test} from '@fixtures/Logistica/edicion-clonado-fixture';

test.describe('PS-08 | Exportar lista de ítems', {tag: ['@logistica', '@productos-stock']}, () => {
    test('SC-01: exportar ítems genera un archivo descargable @PS-08.1', async ({
                                                                          listaItems,
                                                                      }) => {
        await test.step('Exportar lista de ítems', async () => {
            const download = await listaItems.exportarItems();
            const filename = download.suggestedFilename();
            expect(filename).toBeTruthy();
            console.log(`  → Archivo exportado: ${filename}`);
            const path = await download.path();
            expect(path).toBeTruthy();
        });
    });
});
