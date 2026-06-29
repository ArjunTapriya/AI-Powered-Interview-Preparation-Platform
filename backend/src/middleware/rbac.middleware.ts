import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

/**
 * Middleware to protect routes based on allowed roles.
 * Expects a valid JWT in Authorization header (Bearer token).
 * JWT payload must contain a `role` field matching Role enum.
 */
export const rbacMiddleware = (allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({ message: 'Missing Authorization header' });
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Invalid Authorization header' });
    }
    try {
      const payload = jwt.verify(token, env.ADMIN_JWT_SECRET || env.JWT_SECRET) as any;
      const userRole = payload.role as Role;
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ message: 'Forbidden: insufficient role' });
      }
      // Attach role and userId to request for downstream use
      (req as any).user = { id: payload.sub, role: userRole };
      return next();
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token', error: err });
    }
  };
};
