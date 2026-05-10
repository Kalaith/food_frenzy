import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useProgressionStore } from '../../stores/useProgressionStore';
import UpgradeShop from './UpgradeShop';
import RecipeMenu from './RecipeMenu';
import AchievementDisplay from './AchievementDisplay';

interface ProgressionPanelProps {
  isOpen: boolean;
  onToggle: () => void;
}

const ProgressionPanel: React.FC<ProgressionPanelProps> = ({ isOpen, onToggle }) => {
  const {
    currency,
    prestigeLevel,
    prestigePoints,
    totalScore,
    upgrades,
    recipes,
    achievements,
    canPrestige,
    getPrestigeReward,
    prestige,
  } = useProgressionStore();
  const [activeModal, setActiveModal] = useState<'upgrades' | 'recipes' | 'achievements' | null>(
    null
  );

  const purchasedUpgrades = upgrades.reduce(
    (sum, upgrade) => sum + (upgrade.level ?? (upgrade.purchased ? upgrade.maxLevel || 1 : 0)),
    0
  );
  const maxUpgradeLevels = upgrades.reduce((sum, upgrade) => sum + (upgrade.maxLevel || 1), 0);
  const unlockedRecipes = recipes.filter(r => r.unlocked).length;
  const unlockedAchievements = achievements.filter(a => a.unlocked).length;
  const prestigeReady = canPrestige();
  const prestigeReward = getPrestigeReward();

  const openModal = (modal: 'upgrades' | 'recipes' | 'achievements') => {
    setActiveModal(modal);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const handlePrestige = () => {
    if (!prestigeReady) return;

    void prestige();
  };

  return (
    <>
      {/* Progression Panel Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onToggle}
        className="fixed top-4 right-4 z-40 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-shadow"
        title="Progression Menu"
      >
        <span className="text-xl">📈</span>
      </motion.button>

      {/* Progression Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: isOpen ? 0 : '100%' }}
        transition={{ type: 'tween', duration: 0.3 }}
        className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-30 border-l border-gray-200"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Progression</h2>
            <button onClick={onToggle} className="text-gray-500 hover:text-gray-700 text-xl">
              ✕
            </button>
          </div>

          {/* Currency and Level */}
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 rounded-lg mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm opacity-90">Currency</span>
              <span className="text-sm opacity-90">Prestige Level</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold">${currency}</span>
              <span className="text-xl font-bold">{prestigeLevel}</span>
            </div>
            <div className="mt-2 text-sm opacity-90">
              Total Score: {totalScore.toLocaleString()}
            </div>
            <div className="mt-1 text-sm opacity-90">Prestige Power: +{prestigePoints}</div>
          </div>

          {/* Progression Options */}
          <div className="space-y-4">
            {/* Upgrades */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => openModal('upgrades')}
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <div className="font-bold text-lg">🏪 Upgrades</div>
                  <div className="text-sm opacity-90">
                    {purchasedUpgrades} of {maxUpgradeLevels} levels
                  </div>
                </div>
                <div className="text-2xl">→</div>
              </div>
            </motion.button>

            {/* Recipes */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => openModal('recipes')}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <div className="font-bold text-lg">🍽️ Recipes</div>
                  <div className="text-sm opacity-90">
                    {unlockedRecipes} of {recipes.length} unlocked
                  </div>
                </div>
                <div className="text-2xl">→</div>
              </div>
            </motion.button>

            {/* Achievements */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => openModal('achievements')}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-4 rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <div className="font-bold text-lg">🏆 Achievements</div>
                  <div className="text-sm opacity-90">
                    {unlockedAchievements} of {achievements.length} unlocked
                  </div>
                </div>
                <div className="text-2xl">→</div>
              </div>
            </motion.button>
          </div>

          <div className="mt-6 rounded-lg border border-indigo-200 bg-indigo-50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-bold text-indigo-900">Prestige</h3>
              <span className="text-sm font-semibold text-indigo-700">+{prestigeReward} power</span>
            </div>
            <p className="mb-3 text-sm text-indigo-800">
              Requires 50,000 total score. Resets the current run and progression unlocks, then
              grants permanent scoring power and bonus currency.
            </p>
            <button
              onClick={handlePrestige}
              disabled={!prestigeReady}
              className={`w-full rounded px-4 py-2 font-semibold transition-colors ${
                prestigeReady
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {prestigeReady ? 'Prestige Restaurant' : 'Earn more score'}
            </button>
          </div>

          {/* Quick Stats */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-bold text-gray-800 mb-3">Quick Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Upgrades Owned:</span>
                <span className="font-medium">{purchasedUpgrades}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Recipes Known:</span>
                <span className="font-medium">{unlockedRecipes}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Achievements:</span>
                <span className="font-medium">{unlockedAchievements}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Completion:</span>
                <span className="font-medium">
                  {Math.round(
                    ((purchasedUpgrades + unlockedRecipes + unlockedAchievements) /
                      (maxUpgradeLevels + recipes.length + achievements.length)) *
                      100
                  )}
                  %
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Modals */}
      <UpgradeShop isOpen={activeModal === 'upgrades'} onClose={closeModal} />
      <RecipeMenu isOpen={activeModal === 'recipes'} onClose={closeModal} />
      <AchievementDisplay isOpen={activeModal === 'achievements'} onClose={closeModal} />
    </>
  );
};

export default ProgressionPanel;
