import {StyleSheet} from 'react-native';
import {colors, family, HP, size, WP} from '../../../utilities';

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  chatArea: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  chatScroll: {
    flexGrow: 1,
  },
  chatScrollContent: {
    paddingVertical: HP('2'),
    paddingHorizontal: WP('4'),
  },

  // Initial/Empty State
  initialContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: WP('8'),
    paddingVertical: HP('5'),
  },
  initialIconContainer: {
    marginBottom: HP('3'),
  },
  initialIconCircle: {
    width: WP('20'),
    height: WP('20'),
    borderRadius: WP('10'),
    backgroundColor: colors.p1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.p1,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  initialIcon: {
    width: WP('12'),
    height: WP('12'),
    tintColor: colors.white,
  },
  initialTitle: {
    fontSize: size.h3,
    fontFamily: family.inter_bold,
    color: colors.b1,
    marginBottom: HP('1'),
    textAlign: 'center',
  },
  initialSubtitle: {
    fontSize: size.normal,
    fontFamily: family.inter_regular,
    color: colors.g3,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: HP('3'),
  },
  suggestionChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: WP('2'),
  },
  chip: {
    backgroundColor: colors.white,
    paddingHorizontal: WP('4'),
    paddingVertical: HP('1'),
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.g4,
    marginHorizontal: WP('1'),
    marginVertical: HP('0.5'),
  },
  chipText: {
    fontSize: size.small,
    fontFamily: family.inter_medium,
    color: colors.p1,
  },

  // Date Separator
  dateSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: HP('2'),
    paddingHorizontal: WP('2'),
  },
  dateSeparatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.g4,
  },
  dateSeparatorText: {
    fontSize: size.xsmall,
    fontFamily: family.inter_medium,
    color: colors.g3,
    marginHorizontal: WP('2'),
    backgroundColor: '#F5F7FA',
    paddingHorizontal: WP('2'),
  },

  // Message Row
  messageRow: {
    flexDirection: 'row',
    marginVertical: HP('0.5'),
    paddingHorizontal: WP('2'),
    maxWidth: '100%',
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  botRow: {
    justifyContent: 'flex-start',
  },
  lastMessage: {
    marginBottom: HP('1'),
  },

  // Avatar Containers
  botAvatarContainer: {
    marginRight: WP('2'),
    justifyContent: 'flex-end',
    paddingBottom: HP('0.5'),
  },
  userAvatarContainer: {
    marginLeft: WP('2'),
    justifyContent: 'flex-end',
    paddingBottom: HP('0.5'),
  },
  botAvatar: {
    width: WP('10'),
    height: WP('10'),
    borderRadius: WP('5'),
    backgroundColor: colors.p1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userAvatar: {
    width: WP('10'),
    height: WP('10'),
    borderRadius: WP('5'),
    backgroundColor: colors.g4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  botAvatarImage: {
    width: WP('6'),
    height: WP('6'),
    tintColor: colors.white,
  },
  userAvatarImage: {
    width: WP('6'),
    height: WP('6'),
    tintColor: colors.b1,
  },

  // Message Bubble Container
  messageBubbleContainer: {
    maxWidth: '75%',
    flexDirection: 'column',
  },
  userBubbleContainer: {
    alignItems: 'flex-end',
  },

  // Sender Name
  senderName: {
    fontSize: size.xsmall,
    fontFamily: family.inter_medium,
    color: colors.g3,
    marginBottom: HP('0.3'),
    marginLeft: WP('1'),
  },

  // Message Bubble
  messageBubble: {
    paddingHorizontal: WP('4'),
    paddingVertical: HP('1.2'),
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: colors.p1,
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: colors.white,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.g4,
  },

  // Message Text
  userText: {
    fontSize: size.normal,
    color: colors.white,
    fontFamily: family.inter_regular,
    lineHeight: 20,
  },
  botText: {
    fontSize: size.normal,
    color: colors.b1,
    fontFamily: family.inter_regular,
    lineHeight: 20,
  },

  // Message Time
  messageTime: {
    fontSize: size.tiny,
    fontFamily: family.inter_regular,
    color: colors.g3,
    marginTop: HP('0.3'),
  },
  userMessageTime: {
    textAlign: 'right',
    marginRight: WP('1'),
  },
  botMessageTime: {
    textAlign: 'left',
    marginLeft: WP('1'),
  },

  // Typing Indicator
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: HP('0.5'),
    paddingHorizontal: WP('1'),
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.g3,
    marginHorizontal: 3,
  },

  // Input Wrapper
  inputWrapper: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.g4,
    paddingBottom: HP('1'),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: WP('4'),
    paddingTop: HP('1.5'),
    paddingBottom: HP('0.5'),
  },
  input: {
    flex: 1,
    minHeight: HP('5.5'),
    maxHeight: HP('12'),
    backgroundColor: '#F5F7FA',
    borderRadius: 24,
    paddingHorizontal: WP('4'),
    paddingTop: HP('1.5'),
    paddingBottom: HP('1.5'),
    fontSize: size.normal,
    fontFamily: family.inter_regular,
    borderWidth: 1,
    borderColor: colors.g4,
    marginRight: WP('2'),
    includeFontPadding: false,
    textAlignVertical: 'top',
    color: colors.b1,
  },
  inputActive: {
    borderColor: colors.p1,
    backgroundColor: colors.white,
  },
  sendButton: {
    width: HP('5.5'),
    height: HP('5.5'),
    borderRadius: HP('2.75'),
    backgroundColor: colors.g4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: HP('0.2'),
  },
  sendButtonActive: {
    backgroundColor: colors.p1,
    shadowColor: colors.p1,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendIcon: {
    width: WP('5'),
    height: WP('5'),
    tintColor: colors.white,
  },
  sendIconPlaceholder: {
    width: WP('3'),
    height: WP('3'),
    borderRadius: WP('1.5'),
    backgroundColor: colors.g3,
  },
});

export default styles;
