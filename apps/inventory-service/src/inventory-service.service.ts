import { Inject, Injectable } from '@nestjs/common';
import {
  ClientProxy,
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Inventory } from './inventory.entity';
import { Repository } from 'typeorm';

@Injectable()
export class InventoryService {
  constructor(
    @Inject('INVENTORY_SERVICE') private client: ClientProxy,

    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
  ) {}

  // Método para responder ao OrderService
  async sendInventoryResponse(response: any) {
    this.client.emit<any>('inventory_response', response);
  }

  // Recebendo pedidos do OrderService
  @MessagePattern('check_stock')
  async handleOrderCheckStock(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    console.log('Received order:', data);

    const product = await this.checkStock(data.productId);

    this.sendInventoryResponse({ product: product, status: 'Processed' });

    channel.ack(originalMsg);
  }

  @MessagePattern('update_stock')
  async handleOrderUpdateStock(@Payload() data: any, context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    console.log('Received order to update:', data);

    await this.updateStock(data.productId, data.quantity);

    channel.ack(originalMsg);
  }

  async checkStock(productId: number): Promise<Inventory> {
    try {
      const product = await this.inventoryRepository.findOne({
        where: {
          product: {
            id: productId,
          },
        },
      });

      return product;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async updateStock(productId: number, quantity: number): Promise<boolean> {
    try {
      const product = await this.inventoryRepository.findOne({
        where: {
          product: {
            id: productId,
          },
        },
      });

      await this.inventoryRepository.update(
        { product: { id: productId } },
        { quantity: product.quantity - quantity },
      );

      return true;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
