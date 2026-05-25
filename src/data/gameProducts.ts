
import { Product } from '../types/index';

export interface GamePlatform {
  name: string;
  id: string;
  categories: string[];
}

export const GAMES: GamePlatform[] = [
  { name: 'Mobile Legends', id: 'mlbb', categories: ['Diamonds', 'Weekly Pass', 'Twilight Pass'] },
  { name: 'Free Fire', id: 'ff', categories: ['Diamonds', 'Membership'] },
  { name: 'PUBG Mobile', id: 'pubgm', categories: ['UC', 'Royale Pass'] },
  { name: 'Honor of Kings', id: 'hok', categories: ['Tokens', 'Weekly Card'] },
  { name: 'Valorant', id: 'valorant', categories: ['Points'] },
  { name: 'Genshin Impact', id: 'genshin', categories: ['Genesis Crystals', 'Blessing of the Welkin Moon'] },
  { name: 'Roblox', id: 'roblox', categories: ['Robux', 'Gift Cards'] },
  { name: 'Call of Duty Mobile', id: 'codm', categories: ['CP'] },
  { name: 'Arena Breakout', id: 'arena-breakout', categories: ['Bonds'] },
  { name: 'Blood Strike', id: 'blood-strike', categories: ['Gold'] },
  { name: 'FC Mobile', id: 'fc-mobile', categories: ['FC Points'] },
  { name: 'eFootball', id: 'efootball', categories: ['Coins'] },
  { name: 'Clash of Clans', id: 'coc', categories: ['Gems', 'Gold Pass'] },
  { name: 'Clash Royale', id: 'cr', categories: ['Gems', 'Pass Royale'] },
  { name: 'Magic Chess Go Go', id: 'magic-chess', categories: ['Diamonds'] },
  { name: 'Delta Force', id: 'delta-force', categories: ['Tokens'] },
  { name: 'Point Blank', id: 'pb', categories: ['Cash'] },
  { name: 'Steam Wallet', id: 'steam', categories: ['IDR Balance'] },
  { name: 'Ragnarok', id: 'ragnarok', categories: ['Zeny', 'BCC'] },
  { name: 'Minecraft', id: 'minecraft', categories: ['Minecoins'] },
  { name: 'League of Legends', id: 'lol', categories: ['Wild Cores', 'RP'] },
  { name: 'Dota 2', id: 'dota2', categories: ['Steam Wallet', 'Battle Pass'] },
  { name: 'Apex Legends', id: 'apex', categories: ['Apex Coins'] },
  { name: 'Fortnite', id: 'fortnite', categories: ['V-Bucks'] }
];

export const generateGameDatabase = (agencyId: string): Product[] => {
  const products: Product[] = [];

  GAMES.forEach(game => {
    game.categories.forEach(category => {
      const count = Math.floor(Math.random() * 3) + 3; // 3-5 products per category
      
      const BaseAmounts = [50, 100, 250, 500, 1000, 2500, 5000];
      const BasePrices = [12000, 24000, 60000, 120000, 240000, 600000, 1200000];

      for (let i = 0; i < count; i++) {
        const amountIdx = i % BaseAmounts.length;
        const amount = BaseAmounts[amountIdx] * (i + 1);
        const basePrice = Math.floor(BasePrices[amountIdx] * (i + 1) * (0.95 + Math.random() * 0.1));
        const sellingPrice = Math.floor(basePrice * 1.08); // 8% margin
        const sku = `${game.id.toUpperCase()}-${category.replace(/\s+/g, '').toUpperCase()}-${amount}`;
        
        products.push({
          id: `game_${game.id}_${sku.toLowerCase()}`,
          agencyId,
          supplierId: 'nexus_fulfillment_v4',
          supplierName: 'NEXUS CLUSTER',
          appName: game.name,
          category: category,
          name: `${game.name}: ${amount.toLocaleString()} ${category}`,
          productCode: sku,
          basePrice,
          sellingPrice,
          status: 'ACTIVE',
          isEnabled: true,
          syncedAt: new Date().toISOString(),
          description: `Authorized ${category} for ${game.name}. Top up instantly into your game account. Fast processing via Nexus Fulfillment nodes.`,
          thumbnail: `https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=200&auto=format&fit=crop`,
          marginType: 'PERCENTAGE',
          marginValue: 8,
          rate: basePrice / amount,
          min: 1,
          max: 999
        });
      }
    });
  });

  return products;
};

export const GAME_ANALYTICS = {
  trendingGames: ['Mobile Legends', 'Free Fire', 'Valorant', 'Honor of Kings'],
  featuredProducts: ['MLBB Weekly Pass', 'Valorant 1250 Points', 'HOK 120 Tokens'],
  totalVolume: 3450000000, // IDR
  dailyOrders: 850
};
