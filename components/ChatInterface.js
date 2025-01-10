'use client'
import React, { useState, useEffect, useRef } from 'react';

function ChatMessage({ author, content, isComplete }) {
  const getAvatarColor = (name) => {
    const colors = {
      'Tafuri': 'bg-blue-500',
      'Denis': 'bg-green-500', 
      'Piranesi': 'bg-purple-500'
    };
    return colors[name] || 'bg-gray-500';
  };

  return (
    <div className="flex items-start space-x-3 mb-6">
      <div className={`w-10 h-10 rounded-full ${getAvatarColor(author)} flex items-center justify-center text-white font-bold text-lg`}>
        {author[0]}
      </div>
      <div className="flex-1">
        <div className="text-gray-300 font-semibold text-lg font-helvetica mb-1">{author}</div>
        <div className="bg-gray-800 rounded-lg p-4 mt-1">
          <p className="whitespace-pre-wrap text-gray-100 text-lg font-helvetica leading-relaxed">
            {content}
            {!isComplete && (
              <span className="inline-block w-1 h-5 ml-1 bg-gray-300 animate-pulse" />
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(-1);
  const [currentText, setCurrentText] = useState('');
  const [charIndex, setCharIndex] = useState(0);
  const [audioDuration, setAudioDuration] = useState(null);
  const [hasStarted, setHasStarted] = useState(false);
  const chatContainerRef = useRef(null);
  const timeoutRef = useRef(null);
  const audioRef = useRef(null);

  const conversation = [
    {
      id: "Tafuri_1",
      author: "Tafuri",
      content: "This image lays bare the infrastructure of myth. These timber piles are the unspoken truth of Venice, a city celebrated for its beauty while concealing the labor and pragmatism that sustain it. What fascinates me is their dialectical nature—they embody both triumph and vulnerability. Their very existence is a reminder of the impossibility of separating architecture from the economic and social realities that produced it. Yet, is this act of constructing stability on unstable ground not an expression of hubris, a prelude to ruin? What happens when the labor required to sustain this vision becomes too much to bear?"
    },
    {
      id: "Denis_1",
      author: "Denis",
      content: "Tafuri, must you always frame such ingenuity in terms of ruin? To me, this image is a celebration of architecture's capacity to adapt. The timber piles do not defy nature—they collaborate with it. Submerged in water, they transform a limitation into a strength, resisting decay through the very conditions that threaten them. This is resilience, not hubris. Look at the harmony here: human ingenuity working hand-in-hand with the environment. And yet, I wonder, does this harmony point to a larger truth about architecture—one where fragility and strength are not opposites but partners in survival?"
    },
    {
      id: "Piranesi_1", 
      author: "Piranesi",
      content: "Resilience, harmony—such contemporary indulgences! I see in these piles a battle, a visceral struggle against the forces of nature, much like the monumental endeavors of my beloved Rome. But where Rome asserted permanence in stone, Venice dares to build its foundations on timber, on a material destined to decay. Is this not a kind of paradoxical heroism? These piles, fragile as they are, hold up a city that claims eternity. And yet, Denis, does their very fragility not heighten their triumph? Is it not the fleetingness of this endeavor that makes it sublime? Tell me, what stories will these timber piles inspire in a thousand years, when the city they hold may be no more?"
    },
    {
      id: "Tafuri_2",
      author: "Tafuri", 
      content: "Piranesi, you revel in the drama of decay, but let us not ignore the systems of power at play here. These piles do not simply support a city—they support an ideology, a vision of Venice as a miraculous exception to the natural order. This act of foundation is as political as it is architectural. It asserts control over nature, a statement that Venice is not merely a city, but an empire. Yet, can we separate the aesthetic glory of this vision from the exploitation and labor that underpin it? Or are we, too, complicit in romanticizing its fragility?"
    },
    {
      id: "Denis_2",
      author: "Denis",
      content: "Perhaps we are complicit, Tafuri, but is that not the role of architecture—to provoke, to inspire, even to deceive? These piles are not just foundations; they are metaphors, symbols of a city that thrives on reinvention. Venice survives not despite its fragility, but because of it. What other city could transform such precariousness into a spectacle? And yet, I am left wondering: if architecture thrives on reinvention, what reinventions might these piles still witness? What futures could emerge from such ancient roots?"  
    },
    {
      id: "Piranesi_2",
      author: "Piranesi",
      content: "Ancient roots, yes—roots sunk deep in water, the most capricious of elements. But Denis, does this spectacle not also contain a warning? The Romans built for eternity, and even their ruins inspire awe. Venice builds for the moment, and while it dazzles, it also trembles. These piles—mute, submerged, forgotten—are they not the true architecture of the city? And so I ask: does the glory of Venice lie in its surfaces, or in these hidden, decaying foundations? What will endure, and what will vanish beneath the waves?"
    }
  ];

  const handleStart = () => {
    setHasStarted(true);
    setCurrentMessageIndex(0);
  };

  const playMessageSound = async (author, messageIndex) => {
    const currentMessage = conversation[messageIndex];
    if (!currentMessage.id) return;

    const soundFile = `/audio/${currentMessage.id}.mp3`;
    console.log('Attempting to play:', soundFile);

    try {
      const audio = new Audio(soundFile);
      audioRef.current = audio;

      audio.addEventListener('loadstart', () => console.log('Audio loading started'));
      audio.addEventListener('loadeddata', () => console.log('Audio data loaded'));
      audio.addEventListener('canplay', () => console.log('Audio can play'));
      audio.addEventListener('error', (e) => console.error('Audio error:', e));
      audio.addEventListener('play', () => console.log('Audio playback started'));
      
      audio.addEventListener('loadedmetadata', () => {
        const duration = audio.duration * 1000;
        console.log('Audio duration:', duration, 'ms');
        setAudioDuration(duration);
      });

      audio.volume = 0.5;
      await audio.play();
      console.log('Audio playing successfully');
    } catch (error) {
      console.error('Audio playback failed:', error);
    }
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      const scrollContainer = chatContainerRef.current;
      const scrollHeight = scrollContainer.scrollHeight;
      const height = scrollContainer.clientHeight;
      const maxScrollTop = scrollHeight - height;
      scrollContainer.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
    }
  };

  useEffect(() => {
    if (currentMessageIndex >= conversation.length) return;
    if (currentMessageIndex === -1) return;

    const currentMessage = conversation[currentMessageIndex];
    
    if (charIndex === 0) {
      playMessageSound(currentMessage.author, currentMessageIndex);
    }

    if (charIndex >= currentMessage.content.length) {
      timeoutRef.current = setTimeout(() => {
        setCurrentMessageIndex(prev => prev + 1);
        setCharIndex(0);
        setCurrentText('');
        setAudioDuration(null);
      }, 3000);
      return;
    }

    // TYPING SPEED ADJUSTMENT SECTION
    let delay;
    const messageLength = currentMessage.content.length;

    if (audioDuration) {
      // Calculate the base delay to match typing duration with audio duration
      const baseDelay = audioDuration / messageLength;

      // Add slight randomality to the delay (between 0.8 and 1.2 times the base delay)
      const randomFactor = 0.8 + Math.random() * 0.5;
      delay = baseDelay * randomFactor;
    } else {
      // Default typing speed if no audio (with slight randomality)
      delay = 30 * (0.8 + Math.random() * 0.4);
    }

    timeoutRef.current = setTimeout(() => {
      setCurrentText(prev => prev + currentMessage.content[charIndex]);
      setCharIndex(prev => prev + 1);
      scrollToBottom();
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentMessageIndex, charIndex, conversation, audioDuration]);

  const getCurrentMessages = () => {
    if (currentMessageIndex === -1) return [];
    
    const completeMessages = conversation.slice(0, currentMessageIndex).map(msg => ({
      ...msg,
      isComplete: true
    }));

    if (currentMessageIndex < conversation.length) {
      return [
        ...completeMessages,
        {
          author: conversation[currentMessageIndex].author,
          content: currentText,
          isComplete: false
        }
      ];
    }

    return completeMessages;
  };

  return (
    <div className="flex h-screen bg-black">
      <div className="w-1/2 bg-black relative">
        <img 
          src="/Venice-timber-piles.png"
          alt="Venice timber piles historical photograph"
          className="absolute inset-0 w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        {!hasStarted && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={handleStart}
              className="px-8 py-4 bg-gray-800 text-white rounded-lg text-xl hover:bg-gray-700 transition-colors font-helvetica"
            >
              Start Conversation
            </button>
          </div>
        )}
      </div>
      <div 
        ref={chatContainerRef}
        className="w-1/2 bg-black p-8 overflow-y-auto scroll-smooth"
      >
        <div className="max-w-2xl mx-auto">
          {getCurrentMessages().map((msg, idx) => (
            <ChatMessage 
              key={idx}
              author={msg.author}
              content={msg.content}
              isComplete={msg.isComplete}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ChatInterface;