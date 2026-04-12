export interface HealthStatus {
  status: 'ok' | 'error';
  database: 'up' | 'down';
  timestamp: string;
}
