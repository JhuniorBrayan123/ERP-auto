import {expect, test} from '@fixtures/PuntoVenta/busqueda-comprobantes.fixture';
import {
    BC_ACCIONES,
    BC_CATEGORIAS,
    BC_MOTIVOS_ELIMINACION,
    BC_TIPOS_COMPROBANTE
} from '@helpers/PuntoVenta/busqueda-comprobantes.data';
import {CAJAS, ITEMS_PV} from '@helpers/PuntoVenta/emision-data.helper';
import {ClonarComprobante} from '@task/PuntoVenta/busqueda-comprobantes/ClonarComprobante';
import {BuscarComprobante} from '@task/PuntoVenta/busqueda-comprobantes/BuscarComprobante';
import {AbrirAccionesDelComprobante} from '@task/PuntoVenta/busqueda-comprobantes/AbrirAccionesDelComprobante';
import {EliminarComprobante} from '@task/PuntoVenta/busqueda-comprobantes/EliminarComprobante';
import {EmitirGuiaGuardada} from '@task/PuntoVenta/busqueda-comprobantes/EmitirGuiaGuardada';
import {CrearComprobanteSemilla} from '@screenplay/questions/PuntoVenta/emision/CrearComprobanteSemilla';
import {EstadoDelComprobante} from '@screenplay/questions/PuntoVenta/busqueda-comprobantes/EstadoDelComprobante';
import {MensajeDelSistema} from '@screenplay/questions/PuntoVenta/busqueda-comprobantes/MensajeDelSistema';
import {BitacoraDelComprobante} from '@screenplay/questions/PuntoVenta/busqueda-comprobantes/BitacoraDelComprobante';
import {asegurarConfiguracionEuro,} from '@helpers/PuntoVenta/semillas-emision.helper';
import {AccionDelComprobante} from '@screenplay/questions/PuntoVenta/busqueda-comprobantes/AccionDelComprobante';
import {FiltrarComprobantes} from "@task/PuntoVenta/busqueda-comprobantes/FiltrarComprobantes";


test('BC-22 | Clonar comprobante EUR a caja sin EUR muestra error de moneda', async ({actor, page}) => {
    await test.step('Setup: asegurar configuración EURO', async () => {
        await asegurarConfiguracionEuro(page, ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.codigo);
    });

    const boletaEuro = await actor.pregunta(CrearComprobanteSemilla.boletaEnEuro());

    await actor.intentaRealizar(
        BuscarComprobante.porSerieCorrelativo(boletaEuro),
        AbrirAccionesDelComprobante.de(boletaEuro),
        ClonarComprobante.haciaCaja(CAJAS.AUTO.nombre)
    );

    expect(await actor.pregunta(MensajeDelSistema.texto())).toContain('No puedes usar esta caja');
    expect(await actor.pregunta(MensajeDelSistema.texto())).toContain('Las monedas de esta caja no coinciden con la del comprobante.');
});

test('BC-23 | Eliminar cotización y verificar estado ELIMINADO en la grilla', async ({actor}) => {
    const cotizacion = await actor.pregunta(CrearComprobanteSemilla.cotizacion());

    await actor.intentaRealizar(
        BuscarComprobante.porSerieCorrelativo(cotizacion),
        AbrirAccionesDelComprobante.de(cotizacion),
        EliminarComprobante.conMotivo(BC_MOTIVOS_ELIMINACION.ERROR_DATOS)
    );

    expect(await actor.pregunta(MensajeDelSistema.texto())).toContain('El comprobante fue anulado exitosamente');
    expect(await actor.pregunta(EstadoDelComprobante.enGrilla(cotizacion))).toEqual('ELIMINADO');
});

test('BC-24 | Emitir guía de remisión en estado Guardado y validar bitácora', async ({actor}) => {
    const guia = await actor.pregunta(CrearComprobanteSemilla.guiaRemisionGuardada());

    await actor.intentaRealizar(
        BuscarComprobante.porSerieCorrelativo(guia),
        AbrirAccionesDelComprobante.de(guia),
        EmitirGuiaGuardada.delComprobante()
    );

    expect(await actor.pregunta(MensajeDelSistema.texto())).toContain('emitido a SUNAT con éxito');
    expect(await actor.pregunta(BitacoraDelComprobante.contieneEventos(guia, [
        'Comprobante Registrado',
        'CDR Generado',
        'PDF Generado',
        'Ticket Generado',
    ]))).toBeTruthy();
});

const casosEmitir = [
    {
        id: 'BC-25a',
        descripcion: 'Boleta emitida → "Emitir" NO es visible',
        factory: CrearComprobanteSemilla.boletaEmitida(),
        categoria: BC_CATEGORIAS.VENTAS,
        tipo: BC_TIPOS_COMPROBANTE.BOLETA,
        emitirVisible: false,
    },
    {
        id: 'BC-25b',
        descripcion: 'Guía de remisión guardada → "Emitir" SÍ es visible',
        factory: CrearComprobanteSemilla.guiaRemisionGuardada(),
        categoria: BC_CATEGORIAS.GUIAS,
        tipo: BC_TIPOS_COMPROBANTE.GUIA_REMISION,
        emitirVisible: true,
    },
];

for (const caso of casosEmitir) {
    test(`${caso.id} | ${caso.descripcion}`, async ({actor}) => {
        const semilla = await actor.pregunta(caso.factory);

        await actor.intentaRealizar(
            FiltrarComprobantes.conFiltrosAvanzados(caso.categoria, caso.tipo, semilla.correlativo),
            AbrirAccionesDelComprobante.de(semilla)
        );

        if (caso.emitirVisible) {
            expect(await actor.pregunta(AccionDelComprobante.esVisible(BC_ACCIONES.EMITIR))).toBeTruthy();
        } else {
            expect(await actor.pregunta(AccionDelComprobante.esOculta(BC_ACCIONES.EMITIR))).toBeTruthy();
        }
        expect(await actor.pregunta(AccionDelComprobante.esVisible(BC_ACCIONES.BITACORA))).toBeTruthy();
        expect(await actor.pregunta(AccionDelComprobante.esVisible(BC_ACCIONES.VER_COMPROBANTE))).toBeTruthy();
    });
}
