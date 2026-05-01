import React, { useMemo, useState } from 'react';
import {
  runBalanceSimulation,
  type SimulationOptions,
  type SimulatorStrategy,
} from '../../simulation/balanceSimulator';

const strategyLabels: Record<SimulatorStrategy, string> = {
  steady: 'Steady Service',
  preferred: 'Preferred Dishes',
  'vip-rush': 'VIP Rush',
  'recipe-growth': 'Recipe Growth',
};

const formatNumber = (value: number) =>
  value.toLocaleString(undefined, {
    maximumFractionDigits: value >= 100 ? 0 : 1,
  });

const formatPercent = (value: number) => `${Math.round(value * 100)}%`;

const formatTime = (value: number | null) => {
  if (value === null) return 'Not reached';
  const totalSeconds = Math.round(value / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const BalanceSimulatorPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<SimulationOptions>({
    minutes: 15,
    runs: 50,
    seed: 42,
    strategy: 'preferred',
    autoBuyUpgrades: true,
    startingCapacityBonus: 0,
  });

  const summary = useMemo(() => runBalanceSimulation(options), [options]);

  const updateNumber = (key: keyof SimulationOptions, value: string) => {
    setOptions(current => ({
      ...current,
      [key]: Number(value),
    }));
  };

  const metricTiles = [
    ['Score / min', formatNumber(summary.scorePerMinute)],
    ['Processed / min', formatNumber(summary.processRatePerMinute)],
    ['Lost / min', formatNumber(summary.lossRatePerMinute)],
    ['Prestige runs', formatPercent(summary.prestigeRunRate)],
    ['Avg score', formatNumber(summary.averages.score)],
    ['Avg currency', formatNumber(summary.averages.currency)],
    ['Upgrade levels', formatNumber(summary.averages.upgradeLevels)],
    ['Recipes unlocked', formatNumber(summary.averages.unlockedRecipes)],
    ['Recipes sold', formatNumber(summary.averages.recipesCrafted)],
    ['Capacity gain', `+${formatNumber(summary.averages.feedingCapacityBonus)}`],
    ['Preferred serves', formatPercent(summary.preferredServeRate)],
    ['Prestige time', formatTime(summary.averages.timeToPrestigeMs)],
  ];

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-40 rounded-lg bg-slate-900 px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-slate-700"
      >
        Balance Simulator
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 p-4">
          <div className="mx-auto flex max-h-[92vh] max-w-6xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Balance Simulator</h2>
                <p className="text-sm text-gray-600">
                  Deterministic averages across automated service runs.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-md px-3 py-2 text-xl font-bold text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                aria-label="Close balance simulator"
              >
                x
              </button>
            </div>

            <div className="grid overflow-auto lg:grid-cols-[320px_1fr]">
              <div className="space-y-5 border-b border-gray-200 p-6 lg:border-b-0 lg:border-r">
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-gray-700">Strategy</span>
                  <select
                    value={options.strategy}
                    onChange={event =>
                      setOptions(current => ({
                        ...current,
                        strategy: event.target.value as SimulatorStrategy,
                      }))
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  >
                    {Object.entries(strategyLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-gray-700">Minutes</span>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={options.minutes}
                    onChange={event => updateNumber('minutes', event.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-gray-700">Runs</span>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={options.runs}
                    onChange={event => updateNumber('runs', event.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-gray-700">Seed</span>
                  <input
                    type="number"
                    value={options.seed}
                    onChange={event => updateNumber('seed', event.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-gray-700">
                    Starting Capacity
                  </span>
                  <input
                    type="number"
                    min="0"
                    max="80"
                    value={options.startingCapacityBonus}
                    onChange={event => updateNumber('startingCapacityBonus', event.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  />
                </label>

                <label className="flex items-center gap-3 text-sm font-bold text-gray-700">
                  <input
                    type="checkbox"
                    checked={options.autoBuyUpgrades}
                    onChange={event =>
                      setOptions(current => ({
                        ...current,
                        autoBuyUpgrades: event.target.checked,
                      }))
                    }
                    className="h-5 w-5 rounded border-gray-300"
                  />
                  Auto-buy upgrades
                </label>

                <div className="rounded-md bg-gray-50 p-3 text-xs text-gray-600">
                  Score range: {formatNumber(summary.min.score)} to{' '}
                  {formatNumber(summary.max.score)}
                  <br />
                  Processed range: {formatNumber(summary.min.processedCustomers)} to{' '}
                  {formatNumber(summary.max.processedCustomers)}
                  <br />
                  Lost range: {formatNumber(summary.min.customersLost)} to{' '}
                  {formatNumber(summary.max.customersLost)}
                </div>
              </div>

              <div className="space-y-6 p-6">
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                  {metricTiles.map(([label, value]) => (
                    <div key={label} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <div className="text-xs font-bold uppercase text-gray-500">{label}</div>
                      <div className="mt-2 text-2xl font-bold text-gray-900">{value}</div>
                    </div>
                  ))}
                </div>

                <div>
                  <h3 className="mb-3 text-lg font-bold text-gray-900">Balance Notes</h3>
                  {summary.warnings.length > 0 ? (
                    <div className="space-y-2">
                      {summary.warnings.map(warning => (
                        <div
                          key={warning}
                          className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900"
                        >
                          {warning}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">
                      No major balance warnings for this setup.
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="mb-3 text-lg font-bold text-gray-900">Run Averages</h3>
                  <div className="overflow-hidden rounded-lg border border-gray-200">
                    <table className="w-full text-left text-sm">
                      <tbody>
                        {[
                          ['Dishes served', formatNumber(summary.averages.dishesServed)],
                          [
                            'Preferred dishes',
                            formatNumber(summary.averages.preferredDishesServed),
                          ],
                          ['VIP processed', formatNumber(summary.averages.processedCustomers)],
                          ['Failed invites', formatNumber(summary.averages.failedInvites)],
                          ['Food stolen or thrown', formatNumber(summary.averages.stolenDishes)],
                          ['Customers lost', formatNumber(summary.averages.customersLost)],
                        ].map(([label, value]) => (
                          <tr key={label} className="border-b border-gray-100 last:border-b-0">
                            <th className="bg-gray-50 px-4 py-3 font-bold text-gray-700">
                              {label}
                            </th>
                            <td className="px-4 py-3 font-semibold text-gray-900">{value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
