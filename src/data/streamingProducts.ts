
import { Product } from '../types/index';

export interface StreamingPlatform {
  name: string;
  id: string;
  supportedCategories: string[];
}

export const PLATFORMS: StreamingPlatform[] = [
  { name: 'TikTok LIVE', id: 'tiktok', supportedCategories: ['Coins', 'Gift Recharge', 'VIP Membership'] },
  { name: 'BIGO LIVE', id: 'bigo', supportedCategories: ['Diamonds', 'VIP Membership', 'Agency Recharge'] },
  { name: 'Poppo Live', id: 'poppo', supportedCategories: ['Coins', 'Points', 'VIP'] },
  { name: 'Chamet', id: 'chamet', supportedCategories: ['Diamonds', 'VIP', 'Cards'] },
  { name: 'Mango Live', id: 'mango', supportedCategories: ['Diamonds', 'VIP', 'Gold'] },
  { name: 'Likee Live', id: 'likee', supportedCategories: ['Diamonds', 'VIP'] },
  { name: 'HoneyCam', id: 'honeycam', supportedCategories: ['Diamonds', 'VIP Membership'] },
  { name: 'MICO Live', id: 'mico', supportedCategories: ['Coins', 'VIP Membership'] },
  { name: 'Hakuna Live', id: 'hakuna', supportedCategories: ['Diamonds', 'Stars'] },
  { name: 'Tango Live', id: 'tango', supportedCategories: ['Coins', 'Subscriptions'] },
  { name: 'Rain Live', id: 'rain', supportedCategories: ['Diamonds', 'VIP'] },
  { name: 'Kako Live', id: 'kako', supportedCategories: ['Diamonds', 'VIP'] },
  { name: 'Duku Live', id: 'duku', supportedCategories: ['Diamonds'] },
  { name: 'MOMO LIVE', id: 'momo', supportedCategories: ['Diamonds', 'VIP'] },
  { name: 'BuzzCast', id: 'buzzcast', supportedCategories: ['Diamonds', 'VIP'] },
  { name: 'Nonolive', id: 'nonolive', supportedCategories: ['Coins', 'VIP'] },
  { name: '17LIVE', id: '17live', supportedCategories: ['Points', 'VIP'] },
  { name: 'UpLive', id: 'uplive', supportedCategories: ['Diamonds', 'VIP'] },
  { name: 'Cube TV', id: 'cubetv', supportedCategories: ['Diamonds', 'VIP'] },
  { name: 'Kitty Live', id: 'kittylive', supportedCategories: ['Diamonds', 'VIP'] },
  { name: 'YoYo Live', id: 'yoyolive', supportedCategories: ['Coins', 'VIP'] },
  { name: 'SuperLive', id: 'superlive', supportedCategories: ['Diamonds', 'VIP'] },
  { name: 'Hello Yo', id: 'helloyo', supportedCategories: ['Diamonds', 'VIP'] },
  { name: 'WePlay', id: 'weplay', supportedCategories: ['Gold', 'VIP'] },
  { name: 'Woo Live', id: 'woolive', supportedCategories: ['Diamonds', 'VIP'] },
  { name: 'GoGo Live', id: 'gogolive', supportedCategories: ['Diamonds', 'VIP'] },
  { name: 'Sango', id: 'sango', supportedCategories: ['Diamonds', 'VIP'] },
  { name: 'LivU', id: 'livu', supportedCategories: ['Coins', 'VIP'] },
  { name: 'Bling2 Live', id: 'bling2', supportedCategories: ['Diamonds', 'VIP'] },
  { name: 'Hago Live', id: 'hago', supportedCategories: ['Diamonds', 'VIP'] },
  { name: 'Azar Live', id: 'azar', supportedCategories: ['Gems', 'Plus'] },
  { name: 'Kumu', id: 'kumu', supportedCategories: ['Coins', 'Membership'] },
  { name: 'Kick', id: 'kick', supportedCategories: ['Subscriptions', 'Gifts'] },
  { name: 'Trovo Live', id: 'trovo', supportedCategories: ['Elixir', 'Mana', 'Subscriptions'] },
  { name: 'Twitch', id: 'twitch', supportedCategories: ['Bits', 'Subscriptions', 'Gift Subs'] },
  { name: 'Nimo TV', id: 'nimotv', supportedCategories: ['Diamonds', 'VIP'] },
  { name: 'BOOYAH!', id: 'booyah', supportedCategories: ['Diamonds', 'Gift Card'] }
];

