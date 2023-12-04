import mongoose from 'mongoose';

export interface UserDocument extends mongoose.Document {
  email: String;
  name: String;
  played: number;
  wins: number;
  losses: number;
  disconnects: number;
  firstMatch: String;
  lastMatch: String;
  inMatch: boolean;
}

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  picture: {
    type: String,
    default: '/img/default.jpeg',
  },
  played: {
    type: Number,
    default: 0,
  },
  wins: {
    type: Number,
    default: 0,
  },
  losses: {
    type: Number,
    default: 0,
  },
  disconnects: {
    type: Number,
    default: 0,
  },
  firstMatch: {
    type: String,
    default: '---',
  },
  lastMatch: {
    type: String,
    default: '---',
  },
  inMatch: {
    type: Boolean,
    default: false,
  },
});

export default mongoose.model<UserDocument>('User', UserSchema);
