import {Page, test} from '@playwright/test';
import {UsarNavegador} from '@abilities/usarnavegador';

type TaskFn = ((page: Page) => Promise<void>);
type TaskFnConRetorno<T> = ((page: Page) => Promise<T>);
type QuestionFn<T> = ((page: Page) => Promise<T>);

/**
 * Actor: Facturador
 *
 * Representa a un usuario del módulo de facturación/comprobantes.
 * Puede emitir notas de crédito, notas de débito, facturas, boletas y
 * consultar el estado de comprobantes.
 *
 * Extiende el patrón del Actor Cajero existente, adaptado para el
 * dominio de comprobantes electrónicos.
 *
 * Uso:
 * ```ts
 * const facturador = Facturador.con(page);
 * await facturador.realiza(CrearNotaCreditoConVinculacion({ ... }));
 * const numero = await facturador.realizaYObtiene(NotaCreditoEmitida());
 * ```
 */
export class Facturador {
    private readonly _usarNavegador: UsarNavegador;

    private constructor(
        public readonly nombre: string,
        usarNavegador: UsarNavegador,
    ) {
        this._usarNavegador = usarNavegador;
    }

    /** Factory principal: crea un Facturador con la habilidad de navegar */
    static con(page: Page): Facturador {
        return new Facturador('Facturador', UsarNavegador.con(page));
    }

    /** Named constructor para tests con nombre explícito */
    static llamado(nombre: string): { con: (page: Page) => Facturador } {
        return {
            con: (page: Page) => new Facturador(nombre, UsarNavegador.con(page)),
        };
    }

    get page(): Page {
        return this._usarNavegador.page;
    }

    /**
     * Ejecuta una o más tareas de negocio en secuencia.
     * Cada tarea aparece como un test.step con su displayName.
     */
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

    /**
     * Ejecuta una tarea que retorna un valor (ej. número de comprobante emitido).
     */
    async realizaYObtiene<T>(task: TaskFnConRetorno<T>): Promise<T> {
        const nombre =
            (task as { displayName?: string }).displayName ||
            task.name ||
            'Acción con retorno';

        return test.step(nombre, async () => {
            return task(this.page);
        });
    }

    /**
     * Responde una pregunta sobre el estado del sistema.
     * Retorna el valor leído (string, boolean, Record, etc.).
     */
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
