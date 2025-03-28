const NodeCache = require("node-cache");

// Create caches with different TTLs based on data volatility
const restaurantCache = new NodeCache({ 
  stdTTL: 3600,  // 1 hour for restaurant data
  checkperiod: 120 // Check for expired keys every 2 minutes
});
const menuCache = new NodeCache({ 
  stdTTL: 1800,  // 30 minutes for menu data
  checkperiod: 120
});
const itemCache = new NodeCache({ 
  stdTTL: 1800,  // 30 minutes for item data
  checkperiod: 120
});

// Import your models
const Restaurant = require("@/models/restaurant.model").default;
const Menu = require("@/models/menu.model").default;
const Item = require("@/models/items.model").default;
const Order = require("@/models/orders.model").default;

// Add timing functionality
const timeTracker = {
  start: () => {
    const start = process.hrtime();
    return () => {
      const [seconds, nanoseconds] = process.hrtime(start);
      return (seconds * 1000 + nanoseconds / 1e6).toFixed(2); // Convert to milliseconds
    };
  }
};

function calculatePlatformFee(subtotal) {
  if (subtotal <= 50) return 5;
  if (subtotal <= 500) return 10;
  return 20;
}

// Cache keys generator
const getCacheKey = (prefix, identifier) => `${prefix}_${identifier}`;

// Generic cache wrapper with timing
const withCache = async (cache, key, fetchData) => {
  const getElapsedTime = timeTracker.start();
  let data = cache.get(key);
  
  if (data) {
    console.log(`Cache hit for key: ${key} (${getElapsedTime()}ms)`);
    return data;
  }
  
  console.log(`Cache miss for key: ${key}`);
  const fetchStart = timeTracker.start();
  data = await fetchData();
  console.log(`Data fetch time: ${fetchStart()}ms`);
  
  if (data) {
    cache.set(key, data);
    console.log(`Total operation time: ${getElapsedTime()}ms`);
  }
  return data;
};

/**
 * Check whether a restaurant is currently open based on its opening hours.
 */
export function getRestaurantStatus(openingHours) {
  if (!openingHours) return false;

  const now = new Date();
  const day = now.getDay();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  const todayHours = openingHours.find((h) => h.day === day);
  if (!todayHours) return false;

  return todayHours.shifts.some((shift) => {
    const [openH, openM] = shift.open.split(":").map(Number);
    const [closeH, closeM] = shift.close.split(":").map(Number);
    const openMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;
    return currentTime >= openMinutes && currentTime <= closeMinutes;
  });
}

/**
 * Calculate the estimated wait time for an order.
 */
export function calculateEstimatedWaitTime(order) {
  const baseTime = 15;
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const additionalTime = Math.ceil(itemCount / 2) * 5;
  return baseTime + additionalTime;
}

/**
 * Determine if an order can still be cancelled.
 */
export function canOrderBeCancelled(order) {
  if (order.status === "PENDING" || order.status === "CONFIRMED") {
    const orderTime = new Date(order.createdAt).getTime();
    const currentTime = Date.now();
    const timeDifference = (currentTime - orderTime) / (1000 * 60);
    return timeDifference <= 5;
  }
  return false;
}

//Tested and working, with caching
export async function searchRestaurants(args) {
  console.log("\n=== Starting searchRestaurants ===");
  const startTime = timeTracker.start();

  // Remove null, empty string, and "any"
  const sanitizedArgs = Object.fromEntries(
    Object.entries(args).filter(
      ([_, v]) => v != null && v !== "" && v !== "any"
    )
  );

  const cacheKey = getCacheKey("search_restaurants", JSON.stringify(sanitizedArgs));

  const result = await withCache(restaurantCache, cacheKey, async () => {
    const queryStart = timeTracker.start();
    const query = {
      ...(sanitizedArgs.name && { name: new RegExp(sanitizedArgs.name, "i") }),
      ...(sanitizedArgs.cuisine && { 
        cuisine: { 
          $elemMatch: { $regex: sanitizedArgs.cuisine, $options: "i" } 
        } 
      }),
      ...(sanitizedArgs.priceRange && { priceRange: { $lte: sanitizedArgs.priceRange } }),
    };

    const restaurants = await Restaurant.find(query)
      .select("name description cuisine priceRange rating images openingHours")
      .limit(20);

    console.log(`Database query time: ${queryStart()}ms`);

    const processStart = timeTracker.start();
    const processed = restaurants.map((restaurant) => ({
      ...restaurant.toObject(),
      isCurrentlyOpen: getRestaurantStatus(restaurant.openingHours),
    }));
    console.log(`Data processing time: ${processStart()}ms`);

    return processed;
  });

  console.log(`Total searchRestaurants time: ${startTime()}ms\n`);
  return result;
}


