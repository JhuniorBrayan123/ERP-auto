type TestEnvironment = 'qa' |  'prd';

function required(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Falta la variable de entorno: ${name}`);
    }
    return value;
}

export const env = {
    testEnv: (process.env.TEST_ENV || 'qa') as TestEnvironment,
    baseUrl: required('BASE_URL'),
    userEmail: required('USER_EMAIL'),
    userPassword: required('USER_PASSWORD'),
    browser: process.env.BROWSER || 'chromium',
};