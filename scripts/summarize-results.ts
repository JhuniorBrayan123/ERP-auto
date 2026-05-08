import fs from 'node:fs';

type JsonReport = {
    suites?: any[];
};

const jsonPath = 'test-results/results.json';

if (!fs.existsSync(jsonPath)) {
    throw new Error(`No existe ${jsonPath}`);
}

const report = JSON.parse(fs.readFileSync(jsonPath, 'utf8')) as JsonReport;

const failures: any[] = [];
let total = 0;
let passed = 0;
let failed = 0;
let skipped = 0;
let flaky = 0;

function walkSuite(suite: any) {
    for (const spec of suite.specs ?? []) {
        for (const test of spec.tests ?? []) {
            total += 1;

            const results = test.results ?? [];
            const hasPassed = results.some((r: any) => r.status === 'passed');
            const hasFailed = results.some((r: any) => r.status === 'failed');
            const hasSkipped = results.every((r: any) => r.status === 'skipped');

            if (hasPassed && hasFailed) flaky += 1;
            else if (hasPassed) passed += 1;
            else if (hasFailed) failed += 1;
            else if (hasSkipped) skipped += 1;

            if (hasFailed) {
                const lastFailed = [...results].reverse().find((r: any) => r.status === 'failed');
                failures.push({
                    title: test.title,
                    location: test.location,
                    retryCount: results.length - 1,
                    error: lastFailed?.error?.message ?? 'Sin mensaje',
                    statusTrail: results.map((r: any) => r.status),
                });
            }
        }
    }

    for (const child of suite.suites ?? []) walkSuite(child);
}

for (const suite of report.suites ?? []) walkSuite(suite);

const summary = {
    total,
    passed,
    failed,
    skipped,
    flaky,
    failures,
};

fs.writeFileSync('test-results/summary.json', JSON.stringify(summary, null, 2));
console.log('Resumen generado en test-results/summary.json');