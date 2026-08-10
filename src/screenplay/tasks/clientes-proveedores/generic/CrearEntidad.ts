import {expect, type Page} from '@playwright/test';
import type {DatosClienteInput} from '@data/clientes-proveedores/clientes.data';
import {esperarCargaOverlay} from '@utils/wait-helpers';

export function crearTasksEntidad<T extends Record<string, Function>>(T: T, label: string) {

    const NavegarAEntidad = () => {
        const fn = async (page: Page): Promise<void> => {
            const btn = (T as any).btnCrearEntidad?.(page) ?? page.locator('div').filter({hasText: new RegExp(`^Crear ${label}$`)});
            await btn.waitFor({state: 'visible', timeout: 15_000});
        };
        fn.displayName = `Navegar a submódulo ${label}`;
        return fn;
    };

    const AbrirCrear = () => {
        const fn = async (page: Page): Promise<void> => {
            const btn = (T as any).btnCrearEntidad?.(page) ?? page.locator('div').filter({hasText: new RegExp(`^Crear ${label}$`)});
            await btn.click();
        };
        fn.displayName = `Abrir formulario Crear ${label}`;
        return fn;
    };

    const SeleccionarTipoDoc = (tipo: string) => {
        const fn = async (page: Page): Promise<void> => {
            await T.selectTipoDocumento(page).click();
            await T.opcionDocumentoEnDropdown(page, tipo).click();
        };
        fn.displayName = `Seleccionar tipo documento: ${tipo}`;
        return fn;
    };

    const LlenarNumeroDocumento = (numero: string) => {
        const fn = async (page: Page): Promise<void> => {
            const input = T.inputNumeroDocumento(page);
            await input.click();
            await input.fill(numero);
        };
        fn.displayName = `Llenar N° documento: ${numero}`;
        return fn;
    };

    const LlenarNombreRazonSocial = (nombre: string) => {
        const fn = async (page: Page): Promise<void> => {
            const input = T.inputNombreRazonSocial(page);
            await input.click();
            await input.fill(nombre);
        };
        fn.displayName = `Llenar nombre/razón social: ${nombre}`;
        return fn;
    };

    const CambiarCodigoAManual = (codigo: string) => {
        const fn = async (page: Page): Promise<void> => {
            await T.toggleTipoCodigo(page).getByText('Automático').click();
            await T.opcionManual(page).click();
            const input = T.inputCodigo(page);
            await input.click();
            await input.fill(codigo);
        };
        fn.displayName = `Cambiar código a manual: ${codigo}`;
        return fn;
    };

    const LlenarDireccion = (direccion: string) => {
        const fn = async (page: Page): Promise<void> => {
            const input = T.inputDireccion(page);
            await input.click();
            await input.fill(direccion);
        };
        fn.displayName = `Llenar dirección: ${direccion}`;
        return fn;
    };

    const LlenarTelefono = (telefono: string) => {
        const fn = async (page: Page): Promise<void> => {
            const input = T.inputTelefono(page);
            await input.click();
            await input.fill(telefono);
        };
        fn.displayName = `Llenar teléfono: ${telefono}`;
        return fn;
    };

    const LlenarEmail = (email: string) => {
        const fn = async (page: Page): Promise<void> => {
            const input = T.inputEmail(page);
            await input.click();
            await input.fill(email);
        };
        fn.displayName = `Llenar email: ${email}`;
        return fn;
    };

    const AgregarCampoAdicional = (nombre: string, valor: string) => {
        const fn = async (page: Page): Promise<void> => {
            await T.btnNuevoCampoAdicional(page).click();
            await T.tipoCampoTexto(page).click();
            await T.inputNombreCampo(page).fill(nombre);
            const inputValor = T.inputValorCampo(page);
            await inputValor.click();
            await inputValor.fill(valor);
            await T.btnCrearCampo(page).click();
            await expect(T.mensajeBuenTrabajo(page)).toBeVisible();
            await expect(page.locator('body')).toContainText('El campo fue creado exitosamente');
            await T.btnCerrarModal(page).click();
        };
        fn.displayName = `Agregar campo adicional: ${nombre}=${valor}`;
        return fn;
    };

    const ClickCrear = () => {
        const fn = async (page: Page): Promise<void> => {
            const btn = (T as any).btnGuardarEntidad?.(page) ?? T.btnGuardarProveedor?.(page) ?? 
                page.getByRole('button', {name: `Crear ${label}`});
            await btn.click();
        };
        fn.displayName = `Click en Crear ${label}`;
        return fn;
    };

    const CerrarModalExito = () => {
        const fn = async (page: Page): Promise<void> => {
            const btn = T.btnCerrarModal(page);
            try {
                await btn.waitFor({state: 'visible', timeout: 2_000});
                await btn.click();
                await esperarCargaOverlay(page).catch(() => {});
            } catch {
                // El modal ya estaba cerrado: no-op.
            }
        };
        fn.displayName = 'Cerrar modal de éxito';
        return fn;
    };

    const Crear = (datos: DatosClienteInput) => {
        const fn = async (page: Page): Promise<void> => {
            await AbrirCrear()(page);
            await SeleccionarTipoDoc(datos.tipoDocumento)(page);
            await LlenarNumeroDocumento(datos.numeroDocumento)(page);
            await LlenarNombreRazonSocial(datos.nombreRazonSocial)(page);
            await CambiarCodigoAManual(datos.codigo)(page);
            await LlenarDireccion(datos.direccion)(page);
            await LlenarTelefono(datos.telefono)(page);
            await LlenarEmail(datos.email)(page);

            if (datos.campoAdicional) {
                await AgregarCampoAdicional(datos.campoAdicional.nombre, datos.campoAdicional.valor)(page);
            }

            if (datos.estado === 'Inactivo') {
                await T.estadoSelect(page).click();
                await T.estadoInactivo(page).click();
            }

            await ClickCrear()(page);

            await expect(T.mensajeBuenTrabajo(page)).toBeVisible({timeout: 10_000});
            await expect(T.mensajeExitoCreacion(page)).toBeVisible();
            await CerrarModalExito()(page);
        };
        fn.displayName = `Crear ${label} — ${datos.nombreRazonSocial}`;
        return fn;
    };

    return {
        NavegarAEntidad,
        AbrirCrear,
        SeleccionarTipoDoc,
        LlenarNumeroDocumento,
        LlenarNombreRazonSocial,
        CambiarCodigoAManual,
        LlenarDireccion,
        LlenarTelefono,
        LlenarEmail,
        AgregarCampoAdicional,
        ClickCrear,
        CerrarModalExito,
        Crear,
    };
}
