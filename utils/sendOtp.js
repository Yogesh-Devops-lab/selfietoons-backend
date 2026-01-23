import twilio from 'twilio';
import dotenv from 'dotenv';
import axios from 'axios';
dotenv.config();

 const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const sendOtp = async (mobile, otp) => {
   console.log(`Send OTP ${otp} to ${mobile}`);
   console.log("mobile, otp" , mobile, otp);
   
   try {
    await client.messages.create({
      body: `Your OTP is ${otp}`,
      from: "+16282031962",
      to: `+91${mobile}`
    });
    return true;
  } catch (err) { 
    console.error("Twilio Error:", err.message);
    return false;
  }

  // utils/sendOtp.js
  // const authKey = process.env.MSG91_AUTH_KEY; // Set this in your .env
  // const templateId = process.env.MSG91_TEMPLATE_ID; // Set your approved MSG91 template ID
  // const senderId = process.env.MSG91_SENDER_ID; // Example: "MSGIND"

  // const url = `https://api.msg91.com/api/v5/otp`;

  // console.log(mobile ,  otp)
  

  // try {
  //   const response = await axios.post(url, {
  //     mobile: `+91${mobile}`,
  //     otp: otp,
  //     sender: senderId,
  //     template_id: templateId
  //   }, {
  //     headers: {
  //       authkey: authKey,
  //       'Content-Type': 'application/json'
  //     }
  //   });

  //   if (response.data && response.data.type === 'success') {
  //     console.log("MSG91 OTP Response:", response.data);
  //     return true;
  //   } else {
  //     console.error("Unexpected MSG91 response:", response.data);
  //     return false;
  //   }
  // } catch (error) {
  //   console.error("MSG91 OTP Error:", error.response?.data || error.message);
  //   throw new Error("Failed to send OTP");
  // }
};

export default sendOtp;
  