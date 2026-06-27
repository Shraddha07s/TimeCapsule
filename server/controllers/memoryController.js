import fs from 'fs';
import path from 'path';
import { Memory, Activity } from '../models/schemas.js';

// Helper to check if a memory is unlocked based on date
const checkAndScrubMemory = (memory) => {
  const now = new Date();
  const unlockDate = new Date(memory.unlockDate);
  const hasUnlocked = now >= unlockDate;

  if (!hasUnlocked) {
    // Memory is STILL locked. Scrub sensitive contents!
    return {
      _id: memory._id,
      title: memory.title,
      mood: memory.mood,
      category: memory.category,
      unlockDate: memory.unlockDate,
      date: memory.date,
      userId: memory.userId,
      coupleId: memory.coupleId,
      isLocked: true,
      createdAt: memory.createdAt
    };
  }

  // Memory has unlocked
  return {
    ...memory,
    isLocked: false
  };
};

export const createMemory = async (req, res) => {
  const { title, description, mood, category, tags, date, location, unlockDate } = req.body;
  const userId = req.user.id;
  const coupleId = req.user.coupleId || userId; // Fallback to userId if solo

  try {
    if (!title || !description || !mood || !category || !date || !unlockDate) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const parsedDate = new Date(date);
    const parsedUnlock = new Date(unlockDate);

    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: 'Memory date is invalid.' });
    }
    if (isNaN(parsedUnlock.getTime())) {
      return res.status(400).json({ message: 'Unlock date is invalid.' });
    }
    if (parsedUnlock <= parsedDate) {
      return res.status(400).json({ message: 'Unlock date must be in the future, after the memory date.' });
    }

    // Process files
    const media = [];
    if (req.files) {
      if (req.files.image) {
        req.files.image.forEach(file => {
          media.push({
            type: 'image',
            url: file.path
          });
        });
      }
      if (req.files.video) {
        req.files.video.forEach(file => {
          media.push({
            type: 'video',
            url: file.path
          });
        });
      }
      if (req.files.audio) {
        req.files.audio.forEach(file => {
          media.push({
            type: 'audio',
            url: file.path
          });
        });
      }
    }

    const parsedTags = tags ? (typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : tags) : [];
    
    // Determine lock state
    const isLocked = new Date(unlockDate) > new Date();

    const memory = await Memory.create({
      title,
      description,
      mood,
      category,
      tags: parsedTags,
      date,
      media,
      location: location || '',
      unlockDate,
      userId,
      coupleId,
      isLocked
    });

    // Create activity
    await Activity.create({
      coupleId,
      userId,
      username: req.user.username,
      action: 'created_memory',
      details: `added a new memory: "${title}"`,
      targetId: memory._id,
      type: 'activity'
    });

    res.status(201).json(memory);
  } catch (error) {
    console.error('Create memory error:', error.message);
    res.status(500).json({ message: 'Server error during memory creation' });
  }
};

export const getMemories = async (req, res) => {
  const coupleId = req.user.coupleId || req.user.id;
  const { category, mood, isLocked, search, sort } = req.query;

  try {
    const query = { coupleId };

    if (category) query.category = category;
    if (mood) query.mood = mood;

    let memories = await Memory.find(query);

    // Apply text search
    if (search) {
      const searchLower = search.toLowerCase();
      memories = memories.filter(m => 
        m.title.toLowerCase().includes(searchLower) ||
        (m.description && m.description.toLowerCase().includes(searchLower)) ||
        (m.tags && m.tags.some(t => t.toLowerCase().includes(searchLower)))
      );
    }

    // Scrub locked memories dynamically
    const now = new Date();
    let processedMemories = memories.map(m => {
      const unlockDate = new Date(m.unlockDate);
      const isPastUnlock = now >= unlockDate;
      
      // Update DB state if it was locked in DB but should be unlocked now
      if (m.isLocked && isPastUnlock) {
        Memory.findByIdAndUpdate(m._id, { isLocked: false }).catch(err => console.error(err));
        m.isLocked = false;
      }
      
      return checkAndScrubMemory(m);
    });

    // Apply local isLocked filter
    if (isLocked !== undefined) {
      const filterLocked = isLocked === 'true';
      processedMemories = processedMemories.filter(m => m.isLocked === filterLocked);
    }

    // Apply sorting
    if (sort) {
      if (sort === 'date_desc') {
        processedMemories.sort((a, b) => new Date(b.date) - new Date(a.date));
      } else if (sort === 'date_asc') {
        processedMemories.sort((a, b) => new Date(a.date) - new Date(b.date));
      } else if (sort === 'unlock_asc') {
        processedMemories.sort((a, b) => new Date(a.unlockDate) - new Date(b.unlockDate));
      } else if (sort === 'title_asc') {
        processedMemories.sort((a, b) => a.title.localeCompare(b.title));
      }
    } else {
      // Default: date descending (most recent first)
      processedMemories.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    res.json(processedMemories);
  } catch (error) {
    console.error('Get memories error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMemoryById = async (req, res) => {
  const { id } = req.params;
  const coupleId = req.user.coupleId || req.user.id;

  try {
    const memory = await Memory.findById(id);

    if (!memory) {
      return res.status(404).json({ message: 'Memory not found' });
    }

    if (memory.coupleId !== coupleId) {
      return res.status(403).json({ message: 'Access denied: not your memory' });
    }

    const now = new Date();
    const unlockDate = new Date(memory.unlockDate);
    const isPastUnlock = now >= unlockDate;

    if (memory.isLocked && isPastUnlock) {
      await Memory.findByIdAndUpdate(id, { isLocked: false });
      memory.isLocked = false;
    }

    const processed = checkAndScrubMemory(memory);

    if (processed.isLocked) {
      return res.status(403).json({
        message: 'This memory is still locked. Nice try!',
        unlockDate: memory.unlockDate
      });
    }

    res.json(processed);
  } catch (error) {
    console.error('Get memory by ID error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteMemory = async (req, res) => {
  const { id } = req.params;
  const coupleId = req.user.coupleId || req.user.id;

  try {
    const memory = await Memory.findById(id);

    if (!memory) {
      return res.status(404).json({ message: 'Memory not found' });
    }

    if (memory.coupleId !== coupleId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Delete files locally if present
    if (memory.media) {
      memory.media.forEach(m => {
        if (m.url.startsWith('/uploads/')) {
          const filePath = path.join(process.cwd(), 'server', m.url);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      });
    }

    await Memory.findByIdAndDelete(id);

    // Create activity
    await Activity.create({
      coupleId,
      userId: req.user.id,
      username: req.user.username,
      action: 'deleted_memory',
      details: `deleted memory: "${memory.title}"`,
      type: 'activity'
    });

    res.json({ message: 'Memory deleted successfully' });
  } catch (error) {
    console.error('Delete memory error:', error.message);
    res.status(500).json({ message: 'Server error during delete' });
  }
};
