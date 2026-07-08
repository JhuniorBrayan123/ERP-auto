import {test as base} from '@playwright/test';
import {NavigationPage} from '@pages/Logistica/NavigationPage';
import {ListaItemsPage} from '@pages/Logistica/ListaItemsPage';
import {EdicionItemPage} from '@pages/Logistica/EdicionItemPage';
import {ItemDetailPage} from '@pages/Logistica/ItemDetailPage';

type EdicionClonadoFixtures = {
    navigationPage: NavigationPage;
    listaItems: ListaItemsPage;
    edicionItem: EdicionItemPage;
    itemDetail: ItemDetailPage;
};

export const test = base.extend<EdicionClonadoFixtures>({
    navigationPage: [async ({page}, use) => {
        const nav = new NavigationPage(page);
        await page.goto('/');
        await nav.navegarAProductosYStock();
        await use(nav);
    }, {auto: true}],

    listaItems: async ({page}, use) => {
        await use(new ListaItemsPage(page));
    },

    edicionItem: async ({page}, use) => {
        await use(new EdicionItemPage(page));
    },

    itemDetail: async ({page}, use) => {
        await use(new ItemDetailPage(page));
    },
});

test.afterEach(async ({}, testInfo) => {
    const status = testInfo.status === 'passed' ? ' PASS' : ' FAIL';
    const duracion = ((testInfo.duration ?? 0) / 1000).toFixed(1);
    const mensaje = `${status}: ${testInfo.title} (${duracion}s)`;

    if (testInfo.status !== 'passed' && testInfo.error) {
        console.log(`${mensaje} → ${testInfo.error.message}`);
    } else {
        console.log(mensaje);
    }
});

export {expect} from '@playwright/test';
