import {Page, test} from '@playwright/test';
import {UsarNavegador} from '../abilities/usarnavegador';

type TaskType = ((actor: Cajero) => Promise<void>) | ((page: Page) => Promise<void>);
type QuestionType<T> = ((actor: Cajero) => Promise<T>) | ((page: Page) => Promise<T>);

export class Cajero {
    private abilities: Map<string, any> = new Map();

    private constructor(public readonly nombre: string) {
    }

    static llamado(nombre: string): Cajero {
        return new Cajero(nombre);
    }

    static con(page: Page): Cajero {
        return Cajero.llamado('Cajero').quienPuede(UsarNavegador.con(page));
    }

    quienPuede(ability: any): Cajero {
        this.abilities.set(ability.constructor.name, ability);
        return this;
    }

    habilidad<T>(AbilityType: new (...args: any[]) => T): T {
        const ability = this.abilities.get(AbilityType.name);
        if (!ability) {
            throw new Error(`El actor ${this.nombre} no tiene la habilidad ${AbilityType.name}`);
        }
        return ability as T;
    }

    async intentaRealizar(...tasks: Array<TaskType>): Promise<void> {
        for (const task of tasks) {
            const nombre = (task as any).displayName || task.name || 'Paso';
            await test.step(nombre, async () => {
                // Evaluamos si el task espera un Cajero o un Page basándonos en los parámetros
                if (task.length === 1 && task.toString().includes('actor')) {
                    await (task as (actor: Cajero) => Promise<void>)(this);
                } else {
                    // Fallback a legacy: asume que espera un Page
                    const navegador = this.habilidad(UsarNavegador);
                    await (task as (page: Page) => Promise<void>)(navegador.page);
                }
            });
        }
    }
    
    async pregunta<T>(question: QuestionType<T>): Promise<T> {
        if (question.length === 1 && question.toString().includes('actor')) {
            return (question as (actor: Cajero) => Promise<T>)(this);
        } else {
            // Fallback a legacy
            const navegador = this.habilidad(UsarNavegador);
            return (question as (page: Page) => Promise<T>)(navegador.page);
        }
    }
}