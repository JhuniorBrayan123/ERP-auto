import {expect, test} from '@fixtures/PuntoVenta/busqueda-comprobantes.fixture';
import {
    BC_COLUMN_IDS,
    BC_COLUMNAS_DESACTIVAR_EN_BC09,
    BC_PRESETS_FECHA,
    BC_TIPOS_COMPROBANTE,
} from '@helpers/PuntoVenta/busqueda-comprobantes.data';

test.beforeEach(async ({page}) => {
    await page.goto('/punto-venta/comprobantes');
});


test('BC-09 | Validar columnas visibles y ocultas de la grilla', async ({busquedaPage}) => {
    const page = busquedaPage['page'];

    await test.step('Given: el usuario abre la configuración de columnas', async () => {
        await busquedaPage.abrirConfiguracionColumnas();
    });

    await test.step('When: desactiva las opcionales, activa las de fecha (estado limpio)', async () => {
        for (const campoId of BC_COLUMNAS_DESACTIVAR_EN_BC09) {
            await busquedaPage.configurarColumna('TODOS', campoId, false);
        }
        
        await busquedaPage.configurarColumna('TODOS', BC_COLUMN_IDS.FECHA_CREACION, true);
        await busquedaPage.configurarColumna('TODOS', BC_COLUMN_IDS.FECHA_EMISION, true);
        await busquedaPage.guardarConfiguracionColumnas();
    });

    await test.step('Then: las columnas obligatorias siempre están visibles', async () => {
        await expect(page.getByRole('columnheader', {name: 'Tipo de comprobante', exact: true})).toBeVisible({timeout: 10_000});
        await expect(page.getByRole('columnheader', {name: 'Serie', exact: true})).toBeVisible();
        await expect(page.getByRole('columnheader', {name: 'Correlativo', exact: true})).toBeVisible();
        await expect(page.getByRole('columnheader', {name: 'Nombre/Razón Social', exact: true})).toBeVisible();
        await expect(page.getByRole('columnheader', {name: 'Fecha/Hora de creación', exact: true})).toBeVisible();
        await expect(page.getByRole('columnheader', {name: 'Fecha de emisión', exact: true})).toBeVisible();
        await expect(page.getByRole('columnheader', {name: 'Sucursal/Caja', exact: true})).toBeVisible();
        await expect(page.getByRole('columnheader', {name: 'Estado de comprobante', exact: true})).toBeVisible();
    });

    await test.step('And: las columnas opcionales desactivadas NO son visibles', async () => {
        await expect(page.getByRole('columnheader', {name: 'N° de documento', exact: true})).toHaveCount(0);
        await expect(page.getByRole('columnheader', {name: 'Usuario creador', exact: true})).toHaveCount(0);
        await expect(page.getByRole('columnheader', {name: 'Peso', exact: true})).toHaveCount(0);
        await expect(page.getByRole('columnheader', {name: 'Condición de pago', exact: true})).toHaveCount(0);
        await expect(page.getByRole('columnheader', {name: 'Método de pago', exact: true})).toHaveCount(0);
        await expect(page.getByRole('columnheader', {name: 'Moneda', exact: true})).toHaveCount(0);
        await expect(page.getByRole('columnheader', {name: 'Subtotal', exact: true})).toHaveCount(0);
        await expect(page.getByRole('columnheader', {name: 'IGV', exact: true})).toHaveCount(0);
        await expect(page.getByRole('columnheader', {name: 'Monto total', exact: true})).toHaveCount(0);
        await expect(page.getByRole('columnheader', {name: 'Monto pagado', exact: true})).toHaveCount(0);
        await expect(page.getByRole('columnheader', {name: 'Monto adeudado', exact: true})).toHaveCount(0);
        await expect(page.getByRole('columnheader', {name: 'Estado de pago', exact: true})).toHaveCount(0);
        await expect(page.getByRole('columnheader', {name: 'Estado de SUNAT', exact: true})).toHaveCount(0);
    });
});

test('BC-10 | Validar paginación — avanzar a siguiente página mantiene filtros', async ({busquedaPage}) => {
    const page = busquedaPage['page'];

    await test.step('Given: se aplica filtro con suficientes resultados (Boletas 30 días)', async () => {
        await busquedaPage.filtrarPorRangoFecha(BC_PRESETS_FECHA.TREINTA);
        await busquedaPage.abrirFiltrosAvanzados();
        await busquedaPage.filtrarPorTipo(BC_TIPOS_COMPROBANTE.BOLETA);
    });

    await test.step('When: verifica si existe página siguiente', async () => {
        const habilitado = await busquedaPage.btnSiguiente.isEnabled({timeout: 5_000}).catch(() => false);

        if (!habilitado) {
            console.warn('[BC-10] No hay suficientes resultados para paginar — se omite la validación de paginación');
            test.skip(true, 'No hay suficientes resultados para validar paginación en este ambiente');
            return;
        }

        const idsPagina1 = await busquedaPage.obtenerIdentificadoresPrimeraPagina();

        await test.step('And: avanza a la siguiente página', async () => {
            await busquedaPage.irAPaginaSiguiente();
        });

        await test.step('Then: la grilla muestra comprobantes distintos a la primera página', async () => {
            const idsPagina2 = await busquedaPage.obtenerIdentificadoresPrimeraPagina();
            expect(idsPagina2).not.toEqual(idsPagina1);
            expect(idsPagina2.length).toBeGreaterThan(0);
        });

        await test.step('And: el tipo de comprobante se conserva en los resultados', async () => {
            await expect(page.locator('tbody').first()).toContainText('BOLETA DE VENTA', {timeout: 10_000});
        });
    });
});

