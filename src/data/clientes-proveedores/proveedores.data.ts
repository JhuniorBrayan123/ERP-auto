export interface DatosProveedorInput {
    tipoDocumento: 'DNI' | 'RUC' | 'Identification.Number.IN.Doc.';
    numeroDocumento: string;
    nombreRazonSocial: string;
    codigo: string;
    direccion: string;
    telefono: string;
    email: string;
    estado?: 'Activo' | 'Inactivo';
}

const SUFFIX = () => `${Date.now()}`.slice(-6);

export function generarProveedorDNI(): DatosProveedorInput {
    const s = SUFFIX();
    return {
        tipoDocumento: 'DNI',
        numeroDocumento: `77${s}`,
        nombreRazonSocial: `PROV-AUTO-${s}`,
        codigo: s,
        direccion: `Lima-${s}`,
        telefono: `999999${s}`.slice(0, 9),
        email: `prov${s}@test.com`,
    };
}

export function generarProveedorRUC(): DatosProveedorInput {
    const s = SUFFIX();
    return {
        tipoDocumento: 'RUC',
        numeroDocumento: `20${s}${'0'.repeat(11 - s.length - 2)}`,
        nombreRazonSocial: `PROV-RUC-${s}`,
        codigo: `RUC${s}`,
        direccion: `Arequipa-${s}`,
        telefono: `999999${s}`.slice(0, 9),
        email: `ruc${s}@test.com`,
    };
}

export function generarProveedorIdentificacionExtranjera(): DatosProveedorInput {
    const s = SUFFIX();
    return {
        tipoDocumento: 'Identification.Number.IN.Doc.',
        numeroDocumento: `IN123456${s}`,
        nombreRazonSocial: `PROV-EXT-${s}`,
        codigo: `IN${s}`,
        direccion: `Piura-${s}`,
        telefono: `999999${s}`.slice(0, 9),
        email: `ext${s}@test.com`,
    };
}
