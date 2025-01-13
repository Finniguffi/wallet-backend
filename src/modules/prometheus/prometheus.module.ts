import { Module } from '@nestjs/common';
import { PrometheusService } from './services/prometheus.service';

@Module({
  providers: [PrometheusService],
})
export class PrometheusModule {}