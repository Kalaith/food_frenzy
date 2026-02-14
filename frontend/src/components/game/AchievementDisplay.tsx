import React from 'react';
import { motion } from 'framer-motion';
import { useProgressionStore } from '../../stores/useProgressionStore';

interface AchievementDisplayProps {
  isOpen: boolean;
  onClose: () => void;
}

const AchievementDisplay: React.FC<AchievementDisplayProps> = ({ isOpen, onClose }) => {
  const { achievements } = useProgressionStore();

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const lockedAchievements = achievements.filter(a => !a.unlocked);

  // Calculate completion percentage
  const completionPercentage = Math.round(
    (unlockedAchievements.length / achievements.length) * 100
  );

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Achievements</h2>
              <p className="text-sm opacity-90 mt-1">
                {unlockedAchievements.length} of {achievements.length} unlocked (
                {completionPercentage}%)
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl">🏆</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 bg-white bg-opacity-20 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-white rounded-full"
            />
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Unlocked Achievements */}
          {unlockedAchievements.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4 text-green-600 flex items-center">
                <span className="mr-2">✅</span>
                Unlocked Achievements
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {unlockedAchievements.map(achievement => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-50 border border-green-300 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-2xl">🏆</div>
                      <div className="text-right">
                        <div className="text-sm text-green-600 font-medium">Completed</div>
                        <div className="text-lg font-bold text-green-600">
                          +${achievement.reward}
                        </div>
                      </div>
                    </div>

                    <h4 className="font-bold text-lg mb-2">{achievement.name}</h4>
                    <p className="text-gray-700 text-sm">{achievement.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Locked Achievements */}
          {lockedAchievements.length > 0 && (
            <div>
              <h3 className="text-xl font-bold mb-4 text-gray-600 flex items-center">
                <span className="mr-2">🔒</span>
                Locked Achievements
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lockedAchievements.map(achievement => (
                  <motion.div
                    key={achievement.id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-gray-50 border border-gray-300 rounded-lg p-4 opacity-75"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-2xl text-gray-400">🔒</div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Reward</div>
                        <div className="text-lg font-bold text-gray-500">${achievement.reward}</div>
                      </div>
                    </div>

                    <h4 className="font-bold text-lg mb-2 text-gray-600">{achievement.name}</h4>
                    <p className="text-gray-500 text-sm mb-3">{achievement.description}</p>

                    {/* Progress Bar */}
                    <div className="mb-2">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>
                          {achievement.progress} / {achievement.maxProgress}
                        </span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${Math.min((achievement.progress / achievement.maxProgress) * 100, 100)}%`,
                          }}
                          transition={{ duration: 0.5 }}
                          className="h-full bg-blue-500 rounded-full"
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-t p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AchievementDisplay;
