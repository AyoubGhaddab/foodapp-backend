import { ConnectOptions, connect } from "mongoose";
import { config } from "dotenv";
config();
import { MONGO_URI } from "../config";
export default async () => {
  try {
    type ConnectionOptionsExtend = {
      useNewUrlParser: boolean;
      useUnifiedTopology: boolean;
    };
    const options: ConnectOptions & ConnectionOptionsExtend = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };
    connect(MONGO_URI, options)
      .then((result) => {
        console.log("DB connected");
      })
      .catch((err) => console.log("errr" + err));
  } catch (error) {
    console.log("error", error);
  }
};
