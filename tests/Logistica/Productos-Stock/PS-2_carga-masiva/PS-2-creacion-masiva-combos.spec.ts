import {test} from '@fixtures/Logistica/masivos-fixture';
import {MASIVO_CONFIG} from '@helpers/Logistica/masivo-config.helper';
import {ejecutarTestCargaMasiva} from '@helpers/Logistica/verificaciones-items.helper';

const CONFIG = MASIVO_CONFIG.combos;

test.describe('PS-2 | Carga masiva de combos desde Excel', {tag: ['@logistica', '@productos-stock']}, () => {

    test('crear combos masivamente desde excel @PS-2', async ({
                                                            page,
                                                            cargaMasiva,
                                                        }) => {
        await ejecutarTestCargaMasiva(page, cargaMasiva, 'combos', CONFIG);
    });
});
