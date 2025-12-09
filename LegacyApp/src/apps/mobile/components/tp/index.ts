// TP (Team Parcee) Wrapper Components
// Standardized wrappers for consistent UI patterns

// Core Layout
export { TPScreen } from './TPScreen';
export { TPContainer } from './TPContainer';
export { TPHeader } from './TPHeader';
export { TPCard, type TPCardProps } from './TPCard';
export {
  TPKeyboardAvoidingView,
  type TPKeyboardAvoidingViewProps,
} from './TPKeyboardAvoidingView';

// Lists & Data Display
export { TPList } from './TPList';
export { TPEmpty } from './TPEmpty';
export { TPLoading } from './TPLoading';
export { TPSearch } from './TPSearch';
export { TPTag } from './TPTag';
export { TPAvatar } from './TPAvatar';
export { TPDivider } from './TPDivider';
export { TPPeriodCard, type TPPeriodCardProps } from './TPPeriodCard';

// Forms
export { TPInput } from './TPInput';
export { TPTextarea } from './TPTextarea';
export { TPRichTextEditor, type TPRichTextEditorProps } from './TPRichTextEditor';
export { TPRichTextDisplay, type TPRichTextDisplayProps } from './TPRichTextDisplay';
export { TPSelect, type TPSelectOption } from './TPSelect';
export { TPPicker, type TPPickerProps, type TPPickerItem } from './TPPicker';
export { TPCheckbox } from './TPCheckbox';
export { TPButton, type TPButtonProps } from './TPButton';
export { TPFooterButtons, TP_FOOTER_HEIGHT, type TPFooterButtonsProps } from './TPFooterButtons';
export { TPDatePicker, type TPDatePickerProps } from './TPDatePicker';
export { TPTimePicker, type TPTimePickerProps } from './TPTimePicker';
export { TPSwitch, type TPSwitchProps } from './TPSwitch';
export { TPSlider, type TPSliderProps } from './TPSlider';
export {
  TPSegmentedControl,
  type TPSegmentedControlProps,
  type TPSegmentedControlOption,
} from './TPSegmentedControl';

// Feedback & Status
export { TPAlert, type TPAlertProps } from './TPAlert';
export { TPProgress, type TPProgressProps } from './TPProgress';
export { TPGauge, type TPGaugeProps } from './TPGauge';
export {
  TPBadge,
  TPCountBadge,
  type TPBadgeProps,
  type TPCountBadgeProps,
} from './TPBadge';
export {
  default as TPToast,
  useToast,
  type ToastProps,
  type ToastType,
  type ToastState,
} from './TPToast';

// Actions & Navigation
export { TPFab, type TPFabProps } from './TPFab';
export {
  TPBottomSheet,
  BottomSheetScrollView,
  BottomSheetTextInput,
  type TPBottomSheetProps,
  type TPBottomSheetDetent,
} from './TPBottomSheet';
export {
  TPActionSheet,
  type TPActionSheetProps,
  type TPActionSheetDetent,
} from './TPActionSheet';
export {
  TPContextMenu,
  type TPContextMenuProps,
  type TPContextMenuItem,
} from './TPContextMenu';

// Permissions
export { TPPermissionGuard, type PermissionLevel } from './TPPermissionGuard';

// Subscription
export { TPPaywall, type TPPaywallProps } from './TPPaywall';
export { TPUpgradeBanner, type TPUpgradeBannerProps } from './TPUpgradeBanner';
export { TPSubscriptionBanner, type TPSubscriptionBannerProps } from './TPSubscriptionBanner';

// PDF
export { TPPdfTemplateSheet, type TPPdfTemplateSheetProps } from './TPPdfTemplateSheet';
