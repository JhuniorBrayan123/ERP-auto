import {expect, type Page} from '@playwright/test';
import {ClientesTargets} from '@screenplay/targets/clientes-proveedores/ClientesTargets';

export const MensajeBuenTrabajoVisible = () => {
    const fn = async (page: Page): Promise<boolean> => {
        return ClientesTargets.mensajeBuenTrabajo(page).isVisible().catch(() => false);
    };
    fn.displayName = '¿Mensaje Buen Trabajo visible?';
    return fn;
};

export const ClienteVisibleEnListado = (texto: string) => {
    const fn = async (page: Page): Promise<void> => {
        await expect(ClientesTargets.tbody(page)).toContainText(texto);
    };
    fn.displayName = `Cliente visible en listado: ${texto}`;
    return fn;
};


export const ClienteContieneTextoEnDetalle = (texto: string) => {
    const fn = async (page: Page): Promise<void> => {
        await expect(ClientesTargets.appContainer(page)).toContainText(texto);
    };
    fn.displayName = `Detalle contiene: ${texto}`;
    return fn;
};

export const CuerpoContieneTexto = (texto: string) => {
    const fn = async (page: Page): Promise<void> => {
        await expect(page.locator('body')).toContainText(texto);
    };
    fn.displayName = `Body contiene: ${texto}`;
    return fn;
};

export const ValidarCampoVacio = (namePattern: RegExp) => {
    const fn = async (page: Page): Promise<void> => {
        await expect(page.getByRole('textbox', {name: namePattern})).toBeEmpty();
    };
    fn.displayName = `Campo vacío: ${namePattern}`;
    return fn;
};

export const SinResultadosBusqueda = () => {
    const fn = async (page: Page): Promise<void> => {
        await expect(ClientesTargets.celdaSinResultados(page)).toBeVisible();
    };
    fn.displayName = 'No hay resultados en búsqueda';
    return fn;
};

export const BitacoraContieneAccion = (accion: string) => {
    const fn = async (page: Page): Promise<void> => {
        await expect(page.locator('body')).toContainText(accion);
    };
    fn.displayName = `Bitácora contiene: ${accion}`;
    return fn;
};

export const MensajeExitoVisible = (mensaje: string) => {
    const fn = async (page: Page): Promise<void> => {
        await expect(ClientesTargets.mensajeBuenTrabajo(page)).toBeVisible({timeout: 10_000});
        await expect(page.locator('body')).toContainText(mensaje);
    };
    fn.displayName = `Mensaje de éxito: ${mensaje}`;
    return fn;
};

export const FormularioSigueMostrado = () => {
    const fn = async (page: Page): Promise<void> => {
        await expect(ClientesTargets.btnGuardarCliente(page)).toBeVisible();
    };
    fn.displayName = 'Formulario de creación sigue visible';
    return fn;
};

export const MensajeDuplicadoVisible = () => {
    const fn = async (page: Page): Promise<void> => {
        await expect(page.locator('body')).toContainText(
            'Este cliente ya esta registrado, verifique los datos colocados para crear un nuevo cliente o editar este cliente.'
        );
    };
    fn.displayName = 'Mensaje de cliente duplicado visible';
    return fn;
};

export const EstadoClienteEnListado = (estado: 'ACTIVO' | 'INACTIVO') => {
    const fn = async (page: Page): Promise<void> => {
        await expect(ClientesTargets.tbody(page)).toContainText(estado);
    };
    fn.displayName = `Estado en listado: ${estado}`;
    return fn;
};

export const NotaVisibleEnPanel = (textoNota: string) => {
    const fn = async (page: Page): Promise<void> => {
        await expect(page.locator('body')).toContainText(textoNota);
    };
    fn.displayName = `Nota visible en panel: ${textoNota}`;
    return fn;
};

export const NotaVisibleEnDetalle = (textoNota: string) => {
    const fn = async (page: Page): Promise<void> => {
        await expect(ClientesTargets.seccionNotasAdicionales(page)).toBeVisible();
        await expect(ClientesTargets.appContainer(page)).toContainText(textoNota);
    };
    fn.displayName = `Nota visible en detalle: ${textoNota}`;
    return fn;
};

export const MensajeEliminacionVisible = () => {
    const fn = async (page: Page): Promise<void> => {
        await expect(ClientesTargets.mensajeBuenTrabajo(page)).toBeVisible({timeout: 10_000});
        await expect(ClientesTargets.mensajeExitoEliminacion(page)).toBeVisible();
    };
    fn.displayName = 'Mensaje de eliminación exitosa visible';
    return fn;
};

export const MensajeEdicionVisible = () => {
    const fn = async (page: Page): Promise<void> => {
        await expect(ClientesTargets.mensajeBuenTrabajo(page)).toBeVisible({timeout: 10_000});
        await expect(ClientesTargets.mensajeExitoEdicion(page)).toBeVisible();
    };
    fn.displayName = 'Mensaje de edición exitosa visible';
    return fn;
};

export const ClienteNoEliminable = () => {
    const fn = async (page: Page): Promise<void> => {
        await expect(ClientesTargets.mensajeErrorVentasAsociadas(page)).toBeVisible();
        await expect(page.locator('body')).toContainText('No puedes eliminar un cliente que tenga registros asociados');
    };
    fn.displayName = 'Cliente no eliminable por registros asociados';
    return fn;
};

export const ColumnaVisibleEnTabla = (nombreColumna: string) => {
    const fn = async (page: Page): Promise<void> => {
        await expect(ClientesTargets.thead(page)).toContainText(nombreColumna);
    };
    fn.displayName = `Columna visible en tabla: ${nombreColumna}`;
    return fn;
};

export const ColumnaInvisibleEnTabla = (nombreColumna: string) => {
    const fn = async (page: Page): Promise<void> => {
        await expect(ClientesTargets.thead(page)).not.toContainText(nombreColumna);
    };
    fn.displayName = `Columna invisible en tabla: ${nombreColumna}`;
    return fn;
};

export const MensajeErrorCargaMasivaVisible = () => {
    const fn = async (page: Page): Promise<void> => {
        await expect(ClientesTargets.mensajeErrorMasivo(page)).toBeVisible({timeout: 10_000});
    };
    fn.displayName = 'Mensaje de error de carga masiva visible';
    return fn;
};

export const MensajeExitoCargaMasivaVisible = () => {
    const fn = async (page: Page): Promise<void> => {
        await expect(ClientesTargets.mensajeExitoMasivo(page)).toBeVisible({timeout: 15_000});
    };
    fn.displayName = 'Mensaje de éxito de carga masiva visible';
    return fn;
};

export const MensajeEliminacionMasivaVisible = () => {
    const fn = async (page: Page): Promise<void> => {
        await expect(ClientesTargets.mensajeExitoEliminacionMasiva(page)).toBeVisible({timeout: 10_000});
    };
    fn.displayName = 'Mensaje de éxito de eliminación masiva visible';
    return fn;
};


