import { useState } from 'react';
import { X } from 'lucide-react';
import { Input, Select, Textarea } from '../ui/Input';
import { Button } from '../ui/Button';

const initialFormState = {
  pair: '',
  type: 'swing',
  direction: 'long',
  entry_price: '',
  exit_price: '',
  stop_loss: '',
  take_profit: '',
  quantity: '1',
  status: 'open',
  notes: ''
};

export function TradeForm({ trade, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(trade || initialFormState);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.pair.trim()) newErrors.pair = 'Pair is required';
    if (!formData.entry_price) newErrors.entry_price = 'Entry price is required';
    if (formData.entry_price && isNaN(parseFloat(formData.entry_price))) {
      newErrors.entry_price = 'Must be a valid number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await onSubmit(formData);
      if (!trade) setFormData(initialFormState);
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {trade && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Trade</h3>
          <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Trading Pair"
          name="pair"
          value={formData.pair}
          onChange={handleChange}
          placeholder="e.g., BTC/USD"
          error={errors.pair}
        />

        <Select
          label="Trade Type"
          name="type"
          value={formData.type}
          onChange={handleChange}
        >
          <option value="swing">Swing Trade</option>
          <option value="scalp">Scalp Trade</option>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Direction"
          name="direction"
          value={formData.direction}
          onChange={handleChange}
        >
          <option value="long">Long</option>
          <option value="short">Short</option>
        </Select>

        <Select
          label="Status"
          name="status"
          value={formData.status}
          onChange={handleChange}
        >
          <option value="open">Open</option>
          <option value="closed">Closed</option>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Entry Price"
          name="entry_price"
          type="number"
          step="any"
          value={formData.entry_price}
          onChange={handleChange}
          placeholder="0.00"
          error={errors.entry_price}
        />

        <Input
          label="Exit Price"
          name="exit_price"
          type="number"
          step="any"
          value={formData.exit_price}
          onChange={handleChange}
          placeholder="0.00 (optional)"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Stop Loss"
          name="stop_loss"
          type="number"
          step="any"
          value={formData.stop_loss}
          onChange={handleChange}
          placeholder="0.00 (optional)"
        />

        <Input
          label="Take Profit"
          name="take_profit"
          type="number"
          step="any"
          value={formData.take_profit}
          onChange={handleChange}
          placeholder="0.00 (optional)"
        />
      </div>

      <Input
        label="Quantity"
        name="quantity"
        type="number"
        step="any"
        value={formData.quantity}
        onChange={handleChange}
        placeholder="1"
      />

      <Textarea
        label="Notes"
        name="notes"
        value={formData.notes}
        onChange={handleChange}
        placeholder="Trade notes, strategy, reasoning..."
      />

      {errors.submit && (
        <p className="text-red-500 text-sm">{errors.submit}</p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : trade ? 'Update Trade' : 'Add Trade'}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
