import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { 
  mockRewards, 
  mockRedemptions, 
  ecoPointTiers, 
  getUserTier,
  type Reward,
  type Redemption
} from '@/data/mockData';
import { 
  Gift, 
  Trophy, 
  Star, 
  Crown, 
  Sparkles, 
  Coffee,
  Pizza,
  Shirt,
  Car,
  Music,
  ShoppingBag,
  Gamepad2,
  Film,
  Zap
} from 'lucide-react';

const categoryIcons = {
  food: Coffee,
  fashion: Shirt,
  lifestyle: Car,
  entertainment: Music,
};

const tierIcons = {
  Bronze: Trophy,
  Silver: Star,
  Gold: Crown,
  Platinum: Sparkles,
};

export const Rewards: React.FC = () => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [userRedemptions, setUserRedemptions] = useState<Redemption[]>([]);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [showRedeemDialog, setShowRedeemDialog] = useState(false);

  useEffect(() => {
    if (user) {
      const userRedems = mockRedemptions.filter(r => r.userId === user.id);
      setUserRedemptions(userRedems);
    }
  }, [user]);

  const userTier = getUserTier(user?.ecoPoints || 0);
  const nextTier = ecoPointTiers.find(tier => tier.minPoints > (user?.ecoPoints || 0));
  const progressToNextTier = nextTier 
    ? ((user?.ecoPoints || 0) - userTier.minPoints) / (nextTier.minPoints - userTier.minPoints) * 100
    : 100;

  const filteredRewards = selectedCategory === 'all' 
    ? mockRewards 
    : mockRewards.filter(reward => reward.category === selectedCategory);

  const canRedeem = (reward: Reward) => {
    return user && user.ecoPoints >= reward.pointsRequired;
  };

  const handleRedeem = (reward: Reward) => {
    if (!user || !canRedeem(reward)) return;

    // Simulate redemption
    const newRedemption: Redemption = {
      id: Date.now(),
      userId: user.id,
      rewardId: reward.id,
      pointsSpent: reward.pointsRequired,
      couponCode: `${reward.couponCode}-${Date.now()}`,
      redeemedAt: new Date().toISOString(),
      status: 'active',
    };

    setUserRedemptions([...userRedemptions, newRedemption]);
    
    // Update user points in localStorage
    const updatedUser = { ...user, ecoPoints: user.ecoPoints - reward.pointsRequired };
    localStorage.setItem('rewear_user', JSON.stringify(updatedUser));
    
    toast({
      title: "Reward Redeemed!",
      description: `You've successfully redeemed ${reward.title}. Your coupon code is: ${newRedemption.couponCode}`,
    });
    
    setShowRedeemDialog(false);
    setSelectedReward(null);
  };

  const getRewardIcon = (category: string) => {
    switch(category) {
      case 'food': return <Coffee className="w-5 h-5" />;
      case 'fashion': return <Shirt className="w-5 h-5" />;
      case 'lifestyle': return <Car className="w-5 h-5" />;
      case 'entertainment': return <Film className="w-5 h-5" />;
      default: return <Gift className="w-5 h-5" />;
    }
  };

  const TierIcon = tierIcons[userTier.name as keyof typeof tierIcons];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Eco Rewards</h1>
          <p className="text-gray-600">Redeem your eco points for amazing rewards from our brand partners</p>
        </div>

        {/* User Tier & Points */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TierIcon className="w-6 h-6" style={{ color: userTier.color }} />
                Your Tier: {userTier.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-primary">{user?.ecoPoints || 0} Points</span>
                  <Badge variant="secondary" style={{ backgroundColor: userTier.color + '20', color: userTier.color }}>
                    {userTier.name}
                  </Badge>
                </div>
                {nextTier && (
                  <>
                    <Progress value={progressToNextTier} className="w-full" />
                    <p className="text-sm text-gray-600">
                      {nextTier.minPoints - (user?.ecoPoints || 0)} points to {nextTier.name}
                    </p>
                  </>
                )}
                <div className="space-y-1">
                  <h4 className="font-medium">Your Benefits:</h4>
                  {userTier.benefits.map((benefit, index) => (
                    <p key={index} className="text-sm text-gray-600 flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      {benefit}
                    </p>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Redemptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userRedemptions.length === 0 ? (
                  <p className="text-gray-600">No redemptions yet. Start redeeming rewards!</p>
                ) : (
                  userRedemptions.slice(0, 3).map((redemption) => {
                    const reward = mockRewards.find(r => r.id === redemption.rewardId);
                    return (
                      <div key={redemption.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{reward?.title}</p>
                          <p className="text-sm text-gray-600">{redemption.couponCode}</p>
                        </div>
                        <Badge variant={redemption.status === 'active' ? 'default' : 'secondary'}>
                          {redemption.status}
                        </Badge>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rewards Catalog */}
        <Card>
          <CardHeader>
            <CardTitle>Rewards Catalog</CardTitle>
            <div className="flex flex-wrap gap-2 mt-4">
              <Button 
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                onClick={() => setSelectedCategory('all')}
                size="sm"
              >
                All
              </Button>
              {['food', 'fashion', 'lifestyle', 'entertainment'].map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(category)}
                  size="sm"
                  className="capitalize"
                >
                  {getRewardIcon(category)}
                  {category}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredRewards.map((reward) => (
                <Card key={reward.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-gray-100 relative">
                    <img 
                      src={reward.image} 
                      alt={reward.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="bg-white/90">
                        {reward.pointsRequired} pts
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {getRewardIcon(reward.category)}
                        <span className="font-medium text-sm text-gray-600">{reward.brand}</span>
                      </div>
                      <h3 className="font-semibold">{reward.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{reward.description}</p>
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-lg font-bold text-primary">{reward.pointsRequired} pts</span>
                        <Dialog open={showRedeemDialog && selectedReward?.id === reward.id} onOpenChange={setShowRedeemDialog}>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              disabled={!canRedeem(reward)}
                              onClick={() => setSelectedReward(reward)}
                            >
                              {canRedeem(reward) ? 'Redeem' : 'Need more points'}
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Redeem Reward</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                                <img 
                                  src={reward.image} 
                                  alt={reward.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg">{reward.title}</h3>
                                <p className="text-gray-600">{reward.description}</p>
                              </div>
                              <div className="bg-yellow-50 p-3 rounded-lg">
                                <h4 className="font-medium mb-1">Terms & Conditions:</h4>
                                <p className="text-sm text-gray-600">{reward.termsAndConditions}</p>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-lg font-bold">Cost: {reward.pointsRequired} points</span>
                                <span className="text-sm text-gray-600">Your balance: {user?.ecoPoints || 0} points</span>
                              </div>
                              <Button 
                                className="w-full" 
                                onClick={() => handleRedeem(reward)}
                                disabled={!canRedeem(reward)}
                              >
                                Confirm Redemption
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};