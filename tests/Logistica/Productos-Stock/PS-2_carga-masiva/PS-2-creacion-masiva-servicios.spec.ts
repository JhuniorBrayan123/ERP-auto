import {test} from '@fixtures/Logistica/masivos-fixture';
import {MASIVO_CONFIG} from '@helpers/Logistica/masivo-config.helper';
import {ejecutarTestCargaMasiva} from '@helpers/Logistica/verificaciones-items.helper';

const CONFIG = MASIVO_CONFIG.servicios;

test.describe('PS-02 | Carga masiva de servicios desde Excel', {tag: ['@logistica', '@productos-stock']}, () => {

    test('SC-01: crear servicios masivamente desde excel @PS-02.1', async ({
                                                               page,
                                                               cargaMasiva,
                                                           }) => {
        await ejecutarTestCargaMasiva(page, cargaMasiva, 'servicios', CONFIG);
    });
});
