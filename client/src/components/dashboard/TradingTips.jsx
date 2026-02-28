import { Lightbulb, RefreshCw } from 'lucide-react';
import { Card } from '../ui/Card';
import { useState } from 'react';

const tips = [
  {
    title: 'Risk Management',
    tip: 'Never risk more than 1-2% of your account on a single trade. This helps preserve capital during losing streaks.'
  },
  {
    title: 'Entry Timing',
    tip: 'Wait for confirmation before entering. A setup that looks good might need one more candle to validate the move.'
  },
  {
    title: 'Journal Review',
    tip: 'Review your trades weekly. Look for patterns in your winners and losers to refine your strategy.'
  },
  {
    title: 'Emotional Control',
    tip: 'Take a break after 3 consecutive losses. Emotional trading often leads to revenge trades and bigger losses.'
  },
  {
    title: 'Position Sizing',
    tip: 'Size your position based on the stop loss distance. Larger stops mean smaller positions to maintain consistent risk.'
  },
  {
    title: 'Market Context',
    tip: 'Always check the higher timeframe trend before taking trades. Trading with the trend increases your win rate.'
  },
  {
    title: 'Profit Taking',
    tip: 'Consider taking partial profits at key levels. This locks in gains while letting winners run.'
  },
  {
    title: 'Pre-Market Routine',
    tip: 'Develop a consistent pre-market routine. Review key levels, news, and your trading plan before the market opens.'
  }
];

export function TradingTips() {
  const [currentTip, setCurrentTip] = useState(() => Math.floor(Math.random() * tips.length));

  const refreshTip = () => {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * tips.length);
    } while (newIndex === currentTip && tips.length > 1);
    setCurrentTip(newIndex);
  };

  const tip = tips[currentTip];

  return (
    <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5" />
          <h3 className="font-semibold">AI Trading Tip</h3>
        </div>
        <button
          onClick={refreshTip}
          className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <h4 className="text-lg font-medium mb-2">{tip.title}</h4>
      <p className="text-white/90 text-sm leading-relaxed">{tip.tip}</p>

      <div className="mt-4 pt-4 border-t border-white/20">
        <p className="text-xs text-white/70">
          Tip {currentTip + 1} of {tips.length} • Click refresh for another tip
        </p>
      </div>
    </Card>
  );
}
