import jwt from "jsonwebtoken";
import Consumer from "../../modules/consumer/Consumer.js";

// Register Consumer
export const registerConsumer = async (req, res) => {
  try {
    const { name, email, mobile } = req.body;

    if (!mobile) {
      return res.status(400).json({ message: "Mobile number is required" });
    }

    // Check if mobile already verified
    const consumer = await Consumer.findOne({ mobile });
    if (!consumer || !consumer.isVerified) {
      return res.status(400).json({ message: "Mobile not verified with OTP" });
    }

    // Update with registration details
    consumer.name = name || consumer.name;
    consumer.email = email || consumer.email;

    await consumer.save();

    // Generate token
    const token = jwt.sign(
      { id: consumer._id, mobile: consumer.mobile },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Consumer registered successfully",
      consumer,
      token
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



export const sendOtp = async (req, res) => {
  try {
    const { mobile } = req.body;
    if (!mobile) return res.status(400).json({ message: "Mobile number is required" });

    let consumer = await Consumer.findOne({ mobile });

    // Generate OTP & expiry
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 5 * 60 * 1000);

    if (consumer) {
      consumer.otp = otp;
      consumer.otpExpiry = expiry;
      await consumer.save();
    } else {
      // Create minimal record to store OTP (no name/email yet)
      consumer = await Consumer.create({
        mobile,
        otp,
        otpExpiry: expiry,
        isVerified: false,
      });
    }

    // TODO: integrate real SMS. For now, return mock "sent"
    const sent = { mobileNo: mobile, otpNo: otp };

    return res.json({
      message: "OTP sent successfully",
      isExistingUser: Boolean(consumer.businessName && consumer.ownerName),
      sent
    });
  } catch (err) {
    return res.status(500).json({ message: "Error sending OTP", error: err.message });
  }
};

// STEP 2: Verify OTP (issues JWT). Also accepts optional name/email to complete new user.
export const verifyConsumerOtp = async (req, res) => {
  try {
    const {
      mobile,
      otp,
      businessName,
      ownerName,
      businessCategory,
      accountType,
      location,
    } = req.body;

    // 🔹 brandLogo from file upload OR body
    const brandLogo = req.file ? req.file.path : req.body.brandLogo;

    if (!mobile || !otp) {
      return res.status(400).json({ message: "Mobile & OTP are required" });
    }

    const consumer = await Consumer.findOne({ mobile });
    if (!consumer) {
      return res.status(404).json({ message: "Consumer not found" });
    }

    // ✅ Verify OTP
    if (
      consumer.otp !== otp ||
      !consumer.otpExpiry ||
      consumer.otpExpiry < new Date()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // ✅ Clear OTP
    consumer.otp = undefined;
    consumer.otpExpiry = undefined;
    consumer.isVerified = true;

    let profileCompletedNow = false;

    // 🔹 Profile completion check
    if (!consumer.businessName || !consumer.ownerName) {
      if (businessName && ownerName) {
        consumer.businessName = businessName;
        consumer.ownerName = ownerName;
        consumer.businessCategory = businessCategory;
        consumer.location = location;
        consumer.accountType = accountType || consumer.accountType;
        if (brandLogo) {
          consumer.brandLogo = brandLogo;
        }

        profileCompletedNow = true;
      } else {
        await consumer.save();
        return res.json({
          message:
            "OTP verified. Please complete profile (businessName, ownerName, brandLogo).",
          requireDetails: true,
          token: jwt.sign(
            { id: consumer._id, mobile: consumer.mobile },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
          ),
          isExistingUser: false,
        });
      }
    }

    await consumer.save();

    // ✅ JWT
    const token = jwt.sign(
      { id: consumer._id, mobile: consumer.mobile },
      process.env.JWT_SECRET,
      { expiresIn: "360d" }
    );

    return res.json({
      message: profileCompletedNow
        ? "Profile completed & login successful"
        : "Login successful",
      token,
      isExistingUser: true,
      data: {
        _id: consumer._id,
        businessName: consumer.businessName,
        ownerName: consumer.ownerName,
        mobile: consumer.mobile,
        brandLogo: consumer.brandLogo,
        accountType: consumer.accountType,
        businessCategory: consumer.businessCategory,
        location: consumer.location,
        isVerified: consumer.isVerified,
      },
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error verifying OTP", error: err.message });
  }
};

// STEP 3: Complete registration (for new users) after OTP verification
// Requires Bearer token from verifyConsumerOtp
// export const registerConsumer = async (req, res) => {
//   try {
//     const { name, email } = req.body;
//     // `req.userId` populated by auth middleware (see below)
//     const consumer = await Consumer.findById(req.userId);

//     if (!consumer) return res.status(404).json({ message: "User not found" });
//     if (!consumer.isVerified) return res.status(400).json({ message: "Mobile not verified with OTP" });

//     if (!name || !email) {
//       return res.status(400).json({ message: "Name & email are required" });
//     }

//     consumer.name = name;
//     consumer.email = email;
//     await consumer.save();

//     return res.json({
//       message: "Consumer profile completed successfully",
//       consumer
//     });
//   } catch (err) {
//     return res.status(500).json({ error: err.message });
//   }
// };