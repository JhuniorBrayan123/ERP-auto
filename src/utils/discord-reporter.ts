// https://discord.com/api/webhooks/1494006794597695539/GKujl0y_JY0RdcOb6xpi3QVjrFqauMX5hglVfHENJVwiPDKrTWcGEj80723yYpnUNE7M
// discord-reporter.ts
import {FullResult, Reporter, TestCase, TestResult} from '@playwright/test/reporter';

class DiscordReporter implements Reporter {
    // Aquí guardaremos el conteo por cada tag
    private tagResults: Record<string, { passed: number, failed: number }> = {};

    // Este método se ejecuta cada vez que termina un test individual
    onTestEnd(test: TestCase, result: TestResult) {
        // Si el test se saltó (skipped), no lo contamos
        if (result.status === 'skipped') return;

        // Extraemos los tags.
        // CAMBIO 1: Usamos /@[\w-]+/g para que lea correctamente etiquetas con guiones como @productos-stock
        const tagsFromApi = test.tags || [];
        const tagsFromTitle = test.title.match(/@[\w-]+/g) || [];

        // Unimos los tags y quitamos el símbolo '@' para que se vea más limpio
        const allTags = [...new Set([...tagsFromApi, ...tagsFromTitle])].map(t => t.replace('@', ''));

        const isFailure = result.status === 'failed' || result.status === 'timedOut';

        // Si el test no tiene tag, lo agrupamos en "Otros"
        if (allTags.length === 0) {
            this.addResult('Otros', isFailure);
            return;
        }

        // CAMBIO 2: Juntamos todos los tags del test con un guion para no duplicar conteos.
        // Ej: 'logistica' y 'productos-stock' se vuelve 'logistica-productos-stock'
        const combinedCategory = allTags.join('-');

        // Sumamos el resultado a la categoría combinada (1 sola vez por test)
        this.addResult(combinedCategory, isFailure);
    }

    // Función de ayuda para sumar
    private addResult(tag: string, isFailure: boolean) {
        if (!this.tagResults[tag]) {
            this.tagResults[tag] = {passed: 0, failed: 0};
        }
        if (isFailure) {
            this.tagResults[tag].failed++;
        } else {
            this.tagResults[tag].passed++;
        }
    }

    // Este método se ejecuta al finalizar TODA la regresión
    async onEnd(result: FullResult) {
        const webhookUrl = 'https://discord.com/api/webhooks/1494006794597695539/GKujl0y_JY0RdcOb6xpi3QVjrFqauMX5hglVfHENJVwiPDKrTWcGEj80723yYpnUNE7M';
        const testerName = "Jhunior Gutierrez"

        // Formatear la fecha como en tu ejemplo (ej: 15 abr 2026 • 11:35)
        const dateOptions: Intl.DateTimeFormatOptions = {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: false
        };
        const dateStr = new Date().toLocaleString('es-PE', dateOptions);

        let resultsText = '';
        let totalFailed = 0;
        let totalPassed = 0;

        // Armamos los resultados dinámicos por Módulo/Tag
        for (const [tag, stats] of Object.entries(this.tagResults)) {
            totalFailed += stats.failed;
            totalPassed += stats.passed;

            const tagName = tag.charAt(0).toUpperCase() + tag.slice(1);

            if (stats.failed > 0) {
                resultsText += `❌ **${tagName}** — Fallaron ${stats.failed} | Pasaron ${stats.passed}\n`;
            } else {
                resultsText += `✅ **${tagName}** — Todos pasaron (${stats.passed})\n`;
            }
        }

        const totalTests = totalPassed + totalFailed;
        const globalStatus = totalFailed > 0 ? "❌ **FALLIDO**" : "✅ **EXITOSO**";

        // Si quieres etiquetar a alguien, pon su ID de Discord aquí.
        // Si no, déjalo vacío ''.
        const mentions = ''; // Ejemplo: '<@759245355228332082>'

        // ARMAMOS EL MENSAJE CON EL FORMATO EXACTO QUE PEDISTE
        const messageContent = `${mentions}
──────────────────────────────────────────────

🤖 **REPORTE DE REGRESIÓN ERP2**

📌 **Entorno:** Certificacion
👤 **Ejecutado por:** ${testerName}
📅 **Fecha de ejecución:** ${dateStr}

──────────────────────────────────────────────

📋 **RESULTADOS POR MÓDULO**

${resultsText || "➖ _No se ejecutaron pruebas_"}

──────────────────────────────────────────────

📊 **RESUMEN GLOBAL**
**Estado:** ${globalStatus}
**Total de pruebas:** ${totalTests} (${totalPassed} pasaron, ${totalFailed} fallaron)

📄 _Para ver los detalles de los fallos, revisa el reporte HTML local ejecutando \`npx playwright show-report\`._

──────────────────────────────────────────────`;

        // En este diseño enviamos TODO como texto puro (content) en vez de un Embed,
        // ya que así respetamos las líneas separadoras y el estilo que me pasaste.
        const payload = {
            content: messageContent
        };

        try {
            await fetch(webhookUrl, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload)
            });
            console.log(' Reporte enviado a Discord exitosamente.');
        } catch (error) {
            console.error(' Error enviando reporte a Discord:', error);
        }
    }

}

export default DiscordReporter;