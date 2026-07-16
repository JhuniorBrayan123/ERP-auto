import {isDirectory} from './runner/filesystem.mjs';
import {TESTS_DIR} from './runner/config.mjs';
import {killCurrentChildren} from './runner/runner.mjs';
import {handleMenuChoice, selectProject} from './runner/ui-menus.mjs';

async function main(): Promise<void> {
    if (!isDirectory(TESTS_DIR)) {
        console.error('\nNo se encontro la carpeta tests en la raiz del proyecto.');
        console.error('Ejecuta este menu desde la raiz donde estan package.json y tests/.\n');
        process.exit(1);
    }

    // Intentar cargar cache de items al inicio
    try {
        const {cargarMapaDesdeCache} = await import('../src/factories/item-factory.js');
        const envGroup = (process.env.APP_ENV ?? '').trim().toLowerCase() === 'prd' ? 'prd' : 'crt-group';
        const currentAccount = (process.env.USER_EMAIL ?? '').trim().toLowerCase() || 'unknown';
        cargarMapaDesdeCache(envGroup, currentAccount);
    } catch {
        // Cache no disponible — no crítico
    }

    while (true) {
        const projectChoice = await selectProject();
        const shouldContinue = await handleMenuChoice(projectChoice);
        if (!shouldContinue) break;
    }

    killCurrentChildren();
    console.log('\nSaliendo...\n');
    process.exit(0);
}

function isExitPromptError(error: unknown): boolean {
    return (
        error instanceof Error &&
        (
            error.name === 'ExitPromptError' ||
            error.message.includes('SIGINT') ||
            error.message.includes('force closed')
        )
    );
}

main().catch((error: unknown) => {
    killCurrentChildren();

    if (isExitPromptError(error)) {
        console.log('\nMenú cancelado por el usuario.\n');
        process.exit(130);
    }

    console.error('\nError en el menú:\n');
    console.error(error);
    process.exit(1);
});
