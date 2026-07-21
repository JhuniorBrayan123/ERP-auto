export interface DatosConductorInput {
    tipoDocumento: 'DNI' | 'RUC' | 'Pasaporte';
    numeroDocumento: string;
    nombreRazonSocial: string;
    codigo: string;
    categoriaLicencia: string;
    numeroLicencia: string;
    zonaTransporte: string;
    direccion: string;
    telefono: string;
    email: string;
    estado?: 'Activo' | 'Inactivo';
}

const SUFFIX = () => `${Date.now()}`.slice(-6);

export function generarConductorDNI(): DatosConductorInput {
    const s = SUFFIX();
    return {
        tipoDocumento: 'DNI',
        numeroDocumento: `25${s}`,
        nombreRazonSocial: `COND-AUTO-${s}`,
        codigo: s,
        categoriaLicencia: 'B-IIa',
        numeroLicencia: `AB${s}12`,
        zonaTransporte: 'Lima Sur',
        direccion: `Arequipa-${s}`,
        telefono: `999${s}`.slice(0, 9),
        email: `cond${s}@test.com`,
    };
}

export function generarConductorPasaporte(): DatosConductorInput {
    const s = SUFFIX();
    return {
        tipoDocumento: 'Pasaporte',
        numeroDocumento: `P${s}`,
        nombreRazonSocial: `COND-PAS-${s}`,
        codigo: `C${s}`,
        categoriaLicencia: 'B-I',
        numeroLicencia: `AC${s}34`,
        zonaTransporte: 'Arequipa Centro',
        direccion: `Arequipa-${s}`,
        telefono: `999999${s}`.slice(0, 9),
        email: `condpas${s}@test.com`,
    };
}