/**
 * Retrieve the menu for a restaurant.
 */
export async function getRestaurantMenu(args) {
  console.log('\n=== Starting getRestaurantMenu ===');
  const startTime = timeTracker.start();
  let restaurantId; 
  
  const menuCacheKey = getCacheKey('menu', args.restaurantName);
  
  const result = await withCache(menuCache, menuCacheKey, async () => {
    const menuQueryStart = timeTracker.start();
    const menu = await Menu.findOne({
      name: `${args.restaurantName}'s Menu`,
      isActive: true,
    }).lean();
    console.log(menu)
    restaurantId = menu.restaurantId;
    console.log(`Menu query time: ${menuQueryStart()}ms`);
    
    if (!menu) {
      throw new Error("Menu not found for this restaurant");
    }

    const itemsQueryStart = timeTracker.start();
    const query = {
      menuId: menu._id,
    };

    const items = await Item.find(query)
      .select("name description basePrice type category tags customizations allergens images")
      .sort({ category: 1, name: 1 })
      .lean();
    
    console.log(`Items query time: ${itemsQueryStart()}ms`);
    return {
      restaurantId: restaurantId,
      menuId: menu._id,
      items,
    };
  });

  console.log(`Total getRestaurantMenu time: ${startTime()}ms\n`);

  console.log(result); 
  return result;
}

/**
 * Search for menu items based on criteria.
 */
export async function searchMenuItems(args) {
  console.log('\n=== Starting searchMenuItems ===');
  const startTime = timeTracker.start();

  const cacheKey = getCacheKey('menu_items', JSON.stringify(args));

  const result = await withCache(itemCache, cacheKey, async () => {
    const queryStart = timeTracker.start();

    // Log input arguments for debugging.
    console.log("Search arguments:", args);

    // Build the query object with isAvailable filter.
    const query = process.env.NODE_ENV === 'development' ?  {} : {isAvailable: true};

    if (args.name && args.name !== "any") {
      // Remove spaces from the search term.
      const trimmedSearchTerm = args.name.replace(/\s+/g, '');
      // Build a regex pattern that allows optional whitespace between each character.
      // e.g. "vadapav" becomes "v\s*a\s*d\s*a\s*p\s*a\s*v"
      const pattern = trimmedSearchTerm.split('').join('\\s*');
      query.name = { $regex: pattern, $options: "i" };
    }

    if (args.category && args.category !== "any") {
      query.category = { $regex: args.category.trim(), $options: "i" };
    }

    if (args.type && args.type !== "any") {
      query.type = args.type;
    }

    if (args.maxBasePrice) {
      query.basePrice = { $lte: args.maxBasePrice };
    }

    if (args.tags && args.tags.length > 0) {
      query.tags = { $all: args.tags };
    }

    if (args.allergens && args.allergens.length > 0) {
      query.allergens = { $nin: args.allergens };
    }

    // Log the final MongoDB query.
    console.log("Mongo Query:", query);

    // Execute the query with population.
    const items = await Item.find(query)
      .populate({
        path: "menuId",
        select: "name", 
        populate: {
          path: "restaurantId",
          model: "Restaurant",
          select: "name isActive isVerified openingHours",
        },
      })
      .limit(50);

    console.log(`Query and populate time: ${queryStart()}ms`);
    console.log(`Found ${items.length} items before filtering`);

    // Filter out items whose restaurant is not active or verified.
    const processStart = timeTracker.start();
    const filteredItems = items.filter(item => {
      if (!item.menuId || !item.menuId.restaurantId) {
        console.log("Item missing menu or restaurant:", item);
        return false;
      }
      if (!item.menuId.restaurantId.isActive || !item.menuId.restaurantId.isVerified) {
        console.log("Restaurant not active/verified:", item.menuId.restaurantId);
        return false;
      }
      return true;
    }).map(item => ({
      ...item.toObject(),
      // restaurantIsOpen: getRestaurantStatus(item.menuId.restaurantId.openingHours),
    }));

    console.log(`Data processing time: ${processStart()}ms`);
    console.log(`Returning ${filteredItems.length} items:`, filteredItems);
    return filteredItems;
  });

  console.log(`Total searchMenuItems time: ${startTime()}ms\n`);
  return result;
}


