import {FullResult, Reporter, TestCase, TestResult} from '@playwright/test/reporter';

class DiscordReporter implements Reporter {
    
    private tagResults: Record<string, { passed: number, failed: number }> = {};

    onTestEnd(test: TestCase, result: TestResult) {
        
        if (result.status === 'skipped') return;

        const tagsFromApi = test.tags || [];
        const tagsFromTitle = test.title.match(/@[\w-]+/g) || [];

        const allTags = [...new Set([...tagsFromApi, ...tagsFromTitle])].map(t => t.replace('@', ''));

        const isFailure = result.status === 'failed' || result.status === 'timedOut';

        if (allTags.length === 0) {
            this.addResult('Otros', isFailure);
            return;
        }

        const combinedCategory = allTags.join('-');

        this.addResult(combinedCategory, isFailure);
    }

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

    async onEnd(result: FullResult) {
        const webhookUrl = 'https://discord.com/api/webhooks/1494006794597695539/GKujl0y_JY0RdcOb6xpi3QVjrFqauMX5hglVfHENJVwiPDKrTWcGEj80723yYpnUNE7M';
        const testerName = "Jhunior Gutierrez"

        const dateOptions: Intl.DateTimeFormatOptions = {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: false
        };
        const dateStr = new Date().toLocaleString('es-PE', dateOptions);

        let resultsText = '';
        let totalFailed = 0;
        let totalPassed = 0;

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

        const mentions = '';

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