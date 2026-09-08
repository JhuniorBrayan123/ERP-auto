import {expect} from '@playwright/test';
import {test} from '@fixtures/PuntoVenta/caja.fixture';
import {RegistrarIngresoCaja} from '@screenplay/tasks/caja/RegistrarIngresoCaja';
import {RegistrarEgresoCaja} from '@screenplay/tasks/caja/RegistrarEgresoCaja';
import {IrACierreDeCaja} from '@screenplay/tasks/caja/IrACierreDeCaja';
import {RegresarANuevaVenta} from '@screenplay/tasks/caja/AbrirMenuCaja';
import {
    BuscarEnIngresosEgresos,
    BuscarMovimientoEnCierrePorConcepto,
    ConsultarIngresosYEgresos,
    ExpandirTarjetaResultado,
    ValidarDatosTarjetaResultado,
} from '@screenplay/tasks/cierre-caja/ConsultarIngresosYEgresos';
import {MovimientoVisibleEnCierre} from '@screenplay/questions/cierre-caja/MovimientoVisibleEnCierre';
import {CLIENTES} from '@helpers/PuntoVenta/emision-data.helper';
import {UsarNavegador} from '@abilities/usarnavegador';


const INGRESO_DATOS = {
    categoria: 'INGRESO DE CAPITAL',
    monto: '100',
    metodoPago: 'EFECTIVO',
    motivo: `ingreso-auto-${Date.now()}`,
    documentoPersona: CLIENTES.PERSONA_DNI.documento,
    textoSelectorPersona: 'JHUNIOR BRAYAN GUTIERREZ',
};

const EGRESO_DATOS = {
    categoria: 'COMPRAS',
    monto: '10',
    metodoPago: 'YAPE',
    motivo: `egreso-auto-${Date.now()}`,
    documentoPersona: CLIENTES.PERSONA_DNI_2.documento,
    textoSelectorPersona: 'MARCELO EDWIN SOLANO GARAY',
};


test.describe('CC-05 | Ingresos y Egresos', {tag: ['@cierre-caja']}, () => {
    test.describe.configure({mode: 'serial'});

    test('SC-01: Registrar ingreso de dinero y verificar reflejo en cierre de caja @CC-05.1', async ({cajero}) => {


        const {concepto} = await cajero.realizaYObtiene(
            RegistrarIngresoCaja(INGRESO_DATOS),
        );


        await cajero.realiza(
            IrACierreDeCaja(),
            ConsultarIngresosYEgresos(),
        );

        const movimiento = await cajero.realizaYObtiene(
            BuscarMovimientoEnCierrePorConcepto(concepto),
        );


        await cajero.realiza(
            BuscarEnIngresosEgresos(movimiento.CorrelativoDocFinanciero.toString())
        );


        expect(movimiento.CorrelativoDocFinanciero).toBeGreaterThan(0);
        expect(movimiento.SerieFinal).toMatch(/RC01/i);

        const visibleEnCierre = await cajero.pregunta(
            MovimientoVisibleEnCierre(movimiento),
        );
        expect(visibleEnCierre).toBe(true);


        await cajero.realiza(ExpandirTarjetaResultado());
        await cajero.realiza(ValidarDatosTarjetaResultado(INGRESO_DATOS));


        await cajero.realiza(RegresarANuevaVenta());
    });

    test('SC-02: Registrar egreso de dinero y verificar reflejo en cierre de caja @CC-05.2', async ({cajero}) => {


        const {concepto} = await cajero.realizaYObtiene(
            RegistrarEgresoCaja(EGRESO_DATOS),
        );

        await cajero.realiza(
            IrACierreDeCaja(),
            ConsultarIngresosYEgresos(),
        );

        const movimiento = await cajero.realizaYObtiene(
            BuscarMovimientoEnCierrePorConcepto(concepto),
        );


        await cajero.realiza(
            BuscarEnIngresosEgresos(movimiento.CorrelativoDocFinanciero.toString())
        );


        expect(movimiento.CorrelativoDocFinanciero).toBeGreaterThan(0);
        expect(movimiento.SerieFinal).toMatch(/RP01/i);


        await cajero.realiza(ExpandirTarjetaResultado());
        await cajero.realiza(ValidarDatosTarjetaResultado(EGRESO_DATOS));

        await cajero.realiza(RegresarANuevaVenta());
    });

    test('SC-03: Buscar ingreso por correlativo y validar separación de ingresos y egresos @CC-05.3', async ({
                                                                                                                 cajero,
                                                                                                             }) => {

        const datosSc03 = {
            ...INGRESO_DATOS,
            categoria: 'DEVOLUCIONES',
            metodoPago: 'CHEQUE',
            motivo: `busqueda-correlativo-${Date.now()}`,
        };

        const ingreso = await cajero.realizaYObtiene(
            RegistrarIngresoCaja(datosSc03),
        );


        await cajero.realiza(
            IrACierreDeCaja(),
            ConsultarIngresosYEgresos(),
        );


        const movimiento = await cajero.realizaYObtiene(
            BuscarMovimientoEnCierrePorConcepto(ingreso.concepto),
        );


        await cajero.realiza(
            BuscarEnIngresosEgresos(movimiento.CorrelativoDocFinanciero.toString())
        );


        const page = cajero.habilidad(UsarNavegador).page;


        await expect(page.getByText(/Total Ingresos/i)).toBeVisible();


        await cajero.realiza(ExpandirTarjetaResultado());
        await cajero.realiza(ValidarDatosTarjetaResultado(datosSc03));

        expect(movimiento.SerieFinal).toMatch(/RC01/i);

        await cajero.realiza(RegresarANuevaVenta());
    });
});