/**
 * Find restaurants by a given menu item.
 */
export async function findRestaurantsByItem(args) {
  console.log('\n=== Starting findRestaurantsByItem ===');
  const startTime = timeTracker.start();
  
  const cacheKey = getCacheKey('restaurants_by_item', JSON.stringify(args));
  
  const result = await withCache(restaurantCache, cacheKey, async () => {
    const queryStart = timeTracker.start();
    const searchPattern = args.itemName
      .split(/\s+/)
      .map((word) => `(?=.*${word})`)
      .join("");

    const itemQuery = {
      name: new RegExp(searchPattern, "i"),
      ...(args.type && { type: args.type }),
      ...(args.maxPrice && { basePrice: { $lte: args.maxPrice } }),
      ...(args.category && { category: args.category }),
    };

    const items = await Item.find(itemQuery)
      .populate({
        path: "menuId",
        select: "name",
        populate: {
          path: "restaurantId",
          select: "name priceRange",
          model: "Restaurant",
        },
      })
      .lean();
    
    console.log(`Query and populate time: ${queryStart()}ms`);

    const processStart = timeTracker.start();
    const restaurants = [...new Map(
      items
        .filter((item) => item.menuId?.restaurantId)
        .map((item) => {
          const restaurant = item.menuId.restaurantId;
          return [
            restaurant._id.toString(),
            {
              ...restaurant,
              matchingItems: items
                .filter((i) => i.menuId?.restaurantId?._id.toString() === restaurant._id.toString())
                .map((i) => ({
                  itemId: i._id,
                  name: i.name,
                  basePrice: i.basePrice,
                  type: i.type,
                  category: i.category,
                })),
            },
          ];
        })
    ).values()];
    
    console.log(`Data processing time: ${processStart()}ms`);
    return restaurants;
  });

  console.log(`Total findRestaurantsByItem time: ${startTime()}ms\n`);
  return result;
}

/**
 * Preview an order.
 */
export async function previewOrder(args) {
  console.log('\n=== Starting previewOrder ===');
  const startTime = timeTracker.start();

  // Get Restaurant with cache
  const restaurantStart = timeTracker.start();
  const restaurant = await withCache(
    restaurantCache,
    getCacheKey('restaurant', args.restaurantName),
    () => Restaurant.findOne({ name: args.restaurantName }).lean()
  );
  console.log(`Restaurant fetch time: ${restaurantStart()}ms`);

  if (!restaurant) {
    throw new Error("Restaurant not found");
  }

  if (!restaurant.isActive || !restaurant.isVerified) {
    throw new Error("Restaurant is not currently accepting orders");
  }

  // Get Menu with cache
  const menuStart = timeTracker.start();
  const menu = await withCache(
    menuCache,
    getCacheKey('restaurant_menu', restaurant._id),
    () => Menu.findOne({ restaurantId: restaurant._id, isActive: true })
  );
  console.log(`Menu fetch time: ${menuStart()}ms`);

  if (!menu) {
    throw new Error("Menu not found for this restaurant");
  }

  let subtotal = 0;
  const previewItems = [];

  // Process items
  const itemsStart = timeTracker.start();
  for (const orderItem of args.items) {
    const itemStart = timeTracker.start();
    const menuItem = await withCache(
      itemCache,
      getCacheKey('item', orderItem.itemName),
      () => Item.findOne({ 
        name: { $regex: new RegExp(orderItem.itemName, 'i') },
        menuId: menu._id 
      }).lean()
    );
    console.log(`Single item fetch time: ${itemStart()}ms`);

    if (!menuItem) {
      throw new Error(`Item ${orderItem.itemName} not found in menu`);
    }

    // Calculate item total with any existing customizations
    let itemTotal = menuItem.basePrice;
    const selectedCustomizations = [];

    if (orderItem.customizations && orderItem.customizations.length > 0) {
      for (const custom of orderItem.customizations) {
        // Validate customization: compare name (case-insensitive) and price

        console.log(menuItem.customizations); 
        const validCustomization = menuItem.customizations.find(
          c => c.name.trim().toLowerCase() === custom.name.trim().toLowerCase()
        );

        console.log(validCustomization); 
        if (!validCustomization) {
          throw new Error(`Invalid customization "${custom.name}" for ${menuItem.name}`);
        }
        itemTotal += validCustomization.price;
        selectedCustomizations.push({
          name: custom.name,
          price: validCustomization.price
        });
      }
    }

    const itemSubtotal = itemTotal * orderItem.quantity;
    subtotal += itemSubtotal;

    previewItems.push({
      name: menuItem.name,
      quantity: orderItem.quantity,
      basePrice: menuItem.basePrice,
      type: menuItem.type,
      category: menuItem.category,
      availableCustomizations: menuItem.customizations,
      selectedCustomizations,
      itemTotal: itemTotal,
      subtotal: itemSubtotal
    });
  }
  console.log(`Items processing time: ${itemsStart()}ms`);

  // Calculate fees and total
  const platformFee = calculatePlatformFee(subtotal);
  const total = subtotal + platformFee;

  const preview = {
    restaurant: {
      name: restaurant.name,
      isCurrentlyOpen: getRestaurantStatus(restaurant.openingHours)
    },
    items: previewItems,
    pricing: {
      subtotal,
      platformFee,
      total
    },
    estimatedWaitTime: calculateEstimatedWaitTime({ items: args.items })
  };

  console.log(`Total previewOrder time: ${startTime()}ms\n`);
  return preview;
}

