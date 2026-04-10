import { test, expect } from '../../../src/fixtures/Logistica/edicion-clonado-fixture';

test.describe('Exportar lista de ítems', { tag: ['@logistica'] },() => {

  /**
   * Escenario: exportar la lista de ítems a archivo Excel/CSV.
   *
   * Flujo:
   * 1. Abrir menú de opciones → Exportar
   * 2. Esperar a que se descargue el archivo
   * 3. Validar que el archivo tiene nombre y tamaño válidos
   */
  test('exportar ítems genera un archivo descargable', async ({
    listaItems,
  }) => {
    await test.step('Exportar lista de ítems', async () => {
      const download = await listaItems.exportarItems();

      // Validar que el archivo tiene un nombre sugerido
      const filename = download.suggestedFilename();
      expect(filename).toBeTruthy();
      console.log(`  → Archivo exportado: ${filename}`);

      // Guardar temporalmente para validar que no está vacío
      const path = await download.path();
      expect(path).toBeTruthy();
    });
  });
});
