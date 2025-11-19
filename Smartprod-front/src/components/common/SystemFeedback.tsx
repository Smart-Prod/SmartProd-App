import React from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { CheckCircle, AlertTriangle, Info, XCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react';

// Component for connection status
export const ConnectionStatus: React.FC<{ isOnline: boolean }> = ({ isOnline }) => {
  return (
    <div className="flex items-center space-x-2 text-sm">
      {isOnline ? (
        <>
          <Wifi className="h-4 w-4 text-green-600" />
          <span className="text-green-600">Online</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 text-red-600" />
          <span className="text-red-600">Offline</span>
        </>
      )}
    </div>
  );
};

// Component for system notifications
export interface SystemNotification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  actions?: Array<{
    label: string;
    action: () => void;
    variant?: 'default' | 'outline' | 'destructive';
  }>;
}

interface NotificationProps {
  notification: SystemNotification;
  onDismiss: (id: string) => void;
}

export const NotificationCard: React.FC<NotificationProps> = ({ notification, onDismiss }) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-600" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getVariant = () => {
    switch (notification.type) {
      case 'error':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <Alert variant={getVariant() as any} className="mb-4">
      {getIcon()}
      <div className="flex-1">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="text-sm font-medium">{notification.title}</h4>
            <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
            <p className="text-xs text-muted-foreground mt-2">
              {notification.timestamp.toLocaleString('pt-BR')}
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onDismiss(notification.id)}
            className="ml-4"
          >
            ×
          </Button>
        </div>
        {notification.actions && notification.actions.length > 0 && (
          <div className="flex space-x-2 mt-3">
            {notification.actions.map((action, index) => (
              <Button
                key={index}
                size="sm"
                variant={action.variant || 'outline'}
                onClick={action.action}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </Alert>
  );
};

// Component for empty states
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon, 
  title, 
  description, 
  action 
}) => {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 text-gray-400">
          {icon || <Info className="h-12 w-12" />}
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500 mb-4 max-w-sm">{description}</p>
        {action && (
          <Button onClick={action.onClick}>
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

// Hook for managing system notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = React.useState<SystemNotification[]>([]);

  const addNotification = React.useCallback((
    type: SystemNotification['type'],
    title: string,
    message: string,
    actions?: SystemNotification['actions']
  ) => {
    const notification: SystemNotification = {
      id: Date.now().toString(),
      type,
      title,
      message,
      timestamp: new Date(),
      actions,
    };
    
    setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Keep max 5 notifications
    
    // Auto-dismiss success and info notifications after 5 seconds
    if (type === 'success' || type === 'info') {
      setTimeout(() => {
        dismissNotification(notification.id);
      }, 5000);
    }
  }, []);

  const dismissNotification = React.useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAllNotifications = React.useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    addNotification,
    dismissNotification,
    clearAllNotifications,
  };
};

// Component for data quality indicators
interface DataQualityProps {
  totalRecords: number;
  validRecords: number;
  lastUpdated?: Date;
}

export const DataQuality: React.FC<DataQualityProps> = ({ 
  totalRecords, 
  validRecords, 
  lastUpdated 
}) => {
  const quality = totalRecords > 0 ? (validRecords / totalRecords) * 100 : 0;
  
  const getQualityColor = () => {
    if (quality >= 95) return 'text-green-600';
    if (quality >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="flex items-center space-x-4 text-sm text-gray-600">
      <div className="flex items-center space-x-1">
        <span>Qualidade dos dados:</span>
        <span className={`font-medium ${getQualityColor()}`}>
          {quality.toFixed(1)}%
        </span>
      </div>
      <div className="flex items-center space-x-1">
        <span>Registros válidos:</span>
        <span>{validRecords.toLocaleString('pt-BR')} de {totalRecords.toLocaleString('pt-BR')}</span>
      </div>
      {lastUpdated && (
        <div className="flex items-center space-x-1">
          <RefreshCw className="h-3 w-3" />
          <span>Atualizado: {lastUpdated.toLocaleString('pt-BR')}</span>
        </div>
      )}
    </div>
  );
};

// Hook for online status
export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};