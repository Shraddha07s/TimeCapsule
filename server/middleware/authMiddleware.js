import jwt from 'jsonwebtoken';
import { User } from '../models/schemas.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_romantic_key_1234');

      // Get user from the database
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      // Attach user object to request
      req.user = {
        id: user._id,
        username: user.username,
        email: user.email,
        coupleId: user.coupleId,
        avatar: user.avatar
      };

      next();
    } catch (error) {
      console.error('Auth middleware error:', error.message);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};