const CATEGORY_TAGS: Record<string, string[]> = {
  'Coins': ['Pack', 'Bundle', 'Recharge'],
  'Diamonds': ['Pack', 'Top-up', 'Premium'],
  'Gift Recharge': ['Gift Pack', 'Balance', 'Credit'],
  'VIP Membership': ['Monthly', 'Yearly', 'Elite', 'Pro'],
  'Agency Recharge': ['Bulk', 'Reseller Pack', 'Credit'],
  'Host Recharge': ['Creator Pack', 'Incentive', 'Direct'],
  'Creator packages': ['Starter', 'Influencer', 'Mega'],
  'Room pass': ['Private', 'Event', 'Access'],
  'Subscription packages': ['Tier 1', 'Tier 2', 'Tier 3'],
  'Gems': ['Small', 'Large', 'Vault'],
  'Plus': ['Silver', 'Gold', 'Platinum'],
  'Elixir': ['Drops', 'Vial', 'Potion'],
  'Bits': ['Cheer', 'Bits Bundle']
};

export const generateStreamingDatabase = (agencyId: string): Product[] => {
  const products: Product[] = [];

  PLATFORMS.forEach(platform => {
    platform.supportedCategories.forEach(category => {
      // Generate 2-4 products per category to reach 5-10 per platform
      const count = Math.floor(Math.random() * 3) + 2; 
      
      const BaseAmounts = [100, 500, 1000, 5000, 10000];
      const BasePrices = [15000, 75000, 150000, 740000, 1450000];

      for (let i = 0; i < count; i++) {
        const amountIdx = i % BaseAmounts.length;
        const amount = BaseAmounts[amountIdx] * (i + 1);
        const basePrice = Math.floor(BasePrices[amountIdx] * (i + 1) * (0.9 + Math.random() * 0.2));
        const sellingPrice = Math.floor(basePrice * 1.1); // 10% margin
        const sku = `${platform.id.toUpperCase()}-${category.replace(/\s+/g, '').toUpperCase()}-${amount}`;
        
        const tags = CATEGORY_TAGS[category] || ['General'];
        const tag = tags[Math.floor(Math.random() * tags.length)];
        
        products.push({
          id: `sp_${platform.id}_${sku.toLowerCase()}`,
          agencyId,
          supplierId: 'nexus_fulfillment_v4',
          supplierName: 'NEXUS CLUSTER',
          appName: platform.name,
          category: category,
          name: `${platform.name}: ${amount.toLocaleString()} ${category} ${tag}`,
          productCode: sku,
          basePrice,
          sellingPrice,
          status: 'ACTIVE',
          isEnabled: true,
          syncedAt: new Date().toISOString(),
          description: `Premium ${category} for ${platform.name}. Instant delivery within 5 minutes. Secure and authorized transaction via Nexus Fulfillment Cluster.`,
          thumbnail: `https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=200&auto=format&fit=crop`, // Placeholder
          marginType: 'PERCENTAGE',
          marginValue: 10,
          rate: basePrice / amount,
          min: 1,
          max: 9999
        });
      }
    });
  });

  return products;
};

export const STREMAING_ANALYTICS = {
  totalVolume: 1250400000, // IDR
  totalOrders: 4520,
  activeNodes: 37,
  healthStatus: 'OPTIMAL',
  recentTransactions: Array.from({ length: 20 }).map((_, i) => ({
    id: `TX-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    platform: PLATFORMS[Math.floor(Math.random() * PLATFORMS.length)].name,
    amount: Math.floor(Math.random() * 1000000),
    status: Math.random() > 0.1 ? 'SUCCESS' : 'PENDING',
    timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString()
  }))
};
