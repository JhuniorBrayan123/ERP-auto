import type {DatosClienteInput} from './clientes.data';

const suffix = () => `-vnd-${Date.now()}`;

export function generarVendedorDNI(overrides?: Partial<DatosClienteInput>): DatosClienteInput {
    return {
        tipoDocumento: 'DNI',
        numeroDocumento: `76543210`,
        nombreRazonSocial: `Vendedor DNI${suffix()}`,
        codigo: `V${suffix()}`,
        direccion: 'Av. Vendedor 123',
        telefono: '955566677',
        email: 'vendedor@test.com',
        ...overrides,
    };
}

export function generarVendedorRUC(overrides?: Partial<DatosClienteInput>): DatosClienteInput {
    return {
        tipoDocumento: 'RUC',
        numeroDocumento: `20111111111`,
        nombreRazonSocial: `Vendedor RUC${suffix()}`,
        codigo: `VR${suffix()}`,
        direccion: 'Jr. Vendedor 456',
        telefono: '944433322',
        email: 'vendedor.ruc@test.com',
        ...overrides,
    };
}
