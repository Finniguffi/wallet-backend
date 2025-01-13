import { Controller, Get } from '@nestjs/common';
import { PrometheusService } from '../services/prometheus.service';

@Controller('metrics')
export class PrometheusController {
    constructor(private readonly prometheusService: PrometheusService) { }

    @Get()
    async getMetrics(): Promise<string> {
        return this.prometheusService.getMetrics();
    }
}
