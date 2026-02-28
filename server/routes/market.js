import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

function getFinnhubKey() {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    throw new Error('FINNHUB_API_KEY is not configured');
  }
  return apiKey;
}

async function finnhubFetch(endpoint, params = {}) {
  const apiKey = getFinnhubKey();
  const url = new URL(`${FINNHUB_BASE_URL}${endpoint}`);
  url.searchParams.set('token', apiKey);

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Finnhub API error: ${response.status}`);
  }

  return response.json();
}

// Get real-time quote for a symbol
router.get('/quote/:symbol', authenticateToken, async (req, res) => {
  try {
    const { symbol } = req.params;
    const data = await finnhubFetch('/quote', { symbol: symbol.toUpperCase() });

    res.json({
      symbol: symbol.toUpperCase(),
      current: data.c,
      change: data.d,
      changePercent: data.dp,
      high: data.h,
      low: data.l,
      open: data.o,
      previousClose: data.pc,
      timestamp: data.t
    });
  } catch (error) {
    console.error('Quote error:', error);
    if (error.message.includes('FINNHUB_API_KEY')) {
      return res.status(503).json({ error: 'Finnhub API not configured' });
    }
    res.status(500).json({ error: 'Failed to fetch quote' });
  }
});

// Get company news
router.get('/news/:symbol', authenticateToken, async (req, res) => {
  try {
    const { symbol } = req.params;
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const from = weekAgo.toISOString().split('T')[0];
    const to = today.toISOString().split('T')[0];

    const data = await finnhubFetch('/company-news', {
      symbol: symbol.toUpperCase(),
      from,
      to
    });

    // Return top 10 news items
    const news = data.slice(0, 10).map(item => ({
      id: item.id,
      headline: item.headline,
      summary: item.summary,
      source: item.source,
      url: item.url,
      image: item.image,
      datetime: item.datetime,
      related: item.related
    }));

    res.json(news);
  } catch (error) {
    console.error('News error:', error);
    if (error.message.includes('FINNHUB_API_KEY')) {
      return res.status(503).json({ error: 'Finnhub API not configured' });
    }
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// Get market sentiment
router.get('/sentiment/:symbol', authenticateToken, async (req, res) => {
  try {
    const { symbol } = req.params;
    const data = await finnhubFetch('/news-sentiment', { symbol: symbol.toUpperCase() });

    res.json({
      symbol: symbol.toUpperCase(),
      buzz: data.buzz,
      sentiment: data.sentiment,
      companyNewsScore: data.companyNewsScore,
      sectorAverageBullishPercent: data.sectorAverageBullishPercent,
      sectorAverageNewsScore: data.sectorAverageNewsScore
    });
  } catch (error) {
    console.error('Sentiment error:', error);
    if (error.message.includes('FINNHUB_API_KEY')) {
      return res.status(503).json({ error: 'Finnhub API not configured' });
    }
    res.status(500).json({ error: 'Failed to fetch sentiment' });
  }
});

// Get general market news
router.get('/news', authenticateToken, async (req, res) => {
  try {
    const data = await finnhubFetch('/news', { category: 'general' });

    const news = data.slice(0, 15).map(item => ({
      id: item.id,
      headline: item.headline,
      summary: item.summary,
      source: item.source,
      url: item.url,
      image: item.image,
      datetime: item.datetime,
      category: item.category
    }));

    res.json(news);
  } catch (error) {
    console.error('Market news error:', error);
    if (error.message.includes('FINNHUB_API_KEY')) {
      return res.status(503).json({ error: 'Finnhub API not configured' });
    }
    res.status(500).json({ error: 'Failed to fetch market news' });
  }
});

// Get multiple quotes at once (for watchlist)
router.post('/quotes', authenticateToken, async (req, res) => {
  try {
    const { symbols } = req.body;

    if (!symbols || !Array.isArray(symbols)) {
      return res.status(400).json({ error: 'symbols array required' });
    }

    const quotes = await Promise.all(
      symbols.slice(0, 10).map(async (symbol) => {
        try {
          const data = await finnhubFetch('/quote', { symbol: symbol.toUpperCase() });
          return {
            symbol: symbol.toUpperCase(),
            current: data.c,
            change: data.d,
            changePercent: data.dp,
            high: data.h,
            low: data.l,
            open: data.o,
            previousClose: data.pc
          };
        } catch {
          return { symbol: symbol.toUpperCase(), error: true };
        }
      })
    );

    res.json(quotes);
  } catch (error) {
    console.error('Quotes error:', error);
    res.status(500).json({ error: 'Failed to fetch quotes' });
  }
});

// Get company profile
router.get('/profile/:symbol', authenticateToken, async (req, res) => {
  try {
    const { symbol } = req.params;
    const data = await finnhubFetch('/stock/profile2', { symbol: symbol.toUpperCase() });

    res.json({
      symbol: data.ticker,
      name: data.name,
      country: data.country,
      currency: data.currency,
      exchange: data.exchange,
      industry: data.finnhubIndustry,
      logo: data.logo,
      marketCap: data.marketCapitalization,
      weburl: data.weburl
    });
  } catch (error) {
    console.error('Profile error:', error);
    if (error.message.includes('FINNHUB_API_KEY')) {
      return res.status(503).json({ error: 'Finnhub API not configured' });
    }
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Check API status
router.get('/status', authenticateToken, (req, res) => {
  const hasApiKey = !!process.env.FINNHUB_API_KEY;
  res.json({
    configured: hasApiKey,
    message: hasApiKey
      ? 'Finnhub API is configured and ready'
      : 'FINNHUB_API_KEY is not set. Get a free key at https://finnhub.io/'
  });
});

export default router;
