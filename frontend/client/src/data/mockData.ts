import { User, Item, Exchange, Badge, Reward, Redemption, Offer } from "@shared/schema";
import { calculateEcoPoints, calculateEnvironmentalImpact } from "@/utils/ecoPoints";

export const mockUsers: User[] = [
  {
    id: 1,
    username: "admin",
    email: "admin@rewear.com",
    password: "admin123",
    role: "admin",
    name: "Admin User",
    profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40",
    bio: "Platform administrator promoting sustainable fashion",
    location: "San Francisco, CA",
    badges: ["admin", "sustainability-champion", "early-adopter"],
    itemsCount: 0,
    exchangesCount: 0,
    joinDate: "2024-01-15",
    carbonSaved: 0,
    waterSaved: 0,
    ecoPoints: 0,
  },
  {
    id: 2,
    username: "sarah_eco",
    email: "sarah@example.com",
    password: "user123",
    role: "user",
    name: "Sarah Johnson",
    profileImage: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40",
    bio: "Passionate about sustainable fashion and reducing waste",
    location: "Portland, OR",
    badges: ["eco-warrior", "frequent-exchanger", "community-leader"],
    itemsCount: 8,
    exchangesCount: 12,
    joinDate: "2024-02-10",
    carbonSaved: 156,
    waterSaved: 2400,
    ecoPoints: 850,
  },
  {
    id: 3,
    username: "john_sustainable",
    email: "john@example.com",
    password: "user123",
    role: "user",
    name: "John Doe",
    profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40",
    bio: "Sustainable fashion enthusiast and community builder",
    location: "Austin, TX",
    badges: ["eco-warrior", "community-leader"],
    itemsCount: 12,
    exchangesCount: 8,
    joinDate: "2024-03-05",
    carbonSaved: 98,
    waterSaved: 1800,
    ecoPoints: 640,
  },
];

