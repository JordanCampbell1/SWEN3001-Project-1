import { JwtPayload, verify } from 'jsonwebtoken';
import User from '../models/User';
import { NextFunction } from 'express';

// Middleware to check if the user is authenticated
const protect = async (req: any, res: any, next: NextFunction) => {
  let token;

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      const jwtSecret = process.env.JWT_SECRET;

      if(!jwtSecret){
        throw new Error("JWT SECRET is not defined in environment variables");
      }
      // Verify token
      const decoded: string | JwtPayload = verify(token, jwtSecret);

      // Get user from token assuming it is a JWT Payload
      if (typeof decoded === 'object' && decoded !== null && 'id' in decoded) {
        req.user = await User.findById(decoded.id).select('-password');
      }

      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export default protect;