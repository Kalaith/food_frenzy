const NAME_GENERATOR_API_BASE =
  import.meta.env.VITE_NAME_GENERATOR_API_BASE || '/name_generator/api/v1';
const NAME_GENERATOR_API_KEY = import.meta.env.VITE_NAME_GENERATOR_API_KEY || 'development_key_123';

const FALLBACK_NAMES = [
  'Emily',
  'Mia',
  'Sophie',
  'Olivia',
  'Ava',
  'Ruby',
  'Lily',
  'Grace',
  'Chloe',
  'Zoe',
  'Ella',
  'Ivy',
];

const clampCount = (count: number) => Math.min(20, Math.max(1, Math.floor(count)));

export const getFallbackGuestName = () =>
  FALLBACK_NAMES[Math.floor(Math.random() * FALLBACK_NAMES.length)];

export const fetchGuestNames = async (count = 1): Promise<string[]> => {
  const query = new URLSearchParams({
    count: String(clampCount(count)),
    gender: 'female',
    culture: 'any',
    method: 'markov_chain',
    type: 'first_only',
    period: 'modern',
    excludeReal: '0',
  });

  const response = await fetch(`${NAME_GENERATOR_API_BASE}/generate_name.php?${query}`, {
    headers: {
      'X-API-KEY': NAME_GENERATOR_API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(`Name generator request failed: ${response.status}`);
  }

  const data = (await response.json()) as { names?: string[] };
  return (data.names ?? []).filter(name => name.trim().length > 0);
};
