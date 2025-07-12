import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatsCard } from '@/components/common/StatsCard';
import { 
  Leaf, 
  Users, 
  Recycle, 
  Droplets,
  Plus,
  ArrowRight,
  Star,
  Quote
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { mockItems, platformStats } from '@/data/mockData';
import { ROUTES } from '@/utils/constants';

export const Home: React.FC = () => {
  const { isLoggedIn } = useAuth();

  const featuredItems = mockItems.slice(0, 4);

  const features = [
    {
      icon: Plus,
      title: "1. List Your Items",
      description: "Upload photos and details of clothing you want to exchange",
      color: "text-primary"
    },
    {
      icon: Recycle,
      title: "2. Find & Exchange",
      description: "Browse items from other members and request exchanges",
      color: "text-secondary"
    },
    {
      icon: Leaf,
      title: "3. Save the Planet",
      description: "Reduce waste and carbon footprint with every exchange",
      color: "text-accent"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Eco Fashion Enthusiast",
      content: "ReWear has completely changed how I think about fashion. I've found amazing pieces while helping the environment!",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop&crop=face"
    },
    {
      name: "John Doe",
      role: "Sustainable Living Advocate",
      content: "The community here is incredible. Everyone is passionate about reducing waste and sharing quality clothing.",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary to-secondary text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 fade-in">
              Join the Sustainable<br />Fashion Revolution
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              Exchange, share, and discover pre-loved clothing while reducing environmental impact
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={ROUTES.ITEMS}>
                <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
                  Browse Items
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href={isLoggedIn ? ROUTES.DASHBOARD : ROUTES.LOGIN}>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                  Start Exchanging
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Environmental Impact Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {platformStats.totalItems.toLocaleString()}
              </div>
              <div className="text-gray-600">Items Exchanged</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {platformStats.carbonSaved}T
              </div>
              <div className="text-gray-600">CO₂ Saved</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {(platformStats.waterSaved / 1000).toFixed(0)}K
              </div>
              <div className="text-gray-600">Liters Water Saved</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {platformStats.totalUsers.toLocaleString()}
              </div>
              <div className="text-gray-600">Community Members</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Items */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Featured Items</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredItems.map((item) => (
              <Card key={item.id} className="rewear-card overflow-hidden group">
                <div className="relative">
                  <img 
                    src={item.images[0]} 
                    alt={item.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">{item.size} • {item.condition}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant={item.status === 'available' ? 'default' : 'secondary'}>
                      {item.status}
                    </Badge>
                    <div className="flex items-center space-x-1">
                      <Leaf className="w-4 h-4 text-primary" />
                      <span className="text-sm text-gray-600">
                        {item.environmentalImpact.carbonSaved.toFixed(0)}kg CO₂ saved
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href={ROUTES.ITEMS}>
              <Button size="lg" className="rewear-button-primary">
                View All Items
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  feature.color === 'text-primary' ? 'bg-primary' : 
                  feature.color === 'text-secondary' ? 'bg-secondary' : 
                  'bg-accent'
                }`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Community Says</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="rewear-card">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Quote className="w-8 h-8 text-primary mr-3" />
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">{testimonial.content}</p>
                  <div className="flex items-center">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      className="w-10 h-10 rounded-full mr-3"
                    />
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-gray-500">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Make a Difference?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of fashion lovers making sustainable choices every day
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={isLoggedIn ? ROUTES.DASHBOARD : ROUTES.LOGIN}>
              <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
                Get Started Today
              </Button>
            </Link>
            <Link href={ROUTES.ITEMS}>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                Explore Items
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
