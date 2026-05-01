import React from 'react';
import { motion } from 'framer-motion';
import { useProgressionStore } from '../../stores/useProgressionStore';
import type { Upgrade } from '../../types/game';

interface UpgradeShopProps {
  isOpen: boolean;
  onClose: () => void;
}

const UpgradeShop: React.FC<UpgradeShopProps> = ({ isOpen, onClose }) => {
  const { upgrades, currency, purchaseUpgrade, getUpgradeCost } = useProgressionStore();

  const handlePurchase = (upgrade: Upgrade) => {
    const level = upgrade.level ?? 0;
    const maxLevel = upgrade.maxLevel || 1;
    if (currency >= getUpgradeCost(upgrade.id) && level < maxLevel) {
      purchaseUpgrade(upgrade.id);
    }
  };

  // Helper function to get upgrade icon based on effects
  const getUpgradeIcon = (upgrade: Upgrade): string => {
    if (upgrade.effects.customerSpawnRate) return '👥';
    if (upgrade.effects.satisfactionDecayMultiplier) return '😊';
    if (upgrade.effects.maxCustomersBonus) return '🏪';
    if (upgrade.effects.meatYieldMultiplier) return '🥕';
    if (upgrade.effects.cookTimeMultiplier) return '⏱️';
    if (upgrade.effects.recipeValueMultiplier) return '📣';
    if (upgrade.effects.capacityGainMultiplier) return '📏';
    return '⭐';
  };

  const formatEffect = ([key, value]: [string, number]) => {
    const amount = value * upgradeEffectSign(key);
    const percentKeys = [
      'cookTimeMultiplier',
      'patienceMultiplier',
      'meatYieldMultiplier',
      'comboMultiplier',
      'spawnIntervalMultiplier',
      'satisfactionDecayMultiplier',
      'recipeValueMultiplier',
      'capacityGainMultiplier',
    ];
    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, char => char.toUpperCase());
    const sign = amount > 0 ? '+' : '';
    return `${label}: ${sign}${percentKeys.includes(key) ? Math.round(amount * 100) + '%' : amount}`;
  };

  const upgradeEffectSign = (key: string) =>
    key === 'cookTimeMultiplier' ||
    key === 'spawnIntervalMultiplier' ||
    key === 'satisfactionDecayMultiplier'
      ? -1
      : 1;

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
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Restaurant Upgrades</h2>
            <div className="text-right">
              <div className="text-sm opacity-90">Currency</div>
              <div className="text-xl font-bold">${currency}</div>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upgrades.map(upgrade => {
              const level = upgrade.level ?? (upgrade.purchased ? upgrade.maxLevel || 1 : 0);
              const maxLevel = upgrade.maxLevel || 1;
              const upgradeCost = getUpgradeCost(upgrade.id);
              const isMaxed = level >= maxLevel;

              return (
                <motion.div
                  key={upgrade.id}
                  whileHover={{ scale: 1.02 }}
                  className={`border rounded-lg p-4 transition-all ${
                    isMaxed
                      ? 'bg-green-50 border-green-300'
                      : currency >= upgradeCost
                        ? 'bg-white border-gray-300 hover:border-blue-400'
                        : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-2xl">{getUpgradeIcon(upgrade)}</div>
                    {isMaxed && (
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        Maxed
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-lg mb-2">{upgrade.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{upgrade.description}</p>
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>
                        Level {level} / {maxLevel}
                      </span>
                      <span>{Math.round((level / maxLevel) * 100)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                      <div
                        className="h-full bg-purple-500"
                        style={{ width: `${(level / maxLevel) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold text-green-600">
                      {isMaxed ? 'Complete' : `$${upgradeCost}`}
                    </div>
                    {!isMaxed && (
                      <button
                        onClick={() => handlePurchase(upgrade)}
                        disabled={currency < upgradeCost}
                        className={`px-4 py-2 rounded font-medium transition-colors ${
                          currency >= upgradeCost
                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {currency >= upgradeCost ? 'Upgrade' : 'Not enough $'}
                      </button>
                    )}
                  </div>

                  {Object.keys(upgrade.effects).length > 0 && (
                    <div className="mt-3 text-xs text-gray-500">
                      Effects:{' '}
                      {Object.entries(upgrade.effects)
                        .map(effect => formatEffect(effect))
                        .join(', ')}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
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

export default UpgradeShop;
