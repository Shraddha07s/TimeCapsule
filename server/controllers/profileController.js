import { User, Couple, Activity } from '../models/schemas.js';

export const updateProfile = async (req, res) => {
  const userId = req.user.id;
  const {
    username,
    bio,
    avatar,
    theme,
    anniversaryDate,
    relationshipStartDate,
    favoriteSong,
    sharedPlaylist
  } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Build update object for user
    const userUpdate = {};
    if (username) userUpdate.username = username;
    if (bio !== undefined) userUpdate.bio = bio;
    if (avatar !== undefined) userUpdate.avatar = avatar;
    if (theme) userUpdate.theme = theme;
    if (anniversaryDate !== undefined) userUpdate.anniversaryDate = anniversaryDate;
    if (relationshipStartDate !== undefined) userUpdate.relationshipStartDate = relationshipStartDate;
    if (favoriteSong !== undefined) userUpdate.favoriteSong = favoriteSong;

    const updatedUser = await User.findByIdAndUpdate(userId, userUpdate);

    // If connected, sync shared fields to Couple record
    if (user.coupleId) {
      const coupleUpdate = {};
      if (anniversaryDate !== undefined) coupleUpdate.anniversaryDate = anniversaryDate;
      if (relationshipStartDate !== undefined) coupleUpdate.relationshipStartDate = relationshipStartDate;
      if (favoriteSong !== undefined) coupleUpdate.favoriteSong = favoriteSong;
      if (sharedPlaylist !== undefined) coupleUpdate.sharedPlaylist = sharedPlaylist;

      if (Object.keys(coupleUpdate).length > 0) {
        await Couple.findByIdAndUpdate(user.coupleId, coupleUpdate);
        
        // Log activity for update
        await Activity.create({
          coupleId: user.coupleId,
          userId: userId,
          username: req.user.username,
          action: 'updated_profile',
          details: 'updated their relationship details',
          type: 'activity'
        });
      }
    }

    res.status(200).json({
      message: 'Profile updated successfully!',
      user: {
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        coupleId: updatedUser.coupleId,
        avatar: updatedUser.avatar,
        bio: updatedUser.bio,
        theme: updatedUser.theme,
        anniversaryDate: updatedUser.anniversaryDate,
        relationshipStartDate: updatedUser.relationshipStartDate,
        favoriteSong: updatedUser.favoriteSong
      }
    });
  } catch (error) {
    console.error('Update profile error:', error.message);
    res.status(500).json({ message: 'Server error during profile update' });
  }
};
