import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  ArrowRightLeft, 
  Check, 
  X, 
  MessageSquare, 
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  Leaf
} from 'lucide-react';
import { mockExchanges } from '@/data/mockData';
import { Exchange } from '@shared/schema';
import { formatTimeAgo, getStatusColor } from '@/utils/helpers';

export const Exchanges: React.FC = () => {
  const { user } = useAuth();
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [pendingExchanges, setPendingExchanges] = useState<Exchange[]>([]);
  const [completedExchanges, setCompletedExchanges] = useState<Exchange[]>([]);
  const [cancelledExchanges, setCancelledExchanges] = useState<Exchange[]>([]);

  useEffect(() => {
    if (user) {
      // Load exchanges for the current user
      const userExchanges = mockExchanges.filter(
        exchange => exchange.requesterId === user.id || exchange.ownerId === user.id
      );
      
      setExchanges(userExchanges);
      setPendingExchanges(userExchanges.filter(ex => ex.status === 'pending'));
      setCompletedExchanges(userExchanges.filter(ex => ex.status === 'completed'));
      setCancelledExchanges(userExchanges.filter(ex => ex.status === 'cancelled'));
    }
  }, [user]);

  const handleAcceptExchange = (exchangeId: number) => {
    const updatedExchanges = exchanges.map(exchange =>
      exchange.id === exchangeId
        ? { ...exchange, status: 'approved' as const, updatedAt: new Date().toISOString() }
        : exchange
    );
    setExchanges(updatedExchanges);
    setPendingExchanges(updatedExchanges.filter(ex => ex.status === 'pending'));
    
    // In a real app, this would update the backend
    console.log('Exchange approved:', exchangeId);
  };

  const handleRejectExchange = (exchangeId: number) => {
    const updatedExchanges = exchanges.map(exchange =>
      exchange.id === exchangeId
        ? { ...exchange, status: 'rejected' as const, updatedAt: new Date().toISOString() }
        : exchange
    );
    setExchanges(updatedExchanges);
    setPendingExchanges(updatedExchanges.filter(ex => ex.status === 'pending'));
    setCancelledExchanges(updatedExchanges.filter(ex => ex.status === 'cancelled' || ex.status === 'rejected'));
    
    console.log('Exchange rejected:', exchangeId);
  };

  const getExchangeStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-blue-100 text-blue-800">Approved</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const renderExchangeCard = (exchange: Exchange) => {
    const isRequester = exchange.requesterId === user?.id;
    const otherUser = isRequester ? exchange.ownerName : exchange.requesterName;
    const otherUserAvatar = isRequester ? 
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face' :
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face';

    return (
      <Card key={exchange.id} className="mb-4">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Avatar className="w-10 h-10">
                <AvatarImage src={otherUserAvatar} alt={otherUser} />
                <AvatarFallback>{otherUser.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{otherUser}</div>
                <div className="text-sm text-gray-500">
                  {formatTimeAgo(exchange.createdAt)}
                </div>
              </div>
            </div>
            {getExchangeStatusBadge(exchange.status)}
          </div>

          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="flex items-center space-x-2">
              <img
                src="https://images.unsplash.com/photo-1544441893-675973e31985?w=60&h=60&fit=crop"
                alt="Your item"
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div>
                <div className="font-medium">{exchange.requestedItemTitle}</div>
                <div className="text-sm text-gray-500">Size M</div>
              </div>
            </div>
            
            <ArrowRightLeft className="w-5 h-5 text-gray-400" />
            
            <div className="flex items-center space-x-2">
              <img
                src="https://images.unsplash.com/photo-1551028719-00167b16eac5?w=60&h=60&fit=crop"
                alt="Their item"
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div>
                <div className="font-medium">{exchange.offeredItemTitle}</div>
                <div className="text-sm text-gray-500">Size M</div>
              </div>
            </div>
          </div>

          {exchange.message && (
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-700">{exchange.message}</p>
            </div>
          )}

          {exchange.status === 'pending' && !isRequester && (
            <div className="flex space-x-3">
              <Button
                onClick={() => handleAcceptExchange(exchange.id)}
                className="rewear-button-primary"
              >
                <Check className="w-4 h-4 mr-2" />
                Accept
              </Button>
              <Button
                onClick={() => handleRejectExchange(exchange.id)}
                variant="outline"
              >
                <X className="w-4 h-4 mr-2" />
                Decline
              </Button>
              <Button variant="outline">
                <MessageSquare className="w-4 h-4 mr-2" />
                Message
              </Button>
            </div>
          )}

          {exchange.status === 'completed' && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Leaf className="w-4 h-4 text-primary" />
                <span className="text-sm text-gray-600">25kg CO₂ saved</span>
              </div>
              <Button variant="outline" size="sm">
                Rate Exchange
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please log in to view your exchanges</h2>
          <Button>Go to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Exchanges</h1>
      
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>Pending ({pendingExchanges.length})</span>
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4" />
            <span>Completed ({completedExchanges.length})</span>
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="flex items-center space-x-2">
            <XCircle className="w-4 h-4" />
            <span>Cancelled ({cancelledExchanges.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <div className="space-y-4">
            {pendingExchanges.length > 0 ? (
              pendingExchanges.map(renderExchangeCard)
            ) : (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No pending exchanges</h3>
                <p className="text-gray-600">
                  Your exchange requests will appear here once you start trading.
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <div className="space-y-4">
            {completedExchanges.length > 0 ? (
              completedExchanges.map(renderExchangeCard)
            ) : (
              <div className="text-center py-12">
                <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No completed exchanges</h3>
                <p className="text-gray-600">
                  Your completed exchanges will appear here.
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="cancelled" className="mt-6">
          <div className="space-y-4">
            {cancelledExchanges.length > 0 ? (
              cancelledExchanges.map(renderExchangeCard)
            ) : (
              <div className="text-center py-12">
                <XCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No cancelled exchanges</h3>
                <p className="text-gray-600">
                  Cancelled or rejected exchanges will appear here.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
