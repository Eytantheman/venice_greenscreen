const getRandomPosition = () => {
  const size = Math.random() * 50 + 50; // Random size between 50% and 100%
  // Adjust position range based on size to prevent overflow
  const maxPosition = 100 - size;
  const x = Math.random() * maxPosition;
  const y = Math.random() * maxPosition;
  return { x, y, size };
};'use client'
import React, { useState, useEffect, useRef } from 'react';

function ChatMessage({ author, content, isComplete, showContent }) {
const getAvatarColor = (name) => {
  return 'border-2 border-white bg-transparent';
};

return (
  <div className="flex items-start space-x-4">
    <div className={`w-12 h-12 rounded-full ${getAvatarColor(author)} flex items-center justify-center text-white font-bold text-xl drop-shadow-lg`}>
      {author[0]}
    </div>
    <div className="flex-1">
      <div className="text-white font-bold text-2xl font-paradise mb-2 drop-shadow-lg tracking-wide uppercase">{author}</div>
      {showContent && (
      <div className="rounded-lg p-6 mt-1">
        <p className="whitespace-pre-wrap text-white text-2xl font-paradise leading-relaxed drop-shadow-lg shadow-black">
          {content}
          {!isComplete && (
            <span className="inline-block w-1 h-6 ml-1 bg-white animate-pulse" />
          )}
        </p>
      </div>
      )}
      {!showContent && !isComplete && (
        <span className="inline-block w-1 h-6 ml-1 bg-white animate-pulse" />
      )}
    </div>
  </div>
);
}

