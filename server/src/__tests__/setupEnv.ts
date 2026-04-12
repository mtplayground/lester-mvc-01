import 'dotenv/config';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-jwt-secret';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '1h';

const defaultLocalTestDatabaseUrl = 'postgresql://postgres:postgres@localhost:5432/lester_mvc?schema=public';
const testDatabaseUrl = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL ?? defaultLocalTestDatabaseUrl;

process.env.DATABASE_URL = testDatabaseUrl;
