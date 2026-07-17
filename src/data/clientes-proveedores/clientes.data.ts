export interface DatosClienteInput {
    tipoDocumento: 'DNI' | 'RUC' | 'Carnet Extranjeria' | 'Pasaporte';
    numeroDocumento: string;
    nombreRazonSocial: string;
    codigo: string;
    direccion: string;
    telefono: string;
    email: string;
    campoAdicional?: {
        nombre: string;
        valor: string;
    };
    estado?: 'Activo' | 'Inactivo';
}

const SUFFIX = () => `${Date.now()}`.slice(-6);

export function generarClienteDNI(): DatosClienteInput {
    const s = SUFFIX();
    return {
        tipoDocumento: 'DNI',
        numeroDocumento: `4545${s}`,
        nombreRazonSocial: `AUTOMATIZADOR-cliente-${s}`,
        codigo: s,
        direccion: `Arequipa-${s}`,
        telefono: `999999${s}`.slice(0, 9),
        email: `cliente${s}@test.com`,
    };
}

export function generarClienteRUC(): DatosClienteInput {
    const s = SUFFIX();
    return {
        tipoDocumento: 'RUC',
        numeroDocumento: `10${s}${'0'.repeat(11 - s.length - 2)}`,
        nombreRazonSocial: `AUTOMATIZADOR-RUC-${s}`,
        codigo: s,
        direccion: `Lima-${s}`,
        telefono: `999999${s}`.slice(0, 9),
        email: `ruc${s}@test.com`,
    };
}

export function generarClienteConCampoAdicional(): DatosClienteInput {
    const s = SUFFIX();
    return {
        tipoDocumento: 'DNI',
        numeroDocumento: `8585${s}`,
        nombreRazonSocial: `cliente-campo-${s}`,
        codigo: s,
        direccion: `Calle Los Olivos ${s}`,
        telefono: `988${s}`.slice(0, 9),
        email: `campo${s}@test.com`,
        campoAdicional: {nombre: 'apodo', valor: `apodo-${s}`},
    };
}
