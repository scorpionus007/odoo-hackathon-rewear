import React, { useState, useEffect } from 'react';
import { ItemCard } from '@/components/common/ItemCard';
import { ItemForm } from '@/components/forms/ItemForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, Bell, BellDot } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { mockItems, mockNotifications } from '@/data/mockData';
import { Item } from '@shared/schema';
import { ITEM_CATEGORIES, ITEM_CONDITIONS, SIZES } from '@/utils/constants';
import { useToast } from '@/hooks/use-toast';

export const Items: React.FC = () => {
  const { isLoggedIn, user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [displayedItems, setDisplayedItems] = useState<Item[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCondition, setSelectedCondition] = useState<string>('all');
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const [favoriteItems, setFavoriteItems] = useState<Set<number>>(new Set());
  const [itemsToShow, setItemsToShow] = useState(4);

  useEffect(() => {
    // Load items from localStorage and merge with mock data
    const savedItems = JSON.parse(localStorage.getItem('rewear_items') || '[]');
    const savedFavorites = JSON.parse(localStorage.getItem('rewear_favorites') || '[]');
    const allItems = [...mockItems, ...savedItems];
    setItems(allItems);
    setFilteredItems(allItems);
    setFavoriteItems(new Set(savedFavorites));
  }, []);

  useEffect(() => {
    let filtered = [...items];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Condition filter
    if (selectedCondition !== 'all') {
      filtered = filtered.filter(item => item.condition === selectedCondition);
    }

    // Size filter
    if (selectedSize !== 'all') {
      filtered = filtered.filter(item => item.size === selectedSize);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'condition':
          return a.condition.localeCompare(b.condition);
        default:
          return 0;
      }
    });

    setFilteredItems(filtered);
  }, [items, searchQuery, selectedCategory, selectedCondition, selectedSize, sortBy]);

  const handleAddItemSuccess = () => {
    setShowAddForm(false);
    // Reload items
    const savedItems = JSON.parse(localStorage.getItem('rewear_items') || '[]');
    const allItems = [...mockItems, ...savedItems];
    setItems(allItems);
  };

  useEffect(() => {
    setDisplayedItems(filteredItems.slice(0, itemsToShow));
  }, [filteredItems, itemsToShow]);

  const handleRequestExchange = (item: Item) => {
    if (!isLoggedIn) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to request exchanges",
        variant: "destructive",
      });
      return;
    }

    // Create new exchange request
    const newNotification = {
      id: Date.now(),
      type: "exchange_request",
      title: "New Exchange Request",
      message: `${user?.name} wants to exchange your ${item.title}`,
      itemId: item.id,
      fromUserId: user?.id || 0,
      fromUserName: user?.name || "Unknown User",
      timestamp: new Date().toISOString(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev]);
    
    // Update item status to exchanging
    const updatedItems = items.map(i => 
      i.id === item.id ? { ...i, status: 'exchanging' } : i
    );
    setItems(updatedItems);

    toast({
      title: "Exchange Request Sent",
      description: `Your exchange request for "${item.title}" has been sent!`,
    });

    console.log('Request exchange for:', item);
  };

  const handleViewDetails = (item: Item) => {
    console.log('View details for:', item);
  };

  const handleToggleFavorite = (item: Item) => {
    const newFavorites = new Set(favoriteItems);
    if (newFavorites.has(item.id)) {
      newFavorites.delete(item.id);
      toast({
        title: "Removed from favorites",
        description: `"${item.title}" has been removed from your favorites`,
      });
    } else {
      newFavorites.add(item.id);
      toast({
        title: "Added to favorites",
        description: `"${item.title}" has been added to your favorites`,
      });
    }
    setFavoriteItems(newFavorites);
    localStorage.setItem('rewear_favorites', JSON.stringify(Array.from(newFavorites)));
  };

  const handleLoadMore = () => {
    setItemsToShow(prev => prev + 4);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Browse Items</h1>
        <div className="flex items-center gap-4">
          {isLoggedIn && (
            <>
              {/* Notification Bell */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative"
                >
                  {unreadCount > 0 ? (
                    <BellDot className="w-5 h-5" />
                  ) : (
                    <Bell className="w-5 h-5" />
                  )}
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 w-5 h-5 rounded-full p-0 flex items-center justify-center text-xs">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
                
                {/* Notification Dropdown */}
                {showNotifications && (
                  <Card className="absolute right-0 top-12 w-80 max-h-96 overflow-y-auto z-50 shadow-lg">
                    <CardContent className="p-0">
                      <div className="p-4 border-b">
                        <h3 className="font-semibold">Notifications</h3>
                      </div>
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          No notifications yet
                        </div>
                      ) : (
                        <div className="divide-y">
                          {notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`p-4 hover:bg-gray-50 cursor-pointer ${
                                !notification.read ? 'bg-blue-50' : ''
                              }`}
                              onClick={() => {
                                setNotifications(prev =>
                                  prev.map(n =>
                                    n.id === notification.id ? { ...n, read: true } : n
                                  )
                                );
                              }}
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex-1">
                                  <h4 className="font-medium text-sm">{notification.title}</h4>
                                  <p className="text-xs text-gray-600 mt-1">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-1">
                                    {new Date(notification.timestamp).toLocaleString()}
                                  </p>
                                </div>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
              
              <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
                <DialogTrigger asChild>
                  <Button className="rewear-button-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Item</DialogTitle>
                  </DialogHeader>
                  <ItemForm
                    onSuccess={handleAddItemSuccess}
                    onCancel={() => setShowAddForm(false)}
                  />
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline" className="md:hidden">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {ITEM_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={selectedSize} onValueChange={setSelectedSize}>
                <SelectTrigger>
                  <SelectValue placeholder="Size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sizes</SelectItem>
                  {SIZES.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={selectedCondition} onValueChange={setSelectedCondition}>
                <SelectTrigger>
                  <SelectValue placeholder="Condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Conditions</SelectItem>
                  {ITEM_CONDITIONS.map((condition) => (
                    <SelectItem key={condition.value} value={condition.value}>
                      {condition.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="title">Title A-Z</SelectItem>
                  <SelectItem value="condition">Best Condition</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm text-gray-600 flex items-center">
              {filteredItems.length} items found
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {displayedItems.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            onRequestExchange={handleRequestExchange}
            onViewDetails={handleViewDetails}
            onToggleFavorite={handleToggleFavorite}
            isFavorited={favoriteItems.has(item.id)}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold mb-2">No items found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search or filters to find what you're looking for.
          </p>
          <Button 
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedCondition('all');
              setSelectedSize('all');
            }}
            variant="outline"
          >
            Clear Filters
          </Button>
        </div>
      )}

      {/* Load More Button */}
      {filteredItems.length > itemsToShow && (
        <div className="text-center mt-8">
          <Button 
            variant="outline" 
            size="lg"
            onClick={handleLoadMore}
            className="px-8"
          >
            Load More Items ({filteredItems.length - itemsToShow} remaining)
          </Button>
        </div>
      )}
    </div>
  );
};
