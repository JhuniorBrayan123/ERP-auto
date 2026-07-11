import {test} from '@fixtures/Logistica/masivos-fixture';
import {MASIVO_CONFIG} from '@helpers/Logistica/masivo-config.helper';
import {ejecutarTestCargaMasiva} from '@helpers/Logistica/verificaciones-items.helper';

const CONFIG = MASIVO_CONFIG.listas;

test.describe('PS-02 | Carga masiva de listas de productos desde Excel', {tag: ['@logistica', '@productos-stock']}, () => {

    test('SC-01: crear listas de productos masivamente desde excel @PS-02.1', async ({
                                                                         page,
                                                                         cargaMasiva,
                                                                     }) => {
        await ejecutarTestCargaMasiva(page, cargaMasiva, 'listas', CONFIG);
    });
});
