import mongoose from 'mongoose';
import { localDB } from '../services/localDB.js';

let isMongoConnected = false;

export const setMongoConnected = (status) => {
  isMongoConnected = status;
};

export const getMongoConnected = () => isMongoConnected;

// ==========================================
// 1. Mongoose Schema Definitions
// ==========================================

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  coupleId: { type: String, default: null },
  inviteCode: { type: String, default: null },
  avatar: { type: String, default: '' },
  bio: { type: String, default: '' },
  anniversaryDate: { type: String, default: '' },
  relationshipStartDate: { type: String, default: '' },
  favoriteSong: { type: String, default: '' },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String, default: null },
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpires: { type: Date, default: null },
  theme: { type: String, default: 'dark' },
}, { timestamps: true });

const CoupleSchema = new mongoose.Schema({
  user1: { type: String, required: true }, // User ID 1
  user2: { type: String, required: true }, // User ID 2
  anniversaryDate: { type: String, default: '' },
  relationshipStartDate: { type: String, default: '' },
  favoriteSong: { type: String, default: '' },
  sharedPlaylist: { type: String, default: '' },
}, { timestamps: true });

const MemorySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  mood: { type: String, required: true },
  category: { type: String, required: true },
  tags: [{ type: String }],
  date: { type: String, required: true },
  media: [{
    type: { type: String, enum: ['image', 'video', 'audio'] },
    url: { type: String },
    publicId: { type: String }
  }],
  location: { type: String, default: '' },
  unlockDate: { type: String, required: true },
  userId: { type: String, required: true },
  coupleId: { type: String, required: true },
  isLocked: { type: Boolean, default: true },
}, { timestamps: true });

const LetterSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  senderId: { type: String, required: true },
  recipientType: { type: String, enum: ['self', 'partner'], required: true },
  recipientId: { type: String, default: null }, // Null if self, partner's userId if partner
  unlockDate: { type: String, required: true },
  coupleId: { type: String, required: true },
  isLocked: { type: Boolean, default: true },
}, { timestamps: true });

const JournalSchema = new mongoose.Schema({
  weekStartDate: { type: String, required: true }, // e.g. "2026-W26" or similar unique string representing the week
  entries: [{
    userId: { type: String, required: true },
    username: { type: String, required: true },
    content: { type: String, required: true },
    mood: { type: String, default: '' },
    updatedAt: { type: Date, default: Date.now }
  }],
  coupleId: { type: String, required: true },
  unlockDate: { type: String, required: true }, // Usually locked until the next week or custom date
  isLocked: { type: Boolean, default: true },
}, { timestamps: true });

const ActivitySchema = new mongoose.Schema({
  coupleId: { type: String, required: true },
  userId: { type: String, required: true },
  username: { type: String, required: true },
  action: { type: String, required: true }, // e.g., "created a memory", "wrote a letter", etc.
  details: { type: String, default: '' },
  targetId: { type: String, default: null }, // Memory, letter or journal ID
  type: { type: String, default: 'activity' }, // 'activity', 'notification', etc.
  isReadByPartner: { type: Boolean, default: false }
}, { timestamps: true });

// Prevent mongoose model compilation errors during hot reload
const MongoUser = mongoose.models.User || mongoose.model('User', UserSchema);
const MongoCouple = mongoose.models.Couple || mongoose.model('Couple', CoupleSchema);
const MongoMemory = mongoose.models.Memory || mongoose.model('Memory', MemorySchema);
const MongoLetter = mongoose.models.Letter || mongoose.model('Letter', LetterSchema);
const MongoJournal = mongoose.models.Journal || mongoose.model('Journal', JournalSchema);
const MongoActivity = mongoose.models.Activity || mongoose.model('Activity', ActivitySchema);

// ==========================================
// 2. Unified Wrapper Factory
// ==========================================

const makeUnifiedModel = (mongoModel, localCollectionName) => {
  const localColl = localDB[localCollectionName];

  return {
    find: async (query = {}) => {
      if (isMongoConnected) return mongoModel.find(query).lean();
      return localColl.find(query);
    },
    findOne: async (query = {}) => {
      if (isMongoConnected) return mongoModel.findOne(query).lean();
      return localColl.findOne(query);
    },
    findById: async (id) => {
      if (isMongoConnected) return mongoModel.findById(id).lean();
      return localColl.findById(id);
    },
    create: async (data) => {
      if (isMongoConnected) {
        const doc = await mongoModel.create(data);
        return doc.toObject();
      }
      return localColl.create(data);
    },
    findByIdAndUpdate: async (id, update, options = {}) => {
      if (isMongoConnected) {
        return mongoModel.findByIdAndUpdate(id, update, { new: true, ...options }).lean();
      }
      return localColl.findByIdAndUpdate(id, update, options);
    },
    findOneAndUpdate: async (query, update, options = {}) => {
      if (isMongoConnected) {
        return mongoModel.findOneAndUpdate(query, update, { new: true, ...options }).lean();
      }
      const item = await localColl.findOne(query);
      if (!item) {
        if (options.upsert) {
          const createData = update.$set ? { ...query, ...update.$set } : { ...query, ...update };
          return localColl.create(createData);
        }
        return null;
      }
      return localColl.findByIdAndUpdate(item._id, update, options);
    },
    findByIdAndDelete: async (id) => {
      if (isMongoConnected) return mongoModel.findByIdAndDelete(id).lean();
      return localColl.findByIdAndDelete(id);
    },
    countDocuments: async (query = {}) => {
      if (isMongoConnected) return mongoModel.countDocuments(query);
      return localColl.countDocuments(query);
    }
  };
};

export const User = makeUnifiedModel(MongoUser, 'users');
export const Couple = makeUnifiedModel(MongoCouple, 'couples');
export const Memory = makeUnifiedModel(MongoMemory, 'memories');
export const Letter = makeUnifiedModel(MongoLetter, 'letters');
export const Journal = makeUnifiedModel(MongoJournal, 'journals');
export const Activity = makeUnifiedModel(MongoActivity, 'activities');
