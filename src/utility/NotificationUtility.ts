// email

// notification

// OTP
export const GenerateOtp = () => {
  const otp = Math.floor(100000 + Math.random() * 900000);
  let expiry = new Date();
  expiry.setTime(new Date().getTime() + 30 * 60 * 1000);

  return { otp, expiry };
};

export const onRequestOTP = async (otp: number, to: string) => {
  const accountSid = "AC45be6fd26f7369388f2327193fc00a78";
  const authToken = "ffa9e6aaa0e60f0fc5dc244a5076946f";
  const client = require("twilio")(accountSid, authToken);
  const response = await client.messages.create({
    body: `Welcome to AyouFood!, Your OTP is ${otp}`,
    from: "+18134384572",
    to: `+33${to}`,
  });
  return response;
};

// Payment notification or emails
