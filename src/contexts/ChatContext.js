import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { format, subDays, subHours, subMinutes } from 'date-fns';

const ChatContext = createContext();

// Chat reducer for state management
const chatReducer = (state, action) => {
  switch (action.type) {
    case 'SET_ACTIVE_CHAT':
      return {
        ...state,
        activeChat: action.payload,
        messages: state.conversations[action.payload]?.messages || []
      };

    case 'SEND_MESSAGE':
      const { chatId, message } = action.payload;
      const newMessage = {
        id: Date.now(),
        text: message,
        sender: 'me',
        timestamp: new Date(),
        avatar: '/static/images/avatars/1.jpg',
        name: 'Catherine Pike'
      };

      const updatedConversations = {
        ...state.conversations,
        [chatId]: {
          ...state.conversations[chatId],
          messages: [...(state.conversations[chatId]?.messages || []), newMessage],
          lastMessage: message,
          lastMessageTime: new Date(),
          unreadCount: 0
        }
      };

      return {
        ...state,
        conversations: updatedConversations,
        messages: state.activeChat === chatId ? updatedConversations[chatId].messages : state.messages
      };

    case 'MARK_AS_READ':
      return {
        ...state,
        conversations: {
          ...state.conversations,
          [action.payload]: {
            ...state.conversations[action.payload],
            unreadCount: 0
          }
        }
      };

    case 'LOAD_CONVERSATIONS':
      return {
        ...state,
        conversations: action.payload
      };

    case 'UPDATE_TYPING_STATUS':
      return {
        ...state,
        typingUsers: {
          ...state.typingUsers,
          [action.payload.chatId]: action.payload.isTyping
        }
      };

    default:
      return state;
  }
};

// Initial state with sample conversations
const initialState = {
  activeChat: 'chat1',
  conversations: {
    chat1: {
      id: 'chat1',
      name: 'Zain Baptista',
      avatar: '/static/images/avatars/1.jpg',
      lastMessage: 'Hey there, how are you today? Is it ok if I call you?',
      lastMessageTime: subMinutes(new Date(), 6),
      unreadCount: 2,
      isOnline: true,
      messages: [
        {
          id: 1,
          text: 'Hi. Can you send me the missing invoices asap?',
          sender: 'other',
          timestamp: subHours(new Date(), 115),
          avatar: '/static/images/avatars/1.jpg',
          name: 'Zain Baptista'
        },
        {
          id: 2,
          text: 'Yes, I\'ll email them right now. I\'ll let you know once the remaining invoices are done.',
          sender: 'me',
          timestamp: subHours(new Date(), 125),
          avatar: '/static/images/avatars/1.jpg',
          name: 'Catherine Pike'
        },
        {
          id: 3,
          text: 'Hey! Are you there?',
          sender: 'me',
          timestamp: subHours(new Date(), 60),
          avatar: '/static/images/avatars/1.jpg',
          name: 'Catherine Pike'
        },
        {
          id: 4,
          text: 'Heeeelloooo????',
          sender: 'me',
          timestamp: subHours(new Date(), 60),
          avatar: '/static/images/avatars/1.jpg',
          name: 'Catherine Pike'
        },
        {
          id: 5,
          text: 'Hey there!',
          sender: 'other',
          timestamp: subMinutes(new Date(), 6),
          avatar: '/static/images/avatars/1.jpg',
          name: 'Zain Baptista'
        },
        {
          id: 6,
          text: 'How are you? Is it ok if I call you?',
          sender: 'other',
          timestamp: subMinutes(new Date(), 6),
          avatar: '/static/images/avatars/1.jpg',
          name: 'Zain Baptista'
        }
      ]
    },
    chat2: {
      id: 'chat2',
      name: 'Kierra Herwitz',
      avatar: '/static/images/avatars/2.jpg',
      lastMessage: 'Hi! Did you manage to send me those documents',
      lastMessageTime: subHours(new Date(), 2),
      unreadCount: 0,
      isOnline: false,
      messages: [
        {
          id: 1,
          text: 'Hi! Did you manage to send me those documents?',
          sender: 'other',
          timestamp: subHours(new Date(), 2),
          avatar: '/static/images/avatars/2.jpg',
          name: 'Kierra Herwitz'
        }
      ]
    },
    chat3: {
      id: 'chat3',
      name: 'Craig Vaccaro',
      avatar: '/static/images/avatars/3.jpg',
      lastMessage: 'Ola, I still haven\'t received the program schedule',
      lastMessageTime: subHours(new Date(), 5),
      unreadCount: 0,
      isOnline: true,
      messages: [
        {
          id: 1,
          text: 'Ola, I still haven\'t received the program schedule',
          sender: 'other',
          timestamp: subHours(new Date(), 5),
          avatar: '/static/images/avatars/3.jpg',
          name: 'Craig Vaccaro'
        }
      ]
    },
    chat4: {
      id: 'chat4',
      name: 'Adison Press',
      avatar: '/static/images/avatars/4.jpg',
      lastMessage: 'I recently did some buying on Amazon and now I\'m stuck',
      lastMessageTime: subHours(new Date(), 8),
      unreadCount: 8,
      isOnline: false,
      messages: [
        {
          id: 1,
          text: 'I recently did some buying on Amazon and now I\'m stuck',
          sender: 'other',
          timestamp: subHours(new Date(), 8),
          avatar: '/static/images/avatars/4.jpg',
          name: 'Adison Press'
        }
      ]
    }
  },
  messages: [],
  typingUsers: {},
  currentUser: {
    name: 'Catherine Pike',
    avatar: '/static/images/avatars/1.jpg'
  }
};

export const ChatProvider = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  // Load initial active chat messages
  useEffect(() => {
    if (state.activeChat && state.conversations[state.activeChat]) {
      dispatch({
        type: 'SET_ACTIVE_CHAT',
        payload: state.activeChat
      });
    }
  }, []);

  // Save to localStorage whenever conversations change
  useEffect(() => {
    localStorage.setItem('chatConversations', JSON.stringify(state.conversations));
  }, [state.conversations]);

  const setActiveChat = (chatId) => {
    dispatch({ type: 'SET_ACTIVE_CHAT', payload: chatId });
    dispatch({ type: 'MARK_AS_READ', payload: chatId });
  };

  const sendMessage = (message) => {
    if (message.trim() && state.activeChat) {
      dispatch({
        type: 'SEND_MESSAGE',
        payload: {
          chatId: state.activeChat,
          message: message.trim()
        }
      });
    }
  };

  const markAsRead = (chatId) => {
    dispatch({ type: 'MARK_AS_READ', payload: chatId });
  };

  const updateTypingStatus = (chatId, isTyping) => {
    dispatch({
      type: 'UPDATE_TYPING_STATUS',
      payload: { chatId, isTyping }
    });
  };

  const getFilteredConversations = (filter) => {
    const conversations = Object.values(state.conversations);
    
    switch (filter) {
      case 'unread':
        return conversations.filter(conv => conv.unreadCount > 0);
      case 'archived':
        return conversations.filter(conv => conv.archived);
      case 'all':
      default:
        return conversations.filter(conv => !conv.archived);
    }
  };

  const getTotalUnreadCount = () => {
    return Object.values(state.conversations).reduce((total, conv) => total + conv.unreadCount, 0);
  };

  const getActiveConversation = () => {
    return state.conversations[state.activeChat];
  };

  const value = {
    ...state,
    setActiveChat,
    sendMessage,
    markAsRead,
    updateTypingStatus,
    getFilteredConversations,
    getTotalUnreadCount,
    getActiveConversation
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export default ChatContext;