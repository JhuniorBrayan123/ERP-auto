export interface VendedorData {
    documento: string;
    nombre: string;
    metaMonto: string;
    metaCantidad: string;
    zona: string;
    direccion: string;
    telefono: string;
    email: string;
}

export interface ClienteSetupData {
    tipoDocumento: 'DNI' | 'RUC';
    documento: string;

    razonSocial?: string;
    direccion: string;
    telefono: string;
    email: string;

    textoExistencia: string;
}

export interface CampoAdicionalPVConfig {
    tipo: 'texto' | 'fecha' | 'seleccion' | 'numero';
    nombre: string;

    opciones?: string[];

    aplicarATodos: boolean;
}

export const VENDEDOR_PV: VendedorData = {
    documento: '76975258',
    nombre: 'Vendedor auto',
    metaMonto: '2500',
    metaCantidad: '3500',
    zona: 'Arequipa Sur',
    direccion: 'Arequipa-Paucarpata',
    telefono: '99999999',
    email: 'automatizacionerp2@gmail.com',
};

export const CLIENTE_DNI_PV: ClienteSetupData = {
    tipoDocumento: 'DNI',
    documento: '76958585',
    direccion: 'Arequipa-auto',
    telefono: '99999999',
    email: 'automatizacionerp2@gmail.com',
    textoExistencia: '76958585',
};

export const CLIENTE_RUC_PV: ClienteSetupData = {
    tipoDocumento: 'RUC',
    documento: '20759685854',
    razonSocial: 'automatizacionerp2 cliente RUC',
    direccion: 'arequipa auto',
    telefono: '99999999',
    email: 'automatizacionerp2@gmail.com',
    textoExistencia: '20759685854',
};

export const CONDUCTOR_PV = {
    tipoDocumento: 'DNI',
    documento: '75652545',
    nombre: 'Conductor automatizado qa',
    codigo: '123456789',
    categoria: 'A-I',
    placa: 'ABC123ASCa',
    zona: 'Arequipa-Sur',
    direccion: 'Arequipa',
    telefono: '999999999',
    email: 'srqapruebaserp2@gmail.com',
} as const;

export const CAMPOS_PV: CampoAdicionalPVConfig[] = [
    {
        tipo: 'texto',
        nombre: 'tipo de comprobante',
        aplicarATodos: true,
    },
    {
        tipo: 'fecha',
        nombre: 'fecha-comprobante',
        aplicarATodos: true,
    },
    {
        tipo: 'seleccion',
        nombre: 'entorno',
        opciones: ['certificación', 'producción'],
        aplicarATodos: true,
    },
    {
        tipo: 'numero',
        nombre: 'numero-comprobante',
        aplicarATodos: true,
    },
];
