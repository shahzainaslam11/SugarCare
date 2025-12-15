import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
} from 'react-native';
import {appIcons, colors, family, HP, size, WP} from '../../../../utilities';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Header} from '../../../../components';

const FAQs = () => {
  const navigation = useNavigation();
  const [expandedId, setExpandedId] = useState(1); // First item expanded by default

  const faqs = [
    {
      id: 1,
      question: 'How do I track my blood sugar?',
      answer:
        'Yes, we can track your daily water intake using the app. You can set reminders and log your consumption throughout the day.',
    },
    {
      id: 2,
      question: 'How does the fasting tracker work?',
      answer:
        'The fasting tracker helps you monitor your fasting periods. Start and stop the timer, and view your fasting history with detailed insights.',
    },
    {
      id: 3,
      question: 'How to change my sugar unit?',
      answer:
        'Go to Settings > User Preferences > Measurement Units to switch between mg/dL and mmol/L.',
    },
    {
      id: 4,
      question: 'How to reset my password?',
      answer:
        'Go to Login > Forgot Password, enter your email, and follow the reset link sent to your inbox.',
    },
  ];

  const toggleExpand = id => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Header title="FAQs" onPress={() => navigation.goBack()} />

      {/* FAQ List */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {faqs.map(faq => (
          <FAQItem
            key={faq.id}
            question={faq.question}
            answer={faq.answer}
            isExpanded={expandedId === faq.id}
            onPress={() => toggleExpand(faq.id)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

// Reusable FAQ Item – now uses icons instead of text arrows
const FAQItem = ({question, answer, isExpanded, onPress}) => {
  return (
    <View style={styles.faqCard}>
      <TouchableOpacity style={styles.questionRow} onPress={onPress}>
        <Text style={styles.question}>{question}</Text>

        {/* Up / Down Chevron Icons */}
        <Image
          source={isExpanded ? appIcons.upArrow : appIcons.donwArrow}
          style={styles.expandIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.answerContainer}>
          <Text style={styles.answer}>{answer}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white || '#f5f5f5',
  },
  scrollContent: {
    padding: WP(5),
    paddingBottom: HP(4),
  },
  faqCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: WP(4),
    paddingVertical: HP(1.5),
    marginBottom: HP(2),
    borderWidth: 1,
    borderColor: '#e5e5e5',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  questionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  question: {
    fontSize: size.medium,
    fontFamily: family.inter_medium,
    fontWeight: '600',
    color: colors.b1 || '#333',
    flex: 1,
    marginRight: WP(3),
  },
  expandIcon: {
    width: WP(5),
    height: WP(5),
  },
  answerContainer: {
    marginTop: HP(1.5),
    paddingTop: HP(1),
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  answer: {
    fontSize: size.small,
    fontFamily: family.inter_medium,
    color: colors.g1 || '#666',
    lineHeight: WP(5.5),
  },
});

export default FAQs;
