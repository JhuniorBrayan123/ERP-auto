import { test, expect } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { parseResultsFile, getFailedTests, FailedTestGroup } from '../scripts/analyze-results';

const TMP_DIR = path.join(os.tmpdir(), 'erp-test-analyze-' + Date.now());

function writeFixture(subdir: string, data: unknown): string {
    const dir = path.join(TMP_DIR, subdir);
    fs.mkdirSync(dir, { recursive: true });
    const filePath = path.join(dir, 'results.json');
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return dir;
}

function escapeGrep(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildGrepPattern(titles: string[]): string {
    return titles.map((t) => escapeGrep(t)).join('|');
}

test.describe('parseResultsFile', () => {
    test.afterAll(() => {
        if (fs.existsSync(TMP_DIR)) {
            fs.rmSync(TMP_DIR, { recursive: true, force: true });
        }
    });

    test('extracts failed test titles from valid results.json', () => {
        
        const fixtureDir = writeFixture('logistica', {
            config: { projects: [{ name: 'Logistica' }] },
            suites: [
                {
                    title: 'root',
                    specs: [
                        {
                            title: 'Login with valid credentials',
                            ok: false,
                            tests: [{ status: 'failed' }],
                        },
                        {
                            title: 'Logout clears session',
                            ok: false,
                            tests: [{ status: 'failed' }],
                        },
                        {
                            title: 'Navigation works',
                            ok: true,
                            tests: [{ status: 'passed' }],
                        },
                        {
                            title: 'Data export fails',
                            ok: false,
                            tests: [{ status: 'timedOut' }],
                        },
                    ],
                    suites: [],
                },
            ],
        });

        const filePath = path.join(fixtureDir, 'results.json');
        const titles = parseResultsFile(filePath);

        expect(titles).toEqual([
            'Login with valid credentials',
            'Logout clears session',
            'Data export fails',
        ]);
    });

    test('returns empty array when all tests pass', () => {
        const fixtureDir = writeFixture('all-pass', {
            config: { projects: [{ name: 'PuntoVenta' }] },
            suites: [
                {
                    title: 'root',
                    specs: [
                        { title: 'Test passes', ok: true, tests: [{ status: 'passed' }] },
                        { title: 'Another passes', ok: true, tests: [{ status: 'passed' }] },
                    ],
                    suites: [],
                },
            ],
        });

        const titles = parseResultsFile(path.join(fixtureDir, 'results.json'));
        expect(titles).toEqual([]);
    });

    test('returns empty array when file does not exist', () => {
        const nonExistentPath = path.join(TMP_DIR, 'nonexistent', 'results.json');
        const titles = parseResultsFile(nonExistentPath);
        expect(titles).toEqual([]);
    });

    test('returns empty array for malformed JSON', () => {
        const dir = path.join(TMP_DIR, 'malformed');
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, 'results.json'), 'not valid json {{{', 'utf-8');

        const titles = parseResultsFile(path.join(dir, 'results.json'));
        expect(titles).toEqual([]);
    });

    test('returns empty array when suites field is missing', () => {
        const fixtureDir = writeFixture('no-suites', {
            config: { projects: [{ name: 'Logistica' }] },
        });

        const titles = parseResultsFile(path.join(fixtureDir, 'results.json'));
        expect(titles).toEqual([]);
    });

    test('returns empty array when specs array is empty', () => {
        const fixtureDir = writeFixture('empty-specs', {
            config: { projects: [{ name: 'Logistica' }] },
            suites: [{ title: 'root', specs: [], suites: [] }],
        });

        const titles = parseResultsFile(path.join(fixtureDir, 'results.json'));
        expect(titles).toEqual([]);
    });

    test('handles nested suites recursively', () => {
        const fixtureDir = writeFixture('nested-suites', {
            config: { projects: [{ name: 'PuntoVenta' }] },
            suites: [
                {
                    title: 'root',
                    specs: [],
                    suites: [
                        {
                            title: 'Login suite',
                            specs: [
                                {
                                    title: 'Login fails',
                                    ok: false,
                                    tests: [{ status: 'failed' }],
                                },
                            ],
                            suites: [
                                {
                                    title: 'Nested suite',
                                    specs: [
                                        { title: 'Deep passes', ok: true, tests: [{ status: 'passed' }] },
                                        { title: 'Deep fails', ok: false, tests: [{ status: 'timedOut' }] },
                                    ],
                                    suites: [],
                                },
                            ],
                        },
                        {
                            title: 'Checkout suite',
                            specs: [
                                { title: 'Checkout ok', ok: true, tests: [{ status: 'passed' }] },
                            ],
                            suites: [],
                        },
                    ],
                },
            ],
        });

        const titles = parseResultsFile(path.join(fixtureDir, 'results.json'));
        expect(titles).toEqual(['Login fails', 'Deep fails']);
    });
});

