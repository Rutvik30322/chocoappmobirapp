import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Lottie from 'lottie-react-native';
import ThemedLayout from '../components/ThemedLayout';
import Logo from '../components/Logo';
import chatbotService from '../services/chatbotService';
import Toast from 'react-native-toast-message';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

const ChatbotScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const { colors, theme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Hello! I\'m your chocolate shopping assistant. How can I help you today?', sender: 'bot' },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Auto-scroll to bottom when new message arrives
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  // Handle keyboard show/hide
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleSend = async () => {
    if (inputText.trim() === '' || loading) return;
    
    const userMessage = inputText.trim();
    
    // Add user message
    const newUserMessage: Message = {
      id: Date.now().toString(),
      text: userMessage,
      sender: 'user',
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setInputText('');
    setLoading(true);
    
    try {
      // Build conversation history for context
      const conversationHistory = messages
        .filter(msg => msg.id !== '1') // Exclude initial greeting
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.text,
        }));

      // Get AI response
      const botResponseText = await chatbotService.sendMessage(userMessage, conversationHistory);
      
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponseText,
        sender: 'bot',
      };
      
      setMessages(prev => [...prev, botResponse]);
    } catch (error: any) {
      console.error('Chatbot error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to get response. Please try again.',
        visibilityTime: 2000,
      });
      
      // Add error message
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again or contact support.',
        sender: 'bot',
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedLayout edges={['top']}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>  
      {/* Header with back button */}
      <View style={[styles.headerContainer, { backgroundColor: colors.surface }]}>  
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation?.goBack()}
        >
          <Text style={[styles.backButtonText, { color: colors.text }]}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Logo size={30} style={styles.headerLogo} />
          <Lottie
            source={require('../assets/hello animation.json')}
            autoPlay
            loop
            style={styles.animation}
          />
          <Text style={[styles.headerTitleText, { color: colors.text }]}>Chocolate Assistant</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        style={styles.keyboardAvoidingView}
      >
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
          contentContainerStyle={[
            styles.messagesContent,
            { paddingBottom: keyboardVisible ? 10 : 20 }
          ]}
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }}
      >
        {messages.map((message) => (
          <View 
            key={message.id} 
            style={[
              styles.messageBubble, 
              message.sender === 'user' 
                ? [styles.userMessage, { backgroundColor: colors.primary }] 
                : [styles.botMessage, { backgroundColor: colors.surface, borderColor: colors.textSecondary }]
            ]}
          >
            <Text style={[styles.messageText, { color: message.sender === 'user' ? colors.onPrimary : colors.text }]}>
              {message.text}
            </Text>
          </View>
        ))}
        {loading && (
          <View style={[styles.botMessage, { backgroundColor: colors.surface, borderColor: colors.textSecondary }]}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        )}
      </ScrollView>
      
        <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderTopColor: colors.textSecondary }]}>
          <TextInput
            style={[styles.textInput, { 
              backgroundColor: colors.background, 
              color: colors.text,
              borderColor: colors.textSecondary
            }]}
            placeholder="Ask about products, orders, payments..."
            placeholderTextColor={colors.textSecondary}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSend}
            multiline
            maxLength={500}
            editable={!loading}
            onFocus={() => {
              setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
              }, 100);
            }}
          />
          <TouchableOpacity 
            style={[styles.sendButton, { backgroundColor: colors.primary }]} 
            onPress={handleSend}
            disabled={loading || inputText.trim() === ''}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.onPrimary} />
            ) : (
              <Text style={[styles.sendButtonText, { color: colors.onPrimary }]}>Send</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      </View>
    </ThemedLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  headerLogo: {
    marginRight: 4,
  },
  headerTitleText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerSpacer: {
    width: 40,
  },
  animation: {
    width: 40,
    height: 40,
  },
  headerTitle: {
    fontSize: 22, // Increased size
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 16, // Increased size
    color: '#888',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 15,
    paddingBottom: 100, // Extra padding so messages aren't hidden by input
    flexGrow: 1,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    marginVertical: 5,
    borderRadius: 15,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userMessage: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 5,
  },
  botMessage: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 5,
    borderWidth: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 15,
    paddingBottom: 90, // Extra padding for bottom navigation bar
    alignItems: 'center',
    borderTopWidth: 1,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginRight: 10,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  sendButtonText: {
    fontWeight: 'bold',
  },
});

export default ChatbotScreen;
