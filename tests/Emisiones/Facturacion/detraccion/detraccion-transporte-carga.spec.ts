import { test, expect } from '@fixtures/PuntoVenta/facturacion.fixture';
import { EmitirFacturaConDetraccionTransporte } from '@screenplay/tasks/facturacion/EmitirFacturaConDetraccion';
import { CLIENTES, ITEMS_PV } from '@helpers/PuntoVenta/emision-data.helper';

test.describe('Facturación — Detracción transporte de carga', () => {

    test('Emite factura con detracción de transporte de carga exitosamente', async ({ cajero }) => {
        const resultado = await cajero.realizaYObtiene(
            EmitirFacturaConDetraccionTransporte({
                cliente: CLIENTES.EMPRESA_RUC_AUTO,
                productos: [ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL],
                transporte: {
                    tipoOperacion: 'Transporte de Carga',
                    metodoPago: 'Depósito en cuenta',
                    porcentaje: '4',
                    numeroCuenta: '45-241-45457',
                    origen: {
                        ubigeo: 'arequip',
                        texto: '- Arequipa - Arequipa - Arequipa',
                        direccion: 'Av. Arequipa 123',
                    },
                    destino: {
                        ubigeo: 'juliaca',
                        texto: '- Juliaca - San Roman - Puno',
                        direccion: 'Av. Juliaca 456',
                    },
                    valorTransporte: '500',
                    cargaEfectiva: '3',
                    cargaUtil: '20',
                    detalleViaje: 'Carga de prueba automatizada',
                    tramo: {
                        origen: {
                            ubigeo: 'ica',
                            texto: '- Ica - Ica - Ica',
                            direccion: 'Av. Ica 789',
                        },
                        destino: {
                            ubigeo: 'lima',
                            texto: '- Lima - Lima - Lima',
                            direccion: 'Av. Lima 012',
                        },
                        configuracionVehicular: 'estándar',
                        cargaUtilMetricasVehiculo: '23',
                        descripcionTramo: 'Tramo automatizado',
                        cargaEfectivaToneladas: '2.6',
                        valorTransporte: '1000',
                        valorReferencialTonelada: '2.5',
                        valorPreliminarCargaUtilNominal: '5.3',
                    },
                },
            })
        );

        expect(resultado.serie).toBe('F001');
        expect(resultado.numero).toMatch(/^F001-\d{8}$/);
    });
});
