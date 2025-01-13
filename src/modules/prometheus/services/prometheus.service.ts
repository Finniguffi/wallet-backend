import { Injectable } from '@nestjs/common';
import * as promClient from 'prom-client';

@Injectable()
export class PrometheusService {
  private readonly httpRequestsCounter: promClient.Counter<string>;

  constructor() {
    this.httpRequestsCounter = new promClient.Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'status'],
    });

    promClient.collectDefaultMetrics(); 
  }

  incrementHttpRequest(method: string, status: string) {
    this.httpRequestsCounter.inc({ method, status });
  }

  getMetrics() {
    return promClient.register.metrics();
  }
}
