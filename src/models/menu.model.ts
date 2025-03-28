import { Schema, model, models, Types } from 'mongoose';

const menuSchema = new Schema(
  {
    restaurantId: { type: Types.ObjectId, required: true, ref: 'Restaurant' }, 
    name: { type: String, required: true }, 
    description: { type: String, required: true }, 
    items: [
      {
        name: {type: String, required: true}, 
        itemId: { type: Types.ObjectId, ref: 'Item' }, 
        isAvailable: { type: Boolean, default: true }, 
        specialInstructions: { type: String, default: '' }, 
      },
    ],
    activeFrom: { type: Date, required: true }, 
    activeTo: { type: Date, default: null }, 
    isActive: { type: Boolean, default: true }, 
  },
  {
    timestamps: true, 
  }
);

const Menu = models.Menu || model('Menu', menuSchema);

export default Menu;
