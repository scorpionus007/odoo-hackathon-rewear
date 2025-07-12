import React from 'react';
import { useLocation } from 'wouter';
import { LoginForm } from '@/components/forms/LoginForm';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf } from 'lucide-react';
import { ROUTES } from '@/utils/constants';

export const Login: React.FC = () => {
  const [, setLocation] = useLocation();
  const { isLoggedIn, isAdmin } = useAuth();

  // Redirect if already logged in
  React.useEffect(() => {
    if (isLoggedIn) {
      if (isAdmin) {
        setLocation(ROUTES.ADMIN);
      } else {
        setLocation(ROUTES.DASHBOARD);
      }
    }
  }, [isLoggedIn, isAdmin, setLocation]);

  const handleLoginSuccess = () => {
    // Redirect will be handled by the useEffect above
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Title */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">ReWear</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your sustainable fashion account
          </p>
        </div>

        {/* Login Form */}
        <LoginForm onSuccess={handleLoginSuccess} />

        {/* Features */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-center text-lg">Why ReWear?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 text-sm">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Leaf className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="font-medium">Sustainable Fashion</div>
                  <div className="text-gray-600">Reduce waste, save the planet</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center">
                  <span className="text-secondary text-sm">🔄</span>
                </div>
                <div>
                  <div className="font-medium">Easy Exchanges</div>
                  <div className="text-gray-600">Trade items with community members</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                  <span className="text-accent text-sm">🏆</span>
                </div>
                <div>
                  <div className="font-medium">Earn Badges</div>
                  <div className="text-gray-600">Get rewarded for eco-friendly actions</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>
            By signing in, you agree to our{' '}
            <a href="#" className="text-primary hover:text-primary/80">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-primary hover:text-primary/80">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
