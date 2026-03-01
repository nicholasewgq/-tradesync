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

// Detect if price structure is clean (trending) or choppy
function detectPriceStructure(candles, period = 20) {
  if (candles.length < period) return 'Choppy';

  const recentCandles = candles.slice(-period);
  const closes = recentCandles.map(c => c.close);

  // Calculate directional changes
  let directionChanges = 0;
  for (let i = 2; i < closes.length; i++) {
    const prevDir = closes[i - 1] > closes[i - 2];
    const currDir = closes[i] > closes[i - 1];
    if (prevDir !== currDir) directionChanges++;
  }

  // Calculate average candle body to wick ratio (cleaner trends have larger bodies)
  let totalBody = 0;
  let totalRange = 0;
  for (const candle of recentCandles) {
    totalBody += Math.abs(candle.close - candle.open);
    totalRange += candle.high - candle.low;
  }
  const bodyRatio = totalRange > 0 ? totalBody / totalRange : 0.5;

  // Check if making higher highs/lows (uptrend) or lower highs/lows (downtrend)
  const highs = recentCandles.map(c => c.high);
  const lows = recentCandles.map(c => c.low);

  let higherHighs = 0;
  let lowerLows = 0;
  for (let i = 5; i < highs.length; i += 5) {
    if (highs[i] > highs[i - 5]) higherHighs++;
    if (lows[i] < lows[i - 5]) lowerLows++;
  }

  // Choppy = many direction changes, small bodies, no clear HH/LL pattern
  const choppinessScore = directionChanges / period;

  if (choppinessScore > 0.6 || bodyRatio < 0.3) return 'Choppy';
  if (choppinessScore < 0.3 && bodyRatio > 0.5) return 'Clean';
  return 'Ranging';
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
  const priceStructure = detectPriceStructure(candles);

  const currentPrice = closes[closes.length - 1];
  const latestRSI = rsi.length > 0 ? rsi[rsi.length - 1] : 50;
  const latestMACD = macd.histogram.length > 0 ? macd.histogram[macd.histogram.length - 1] : 0;
  const prevMACD = macd.histogram.length > 1 ? macd.histogram[macd.histogram.length - 2] : 0;
  const latestEma20 = ema20.length > 0 ? ema20[ema20.length - 1] : currentPrice;
  const latestEma50 = ema50.length > 0 ? ema50[ema50.length - 1] : currentPrice;
  const latestEma200 = ema200.length > 0 ? ema200[ema200.length - 1] : currentPrice;

  // ============================================
  // WEIGHTED CONFLUENCE SCORING SYSTEM
  // ============================================
  let bullishScore = 0;
  let bearishScore = 0;
  const confluenceFactors = [];

  // EMA200 - Highest weight (3 points)
  if (ema200.length > 0) {
    if (currentPrice > latestEma200) {
      bullishScore += 3;
      confluenceFactors.push('Price above EMA200 (+3 bull)');
    } else {
      bearishScore += 3;
      confluenceFactors.push('Price below EMA200 (+3 bear)');
    }
  }

  // EMA50 - Medium weight (2 points)
  if (ema50.length > 0) {
    if (currentPrice > latestEma50) {
      bullishScore += 2;
      confluenceFactors.push('Price above EMA50 (+2 bull)');
    } else {
      bearishScore += 2;
      confluenceFactors.push('Price below EMA50 (+2 bear)');
    }
  }

  // EMA20 - Lower weight (1 point)
  if (ema20.length > 0) {
    if (currentPrice > latestEma20) {
      bullishScore += 1;
      confluenceFactors.push('Price above EMA20 (+1 bull)');
    } else {
      bearishScore += 1;
      confluenceFactors.push('Price below EMA20 (+1 bear)');
    }
  }

  // RSI confirmation (2 points) - stricter thresholds
  if (latestRSI > 55 && latestRSI < 75) {
    bullishScore += 2;
    confluenceFactors.push(`RSI ${latestRSI.toFixed(1)} bullish momentum (+2 bull)`);
  } else if (latestRSI < 45 && latestRSI > 25) {
    bearishScore += 2;
    confluenceFactors.push(`RSI ${latestRSI.toFixed(1)} bearish momentum (+2 bear)`);
  } else if (latestRSI >= 75) {
    bearishScore += 1; // Overbought - potential reversal
    confluenceFactors.push(`RSI ${latestRSI.toFixed(1)} overbought (+1 bear)`);
  } else if (latestRSI <= 25) {
    bullishScore += 1; // Oversold - potential reversal
    confluenceFactors.push(`RSI ${latestRSI.toFixed(1)} oversold (+1 bull)`);
  }

  // MACD histogram direction (2 points)
  const macdTrending = latestMACD > prevMACD;
  if (latestMACD > 0 && macdTrending) {
    bullishScore += 2;
    confluenceFactors.push('MACD positive and rising (+2 bull)');
  } else if (latestMACD < 0 && !macdTrending) {
    bearishScore += 2;
    confluenceFactors.push('MACD negative and falling (+2 bear)');
  } else if (latestMACD > 0) {
    bullishScore += 1;
    confluenceFactors.push('MACD positive (+1 bull)');
  } else if (latestMACD < 0) {
    bearishScore += 1;
    confluenceFactors.push('MACD negative (+1 bear)');
  }

  // Volume trend confirming (1 point)
  if (volumeTrend.trend === 'increasing') {
    // Volume confirms the dominant direction
    if (bullishScore > bearishScore) {
      bullishScore += 1;
      confluenceFactors.push('Volume increasing with bullish bias (+1 bull)');
    } else if (bearishScore > bullishScore) {
      bearishScore += 1;
      confluenceFactors.push('Volume increasing with bearish bias (+1 bear)');
    }
  }

  // Chart pattern detection (2 points each)
  patterns.forEach(p => {
    if (p.type === 'bullish') {
      bullishScore += 2;
      confluenceFactors.push(`${p.name} pattern (+2 bull)`);
    } else if (p.type === 'bearish') {
      bearishScore += 2;
      confluenceFactors.push(`${p.name} pattern (+2 bear)`);
    }
  });

  // Clean price structure (2 points)
  if (priceStructure === 'Clean') {
    if (bullishScore > bearishScore) {
      bullishScore += 2;
      confluenceFactors.push('Clean uptrend structure (+2 bull)');
    } else if (bearishScore > bullishScore) {
      bearishScore += 2;
      confluenceFactors.push('Clean downtrend structure (+2 bear)');
    }
  } else if (priceStructure === 'Choppy') {
    confluenceFactors.push('Choppy price action (no points, caution)');
  }

  // ============================================
  // DETERMINE BIAS WITH HIGHER THRESHOLD
  // ============================================
  const confluenceScore = Math.max(bullishScore, bearishScore);
  const scoreDifference = Math.abs(bullishScore - bearishScore);

  // Require +4 signal difference (up from +2) for directional bias
  let bias = 'Neutral';
  let recommendation = 'WAIT';

  // Check for conflicting signals (both scores high = unclear)
  const hasConflictingSignals = bullishScore >= 6 && bearishScore >= 6;

  if (!hasConflictingSignals && scoreDifference >= 4) {
    if (bullishScore > bearishScore) {
      bias = 'Bullish';
      recommendation = 'LONG';
    } else {
      bias = 'Bearish';
      recommendation = 'SHORT';
    }
  }

  // ============================================
  // SETUP GRADE CALCULATION
  // ============================================
  // A Grade: 15+ points in dominant direction
  // B Grade: 12-14 points
  // C Grade: 8-11 points
  // D Grade: <8 points
  let setupGrade;
  if (confluenceScore >= 15 && scoreDifference >= 4) {
    setupGrade = 'A';
  } else if (confluenceScore >= 12 && scoreDifference >= 4) {
    setupGrade = 'B';
  } else if (confluenceScore >= 8) {
    setupGrade = 'C';
  } else {
    setupGrade = 'D';
  }

  // Force WAIT for C and D grade setups
  const isTradeableSetup = setupGrade === 'A' || setupGrade === 'B';
  if (!isTradeableSetup) {
    bias = 'Neutral';
    recommendation = 'WAIT';
  }

  // Downgrade if price structure is choppy
  if (priceStructure === 'Choppy' && setupGrade !== 'D') {
    setupGrade = setupGrade === 'A' ? 'B' : setupGrade === 'B' ? 'C' : setupGrade;
    if (setupGrade === 'C') {
      bias = 'Neutral';
      recommendation = 'WAIT';
    }
  }

  // ============================================
  // TREND STRENGTH
  // ============================================
  let trendStrength = 'Weak';
  if (confluenceScore >= 12 && priceStructure === 'Clean') {
    trendStrength = 'Strong';
  } else if (confluenceScore >= 8) {
    trendStrength = 'Moderate';
  }

  // ============================================
  // ENTRY, SL, TP CALCULATIONS
  // ============================================
  const atr = calculateATR(candles, 14);
  const latestATR = atr.length > 0 ? atr[atr.length - 1] : currentPrice * 0.02;

  let entry = 0, stopLoss = 0, takeProfit = 0;
  let riskRewardRatio = '0.00';

  // Only calculate entry/exit if tradeable setup
  if (isTradeableSetup && recommendation !== 'WAIT') {
    if (bias === 'Bullish') {
      entry = currentPrice;
      stopLoss = levels.support.length > 0
        ? Math.min(levels.support[0], currentPrice - latestATR * 1.5)
        : currentPrice - latestATR * 1.5;
      // Target at least 2:1 R:R
      const minTarget = currentPrice + (currentPrice - stopLoss) * 2;
      takeProfit = levels.resistance.length > 0
        ? Math.max(levels.resistance[0], minTarget)
        : minTarget;
    } else if (bias === 'Bearish') {
      entry = currentPrice;
      stopLoss = levels.resistance.length > 0
        ? Math.max(levels.resistance[0], currentPrice + latestATR * 1.5)
        : currentPrice + latestATR * 1.5;
      // Target at least 2:1 R:R
      const minTarget = currentPrice - (stopLoss - currentPrice) * 2;
      takeProfit = levels.support.length > 0
        ? Math.min(levels.support[0], minTarget)
        : minTarget;
    }

    const risk = Math.abs(entry - stopLoss);
    const reward = Math.abs(takeProfit - entry);
    riskRewardRatio = risk > 0 ? (reward / risk).toFixed(2) : '0.00';

    // Enforce minimum 2:1 R:R - if not met, downgrade to WAIT
    if (parseFloat(riskRewardRatio) < 2.0) {
      recommendation = 'WAIT';
      bias = 'Neutral';
      entry = 0;
      stopLoss = 0;
      takeProfit = 0;
      riskRewardRatio = '0.00';
      confluenceFactors.push('R:R below 2.0 - trade rejected');
    }
  }

  // ============================================
  // CONFIDENCE SCORE (Based on confluence)
  // ============================================
  // A grade: 80-100%
  // B grade: 65-79%
  // C grade: 40-64%
  // D grade: 0-39%
  let confidence;
  if (setupGrade === 'A') {
    confidence = Math.min(100, 80 + Math.floor((confluenceScore - 15) * 4));
  } else if (setupGrade === 'B') {
    confidence = 65 + Math.floor((confluenceScore - 12) * 5);
  } else if (setupGrade === 'C') {
    confidence = 40 + Math.floor((confluenceScore - 8) * 6);
  } else {
    confidence = Math.max(10, Math.floor(confluenceScore * 5));
  }
  confidence = Math.min(100, Math.max(10, confidence));

  return {
    bias,
    setupGrade,
    confluenceScore,
    confluenceFactors,
    recommendation,
    trendStrength,
    priceStructure,
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
