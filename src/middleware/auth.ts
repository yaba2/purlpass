import { Request, Response, NextFunction } from 'express';
import { getOrCreateUser, getUserByUid, UserProfile } from '../db/users.ts';

export interface AuthRequest extends Request {
  user?: UserProfile;
  firebaseUid?: string;
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid authorization token' });
  }

  const token = authHeader.split('Bearer ')[1].trim();

  // Decode simple token (format: base64(id:uid:timestamp))
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [userId, uid] = decoded.split(':');
    
    if (!userId || !uid) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token format' });
    }

    const user = await getUserByUid(uid);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: User not found' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account has been deactivated. Please contact support.' });
    }

    req.user = user;
    req.firebaseUid = uid;
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(503).json({ error: 'Database temporarily unavailable. Please try again.' });
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split('Bearer ')[1].trim();

  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [userId, uid] = decoded.split(':');
    
    if (userId && uid) {
      const user = await getUserByUid(uid);
      if (user && user.isActive) {
        req.user = user;
        req.firebaseUid = uid;
      }
    }
  } catch {
    // Ignore optional auth failures
  }
  next();
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden: Access requires one of [${allowedRoles.join(', ')}] role. Current role: ${req.user.role}`,
      });
    }

    next();
  };
};
