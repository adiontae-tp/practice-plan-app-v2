import React, { useState } from 'react';
import { View, Text, Modal, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronLeft, ChevronRight, X } from 'lucide-react-native';
import { COLORS } from '@ppa/ui/branding';
import { useAppStore } from '@ppa/store';
import { TPButton } from '../TPButton';

export interface GuidedTourProps {
  visible: boolean;
  onComplete: () => void;
}

const tourSteps = [
  {
    title: 'Practice Tab',
    description: 'This is your home screen. See today\'s practice plans and upcoming practices at a glance.',
  },
  {
    title: 'Calendar Tab',
    description: 'View all your practices in a calendar. Tap any date to see or create practices for that day.',
  },
  {
    title: 'Create Practice Plans',
    description: 'Tap the "New Plan" button to create a practice. Add periods, set times, and organize with tags.',
  },
  {
    title: 'Period Library',
    description: 'Access your period templates - reusable drills and activities. Create them once, use them many times.',
  },
  {
    title: 'Practice Templates',
    description: 'Save complete practice plans as templates. Perfect for recurring practice structures.',
  },
  {
    title: 'Tags',
    description: 'Use tags to organize your plans, periods, and templates. Filter and search by tags.',
  },
  {
    title: 'Team Collaboration',
    description: 'Invite assistant coaches to join your team. They can view or edit plans based on their permissions.',
  },
  {
    title: 'Files',
    description: 'Store and share files with your coaching staff. Upload diagrams, playbooks, or resources.',
  },
  {
    title: 'Announcements',
    description: 'Post announcements to keep your coaching staff informed about important updates.',
  },
  {
    title: 'You\'re All Set!',
    description: 'That\'s the guided tour! You can replay this anytime from the Menu tab. Happy planning!',
  },
];

export function GuidedTour({ visible, onComplete }: GuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const { setGuidedTourActive } = useAppStore();

  if (!visible) return null;

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === tourSteps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    setGuidedTourActive(false);
    setCurrentStep(0);
  };

  const step = tourSteps[currentStep];

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={handleSkip}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                {currentStep + 1} of {tourSteps.length}
              </Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${((currentStep + 1) / tourSteps.length) * 100}%` },
                  ]}
                />
              </View>
            </View>
            <TouchableOpacity onPress={handleSkip} style={styles.closeButton}>
              <X size={24} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.title}>{step.title}</Text>
            <Text style={styles.description}>{step.description}</Text>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.buttonContainer}>
              {!isFirstStep && (
                <TouchableOpacity
                  onPress={handleBack}
                  style={styles.backButton}
                >
                  <ChevronLeft size={20} color={COLORS.primary} />
                  <Text style={styles.backText}>Back</Text>
                </TouchableOpacity>
              )}
              <View style={{ flex: 1 }} />
              <TPButton
                label={isLastStep ? 'Finish' : 'Next'}
                onPress={handleNext}
                style={styles.nextButton}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '100%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  progressContainer: {
    flex: 1,
    marginRight: 16,
  },
  progressText: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 8,
    fontWeight: '600',
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: COLORS.textMuted,
    lineHeight: 24,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  backText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: 4,
  },
  nextButton: {
    minWidth: 120,
  },
});
