import {test} from '@fixtures/Logistica/movimientos-fixture';
import {DatosOpcionalesPage} from '@pages/Logistica/DatosOpcionalesPage';

export const configurarDatosOpcionalesEstandar = async (
    datosOpcionales: DatosOpcionalesPage,
    numDocumentoProveedor: string,
    nombreProveedor: string
) => {
    await test.step('Configurar datos opcionales con proveedor y campos adicionales', async () => {
        await datosOpcionales.abrirDatosOpcionales();
        await datosOpcionales.buscarProveedor(numDocumentoProveedor);
        await datosOpcionales.seleccionarProveedor(nombreProveedor);
        await datosOpcionales.llenarCampoTexto(0, 'auto');
        await datosOpcionales.clickCampoFecha(0);
        await datosOpcionales.seleccionarDiaEnDatepickerVisible('15');
        await datosOpcionales.llenarCampoNumero(0, '98989898989898989');
        await datosOpcionales.guardarDatos();
    });
};
