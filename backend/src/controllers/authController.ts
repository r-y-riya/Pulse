import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

const JWT_SECRET = process.env.JWT_SECRET!;
const REFRESH_SECRET = JWT_SECRET + '_refresh';

const generateTokens = (user: any) => {
  const userId = user._id || user.id;
  const expiresIn = (process.env.JWT_EXPIRES_IN || '1d') as any;
  const accessToken = jwt.sign({ id: userId, role: user.role || 'user' }, JWT_SECRET, { expiresIn });
  const refreshToken = jwt.sign({ id: userId }, REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    const { accessToken, refreshToken } = generateTokens(user);

    res.status(201).json({
      token: accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profile: user.profile,
        settings: user.settings,
        macroTargets: user.macroTargets
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    res.json({
      token: accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profile: user.profile,
        settings: user.settings,
        macroTargets: user.macroTargets
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ message: 'No refresh token provided' });

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET) as { id: string };
    
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: 'User not found' });

    const tokens = generateTokens(user);
    res.json({
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken
    });
  } catch (err) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, profile, settings, macroTargets } = req.body;

    const user = await User.findById(req.user?.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = name;
    if (profile) user.profile = { ...user.profile, ...profile };
    if (settings) user.settings = { ...user.settings, ...settings };
    if (macroTargets) user.macroTargets = { ...user.macroTargets, ...macroTargets };

    user.updatedAt = new Date();
    await user.save();

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      profile: user.profile,
      settings: user.settings,
      macroTargets: user.macroTargets
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const changePassword = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user?.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Old password is incorrect' });

    user.password = await bcrypt.hash(newPassword, 10);
    user.updatedAt = new Date();
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found with this email' });
    
    res.json({ message: 'Password reset link sent (Mocked).' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Password reset successful' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
