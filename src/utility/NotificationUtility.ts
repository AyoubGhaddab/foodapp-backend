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
  const accountSid = process.env.ACCOUNT_SID;
  const authToken = process.env.AUTH_TOKEN;
  const client = require("twilio")(accountSid, authToken);
  const response = await client.messages.create({
    body: `Welcome to AyouFood!, Your OTP is ${otp}`,
    from: "+18134384572",
    to: `+33${to}`,
  });
  return response;
};

// Payment notification or emails
