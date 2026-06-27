import { Journal, Activity } from '../models/schemas.js';

// Helper to compute ISO-8601 week number string (e.g., "2026-W26")
const getWeekString = (date = new Date()) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
};

// Helper to find the next Monday (standard lock date for weekly entries)
const getNextMonday = () => {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() + (day === 0 ? 1 : 8 - day); // next Monday
  const nextMonday = new Date(d.setDate(diff));
  nextMonday.setHours(0, 0, 0, 0);
  return nextMonday.toISOString().split('T')[0];
};

export const contributeJournal = async (req, res) => {
  const { content, mood, unlockDate } = req.body;
  const userId = req.user.id;
  const coupleId = req.user.coupleId || userId;
  const currentWeek = getWeekString();

  try {
    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const defaultUnlockDate = unlockDate || getNextMonday();
    const parsedUnlock = new Date(defaultUnlockDate);
    if (isNaN(parsedUnlock.getTime())) {
      return res.status(400).json({ message: 'Unlock date is invalid.' });
    }
    if (parsedUnlock <= new Date()) {
      return res.status(400).json({ message: 'Unlock date must be in the future.' });
    }

    const isLocked = parsedUnlock > new Date();

    // Check if journal for this week exists
    let journal = await Journal.findOne({ weekStartDate: currentWeek, coupleId });

    if (journal) {
      // Find user's existing entry in this week
      const entryIndex = journal.entries.findIndex(entry => entry.userId === userId);
      
      const newEntry = {
        userId,
        username: req.user.username,
        content,
        mood: mood || '',
        updatedAt: new Date()
      };

      let updatedEntries = [...journal.entries];
      if (entryIndex !== -1) {
        // Update user's existing entry
        updatedEntries[entryIndex] = newEntry;
      } else {
        // Add new entry for user
        updatedEntries.push(newEntry);
      }

      journal = await Journal.findByIdAndUpdate(
        journal._id,
        {
          entries: updatedEntries,
          unlockDate: defaultUnlockDate,
          isLocked
        }
      );
    } else {
      // Create new week journal
      journal = await Journal.create({
        weekStartDate: currentWeek,
        entries: [{
          userId,
          username: req.user.username,
          content,
          mood: mood || '',
          updatedAt: new Date()
        }],
        coupleId,
        unlockDate: defaultUnlockDate,
        isLocked
      });
    }

    // Create activity log
    await Activity.create({
      coupleId,
      userId,
      username: req.user.username,
      action: 'wrote_journal',
      details: `contributed to the journal for week ${currentWeek}`,
      targetId: journal._id,
      type: 'activity'
    });

    res.status(200).json(journal);
  } catch (error) {
    console.error('Contribute journal error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getJournals = async (req, res) => {
  const coupleId = req.user.coupleId || req.user.id;

  try {
    const journals = await Journal.find({ coupleId });
    const now = new Date();

    // Process and scrub locked journals
    const processedJournals = journals.map(j => {
      const unlockDate = new Date(j.unlockDate);
      const isPastUnlock = now >= unlockDate;

      // Auto unlock
      if (j.isLocked && isPastUnlock) {
        Journal.findByIdAndUpdate(j._id, { isLocked: false }).catch(err => console.error(err));
        j.isLocked = false;
      }

      // If locked, scrub individual user contents
      if (j.isLocked) {
        return {
          _id: j._id,
          weekStartDate: j.weekStartDate,
          coupleId: j.coupleId,
          unlockDate: j.unlockDate,
          isLocked: true,
          createdAt: j.createdAt,
          entries: j.entries.map(entry => ({
            userId: entry.userId,
            username: entry.username,
            mood: entry.mood,
            updatedAt: entry.updatedAt
            // Content is scrubbed!
          }))
        };
      }

      return j;
    });

    // Sort by weekStartDate descending (newest first)
    processedJournals.sort((a, b) => b.weekStartDate.localeCompare(a.weekStartDate));

    res.json(processedJournals);
  } catch (error) {
    console.error('Get journals error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getJournalById = async (req, res) => {
  const { id } = req.params;
  const coupleId = req.user.coupleId || req.user.id;

  try {
    const journal = await Journal.findById(id);

    if (!journal) {
      return res.status(404).json({ message: 'Journal not found' });
    }

    if (journal.coupleId !== coupleId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const now = new Date();
    const unlockDate = new Date(journal.unlockDate);
    const isPastUnlock = now >= unlockDate;

    if (journal.isLocked && isPastUnlock) {
      await Journal.findByIdAndUpdate(id, { isLocked: false });
      journal.isLocked = false;
    }

    if (journal.isLocked) {
      return res.status(403).json({
        message: 'This weekly journal is locked',
        unlockDate: journal.unlockDate
      });
    }

    res.json(journal);
  } catch (error) {
    console.error('Get journal by ID error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};
