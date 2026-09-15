import express from 'express';
import cors from 'cors';
import wordsRouter from './routes/words.js';
import scoresRouter from './routes/scores.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/words', wordsRouter);
app.use('/api/scores', scoresRouter);

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`api listening on port ${port}`);
});
