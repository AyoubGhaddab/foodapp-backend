import { connect } from "mongoose";

import { MONGO_URI } from "../config";
export default async () => {
  try {
    connect(MONGO_URI)
      .then((result) => {
        console.log("DB connected");
      })
      .catch((err) => console.log("errr" + err));
  } catch (error) {
    console.log("error", error);
  }
};
