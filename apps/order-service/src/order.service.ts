import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OrderService {
  constructor(@Inject('ORDER_SERVICE') private readonly client: ClientProxy) {}

  async updateStock(productId: number, quantity: number): Promise<any> {
    const stockStatus = await firstValueFrom(
      this.client.send('check_stock', { productId }),
    );

    if (stockStatus.quantity > 0) {
      // Se o estoque está disponível, envie uma atualização para decrementar o estoque
      await firstValueFrom(
        this.client.send('update_stock', {
          productId,
          quantity,
        }),
      );
      return true;
    } else {
      throw new InternalServerErrorException(
        'Error at processing the requisition',
      );
    }
  }
}
