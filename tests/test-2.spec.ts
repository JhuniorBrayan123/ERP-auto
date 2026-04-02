import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://erpperu2-crt-4.smartclic.pe/auth/login');
  await page.getByRole('textbox', { name: 'Coloca aquí tu correo electró' }).click();
  await page.getByRole('textbox', { name: 'Coloca aquí tu correo electró' }).click();
  await page.getByRole('textbox', { name: 'Coloca aquí tu correo electró' }).fill('gutierrezmamanijhuniorb+133@gmail.com');
  await page.getByRole('textbox', { name: 'Coloca aquí tu contraseña' }).click();
  await page.getByRole('textbox', { name: 'Coloca aquí tu contraseña' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Coloca aquí tu contraseña' }).fill('S');
  await page.getByRole('textbox', { name: 'Coloca aquí tu contraseña' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Coloca aquí tu contraseña' }).fill('Smart123.');
  await page.getByRole('textbox', { name: 'Coloca aquí tu contraseña' }).press('Enter');
  await page.getByText('Ninguna').first().click();
  await page.getByText('Ninguna').first().click();
  await page.getByText('REGRESION').click();
  await page.getByText('Ninguna').first().click();
  await page.getByText('AUTO-TEST').click();
  await page.getByText('Ninguna').click();
  await page.getByText('AUTOMATIZADO').click();
  await page.locator('div').filter({ hasText: /^REGRESION$/ }).nth(2).click();
  await page.locator('div').filter({ hasText: /^REGRESION$/ }).nth(4).click();
  await page.locator('.subcategoria > .form-control > .v-select > .v-select-form > .v-select-base > .v-select-base-header > .v-select-header-base-form > .v-select-header-form > .v-select-header-form-arrow').first().click();
  await page.getByText('VARIOS').click();

  await page.locator('[id="lgt_cmp-registro-item_cmp-body-item_cmp-tabs-item.v-tabs:tabs-5"]').nth(4).click();
  await page.getByText('Campos adicionales(Opcional)').click();
  await page.locator('[id="lgt_reg-item_v-tab:campos-adicionales_grilla-campos-adicionales:campo-adicional_cmp-dropdown:campo-adicional-opciones"]').nth(1).click();
  await page.locator('[id="lgt_cmp-registro-item_cmp-body-item_cmp-tabs-item.v-tabs:tabs-5"]').nth(4).click();
});