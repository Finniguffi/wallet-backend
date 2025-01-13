import { Module } from '@nestjs/common';
import { PrometheusService } from './services/prometheus.service';
import { PrometheusController } from './controllers/prometheus.controller';

@Module({
  controllers: [PrometheusController],
  providers: [PrometheusService],
})
export class PrometheusModule {}