import {expect, type Locator, type Page, test} from '@playwright/test';
import {throwFunctionalError} from './functional-error';
import {type FunctionalPreset} from './functional-catalog';

export async function runFunctionalStep(
    stepTitle: string,
    page: Page | undefined,
    preset: FunctionalPreset,
    action: () => Promise<void>,
): Promise<void> {
    await test.step(stepTitle, async () => {
        await runFunctionalAction(page, preset, action, test.info().title);
    });
}

export async function runFunctionalAction(
    page: Page | undefined,
    preset: FunctionalPreset,
    action: () => Promise<void>,
    caseName?: string,
): Promise<void> {
    try {
        await action();
    } catch (error) {
        await throwFunctionalError({
            page,
            module: preset.module,
            screen: preset.screen,
            flowStep: preset.flowStep,
            userMessage: preset.userMessage,
            technicalDetail: preset.technicalDetail,
            caseName,
            cause: error,
        });
    }
}

export async function expectVisibleFunctional(
    page: Page,
    locator: Locator,
    preset: FunctionalPreset,
    timeout = 30_000,
): Promise<void> {
    await runFunctionalAction(page, preset, async () => {
        await expect(locator).toBeVisible({timeout});
    });
}
