import { HelpCircle, MessageSquare, FileText, Mail } from 'lucide-react';
import { Card, CardTitle } from '../components/ui/Card';

export function Support() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Help & Support</h1>
        <p className="text-gray-500 dark:text-gray-400">Get help with your trading dashboard</p>
      </div>

      <div className="grid gap-4">
        <Card className="hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors cursor-pointer">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Documentation</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Learn how to use all features of the trading dashboard
              </p>
            </div>
          </div>
        </Card>

        <Card className="hover:border-green-200 dark:hover:border-green-800 transition-colors cursor-pointer">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Community Forum</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Connect with other traders and share strategies
              </p>
            </div>
          </div>
        </Card>

        <Card className="hover:border-amber-200 dark:hover:border-amber-800 transition-colors cursor-pointer">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Mail className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Contact Support</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Get in touch with our support team for assistance
              </p>
            </div>
          </div>
        </Card>

        <Card className="hover:border-purple-200 dark:hover:border-purple-800 transition-colors cursor-pointer">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <HelpCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">FAQ</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Find answers to frequently asked questions
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
