import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAlhFxoTRIna5_y32IN2QtJYavNpxdEAVU",
  authDomain: "chatter-69574.firebaseapp.com",
  projectId: "chatter-69574",
  storageBucket: "chatter-69574.firebasestorage.app",
  messagingSenderId: "948346489758",
  appId: "1:948346489758:web:8e9228f37e400f1499a48f",
  measurementId: "G-ZYK0MBK1DE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app); // Initialize Firestore here

function ChatApp({ username }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  // Effect to fetch messages
  useEffect(() => {
    const q = query(
      collection(db, 'messages'), 
      orderBy('timestamp')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedMessages = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(fetchedMessages);
    });

    return () => unsubscribe();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    await addDoc(collection(db, 'messages'), {
      text: newMessage,
      sender: username,
      timestamp: new Date()
    });

    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-gray-100">
      {/* Chat Header */}
      <div className="bg-blue-500 text-white p-4 text-center font-bold">
        Chat with {username}
      </div>

      {/* Messages Container */}
      <div className="flex-grow overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`flex ${message.sender === username ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[75%] px-4 py-2 rounded-xl ${message.sender === username ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}
            >
              {message.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={sendMessage} className="bg-white p-4 flex items-center border-t">
        <input 
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-grow p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button 
          type="submit"
          className="bg-blue-500 text-white p-2 rounded-r-lg hover:bg-blue-600 transition duration-300"
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default ChatApp;
