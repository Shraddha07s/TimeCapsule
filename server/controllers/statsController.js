import { Memory, Letter, Activity, Couple, User } from '../models/schemas.js';

export const getDashboardStats = async (req, res) => {
  const userId = req.user.id;
  const coupleId = req.user.coupleId || userId;

  try {
    // 1. Get memory counts
    const totalMemories = await Memory.countDocuments({ coupleId });
    
    // We fetch all to check lock states dynamically in code
    const memories = await Memory.find({ coupleId });
    const now = new Date();
    
    let lockedCount = 0;
    let unlockedCount = 0;
    const upcomingUnlocks = [];

    memories.forEach(m => {
      const unlockDate = new Date(m.unlockDate);
      const isLocked = now < unlockDate;
      if (isLocked) {
        lockedCount++;
        upcomingUnlocks.push({
          _id: m._id,
          title: m.title,
          unlockDate: m.unlockDate,
          mood: m.mood,
          category: m.category
        });
      } else {
        unlockedCount++;
      }
    });

    // Sort upcoming unlocks by unlockDate ascending and slice to top 3
    upcomingUnlocks.sort((a, b) => new Date(a.unlockDate) - new Date(b.unlockDate));
    const topUpcoming = upcomingUnlocks.slice(0, 3);

    // 2. Fetch connection details
    let daysTogether = null;
    let anniversaryCountdown = null;
    let relationStartDateStr = '';
    let anniversaryDateStr = '';

    const user = await User.findById(userId);
    relationStartDateStr = user.relationshipStartDate;
    anniversaryDateStr = user.anniversaryDate;

    if (req.user.coupleId) {
      const couple = await Couple.findById(req.user.coupleId);
      if (couple) {
        if (couple.relationshipStartDate) relationStartDateStr = couple.relationshipStartDate;
        if (couple.anniversaryDate) anniversaryDateStr = couple.anniversaryDate;
      }
    }

    // 3. Compute counters
    if (relationStartDateStr) {
      const start = new Date(relationStartDateStr);
      const diffTime = Math.abs(now - start);
      daysTogether = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }

    if (anniversaryDateStr) {
      const annivDate = new Date(anniversaryDateStr);
      const currentYear = now.getFullYear();
      
      // Calculate next anniversary occurrence
      const nextAnniv = new Date(annivDate);
      nextAnniv.setFullYear(currentYear);
      
      // If the anniversary has already occurred this year, target next year
      if (now > nextAnniv) {
        nextAnniv.setFullYear(currentYear + 1);
      }
      
      const diffTime = Math.abs(nextAnniv - now);
      anniversaryCountdown = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // 4. Get recent activity feed (limit 10)
    const activities = await Activity.find({ coupleId });
    // Sort descending by createdAt
    activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const recentActivities = activities.slice(0, 10);

    res.json({
      totalMemories,
      lockedMemories: lockedCount,
      unlockedMemories: unlockedCount,
      daysTogether,
      anniversaryCountdown,
      upcomingUnlocks: topUpcoming,
      recentActivities
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getStatsDetails = async (req, res) => {
  const userId = req.user.id;
  const coupleId = req.user.coupleId || userId;

  try {
    const memories = await Memory.find({ coupleId });
    const totalLetters = await Letter.countDocuments({ coupleId });

    // 1. Compute Category breakdowns
    const categories = [
      'Date', 'Trip', 'Celebration', 'Achievement',
      'Funny Moment', 'Random Memory', 'Fight and Make-up', 'Special Day'
    ];
    
    const categoryCounts = {};
    categories.forEach(cat => {
      categoryCounts[cat] = 0;
    });

    memories.forEach(m => {
      if (categoryCounts[m.category] !== undefined) {
        categoryCounts[m.category]++;
      } else {
        // Fallback for custom or unmatched categories
        categoryCounts[m.category] = 1;
      }
    });

    // 2. Compute streaks (consecutive days of memory creation)
    // Gather all creation dates (just YYYY-MM-DD)
    const creationDates = memories.map(m => m.createdAt.split('T')[0]);
    const uniqueDates = [...new Set(creationDates)].sort((a, b) => new Date(b) - new Date(a)); // sorted desc

    let currentStreak = 0;
    let maxStreak = 0;

    if (uniqueDates.length > 0) {
      const todayStr = new Date().toISOString().split('T')[0];
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      // Streak is active if we created a memory today or yesterday
      let streakActive = uniqueDates[0] === todayStr || uniqueDates[0] === yesterdayStr;
      
      if (streakActive) {
        currentStreak = 1;
        let checkDate = new Date(uniqueDates[0]);

        for (let i = 1; i < uniqueDates.length; i++) {
          const prevDate = new Date(uniqueDates[i]);
          const diffDays = (checkDate - prevDate) / (1000 * 60 * 60 * 24);
          
          if (diffDays === 1) {
            currentStreak++;
            checkDate = prevDate;
          } else if (diffDays > 1) {
            break; // streak broken
          }
        }
      }

      // Calculate max streak ever
      let tempStreak = 1;
      let checkDate = new Date(uniqueDates[uniqueDates.length - 1]);

      for (let i = uniqueDates.length - 2; i >= 0; i--) {
        const nextDate = new Date(uniqueDates[i]);
        const diffDays = (nextDate - checkDate) / (1000 * 60 * 60 * 24);

        if (diffDays === 1) {
          tempStreak++;
          checkDate = nextDate;
        } else if (diffDays > 1) {
          if (tempStreak > maxStreak) maxStreak = tempStreak;
          tempStreak = 1;
          checkDate = nextDate;
        }
      }
      if (tempStreak > maxStreak) maxStreak = tempStreak;
    } else {
      maxStreak = 0;
    }

    // 3. Yearly activity chart data (count per month)
    const currentYear = new Date().getFullYear();
    const monthlyActivity = Array(12).fill(0); // Jan to Dec

    memories.forEach(m => {
      const date = new Date(m.createdAt);
      if (date.getFullYear() === currentYear) {
        const month = date.getMonth(); // 0-11
        monthlyActivity[month]++;
      }
    });

    res.json({
      totalMemories: memories.length,
      totalLetters,
      categoryCounts,
      currentStreak,
      maxStreak: Math.max(maxStreak, currentStreak),
      monthlyActivity
    });
  } catch (error) {
    console.error('Get stats details error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};
