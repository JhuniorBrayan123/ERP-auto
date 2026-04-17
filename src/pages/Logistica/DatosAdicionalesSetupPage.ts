import {type Page} from '@playwright/test';
import {DatosOpcionalesPage} from './DatosOpcionalesPage';
import type {CampoAdicionalConfig} from '../../helpers/Logistica/datos-adicionales-config';
import type {ProveedorData} from '../../helpers/Logistica/movimiento.types';

/**
 * Page Object para el setup idempotente de datos adicionales y proveedor.
 *
 * Implementa lógica "Find or Create" **por campo individual**:
 * - Verifica CADA campo adicional antes de crearlo (no all-or-nothing)
 * - Verifica si el proveedor ya existe antes de crearlo
 * - Maneja correctamente creaciones parciales (por retry o interrupción)
 * - Agrega esperas de estabilidad entre creaciones para evitar fallos de UI
 *
 * Usa DatosOpcionalesPage internamente para las operaciones de creación.
 *
 * USO: solo desde datos-adicionales.setup.ts (no desde specs).
 */
export class DatosAdicionalesSetupPage {
    private readonly datosOpcionales: DatosOpcionalesPage;

    constructor(private readonly page: Page) {
        this.datosOpcionales = new DatosOpcionalesPage(page);
    }

    // ─── Panel ─────────────────────────────────────────────────────

    /** Abre el panel de datos opcionales */
    async abrirPanel(): Promise<void> {
        await this.datosOpcionales.abrirDatosOpcionales();
        await this.page.waitForTimeout(1000);
    }

    /** Guarda datos opcionales (persiste definiciones de campos) */
    async guardarDatos(): Promise<void> {
        await this.datosOpcionales.guardarDatos();
    }

    // ─── Detección de existencia por campo individual ──────────────

    /**
     * Verifica si un campo adicional específico ya existe en el panel.
     *
     * - texto/número: busca el input con ID estructurado `campo-{tipo}-{indice}`
     * - fecha: busca el datepicker con ID estructurado `campo-fecha-{indice}`
     * - selección: busca el header de sección "Campos de selección" visible
     */
    private async campoExiste(tipo: string, indice: number): Promise<boolean> {
        const timeout = 2000;

        switch (tipo) {
            case 'texto': {
                const id = `lgt_reg-movimiento_v-drape:cmp-datos-opcionales_v-input:campo-texto-${indice}`;
                try {
                    await this.page.locator(`[id="${id}"]`).waitFor({state: 'visible', timeout});
                    return true;
                } catch {
                    return false;
                }
            }
            case 'fecha': {
                const id = `lgt_reg-movimiento_v-drape:cmp-datos-opcionales_v-datepicker:campo-fecha-${indice}`;
                try {
                    await this.page.locator(`[id="${id}"]`).waitFor({state: 'visible', timeout});
                    return true;
                } catch {
                    return false;
                }
            }
            case 'numero': {
                const id = `lgt_reg-movimiento_v-drape:cmp-datos-opcionales_v-input:campo-numero-${indice}`;
                try {
                    await this.page.locator(`[id="${id}"]`).waitFor({state: 'visible', timeout});
                    return true;
                } catch {
                    return false;
                }
            }
            case 'seleccion': {
                // Los campos de selección no tienen ID estructurado accesible.
                // Verificamos si la sección "Campos de selección" existe en el panel.
                try {
                    await this.page.getByText('Campos de selección')
                        .waitFor({state: 'visible', timeout});
                    return true;
                } catch {
                    return false;
                }
            }
            default:
                return false;
        }
    }

    // ─── Setup idempotente de campos (por campo individual) ────────

    /**
     * Asegura que todos los campos adicionales de un tipo de movimiento existan.
     *
     * Verifica CADA campo individualmente antes de crearlo.
     * Esto maneja correctamente el caso de creación parcial (ej: si una corrida
     * anterior creó solo el primer campo y falló en los siguientes).
     *
     * Agrega una espera de 1 segundo entre cada creación para estabilidad de UI.
     *
     * @param campos - Lista de campos a asegurar (de datos-adicionales-config.ts)
     * @returns true si se creó al menos un campo, false si todos ya existían
     */
    async asegurarCampos(campos: CampoAdicionalConfig[]): Promise<boolean> {
        let creadoAlguno = false;

        // Rastrear índices por tipo para la detección basada en ID
        const contadores: Record<string, number> = {texto: 0, fecha: 0, numero: 0, seleccion: 0};

        for (const campo of campos) {
            const indice = contadores[campo.tipo];
            const yaExiste = await this.campoExiste(campo.tipo, indice);

            if (yaExiste) {
                console.log(`    ✅ Campo ${campo.tipo} "${campo.nombre}" ya existe`);
            } else {
                console.log(`    🔧 Creando campo ${campo.tipo} "${campo.nombre}"...`);

                switch (campo.tipo) {
                    case 'texto':
                        await this.datosOpcionales.crearCampoTexto(campo.nombre);
                        break;
                    case 'fecha':
                        await this.datosOpcionales.crearCampoFecha(campo.nombre);
                        break;
                    case 'seleccion':
                        await this.datosOpcionales.crearCampoSeleccion(
                            campo.nombre,
                            campo.opciones!,
                            campo.seleccionPorDefecto,
                        );
                        break;
                    case 'numero':
                        await this.datosOpcionales.crearCampoNumero(campo.nombre);
                        break;
                }

                // Espera para que el UI se estabilice tras cada creación.
                // Sin esto, la siguiente llamada a "Nuevo campo adicional" puede fallar
                // porque el modal de confirmación aún está cerrándose.
                await this.page.waitForTimeout(1000);
                console.log(`    ✓ Campo ${campo.tipo} "${campo.nombre}" creado`);
                creadoAlguno = true;
            }

            contadores[campo.tipo]++;
        }

        if (!creadoAlguno) {
            console.log('  ✅ Todos los campos adicionales ya existen');
        }

        return creadoAlguno;
    }

