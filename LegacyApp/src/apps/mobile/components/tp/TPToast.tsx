import { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Platform } from 'react-native';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react-native';
import { COLORS } from '@ppa/ui/branding';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  duration?: number;
  onDismiss: () => void;
  action?: {
    label: string;
    onPress: () => void;
  };
}

const toastConfig = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-800',
    iconColor: '#16a34a',
  },
  error: {
    icon: XCircle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-800',
    iconColor: '#dc2626',
  },
  warning: {
    icon: AlertCircle,
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-800',
    iconColor: '#d97706',
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800',
    iconColor: '#2563eb',
  },
};

export default function TPToast({
  visible,
  message,
  type = 'success',
  duration = 3000,
  onDismiss,
  action,
}: ToastProps) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const config = toastConfig[type];
  const Icon = config.icon;

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 10,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss
      if (duration > 0) {
        const timer = setTimeout(() => {
          handleDismiss();
        }, duration);
        return () => clearTimeout(timer);
      }
    }
  }, [visible, duration]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: Platform.OS === 'ios' ? 60 : 40,
        left: 16,
        right: 16,
        zIndex: 9999,
        transform: [{ translateY }],
        opacity,
      }}
    >
      <View
        className={`${config.bgColor} ${config.borderColor} border rounded-xl px-4 py-3 flex-row items-center shadow-lg`}
      >
        <Icon size={20} color={config.iconColor} />
        <Text className={`${config.textColor} flex-1 ml-3 text-sm font-medium`}>
          {message}
        </Text>
        {action && (
          <TouchableOpacity
            onPress={() => {
              action.onPress();
              handleDismiss();
            }}
            className="ml-2"
          >
            <Text className={`${config.textColor} text-sm font-semibold underline`}>
              {action.label}
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={handleDismiss} className="ml-2 p-1">
          <X size={16} color={config.iconColor} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

// Hook for managing toast state
import { useState, useCallback } from 'react';

export interface ToastState {
  visible: boolean;
  message: string;
  type: ToastType;
  action?: {
    label: string;
    onPress: () => void;
  };
}

export function useToast() {
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    message: '',
    type: 'success',
  });

  const showToast = useCallback(
    (
      message: string,
      type: ToastType = 'success',
      action?: { label: string; onPress: () => void }
    ) => {
      setToast({ visible: true, message, type, action });
    },
    []
  );

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  const success = useCallback(
    (message: string, action?: { label: string; onPress: () => void }) => {
      showToast(message, 'success', action);
    },
    [showToast]
  );

  const error = useCallback(
    (message: string, action?: { label: string; onPress: () => void }) => {
      showToast(message, 'error', action);
    },
    [showToast]
  );

  const warning = useCallback(
    (message: string, action?: { label: string; onPress: () => void }) => {
      showToast(message, 'warning', action);
    },
    [showToast]
  );

  const info = useCallback(
    (message: string, action?: { label: string; onPress: () => void }) => {
      showToast(message, 'info', action);
    },
    [showToast]
  );

  return {
    toast,
    showToast,
    hideToast,
    success,
    error,
    warning,
    info,
  };
}
