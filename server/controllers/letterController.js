import { Letter, Activity, Couple } from '../models/schemas.js';

export const createLetter = async (req, res) => {
  const { title, content, recipientType, unlockDate } = req.body;
  const userId = req.user.id;
  const coupleId = req.user.coupleId;

  try {
    if (!title || !content || !recipientType || !unlockDate) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const parsedUnlock = new Date(unlockDate);
    if (isNaN(parsedUnlock.getTime())) {
      return res.status(400).json({ message: 'Unlock date is invalid.' });
    }
    if (parsedUnlock <= new Date()) {
      return res.status(400).json({ message: 'Unlock date must be in the future.' });
    }

    let recipientId = null;

    if (recipientType === 'partner') {
      if (!coupleId) {
        return res.status(400).json({ message: 'You must connect with a partner to send a letter to them' });
      }
      
      const couple = await Couple.findById(coupleId);
      if (!couple) {
        return res.status(404).json({ message: 'Couple connection not found' });
      }
      
      recipientId = couple.user1 === userId ? couple.user2 : couple.user1;
    }

    const isLocked = new Date(unlockDate) > new Date();

    const letter = await Letter.create({
      title,
      content,
      senderId: userId,
      recipientType,
      recipientId,
      unlockDate,
      coupleId: coupleId || userId, // Use userId as coupleId if solo
      isLocked
    });

    // Create activity log
    await Activity.create({
      coupleId: coupleId || userId,
      userId: userId,
      username: req.user.username,
      action: 'wrote_letter',
      details: recipientType === 'partner' ? 'wrote a letter to their partner' : 'wrote a letter to their future self',
      targetId: letter._id,
      type: 'activity'
    });

    res.status(201).json(letter);
  } catch (error) {
    console.error('Create letter error:', error.message);
    res.status(500).json({ message: 'Server error during letter creation' });
  }
};

export const getLetters = async (req, res) => {
  const userId = req.user.id;
  const coupleId = req.user.coupleId || userId;

  try {
    // Letters are accessible if:
    // 1. Sender is the user
    // 2. Recipient is the user (partner letters sent to them)
    // Query either sent by user OR (sent to user AND coupleId matches)
    const letters = await Letter.find({
      $or: [
        { senderId: userId },
        { recipientId: userId }
      ]
    });

    const now = new Date();

    // Process and scrub locked letters
    const processedLetters = letters.map(l => {
      const unlockDate = new Date(l.unlockDate);
      const isPastUnlock = now >= unlockDate;

      // Automatically unlock if unlock date has passed
      if (l.isLocked && isPastUnlock) {
        Letter.findByIdAndUpdate(l._id, { isLocked: false }).catch(err => console.error(err));
        l.isLocked = false;
      }

      // If it is locked, remove the content
      if (l.isLocked) {
        return {
          _id: l._id,
          title: l.title,
          senderId: l.senderId,
          recipientType: l.recipientType,
          recipientId: l.recipientId,
          unlockDate: l.unlockDate,
          coupleId: l.coupleId,
          isLocked: true,
          createdAt: l.createdAt
        };
      }

      return l;
    });

    // Sort: unlock date ascending (soonest to unlock or newly unlocked first)
    processedLetters.sort((a, b) => new Date(a.unlockDate) - new Date(b.unlockDate));

    res.json(processedLetters);
  } catch (error) {
    console.error('Get letters error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getLetterById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const letter = await Letter.findById(id);

    if (!letter) {
      return res.status(404).json({ message: 'Letter not found' });
    }

    // Check if user has access to this letter (either sender or recipient)
    if (letter.senderId !== userId && letter.recipientId !== userId) {
      return res.status(403).json({ message: 'Access denied: you are not authorized to view this letter' });
    }

    const now = new Date();
    const unlockDate = new Date(letter.unlockDate);
    const isPastUnlock = now >= unlockDate;

    if (letter.isLocked && isPastUnlock) {
      await Letter.findByIdAndUpdate(id, { isLocked: false });
      letter.isLocked = false;
    }

    if (letter.isLocked) {
      return res.status(403).json({
        message: 'This letter is locked until the specified date',
        unlockDate: letter.unlockDate
      });
    }

    res.json(letter);
  } catch (error) {
    console.error('Get letter by ID error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};