/**
 * Create an order.
 */
export async function createOrder(args, userId) {
  console.log('\n=== Starting createOrder ===');
  const startTime = timeTracker.start();

  // Get Restaurant with cache
  const restaurantStart = timeTracker.start();
  const restaurant = await withCache(
    restaurantCache,
    getCacheKey('restaurant', args.restaurantName),
    () => Restaurant.findOne({ name: args.restaurantName }).lean()
  );
  console.log(`Restaurant fetch time: ${restaurantStart()}ms`);

  if (!restaurant) {
    throw new Error("Restaurant not found");
  }

  // Get Menu with cache
  const menuStart = timeTracker.start();
  const menu = await withCache(
    menuCache,
    getCacheKey('restaurant_menu', restaurant._id),
    () => Menu.findOne({ restaurantId: restaurant._id, isActive: true })
  );
  console.log(`Menu fetch time: ${menuStart()}ms`);

  if (!menu) {
    throw new Error("Menu not found for this restaurant");
  }

  if (!restaurant.isActive || !restaurant.isVerified) {
    throw new Error("Restaurant is not currently accepting orders");
  }

  let totalAmount = 0;
  const orderItems = [];

  // Process items with caching and timing
  const itemsStart = timeTracker.start();
  console.log(args); 
  for (const item of args.items) {
    const itemStart = timeTracker.start();
    const fullItem = await withCache(
      itemCache,
      getCacheKey('item', item.itemName),
      () => Item.findOne({ name: { $regex: new RegExp(item.itemName, 'i') } }).lean()
    );
    console.log(`Single item fetch time: ${itemStart()}ms`);

    if (!fullItem) {
      throw new Error(`Item ${item.itemName} not found`);
    }

    // Process item pricing and customizations
    const processStart = timeTracker.start();
    let itemPrice = fullItem.basePrice;
    const customizations = [];

    if (item.customizations) {
      for (const custom of item.customizations) {
        // Now directly validate the customization based on name and price
        const validCustomization = fullItem.customizations.find(
          (c) => c.name === custom.name && c.price === custom.price
        );
        if (!validCustomization) {
          throw new Error(`Invalid customization for ${fullItem.name}`);
        }
        itemPrice += custom.price;
        customizations.push({
          name: custom.name,
          price: custom.price,
        });
      }
    }

    totalAmount += itemPrice * item.quantity;
    orderItems.push({
      itemId: fullItem._id,
      quantity: item.quantity,
      price: itemPrice,
      customizations,
    });
    console.log(`Item processing time: ${processStart()}ms`);
  }
  console.log(`Total items processing time: ${itemsStart()}ms`);

  // Save order
  const saveStart = timeTracker.start();
  const order = new Order({
    userId: "67b03e550bedddbc323b1efe",
    restaurantId: restaurant._id,
    items: orderItems,
    totalAmount,
    pickupTime: args.pickupTime ? new Date(args.pickupTime) : null,
    payment: {
      upiId: restaurant.upiId,
      status: "PENDING",
    },
    specialInstructions: args.specialInstructions || "",
  });

  const savedOrder = await order.save();
  console.log(`Order save time: ${saveStart()}ms`);

  console.log(`Total createOrder time: ${startTime()}ms\n`);
  
  return {
    ...savedOrder.toObject(),
    restaurant: {
      name: restaurant.name,
      contactNumber: restaurant.contactNumber,
    },
  };
}

