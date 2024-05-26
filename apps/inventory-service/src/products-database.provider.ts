import { join } from 'path';
import { DataSource } from 'typeorm';
import { Inventory } from './inventory.entity';
import { Products } from './product.entity';

export const productsDatabase = new DataSource({
  type: 'postgres',
  host: '192.168.112.2',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'postgres',
  entities: [Products, Inventory],
  migrations: [join(__dirname, 'migrations', '*{.ts,.js}')],
});
