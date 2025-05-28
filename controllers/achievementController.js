const firebase = require('firebase-admin');
const { trackEvent } = require('../utils/analytics');

/**
 * Get all achievements for a child
 */
const getAchievements = async (req, res) => {
  try {
    // Get childId from either path params, query params, or use current user's ID
    const childIdFromParams = req.params.childId;
    const childIdFromQuery = req.query.childId;
    const userId = req.user.userId;

    // Determine the target child ID
    let targetChildId;

    if (childIdFromParams) {
      // Path parameter (e.g., /achievements/:childId)
      targetChildId = childIdFromParams;
    } else if (childIdFromQuery) {
      // Query parameter (e.g., /achievements?childId=123)
      targetChildId = childIdFromQuery;
    } else if (req.user.role === 'child') {
      // Child accessing their own achievements (e.g., /achievements)
      targetChildId = userId;
    } else {
      return res
        .status(400)
        .json({ error: 'Child ID is required for parent users' });
    }

    // Verify access rights
    const isParent = req.user.role === 'parent';
    const isChild = req.user.role === 'child' && userId === targetChildId;

    if (!isParent && !isChild) {
      return res
        .status(403)
        .json({ error: 'Unauthorized access to achievements' });
    }

    const achievementsSnapshot = await firebase
      .firestore()
      .collection('achievements')
      .where('childId', '==', targetChildId)
      .get();

    const achievements = [];
    achievementsSnapshot.forEach((doc) => {
      achievements.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    res.json({ achievements });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Award a new achievement to a child
 */
const awardAchievement = async (req, res) => {
  try {
    const { childId } = req.params;
    const { type, title, description, rewardAmount } = req.body;

    // Verify the user is a parent
    if (req.user.role !== 'parent') {
      return res
        .status(403)
        .json({ error: 'Only parents can award achievements' });
    }

    // Create the achievement
    const achievementRef = firebase
      .firestore()
      .collection('achievements')
      .doc();
    await achievementRef.set({
      childId,
      type,
      title,
      description,
      rewardAmount: rewardAmount || 0,
      awarded: firebase.firestore.FieldValue.serverTimestamp(),
    });

    // If there's a reward, update the child's balance
    if (rewardAmount && rewardAmount > 0) {
      await firebase
        .firestore()
        .collection('wallets')
        .where('childId', '==', childId)
        .get()
        .then((snapshot) => {
          if (!snapshot.empty) {
            const walletDoc = snapshot.docs[0];
            return walletDoc.ref.update({
              balance: firebase.firestore.FieldValue.increment(rewardAmount),
            });
          }
        });
    }

    // Track the achievement for analytics
    trackEvent(childId, 'achievement_awarded', {
      achievementId: achievementRef.id,
      type,
      title,
      rewardAmount,
    });

    res.status(201).json({
      message: 'Achievement awarded successfully',
      achievementId: achievementRef.id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAchievements,
  awardAchievement,
};
