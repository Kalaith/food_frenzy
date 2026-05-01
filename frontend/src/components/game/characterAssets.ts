const characterImageByType: Record<string, string> = {
  pig: 'pig.png',
  cow: 'cow.png',
  sheep: 'sheep.png',
  rabbit: 'rabbit.png',
  cat: 'cat.png',
  deer: 'deer.png',
  duck: 'duck.png',
  chicken: 'chicken.png',
  fish: 'fish.png',
  fox: 'fox.png',
  goat: 'goat.png',
  bear: 'bear.png',
  monkey: 'monkey.png',
};

export const getCharacterImage = (customerType: string) => {
  const filename = characterImageByType[customerType];
  return filename ? `${import.meta.env.BASE_URL}assets/characters/${filename}` : undefined;
};
