import {test as validacionTest} from './validacion-fixture';
import {Cajero} from '@actors/cajero';
import {UsarNavegador} from '@abilities/usarnavegador';

type AnulacionNotaVentaFixtures = {
    cajero: Cajero;
};

export const test = validacionTest.extend<AnulacionNotaVentaFixtures>({
    cajero: async ({page}, use) => {
        await use(Cajero.llamado('Cajero').quienPuede(UsarNavegador.con(page)));
    },
});

export {expect} from '@playwright/test';
