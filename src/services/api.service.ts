export const apiService = {
  async fulfillOrder(orderData: {
    sku: string;
    amount: number;
    userId: string;
    agencyBalance: number;
  }) {
    const response = await fetch('/api/fulfill', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    return response.json();
  },

  async verifyDomain(domain: string) {
    const response = await fetch('/api/verify-domain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain })
    });
    return response.json();
  }
};
