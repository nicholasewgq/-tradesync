import { useEffect, useRef, memo } from 'react';

export const TradingViewChart = memo(function TradingViewChart({
  symbol = 'NASDAQ:AAPL',
  theme = 'dark',
  height = 400,
  autosize = false,
  interval = 'D',
  timezone = 'exchange',
  style = '1',
  locale = 'en',
  toolbar_bg = '#0f172a',
  enable_publishing = false,
  hide_top_toolbar = false,
  hide_legend = false,
  save_image = false,
  container_id = 'tradingview_chart',
  studies = []
}) {
  const containerRef = useRef(null);
  const scriptRef = useRef(null);

  useEffect(() => {
    // Clean up previous widget
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }

    // Create widget container
    const widgetContainer = document.createElement('div');
    widgetContainer.id = container_id;
    widgetContainer.style.height = '100%';
    widgetContainer.style.width = '100%';

    if (containerRef.current) {
      containerRef.current.appendChild(widgetContainer);
    }

    // Create and load script
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (typeof TradingView !== 'undefined' && containerRef.current) {
        new TradingView.widget({
          autosize: autosize,
          symbol: symbol,
          interval: interval,
          timezone: timezone,
          theme: theme,
          style: style,
          locale: locale,
          toolbar_bg: toolbar_bg,
          enable_publishing: enable_publishing,
          hide_top_toolbar: hide_top_toolbar,
          hide_legend: hide_legend,
          save_image: save_image,
          container_id: container_id,
          studies: studies,
          width: '100%',
          height: height,
          backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
          gridColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
        });
      }
    };

    document.head.appendChild(script);
    scriptRef.current = script;

    return () => {
      if (scriptRef.current && document.head.contains(scriptRef.current)) {
        document.head.removeChild(scriptRef.current);
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [symbol, theme, height, interval, autosize, timezone, style, locale, toolbar_bg, enable_publishing, hide_top_toolbar, hide_legend, save_image, container_id, studies]);

  return (
    <div
      ref={containerRef}
      style={{ height: autosize ? '100%' : height, width: '100%' }}
      className="rounded-xl overflow-hidden"
    />
  );
});

// Mini chart widget for smaller displays
export const TradingViewMiniChart = memo(function TradingViewMiniChart({
  symbol = 'NASDAQ:AAPL',
  theme = 'dark',
  height = 220,
  width = '100%',
  dateRange = '1D',
  container_id = 'tradingview_mini'
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol: symbol,
      width: width,
      height: height,
      locale: 'en',
      dateRange: dateRange,
      colorTheme: theme,
      isTransparent: true,
      autosize: false,
      largeChartUrl: ''
    });

    if (containerRef.current) {
      const widgetContainer = document.createElement('div');
      widgetContainer.className = 'tradingview-widget-container';
      widgetContainer.innerHTML = '<div class="tradingview-widget-container__widget"></div>';
      widgetContainer.appendChild(script);
      containerRef.current.appendChild(widgetContainer);
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [symbol, theme, height, width, dateRange]);

  return (
    <div
      ref={containerRef}
      style={{ height, width }}
      className="rounded-xl overflow-hidden"
    />
  );
});

// Ticker tape widget
export const TradingViewTicker = memo(function TradingViewTicker({
  theme = 'dark',
  symbols = [
    { proName: 'FOREXCOM:SPXUSD', title: 'S&P 500' },
    { proName: 'FOREXCOM:NSXUSD', title: 'NASDAQ' },
    { proName: 'FX:EURUSD', title: 'EUR/USD' },
    { proName: 'BITSTAMP:BTCUSD', title: 'BTC/USD' },
    { proName: 'BITSTAMP:ETHUSD', title: 'ETH/USD' }
  ]
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: symbols,
      showSymbolLogo: true,
      colorTheme: theme,
      isTransparent: true,
      displayMode: 'adaptive',
      locale: 'en'
    });

    if (containerRef.current) {
      const widgetContainer = document.createElement('div');
      widgetContainer.className = 'tradingview-widget-container';
      widgetContainer.innerHTML = '<div class="tradingview-widget-container__widget"></div>';
      widgetContainer.appendChild(script);
      containerRef.current.appendChild(widgetContainer);
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [theme, symbols]);

  return <div ref={containerRef} className="w-full" />;
});

