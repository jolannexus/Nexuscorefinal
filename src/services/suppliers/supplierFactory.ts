import { ISupplierAdapter } from '../../components/ISupplierAdapter';
import { DigiflazzAdapter } from '../../adapters/suppliers/instances/DigiflazzAdapter';
import { VipResellerAdapter } from '../../adapters/suppliers/instances/VipResellerAdapter';

export class SupplierFactory {
  private static instances: Map<string, ISupplierAdapter> = new Map();

  static getAdapter(type: string, config: any): ISupplierAdapter {
    const apiKey = config.apiKey || config.username || config.apiId || 'NO_KEY';
    const key = `${type}-${apiKey.toString().substring(0, 5)}`;
    
    if (this.instances.has(key)) {
      return this.instances.get(key)!;
    }

    let adapter: ISupplierAdapter;

    switch (type.toUpperCase()) {
      case 'DIGIFLAZZ':
        adapter = new DigiflazzAdapter(config);
        break;
      case 'VIP_RESELLER':
      case 'VIPRESELLER':
        adapter = new VipResellerAdapter(config);
        break;
      default:
        throw new Error(`Supplier type ${type} not supported`);
    }

    this.instances.set(key, adapter);
    return adapter;
  }
}
