import { Check, Star } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for getting started',
    features: [
      'Unlimited trade logging',
      'Basic analytics',
      'CSV export',
      'Dark/Light mode',
      'Mobile responsive'
    ],
    current: true
  },
  {
    name: 'Pro',
    price: '$19',
    period: 'per month',
    description: 'For serious traders',
    features: [
      'Everything in Free',
      'Advanced analytics',
      'AI trading tips',
      'Multiple accounts',
      'Priority support',
      'Custom indicators'
    ],
    popular: true
  },
  {
    name: 'Enterprise',
    price: '$49',
    period: 'per month',
    description: 'For trading teams',
    features: [
      'Everything in Pro',
      'Team collaboration',
      'API access',
      'White-label options',
      'Dedicated support',
      'Custom integrations'
    ]
  }
];

export function Plans() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Pricing Plans</h1>
        <p className="text-gray-500 dark:text-gray-400">Choose the plan that fits your trading needs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`relative ${plan.popular ? 'ring-2 ring-indigo-500' : ''}`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-medium rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  Most Popular
                </span>
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{plan.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{plan.description}</p>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                <span className="text-gray-500 dark:text-gray-400">/{plan.period}</span>
              </div>
            </div>

            <ul className="space-y-3 mb-6">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm">
                  <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>

            {plan.current ? (
              <Button variant="secondary" className="w-full" disabled>
                Current Plan
              </Button>
            ) : (
              <Button
                variant={plan.popular ? 'primary' : 'secondary'}
                className="w-full"
              >
                Upgrade to {plan.name}
              </Button>
            )}
          </Card>
        ))}
      </div>

      <Card className="mt-10 text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          All features are simulated
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          This is a demo application. All plans and features shown here are for demonstration purposes only.
          The Free plan includes all functionality needed for personal trading journal use.
        </p>
      </Card>
    </div>
  );
}
