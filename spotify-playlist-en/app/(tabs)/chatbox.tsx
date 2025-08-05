// import React, { useState } from 'react';
// import {
//     DesktopOutlined,
//     FileOutlined,
//     PieChartOutlined,
//     TeamOutlined,
//     UserOutlined,
//   } from '@ant-design/icons';
// import type { MenuProps } from 'antd';
// import { Breadcrumb, Layout, Menu, theme } from 'antd';

// interface Message {
//     text: string,
//     sender: string
// }

// type MenuItem = Required<MenuProps>['items'][number];

// function getItem(
//   label: React.ReactNode,
//   key: React.Key,
//   icon?: React.ReactNode,
//   children?: MenuItem[],
// ): MenuItem {
//   return {
//     key,
//     icon,
//     children,
//     label,
//   } as MenuItem;
// };

// const items: MenuItem[] = [
//     getItem('User', 'sub1', <UserOutlined />, [
//         getItem('Tom', '1'),
//     ]),
//     getItem('Team', 'sub2', <TeamOutlined />, [getItem('Team 1', '6')]),
//     getItem('Files', '9', <FileOutlined />),
// ];

// export default function Chatbox() {
//     const [message, setMessage] = useState<Message[]>([])
//     const [newMessage, setNewMessage] = useState('');

//     const handleSendMessage = () => {
//         if (newMessage.trim() !== '') {
//         setMessage([...message, { text: newMessage, sender: 'You' }]);
//         setNewMessage('');
//         }
//     };
//     return (
//         <div className="chatbox-container">
//             <div className="message-list">
//                 {message.map((message, index) => (
//                     <div key={index} className="message">
//                     <strong>{message.sender}:</strong> {message.text}
//                   </div>
//                 ))}
//             </div>
//             <div className="input-area">
//                 <input
//                 type="text"
//                 value={newMessage}
//                 onChange={(e) => setNewMessage(e.target.value)}
//                 placeholder="Type your message..."
//                 />
//                 <button onClick={handleSendMessage}>Send</button>
//             </div>
//         </div>
//     );
// }

import React, { useState, useRef, useEffect } from 'react';

import { getData } from './apiCaller';
import { spotifyConfig1 } from '@/constants/spotifyConfig';

type Message = {
  id: number;
  text: string;
  sender: 'user' | 'bot';
};

const ChatBox: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const endOfMessagesRef = useRef<HTMLDivElement | null>(null);
  const state = 'some-state-value';

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const interpretMessage = (userMessage: Message): Message => {
    const botMessage: Message = {
        id: Date.now() + 1,
        text: 'Echo: ' + input,
        sender: 'bot',
    };
    if (userMessage.text == "login") {
        const params = {
            'response_type': 'code',
            'client_id': spotifyConfig1.CLIENT_ID,
            'scope': spotifyConfig1.SCOPE,
            'redirect_uri': spotifyConfig1.REDIRECT_URI,
            'state': state
        }
        const urlParams = new URLSearchParams(params);
        const url = `${spotifyConfig1.AUTH_CODE_URL}${urlParams.toString()}`;
        const response = getData(url)
    }
    return botMessage
  };

  const sendMessage = () => {
    if (input.trim() === '') return;

    const userMessage: Message = {
      id: Date.now(),
      text: input,
      sender: 'user',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    const botMessage = interpretMessage(userMessage);

    

    setTimeout(() => {
      setMessages((prev) => [...prev, botMessage]);
    }, 500);
  };

  return (
    <div style={styles.container}>
      <div style={styles.chatWindow}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              ...styles.message,
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              backgroundColor: msg.sender === 'user' ? '#DCF8C6' : '#FFF',
            }}
          >
            {msg.text}
          </div>
        ))}
        <div ref={endOfMessagesRef} />
      </div>
      <div style={styles.inputArea}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          style={styles.input}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage} style={styles.button}>Send</button>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    width: '100%',
    maxWidth: 500,
    margin: '0 auto',
    fontFamily: 'Arial, sans-serif',
  },
  chatWindow: {
    height: 400,
    overflowY: 'auto',
    border: '1px solid #ccc',
    padding: 10,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    backgroundColor: '#f9f9f9',
  },
  message: {
    padding: '8px 12px',
    borderRadius: 16,
    maxWidth: '80%',
    wordBreak: 'break-word',
  },
  inputArea: {
    display: 'flex',
    marginTop: 10,
  },
  input: {
    flexGrow: 1,
    padding: 10,
    borderRadius: 8,
    border: '1px solid #ccc',
    outline: 'none',
  },
  button: {
    marginLeft: 8,
    padding: '10px 16px',
    borderRadius: 8,
    border: 'none',
    backgroundColor: '#007bff',
    color: 'white',
    cursor: 'pointer',
  },
};

export default ChatBox;
