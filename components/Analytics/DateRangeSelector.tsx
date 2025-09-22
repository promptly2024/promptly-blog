"use client";

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRange } from '@/types/analytics';

interface DateRangeSelectorProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  dateRange,
  onDateRangeChange,
}) => {
  const presetRanges = [
    {
      label: 'Last 6 Months',
      value: '6months',
      getRange: () => ({
        from: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
        to: new Date(),
      }),
    },
    {
      label: 'Last 3 Months',
      value: '3months',
      getRange: () => ({
        from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        to: new Date(),
      }),
    },
    {
      label: 'Last Month',
      value: '1month',
      getRange: () => ({
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        to: new Date(),
      }),
    },
    {
      label: 'Last 7 Days',
      value: '7days',
      getRange: () => ({
        from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        to: new Date(),
      }),
    },
  ];

  const handlePresetChange = (preset: string) => {
    const selectedPreset = presetRanges.find(p => p.value === preset);
    if (selectedPreset) {
      onDateRangeChange(selectedPreset.getRange());
    }
  };

  return (
    <Select defaultValue="6months" onValueChange={handlePresetChange}>
      <SelectTrigger className="w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {presetRanges.map((preset) => (
          <SelectItem key={preset.value} value={preset.value}>
            {preset.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default DateRangeSelector;
