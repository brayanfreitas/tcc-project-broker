import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'ORDER_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'order_updates',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  providers: [OrderService],
})
export class OrderModule {}
