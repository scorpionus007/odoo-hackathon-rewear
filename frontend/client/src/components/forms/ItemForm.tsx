import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X } from 'lucide-react';
import { ITEM_CATEGORIES, ITEM_CONDITIONS, SIZES } from '@/utils/constants';
import { calculateEnvironmentalImpact, generateId } from '@/utils/helpers';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const itemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Category is required'),
  condition: z.string().min(1, 'Condition is required'),
  size: z.string().min(1, 'Size is required'),
  brand: z.string().min(1, 'Brand is required'),
});

type ItemFormData = z.infer<typeof itemSchema>;

interface ItemFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const ItemForm: React.FC<ItemFormProps> = ({ onSuccess, onCancel }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
  });

  const watchedCategory = watch('category');
  const watchedCondition = watch('condition');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setImages(prev => [...prev, e.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ItemFormData) => {
    setIsLoading(true);

    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const environmentalImpact = calculateEnvironmentalImpact(data.category, data.condition);
      
      const newItem = {
        id: generateId(),
        ...data,
        images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400&h=300&fit=crop'],
        userId: user.id,
        userName: user.name,
        status: 'available' as const,
        createdAt: new Date().toISOString(),
        tags: [],
        environmentalImpact,
      };

      // Save to localStorage
      const existingItems = JSON.parse(localStorage.getItem('rewear_items') || '[]');
      existingItems.push(newItem);
      localStorage.setItem('rewear_items', JSON.stringify(existingItems));

      toast({
        title: 'Item added successfully!',
        description: 'Your item has been listed for exchange.',
      });

      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add item. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Add New Item</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Item title"
                {...register('title')}
              />
              {errors.title && (
                <p className="text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                placeholder="Brand name"
                {...register('brand')}
              />
              {errors.brand && (
                <p className="text-sm text-red-600">{errors.brand.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your item..."
              rows={4}
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select onValueChange={(value) => setValue('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {ITEM_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="size">Size</Label>
              <Select onValueChange={(value) => setValue('size', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {SIZES.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.size && (
                <p className="text-sm text-red-600">{errors.size.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="condition">Condition</Label>
              <Select onValueChange={(value) => setValue('condition', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  {ITEM_CONDITIONS.map((condition) => (
                    <SelectItem key={condition.value} value={condition.value}>
                      {condition.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.condition && (
                <p className="text-sm text-red-600">{errors.condition.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="images">Images</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">Drag & drop images here or click to browse</p>
              <Input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <Label htmlFor="image-upload" className="cursor-pointer">
                <Button type="button" variant="outline" asChild>
                  <span>Choose Files</span>
                </Button>
              </Label>
            </div>
            
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-4">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-20 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {watchedCategory && watchedCondition && (
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-2">Environmental Impact</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-green-600">Carbon Saved:</span>
                  <div className="font-semibold">
                    {calculateEnvironmentalImpact(watchedCategory, watchedCondition).carbonSaved.toFixed(1)}kg CO₂
                  </div>
                </div>
                <div>
                  <span className="text-green-600">Water Saved:</span>
                  <div className="font-semibold">
                    {calculateEnvironmentalImpact(watchedCategory, watchedCondition).waterSaved.toFixed(0)} liters
                  </div>
                </div>
                <div>
                  <span className="text-green-600">Waste Reduced:</span>
                  <div className="font-semibold">
                    {calculateEnvironmentalImpact(watchedCategory, watchedCondition).wasteReduced.toFixed(1)}kg
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rewear-button-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Adding...' : 'Add Item'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
