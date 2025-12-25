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
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Header} from '../../../components';
import {colors, appIcons} from '../../../utilities';
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
  const scrollViewRef = useRef(null);

  const [inputMessage, setInputMessage] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);

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

  const handleSend = () => {
    const text = inputMessage.trim();
    if (!text) return;

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
    const time = new Date(message.created_at || Date.now()).toLocaleTimeString(
      [],
      {
        hour: '2-digit',
        minute: '2-digit',
      },
    );

    return (
      <View
        key={message.id ?? index}
        style={[styles.messageRow, isUser ? styles.userRow : styles.botRow]}>
        {/* ICON + META */}
        <View style={isUser ? styles.userMeta : styles.botMeta}>
          <View
            style={isUser ? styles.userIconContainer : styles.botIconContainer}>
            <Image
              source={isUser ? appIcons.User : appIcons.robo}
              style={isUser ? styles.userIconImage : styles.botIconImage}
              resizeMode="contain"
            />
          </View>
          <View style={styles.metaTextContainer}>
            <Text style={styles.senderText}>{isUser ? 'Me' : 'MedBot'}</Text>
            <Text style={styles.timeTextMeta}>{time}</Text>
          </View>
        </View>

        {/* MESSAGE BUBBLE */}
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.botBubble,
          ]}>
          <Text style={isUser ? styles.userText : styles.botText}>{text}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <Header title="Chat with SugaBuddy" onPress={() => navigation.goBack()} />

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.chatArea}>
          <ScrollView
            style={styles.chatScroll}
            contentContainerStyle={styles.chatScrollContent}
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false}>
            {messages.length > 0 ? (
              messages.map(renderMessage)
            ) : (
              <View style={styles.initialContainer}>
                <Text style={styles.initialHeyText}>
                  Hey, What can I help with?
                </Text>
              </View>
            )}

            {/* Bot typing */}
            {isBotTyping && (
              <View style={[styles.messageRow, styles.botRow]}>
                <View style={styles.botMeta}>
                  <View style={styles.botIconContainer}>
                    <Image
                      source={appIcons.robo}
                      style={styles.botIconImage}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={styles.metaTextContainer}>
                    <Text style={styles.senderText}>MedBot</Text>
                    <Text style={styles.timeTextMeta}>
                      {new Date().toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                </View>
                <View style={[styles.messageBubble, styles.botBubble]}>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <ActivityIndicator size="small" color={colors.white} />
                    <Text style={[styles.botText, {marginLeft: 8}]}>
                      Thinking...
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Please ask related to blood sugar..."
            placeholderTextColor={colors.g2}
            value={inputMessage}
            onChangeText={setInputMessage}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSend}
            disabled={isBotTyping}>
            <Image
              source={appIcons.send}
              style={styles.sendIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;