export const mockItems: Item[] = [
  {
    id: 1,
    title: "Vintage Denim Jacket",
    description: "Classic 90s denim jacket in excellent condition. Perfect for layering and sustainable fashion.",
    category: "outerwear",
    condition: "like-new",
    size: "M",
    brand: "Levi's",
    material: "denim",
    estimatedMRP: 2500,
    images: ["https://images.unsplash.com/photo-1544441893-675973e31985?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"],
    userId: 2,
    userName: "Sarah Johnson",
    status: "available",
    createdAt: "2024-03-15T10:00:00Z",
    tags: ["vintage", "denim", "jacket", "sustainable"],
    preferences: "Looking for cozy sweaters or vintage accessories",
    ecoPointsValue: calculateEcoPoints("denim", "like-new"),
    environmentalImpact: calculateEnvironmentalImpact("outerwear", "denim", "like-new"),
  },
  {
    id: 2,
    title: "Vintage Sundress",
    description: "Beautiful floral sundress perfect for summer. Sustainable and stylish.",
    category: "dresses",
    condition: "good",
    size: "S",
    brand: "Vintage Brand",
    material: "cotton",
    estimatedMRP: 1800,
    images: ["https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"],
    userId: 3,
    userName: "John Doe",
    status: "available",
    createdAt: "2024-03-14T14:30:00Z",
    tags: ["vintage", "summer", "dress", "floral"],
    preferences: "Open to swaps with jackets or accessories",
    ecoPointsValue: calculateEcoPoints("cotton", "good"),
    environmentalImpact: calculateEnvironmentalImpact("dresses", "cotton", "good"),
  },
  {
    id: 3,
    title: "Leather Jacket",
    description: "High-quality leather jacket with a timeless design. Well-maintained and ready for a new owner.",
    category: "outerwear",
    condition: "good",
    size: "L",
    brand: "Schott NYC",
    material: "leather",
    estimatedMRP: 8500,
    images: ["https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"],
    userId: 2,
    userName: "Sarah Johnson",
    status: "exchanging",
    createdAt: "2024-03-13T09:15:00Z",
    tags: ["leather", "classic", "jacket", "timeless"],
    preferences: "Looking for designer bags or premium accessories",
    ecoPointsValue: calculateEcoPoints("leather", "good"),
    environmentalImpact: calculateEnvironmentalImpact("outerwear", "leather", "good"),
  },
  {
    id: 4,
    title: "Cozy Knit Sweater",
    description: "Soft and comfortable knit sweater perfect for fall. Made from sustainable materials.",
    category: "tops",
    condition: "like-new",
    size: "M",
    brand: "Patagonia",
    material: "wool",
    estimatedMRP: 3200,
    images: ["https://images.unsplash.com/photo-1434389677669-e08b4cac3105?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"],
    userId: 3,
    userName: "John Doe",
    status: "available",
    createdAt: "2024-03-12T16:45:00Z",
    tags: ["knit", "sweater", "cozy", "sustainable"],
    preferences: "Interested in outdoor gear or casual wear",
    ecoPointsValue: calculateEcoPoints("wool", "like-new"),
    environmentalImpact: calculateEnvironmentalImpact("tops", "wool", "like-new"),
  },
  {
    id: 5,
    title: "Designer Handbag",
    description: "Elegant designer handbag in pristine condition. Perfect for special occasions and daily use.",
    category: "accessories",
    condition: "like-new",
    size: "One Size",
    brand: "Coach",
    material: "leather",
    estimatedMRP: 12000,
    images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"],
    userId: 2,
    userName: "Sarah Johnson",
    status: "available",
    createdAt: "2024-03-11T11:20:00Z",
    tags: ["designer", "handbag", "luxury", "accessories"],
    preferences: "Looking for vintage jewelry or luxury scarves",
    ecoPointsValue: calculateEcoPoints("leather", "like-new"),
    environmentalImpact: calculateEnvironmentalImpact("accessories", "leather", "like-new"),
  },
  {
    id: 6,
    title: "Athletic Sneakers",
    description: "High-performance running shoes in great condition. Perfect for fitness enthusiasts.",
    category: "shoes",
    condition: "good",
    size: "9",
    brand: "Nike",
    material: "polyester",
    estimatedMRP: 4500,
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"],
    userId: 3,
    userName: "John Doe",
    status: "available",
    createdAt: "2024-03-10T08:30:00Z",
    tags: ["athletic", "sneakers", "running", "fitness"],
    preferences: "Looking for workout gear or casual shoes",
    ecoPointsValue: calculateEcoPoints("polyester", "good"),
    environmentalImpact: calculateEnvironmentalImpact("shoes", "polyester", "good"),
  },
  {
    id: 7,
    title: "Vintage Jeans",
    description: "Classic vintage jeans with perfect fit. A timeless piece for any wardrobe.",
    category: "bottoms",
    condition: "good",
    size: "32",
    brand: "Wrangler",
    material: "denim",
    estimatedMRP: 2800,
    images: ["https://images.unsplash.com/photo-1541099649105-f69ad21f3246?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"],
    userId: 2,
    userName: "Sarah Johnson",
    status: "exchanged",
    createdAt: "2024-03-09T13:45:00Z",
    tags: ["vintage", "jeans", "classic", "denim"],
    preferences: "Traded for designer accessories",
    ecoPointsValue: calculateEcoPoints("denim", "good"),
    environmentalImpact: calculateEnvironmentalImpact("bottoms", "denim", "good"),
  },
  {
    id: 8,
    title: "Silk Blouse",
    description: "Elegant silk blouse perfect for professional settings. Sustainable luxury fashion.",
    category: "tops",
    condition: "like-new",
    size: "S",
    brand: "Banana Republic",
    material: "silk",
    estimatedMRP: 4200,
    images: ["https://images.unsplash.com/photo-1564257577-267bd7d7b5c8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"],
    userId: 3,
    userName: "John Doe",
    status: "available",
    createdAt: "2024-03-08T10:15:00Z",
    tags: ["silk", "blouse", "professional", "elegant"],
    preferences: "Looking for formal wear or professional attire",
    ecoPointsValue: calculateEcoPoints("silk", "like-new"),
    environmentalImpact: calculateEnvironmentalImpact("tops", "silk", "like-new"),
  },
];

// Dynamic notification system data
export const mockNotifications = [
  {
    id: 1,
    type: "exchange_request",
    title: "New Exchange Request",
    message: "John Doe wants to exchange your Vintage Denim Jacket for his Vintage Sundress",
    itemId: 1,
    fromUserId: 3,
    fromUserName: "John Doe",
    timestamp: "2024-03-15T14:30:00Z",
    read: false,
  },
  {
    id: 2,
    type: "exchange_request",
    title: "New Exchange Request",
    message: "Sarah Johnson wants to exchange your Athletic Sneakers for her Designer Handbag",
    itemId: 6,
    fromUserId: 2,
    fromUserName: "Sarah Johnson",
    timestamp: "2024-03-15T13:45:00Z",
    read: false,
  },
  {
    id: 3,
    type: "exchange_approved",
    title: "Exchange Approved",
    message: "Your exchange request for the Cozy Knit Sweater has been approved!",
    itemId: 4,
    fromUserId: 3,
    fromUserName: "John Doe",
    timestamp: "2024-03-15T12:15:00Z",
    read: true,
  },
];

