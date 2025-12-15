import {StyleSheet} from 'react-native';
import {colors, family, HP, size, WP} from '../../../utilities';

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  chatArea: {
    flex: 1,
    paddingHorizontal: WP('4'),
  },
  chatScroll: {
    flexGrow: 1,
  },
  chatScrollContent: {
    paddingVertical: HP('2'),
  },

  initialContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialHeyText: {
    fontSize: size.h4,
    fontFamily: family.inter_bold,
    color: colors.b1,
    marginBottom: HP('2'),
  },

  messageRow: {
    marginVertical: HP('1'),
    flexDirection: 'column',
    maxWidth: '100%',
  },
  userRow: {
    alignItems: 'flex-end',
  },
  botRow: {
    alignItems: 'flex-start',
  },

  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: HP('0.5'),
    justifyContent: 'flex-end',
    width: '100%',
    paddingRight: 10,
  },
  botMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: HP('0.5'),
    justifyContent: 'flex-start',
    width: '100%',
    paddingLeft: 10,
  },
  metaTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  senderText: {
    fontSize: size.xsmall,
    fontFamily: family.inter_bold,
    color: colors.b1,
    marginRight: 5,
  },
  timeTextMeta: {
    fontSize: size.xsmall,
    fontFamily: family.inter_regular,
    color: colors.g3,
  },

  userIconContainer: {
    width: WP(6),
    height: WP(6),
    borderRadius: WP(3),
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
    padding: WP(3),
  },
  botIconContainer: {
    width: WP(6),
    height: WP(6),
    borderRadius: WP(3),
    backgroundColor: colors.p1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
    padding: WP(3),
  },
  userIconImage: {
    width: WP(5),
    height: WP(5),
    tintColor: colors.b1,
  },
  botIconImage: {
    width: WP(5),
    height: WP(5),
    tintColor: colors.white,
  },

  messageBubble: {
    paddingHorizontal: WP('4'),
    paddingVertical: HP('1.5'),
    maxWidth: '90%',

    borderRadius: 12,
  },
  userBubble: {
    backgroundColor: colors.p1,
    borderBottomRightRadius: 4,
    borderWidth: 1,
    borderColor: colors.g1,
  },
  botBubble: {
    backgroundColor: colors.white,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.g1,
  },

  userText: {
    fontSize: size.small,
    color: colors.white,
    fontFamily: family.inter_regular,
  },
  botText: {
    fontSize: size.small,
    color: colors.b1,
    fontFamily: family.inter_regular,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: WP('4'),
    paddingVertical: HP('1'),
    borderTopWidth: 1,
    borderTopColor: colors.g1,
    backgroundColor: colors.white,
  },
  input: {
    flex: 1,
    minHeight: HP('6'),
    maxHeight: HP('12'),
    backgroundColor: colors.white,
    borderRadius: 30,
    paddingHorizontal: WP('5'),
    fontSize: size.small,
    fontFamily: family.inter_regular,
    borderWidth: 1,
    borderColor: colors.g1,
    marginRight: WP('2'),
  },
  sendButton: {
    width: WP('10'),
    height: WP('10'),
    borderRadius: WP('5'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendIcon: {
    width: WP('7'),
    height: WP('7'),
  },
});

export default styles;
