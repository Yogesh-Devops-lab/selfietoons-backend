import jwt from 'jsonwebtoken';
import User from '../modules/onBoarding/User.js'

export const onBoardauth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: "Token missing" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔍 Fetch the full user details using the ID in the token
    const user = await User.findById(decoded.userId); // Or decoded._id based on your token

    if (!user) {
      return res.status(401).json({ message: "User not found or unauthorized" });
    }

    req.user = user; // ✅ Attach full user object to request
    next();
  } catch (err) {   
    console.error('Auth Error:', err.message);
    return res.status(401).json({ message: "Invalid or expired token", error: err.message });
  }
};

//  default auth;

export const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: "Token missing" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

//  default auth;

export const verifyUserToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId; // assuming token has userId
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};
