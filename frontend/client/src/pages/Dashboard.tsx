import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { StatsCard } from '@/components/common/StatsCard';
import { ItemCard } from '@/components/common/ItemCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  ShirtIcon, 
  Recycle, 
  Leaf, 
  Award,
  Plus,
  Calendar,
  Edit,
  Trash2,
  User
} from 'lucide-react';
import { mockItems, mockExchanges } from '@/data/mockData';
import { Item, Exchange } from '@shared/schema';
import { formatTimeAgo, formatDate } from '@/utils/helpers';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [userItems, setUserItems] = useState<Item[]>([]);
  const [userExchanges, setUserExchanges] = useState<Exchange[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      // Load user's items
      const savedItems = JSON.parse(localStorage.getItem('rewear_items') || '[]');
      const allItems = [...mockItems, ...savedItems];
      const userItemsFiltered = allItems.filter(item => item.userId === user.id);
      setUserItems(userItemsFiltered);

      // Load user's exchanges
      const userExchangesFiltered = mockExchanges.filter(
        exchange => exchange.requesterId === user.id || exchange.ownerId === user.id
      );
      setUserExchanges(userExchangesFiltered);

      // Generate recent activity
      const activity = [
        {
          type: 'item_added',
          title: 'Listed new item',
          description: 'Vintage Denim Jacket',
          time: '2 hours ago',
          icon: Plus,
          color: 'text-primary'
        },
        {
          type: 'exchange_completed',
          title: 'Exchange completed',
          description: 'Leather Boots with @sarah_eco',
          time: '1 day ago',
          icon: Recycle,
          color: 'text-secondary'
        },
        {
          type: 'badge_earned',
          title: 'Badge earned',
          description: 'Eco Warrior',
          time: '3 days ago',
          icon: Award,
          color: 'text-accent'
        }
      ];
      setRecentActivity(activity);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please log in to view your dashboard</h2>
          <Button>Go to Login</Button>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Items Listed',
      value: userItems.length,
      icon: ShirtIcon,
      color: 'text-primary'
    },
    {
      title: 'Exchanges',
      value: userExchanges.length,
      icon: Recycle,
      color: 'text-secondary'
    },
    {
      title: 'CO₂ Saved',
      value: `${user.carbonSaved}kg`,
      icon: Leaf,
      color: 'text-accent'
    },
    {
      title: 'Badges Earned',
      value: user.badges.length,
      icon: Award,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center space-x-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={user.profileImage} alt={user.name} />
            <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold">{user.name}</div>
            <div className="text-sm text-gray-500">
              Member since {formatDate(user.joinDate)}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>

      {/* Profile Summary */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="w-5 h-5 mr-2" />
            Profile Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">About</h3>
              <p className="text-gray-600 mb-4">{user.bio}</p>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>Joined {formatDate(user.joinDate)}</span>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Badges</h3>
              <div className="flex flex-wrap gap-2">
                {user.badges.map((badge, index) => (
                  <Badge key={index} variant="secondary">
                    {badge}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity & My Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.color === 'text-primary' ? 'bg-primary/10' : 
                    activity.color === 'text-secondary' ? 'bg-secondary/10' : 
                    'bg-accent/10'
                  }`}>
                    <activity.icon className={`w-4 h-4 ${activity.color}`} />
                  </div>
                  <div>
                    <div className="font-medium">{activity.title}</div>
                    <div className="text-sm text-gray-500">
                      {activity.description} • {activity.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* My Items */}
        <Card>
          <CardHeader>
            <CardTitle>My Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userItems.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center space-x-3">
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <div className="font-medium">{item.title}</div>
                    <div className="text-sm text-gray-500">
                      {item.size} • {item.condition} • {item.status}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="icon">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {userItems.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <ShirtIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>You haven't listed any items yet</p>
                  <Button className="mt-4" variant="outline">
                    Add Your First Item
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Environmental Impact */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Leaf className="w-5 h-5 mr-2 text-primary" />
            Environmental Impact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {user.carbonSaved}kg
              </div>
              <div className="text-gray-600">CO₂ Saved</div>
              <div className="text-sm text-gray-500 mt-1">
                Equivalent to driving {(user.carbonSaved * 2.31).toFixed(0)} miles
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary mb-2">
                {user.waterSaved}L
              </div>
              <div className="text-gray-600">Water Saved</div>
              <div className="text-sm text-gray-500 mt-1">
                Equivalent to {Math.floor(user.waterSaved / 8)} glasses of water
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent mb-2">
                {userExchanges.length}
              </div>
              <div className="text-gray-600">Exchanges Completed</div>
              <div className="text-sm text-gray-500 mt-1">
                Helping build a sustainable community
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
