import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

export interface DateRange {
  startDate: string;
  endDate: string;
}

interface DateRangeValidatorProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  startLabel?: string;
  endLabel?: string;
  maxDate?: string;
  minDate?: string;
  required?: boolean;
  className?: string;
}

export const DateRangeValidator: React.FC<DateRangeValidatorProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  startLabel = "Data Inicial",
  endLabel = "Data Final",
  maxDate,
  minDate,
  required = false,
  className,
}) => {
  const [errors, setErrors] = React.useState<string[]>([]);

  const validateDates = React.useCallback(() => {
    const newErrors: string[] = [];

    if (required && (!startDate || !endDate)) {
      newErrors.push('Ambas as datas são obrigatórias');
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start > end) {
        newErrors.push('A data inicial não pode ser posterior à data final');
      }

      if (maxDate) {
        const max = new Date(maxDate);
        if (start > max || end > max) {
          newErrors.push(`As datas não podem ser posteriores a ${new Date(maxDate).toLocaleDateString('pt-BR')}`);
        }
      }

      if (minDate) {
        const min = new Date(minDate);
        if (start < min || end < min) {
          newErrors.push(`As datas não podem ser anteriores a ${new Date(minDate).toLocaleDateString('pt-BR')}`);
        }
      }

      // Check if the range is too large (more than 1 year)
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 365) {
        newErrors.push('O período não pode ser superior a 1 ano');
      }
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  }, [startDate, endDate, maxDate, minDate, required]);

  React.useEffect(() => {
    validateDates();
  }, [validateDates]);

  const handleStartDateChange = (date: string) => {
    onStartDateChange(date);
    
    // Auto-adjust end date if it becomes invalid
    if (endDate && date && new Date(date) > new Date(endDate)) {
      onEndDateChange(date);
    }
  };

  const handleEndDateChange = (date: string) => {
    onEndDateChange(date);
    
    // Auto-adjust start date if it becomes invalid
    if (startDate && date && new Date(startDate) > new Date(date)) {
      onStartDateChange(date);
    }
  };

  const isValid = errors.length === 0;

  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start-date" className={!isValid ? 'text-red-600' : ''}>
            {startLabel} {required && '*'}
          </Label>
          <Input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => handleStartDateChange(e.target.value)}
            max={endDate || maxDate}
            min={minDate}
            required={required}
            className={!isValid ? 'border-red-500' : ''}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end-date" className={!isValid ? 'text-red-600' : ''}>
            {endLabel} {required && '*'}
          </Label>
          <Input
            id="end-date"
            type="date"
            value={endDate}
            onChange={(e) => handleEndDateChange(e.target.value)}
            min={startDate || minDate}
            max={maxDate}
            required={required}
            className={!isValid ? 'border-red-500' : ''}
          />
        </div>
      </div>
      
      {errors.length > 0 && (
        <Alert variant="destructive" className="mt-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

// Hook para validação de intervalo de datas
export const useDateRangeValidation = (
  initialStart = '',
  initialEnd = '',
  options: {
    maxDate?: string;
    minDate?: string;
    required?: boolean;
    maxRangeDays?: number;
  } = {}
) => {
  const [startDate, setStartDate] = React.useState(initialStart);
  const [endDate, setEndDate] = React.useState(initialEnd);
  const [isValid, setIsValid] = React.useState(true);
  const [errors, setErrors] = React.useState<string[]>([]);

  const validate = React.useCallback(() => {
    const newErrors: string[] = [];

    if (options.required && (!startDate || !endDate)) {
      newErrors.push('Ambas as datas são obrigatórias');
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start > end) {
        newErrors.push('A data inicial não pode ser posterior à data final');
      }

      if (options.maxDate) {
        const max = new Date(options.maxDate);
        if (start > max || end > max) {
          newErrors.push('As datas não podem ser posteriores à data máxima permitida');
        }
      }

      if (options.minDate) {
        const min = new Date(options.minDate);
        if (start < min || end < min) {
          newErrors.push('As datas não podem ser anteriores à data mínima permitida');
        }
      }

      if (options.maxRangeDays) {
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > options.maxRangeDays) {
          newErrors.push(`O período não pode ser superior a ${options.maxRangeDays} dias`);
        }
      }
    }

    setErrors(newErrors);
    setIsValid(newErrors.length === 0);
    return newErrors.length === 0;
  }, [startDate, endDate, options]);

  React.useEffect(() => {
    validate();
  }, [validate]);

  const setDateRange = React.useCallback((start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
  }, []);

  const resetToDefaults = React.useCallback(() => {
    setStartDate(initialStart);
    setEndDate(initialEnd);
  }, [initialStart, initialEnd]);

  return {
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    setDateRange,
    resetToDefaults,
    isValid,
    errors,
    validate,
  };
};