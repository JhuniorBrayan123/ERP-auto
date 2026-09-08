import {type Page} from '@playwright/test';

export const esperarCargaGrillaComprobantes = async (page: Page, timeout = 35_000): Promise<void> => {
    const textoCarga = page.locator('.container-v-grid-header-body')
        .getByText('Estamos cargando tus comprobantes...');

    const visible = await textoCarga.isVisible({timeout: 500}).catch(() => false);
    if (!visible) return;

    await textoCarga.waitFor({state: 'hidden', timeout});
};
