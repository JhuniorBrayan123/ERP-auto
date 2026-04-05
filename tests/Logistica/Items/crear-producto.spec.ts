import { test, expect } from '../fixtures/items-fixture';
import { buildUniqueItemName } from '../helpers/unique-name.helper';

test.describe('Creación de Productos', () => {

  test('crear producto gravado con control estricto', async ({
    productoForm,
    itemDetail,
  }) => {
    const nombre = buildUniqueItemName('producto', 'gravado estricto');

    await test.step('Iniciar creación de producto', async () => {
      await productoForm.iniciarCreacionProducto();
    });

    await test.step('Llenar datos básicos', async () => {
      await productoForm.llenarNombre(nombre);
      await productoForm.llenarPrecios('10', '10');
    });

    await test.step('Configurar stock estricto', async () => {
      await productoForm.expandirOpcionesAvanzadas();
      await productoForm.configurarStock({
        tipo: 'estricto',
        cantidadMaxima: '1001',
        cantidadMinima: '100',
      });
    });

    await test.step('Llenar información adicional', async () => {
      await productoForm.llenarInfoAdicional('REGRESION', 'AUTO-TEST', 'AUTOMATIZADO');
    });

    await test.step('Llenar campos adicionales', async () => {
      await productoForm.irATabCamposAdicionales();
      await productoForm.llenarCampoAdicionalTexto('item Automatizado');
      // Fecha: se selecciona del calendario
      await productoForm.llenarCampoAdicionalNumerico('1');
    });

    await test.step('Crear producto y confirmar', async () => {
      await productoForm.crearProducto();
      await expect(productoForm['page'].getByRole('button', { name: 'Ir a lista de ítems' }))
        .toBeVisible();
      await productoForm.clickIrAListaItems();
    });

    await test.step('Verificar item creado en detalle', async () => {
      await itemDetail.verificarItemCompleto({
        verificarVentas: true,
        verificarCompras: true,
        verificarBitacora: true,
      });
    });
  });


  test('crear producto gravado sin control de stock', async ({
    productoForm,
    itemDetail,
  }) => {
    const nombre = buildUniqueItemName('producto', 'gravado sin control');

    await test.step('Iniciar creación de producto', async () => {
      await productoForm.iniciarCreacionProducto();
    });

    await test.step('Llenar datos básicos', async () => {
      await productoForm.llenarNombre(nombre);
      await productoForm.llenarPrecios('10', '10');
    });

    await test.step('Configurar sin stock + info adicional', async () => {
      await productoForm.expandirOpcionesAvanzadas();
      await productoForm.irATabStock();
      // No seleccionar control de stock (por defecto: sin control)
      await productoForm.llenarInfoAdicional('REGRESION', 'AUTO-TEST', 'AUTOMATIZADO');
    });

    await test.step('Crear producto y confirmar', async () => {
      await productoForm.crearProducto();
      await expect(productoForm['page'].getByRole('button', { name: 'Ir a lista de ítems' }))
        .toBeVisible();
      await productoForm.clickIrAListaItems();
    });

    await test.step('Verificar bitácora', async () => {
      await itemDetail.verificarItemDesdeMenu({ verificarBitacora: true });
    });
  });


  test('crear producto gravado con control flexible', async ({
    productoForm,
    itemDetail,
  }) => {
    const nombre = buildUniqueItemName('producto', 'gravado flexible');

    await test.step('Iniciar creación de producto', async () => {
      await productoForm.iniciarCreacionProducto();
    });

    await test.step('Llenar datos básicos', async () => {
      await productoForm.llenarNombre(nombre);
      await productoForm.llenarPrecios('11.25', '11.25');
    });

    await test.step('Configurar stock flexible', async () => {
      await productoForm.expandirOpcionesAvanzadas();
      await productoForm.configurarStock({
        tipo: 'flexible',
        cantidadMaxima: '101',
        cantidadMinima: '10',
      });
    });

    await test.step('Llenar información adicional', async () => {
      await productoForm.llenarInfoAdicional('REGRESION', 'AUTO-TEST', 'AUTOMATIZADO');
    });

    await test.step('Crear producto y confirmar', async () => {
      await productoForm.crearProducto();
      await expect(productoForm['page'].getByRole('button', { name: 'Ir a lista de ítems' }))
        .toBeVisible();
      await productoForm.clickIrAListaItems();
    });

    await test.step('Verificar item completo', async () => {
      await itemDetail.verificarItemCompleto({
        verificarVentas: true,
        verificarCompras: true,
        verificarBitacora: true,
      });
    });
  });


  test('crear producto exonerado con control estricto', async ({
    productoForm,
    itemDetail,
  }) => {
    const nombre = buildUniqueItemName('producto', 'exonerado estricto');

    await test.step('Iniciar creación de producto', async () => {
      await productoForm.iniciarCreacionProducto();
    });

    await test.step('Llenar datos básicos con tipo exonerado', async () => {
      await productoForm.llenarNombre(nombre);
      await productoForm.llenarPrecios('12.22', '15.25');
    });

    await test.step('Configurar stock estricto', async () => {
      await productoForm.expandirOpcionesAvanzadas();
      await productoForm.configurarStock({
        tipo: 'estricto',
        cantidadMaxima: '11',
        cantidadMinima: '11',
      });
    });

    await test.step('Llenar información adicional', async () => {
      await productoForm.llenarInfoAdicional('REGRESION', 'AUTO-TEST', 'AUTOMATIZADO');
    });

    await test.step('Crear producto y confirmar', async () => {
      await productoForm.crearProducto();
      await expect(productoForm['page'].getByRole('button', { name: 'Ir a lista de ítems' }))
        .toBeVisible();
      await productoForm.clickIrAListaItems();
    });

    await test.step('Verificar item completo', async () => {
      await itemDetail.verificarItemCompleto({
        verificarVentas: true,
        verificarCompras: true,
        verificarBitacora: true,
      });
    });
  });


  test('crear producto con ICBPER', async ({ productoForm, itemDetail }) => {
    const nombre = buildUniqueItemName('producto', 'con ICBPER');

    await test.step('Iniciar creación de producto', async () => {
      await productoForm.iniciarCreacionProducto();
    });

    await test.step('Llenar datos básicos', async () => {
      await productoForm.llenarNombre(nombre);
      await productoForm.llenarPrecios('10', '10');
    });

    await test.step('Configurar stock flexible + info adicional', async () => {
      await productoForm.expandirOpcionesAvanzadas();
      await productoForm.irATabStock();
      await productoForm.seleccionarControlStock('flexible');
      await productoForm.llenarInfoAdicional('REGRESION', 'AUTO-TEST', 'AUTOMATIZADO');
    });

    await test.step('Activar ICBPER', async () => {
      await productoForm.activarICBPER();
    });

    await test.step('Crear producto y confirmar', async () => {
      await productoForm.crearProducto();
      await expect(productoForm['page'].getByRole('button', { name: 'Ir a lista de ítems' }))
        .toBeVisible();
      await productoForm.clickIrAListaItems();
    });

    await test.step('Verificar item', async () => {
      await itemDetail.verificarItemCompleto({ verificarBitacora: true });
    });
  });


  test('crear producto con ISC sistema al valor', async ({
    productoForm,
    itemDetail,
  }) => {
    const nombre = buildUniqueItemName('producto', 'con ISC valor');

    await test.step('Iniciar creación de producto', async () => {
      await productoForm.iniciarCreacionProducto();
    });

    await test.step('Llenar datos básicos', async () => {
      await productoForm.llenarNombre(nombre);
      await productoForm.llenarPrecios('15', '15.25');
    });

    await test.step('Configurar stock flexible + info adicional', async () => {
      await productoForm.expandirOpcionesAvanzadas();
      await productoForm.irATabStock();
      await productoForm.seleccionarControlStock('flexible');
      await productoForm.llenarInfoAdicional('REGRESION', 'AUTO-TEST', 'AUTOMATIZADO');
    });

    await test.step('Configurar ISC sistema al valor', async () => {
      await productoForm.configurarISC({
        tipoSistema: 'Sistema al valor',
        monto: '2.5',
      });
    });

    await test.step('Crear producto y confirmar', async () => {
      await productoForm.crearProducto();
      await expect(productoForm['page'].getByRole('button', { name: 'Ir a lista de ítems' }))
        .toBeVisible();
      await productoForm.clickIrAListaItems();
    });

    await test.step('Verificar item en detalle', async () => {
      await itemDetail.verificarItemDesdeMenu({
        verificarVentas: true,
        verificarCompras: true,
        verificarBitacora: true,
      });
    });
  });


  test('crear producto con ISC monto fijo', async ({
    productoForm,
    itemDetail,
  }) => {
    const nombre = buildUniqueItemName('producto', 'con ISC fijo');

    await test.step('Iniciar creación de producto', async () => {
      await productoForm.iniciarCreacionProducto();
    });

    await test.step('Llenar datos básicos', async () => {
      await productoForm.llenarNombre(nombre);
      await productoForm.llenarPrecios('11.52', '3.5');
    });

    await test.step('Configurar stock flexible + info adicional', async () => {
      await productoForm.expandirOpcionesAvanzadas();
      await productoForm.irATabStock();
      await productoForm.seleccionarControlStock('flexible');
      await productoForm.llenarInfoAdicional('REGRESION', 'AUTO-TEST', 'AUTOMATIZADO');
    });

    await test.step('Configurar ISC monto fijo', async () => {
      await productoForm.configurarISC({
        tipoSistema: 'Aplicación al monto fijo',
        monto: '1.5',
      });
    });

    await test.step('Crear producto y confirmar', async () => {
      await productoForm.crearProducto();
      await expect(productoForm['page'].getByRole('button', { name: 'Ir a lista de ítems' }))
        .toBeVisible();
      await productoForm.clickIrAListaItems();
    });

    await test.step('Verificar item completo', async () => {
      await itemDetail.verificarItemCompleto({
        verificarVentas: true,
        verificarCompras: true,
        verificarBitacora: true,
      });
    });
  });
});
