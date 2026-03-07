import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import {colors} from '../../../../utilities';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Header} from '../../../../components';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import styles from './styles';

const FAQs = () => {
  const navigation = useNavigation();
  const [expandedId, setExpandedId] = useState(null);

  const faqs = [
    {
      id: 1,
      question: 'How do I track my blood sugar?',
      answer:
        'Use the Track Sugar tab to add readings. Tap "Add New Record" to log your blood sugar level, and view trends in the chart. You can also scan food to predict sugar impact.',
    },
    {
      id: 2,
      question: 'How does the fasting tracker work?',
      answer:
        'The fasting tracker helps you monitor your fasting periods. Choose a plan (e.g. 16:8), start the timer, and view your fasting history with detailed insights.',
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
    <SafeAreaView style={styles.container} edges={['left', 'right', 'top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.headerWrapper}>
        <Header title="FAQs" onPress={() => navigation.goBack()} />
      </View>

      <View style={styles.heroSection}>
        <View style={styles.heroIconWrap}>
          <Ionicons name="help-circle" size={26} color={colors.p1} />
        </View>
        <Text style={styles.heroTitle}>Frequently Asked Questions</Text>
        <Text style={styles.heroSubtitle}>
          Quick answers to common questions
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {faqs.map((faq, index) => (
          <FAQItem
            key={faq.id}
            num={index + 1}
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

const FAQItem = ({num, question, answer, isExpanded, onPress}) => (
  <View style={styles.faqCard}>
    <LinearGradient
      colors={[colors.p1, colors.p9]}
      start={{x: 0, y: 0}}
      end={{x: 0, y: 1}}
      style={styles.faqAccent}
    />
    <TouchableOpacity
      style={styles.questionRow}
      onPress={onPress}
      activeOpacity={0.8}>
      <View style={styles.questionNum}>
        <Text style={styles.questionNumText}>{num}</Text>
      </View>
      <Text style={styles.questionText} numberOfLines={isExpanded ? 10 : 2}>
        {question}
      </Text>
      <Ionicons
        name={isExpanded ? 'chevron-up' : 'chevron-down'}
        size={20}
        color={colors.g9}
        style={styles.expandIcon}
      />
    </TouchableOpacity>

    {isExpanded && (
      <View style={styles.answerContainer}>
        <Text style={styles.answer}>{answer}</Text>
      </View>
    )}
  </View>
);

export default FAQs;
