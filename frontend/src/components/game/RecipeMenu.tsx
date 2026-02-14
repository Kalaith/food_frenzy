import React from 'react';
import { motion } from 'framer-motion';
import { useProgressionStore } from '../../stores/useProgressionStore';
import type { Recipe } from '../../types/game';

interface RecipeMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const RecipeMenu: React.FC<RecipeMenuProps> = ({ isOpen, onClose }) => {
  const { recipes, unlockRecipe } = useProgressionStore();

  const handleUnlock = (recipe: Recipe) => {
    if (!recipe.unlocked) {
      unlockRecipe(recipe.id);
    }
  };

  // Group recipes by customer type
  const groupedRecipes = recipes.reduce(
    (acc, recipe) => {
      const key = recipe.customerType || 'General';
      if (!acc[key]) acc[key] = [];
      acc[key].push(recipe);
      return acc;
    },
    {} as Record<string, Recipe[]>
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
        <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-6">
          <h2 className="text-2xl font-bold">Recipe Book</h2>
          <p className="text-sm opacity-90 mt-1">
            Discover and unlock special recipes for different customer types
          </p>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {Object.entries(groupedRecipes).map(([customerType, typeRecipes]) => (
            <div key={customerType} className="mb-8">
              <h3 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
                {customerType} Recipes
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {typeRecipes.map(recipe => (
                  <motion.div
                    key={recipe.id}
                    whileHover={{ scale: 1.02 }}
                    className={`border rounded-lg p-4 transition-all ${
                      recipe.unlocked ? 'bg-green-50 border-green-300' : 'bg-white border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-2xl">{recipe.unlocked ? '🍽️' : '🔒'}</div>
                      {recipe.unlocked && (
                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                          Unlocked
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-lg mb-2">{recipe.name}</h4>
                    <p className="text-gray-600 text-sm mb-3">{recipe.description}</p>

                    {recipe.unlocked ? (
                      <>
                        <div className="mb-3">
                          <h5 className="font-medium text-sm text-gray-700 mb-2">Ingredients:</h5>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(recipe.ingredients).map(([ingredient, amount]) => (
                              <span
                                key={ingredient}
                                className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                              >
                                {ingredient}: {amount}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="text-sm text-green-600 font-medium">
                          Profit Multiplier: {recipe.profitMultiplier}x
                        </div>
                      </>
                    ) : (
                      <div className="mb-3">
                        <div className="text-sm text-gray-500 mb-2">
                          Unlock Condition: {recipe.unlockCondition}
                        </div>
                        <button
                          onClick={() => handleUnlock(recipe)}
                          className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors font-medium"
                        >
                          Unlock Recipe
                        </button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
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

export default RecipeMenu;
