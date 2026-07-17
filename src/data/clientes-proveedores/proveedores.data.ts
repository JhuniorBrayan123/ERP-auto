import type {DatosClienteInput} from './clientes.data';

const suffix = () => `-prov-${Date.now()}`;

export function generarProveedorDNI(overrides?: Partial<DatosClienteInput>): DatosClienteInput {
    return {
        tipoDocumento: 'DNI',
        numeroDocumento: `87654321`,
        nombreRazonSocial: `Proveedor DNI${suffix()}`,
        codigo: `P${suffix()}`,
        direccion: 'Av. Prueba 456',
        telefono: '987654321',
        email: 'proveedor@test.com',
        ...overrides,
    };
}

export function generarProveedorRUC(overrides?: Partial<DatosClienteInput>): DatosClienteInput {
    return {
        tipoDocumento: 'RUC',
        numeroDocumento: `20123456789`,
        nombreRazonSocial: `Proveedor RUC${suffix()}`,
        codigo: `PR${suffix()}`,
        direccion: 'Jr. Testing 789',
        telefono: '999888777',
        email: 'proveedor.ruc@test.com',
        ...overrides,
    };
}

export function generarProveedorConCampoAdicional(overrides?: Partial<DatosClienteInput>): DatosClienteInput {
    return {
        ...generarProveedorRUC(overrides),
        campoAdicional: {
            nombre: 'campo-extra',
            valor: `valor-prov-${Date.now()}`,
        },
    };
}
