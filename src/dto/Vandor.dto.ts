export interface CreateVandorInput {
  name: string;
  ownerName: string;
  foodType: [string];
  pincode: string;
  address: string;
  phone: string;
  email: string;
  password: string;
}
export interface VandorLoginInputs {
  email: string;
  password: string;
}
export interface VandorPayload {
  _id: string;
  email: string;
  name: string;
  foodTypes: [string];
}

export interface EditVandorInputs {
  name: string;
  email: string;
  phone: string;
  foodTypes: [string];
  address: string;
  serviceAvailble: boolean;
}
export interface CreateOfferInputs {
  offerType: string; // VENDOR // GENERIC
  vandors: [any]; // ['876689bdyuzbydz']
  title: string; // -10euro on weekend
  description: string; // any description
  minValue: number; // minumum order amount
  offerAmount: number; // 10
  startValidity: Date; // today
  endValidity: Date; // 02/06/2024
  promocode: string; // WEEKMIN10
  promoType: string; // USER // ALL // BANK // CARD
  bank: [any];
  bins: [any];
  pincode: string; // area availabke
  isActive: boolean; //
}
