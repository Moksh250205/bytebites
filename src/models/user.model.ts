import { Schema, model, models } from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true, select: false }, 
    isVerified: {type: Boolean, default: false}, 
    upiId: { type: [{id: { type: String, default: null },
      provider: { type: String, default: null },
    }]}
    ,
    socketId: { type: String }, 
    topPicks: { type: [String], default: [] },

  },
  {
    timestamps: true, 
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    console.error(error); 
  }
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = models.User || model('User', userSchema);
export default User;
