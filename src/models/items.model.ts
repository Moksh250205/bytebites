import { Schema, model, models, Types } from 'mongoose';

const itemSchema = new Schema(
  {
    name: { type: String, required: true },
    menuId: {type: Types.ObjectId, required: true, ref: "Menu"}, 
    description: { type: String, required: true },
    basePrice: { type: Number, required: true },
    category: { type: String, required: true },
    tags: { type: [String], default: [] },
    image: { type: String, default: null },
    customizations: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true },
      },
    ],
    type: {
      type: String,
      enum: ['EGG', 'VEG', 'NON_VEG', 'VEGAN'],
      required: true,
    },
    nutritionalInfo: {
      calories: { type: Number, default: null },
      proteins: { type: Number, default: null },
      carbohydrates: { type: Number, default: null },
      fats: { type: Number, default: null },
    },
    allergens: { type: [String], default: [] },
  },
  {
    timestamps: true,
  }
);

const Item = models.Item || model('Item', itemSchema);

export default Item;
