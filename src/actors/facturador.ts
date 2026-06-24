import {Page, test} from '@playwright/test';
import {UsarNavegador} from '@abilities/usarnavegador';

type TaskFn = ((page: Page) => Promise<void>);
type TaskFnConRetorno<T> = ((page: Page) => Promise<T>);
type QuestionFn<T> = ((page: Page) => Promise<T>);

export class Facturador {
    private readonly _usarNavegador: UsarNavegador;

    private constructor(
        public readonly nombre: string,
        usarNavegador: UsarNavegador,
    ) {
        this._usarNavegador = usarNavegador;
    }

    
    static con(page: Page): Facturador {
        return new Facturador('Facturador', UsarNavegador.con(page));
    }

    
    static llamado(nombre: string): { con: (page: Page) => Facturador } {
        return {
            con: (page: Page) => new Facturador(nombre, UsarNavegador.con(page)),
        };
    }

    get page(): Page {
        return this._usarNavegador.page;
    }

    
    async realiza(...tasks: Array<TaskFn>): Promise<void> {
        for (const task of tasks) {
            const nombre =
                (task as { displayName?: string }).displayName ||
                task.name ||
                'Acción de negocio';

            await test.step(nombre, async () => {
                await task(this.page);
            });
        }
    }

    
    async realizaYObtiene<T>(task: TaskFnConRetorno<T>): Promise<T> {
        const nombre =
            (task as { displayName?: string }).displayName ||
            task.name ||
            'Acción con retorno';

        return test.step(nombre, async () => {
            return task(this.page);
        });
    }

    
    async pregunta<T>(question: QuestionFn<T>): Promise<T> {
        const nombre =
            (question as { displayName?: string }).displayName ||
            question.name ||
            'Pregunta';

        return test.step(nombre, async () => {
            return question(this.page);
        });
    }
}
