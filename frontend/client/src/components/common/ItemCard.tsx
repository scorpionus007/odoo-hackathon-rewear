import React, { useState } from 'react';
import { Item } from '@shared/schema';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Leaf, Heart, Eye, ArrowLeft, MapPin, Calendar, Tag, User } from 'lucide-react';
import { formatCarbonSaved, getStatusColor, formatDate } from '@/utils/helpers';

interface ItemCardProps {
  item: Item;
  onRequestExchange?: (item: Item) => void;
  onViewDetails?: (item: Item) => void;
  onToggleFavorite?: (item: Item) => void;
  isFavorited?: boolean;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  onRequestExchange,
  onViewDetails,
  onToggleFavorite,
  isFavorited = false,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showImageZoom, setShowImageZoom] = useState(false);

  const handleCardClick = () => {
    if (item.status === 'available') {
      setIsFlipped(!isFlipped);
    }
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowImageZoom(true);
  };

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite?.(item);
  };

  const handleRequestExchange = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRequestExchange?.(item);
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewDetails?.(item);
  };

  return (
    <>
      <Card className={`rewear-card overflow-hidden group cursor-pointer transition-all duration-500 ${
        item.status === 'exchanged' ? 'opacity-60' : 'hover:shadow-lg'
      }`}>
        <div className="relative w-full h-80" style={{ 
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transition: 'transform 0.6s'
        }}>
          {/* Front Side */}
          <div className="absolute inset-0 w-full h-full" style={{ backfaceVisibility: 'hidden' }}>
            <div className="relative">
              <img
                src={item.images[0]}
                alt={item.title}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                onClick={handleImageClick}
              />
              <div className="absolute top-2 right-2 flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-white/80 hover:bg-white"
                  onClick={handleHeartClick}
                >
                  <Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-white/80 hover:bg-white"
                  onClick={handleImageClick}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
              {item.status === 'exchanged' && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <Badge variant="secondary" className="text-lg px-4 py-2">
                    EXCHANGED
                  </Badge>
                </div>
              )}
            </div>
            
            <CardContent className="p-4" onClick={handleCardClick}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg truncate">{item.title}</h3>
                <Badge variant={item.status === 'available' ? 'default' : 'secondary'}>
                  {item.status}
                </Badge>
              </div>
              
              <p className="text-sm text-gray-600 mb-2">
                {item.size} • {item.condition}
              </p>
              
              <p className="text-sm text-gray-600 mb-2">{item.brand}</p>
              
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-1">
                  <Leaf className="w-4 h-4 text-primary" />
                  <span className="text-sm text-gray-600">
                    {formatCarbonSaved(item.environmentalImpact.carbonSaved)} saved
                  </span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  className="flex-1 rewear-button-primary"
                  onClick={handleRequestExchange}
                  disabled={item.status !== 'available'}
                >
                  {item.status === 'available' ? 'Request Exchange' : 'View Details'}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleViewDetails}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </div>

          {/* Back Side */}
          <div className="absolute inset-0 w-full h-full p-4 bg-gradient-to-br from-primary/10 to-secondary/10" 
               style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCardClick}
                  className="hover:bg-white/20"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleHeartClick}
                  className="hover:bg-white/20"
                >
                  <Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
              </div>
              
              <div className="flex-1 space-y-3">
                <p className="text-sm text-gray-700">{item.description}</p>
                
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">By {item.userName}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    Listed {formatDate(item.createdAt)}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {item.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <div className="bg-white/30 rounded-lg p-3">
                  <h4 className="font-medium text-sm mb-2">Environmental Impact</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Carbon Saved:</span>
                      <span>{item.environmentalImpact.carbonSaved} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Water Saved:</span>
                      <span>{item.environmentalImpact.waterSaved} L</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Waste Reduced:</span>
                      <span>{item.environmentalImpact.wasteReduced} kg</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <Button
                  className="w-full rewear-button-primary"
                  onClick={handleRequestExchange}
                  disabled={item.status !== 'available'}
                >
                  {item.status === 'available' ? 'Request Exchange' : 'Not Available'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Image Zoom Dialog */}
      <Dialog open={showImageZoom} onOpenChange={setShowImageZoom}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{item.title}</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            <img
              src={item.images[0]}
              alt={item.title}
              className="max-w-full max-h-96 object-contain rounded-lg"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};