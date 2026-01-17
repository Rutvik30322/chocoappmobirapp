import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Lottie from 'lottie-react-native';
import ThemedLayout from '../components/ThemedLayout';

const ChatbotScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const { colors, theme } = useTheme();
  const [messages, setMessages] = useState([
    { id: '1', text: 'Hello! How can I help you with chocolates today?', sender: 'bot' },
  ]);
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (inputText.trim() === '') return;
    
    // Add user message
    const newUserMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setInputText('');
    
    // Simulate bot response after a delay
    setTimeout(() => {
      const botResponse = {
        id: (Date.now() + 1).toString(),
        text: `I received your message: "${inputText}". I'm a demo chatbot for chocolate recommendations!`,
        sender: 'bot',
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
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
        <Text style={[styles.headerTitleText, { color: colors.text }]}>Chocolate Assistant</Text>
        <View style={styles.headerSpacer} />
      </View>
      <View style={styles.header}>
        <Lottie
          source={require('../assets/hello animation.json')}
          autoPlay
          loop
          style={styles.animation}
        />
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>24/7 Support</Text>
      </View>
      
      <ScrollView style={styles.messagesContainer}>
        {messages.map((message) => (
          <View 
            key={message.id} 
            style={[
              styles.messageBubble, 
              message.sender === 'user' 
                ? [styles.userMessage, { backgroundColor: colors.primary }] 
                : [styles.botMessage, { backgroundColor: colors.surface }]
            ]}
          >
            <Text style={{ color: message.sender === 'user' ? colors.onPrimary : colors.text }}>
              {message.text}
            </Text>
          </View>
        ))}
      </ScrollView>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.textInput, { 
            backgroundColor: colors.surface, 
            color: colors.text,
            borderColor: colors.textSecondary
          }]}
          placeholder="Ask about chocolates..."
          placeholderTextColor={colors.textSecondary}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity 
          style={[styles.sendButton, { backgroundColor: colors.primary }]} 
          onPress={handleSend}
        >
          <Text style={[styles.sendButtonText, { color: colors.onPrimary }]}>Send</Text>
        </TouchableOpacity>
      </View>
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
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: '#FFF8F0', // Light cream background for the header
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerTitleText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSpacer: {
    width: 40,
  },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  animation: {
    width: 120, // Increased size
    height: 120, // Increased size
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 22, // Increased size
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 16, // Increased size
    color: '#888',
  },
  messagesContainer: {
    flex: 1,
    padding: 15,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    marginVertical: 5,
    borderRadius: 15,
  },
  userMessage: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 5,
  },
  botMessage: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginRight: 10,
    fontSize: 16,
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
