import { Request, Response } from 'express';
import User from '../models/user.model';
import { Document } from 'mongoose';

const authenticateUser = async (req: Request, res: Response) => {
  const { token, name, email, picture } = req.body;

  let user: Document | null = await User.findOne({ email: email });

  if (!user) {
    user = new User({
      email: email,
      name: name,
      picture: picture,
    });

    await user.save();
  }

  res.json({ user, token });
};

export { authenticateUser };
