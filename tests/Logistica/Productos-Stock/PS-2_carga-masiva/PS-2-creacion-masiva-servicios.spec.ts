import {test} from '@fixtures/Logistica/masivos-fixture';
import {MASIVO_CONFIG} from '@helpers/Logistica/masivo-config.helper';
import {ejecutarTestCargaMasiva} from '@helpers/Logistica/verificaciones-items.helper';

const CONFIG = MASIVO_CONFIG.servicios;

test.describe('PS-2 | Carga masiva de servicios desde Excel', {tag: ['@logistica', '@productos-stock']}, () => {

    test('crear servicios masivamente desde excel @PS-2', async ({
                                                               page,
                                                               cargaMasiva,
                                                           }) => {
        await ejecutarTestCargaMasiva(page, cargaMasiva, 'servicios', CONFIG);
    });
});
