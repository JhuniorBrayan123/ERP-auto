import {Page} from '@playwright/test';

export class UsarNavegador {
    constructor(public readonly page: Page) {}

    static con(page: Page): UsarNavegador {
        return new UsarNavegador(page);
    }
}
