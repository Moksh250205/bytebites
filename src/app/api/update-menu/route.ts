// app/api/menu/update/route.js
import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Menu from "@/models/menu.model";
import Item from "@/models/items.model";
import Restaurant from "@/models/restaurant.model";
import { Types } from "mongoose";

connect();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { restaurantId, menuId, items } = body;

    // Validate required fields
    if (!restaurantId || !items) {
      return NextResponse.json(
        { error: "restaurantId and items are required" },
        { status: 400 }
      );
    }

    // Validate restaurantId format
    if (!Types.ObjectId.isValid(restaurantId)) {
      return NextResponse.json(
        { error: "Invalid restaurantId format" },
        { status: 400 }
      );
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    let menu;
    if (menuId) {
      if (!Types.ObjectId.isValid(menuId)) {
        return NextResponse.json(
          { error: "Invalid menuId format" },
          { status: 400 }
        );
      }
      menu = await Menu.findById(menuId);
      if (!menu) {
        return NextResponse.json(
          { error: "Menu not found" },
          { status: 404 }
        );
      }
    } else {
      menu = await Menu.findOne({ restaurantId, isActive: true });
      if (!menu) {
        return NextResponse.json(
          { error: "Active menu not found for this restaurant" },
          { status: 404 }
        );
      }
    }

    const updatedItems = [];

    // Iterate over each item update or new item entry
    for (const itemData of items) {
      if (itemData.id) {
        // Validate the provided item id
        if (!Types.ObjectId.isValid(itemData.id)) {
          return NextResponse.json(
            { error: `Invalid item id: ${itemData.id}` },
            { status: 400 }
          );
        }

        // Update the existing item. Here, we assume the request body contains the complete (or
        // updated) details for the item.
        const updatedItem = await Item.findByIdAndUpdate(
          itemData.id,
          {
            name: itemData.name,
            description: itemData.description,
            basePrice: itemData.basePrice,
            category: itemData.category,
            type: itemData.type,
            tags: itemData.tags,
            customizations: itemData.customizations,
            // Update nutritional info using the provided estimatedCalories (and other nutritional values if any)
            nutritionalInfo: {
              calories: itemData.estimatedCalories,
              proteins: itemData.proteins || null,
              carbohydrates: itemData.carbohydrates || null,
              fats: itemData.fats || null,
            },
            allergens: itemData.allergens,
          },
          { new: true }
        );

        if (!updatedItem) {
          return NextResponse.json(
            { error: `Item not found with id ${itemData.id}` },
            { status: 404 }
          );
        }
        updatedItems.push(updatedItem);
      } else {
        // Create a new item if no id is provided.
        const newItem = new Item({
          name: itemData.name,
          menuId: menu._id, // Associate this item with the current menu
          description: itemData.description,
          basePrice: itemData.basePrice,
          category: itemData.category,
          type: itemData.type,
          tags: itemData.tags,
          customizations: itemData.customizations,
          nutritionalInfo: {
            calories: itemData.estimatedCalories,
            proteins: itemData.proteins || null,
            carbohydrates: itemData.carbohydrates || null,
            fats: itemData.fats || null,
          },
          allergens: itemData.allergens,
        });
        const savedItem = await newItem.save();
        updatedItems.push(savedItem);

        // Also add a reference for this new item to the menu's items array.
        menu.items.push({
          itemId: savedItem._id,
          isAvailable: true,
          specialInstructions: "",
        });
      }
    }

    // Save the updated menu document (if new items were added)
    await menu.save();

    return NextResponse.json(
      {
        message: "Menu updated successfully",
        success: true,
        updatedItems,
        menu: {
          id: menu._id,
          name: menu.name,
          itemCount: menu.items.length,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating menu:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}