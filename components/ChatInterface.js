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

  const timeoutRef = useRef(null);

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

  const handleStart = useCallback(() => {
    setHasStarted(true);
    setCurrentMessageIndex(0);
  }, []);

  useEffect(() => {
    if (currentMessageIndex >= conversation.length) {
      setTimeout(() => {
        setCurrentMessageIndex(-1);
        setCharIndex(0);
        setCurrentText('');
        setHasStarted(false);
        setShowGenerating(false);
        setShowProcessing(false);
      }, loopDelay);
      return;
    }

    if (currentMessageIndex === -1) return;

    const currentMessage = conversation[currentMessageIndex];
    
    if (charIndex >= currentMessage.content.length) {
      setShowGenerating(true);
      const imageDelay = Math.random() * 3000 + 2000; // Random between 2-5 seconds
      timeoutRef.current = setTimeout(() => {
        setShowProcessing(true);
        setShowGenerating(false);
        const responseDelay = Math.random() * 2000 + 1000; // Random between 1-3 seconds
        setTimeout(() => {
          setCurrentMessageIndex(prev => prev + 1);
          setCharIndex(0);
          setCurrentText('');
          setShowGenerating(false);
          setShowProcessing(false);
        }, responseDelay);
      }, imageDelay);
      return;
    }

    let delay;
    const baseDelay = 30;
    const random = Math.random();
    
    if (random < 0.1) {
      delay = baseDelay * 5;
    } else if (random < 0.3) {
      delay = baseDelay * (1.5 + Math.random());
    } else {
      delay = baseDelay * (0.8 + Math.random() * 0.4);
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
  }, [currentMessageIndex, charIndex, conversation, loopDelay]);

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
                    <span className="text-white text-lg font-lorenzo-sans">generating new image...</span>
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