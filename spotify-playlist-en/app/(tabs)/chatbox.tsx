import React, { useState, useRef, useEffect } from 'react';

import { getData, postData, getSpotifyAuthCode } from './apiCaller';
import { spotifyConfig1 } from '@/constants/spotifyConfig';

type Message = {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  link?: string;
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

  const interpretMessage = async (userMessage: Message): Promise<Message[]> => {
    if (userMessage.text == "login") {
        const params = {
            'response_type': 'code',
            'client_id': spotifyConfig1.CLIENT_ID,
            'scope': spotifyConfig1.SCOPE,
            'redirect_uri': spotifyConfig1.REDIRECT_URI,
            'state': state
        };
        const urlParams = new URLSearchParams(params);
        const url = `http://127.0.0.1:5000/start_login`;
        const response = getSpotifyAuthCode()
        return Promise.resolve([])
    } else if (userMessage.text.includes("get") && userMessage.text.includes("playlist")) {
      try {
        let url = `http://127.0.0.1:5000/get_access_token`;
        const temp_token = await getData(url);
        console.log(temp_token);
        let payload = {
          "access_token": temp_token
        };
        let genre = 'pop';
        const messages = userMessage.text.trim().split(/\s+/);
        if (messages.length > 2) {
          genre = messages[messages.length-1];
        }

        url = `http://127.0.0.1:5000/PlaylistSuggest/${genre}`;
        const data = await postData(url, payload);
        console.log("postData response", data);

        let botMessage: Message[] = data?.message.map((track: any, idx: number) => 
        ({
          id: idx,
          text: track.song + " by " + track.artists.join(", "),
          link: `https://open.spotify.com/track/${track.id}`,
          sender: 'bot'
        }));
        console.log(botMessage, "in chatbox");
        return botMessage;
      } catch (error) {
        throw new Error(`GET failed: ${error}`);
      }
        
    } else {
      let botMessage: Message = {
        id: Date.now() + 1,
        text: 'Echo: ' + input,
        sender: 'bot',
      };
      return [botMessage]
    }
    
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

    let botMessage = [userMessage];
    return interpretMessage(userMessage).then(
      res => {
        botMessage=res;
        console.log("before timeout:", botMessage);
        setTimeout(() => {
          setMessages((prev) => [...prev, ...botMessage]);
        }, 500);
    });
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
            {msg.link && <p>(
                <a href={msg.link} target="_blank" rel="noopener noreferrer">
                  Open Spotify Playlist
                </a>
            )</p>}
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