/**
 * Get the status of an order.
 */
export async function getOrderStatus(args) {
  console.log('\n=== Starting getOrderStatus ===');
  const startTime = timeTracker.start();

  const queryStart = timeTracker.start();
  const order = await Order.findOne({
    _id: args.orderId,
    userId: args.userId,
  }).populate({
    path: "restaurantId",
    select: "name contactNumber",
  });
  console.log(`Order query time: ${queryStart()}ms`);

  if (!order) {
    throw new Error("Order not found");
  }

  const itemDetailsStart = timeTracker.start();
  const itemDetails = await Promise.all(
    order.items.map(async (item) => {
      const itemStart = timeTracker.start();
      const menuItem = await withCache(
        itemCache,
        getCacheKey('order_item', item.itemId),
        () => Item.findById(item.itemId).select(
          "name description type category"
        )
      );
      console.log(`Single item fetch time: ${itemStart()}ms`);
      
      return {
        ...item.toObject(),
        name: menuItem?.name,
        description: menuItem?.description,
        type: menuItem?.type,
        category: menuItem?.category,
      };
    })
  );
  console.log(`Item details fetch time: ${itemDetailsStart()}ms`);

  const processStart = timeTracker.start();
  const result = {
    ...order.toObject(),
    items: itemDetails,
    estimatedWaitTime: calculateEstimatedWaitTime(order),
    canBeCancelled: canOrderBeCancelled(order),
  };
  console.log(`Final processing time: ${processStart()}ms`);

  console.log(`Total getOrderStatus time: ${startTime()}ms\n`);
  return result;
}

// Cache clearing functions for maintenance
export const clearCaches = {
  all: () => {
    console.log('Clearing all caches...');
    restaurantCache.flushAll();
    menuCache.flushAll();
    itemCache.flushAll();
    console.log('All caches cleared');
  },
  restaurant: (key) => {
    if (key) {
      console.log(`Clearing restaurant cache for key: ${key}`);
      restaurantCache.del(getCacheKey('restaurant', key));
    } else {
      console.log('Clearing entire restaurant cache');
      restaurantCache.flushAll();
    }
  },
  menu: (key) => {
    if (key) {
      console.log(`Clearing menu cache for key: ${key}`);
      menuCache.del(getCacheKey('menu', key));
    } else {
      console.log('Clearing entire menu cache');
      menuCache.flushAll();
    }
  },
  item: (key) => {
    if (key) {
      console.log(`Clearing item cache for key: ${key}`);
      itemCache.del(getCacheKey('item', key));
    } else {
      console.log('Clearing entire item cache');
      itemCache.flushAll();
    }
  }
};

// Cache statistics
export const getCacheStats = () => {
  return {
    restaurant: {
      keys: restaurantCache.keys(),
      stats: restaurantCache.getStats(),
      hits: restaurantCache.getStats().hits,
      misses: restaurantCache.getStats().misses,
    },
    menu: {
      keys: menuCache.keys(),
      stats: menuCache.getStats(),
      hits: menuCache.getStats().hits,
      misses: menuCache.getStats().misses,
    },
    item: {
      keys: itemCache.keys(),
      stats: itemCache.getStats(),
      hits: itemCache.getStats().hits,
      misses: itemCache.getStats().misses,
    }
  };
};

// Export the cache instances for external use if needed
export const caches = {
  restaurant: restaurantCache,
  menu: menuCache,
  item: itemCache
};
