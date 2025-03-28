// src/types/frontend/types.ts

// Customization interface is used in FoodItem, OrderPreviewItem, and OrderItem.
export interface Customization {
  name: string;
  price: number;
  _id: string;
}

// Restaurant interface used for both RestaurantCard and RestaurantWithItemsCard.
// Note: matchingItems is optional.
export interface MatchingItem {
  itemId: string;
  name: string;
  basePrice: number;
  type: string;
  category: string;
}

export interface Restaurant {
  _id: string;
  name: string;
  description: string;
  cuisine: string[];
  priceRange: number;
  rating?: number;
  isCurrentlyOpen: boolean;
  matchingItems?: MatchingItem[];
}

// FoodItem interface for MenuItemCard.
export interface FoodItem {
  _id: string;
  name: string;
  description: string;
  basePrice: number;
  type: "VEG" | "NON_VEG" | "EGG" | "VEGAN";
  category: string;
  tags: string[];
  allergens: string[];
  customizations?: Customization[];
}

// Interfaces for Order Preview
export interface OrderPreviewItem {
  name: string;
  quantity: number;
  basePrice: number;
  type: string;
  category: string;
  availableCustomizations?: Customization[];
  selectedCustomizations?: Customization[];
  itemTotal: number;
  subtotal: number;
}

export interface OrderPreview {
  restaurant: {
    name: string;
    isCurrentlyOpen: boolean;
  };
  items: OrderPreviewItem[];
  pricing: {
    subtotal: number;
    platformFee: number;
    total: number;
  };
  estimatedWaitTime: number;
}

// Interfaces for Order details
export interface OrderItem {
  itemId: string;
  quantity: number;
  price: number;
  customizations?: Customization[];
  name?: string;
  description?: string;
  type?: string;
  category?: string;
}

export interface OrderDetails {
  _id: string;
  restaurant: {
    name: string;
    contactNumber: string;
  };
  items: OrderItem[];
  totalAmount: number;
  status?: string;
  estimatedWaitTime?: number;
  canBeCancelled?: boolean;
}

// Chat message interface for chat messages.
export interface Message {
  type: "user" | "ai" | "results";
  content: string;
}

// Base interface for a response.
interface ResponseBase {
  type: string;
  data: any;
}

// Specific response types for each case.
export interface RestaurantsResponse extends ResponseBase {
  type: "restaurants";
  data: Restaurant[];
}

export interface RestaurantsWithItemsResponse extends ResponseBase {
  type: "restaurantsWithItems";
  data: Restaurant[];
}

export interface MenuItemsResponse extends ResponseBase {
  type: "menuItems";
  data: FoodItem[];
}

export interface MenuResponse extends ResponseBase {
  type: "menu";
  data: {
    items: FoodItem[];
  };
}

export interface OrderPreviewResponse extends ResponseBase {
  type: "orderPreview";
  data: OrderPreview;
}

export interface OrderResponse extends ResponseBase {
  type: "order";
  data: OrderDetails;
}

export interface OrderStatusResponse extends ResponseBase {
  type: "orderStatus";
  data: OrderDetails;
}

// The ChatResponse type includes a message and an array of responses.
export type ChatResponse = {
  message: string;
  responses: (
    | RestaurantsResponse
    | RestaurantsWithItemsResponse
    | MenuItemsResponse
    | MenuResponse
    | OrderPreviewResponse
    | OrderResponse
    | OrderStatusResponse
  )[];
};
