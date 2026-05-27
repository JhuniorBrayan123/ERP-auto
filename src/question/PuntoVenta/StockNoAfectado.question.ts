import { expect } from '@playwright/test';

// En el futuro se puede integrar con KardexApi para validar saldo físico real
export const StockNoAfectado = {
    verificarSaldoIdentico: async (saldoAntes: number, saldoDespues: number): Promise<void> => {
        expect(saldoDespues).toBe(saldoAntes);
    }
};
