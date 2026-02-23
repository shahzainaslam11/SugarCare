// ChatScreen.js
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import React, {useState, useRef, useEffect} from 'react';
import {Animated} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Header, AIConsentModal} from '../../../components';
import {colors, appIcons} from '../../../utilities';
import {useAIConsentGate} from '../../../hooks/useAIConsentGate';
import styles from './styles';

// Redux
import {useDispatch, useSelector} from 'react-redux';
import {
  sendChatMessage,
  fetchChatHistory,
  addUserMessage,
} from '../../../redux/slices/chatSlice';

const ChatScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {gateAIAction, showModal, handleAccept, handleDecline} = useAIConsentGate();
  const scrollViewRef = useRef(null);

  const [inputMessage, setInputMessage] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const inputRef = useRef(null);
  const typingAnim1 = useRef(new Animated.Value(0)).current;
  const typingAnim2 = useRef(new Animated.Value(0)).current;
  const typingAnim3 = useRef(new Animated.Value(0)).current;

  // Animate typing indicator
  useEffect(() => {
    if (isBotTyping) {
      const animateDot = (animValue, delay) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(animValue, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(animValue, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
        );
      };

      const anim1 = animateDot(typingAnim1, 0);
      const anim2 = animateDot(typingAnim2, 200);
      const anim3 = animateDot(typingAnim3, 400);

      anim1.start();
      anim2.start();
      anim3.start();

      return () => {
        anim1.stop();
        anim2.stop();
        anim3.stop();
        typingAnim1.setValue(0);
        typingAnim2.setValue(0);
        typingAnim3.setValue(0);
      };
    }
  }, [isBotTyping]);

  const {accessToken, user} = useSelector(state => state.auth);
  const {messages = [], loading} = useSelector(state => state.chat);

  // Fetch chat history on load
  useEffect(() => {
    if (user?.id && accessToken) {
      dispatch(fetchChatHistory({user_id: user.id, token: accessToken}));
    }
  }, [dispatch, user?.id, accessToken]);

  // Auto scroll
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({animated: true});
  }, [messages.length]);

  const handleSend = async () => {
    const text = inputMessage.trim();
    if (!text) return;

    const ok = await gateAIAction();
    if (!ok) return;

    // 1) show user message immediately
    dispatch(addUserMessage(text));
    setInputMessage('');

    // 2) show typing
    setIsBotTyping(true);

    // 3) call API
    if (user?.id && accessToken) {
      dispatch(
        sendChatMessage({message: text, user_id: user.id, token: accessToken}),
      ).finally(() => setIsBotTyping(false));
    }
  };

  const renderMessage = (message, index) => {
    const isUser = message.sender === 'user';
    const text = message.message || message.reply || '';
    const messageDate = new Date(message.created_at || Date.now());
    const time = messageDate.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    // Check if this is a new day compared to previous message
    const prevMessage = index > 0 ? messages[index - 1] : null;
    const showDateSeparator =
      !prevMessage ||
      new Date(prevMessage.created_at).toDateString() !==
        messageDate.toDateString();

    return (
      <View key={message.id ?? index}>
        {showDateSeparator && (
          <View style={styles.dateSeparator}>
            <View style={styles.dateSeparatorLine} />
            <Text style={styles.dateSeparatorText}>
              {messageDate.toLocaleDateString([], {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
            <View style={styles.dateSeparatorLine} />
          </View>
        )}

        <View
          style={[
            styles.messageRow,
            isUser ? styles.userRow : styles.botRow,
            index === messages.length - 1 && styles.lastMessage,
          ]}>
          {!isUser && (
            <View style={styles.botAvatarContainer}>
              <View style={styles.botAvatar}>
                <Image
                  source={appIcons.robo}
                  style={styles.botAvatarImage}
                  resizeMode="contain"
                />
              </View>
            </View>
          )}

          <View
            style={[
              styles.messageBubbleContainer,
              isUser && styles.userBubbleContainer,
            ]}>
            {!isUser && (
              <Text style={styles.senderName}>MedBot</Text>
            )}
            <View
              style={[
                styles.messageBubble,
                isUser ? styles.userBubble : styles.botBubble,
              ]}>
              <Text style={isUser ? styles.userText : styles.botText}>
                {text}
              </Text>
            </View>
            <Text
              style={[
                styles.messageTime,
                isUser ? styles.userMessageTime : styles.botMessageTime,
              ]}>
              {time}
            </Text>
          </View>

          {isUser && (
            <View style={styles.userAvatarContainer}>
              <View style={styles.userAvatar}>
                <Image
                  source={appIcons.User}
                  style={styles.userAvatarImage}
                  resizeMode="contain"
                />
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <Header title="Chat with SugaBuddy" onPress={() => navigation.goBack()} />

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
        <View style={styles.chatArea}>
          <ScrollView
            style={styles.chatScroll}
            contentContainerStyle={styles.chatScrollContent}
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            {messages.length > 0 ? (
              messages.map(renderMessage)
            ) : (
              <View style={styles.initialContainer}>
                <View style={styles.initialIconContainer}>
                  <View style={styles.initialIconCircle}>
                    <Image
                      source={appIcons.robo}
                      style={styles.initialIcon}
                      resizeMode="contain"
                    />
                  </View>
                </View>
                <Text style={styles.initialTitle}>Hey there! 👋</Text>
                <Text style={styles.initialSubtitle}>
                  I'm SugaBuddy, your AI assistant for blood sugar management.
                  Ask me anything!
                </Text>
                <View style={styles.suggestionChips}>
                  <View style={styles.chip}>
                    <Text style={styles.chipText}>
                      What should I eat today?
                    </Text>
                  </View>
                  <View style={styles.chip}>
                    <Text style={styles.chipText}>
                      Check my sugar levels
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Bot typing indicator */}
            {isBotTyping && (
              <View style={[styles.messageRow, styles.botRow]}>
                <View style={styles.botAvatarContainer}>
                  <View style={styles.botAvatar}>
                    <Image
                      source={appIcons.robo}
                      style={styles.botAvatarImage}
                      resizeMode="contain"
                    />
                  </View>
                </View>
                <View style={styles.messageBubbleContainer}>
                  <View style={[styles.messageBubble, styles.botBubble]}>
                    <View style={styles.typingIndicator}>
                      <Animated.View
                        style={[
                          styles.typingDot,
                          {
                            opacity: typingAnim1.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0.3, 1],
                            }),
                            transform: [
                              {
                                scale: typingAnim1.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [0.8, 1.2],
                                }),
                              },
                            ],
                          },
                        ]}
                      />
                      <Animated.View
                        style={[
                          styles.typingDot,
                          {
                            opacity: typingAnim2.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0.3, 1],
                            }),
                            transform: [
                              {
                                scale: typingAnim2.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [0.8, 1.2],
                                }),
                              },
                            ],
                          },
                        ]}
                      />
                      <Animated.View
                        style={[
                          styles.typingDot,
                          {
                            opacity: typingAnim3.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0.3, 1],
                            }),
                            transform: [
                              {
                                scale: typingAnim3.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [0.8, 1.2],
                                }),
                              },
                            ],
                          },
                        ]}
                      />
                    </View>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Input */}
        <View style={styles.inputWrapper}>
          <View style={styles.inputContainer}>
            <TextInput
              ref={inputRef}
              style={[
                styles.input,
                inputMessage.trim() && styles.inputActive,
              ]}
              placeholder="Type your message..."
              placeholderTextColor={colors.g2}
              value={inputMessage}
              onChangeText={setInputMessage}
              multiline={true}
              textAlignVertical="top"
              onSubmitEditing={handleSend}
              returnKeyType="send"
              blurOnSubmit={false}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                inputMessage.trim() && styles.sendButtonActive,
                (isBotTyping || !inputMessage.trim()) &&
                  styles.sendButtonDisabled,
              ]}
              onPress={handleSend}
              disabled={isBotTyping || !inputMessage.trim()}
              activeOpacity={0.7}>
              {inputMessage.trim() ? (
                <Image
                  source={appIcons.send}
                  style={styles.sendIcon}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.sendIconPlaceholder} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      <AIConsentModal
        visible={showModal}
        onAccept={handleAccept}
        onDecline={handleDecline}
      />
    </SafeAreaView>
  );
};

export default ChatScreen;
