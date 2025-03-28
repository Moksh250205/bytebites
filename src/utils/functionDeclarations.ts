export const searchRestaurantsFunctionDeclaration = {
    name: "searchRestaurants",
    description: "Search for restaurants based on various criteria",
    parameters: {
        type: "OBJECT",
        properties: {
            name: { type: "STRING", description: "Search by restaurant name" },
            cuisine: { type: "STRING", description: "Type of cuisine to search for Indian, South indian etc" },
            priceRange: { type: "NUMBER", description: "Max Price" },
            rating: { type: "NUMBER", description: "Minimum rating threshold" },
            type: {type: "STRING", description: "VEG, NON_VEG, EGG, VEGAN"}
        },
    },
};

export const getRestaurantMenuFunctionDeclaration = {
    name: "getRestaurantMenu",
    description: "Get all menu items for a specific restaurant with filters",
    parameters: {
        type: "OBJECT",
        properties: {
            restaurantName: { type: "STRING", description: "name of the restaurant should be written like this 'This Is My Restaurant'" },
            category: { type: "STRING", description: "Filter by food category" },
            type: {
                type: "STRING",
                enum: ["VEG", "NON_VEG", "EGG", "VEGAN"],
                description: "Filter by food type",
            },
            maxPrice: { type: "NUMBER", description: "Maximum base price filter" },
            tags: {
                type: "ARRAY",
                items: { type: "STRING" },
                description: "Filter by item tags",
            },
        },
        required: ["restaurantName"],
    },
};

export const searchMenuItemsFunctionDeclaration = {
    name: "searchMenuItems",
    description: "Search for menu items across all restaurants",
    parameters: {
        type: "OBJECT",
        properties: {
            name: { type: "STRING", description: "Search by item name" },
            category: { type: "STRING", description: "Filter by cuisine of food" },
            type: {
                type: "STRING",
                enum: ["VEG", "NON_VEG", "EGG", "VEGAN"],
            },
            maxBasePrice: { type: "NUMBER", description: "Maximum base price" },
            tags: {
                type: "ARRAY",
                items: { type: "STRING" },
                description: "Filter by item tags",
            },
            allergens: {
                type: "ARRAY",
                items: { type: "STRING" },
                description: "Filter out items with specific allergens",
            },
        },
    },
};

export const findRestaurantsByItemFunctionDeclaration = {
    name: "findRestaurantsByItem",
    description: "Find restaurants that serve specific items",
    parameters: {
        type: "OBJECT",
        properties: {
            itemName: {
                type: "STRING",
                description: "Name of the item to search for",
            },
            type: {
                type: "STRING",
                enum: ["VEG", "NON_VEG", "EGG", "VEGAN"],
            },
            maxPrice: { type: "NUMBER", description: "Maximum price for the item" },
            category: { type: "STRING", description: "Category of the item" },
        },
        required: ["itemName"],
    },
};

export const previewOrderFunctionDeclaration = {
    name: "previewOrder",
    description: "Preview order details and get available customizations before placing the order",
    parameters: {
        type: "OBJECT",
        properties: {
            restaurantName: { 
                type: "STRING", 
                description: "Name of restaurant" 
            },
            items: {
                type: "ARRAY",
                items: {
                    type: "OBJECT",
                    properties: {
                        itemName: { 
                            type: "STRING", 
                            description: "Name of the menu item" 
                        },
                        quantity: { 
                            type: "NUMBER", 
                            description: "Quantity of the item" 
                        },
                        customizations: {
                            type: "ARRAY",
                            items: {
                                type: "OBJECT",
                                properties: {
                                    name: { 
                                        type: "STRING",
                                        description: "Name of the customization (e.g., 'Extra Cheese')"
                                    },
                                    price: { 
                                        type: "NUMBER",
                                        description: "Price of the customization"
                                    }
                                }
                            }
                        }
                    },
                    required: ["itemName", "quantity"]
                },
                description: "Array of items to preview with their customizations"
            }
        },
        required: ["restaurantName", "items"]
    }
};

export const createOrderFunctionDeclaration = {
    name: "createOrder",
    description: "Create a new order",
    parameters: {
        type: "OBJECT",
        properties: {
            userId: {
                type: "STRING",
                description: "ID of the user placing the order",
            },
            restaurantName: { type: "STRING", description: "Name of restaurant" },
            items: {
                type: "ARRAY",
                items: {
                    type: "OBJECT",
                    properties: {
                        itemName: { type: "STRING", description: "name of the menu item" },
                        quantity: { type: "NUMBER", description: "Quantity of the item" },
                        customizations: {
                            type: "ARRAY",
                            items: {
                                type: "OBJECT",
                                properties: {
                                    name: { type: "STRING", description: "Name of the customization" },
                                    price: { type: "NUMBER", description: "Price of the customization" }
                                }
                            }
                        }
                    }
                }
            },
            pickupTime: {
                type: "STRING",
                description: "Requested pickup time (ISO string)",
            },
            specialInstructions: {
                type: "STRING",
                description: "Special instructions for the order",
            },
        },
        required: ["restaurantName", "items"],
    },
};

export const getOrderStatusFunctionDeclaration = {
    name: "getOrderStatus",
    description: "Get the current status of an order",
    parameters: {
        type: "OBJECT",
        properties: {
            orderId: { type: "STRING", description: "ID of the order" },
            userId: {
                type: "STRING",
                description: "ID of the user who placed the order",
            },
        },
        required: ["orderId", "userId"],
    },
};
