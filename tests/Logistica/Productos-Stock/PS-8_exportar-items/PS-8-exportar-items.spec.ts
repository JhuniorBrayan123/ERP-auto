import {expect, test} from '@fixtures/Logistica/edicion-clonado-fixture';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

test.describe('PS-08 | Exportar lista de ítems', {tag: ['@logistica', '@productos-stock']}, () => {
    test('SC-01: exportar ítems genera un archivo descargable @PS-08.1', async ({
                                                                           listaItems,
                                                                       }) => {
        await test.step('Exportar lista de ítems', async () => {
            const download = await listaItems.exportarItems();
            const filename = download.suggestedFilename();
            expect(filename).toBeTruthy();
            console.log(`  → Archivo exportado: ${filename}`);

            const destPath = path.join(os.tmpdir(), `ps8-export-${Date.now()}-${filename}`);
            await download.saveAs(destPath);
            expect(fs.existsSync(destPath)).toBeTruthy();
            fs.unlinkSync(destPath);
        });
    });
});
