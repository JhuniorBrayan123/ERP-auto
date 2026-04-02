import { test } from '@playwright/test';
import { InventarioPage } from '../pages/InventarioPage';
import { ServicioPage } from '../pages/ServicioPage';

/**
 * Tests de creación de servicios.
 * Origen: test-1.spec.ts líneas 3-80 (codegen).
 */
test.describe('Creación de Servicios', () => {
  test.describe.configure({ mode: 'parallel' });
  test.setTimeout(120_000);

  let inventario: InventarioPage;
  let servicio: ServicioPage;

  test.beforeEach(async ({ page }) => {
    inventario = new InventarioPage(page);
    servicio = new ServicioPage(page, inventario);
    await inventario.navegarAProductos();
  });

  /**
   * Flujo: Crear servicio gravado con opciones avanzadas completas.
   * Incluye: categorización, descripción y campos adicionales.
   * Codegen origen: líneas 6-44
   */
  test('Crear servicio gravado con campos adicionales', async () => {
    // Arrange
    const fechaHora = new Date().toLocaleString('es-PE').replace(/[\/:]/g, '-').replace(', ', '_');
    const nombre = `Item servicio gravado ${fechaHora}`;

    // Act - Crear servicio
    await inventario.iniciarCreacionItem('servicio');
    await inventario.abrirOpcionesAvanzadas();
    await servicio.llenarNombreYPrecios(nombre, '10', '10');

    // Act - Información adicional (categorización)
    await servicio.irATabInformacionAdicional();
    await servicio.configurarCategorizacion();
    await servicio.llenarDescripcion('nuevo item desdes auto');

    // Act - Campos adicionales
    await servicio.irATabCamposAdicionales();
    await servicio.llenarCamposAdicionales('nuevo servicio', '122222');

    // Act - Guardar
    await servicio.crearServicio();

    // Assert - Verificar creación y bitácora
    await inventario.irAListaDeItems();
    await inventario.verificarBitacoraDesdeGrid();
  });

  /**
   * Flujo: Crear servicio inafecto (sin IGV).
   * Cambia la afectación tributaria de Gravado a Inafecto.
   * Codegen origen: líneas 50-80
   */
  test('Crear servicio inafecto', async () => {
    // Arrange
    const fechaHora = new Date().toLocaleString('es-PE').replace(/[\/:]/g, '-').replace(', ', '_');
    const nombre = `Servicio inafecto ${fechaHora}`;

    // Act - Crear servicio con afectación inafecto
    await inventario.iniciarCreacionItem('servicio');
    await servicio.inputNombre.fill(nombre);
    await servicio.seleccionarAfectacionInafecto();
    await servicio.inputMontoSoles.fill('10');
    await servicio.inputMontoDolares.fill('10');

    // Act - Opciones avanzadas y categorización
    await inventario.abrirOpcionesAvanzadas();
    await servicio.page.getByText('Información adicional(').click();
    await servicio.configurarCategorizacionInafecto();
    await servicio.llenarDescripcion('nuevo item desde auto');

    // Act - Guardar (sin campos adicionales en este flujo)
    await servicio.irATabCamposAdicionales();
    await servicio.crearServicio();

    // Assert - Verificar creación y bitácora
    await inventario.irAListaDeItems();
    await inventario.verificarBitacoraDesdeGrid();
  });
});
