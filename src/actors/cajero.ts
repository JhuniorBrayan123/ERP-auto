// src/actors/Cajero.ts
import {Page} from '@playwright/test';

export class Cajero {
    constructor(private page: Page) {
    }

    static con(page: Page) {
        return new Cajero(page);
    }

    async intentaRealizar(...tasks: Array<(page: Page) => Promise<void>>) {
        for (const task of tasks) {
            await task(this.page);
        }
    }

    async pregunta<T>(question: (page: Page) => Promise<T>): Promise<T> {
        return question(this.page);
    }
}