export interface StandardRestaurant {
    id: string;
    name: string;
    description?: string;
    cuisine?: string[];
    priceRange?: number;
    rating?: number;
    isCurrentlyOpen: boolean;
    images?: string[];
    contactNumber?: string;
  }
  
  export interface StandardMenuItem {
    id: string;
    name: string;
    description: string;
    basePrice: number;
    type: 'VEG' | 'NON_VEG' | 'EGG' | 'VEGAN';
    category: string;
    tags: string[];
    allergens: string[];
    restaurantId?: string;
    restaurantName?: string;
    customizations?: {
      id: string;
      name: string;
      price: number;
    }[];
    isAvailable: boolean;
  }
  
  export interface StandardOrder {
    id: string;
    restaurant: StandardRestaurant;
    items: {
      item: StandardMenuItem;
      quantity: number;
      customizations: {
        name: string;
        price: number;
      }[];
      itemTotal: number;
    }[];
    pricing: {
      subtotal: number;
      platformFee: number;
      total: number;
    };
    status: string;
    estimatedWaitTime: number;
    canBeCancelled: boolean;
    createdAt: string;
    specialInstructions?: string;
  }
  