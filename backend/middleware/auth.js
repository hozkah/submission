const jwt = require("jsonwebtoken");
const db = require("../config/database");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    console.log("Auth middleware - Token:", token);

    if (!token) {
      console.log("Auth middleware - No token provided");
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Auth middleware - Decoded token:", decoded);

    if (!decoded.id || !decoded.role) {
      console.log("Auth middleware - Invalid token structure");
      return res.status(401).json({ message: "Invalid token structure" });
    }

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
      if (!user) {
        console.log("Auth middleware - Manager not found in users table");
        return res.status(401).json({ message: "Invalid manager account" });
      }
    } else if (decoded.role === "babysitter") {
      user = babysitters[0];
      if (!user) {
        console.log("Auth middleware - Babysitter not found in babysitters table");
        return res.status(401).json({ message: "Invalid babysitter account" });
      }
    } else {
      console.log("Auth middleware - Invalid role in token:", decoded.role);
      return res.status(401).json({ message: "Invalid role" });
    }

    console.log("Auth middleware - Selected user:", user);

    // Add role information to the user object
    user.role = decoded.role;
    console.log("Auth middleware - User role set to:", user.role);

    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware - Error:", error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "Invalid token" });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token expired" });
    }
    res.status(500).json({ message: "Authentication error" });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    if (!roles.includes(req.user.role)) {
      console.log(`Auth middleware - Access denied. Required roles: ${roles.join(', ')}, User role: ${req.user.role}`);
      return res.status(403).json({ 
        message: "Access denied",
        requiredRoles: roles,
        userRole: req.user.role
      });
    }
    next();
  };
};

module.exports = { auth, authorize };
