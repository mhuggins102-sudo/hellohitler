import { CURATED_ARTICLES, DEFAULT_TARGET } from '../utils/constants';
import { createDailyRng, getTodayString, getDailyPuzzleNumber } from '../utils/seededRandom';

export interface DailyPuzzle {
  startArticle: string;
  targetArticle: string;
  dateString: string;
  puzzleNumber: number;
  reversed: boolean;
  hardMode: boolean;
}

/**
 * Simple heuristic to detect if two articles are likely reachable in ≤3 steps.
 * Checks for shared significant words (ignoring common short words) and
 * known closely-related pairs.
 */
function likelyTooEasy(a: string, b: string): boolean {
  const stopWords = new Set([
    'the', 'of', 'and', 'a', 'an', 'in', 'on', 'at', 'to', 'for',
    'is', 'it', 'its', 'inc', 'no', 'or',
  ]);

  const wordsA = a.toLowerCase().split(/\W+/).filter(w => w.length > 2 && !stopWords.has(w));
  const wordsB = b.toLowerCase().split(/\W+/).filter(w => w.length > 2 && !stopWords.has(w));

  // If they share a significant word, likely too closely related
  for (const word of wordsA) {
    if (wordsB.includes(word)) return true;
  }

  // Known closely-related clusters — articles within the same group are too easy
  const clusters: string[][] = [
    ['Moon', 'Sun', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Milky Way', 'Black hole'],
    ['DNA', 'Photosynthesis', 'Evolution', 'Biology', 'Cell'],
    ['Gravity', 'Speed of light', 'Quantum mechanics', 'Theory of relativity', 'Physics', 'Atom', 'Electron'],
    ['Cat', 'Dog', 'Horse', 'Elephant', 'Lion', 'Tiger', 'Eagle', 'Dolphin', 'Whale', 'Shark', 'Octopus', 'Butterfly', 'Bee', 'Penguin', 'Polar bear', 'Gorilla', 'Cheetah', 'Hippopotamus', 'Crocodile', 'Python', 'Parrot', 'Flamingo'],
    ['Dinosaur', 'Tyrannosaurus', 'Mammoth'],
    ['Pizza', 'Chocolate', 'Coffee', 'Tea', 'Beer', 'Wine', 'Bread', 'Rice', 'Sushi', 'Cheese', 'Ice cream', 'Hamburger', 'Pasta', 'Chocolate chip cookie', 'Chocolate cake', 'Pancake', 'Waffle', 'Donut', 'Honey', 'Sugar', 'Salt', 'Pepper', 'Maple syrup'],
    ['Football', 'Basketball', 'Baseball', 'Tennis', 'Cricket', 'Soccer', 'Rugby', 'Golf', 'Swimming', 'Gymnastics', 'Marathon'],
    ['Olympic Games', 'FIFA World Cup', 'Super Bowl'],
    ['Internet', 'World Wide Web', 'Computer', 'Smartphone', 'Artificial intelligence'],
    ['Bible', 'Quran', 'Buddhism', 'Hinduism', 'Christianity', 'Islam'],
    ['Democracy', 'Communism', 'Capitalism'],
    ['World War I', 'World War II', 'Cold War'],
    ['Ancient Rome', 'Ancient Greece', 'Ancient Egypt', 'Roman Empire', 'Byzantine Empire', 'Ottoman Empire', 'British Empire', 'Mongol Empire'],
    ['Piano', 'Guitar', 'Violin', 'Orchestra'],
    ['Volcano', 'Earthquake', 'Hurricane', 'Tsunami', 'Tornado', 'Lightning'],
    ['Gold', 'Diamond', 'Iron'],
    ['Mathematics', 'Philosophy', 'Psychology', 'Economics'],
    ['Astronomy', 'Physics', 'Chemistry', 'Biology'],
    ['Novel', 'Poetry', 'Theatre', 'Opera', 'Ballet'],
    ['Painting', 'Sculpture', 'Architecture', 'Photography'],
    ['Automobile', 'Airplane', 'Bicycle', 'Submarine', 'Rocket'],
    ['Oxygen', 'Water', 'Carbon dioxide', 'Hydrogen'],
    ['Rainforest', 'Coral reef', 'Glacier', 'Desert', 'Amazon rainforest'],
    ['Human brain', 'Heart', 'Blood', 'Skeleton'],
    ['Language', 'Alphabet', 'Writing', 'Braille'],
    ['Calendar', 'Clock', 'Compass', 'Telescope', 'Microscope'],
    ['Fibonacci number', 'Pi', 'Infinity', 'Prime number'],
    ['Cryptography', 'Morse code', 'Binary number'],
    ['Robot', 'Drone', 'Virtual reality', 'Blockchain'],
    ['Climate change', 'Ozone layer', 'Renewable energy', 'Solar energy', 'Fossil fuel', 'Recycling', 'Plastic'],
    ['Vampire', 'Zombie', 'Werewolf', 'Unicorn', 'Dragon'],
    ['Pirate', 'Viking', 'Samurai', 'Knight', 'Gladiator'],
    ['Rose', 'Sunflower', 'Oak', 'Bamboo', 'Cactus'],
    ['The Beatles', 'Michael Jackson', 'Elvis Presley', 'Bob Dylan'],
    ['Albert Einstein', 'Nikola Tesla', 'Marie Curie', 'Isaac Newton', 'Galileo Galilei', 'Charles Darwin'],
    ['Aristotle', 'Plato', 'Socrates'],
    ['Cleopatra', 'Julius Caesar', 'Alexander the Great'],
    ['Mona Lisa', 'The Starry Night', 'The Last Supper'],
    ['Hamlet', 'Romeo and Juliet', 'Odyssey', 'Iliad'],
    ['Nobel Prize', 'Pulitzer Prize', 'Academy Awards'],
    ['Google', 'Amazon (company)', 'Microsoft', 'Apple Inc.', 'Tesla, Inc.'],
    ['SpaceX', 'NASA', 'European Space Agency', 'Apollo 11', 'Space Shuttle', 'International Space Station'],
    ['Eiffel Tower', 'Statue of Liberty', 'Big Ben', 'Leaning Tower of Pisa', 'Mount Rushmore', 'Colosseum'],
    ['Great Wall of China', 'Pyramids of Giza', 'Taj Mahal', 'Machu Picchu', 'Stonehenge'],
    ['Niagara Falls', 'Victoria Falls', 'Great Barrier Reef', 'Grand Canyon', 'Yellowstone National Park'],
  ];

  // Build a lookup: article → cluster index
  const clusterMap = new Map<string, number>();
  for (let i = 0; i < clusters.length; i++) {
    for (const article of clusters[i]) {
      clusterMap.set(article, i);
    }
  }

  const clusterA = clusterMap.get(a);
  const clusterB = clusterMap.get(b);
  if (clusterA !== undefined && clusterB !== undefined && clusterA === clusterB) {
    return true;
  }

  return false;
}

/**
 * Generates the daily puzzle for today (or a given date string).
 * Uses seeded RNG so all players get the same puzzle.
 *
 * Distribution:
 *   1/4  Hitler → random end  (1/2 easy, 1/2 hard)
 *   1/4  Random start → Hitler (1/2 easy, 1/2 hard)
 *   1/2  Random start → random end (1/2 easy, 1/2 hard)
 *
 * All daily puzzles are timed.
 */
export function getDailyPuzzle(dateStr?: string): DailyPuzzle {
  const date = dateStr || getTodayString();
  const rng = createDailyRng(`wikipath-daily-${date}`);

  const candidates = CURATED_ARTICLES.filter(a => a !== DEFAULT_TARGET);

  // Determine puzzle type
  const typeRoll = rng();
  let startArticle: string;
  let targetArticle: string;
  let reversed: boolean;

  if (typeRoll < 0.25) {
    // Hitler → random end
    reversed = true;
    const idx = Math.floor(rng() * candidates.length);
    startArticle = DEFAULT_TARGET;
    targetArticle = candidates[idx];
  } else if (typeRoll < 0.5) {
    // Random start → Hitler
    reversed = false;
    const idx = Math.floor(rng() * candidates.length);
    startArticle = candidates[idx];
    targetArticle = DEFAULT_TARGET;
  } else {
    // Random start → random end (1/2 of all puzzles)
    reversed = false;

    // Pick two distinct articles, re-rolling if they seem too easy
    let startIdx = Math.floor(rng() * candidates.length);
    let endIdx = Math.floor(rng() * candidates.length);

    // Ensure they're different
    let attempts = 0;
    while (endIdx === startIdx && attempts < 10) {
      endIdx = Math.floor(rng() * candidates.length);
      attempts++;
    }

    // Re-roll if the pair seems too easy (≤3 steps likely)
    attempts = 0;
    while (
      likelyTooEasy(candidates[startIdx], candidates[endIdx]) &&
      attempts < 5
    ) {
      endIdx = Math.floor(rng() * candidates.length);
      if (endIdx === startIdx) {
        endIdx = (endIdx + 1) % candidates.length;
      }
      attempts++;
    }

    startArticle = candidates[startIdx];
    targetArticle = candidates[endIdx];
  }

  // Determine hard mode: 50/50 for each puzzle type
  const hardMode = rng() < 0.5;

  return {
    startArticle,
    targetArticle,
    dateString: date,
    puzzleNumber: getDailyPuzzleNumber(),
    reversed,
    hardMode,
  };
}
