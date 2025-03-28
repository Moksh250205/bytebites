"use client";

import React, { useRef, useState } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { FoodItem } from "@/types/frontend/types";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Plus, Minus, ShoppingCart } from "lucide-react";

interface MenuItemCardProps {
  item: FoodItem;
  onAddToCart?: (item: FoodItem, quantity: number, customizations: string[]) => void;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onAddToCart }) => {
  const cardRef = useRef(null);
  const imageRef = useRef(null);
  const contentRef = useRef(null);
  const addButtonRef = useRef(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedCustomizations, setSelectedCustomizations] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  useGSAP(() => {
    // Entry animation timeline
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    
    tl.fromTo(
      cardRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6 }
    )
    .fromTo(
      imageRef.current,
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 0.5 },
      "-=0.3"
    )
    .fromTo(
      contentRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.4 },
      "-=0.2"
    )
    .fromTo(
      addButtonRef.current,
      { scale: 0.8, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.7)" },
      "-=0.2"
    );
  }, []);

  const toggleCustomization = (customizationName: string) => {
    setSelectedCustomizations(prev => 
      prev.includes(customizationName)
        ? prev.filter(c => c !== customizationName)
        : [...prev, customizationName]
    );
  };

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(item, quantity, selectedCustomizations);
    }
    
    // Add to cart animation
    const tl = gsap.timeline();
    
    tl.to(addButtonRef.current, {
      scale: 0.8,
      duration: 0.2,
      ease: "power2.in"
    })
    .to(addButtonRef.current, {
      scale: 1,
      duration: 0.4,
      ease: "elastic.out(1, 0.5)"
    })
    .to(cardRef.current, {
      boxShadow: "0 0 0 2px rgba(22, 163, 74, 0.5)",
      duration: 0.3,
      ease: "power2.out"
    })
    .to(cardRef.current, {
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      duration: 0.6,
      delay: 0.2,
      ease: "power2.inOut"
    });
    
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const toggleExpanded = () => {
    setExpanded(!expanded);
    
    // Content expand/collapse animation
    gsap.to(contentRef.current, {
      height: expanded ? "auto" : "auto",
      duration: 0.4,
      ease: "power2.out"
    });
  };

  // Generate food type color scheme
  const getTypeStyles = () => {
    switch (item.type) {
      case "VEG":
        return "border-l-4 border-green-500";
      case "NON_VEG":
        return "border-l-4 border-red-500";
      case "EGG":
        return "border-l-4 border-yellow-500";
      case "VEGAN":
        return "border-l-4 border-purple-500";
      default:
        return "";
    }
  };

  return (
    <Card 
      ref={cardRef} 
      className={`w-full overflow-hidden transition-all duration-300 ${getTypeStyles()} hover:shadow-lg`}
    >
      <div className="relative">
        {/* Image placeholder - actual image would be used in production */}
        <div 
          ref={imageRef}
          className="h-32 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700"
        >
          {item.imageUrl && (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          )}
        </div>
        
        <Badge
          className={`absolute top-2 right-2 ${
            item.type === "VEG" ? "bg-green-500" : 
            item.type === "NON_VEG" ? "bg-red-500" : 
            item.type === "EGG" ? "bg-yellow-500" : 
            "bg-purple-500"
          } text-white font-medium`}
        >
          {item.type}
        </Badge>
      </div>

      <CardContent className="p-4" ref={contentRef}>
        <div className="flex justify-between items-start">
          <CardTitle className="font-semibold text-lg">{item.name}</CardTitle>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
          {item.description}
        </p>
        
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-baseline">
            <span className="text-lg font-bold">₹{item.basePrice}</span>
            {item.originalPrice && item.originalPrice > item.basePrice && (
              <span className="text-xs line-through text-gray-500 ml-2">
                ₹{item.originalPrice}
              </span>
            )}
          </div>
          
          {item.category && (
            <Badge variant="outline" className="ml-2">
              {item.category}
            </Badge>
          )}
        </div>

        {item.customizations && item.customizations.length > 0 && (
          <div className="mt-3">
            <button 
              onClick={toggleExpanded} 
              className="text-xs font-medium text-primary hover:underline flex items-center"
            >
              {expanded ? "Hide customizations" : "Show customizations"}
            </button>
            
            {expanded && (
              <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <p className="text-xs font-medium mb-2">Customize your order:</p>
                <div className="flex flex-wrap gap-2">
                  {item.customizations.map((custom, i) => (
                    <button
                      key={i}
                      className={`text-xs px-2 py-1 rounded-full transition-all duration-300 ${
                        selectedCustomizations.includes(custom.name)
                          ? "bg-primary text-white"
                          : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                      onClick={() => toggleCustomization(custom.name)}
                    >
                      {custom.name} (+₹{custom.price})
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => quantity > 1 && setQuantity(quantity - 1)}
              disabled={quantity <= 1}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-8 text-center text-sm font-medium">{quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => setQuantity(quantity + 1)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          
          <Button
            ref={addButtonRef}
            onClick={handleAddToCart}
            className={`transition-all duration-300 ${
              addedToCart 
                ? "bg-green-500 hover:bg-green-600" 
                : "bg-primary hover:bg-primary/90"
            }`}
            size="sm"
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            {addedToCart ? "Added" : "Add to Cart"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MenuItemCard;