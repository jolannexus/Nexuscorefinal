/**
 * NexusCore Supplier Adapter Interface
 * Standarisasi untuk semua provider (Digiflazz, Unipin, API Games)
 */

export interface SupplierResponse {
  success: boolean;
  refId: string;
  price: number;
  sn?: string; // Serial Number / Voucher Code
  message: string;
}

export abstract class SupplierAdapter {
  abstract name: string;
  abstract checkBalance(): Promise<number>;
  abstract processOrder(productId: string, targetId: string): Promise<SupplierResponse>;
}

/** 
 * Contoh Implementasi Digiflazz 
 */
export class DigiflazzAdapter extends SupplierAdapter {
  name = "Digiflazz_V2";
  
  async checkBalance() {
    // In real app: Axios call to Digiflazz
    return 15000000; 
  }

  async processOrder(productId: string, targetId: string) {
    return {
      success: true,
      refId: "TRX-DF-" + Date.now(),
      price: 15400,
      sn: "SN-9923-8812-111",
      message: "Order Success"
    };
  }
}
