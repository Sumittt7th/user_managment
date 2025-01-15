
import mongoose from "mongoose";
import { type IUser } from "./user.dto";
import bcrypt from 'bcrypt';

const Schema = mongoose.Schema;

const hashPassword = async (password: string) => {
        const hash = await bcrypt.hash(password, 12);
        return hash;
};

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    active: { type: Boolean, required: false, default: false },
    role: {
      type: String,
      required: true,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },
    password: { type: String },
    age: { type: Number },
    phone: { type: Number },
    verificationToken: { type: String },
    qualification: { type: String },
    refToken: { type: String },
    kycDocument : {type: String},
    TwoFA: { type: Boolean, default: true },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
        if (this.password) {
                this.password = await hashPassword(this.password);
        }
        next();
});

export default mongoose.model<IUser>("user", UserSchema);
