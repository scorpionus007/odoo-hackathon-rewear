export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    return formatDate(dateString);
  }
};

export const formatCarbonSaved = (carbon: number): string => {
  return `${carbon.toFixed(1)}kg CO₂`;
};

export const formatWaterSaved = (water: number): string => {
  if (water >= 1000) {
    return `${(water / 1000).toFixed(1)}K liters`;
  }
  return `${water} liters`;
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'available':
      return 'text-green-600';
    case 'exchanging':
      return 'text-yellow-600';
    case 'exchanged':
      return 'text-gray-600';
    case 'pending':
      return 'text-yellow-600';
    case 'completed':
      return 'text-green-600';
    case 'rejected':
      return 'text-red-600';
    case 'cancelled':
      return 'text-gray-600';
    default:
      return 'text-gray-600';
  }
};

export const generateId = (): number => {
  return Date.now() + Math.floor(Math.random() * 1000);
};

export const calculateEnvironmentalImpact = (category: string, condition: string) => {
  const baseCarbonSaved = {
    outerwear: 35,
    tops: 15,
    bottoms: 20,
    dresses: 25,
    shoes: 30,
    accessories: 8,
  };

  const conditionMultiplier = {
    'like-new': 1.0,
    'excellent': 0.9,
    'good': 0.8,
    'fair': 0.6,
  };

  const baseCarbon = baseCarbonSaved[category as keyof typeof baseCarbonSaved] || 20;
  const multiplier = conditionMultiplier[condition as keyof typeof conditionMultiplier] || 0.8;
  
  return {
    carbonSaved: baseCarbon * multiplier,
    waterSaved: baseCarbon * multiplier * 50,
    wasteReduced: baseCarbon * multiplier * 0.1,
  };
};