export const mockExchanges: Exchange[] = [
  {
    id: 1,
    requesterId: 3,
    requesterName: "John Doe",
    ownerId: 2,
    ownerName: "Sarah Johnson",
    requestedItemId: 1,
    requestedItemTitle: "Vintage Denim Jacket",
    offeredItemId: 2,
    offeredItemTitle: "Vintage Sundress",
    status: "pending",
    message: "I love this jacket! Would you be interested in trading for my vintage sundress?",
    createdAt: "2024-03-15T12:00:00Z",
    updatedAt: "2024-03-15T12:00:00Z",
  },
  {
    id: 2,
    requesterId: 2,
    requesterName: "Sarah Johnson",
    ownerId: 3,
    ownerName: "John Doe",
    requestedItemId: 4,
    requestedItemTitle: "Cozy Knit Sweater",
    offeredItemId: 3,
    offeredItemTitle: "Leather Jacket",
    status: "completed",
    message: "Great exchange! Thank you for the beautiful sweater.",
    createdAt: "2024-03-10T09:00:00Z",
    updatedAt: "2024-03-12T15:00:00Z",
  },
];

export const mockBadges: Badge[] = [
  {
    id: 1,
    name: "Eco Warrior",
    description: "Completed 10 sustainable exchanges",
    icon: "🌱",
    color: "#10B981",
    criteria: { exchanges: 10 },
    rarity: "common",
  },
  {
    id: 2,
    name: "Sustainability Champion",
    description: "Saved 100kg of CO2 through exchanges",
    icon: "🏆",
    color: "#F59E0B",
    criteria: { carbonSaved: 100 },
    rarity: "rare",
  },
  {
    id: 3,
    name: "Community Leader",
    description: "Helped 50 community members",
    icon: "👥",
    color: "#0D9488",
    criteria: { helpedMembers: 50 },
    rarity: "uncommon",
  },
  {
    id: 4,
    name: "Early Adopter",
    description: "One of the first 100 platform members",
    icon: "⭐",
    color: "#8B5CF6",
    criteria: { joinDate: "2024-02-01" },
    rarity: "epic",
  },
];

export const platformStats = {
  totalUsers: 1247,
  totalItems: 3456,
  totalExchanges: 1892,
  carbonSaved: 45.2,
  waterSaved: 89000,
  wasteReduced: 234,
};

