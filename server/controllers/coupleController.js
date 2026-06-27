import { User, Couple, Activity } from '../models/schemas.js';

export const connectPartner = async (req, res) => {
  const { inviteCode } = req.body;
  const userId = req.user.id;

  try {
    if (!inviteCode) {
      return res.status(400).json({ message: 'Please provide an invite code' });
    }

    const currentUser = await User.findById(userId);
    if (currentUser.coupleId) {
      return res.status(400).json({ message: 'You are already connected to a partner. Disconnect first.' });
    }

    // Find the partner with this invite code
    const partner = await User.findOne({ inviteCode: inviteCode.trim().toUpperCase() });
    
    if (!partner) {
      return res.status(404).json({ message: 'Invalid invite code. Partner not found.' });
    }

    if (partner._id === userId) {
      return res.status(400).json({ message: 'You cannot connect with yourself.' });
    }

    if (partner.coupleId) {
      return res.status(400).json({ message: 'This partner is already connected to someone else.' });
    }

    // Create Couple document
    const newCouple = await Couple.create({
      user1: userId,
      user2: partner._id,
      anniversaryDate: currentUser.anniversaryDate || partner.anniversaryDate || '',
      relationshipStartDate: currentUser.relationshipStartDate || partner.relationshipStartDate || '',
      favoriteSong: currentUser.favoriteSong || partner.favoriteSong || ''
    });

    // Update both users with new couple ID
    await User.findByIdAndUpdate(userId, { coupleId: newCouple._id });
    await User.findByIdAndUpdate(partner._id, { coupleId: newCouple._id });

    // Log activity
    await Activity.create({
      coupleId: newCouple._id,
      userId: userId,
      username: req.user.username,
      action: 'connected',
      details: `connected with ${partner.username}!`,
      type: 'activity'
    });

    res.status(200).json({
      message: 'Successfully connected with your partner!',
      coupleId: newCouple._id,
      partner: {
        _id: partner._id,
        username: partner.username,
        email: partner.email,
        avatar: partner.avatar,
        bio: partner.bio
      }
    });
  } catch (error) {
    console.error('Connect partner error:', error.message);
    res.status(500).json({ message: 'Server error during connection' });
  }
};

export const getPartnerProfile = async (req, res) => {
  const { coupleId } = req.user;

  try {
    if (!coupleId) {
      return res.status(200).json({ partner: null });
    }

    const couple = await Couple.findById(coupleId);
    if (!couple) {
      return res.status(404).json({ message: 'Couple connection not found' });
    }

    // Determine partner's ID
    const partnerId = couple.user1 === req.user.id ? couple.user2 : couple.user1;
    const partner = await User.findById(partnerId);

    if (!partner) {
      return res.status(404).json({ message: 'Partner profile not found' });
    }

    res.status(200).json({
      partner: {
        _id: partner._id,
        username: partner.username,
        email: partner.email,
        avatar: partner.avatar,
        bio: partner.bio,
        theme: partner.theme,
        anniversaryDate: partner.anniversaryDate,
        relationshipStartDate: partner.relationshipStartDate,
        favoriteSong: partner.favoriteSong
      },
      coupleDetails: {
        anniversaryDate: couple.anniversaryDate,
        relationshipStartDate: couple.relationshipStartDate,
        favoriteSong: couple.favoriteSong,
        sharedPlaylist: couple.sharedPlaylist
      }
    });
  } catch (error) {
    console.error('Get partner profile error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

export const disconnectPartner = async (req, res) => {
  const { coupleId } = req.user;

  try {
    if (!coupleId) {
      return res.status(400).json({ message: 'You are not connected to anyone' });
    }

    const couple = await Couple.findById(coupleId);
    if (!couple) {
      return res.status(404).json({ message: 'Couple connection not found' });
    }

    // Reset couple IDs on both users
    await User.findByIdAndUpdate(couple.user1, { coupleId: null });
    await User.findByIdAndUpdate(couple.user2, { coupleId: null });

    // Delete Couple document
    await Couple.findByIdAndDelete(coupleId);

    res.status(200).json({ message: 'Partner disconnected successfully.' });
  } catch (error) {
    console.error('Disconnect partner error:', error.message);
    res.status(500).json({ message: 'Server error during disconnect' });
  }
};
