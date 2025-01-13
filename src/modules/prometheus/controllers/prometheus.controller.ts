import { Controller, Get } from '@nestjs/common';
import { PrometheusService } from '../services/prometheus.service';
import { Public } from 'src/commom/decorators/public.decorator';

@Controller('metrics')
export class PrometheusController {
    constructor(private readonly prometheusService: PrometheusService) { }

    @Get()
    @Public()
    async getMetrics(): Promise<string> {
        return this.prometheusService.getMetrics();
    }
}