// Advanced real-time chart
export const TradingViewAdvancedChart = memo(function TradingViewAdvancedChart({
  symbol = 'NASDAQ:AAPL',
  theme = 'dark',
  height = 500,
  container_id = 'tradingview_advanced'
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: symbol,
      interval: 'D',
      timezone: 'Etc/UTC',
      theme: theme,
      style: '1',
      locale: 'en',
      enable_publishing: false,
      allow_symbol_change: true,
      calendar: false,
      support_host: 'https://www.tradingview.com',
      hide_volume: false,
      backgroundColor: theme === 'dark' ? 'rgba(15, 23, 42, 1)' : 'rgba(255, 255, 255, 1)',
      gridColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
    });

    if (containerRef.current) {
      const widgetContainer = document.createElement('div');
      widgetContainer.className = 'tradingview-widget-container';
      widgetContainer.style.height = '100%';
      widgetContainer.style.width = '100%';
      widgetContainer.innerHTML = `<div class="tradingview-widget-container__widget" style="height:calc(100% - 32px);width:100%"></div>`;
      widgetContainer.appendChild(script);
      containerRef.current.appendChild(widgetContainer);
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [symbol, theme, height, container_id]);

  return (
    <div
      ref={containerRef}
      style={{ height }}
      className="w-full rounded-xl overflow-hidden"
    />
  );
});

// Symbol info widget
export const TradingViewSymbolInfo = memo(function TradingViewSymbolInfo({
  symbol = 'NASDAQ:AAPL',
  theme = 'dark',
  width = '100%'
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-symbol-info.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol: symbol,
      width: width,
      locale: 'en',
      colorTheme: theme,
      isTransparent: true
    });

    if (containerRef.current) {
      const widgetContainer = document.createElement('div');
      widgetContainer.className = 'tradingview-widget-container';
      widgetContainer.innerHTML = '<div class="tradingview-widget-container__widget"></div>';
      widgetContainer.appendChild(script);
      containerRef.current.appendChild(widgetContainer);
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [symbol, theme, width]);

  return <div ref={containerRef} className="w-full" />;
});

// Market overview widget
export const TradingViewMarketOverview = memo(function TradingViewMarketOverview({
  theme = 'dark',
  height = 400,
  width = '100%',
  showChart = true,
  tabs = [
    {
      title: 'Indices',
      symbols: [
        { s: 'FOREXCOM:SPXUSD', d: 'S&P 500' },
        { s: 'FOREXCOM:NSXUSD', d: 'NASDAQ' },
        { s: 'FOREXCOM:DJI', d: 'Dow Jones' }
      ]
    },
    {
      title: 'Forex',
      symbols: [
        { s: 'FX:EURUSD', d: 'EUR/USD' },
        { s: 'FX:GBPUSD', d: 'GBP/USD' },
        { s: 'FX:USDJPY', d: 'USD/JPY' }
      ]
    },
    {
      title: 'Crypto',
      symbols: [
        { s: 'BITSTAMP:BTCUSD', d: 'BTC/USD' },
        { s: 'BITSTAMP:ETHUSD', d: 'ETH/USD' },
        { s: 'BINANCE:SOLUSDT', d: 'SOL/USDT' }
      ]
    }
  ]
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      colorTheme: theme,
      dateRange: '1D',
      showChart: showChart,
      locale: 'en',
      width: width,
      height: height,
      largeChartUrl: '',
      isTransparent: true,
      showSymbolLogo: true,
      showFloatingTooltip: true,
      tabs: tabs
    });

    if (containerRef.current) {
      const widgetContainer = document.createElement('div');
      widgetContainer.className = 'tradingview-widget-container';
      widgetContainer.innerHTML = '<div class="tradingview-widget-container__widget"></div>';
      widgetContainer.appendChild(script);
      containerRef.current.appendChild(widgetContainer);
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [theme, height, width, showChart, tabs]);

  return (
    <div
      ref={containerRef}
      style={{ height, width }}
      className="rounded-xl overflow-hidden"
    />
  );
});
