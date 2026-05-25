import { ISupplierAdapter } from '../../components/ISupplierAdapter';
import { DigiflazzAdapter } from './instances/DigiflazzAdapter';
import { VipResellerAdapter } from './instances/VipResellerAdapter';

class SupplierRegistry {
  private adapters: Map<string, ISupplierAdapter> = new Map();

  constructor() {
    this.register(new DigiflazzAdapter());
    this.register(new VipResellerAdapter());
    // Register other real suppliers here
  }

  register(adapter: ISupplierAdapter) {
    this.adapters.set(adapter.id, adapter);
  }

  getAdapter(id: string): ISupplierAdapter | undefined {
    return this.adapters.get(id);
  }

  getAllAdapters(): ISupplierAdapter[] {
    return Array.from(this.adapters.values());
  }
}

export const supplierRegistry = new SupplierRegistry();
