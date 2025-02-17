'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../styles/fonts.css';

function ChatMessage({ author, content, isComplete, showContent }) {
  return (
    <div className="flex items-start space-x-4">
      <div className="w-12 h-12 rounded-full border-2 border-white bg-transparent flex items-center justify-center text-white font-bold text-xl drop-shadow-lg">
        {author[0]}
      </div>
      <div className="flex-1">
        <div className="text-white font-black text-2xl font-lorenzo-sans mb-2 drop-shadow-lg tracking-wide uppercase">{author}</div>
        {showContent && (
          <div className="rounded-lg p-4 mt-1">
            <p className="whitespace-pre-wrap text-white text-lg font-lorenzo-sans leading-relaxed drop-shadow-lg shadow-black">
              {content}
              {!isComplete && (
                <span className="inline-block w-1 h-5 ml-1 bg-white animate-pulse" />
              )}
            </p>
          </div>
        )}
        {!showContent && !isComplete && (
          <span className="inline-block w-1 h-5 ml-1 bg-white animate-pulse" />
        )}
      </div>
    </div>
  );
}

function ChatInterface({ loopDelay = 5000 }) {
  const [conversation, setConversation] = useState([]);
  const [error, setError] = useState(null);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(-1);
  const [currentText, setCurrentText] = useState('');
  const [charIndex, setCharIndex] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [showContent, setShowContent] = useState(true);
  const [showGenerating, setShowGenerating] = useState(false);
  const [showProcessing, setShowProcessing] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);
  const [isAudioLoaded, setIsAudioLoaded] = useState(false);
  
  const timeoutRef = useRef(null);
  const audioRef = useRef(null);
  const typingStartTimeRef = useRef(null);

  // Function to load audio and get its duration
  const loadAudioForMessage = useCallback((messageIndex) => {
    return new Promise((resolve, reject) => {
      const audioNumber = messageIndex.toString().padStart(3, '0');
      const audioPath = `/audio/${audioNumber}.mp3`;
      const audio = new Audio(audioPath);
      
      audio.addEventListener('loadedmetadata', () => {
        setAudioDuration(audio.duration);
        setIsAudioLoaded(true);
        resolve(audio);
      });
      
      audio.addEventListener('error', (e) => {
        reject(new Error(`Error loading audio: ${e.message}`));
      });
    });
  }, []);

  // Function to start typing with proper timing
  const startTypingWithAudio = useCallback((audio) => {
    typingStartTimeRef.current = Date.now();
    audio.play();
    setCharIndex(0);
    setCurrentText('');
  }, []);

  useEffect(() => {
    fetch('/api/conversation')
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => {
        const lines = data.content.split('\n');
        const parsedConversation = [];
        let currentEntry = {};
        let messageCount = 1;

        lines.forEach(line => {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith('[')) {
            if (currentEntry.id) {
              parsedConversation.push(currentEntry);
            }
            const author = trimmedLine.slice(1, -1);
            currentEntry = {
              id: `${messageCount.toString().padStart(3, '0')}_${author}`,
            };
            messageCount++;
          } else if (trimmedLine && !currentEntry.author) {
            currentEntry.author = trimmedLine;
          } else if (trimmedLine && currentEntry.author) {
            if (!currentEntry.content) {
              currentEntry.content = trimmedLine;
            } else {
              currentEntry.content += ' ' + trimmedLine;
            }
          }
        });

        if (currentEntry.id) {
          parsedConversation.push(currentEntry);
        }

        setConversation(parsedConversation);
      })
      .catch(error => {
        console.error('Error loading conversation:', error);
        setError(error.message);
      });
  }, []);

  const handleStart = useCallback(async () => {
    setHasStarted(true);
    setIsAudioLoaded(false);
    
    try {
      const firstAudio = await loadAudioForMessage(0);
      audioRef.current = firstAudio;
      // Wait briefly to ensure audio duration is set
      setTimeout(() => {
        startTypingWithAudio(firstAudio);
        setCurrentMessageIndex(0);
      }, 100);
    } catch (error) {
      console.error('Error loading first audio:', error);
      setCurrentMessageIndex(0);
    }
  }, [loadAudioForMessage, startTypingWithAudio]);

  // Effect for typing and audio synchronization
  useEffect(() => {
    if (!isAudioLoaded || currentMessageIndex === -1 || !audioDuration) return;

    const currentMessage = conversation[currentMessageIndex];
    if (!currentMessage) return;

    // Handle message completion
    if (charIndex >= currentMessage.content.length) {
      setShowGenerating(true);
      const imageDelay = Math.random() * 3000 + 2000;
      timeoutRef.current = setTimeout(() => {
        setShowProcessing(true);
        setShowGenerating(false);
        const responseDelay = Math.random() * 2000 + 1000;
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.pause();
          }
          setIsAudioLoaded(false);
          setCurrentMessageIndex(prev => prev + 1);
          loadAudioForMessage(currentMessageIndex + 1)
            .then(nextAudio => {
              audioRef.current = nextAudio;
              startTypingWithAudio(nextAudio);
            });
          setShowGenerating(false);
          setShowProcessing(false);
        }, responseDelay);
      }, imageDelay);
      return;
    }

    // Calculate exact timing for each character
    const messageLength = currentMessage.content.length;
    
    // Distribute characters evenly across audio duration
    const interval = (audioDuration * 1000) / messageLength;
    
    timeoutRef.current = setTimeout(() => {
      const elapsedTime = (Date.now() - typingStartTimeRef.current) / 1000;
      const shouldBeAtChar = Math.floor((elapsedTime / audioDuration) * messageLength);
      
      // Catch up if we're behind
      if (shouldBeAtChar > charIndex) {
        setCurrentText(currentMessage.content.slice(0, shouldBeAtChar));
        setCharIndex(shouldBeAtChar);
      } else {
        // Normal typing
        setCurrentText(prev => prev + currentMessage.content[charIndex]);
        setCharIndex(prev => prev + 1);
      }
    }, interval);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentMessageIndex, charIndex, conversation, audioDuration, isAudioLoaded, loadAudioForMessage, startTypingWithAudio]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const getCurrentMessage = useCallback(() => {
    if (currentMessageIndex === -1 || currentMessageIndex >= conversation.length) return null;
    return {
      author: conversation[currentMessageIndex].author,
      content: currentText,
      isComplete: false
    };
  }, [currentMessageIndex, currentText, conversation]);

  if (error) {
    return <div className="text-white">Error loading conversation: {error}</div>;
  }

  return (
    <div className="relative h-screen bg-[#00ff00] overflow-hidden">
      {!hasStarted ? (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <button
            onClick={handleStart}
            className="px-8 py-4 bg-black bg-opacity-50 text-white rounded-lg text-2xl font-lorenzo-sans hover:bg-opacity-70 transition-all"
          >
            Start
          </button>
        </div>
      ) : (
        <div className="absolute inset-0 flex items-start justify-start z-10 pt-12">
          <div className="max-w-2xl w-full pl-12">
            {getCurrentMessage() && (
              <div className="transform transition-opacity duration-500">
                <ChatMessage 
                  author={getCurrentMessage().author}
                  content={getCurrentMessage().content}
                  isComplete={getCurrentMessage().isComplete}
                  showContent={showContent}
                />
                {showGenerating && (
                  <div className="mt-6 flex items-center space-x-2">
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                    <span className="text-white text-lg font-lorenzo-sans">generating next iteration...</span>
                  </div>
                )}
                {showProcessing && (
                  <div className="mt-6 flex items-center space-x-2">
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                    <span className="text-white text-lg font-lorenzo-sans">processing response...</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatInterface;