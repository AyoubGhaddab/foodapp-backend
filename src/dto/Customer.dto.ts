import { IsEmail, IsEmpty, Length, isNotEmpty } from "class-validator";

export class CreateCustomerInputs {
  @IsEmail()
  email: string;

  @Length(7, 12)
  phone: string;

  @Length(6, 20)
  password: string;
}

export interface CustomerPayload {
  _id: string;
  email: string;
  verified: boolean;
}

export class UserLoginInput {
  @IsEmail()
  email: string;

  @Length(6, 20)
  password: string;
}
export class EditCustomerProfileInput {
  @Length(3, 16)
  firstName: string;

  @Length(3, 16)
  lastName: string;

  @Length(6, 16)
  address: string;
}
export class CartItem {
  _id: string;
  unit: number;
}

export class OrderInputs {
  _id: string;
  unit: number;
  txnId: string;
  amount: string;
  items: [CartItem];
}
