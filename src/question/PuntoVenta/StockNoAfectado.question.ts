import { expect } from '@playwright/test';

export const StockNoAfectado = {
    verificarSaldoIdentico: async (saldoAntes: number, saldoDespues: number): Promise<void> => {
        expect(saldoDespues).toBe(saldoAntes);
    }
};
