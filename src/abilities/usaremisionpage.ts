import {Page} from '@playwright/test';
import {EmisionPage} from '@pages/PuntoVenta/EmisionPage';

export class UsarEmisionPage {
    constructor(public readonly emisionPage: EmisionPage) {
    }

    static con(page: Page): UsarEmisionPage {
        return new UsarEmisionPage(new EmisionPage(page));
    }
}
