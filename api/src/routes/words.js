import { Router } from 'express';

// Placeholder dataset for Phase 1 (proving the boundaries).
// Phase 3 replaces this list with the real curated Pokémon/language dataset.
const words = [
  { text: 'Pikachu', category: 'pokemon' },
  { text: 'Python', category: 'language' },
  { text: 'Snorlax', category: 'pokemon' },
  { text: 'Rust', category: 'language' },
  { text: 'Charmander', category: 'pokemon' },
  { text: 'JavaScript', category: 'language' },
  { text: 'Bulbasaur', category: 'pokemon' },
  { text: 'Go', category: 'language' },
  { text: 'Squirtle', category: 'pokemon' },
  { text: 'Ruby', category: 'language' },
];

const router = Router();

router.get('/', (_req, res) => {
  res.json(words);
});

export default router;
