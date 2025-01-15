
import { type BaseSchema } from "../common/dto/base.dto";

export interface IUser extends BaseSchema {
  name: string;
  email: string;
  active?: boolean;
  role: "USER" | "ADMIN";
  password: string;
  age: number;
  phone: number;
  refToken?: string;
  qualification?: string;
  verificationToken: string;
  kycDocument: string;
  TwoFA:boolean;
}
