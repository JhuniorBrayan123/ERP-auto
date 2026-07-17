import type {DatosClienteInput} from './clientes.data';

const suffix = () => `-cond-${Date.now()}`;

export function generarConductor(overrides?: Partial<DatosClienteInput>): DatosClienteInput {
    return {
        tipoDocumento: 'DNI',
        numeroDocumento: `65432100`,
        nombreRazonSocial: `Conductor DNI${suffix()}`,
        codigo: `C${suffix()}`,
        direccion: 'Av. Conductor 789',
        telefono: '933322211',
        email: 'conductor@test.com',
        ...overrides,
    };
}
