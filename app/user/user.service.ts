
import { type IUser } from "./user.dto";
import UserSchema from "./user.schema";

export const createUser = async (data: Partial<IUser>) => {
    const result = await UserSchema.create({ ...data, active: false });
    return result;
};

export const updateUser = async (id: string, data: Partial<IUser>) => {
    const result = await UserSchema.findOneAndUpdate({ _id: id }, data, {
        new: true,
    });
    console.log("Update user log" ,result);
    return result;
};

export const editUser = async (id: string, data: Partial<IUser>) => {
    const result = await UserSchema.findOneAndUpdate({ _id: id }, data);
    return result;
};

export const deleteUser = async (id: string) => {
    const result = await UserSchema.deleteOne({ _id: id });
    return result;
};

export const getUserById = async (id: string) => {
    const result = await UserSchema.findById(id).lean();
    return result;
};

export const getAllUser = async () => {
    const result = await UserSchema.find({}).lean();
    return result;
};
export const getUserByEmail = async (email: string) => {
    const result = await UserSchema.findOne({ email }).lean();
    return result;
}

export const getUserByVerificationToken = async (token: string) => {
  const result = await UserSchema.findOne({ verificationToken: token }).lean();
  return result;
};

