import { expect, type Page } from '@playwright/test';
import { DatosOpcionalesPage } from './DatosOpcionalesPage';
import type { CampoAdicionalConfig } from '../../helpers/Logistica/datos-adicionales-config';
import type { ProveedorData } from '../../helpers/Logistica/movimiento.types';

export class DatosAdicionalesSetupPage {
    private readonly datosOpcionales: DatosOpcionalesPage;

    constructor(private readonly page: Page) {
        this.datosOpcionales = new DatosOpcionalesPage(page);
    }

    async abrirPanel(): Promise<void> {
        await this.datosOpcionales.abrirDatosOpcionales();
        await this.page.waitForTimeout(1000);
    }

    async guardarDatos(): Promise<void> {
        await this.datosOpcionales.guardarDatos();
    }

    private async campoExiste(tipo: string, indice: number): Promise<boolean> {
        const timeout = 2000;

        switch (tipo) {
            case 'texto': {
                const id = `lgt_reg-movimiento_v-drape:cmp-datos-opcionales_v-input:campo-texto-${indice}`;
                try {
                    await this.page.locator(`[id="${id}"]`).waitFor({ state: 'visible', timeout });
                    return true;
                } catch {
                    return false;
                }
            }
            case 'fecha': {
                const id = `lgt_reg-movimiento_v-drape:cmp-datos-opcionales_v-datepicker:campo-fecha-${indice}`;
                try {
                    await this.page.locator(`[id="${id}"]`).waitFor({ state: 'visible', timeout });
                    return true;
                } catch {
                    return false;
                }
            }
            case 'numero': {
                const id = `lgt_reg-movimiento_v-drape:cmp-datos-opcionales_v-input:campo-numero-${indice}`;
                try {
                    await this.page.locator(`[id="${id}"]`).waitFor({ state: 'visible', timeout });
                    return true;
                } catch {
                    return false;
                }
            }
            case 'seleccion': {
                try {
                    await this.page.getByText('Campos de selección')
                        .waitFor({ state: 'visible', timeout });
                    return true;
                } catch {
                    return false;
                }
            }
            default:
                return false;
        }
    }

    async asegurarCampos(campos: CampoAdicionalConfig[]): Promise<boolean> {
        let creadoAlguno = false;

        const contadores: Record<string, number> = { texto: 0, fecha: 0, numero: 0, seleccion: 0 };

        for (const campo of campos) {
            const indice = contadores[campo.tipo];
            const yaExiste = await this.campoExiste(campo.tipo, indice);

            if (yaExiste) {
                console.log(`     Campo ${campo.tipo} "${campo.nombre}" ya existe`);
            } else {
                console.log(`     Creando campo ${campo.tipo} "${campo.nombre}"...`);

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

                await this.page.waitForTimeout(1000);
                console.log(`    ✓ Campo ${campo.tipo} "${campo.nombre}" creado`);
                creadoAlguno = true;
            }

            contadores[campo.tipo]++;
        }

        if (!creadoAlguno) {
            console.log('   Todos los campos adicionales ya existen');
        }

        return creadoAlguno;
    }

    private async esperarOverlay(): Promise<void> {
        try {
            const overlay = this.page.locator('[id="cmn_cmp-overscreen:block"].is-open');
            await overlay.waitFor({ state: 'hidden', timeout: 10_000 });
        } catch {
            
        }
    }

    private async buscarYSeleccionarProveedor(numDocumento: string, nombreEsperado: string): Promise<boolean> {
        await this.datosOpcionales.buscarProveedor(numDocumento);
        await this.page.waitForTimeout(2000);
        await this.esperarOverlay();

        const noEncontrado = this.page.getByText('Proveedor no encontrado');
        const proveedorNoExiste = await noEncontrado.isVisible().catch(() => false);

        if (proveedorNoExiste) {
            console.log(`      Proveedor "${numDocumento}" no encontrado`);
            const input = this.page.getByRole('textbox', { name: 'Buscar proveedor por nombre o' });
            await input.clear();
            return false;
        }

        const tarjeta = this.page.locator('article[id*="seleccion-entidad"]')
            .filter({ hasText: nombreEsperado }).first();
        const esVisible = await tarjeta.isVisible().catch(() => false);

        if (esVisible) {
            
            await tarjeta.dispatchEvent('click');
            await this.page.waitForTimeout(1000);
            console.log(`      Proveedor "${nombreEsperado}" seleccionado`);
            return true;
        }

        return false;
    }

    async asegurarProveedor(datos: ProveedorData, nombreEsperado: string): Promise<boolean> {
        console.log(`  Verificando proveedor ${datos.numDocumento}...`);

        const existe = await this.buscarYSeleccionarProveedor(datos.numDocumento, nombreEsperado);

        if (existe) {
            console.log(`  ✓ Proveedor "${nombreEsperado}" ya existe — seleccionado`);
            return false;
        }

        console.log(`   Creando proveedor "${datos.numDocumento}"...`);
        await this.datosOpcionales.crearProveedor(datos);
        await this.page.waitForTimeout(2000);
        await this.esperarOverlay();
        console.log(`  ✓ Proveedor "${nombreEsperado}" creado y auto-seleccionado`);
        return true;
    }

    private async buscarYSeleccionarCliente(numDocumento: string, nombreEsperado: string): Promise<boolean> {
        await this.datosOpcionales.buscarCliente(numDocumento);
        await this.page.waitForTimeout(2000);
        await this.esperarOverlay();

        const noEncontrado = this.page.getByText('Cliente no encontrado');
        const clienteNoExiste = await noEncontrado.isVisible().catch(() => false);

        if (clienteNoExiste) {
            console.log(`      Cliente "${numDocumento}" no encontrado`);
            const input = this.page.getByRole('textbox', { name: 'Buscar cliente por nombre o n' });
            await input.clear();
            return false;
        }

        const tarjeta = this.page.locator('article[id*="seleccion-entidad"]')
            .filter({ hasText: nombreEsperado }).first();
        const esVisible = await tarjeta.isVisible().catch(() => false);

        if (esVisible) {
            
            await tarjeta.dispatchEvent('click');
            await this.page.waitForTimeout(1000);
            console.log(`      Cliente "${nombreEsperado}" seleccionado`);
            return true;
        }

        return false;
    }

    async asegurarCliente(datos: ProveedorData, nombreEsperado: string): Promise<boolean> {
        console.log(`  Verificando cliente ${datos.numDocumento}...`);

        const existe = await this.buscarYSeleccionarCliente(datos.numDocumento, nombreEsperado);

        if (existe) {
            console.log(`  ✓ Cliente "${nombreEsperado}" ya existe — seleccionado`);
            return false;
        }

        console.log(`   Creando cliente "${datos.numDocumento}"...`);
        await this.datosOpcionales.crearCliente(datos);
        await this.page.waitForTimeout(2000);
        await this.esperarOverlay();
        console.log(`  ✓ Cliente "${nombreEsperado}" creado y auto-seleccionado`);
        return true;
    }
}
