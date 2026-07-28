import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const getJwtSecret = (): string => {
  return process.env.JWT_SECRET || '';
};

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const protect = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, getJwtSecret()) as { id: string; role: string };
      
      req.user = {
        id: decoded.id,
        role: decoded.role
      };
      
      return next();
    } catch (error) {
      console.error("Token verification failed:", error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

export const adminOnly = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Admin role required' });
  }
};