// Comprehensive Rewards Catalog
export const mockRewards: Reward[] = [
  // Food & Beverages
  {
    id: 1,
    brand: "Starbucks",
    title: "Free Coffee",
    description: "Get a free coffee or tea of your choice",
    pointsRequired: 200,
    couponCode: "REWEAR-SB200",
    expiryDate: "2024-12-31",
    category: "food",
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    termsAndConditions: "Valid at participating stores. One per customer. Cannot be combined with other offers.",
    isActive: true,
  },
  {
    id: 2,
    brand: "Domino's",
    title: "20% Off Pizza",
    description: "Get 20% off your next pizza order",
    pointsRequired: 300,
    couponCode: "REWEAR-DOM20",
    expiryDate: "2024-12-31",
    category: "food",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    termsAndConditions: "Valid for online orders only. Minimum order value applies.",
    isActive: true,
  },
  {
    id: 3,
    brand: "Subway",
    title: "Free 6-inch Sub",
    description: "Get any 6-inch sub for free with purchase of a drink",
    pointsRequired: 400,
    couponCode: "REWEAR-SUB6",
    expiryDate: "2024-12-31",
    category: "food",
    image: "https://images.unsplash.com/photo-1553909489-cd47e0ef937f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    termsAndConditions: "Valid at participating locations. Drink purchase required.",
    isActive: true,
  },
  // Fashion
  {
    id: 4,
    brand: "H&M",
    title: "25% Off Entire Purchase",
    description: "Get 25% off your entire purchase at H&M",
    pointsRequired: 500,
    couponCode: "REWEAR-HM25",
    expiryDate: "2024-12-31",
    category: "fashion",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    termsAndConditions: "Valid in-store and online. Cannot be combined with other promotions.",
    isActive: true,
  },
  {
    id: 5,
    brand: "Zara",
    title: "30% Off New Collection",
    description: "Get 30% off items from the new collection",
    pointsRequired: 600,
    couponCode: "REWEAR-ZAR30",
    expiryDate: "2024-12-31",
    category: "fashion",
    image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    termsAndConditions: "Valid on selected items only. Subject to availability.",
    isActive: true,
  },
  {
    id: 6,
    brand: "Nike",
    title: "Free Shipping + 15% Off",
    description: "Get free shipping and 15% off your Nike order",
    pointsRequired: 450,
    couponCode: "REWEAR-NIKE15",
    expiryDate: "2024-12-31",
    category: "fashion",
    image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    termsAndConditions: "Valid for online orders. Minimum purchase required.",
    isActive: true,
  },
  // Lifestyle
  {
    id: 7,
    brand: "Uber",
    title: "Free Ride Credit",
    description: "Get $10 credit for your next Uber ride",
    pointsRequired: 350,
    couponCode: "REWEAR-UBER10",
    expiryDate: "2024-12-31",
    category: "lifestyle",
    image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    termsAndConditions: "Valid for new and existing users. Cannot be combined with other promotions.",
    isActive: true,
  },
  {
    id: 8,
    brand: "Spotify",
    title: "3 Months Premium",
    description: "Get 3 months of Spotify Premium for free",
    pointsRequired: 800,
    couponCode: "REWEAR-SPOT3M",
    expiryDate: "2024-12-31",
    category: "lifestyle",
    image: "https://images.unsplash.com/photo-1611339555312-e607c8352fd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    termsAndConditions: "Valid for new subscribers only. Auto-renewal applies.",
    isActive: true,
  },
  {
    id: 9,
    brand: "Amazon",
    title: "Free Prime Shipping",
    description: "Get free Prime shipping on your next order",
    pointsRequired: 250,
    couponCode: "REWEAR-PRIME",
    expiryDate: "2024-12-31",
    category: "lifestyle",
    image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    termsAndConditions: "Valid for Prime-eligible items only. One-time use.",
    isActive: true,
  },
  // Entertainment
  {
    id: 10,
    brand: "Netflix",
    title: "1 Month Free",
    description: "Get one month of Netflix subscription for free",
    pointsRequired: 700,
    couponCode: "REWEAR-NFLX1M",
    expiryDate: "2024-12-31",
    category: "entertainment",
    image: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    termsAndConditions: "Valid for new subscribers only. Credit card required.",
    isActive: true,
  },
  {
    id: 11,
    brand: "Cinema",
    title: "Free Movie Tickets",
    description: "Get 2 free movie tickets at participating cinemas",
    pointsRequired: 600,
    couponCode: "REWEAR-CINEMA2",
    expiryDate: "2024-12-31",
    category: "entertainment",
    image: "https://images.unsplash.com/photo-1489599904593-130f2dbf5b3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    termsAndConditions: "Valid at participating theaters. Subject to availability.",
    isActive: true,
  },
  {
    id: 12,
    brand: "Steam",
    title: "Gaming Credit",
    description: "Get $15 credit for your Steam wallet",
    pointsRequired: 550,
    couponCode: "REWEAR-STEAM15",
    expiryDate: "2024-12-31",
    category: "entertainment",
    image: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    termsAndConditions: "Valid for Steam store purchases only. Non-refundable.",
    isActive: true,
  },
];

// User redemptions data
export const mockRedemptions: Redemption[] = [
  {
    id: 1,
    userId: 2,
    rewardId: 1,
    pointsSpent: 200,
    couponCode: "REWEAR-SB200-001",
    redeemedAt: "2024-03-10T15:30:00Z",
    status: "used",
  },
  {
    id: 2,
    userId: 2,
    rewardId: 4,
    pointsSpent: 500,
    couponCode: "REWEAR-HM25-002",
    redeemedAt: "2024-03-05T10:45:00Z",
    status: "active",
  },
  {
    id: 3,
    userId: 3,
    rewardId: 7,
    pointsSpent: 350,
    couponCode: "REWEAR-UBER10-003",
    redeemedAt: "2024-03-08T18:20:00Z",
    status: "used",
  },
];

// Tier system for eco points
export const ecoPointTiers = [
  { name: "Bronze", minPoints: 0, maxPoints: 499, color: "#CD7F32", benefits: ["Basic rewards access", "5% bonus on exchanges"] },
  { name: "Silver", minPoints: 500, maxPoints: 999, color: "#C0C0C0", benefits: ["Premium rewards access", "10% bonus on exchanges", "Priority support"] },
  { name: "Gold", minPoints: 1000, maxPoints: 1999, color: "#FFD700", benefits: ["Exclusive rewards", "15% bonus on exchanges", "Early access to new features"] },
  { name: "Platinum", minPoints: 2000, maxPoints: 999999, color: "#E5E4E2", benefits: ["All rewards access", "20% bonus on exchanges", "VIP support", "Special events"] },
];

export function getUserTier(points: number) {
  return ecoPointTiers.find(tier => points >= tier.minPoints && points <= tier.maxPoints) || ecoPointTiers[0];
}
