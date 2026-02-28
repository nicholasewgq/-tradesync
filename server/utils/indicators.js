// Technical Indicator Calculations

export function calculateEMA(prices, period) {
  if (prices.length < period) return [];

  const multiplier = 2 / (period + 1);
  const ema = [];

  // Start with SMA for first EMA value
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += prices[i];
  }
  ema.push(sum / period);

  // Calculate EMA for remaining prices
  for (let i = period; i < prices.length; i++) {
    const value = (prices[i] - ema[ema.length - 1]) * multiplier + ema[ema.length - 1];
    ema.push(value);
  }

  return ema;
}

export function calculateSMA(prices, period) {
  if (prices.length < period) return [];

  const sma = [];
  for (let i = period - 1; i < prices.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += prices[i - j];
    }
    sma.push(sum / period);
  }

  return sma;
}

export function calculateRSI(prices, period = 14) {
  if (prices.length < period + 1) return [];

  const changes = [];
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1]);
  }

  const gains = changes.map(c => c > 0 ? c : 0);
  const losses = changes.map(c => c < 0 ? Math.abs(c) : 0);

  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

  const rsi = [];

  // First RSI value
  if (avgLoss === 0) {
    rsi.push(100);
  } else {
    const rs = avgGain / avgLoss;
    rsi.push(100 - (100 / (1 + rs)));
  }

  // Subsequent RSI values using smoothed averages
  for (let i = period; i < changes.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;

    if (avgLoss === 0) {
      rsi.push(100);
    } else {
      const rs = avgGain / avgLoss;
      rsi.push(100 - (100 / (1 + rs)));
    }
  }

  return rsi;
}

export function calculateMACD(prices, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
  const fastEMA = calculateEMA(prices, fastPeriod);
  const slowEMA = calculateEMA(prices, slowPeriod);

  if (fastEMA.length === 0 || slowEMA.length === 0) {
    return { macdLine: [], signalLine: [], histogram: [] };
  }

  // Align the EMAs
  const offset = slowPeriod - fastPeriod;
  const macdLine = [];

  for (let i = 0; i < slowEMA.length; i++) {
    macdLine.push(fastEMA[i + offset] - slowEMA[i]);
  }

  const signalLine = calculateEMA(macdLine, signalPeriod);

  const histogram = [];
  const signalOffset = signalPeriod - 1;
  for (let i = 0; i < signalLine.length; i++) {
    histogram.push(macdLine[i + signalOffset] - signalLine[i]);
  }

  return { macdLine, signalLine, histogram };
}

export function calculateVolumeTrend(volumes, period = 20) {
  if (volumes.length < period) return { trend: 'neutral', avgVolume: 0 };

  const recentVolumes = volumes.slice(-period);
  const avgVolume = recentVolumes.reduce((a, b) => a + b, 0) / period;

  const recentAvg = volumes.slice(-5).reduce((a, b) => a + b, 0) / 5;

  let trend = 'neutral';
  if (recentAvg > avgVolume * 1.2) {
    trend = 'increasing';
  } else if (recentAvg < avgVolume * 0.8) {
    trend = 'decreasing';
  }

  return { trend, avgVolume };
}

export function findSupportResistance(candles, lookback = 50) {
  const highs = candles.slice(-lookback).map(c => c.high);
  const lows = candles.slice(-lookback).map(c => c.low);
  const closes = candles.slice(-lookback).map(c => c.close);

  // Find swing highs and lows
  const swingHighs = [];
  const swingLows = [];

  for (let i = 2; i < highs.length - 2; i++) {
    if (highs[i] > highs[i-1] && highs[i] > highs[i-2] &&
        highs[i] > highs[i+1] && highs[i] > highs[i+2]) {
      swingHighs.push(highs[i]);
    }
    if (lows[i] < lows[i-1] && lows[i] < lows[i-2] &&
        lows[i] < lows[i+1] && lows[i] < lows[i+2]) {
      swingLows.push(lows[i]);
    }
  }

  // Cluster nearby levels
  const clusterLevels = (levels, threshold = 0.005) => {
    if (levels.length === 0) return [];

    levels.sort((a, b) => a - b);
    const clusters = [[levels[0]]];

    for (let i = 1; i < levels.length; i++) {
      const lastCluster = clusters[clusters.length - 1];
      const clusterAvg = lastCluster.reduce((a, b) => a + b, 0) / lastCluster.length;

      if (Math.abs(levels[i] - clusterAvg) / clusterAvg < threshold) {
        lastCluster.push(levels[i]);
      } else {
        clusters.push([levels[i]]);
      }
    }

    return clusters
      .filter(c => c.length >= 1)
      .map(c => parseFloat((c.reduce((a, b) => a + b, 0) / c.length).toFixed(4)))
      .slice(-3);
  };

  const currentPrice = closes[closes.length - 1];

  const resistanceLevels = clusterLevels(swingHighs.filter(h => h > currentPrice));
  const supportLevels = clusterLevels(swingLows.filter(l => l < currentPrice)).reverse();

  return {
    support: supportLevels.slice(0, 3),
    resistance: resistanceLevels.slice(0, 3)
  };
}

