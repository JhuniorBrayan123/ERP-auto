import {test} from '@fixtures/Logistica/masivos-fixture';
import {MASIVO_CONFIG} from '@helpers/Logistica/masivo-config.helper';
import {ejecutarTestCargaMasiva} from '@helpers/Logistica/verificaciones-items.helper';

const CONFIG = MASIVO_CONFIG.recetas;

test.describe('PS-02 | Carga masiva de recetas desde Excel', {tag: ['@logistica', '@productos-stock']}, () => {

    test('SC-01: crear recetas masivamente desde excel @PS-02.1', async ({
                                                             page,
                                                             cargaMasiva,
                                                         }) => {
        await ejecutarTestCargaMasiva(page, cargaMasiva, 'recetas', CONFIG);
    });
});