function ChatInterface() {
const conversation = [
  {
    id: "Tafuri_1",
    author: "Tafuri",
    content: "This space feels caught in a paradox. On one hand, it tries to evoke permanence through its allusions to classical architecture. On the other, it's glaringly transient, a façade constructed for a fleeting moment, perhaps even a deliberate commentary on its own superficiality. I see no depth here—just the collapse of architectural meaning into a theater of surfaces. What troubles me is the absence of resistance, of ideology. Is this architecture merely reflecting the shallow tides of consumer culture?"
  },
  {
    id: "Denise_1",
    author: "Denise",
    content: "Tafuri, why does superficiality have to be an insult? This is architecture that understands the world it exists in—a collage of styles, materials, and references that reflects the multiplicity of modern urban life. The stage-like quality isn't a failure; it's an invitation. Look at how these elements coexist. It's a dialogue of forms and colors, a stage where many cultural voices can be heard. What's wrong with architecture embracing complexity instead of clinging to ideological purity?"
  },
  {
    id: "Piranesi_1",
    author: "Piranesi",
    content: "Complexity, yes—but to what end? These arches and geometries suggest grandeur but deliver none. They nod to antiquity, yet they lack its gravitas. In my visions, ruins hold weight; they whisper of time and endurance. But here, the forms are weightless, untethered from the past. Still, there is something intriguing in their playfulness, as if they acknowledge their own ephemerality. Perhaps this is a theater of ideas, not permanence."
  },
  {
    id: "Carlo_1",
    author: "Carlo",
    content: "The theater of ideas is exactly where architecture should be! Piranesi, permanence is no longer the goal. These spaces could evolve, adapt, and engage. Imagine if these walls were alive with sensors, capable of reacting to their environment, or if they allowed users to reshape them digitally. This isn't failure—it's opportunity. Tafuri, you talk of ideological meaning, but why must it be static? Architecture can reflect movement and dynamism, embracing the transient instead of fearing it."
  },
  {
    id: "Carlo_2",
    author: "Carlo",
    content: "What if this space isn't about meaning but experience? Its purpose could be defined by the people who inhabit it, not by its form."
  },
  {
    id: "Tafuri_2",
    author: "Tafuri",
    content: "Experience without depth, Carlo, becomes entertainment. Is that enough?"
  },
  {
    id: "Denise_2",
    author: "Denise",
    content: "Why not? Architecture can delight and provoke—it doesn't need to be tied to one narrative. This space invites interpretation."
  },
  {
    id: "Piranesi_2",
    author: "Piranesi",
    content: "Interpretation is fleeting. Where is the anchor, the sense of enduring purpose? Without it, the architecture floats away like a ghost of itself."
  }
];

const [messages, setMessages] = useState([]);
const [currentMessageIndex, setCurrentMessageIndex] = useState(-1);
const [currentText, setCurrentText] = useState('');
const [charIndex, setCharIndex] = useState(0);
const [audioDuration, setAudioDuration] = useState(null);
const [hasStarted, setHasStarted] = useState(false);
const [showContent, setShowContent] = useState(true);
const [showSecondImage, setShowSecondImage] = useState(false);

// First message image states
const [showDeniseImage, setShowDeniseImage] = useState(false);
const [showPiranesiImage, setShowPiranesiImage] = useState(false);
const [showCarloImage, setShowCarloImage] = useState(false);
const [deniseImagePosition, setDeniseImagePosition] = useState({ x: 0, y: 0 });
const [piranesiImagePosition, setPiranesiImagePosition] = useState({ x: 0, y: 0 });
const [carloImagePosition, setCarloImagePosition] = useState({ x: 0, y: 0 });

// Second message image states
const [showDenise2Image, setShowDenise2Image] = useState(false);
const [showPiranesi2Image, setShowPiranesi2Image] = useState(false);
const [showCarlo2Image, setShowCarlo2Image] = useState(false);
const [showTafuri2Image, setShowTafuri2Image] = useState(false);
const [denise2ImagePosition, setDenise2ImagePosition] = useState({ x: 0, y: 0 });
const [piranesi2ImagePosition, setPiranesi2ImagePosition] = useState({ x: 0, y: 0 });
const [carlo2ImagePosition, setCarlo2ImagePosition] = useState({ x: 0, y: 0 });
const [tafuri2ImagePosition, setTafuri2ImagePosition] = useState({ x: 0, y: 0 });

const chatContainerRef = useRef(null);
const timeoutRef = useRef(null);
const audioRef = useRef(null);

// Add keyframe animation for fade-in effect and ensure content fits viewport
useEffect(() => {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .content-container {
      height: 100vh;
      overflow: hidden;
    }

    .image-container img {
      max-height: 100vh;
      max-width: 100vw;
      object-fit: contain;
    }
  `;
  document.head.appendChild(style);
  return () => document.head.removeChild(style);
}, []);

// ... [conversation array stays the same] ...

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

useEffect(() => {
  if (currentMessageIndex >= conversation.length) return;
  if (currentMessageIndex === -1) return;

  const currentMessage = conversation[currentMessageIndex];
  
  // Show images when their respective messages start
  if (currentMessage.id === "Denise_1" && !showDeniseImage) {
    const position = getRandomPosition();
    setDeniseImagePosition({ ...position });
    setShowDeniseImage(true);
  }
  
  if (currentMessage.id === "Denise_2" && !showDenise2Image) {
    const position = getRandomPosition();
    setDenise2ImagePosition({ ...position });
    setShowDenise2Image(true);
  }
  
  if (currentMessage.id === "Piranesi_1" && !showPiranesiImage) {
    const position = getRandomPosition();
    setPiranesiImagePosition({ ...position });
    setShowPiranesiImage(true);
  }

  if (currentMessage.id === "Piranesi_2" && !showPiranesi2Image) {
    const position = getRandomPosition();
    setPiranesi2ImagePosition({ ...position });
    setShowPiranesi2Image(true);
  }

  if (currentMessage.id === "Carlo_1" && !showCarloImage) {
    const position = getRandomPosition();
    setCarloImagePosition({ ...position });
    setShowCarloImage(true);
  }

  if (currentMessage.id === "Carlo_2" && !showCarlo2Image) {
    const position = getRandomPosition();
    setCarlo2ImagePosition({ ...position });
    setShowCarlo2Image(true);
  }

  if (currentMessage.id === "Tafuri_2" && !showTafuri2Image) {
    const position = getRandomPosition();
    setTafuri2ImagePosition({ ...position });
    setShowTafuri2Image(true);
  }
  
  if (charIndex === 0) {
    playMessageSound(currentMessage.author, currentMessageIndex);
  }

  if (charIndex >= currentMessage.content.length) {
    if (currentMessage.id === "Piranesi_2") {
      timeoutRef.current = setTimeout(() => {
        setShowSecondImage(true);
        setCurrentMessageIndex(prev => prev + 1);
        setCharIndex(0);
        setCurrentText('');
        setAudioDuration(null);
      }, 3000);
    } else {
      timeoutRef.current = setTimeout(() => {
        setCurrentMessageIndex(prev => prev + 1);
        setCharIndex(0);
        setCurrentText('');
        setAudioDuration(null);
      }, 3000);
    }
    return;
  }

  let delay;
  const messageLength = currentMessage.content.length;

  if (audioDuration) {
    const baseDelay = audioDuration / messageLength;
    const randomFactor = 0.8 + Math.random() * 0.5;
    delay = baseDelay * randomFactor;
  } else {
    delay = 30 * (0.8 + Math.random() * 0.4);
  }

  timeoutRef.current = setTimeout(() => {
    setCurrentText(prev => prev + currentMessage.content[charIndex]);
    setCharIndex(prev => prev + 1);
  }, delay);

  return () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };
}, [currentMessageIndex, charIndex, conversation, audioDuration]);

const getCurrentMessage = () => {
  if (currentMessageIndex === -1 || currentMessageIndex >= conversation.length) return null;
  
  return {
    author: conversation[currentMessageIndex].author,
    content: currentText,
    isComplete: false
  };
};

return (
  <div className="relative h-screen bg-black overflow-hidden">
    <div className="absolute inset-0">
      <img 
        src="/archive/facades.jpg"
        alt="Venice timber piles historical photograph"
        className="w-full h-full object-contain opacity-90"
      />
      {showDeniseImage && (
        <div 
          style={{
            position: 'absolute',
            left: `${deniseImagePosition.x}%`,
            top: `${deniseImagePosition.y}%`,
            width: `${deniseImagePosition.size}%`,
            height: `${deniseImagePosition.size}%`,
            opacity: 0,
            animation: 'fadeIn 3s ease-in forwards'
          }}
          className="image-container"
        >
          <img
            src="/archive/facades_denise_1.jpg"
            alt="Denise's first image"
            className="w-full h-full object-contain"
          />
        </div>
      )}
      {showDenise2Image && (
        <div 
          style={{
            position: 'absolute',
            left: `${denise2ImagePosition.x}%`,
            top: `${denise2ImagePosition.y}%`,
            width: `${denise2ImagePosition.size}%`,
            height: `${denise2ImagePosition.size}%`,
            opacity: 0,
            animation: 'fadeIn 3s ease-in forwards'
          }}
          className="image-container"
        >
          <img
            src="/archive/facades_denise_2.jpg"
            alt="Denise's second image"
            className="w-full h-full object-contain"
          />
        </div>
      )}
      {showPiranesiImage && (
        <div 
          style={{
            position: 'absolute',
            left: `${piranesiImagePosition.x}%`,
            top: `${piranesiImagePosition.y}%`,
            width: `${piranesiImagePosition.size}%`,
            height: `${piranesiImagePosition.size}%`,
            opacity: 0,
            animation: 'fadeIn 3s ease-in forwards'
          }}
          className="image-container"
        >
          <img
            src="/archive/piranesi_1.jpg"
            alt="Piranesi's first image"
            className="w-full h-full object-contain"
          />
        </div>
      )}
      {showPiranesi2Image && (
        <div 
          style={{
            position: 'absolute',
            left: `${piranesi2ImagePosition.x}%`,
            top: `${piranesi2ImagePosition.y}%`,
            width: `${piranesi2ImagePosition.size}%`,
            height: `${piranesi2ImagePosition.size}%`,
            opacity: 0,
            animation: 'fadeIn 3s ease-in forwards'
          }}
          className="image-container"
        >
          <img
            src="/archive/piranesi_2.jpg"
            alt="Piranesi's second image"
            className="w-full h-full object-contain"
          />
        </div>
      )}
      {showCarloImage && (
        <div 
          style={{
            position: 'absolute',
            left: `${carloImagePosition.x}%`,
            top: `${carloImagePosition.y}%`,
            width: `${carloImagePosition.size}%`,
            height: `${carloImagePosition.size}%`,
            opacity: 0,
            animation: 'fadeIn 3s ease-in forwards'
          }}
          className="image-container"
        >
          <img
            src="/archive/carlo_1.jpg"
            alt="Carlo's first image"
            className="w-full h-full object-contain"
          />
        </div>
      )}
      {showCarlo2Image && (
        <div 
          style={{
            position: 'absolute',
            left: `${carlo2ImagePosition.x}%`,
            top: `${carlo2ImagePosition.y}%`,
            width: `${carlo2ImagePosition.size}%`,
            height: `${carlo2ImagePosition.size}%`,
            opacity: 0,
            animation: 'fadeIn 3s ease-in forwards'
          }}
          className="image-container"
        >
          <img
            src="/archive/carlo_2.jpg"
            alt="Carlo's second image"
            className="w-full h-full object-contain"
          />
        </div>
      )}
      {showTafuri2Image && (
        <div 
          style={{
            position: 'absolute',
            left: `${tafuri2ImagePosition.x}%`,
            top: `${tafuri2ImagePosition.y}%`,
            width: `${tafuri2ImagePosition.size}%`,
            height: `${tafuri2ImagePosition.size}%`,
            opacity: 0,
            animation: 'fadeIn 3s ease-in forwards'
          }}
          className="image-container"
        >
          <img
            src="/archive/tafuri_2.jpg"
            alt="Tafuri's second image"
            className="w-full h-full object-contain"
          />
        </div>
      )}
      {showSecondImage && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 image-container">
          <img
            src="/archive/facades2.jpg"
            alt="Second architectural image"
            className="w-full h-full object-contain"
          />
        </div>
      )}
    </div>
    {!hasStarted ? (
      <div className="absolute inset-0 flex items-center justify-center z-20">
        <button
          onClick={handleStart}
          className="px-8 py-4 bg-black bg-opacity-50 text-white rounded-lg text-2xl font-paradise hover:bg-opacity-70 transition-all"
        >
          Start Conversation
        </button>
      </div>
    ) : (
      <div 
        ref={chatContainerRef}
        className="absolute inset-0 flex items-center justify-center z-10"
      >
        <div className="max-w-4xl w-full px-12">
          <button
            onClick={() => setShowContent(!showContent)}
            className="fixed top-8 right-8 px-4 py-2 bg-black bg-opacity-50 text-white rounded-lg text-xl font-paradise hover:bg-opacity-70 transition-all z-20"
          >
            {showContent ? 'Hide Text' : 'Show Text'}
          </button>
          <button
            onClick={() => {
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
              }
              if (currentMessageIndex < conversation.length) {
                setCurrentMessageIndex(currentMessageIndex + 1);
                setCharIndex(0);
                setCurrentText('');
                setAudioDuration(null);
              }
            }}
            className="fixed top-20 right-8 px-4 py-2 bg-black bg-opacity-50 text-white rounded-lg text-xl font-paradise hover:bg-opacity-70 transition-all z-20"
          >
            SKIP
          </button>
          {getCurrentMessage() && (
            <div className="transform transition-opacity duration-500">
              <ChatMessage 
                author={getCurrentMessage().author}
                content={getCurrentMessage().content}
                isComplete={getCurrentMessage().isComplete}
                showContent={showContent}
              />
            </div>
          )}
        </div>
      </div>
    )}
  </div>
);
}

export default ChatInterface;