    // ─── Setup idempotente de proveedor ────────────────────────────

    /**
     * Verifica si un proveedor ya existe en el sistema.
     *
     * Busca por número de documento en el campo de búsqueda del panel
     * de datos opcionales. Si el nombre esperado aparece en los resultados,
     * el proveedor ya existe.
     */
    private async proveedorExiste(numDocumento: string, nombreEsperado: string): Promise<boolean> {
        await this.datosOpcionales.buscarProveedor(numDocumento);
        await this.page.waitForTimeout(2000);

        const resultado = this.page.getByText(nombreEsperado).first();
        const existe = await resultado.isVisible().catch(() => false);

        // Limpiar campo de búsqueda para no afectar el guardado posterior
        const input = this.page.getByRole('textbox', {name: 'Buscar proveedor por nombre o'});
        await input.clear();

        return existe;
    }

    /**
     * Asegura que el proveedor exista en el sistema.
     *
     * Busca por número de documento. Si aparece en resultados, ya existe.
     * Si no aparece, lo crea completo (consulta SUNAT/RENIEC + datos).
     *
     * El proveedor es una entidad global del ERP: una vez creado,
     * está disponible en todos los tipos de movimiento.
     *
     * @param datos - Datos del proveedor a crear (de movimiento-data.helper.ts)
     * @param nombreEsperado - Nombre que aparece en resultados si ya existe
     * @returns true si se creó el proveedor, false si ya existía
     */
    async asegurarProveedor(datos: ProveedorData, nombreEsperado: string): Promise<boolean> {
        console.log(`  Verificando proveedor ${datos.numDocumento}...`);

        const existe = await this.proveedorExiste(datos.numDocumento, nombreEsperado);

        if (existe) {
            console.log(`  ✅ Proveedor "${nombreEsperado}" ya existe`);
            return false;
        }

        console.log(`  🔧 Creando proveedor "${datos.numDocumento}"...`);
        await this.datosOpcionales.crearProveedor(datos);
        // Esperar a que desaparezca el spinner de carga
        await this.page.waitForTimeout(3000);
        console.log(`  ✓ Proveedor creado exitosamente`);
        return true;
    }

    // ─── Setup idempotente de cliente ──────────────────────────────

    /**
     * Verifica si un cliente ya existe en el sistema.
     *
     * Busca por número de documento en el campo de búsqueda de cliente del panel
     * de datos opcionales. Si el nombre esperado aparece en los resultados,
     * el cliente ya existe.
     */
    private async clienteExiste(numDocumento: string, nombreEsperado: string): Promise<boolean> {
        await this.datosOpcionales.buscarCliente(numDocumento);
        await this.page.waitForTimeout(2000);

        const resultado = this.page.getByText(nombreEsperado).first();
        const existe = await resultado.isVisible().catch(() => false);

        // Limpiar campo de búsqueda para no afectar el guardado posterior
        const input = this.page.getByRole('textbox', {name: 'Buscar cliente por nombre o n'});
        await input.clear();

        return existe;
    }

    /**
     * Asegura que el cliente exista en el sistema.
     *
     * Busca por número de documento. Si aparece en resultados, ya existe.
     * Si no aparece, lo crea completo.
     *
     * @param datos - Datos del cliente a crear (reusando interfaz ProveedorData)
     * @param nombreEsperado - Nombre que aparece en resultados si ya existe
     * @returns true si se creó el cliente, false si ya existía
     */
    async asegurarCliente(datos: ProveedorData, nombreEsperado: string): Promise<boolean> {
        console.log(`  Verificando cliente ${datos.numDocumento}...`);

        const existe = await this.clienteExiste(datos.numDocumento, nombreEsperado);

        if (existe) {
            console.log(`  ✅ Cliente "${nombreEsperado}" ya existe`);
            return false;
        }

        console.log(`  🔧 Creando cliente "${datos.numDocumento}"...`);
        await this.datosOpcionales.crearCliente(datos);
        // Esperar a que desaparezca el spinner de carga (cmp-overload) antes de poder guardar
        await this.page.waitForTimeout(3000);
        console.log(`  ✓ Cliente creado exitosamente`);
        return true;
    }
}