export function detectPatterns(candles) {
  const patterns = [];
  const len = candles.length;

  if (len < 20) return patterns;

  const closes = candles.map(c => c.close);
  const highs = candles.map(c => c.high);
  const lows = candles.map(c => c.low);

  // Double Top Detection
  const recentHighs = [];
  for (let i = len - 30; i < len - 2; i++) {
    if (i > 0 && highs[i] > highs[i-1] && highs[i] > highs[i+1]) {
      recentHighs.push({ index: i, value: highs[i] });
    }
  }

  for (let i = 0; i < recentHighs.length - 1; i++) {
    for (let j = i + 1; j < recentHighs.length; j++) {
      const diff = Math.abs(recentHighs[i].value - recentHighs[j].value) / recentHighs[i].value;
      if (diff < 0.02 && recentHighs[j].index - recentHighs[i].index >= 5) {
        patterns.push({ name: 'Double Top', type: 'bearish', confidence: 70 });
      }
    }
  }

  // Double Bottom Detection
  const recentLows = [];
  for (let i = len - 30; i < len - 2; i++) {
    if (i > 0 && lows[i] < lows[i-1] && lows[i] < lows[i+1]) {
      recentLows.push({ index: i, value: lows[i] });
    }
  }

  for (let i = 0; i < recentLows.length - 1; i++) {
    for (let j = i + 1; j < recentLows.length; j++) {
      const diff = Math.abs(recentLows[i].value - recentLows[j].value) / recentLows[i].value;
      if (diff < 0.02 && recentLows[j].index - recentLows[i].index >= 5) {
        patterns.push({ name: 'Double Bottom', type: 'bullish', confidence: 70 });
      }
    }
  }

  // Bullish/Bearish Engulfing
  const last = candles[len - 1];
  const prev = candles[len - 2];

  if (last.close > last.open && prev.close < prev.open) {
    if (last.open < prev.close && last.close > prev.open) {
      patterns.push({ name: 'Bullish Engulfing', type: 'bullish', confidence: 65 });
    }
  }

  if (last.close < last.open && prev.close > prev.open) {
    if (last.open > prev.close && last.close < prev.open) {
      patterns.push({ name: 'Bearish Engulfing', type: 'bearish', confidence: 65 });
    }
  }

  // Trend Analysis
  const ema20 = calculateEMA(closes, 20);
  const ema50 = calculateEMA(closes, 50);

  if (ema20.length > 0 && ema50.length > 0) {
    const latestEma20 = ema20[ema20.length - 1];
    const latestEma50 = ema50[ema50.length - 1];
    const currentClose = closes[len - 1];

    if (currentClose > latestEma20 && latestEma20 > latestEma50) {
      patterns.push({ name: 'Uptrend Structure', type: 'bullish', confidence: 60 });
    } else if (currentClose < latestEma20 && latestEma20 < latestEma50) {
      patterns.push({ name: 'Downtrend Structure', type: 'bearish', confidence: 60 });
    }
  }

  // Breakout Detection
  const recentRange = candles.slice(-20, -1);
  const rangeHigh = Math.max(...recentRange.map(c => c.high));
  const rangeLow = Math.min(...recentRange.map(c => c.low));

  if (last.close > rangeHigh) {
    patterns.push({ name: 'Bullish Breakout', type: 'bullish', confidence: 75 });
  } else if (last.close < rangeLow) {
    patterns.push({ name: 'Bearish Breakout', type: 'bearish', confidence: 75 });
  }

  return patterns;
}

