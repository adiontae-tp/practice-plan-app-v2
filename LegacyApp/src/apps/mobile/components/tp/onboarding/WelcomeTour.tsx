import React from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';
import { Calendar, FileText, Users, CheckCircle } from 'lucide-react-native';
import { COLORS } from '@ppa/ui/branding';
import { useAppStore } from '@ppa/store';

export interface WelcomeTourProps {
  visible: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export function WelcomeTour({ visible, onComplete, onSkip }: WelcomeTourProps) {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onSkip}
    >
      <Onboarding
        pages={[
          {
            backgroundColor: '#fff',
            image: (
              <View style={styles.imageContainer}>
                <View style={[styles.iconCircle, { backgroundColor: COLORS.primary + '20' }]}>
                  <CheckCircle size={64} color={COLORS.primary} />
                </View>
              </View>
            ),
            title: 'Welcome to Practice Plan!',
            subtitle: 'Let\'s take a quick tour to help you get started. We\'ll show you how to create practice plans, use templates, collaborate with your team, and more.',
          },
          {
            backgroundColor: '#fff',
            image: (
              <View style={styles.imageContainer}>
                <View style={[styles.iconCircle, { backgroundColor: COLORS.primary + '20' }]}>
                  <Calendar size={64} color={COLORS.primary} />
                </View>
              </View>
            ),
            title: 'Create Practice Plans',
            subtitle: 'Tap the "New Plan" button to create your first practice plan. Add periods, set durations, and organize your practice with tags.',
          },
          {
            backgroundColor: '#fff',
            image: (
              <View style={styles.imageContainer}>
                <View style={[styles.iconCircle, { backgroundColor: COLORS.primary + '20' }]}>
                  <FileText size={64} color={COLORS.primary} />
                </View>
              </View>
            ),
            title: 'Templates & Period Library',
            subtitle: 'Save time by creating reusable templates and period libraries. Build practices quickly by selecting from your library.',
          },
          {
            backgroundColor: '#fff',
            image: (
              <View style={styles.imageContainer}>
                <View style={[styles.iconCircle, { backgroundColor: COLORS.primary + '20' }]}>
                  <Users size={64} color={COLORS.primary} />
                </View>
              </View>
            ),
            title: 'Team Collaboration',
            subtitle: 'Invite assistant coaches to collaborate on your team. Share practice plans, post announcements, and share files with your coaching staff.',
          },
          {
            backgroundColor: '#fff',
            image: (
              <View style={styles.imageContainer}>
                <View style={[styles.iconCircle, { backgroundColor: COLORS.success + '20' }]}>
                  <CheckCircle size={64} color={COLORS.success} />
                </View>
              </View>
            ),
            title: 'You\'re All Set!',
            subtitle: 'That\'s the quick overview! Now let\'s take a guided tour of the app to show you exactly where everything is. You can replay this tour anytime from the Help menu.',
          },
        ]}
        onSkip={onSkip}
        onDone={onComplete}
        skipLabel="Skip"
        nextLabel="Next"
        bottomBarHeight={80}
        containerStyles={{
          paddingHorizontal: 20,
        }}
        titleStyles={{
          fontSize: 24,
          fontWeight: '700',
          color: COLORS.textDark,
          marginBottom: 16,
        }}
        subTitleStyles={{
          fontSize: 16,
          color: COLORS.textMuted,
          lineHeight: 24,
          paddingHorizontal: 20,
        }}
        controlStatusBar={false}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 200,
    marginBottom: 20,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