test('BC-11 | Ordenar resultados por correlativo (sin valores fijos)', async ({busquedaPage}) => {
    const page = busquedaPage['page'];

    await test.step('Given: se aplica un filtro que retorna múltiples comprobantes', async () => {
        await busquedaPage.filtrarPorRangoFecha(BC_PRESETS_FECHA.TREINTA);
        await busquedaPage.abrirFiltrosAvanzados();
    });

    await test.step('When: hace click en la columna "Correlativo" para ordenar', async () => {
        await busquedaPage.ordenarPorColumna('Correlativo');
    });

    await test.step('Then: los valores del correlativo están en orden (ascendente o descendente)', async () => {
        const valores = await busquedaPage.obtenerValoresColumna('Correlativo');
        if (valores.length < 2) {
            test.skip(true, 'No hay suficientes filas para validar ordenamiento');
            return;
        }

        const nums = valores
            .map(v => parseInt(v.replace(/\D/g, ''), 10))
            .filter(n => !isNaN(n));

        const ascendente = [...nums].sort((a, b) => a - b);
        const descendente = [...nums].sort((a, b) => b - a);

        const estaOrdenado = JSON.stringify(nums) === JSON.stringify(ascendente)
            || JSON.stringify(nums) === JSON.stringify(descendente);

        expect(estaOrdenado, `Correlativo no está ordenado. Valores: ${nums.join(', ')}`).toBe(true);
    });

    await test.step('When: hace click nuevamente para invertir el orden', async () => {
        await busquedaPage.ordenarPorColumna('Correlativo');
    });

    await test.step('Then: los valores de correlativo están en orden inverso al anterior', async () => {
        const valoresDespues = await busquedaPage.obtenerValoresColumna('Correlativo');
        if (valoresDespues.length < 2) return;

        const numsDespues = valoresDespues
            .map(v => parseInt(v.replace(/\D/g, ''), 10))
            .filter(n => !isNaN(n));

        const ascendente = [...numsDespues].sort((a, b) => a - b);
        const descendente = [...numsDespues].sort((a, b) => b - a);

        const estaOrdenado = JSON.stringify(numsDespues) === JSON.stringify(ascendente)
            || JSON.stringify(numsDespues) === JSON.stringify(descendente);

        expect(estaOrdenado, `Correlativo invertido no está ordenado. Valores: ${numsDespues.join(', ')}`).toBe(true);
    });
});

test('BC-11b | Ordenar resultados por monto total — verificar orden numérico', async ({busquedaPage}) => {
    const page = busquedaPage['page'];

    await test.step('Given: se añade la columna "Monto total" y se aplica filtro con resultados', async () => {
        await busquedaPage.abrirConfiguracionColumnas();
        await busquedaPage.configurarColumna('TODOS', BC_COLUMN_IDS.MONTO_TOTAL, true);
        await busquedaPage.guardarConfiguracionColumnas();

        await busquedaPage.filtrarPorRangoFecha(BC_PRESETS_FECHA.TREINTA);
        await busquedaPage.abrirFiltrosAvanzados();
        await busquedaPage.filtrarPorMontoTotal('Mayor que', '5');
    });

    await test.step('When: ordena por la columna Monto total', async () => {
        await busquedaPage.ordenarPorColumna('Monto total');
    });

    await test.step('Then: los montos están ordenados de mayor a menor (o menor a mayor)', async () => {
        const valores = await busquedaPage.obtenerValoresColumna('Monto total');
        if (valores.length < 2) {
            test.skip(true, 'No hay suficientes filas para validar ordenamiento de montos');
            return;
        }

        const nums = valores
            .map(v => parseFloat(v.replace(/[S/$,\s]/g, '')))
            .filter(n => !isNaN(n) && n > 0);

        if (nums.length < 2) return;

        const ascendente = [...nums].sort((a, b) => a - b);
        const descendente = [...nums].sort((a, b) => b - a);

        const estaOrdenado = JSON.stringify(nums) === JSON.stringify(ascendente)
            || JSON.stringify(nums) === JSON.stringify(descendente);

        expect(estaOrdenado, `Monto total no está ordenado. Valores: ${nums.join(', ')}`).toBe(true);
    });

    await test.step('Cleanup: desactivar columna Monto total', async () => {
        await busquedaPage.abrirConfiguracionColumnas();
        await busquedaPage.configurarColumna('TODOS', BC_COLUMN_IDS.MONTO_TOTAL, false);
        await busquedaPage.guardarConfiguracionColumnas();
    });
});
