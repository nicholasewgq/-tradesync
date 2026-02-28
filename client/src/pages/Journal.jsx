import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Card, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { TradeForm } from '../components/journal/TradeForm';
import { TradeList } from '../components/journal/TradeList';
import { useTrades } from '../hooks/useTrades';

export function Journal() {
  const { trades, loading, createTrade, updateTrade, deleteTrade } = useTrades();
  const [showForm, setShowForm] = useState(false);
  const [editingTrade, setEditingTrade] = useState(null);

  const handleSubmit = async (formData) => {
    if (editingTrade) {
      await updateTrade(editingTrade.id, formData);
      setEditingTrade(null);
    } else {
      await createTrade(formData);
      setShowForm(false);
    }
  };

  const handleEdit = (trade) => {
    setEditingTrade(trade);
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this trade?')) {
      await deleteTrade(id);
    }
  };

  const handleCancel = () => {
    setEditingTrade(null);
    setShowForm(false);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Trading Journal</h1>
          <p className="text-gray-500 dark:text-gray-400">Log and track your trades</p>
        </div>
        {!showForm && !editingTrade && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Trade
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TradeList
            trades={trades}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>

        <div>
          {(showForm || editingTrade) && (
            <Card>
              <CardTitle>{editingTrade ? 'Edit Trade' : 'Add New Trade'}</CardTitle>
              <div className="mt-4">
                <TradeForm
                  trade={editingTrade}
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                />
              </div>
            </Card>
          )}

          {!showForm && !editingTrade && (
            <Card className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Click "New Trade" to add your first trade entry
              </p>
              <Button onClick={() => setShowForm(true)} variant="secondary">
                <Plus className="w-4 h-4 mr-2" />
                Add Trade
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
