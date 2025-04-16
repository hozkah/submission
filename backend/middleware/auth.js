const jwt = require("jsonwebtoken");
const db = require("../config/database");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    console.log("Auth middleware - Token:", token);

    if (!token) {
      console.log("Auth middleware - No token provided");
      throw new Error();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Auth middleware - Decoded token:", decoded);

    // Check in both users and babysitters tables
    let [users] = await db.query(
      "SELECT * FROM users WHERE id = ? AND is_active = 1",
      [decoded.id]
    );
    console.log("Auth middleware - Users found:", users);

    let [babysitters] = await db.query(
      "SELECT * FROM babysitters WHERE id = ? AND is_active = 1",
      [decoded.id]
    );
    console.log("Auth middleware - Babysitters found:", babysitters);

    // Determine which user to use based on the role in the token
    let user;
    if (decoded.role === "manager") {
      user = users[0];
    } else if (decoded.role === "babysitter") {
      user = babysitters[0];
    }

    console.log("Auth middleware - Selected user:", user);

    if (!user) {
      console.log("Auth middleware - No user found");
      throw new Error();
    }

    // Add role information to the user object
    user.role = decoded.role;
    console.log("Auth middleware - User role set to:", user.role);

    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware - Error:", error);
    res.status(401).json({ message: "Please authenticate." });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};

module.exports = { auth, authorize };
