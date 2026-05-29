import {type Page} from '@playwright/test';
import {ProductoFormPage} from '@pages/Logistica/ProductoFormPage';
import {RecetaFormPage} from '@pages/Logistica/RecetaFormPage';
import {ListaFormPage} from '@pages/Logistica/ListaFormPage';
import {ComboFormPage} from '@pages/Logistica/ComboFormPage';
import type {ItemTemplate} from '@factories/item-factory';
import {verificarVisible} from '../../../../src/utils/functional-error';

export async function llenarProductoBase(
    productoForm: ProductoFormPage,
    codigo: string,
    template: ItemTemplate,
): Promise<void> {
    await productoForm.iniciarCreacionProducto();
    const nombreFinal = template.esDinamico ? `${template.nombre} ${codigo.split('-')[1]}` : template.nombre;
    await productoForm.llenarNombre(nombreFinal);
    await productoForm.llenarCodigo(Number(codigo.replace(/-/g, '')));
    await productoForm.llenarPrecios(template.config.precioVenta, template.config.precioCompra);
    await productoForm.expandirOpcionesAvanzadas();
}

export async function configurarStockProducto(
    productoForm: ProductoFormPage,
    template: ItemTemplate,
): Promise<void> {
    await productoForm.irATabStock();

    if (template.config.almacen) {
        await productoForm.seleccionarAlmacenEspecifico(template.config.almacen);
    }

    await productoForm.seleccionarControlStock(template.config.controlStock);

    if (template.config.cantidadStock) {
        await productoForm.llenarCantidadesStock(template.config.cantidadStock);
    }

    await productoForm.llenarInfoAdicional('REGRESION', 'AUTO-TEST', 'AUTOMATIZADO');
}

export async function aplicarExtrasProducto(
    productoForm: ProductoFormPage,
    template: ItemTemplate,
    codigo: string,
): Promise<void> {
    const {config} = template;

    if (config.isc) {
        await productoForm.configurarISC(config.isc);
    }

    if (config.icbper) {
        await productoForm.activarICBPER();
    }

    if (config.variantes) {
        await productoForm.irATabVariantes();
        for (const attr of config.variantes.atributos) {
            await productoForm.crearAtributoVariante(attr.titulo, attr.opciones);
        }
        for (let i = 0; i < config.variantes.items.length; i++) {
            const v = config.variantes.items[i];
            const variantName = (template.esDinamico && codigo.includes('-')) ? `${v.nombre} ${codigo.split('-')[1]}` : v.nombre;
            await productoForm.agregarVariante(i, variantName, v.stock);
        }
    }

    if (config.equivalencias) {
        await productoForm.irATabEquivalencias();
        for (let i = 0; i < config.equivalencias.length; i++) {
            await productoForm.crearEquivalencia({
                ...config.equivalencias[i],
                esPrimera: i === 0,
            });
        }
    }
}

export async function guardarProductoYVolver(
    page: Page,
    productoForm: ProductoFormPage,
    codigo: string,
): Promise<void> {
    await productoForm.crearProducto();

    await verificarVisible(page, page.getByRole('button', {name: 'Ir a lista de ítems'}), {
        elemento: 'botón Ir a lista de ítems',
        paso: `Guardar producto ${codigo}`,
        uiMessages: {
            errorModal: (texto: string) => `el ERP rechazó el producto: "${texto.slice(0, 200)}"`,
            validation: (textos: string[]) => `el formulario del producto tiene errores: "${textos.join(' | ')}"`,
            loading: 'el guardado del producto no terminó (loader atascado)',
        },
    });

    await productoForm.clickIrAListaItems();

    await verificarVisible(page, page.getByRole('textbox', {name: 'Buscar por nombre, código o c'}), {
        elemento: 'buscador de items',
        paso: `Verificar retorno a lista tras guardar ${codigo}`,
        timeout: 10_000,
    });
}

export async function crearProductoDesdeTemplate(
    page: Page,
    productoForm: ProductoFormPage,
    codigo: string,
    template: ItemTemplate,
): Promise<void> {
    await import('@playwright/test').then(({test}) => test.step(`Crear producto ${codigo}`, async () => {
        await llenarProductoBase(productoForm, codigo, template);
        await configurarStockProducto(productoForm, template);
        await aplicarExtrasProducto(productoForm, template, codigo);
        await guardarProductoYVolver(page, productoForm, codigo);
    }));
}