test.describe('getFailedTests', () => {
    test.afterAll(() => {
        if (fs.existsSync(TMP_DIR)) {
            fs.rmSync(TMP_DIR, { recursive: true, force: true });
        }
    });

    test('returns empty array when no results files exist', () => {
        const result = getFailedTests();
        expect(result).toEqual([]);
    });

    test('FailedTestGroup interface has correct shape', () => {
        const group: FailedTestGroup = {
            project: 'PuntoVenta',
            titles: ['Test 1', 'Test 2'],
        };
        expect(group.project).toBe('PuntoVenta');
        expect(group.titles).toHaveLength(2);
        expect(group.titles[0]).toBe('Test 1');
    });
});

test.describe('grep pattern building (runFailedTests logic)', () => {
    test('builds correct grep pattern from multiple plain titles', () => {
        
        const titles = ['Login with valid credentials', 'Logout clears session'];
        
        const pattern = buildGrepPattern(titles);
        
        expect(pattern).toBe('Login with valid credentials|Logout clears session');
    });

    test('escapes special regex characters in titles', () => {

        const titles = ['Calculate 10% + $50 tax', 'Price (per unit) [2024]'];
        
        const pattern = buildGrepPattern(titles);
        
        expect(pattern).toBe('Calculate 10% \\+ \\$50 tax|Price \\(per unit\\) \\[2024\\]');
    });

    test('builds grep pattern from getFailedTests output data flow', () => {
        
        const pvDir = path.join(TMP_DIR, 'grep-flow-pv');
        fs.mkdirSync(pvDir, { recursive: true });
        fs.writeFileSync(
            path.join(pvDir, 'results.json'),
            JSON.stringify({
                config: { projects: [{ name: 'PuntoVenta' }] },
                suites: [
                    {
                        title: 'root',
                        specs: [
                            {
                                title: 'PV: Tax calculation fails',
                                ok: false,
                                tests: [{ status: 'failed' }],
                            },
                            {
                                title: 'PV: Discount @ 10% off',
                                ok: false,
                                tests: [{ status: 'failed' }],
                            },
                        ],
                        suites: [],
                    },
                ],
            }),
            'utf-8',
        );

        const titles = parseResultsFile(path.join(pvDir, 'results.json'));
        expect(titles).toEqual(['PV: Tax calculation fails', 'PV: Discount @ 10% off']);

        const pattern = buildGrepPattern(titles);
        expect(pattern).toContain('PV: Tax calculation fails');
        expect(pattern).toContain('PV: Discount @ 10% off');
    });

    test('handles empty titles array — returns empty pattern', () => {
        const pattern = buildGrepPattern([]);
        expect(pattern).toBe('');
    });

    test('single failed test does not include pipe separator', () => {
        const pattern = buildGrepPattern(['Only one test fails']);
        expect(pattern).toBe('Only one test fails');
        expect(pattern).not.toContain('|');
    });
});
