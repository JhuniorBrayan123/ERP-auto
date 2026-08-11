export interface DatosVendedorInput {
    tipoDocumento: 'DNI' | 'RUC' | 'Identification.Number.IN.Doc.';
    numeroDocumento: string;
    nombreRazonSocial: string;
    codigo: string;
    metaMonto: string;
    metaCantidad: string;
    zonaVentas: string;
    direccion: string;
    telefono: string;
    email: string;
    estado?: 'Activo' | 'Inactivo';
}

const SUFFIX = () => `${Date.now()}`.slice(-6);

export function generarVendedorDNI(): DatosVendedorInput {
    const s = SUFFIX();
    return {
        tipoDocumento: 'DNI',
        numeroDocumento: `55${s}`,
        nombreRazonSocial: `VEND-AUTO-${s}`,
        codigo: s,
        metaMonto: '5000',
        metaCantidad: '50',
        zonaVentas: 'Lima Sur',
        direccion: `Arequipa-${s}`,
        telefono: `999999${s}`.slice(0, 9),
        email: `vend${s}@test.com`,
    };
}

export function generarVendedorConCodigoManual(): DatosVendedorInput {
    const s = SUFFIX();
    return {
        tipoDocumento: 'DNI',
        numeroDocumento: `56${s}`,
        nombreRazonSocial: `VEND-MANUAL-${s}`,
        codigo: `M${s}`,
        metaMonto: '3000',
        metaCantidad: '30',
        zonaVentas: 'Lima Centro',
        direccion: `Manual-${s}`,
        telefono: `988${s}`.slice(0, 9),
        email: `vendman${s}@test.com`,
    };
}

export function generarVendedorRUC(): DatosVendedorInput {
    const s = SUFFIX();
    return {
        tipoDocumento: 'RUC',
        numeroDocumento: `20${s}${'0'.repeat(11 - s.length - 2)}`,
        nombreRazonSocial: `VEND-RUC-${s}`,
        codigo: `V${s}`,
        metaMonto: '10000',
        metaCantidad: '100',
        zonaVentas: 'Arequipa Centro',
        direccion: `Arequipa-${s}`,
        telefono: `999999${s}`.slice(0, 9),
        email: `vendruc${s}@test.com`,
    };
}
