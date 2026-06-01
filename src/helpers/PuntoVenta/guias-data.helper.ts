export const GUIAS_DATA = {
    REMITENTE: {
        DNI: '75652545',
        NOMBRE: 'Conductor automatizado qa',
        UBIGEO: 'Arequipa - Arequipa - Arequipa',
        DIRECCION: 'Avenida automatizacion qa',
    },
    DESTINATARIO: {
        DNI: '76975258',
        RUC: '20759685854',
        UBIGEO: 'Juliaca - San Roman - Puno',
        DIRECCION: 'juliaca-city',
        NOMBRE_RUC: 'automatizacionerp2 cliente',
        NOMBRE_DNI: 'JHUNIOR BRAYAN GUTIERREZ',
    },
    TRANSPORTISTA: {
        RUC: '20759685854',
        MTC: '123',
        NOMBRE: 'automatizacionerp2 cliente',
        PLACA: 'ABC-123',
        LICENCIA: 'A1231ADw',
    },
    ITEMS: {
        PRODUCTO_GRAVADO_FLEXIBLE: {
            codigo: '121212',
            nombre: 'item para combos gravado flexible',
        },
        PRODUCTO_GRAVADO_SIN_CONTROL: {
            codigo: '151515',
            nombre: 'item gravado sin control',
        }
    },
    MOTIVOS_TRASLADO: {
        VENTA: 'VENTA',
        COMPRA: 'COMPRA',
        EXPORTACION: 'EXPORTACIÓN',
        VENTA_TERCEROS: 'VENTA CON ENTREGA A TERCEROS',
        TRASLADO_BIENES_TRANSFORMACION: 'TRASLADO DE BIENES PARA TRANSFORMACIÓN',
        TRASLADO_ZONA_PRIMARIA: 'TRASLADO ZONA PRIMARIA',
        IMPORTACION: 'IMPORTACION',
        TRASLADO_MERCANCIA_EXTRANJERA: 'TRASLADO DE MERCANCÍA EXTRANJERA',
    },
    MODALIDADES: {
        PUBLICA: 'PUBLICA',
        PRIVADA: 'PRIVADA',
    }
} as const;