export async function crearRecetaDesdeTemplate(
    page: Page,
    recetaForm: RecetaFormPage,
    codigo: string,
    template: ItemTemplate,
    resolverCodigo: (key: string) => string,
): Promise<void> {
    await recetaForm.iniciarCreacionReceta();
    const nombreFinal = template.esDinamico ? `${template.nombre} ${codigo.split('-')[1]}` : template.nombre;
    await recetaForm.llenarNombre(nombreFinal);
    await recetaForm.llenarCodigo(Number(codigo.replace(/-/g, '')));
    await recetaForm.llenarPrecios(template.config.precioVenta, template.config.precioCompra);

    await recetaForm.irATabInsumos();
    for (const insumo of template.config.insumos!) {

        const codigoResuelto = resolverCodigo(insumo.codigoBusqueda);
        const codigoBusqueda = codigoResuelto.replace(/-/g, '');
        const variantName = (insumo.variante && codigoResuelto.includes('-')) ? `${insumo.variante} ${codigoResuelto.split('-')[1]}` : insumo.variante;

        await recetaForm.buscarYAgregarInsumo({
            ...insumo,
            codigoBusqueda: codigoBusqueda,
            variante: variantName,
        });
    }

    await recetaForm.expandirOpcionesAvanzadas();
    await recetaForm.llenarInfoAdicional('AUTO-TEST', 'AUTOMATIZADO');

    await recetaForm.crearReceta();
    await verificarVisible(page, page.getByRole('button', {name: 'Ir a lista de ítems'}), {
        elemento: 'botón Ir a lista de ítems',
        paso: `Guardar receta ${codigo}`,
        uiMessages: {
            errorModal: (texto: string) => `el ERP rechazó la receta: "${texto.slice(0, 200)}"`,
            loading: 'el guardado de la receta no terminó (loader atascado)',
        },
    });
    await recetaForm.clickIrAListaItems();
    await verificarVisible(page, page.getByRole('textbox', {name: 'Buscar por nombre, código o c'}), {
        elemento: 'buscador de items',
        paso: `Verificar retorno a lista tras guardar receta ${codigo}`,
        timeout: 10_000,
    });
}

export async function crearListaDesdeTemplate(
    page: Page,
    listaForm: ListaFormPage,
    codigo: string,
    template: ItemTemplate,
    resolverCodigo: (key: string) => string,
): Promise<void> {
    await listaForm.iniciarCreacionLista();
    const nombreFinal = template.esDinamico ? `${template.nombre} ${codigo.split('-')[1]}` : template.nombre;
    await listaForm.llenarNombre(nombreFinal);
    await listaForm.llenarCodigo(Number(codigo.replace(/-/g, '')));
    await listaForm.llenarDescripcion('Lista para prueba Nota de Venta');

    for (const prod of template.config.productosLista!) {
        
        const codigoResuelto = resolverCodigo(prod.codigoBusqueda);
        const codigoBusqueda = codigoResuelto.replace(/-/g, '');
        const sufijoId = codigoResuelto.includes('-') ? codigoResuelto.split('-')[1] : '';
        const textoCompleto = sufijoId ? `${prod.textoSeleccion} ${sufijoId}` : prod.textoSeleccion;
        const variantName = (prod.variante && sufijoId) ? `${prod.variante} ${sufijoId}` : prod.variante;

        await listaForm.buscarYAgregarProducto({
            ...prod,
            codigoBusqueda: codigoBusqueda,
            textoSeleccion: textoCompleto,
            variante: variantName,
        });
    }

    await listaForm.crearLista();
    await verificarVisible(page, page.getByRole('button', {name: 'Ir a lista de ítems'}), {
        elemento: 'botón Ir a lista de ítems',
        paso: `Guardar lista ${codigo}`,
        uiMessages: {
            errorModal: (texto: string) => `el ERP rechazó la lista: "${texto.slice(0, 200)}"`,
            loading: 'el guardado de la lista no terminó (loader atascado)',
        },
    });
    await listaForm.clickIrAListaItems();
    await verificarVisible(page, page.getByRole('textbox', {name: 'Buscar por nombre, código o c'}), {
        elemento: 'buscador de items',
        paso: `Verificar retorno a lista tras guardar lista ${codigo}`,
        timeout: 10_000,
    });
}

export async function crearComboDesdeTemplate(
    page: Page,
    comboForm: ComboFormPage,
    codigo: string,
    template: ItemTemplate,
    resolverCodigo: (key: string) => string,
): Promise<void> {
    await comboForm.iniciarCreacionCombo();
    const nombreFinal = template.esDinamico ? `${template.nombre} ${codigo.split('-')[1]}` : template.nombre;
    await comboForm.llenarNombre(nombreFinal);
    await comboForm.llenarCodigo(Number(codigo.replace(/-/g, '')));
    await comboForm.llenarPrecios(template.config.precioVenta, template.config.precioCompra);

    await comboForm.irATabComponentes();
    for (const comp of template.config.componentesCombo!) {
        const codigoResuelto = resolverCodigo(comp.codigoBusqueda);
        const codigoBusqueda = codigoResuelto.replace(/-/g, '');

        await comboForm.buscarYAgregarComponente({
            ...comp,
            codigoBusqueda: codigoBusqueda,
        });
    }

    if (template.config.subcategoria && template.config.marca) {
        await comboForm.expandirOpcionesAvanzadas();
        await comboForm.llenarInfoAdicional(template.config.subcategoria, template.config.marca);
    }

    await comboForm.crearCombo();
    await verificarVisible(page, page.getByRole('button', {name: 'Ir a lista de ítems'}), {
        elemento: 'botón Ir a lista de ítems',
        paso: `Guardar combo ${codigo}`,
        uiMessages: {
            errorModal: (texto: string) => `el ERP rechazó el combo: "${texto.slice(0, 200)}"`,
            loading: 'el guardado del combo no terminó (loader atascado)',
        },
    });
    await page.getByRole('button', {name: 'Ir a lista de ítems'}).click();
    await verificarVisible(page, page.getByRole('textbox', {name: 'Buscar por nombre, código o c'}), {
        elemento: 'buscador de items',
        paso: `Verificar retorno a lista tras guardar combo ${codigo}`,
        timeout: 10_000,
    });
}
