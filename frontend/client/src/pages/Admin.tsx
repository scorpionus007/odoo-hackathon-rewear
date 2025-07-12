import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { StatsCard } from '@/components/common/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  ShirtIcon, 
  Recycle, 
  Leaf,
  Settings,
  Shield,
  Activity,
  TrendingUp,
  AlertCircle,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  Award
} from 'lucide-react';
import { mockUsers, mockItems, mockExchanges, mockBadges, platformStats } from '@/data/mockData';
import { User, Item, Exchange, Badge as BadgeType } from '@shared/schema';
import { formatDate, formatTimeAgo } from '@/utils/helpers';
import { useToast } from '@/hooks/use-toast';

export const Admin: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [badges, setBadges] = useState<BadgeType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    if (user && isAdmin) {
      // Load all data
      const savedItems = JSON.parse(localStorage.getItem('rewear_items') || '[]');
      const allItems = [...mockItems, ...savedItems];
      
      setUsers(mockUsers);
      setItems(allItems);
      setExchanges(mockExchanges);
      setBadges(mockBadges);
    }
  }, [user, isAdmin]);

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You don't have permission to access the admin panel.
          </p>
          <Button onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Users',
      value: users.length,
      icon: Users,
      color: 'text-primary',
      description: `+${Math.floor(users.length * 0.1)} this month`
    },
    {
      title: 'Total Items',
      value: items.length,
      icon: ShirtIcon,
      color: 'text-secondary',
      description: `+${Math.floor(items.length * 0.15)} this week`
    },
    {
      title: 'Total Exchanges',
      value: exchanges.length,
      icon: Recycle,
      color: 'text-accent',
      description: `+${Math.floor(exchanges.length * 0.2)} this week`
    },
    {
      title: 'CO₂ Saved',
      value: `${platformStats.carbonSaved}T`,
      icon: Leaf,
      color: 'text-green-600',
      description: 'Environmental impact'
    }
  ];

  const handleDeleteUser = (userId: number) => {
    setUsers(users.filter(u => u.id !== userId));
    toast({
      title: 'User deleted',
      description: 'The user has been removed from the platform.',
    });
  };

  const handleDeleteItem = (itemId: number) => {
    const updatedItems = items.filter(item => item.id !== itemId);
    setItems(updatedItems);
    
    // Update localStorage
    const savedItems = JSON.parse(localStorage.getItem('rewear_items') || '[]');
    const filteredSavedItems = savedItems.filter((item: Item) => item.id !== itemId);
    localStorage.setItem('rewear_items', JSON.stringify(filteredSavedItems));
    
    toast({
      title: 'Item deleted',
      description: 'The item has been removed from the platform.',
    });
  };

  const handleToggleUserStatus = (userId: number) => {
    setUsers(users.map(u => 
      u.id === userId 
        ? { ...u, role: u.role === 'user' ? 'admin' : 'user' }
        : u
    ));
    
    toast({
      title: 'User status updated',
      description: 'The user role has been changed.',
    });
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const recentItems = items.slice(-10).reverse();
  const recentExchanges = exchanges.slice(-5).reverse();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your sustainable fashion platform</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">System Status: Online</span>
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
            description={stat.description}
          />
        ))}
      </div>

      {/* Admin Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <Plus className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">New item listed</div>
                      <div className="text-sm text-gray-500">Vintage Denim Jacket by Sarah Johnson</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center">
                      <Recycle className="w-4 h-4 text-secondary" />
                    </div>
                    <div>
                      <div className="font-medium">Exchange completed</div>
                      <div className="text-sm text-gray-500">Between John and Sarah</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <div className="font-medium">New user registered</div>
                      <div className="text-sm text-gray-500">Welcome to the community!</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Platform Health */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Platform Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Active Users</span>
                    <span className="font-semibold">{users.filter(u => u.role === 'user').length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Available Items</span>
                    <span className="font-semibold">{items.filter(i => i.status === 'available').length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Pending Exchanges</span>
                    <span className="font-semibold">{exchanges.filter(e => e.status === 'pending').length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total CO₂ Saved</span>
                    <span className="font-semibold text-green-600">{platformStats.carbonSaved}T</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  User Management
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Button variant="outline" size="icon">
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={user.profileImage} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        <div className="text-sm text-gray-500">
                          {user.itemsCount} items • {user.exchangesCount} exchanges
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleUserStatus(user.id)}
                      >
                        <Shield className="w-4 h-4 mr-1" />
                        {user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Items Tab */}
        <TabsContent value="items" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShirtIcon className="w-5 h-5 mr-2" />
                Item Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{item.title}</div>
                      <div className="text-sm text-gray-500">
                        by {item.userName} • {formatTimeAgo(item.createdAt)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.category} • {item.condition} • {item.size}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={item.status === 'available' ? 'default' : 'secondary'}>
                        {item.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Badges Tab */}
        <TabsContent value="badges" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Award className="w-5 h-5 mr-2" />
                  Badge Management
                </CardTitle>
                <Button className="rewear-button-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Badge
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {badges.map((badge) => (
                  <Card key={badge.id} className="p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                        style={{ backgroundColor: badge.color + '20' }}
                      >
                        {badge.icon}
                      </div>
                      <div>
                        <div className="font-medium">{badge.name}</div>
                        <Badge variant="outline" className="text-xs">
                          {badge.rarity}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{badge.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {Object.values(badge.criteria)[0]} requirement
                      </span>
                      <div className="flex space-x-1">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