export function generateAnalysis(candles) {
  const closes = candles.map(c => c.close);
  const volumes = candles.map(c => c.volume || 0);

  // Calculate indicators
  const ema20 = calculateEMA(closes, 20);
  const ema50 = calculateEMA(closes, 50);
  const ema200 = calculateEMA(closes, 200);
  const rsi = calculateRSI(closes, 14);
  const macd = calculateMACD(closes);
  const volumeTrend = calculateVolumeTrend(volumes);
  const levels = findSupportResistance(candles);
  const patterns = detectPatterns(candles);

  const currentPrice = closes[closes.length - 1];
  const latestRSI = rsi.length > 0 ? rsi[rsi.length - 1] : 50;
  const latestMACD = macd.histogram.length > 0 ? macd.histogram[macd.histogram.length - 1] : 0;
  const latestEma20 = ema20.length > 0 ? ema20[ema20.length - 1] : currentPrice;
  const latestEma50 = ema50.length > 0 ? ema50[ema50.length - 1] : currentPrice;
  const latestEma200 = ema200.length > 0 ? ema200[ema200.length - 1] : currentPrice;

  // Determine bias
  let bullishSignals = 0;
  let bearishSignals = 0;

  if (currentPrice > latestEma20) bullishSignals++; else bearishSignals++;
  if (currentPrice > latestEma50) bullishSignals++; else bearishSignals++;
  if (currentPrice > latestEma200) bullishSignals++; else bearishSignals++;
  if (latestRSI > 50) bullishSignals++; else bearishSignals++;
  if (latestMACD > 0) bullishSignals++; else bearishSignals++;
  if (volumeTrend.trend === 'increasing') bullishSignals++;

  patterns.forEach(p => {
    if (p.type === 'bullish') bullishSignals++;
    else if (p.type === 'bearish') bearishSignals++;
  });

  let bias = 'Neutral';
  if (bullishSignals > bearishSignals + 2) bias = 'Bullish';
  else if (bearishSignals > bullishSignals + 2) bias = 'Bearish';

  // Trend strength
  const totalSignals = bullishSignals + bearishSignals;
  const dominantSignals = Math.max(bullishSignals, bearishSignals);
  const strengthRatio = totalSignals > 0 ? dominantSignals / totalSignals : 0.5;

  let trendStrength = 'Weak';
  if (strengthRatio > 0.75) trendStrength = 'Strong';
  else if (strengthRatio > 0.6) trendStrength = 'Moderate';

  // Entry, SL, TP calculations
  const atr = calculateATR(candles, 14);
  const latestATR = atr.length > 0 ? atr[atr.length - 1] : currentPrice * 0.02;

  let entry, stopLoss, takeProfit;

  if (bias === 'Bullish') {
    entry = currentPrice;
    stopLoss = levels.support.length > 0
      ? Math.min(levels.support[0], currentPrice - latestATR * 1.5)
      : currentPrice - latestATR * 1.5;
    takeProfit = levels.resistance.length > 0
      ? levels.resistance[0]
      : currentPrice + latestATR * 3;
  } else if (bias === 'Bearish') {
    entry = currentPrice;
    stopLoss = levels.resistance.length > 0
      ? Math.max(levels.resistance[0], currentPrice + latestATR * 1.5)
      : currentPrice + latestATR * 1.5;
    takeProfit = levels.support.length > 0
      ? levels.support[0]
      : currentPrice - latestATR * 3;
  } else {
    entry = currentPrice;
    stopLoss = currentPrice - latestATR * 1.5;
    takeProfit = currentPrice + latestATR * 2;
  }

  const risk = Math.abs(entry - stopLoss);
  const reward = Math.abs(takeProfit - entry);
  const riskRewardRatio = risk > 0 ? (reward / risk).toFixed(2) : '0.00';

  // Confidence score
  let confidence = 50;
  confidence += (dominantSignals - Math.min(bullishSignals, bearishSignals)) * 5;
  confidence += patterns.length * 5;
  if (parseFloat(riskRewardRatio) >= 2) confidence += 10;
  if (volumeTrend.trend === 'increasing' && bias !== 'Neutral') confidence += 5;
  confidence = Math.min(95, Math.max(20, confidence));

  return {
    bias,
    trendStrength,
    support: levels.support.map(l => parseFloat(l.toFixed(4))),
    resistance: levels.resistance.map(l => parseFloat(l.toFixed(4))),
    patterns: patterns.map(p => p.name),
    entry: parseFloat(entry.toFixed(4)),
    stopLoss: parseFloat(stopLoss.toFixed(4)),
    takeProfit: parseFloat(takeProfit.toFixed(4)),
    riskRewardRatio,
    confidence: Math.round(confidence),
    indicators: {
      rsi: parseFloat(latestRSI.toFixed(2)),
      macd: parseFloat(latestMACD.toFixed(4)),
      ema20: parseFloat(latestEma20.toFixed(4)),
      ema50: parseFloat(latestEma50.toFixed(4)),
      ema200: parseFloat(latestEma200.toFixed(4)),
      volumeTrend: volumeTrend.trend
    }
  };
}

function calculateATR(candles, period = 14) {
  if (candles.length < period + 1) return [];

  const trueRanges = [];

  for (let i = 1; i < candles.length; i++) {
    const high = candles[i].high;
    const low = candles[i].low;
    const prevClose = candles[i - 1].close;

    const tr = Math.max(
      high - low,
      Math.abs(high - prevClose),
      Math.abs(low - prevClose)
    );
    trueRanges.push(tr);
  }

  // Calculate ATR using EMA of true ranges
  return calculateEMA(trueRanges, period);
}
