document.addEventListener('DOMContentLoaded', () => {
    const chatContainer = document.getElementById('chat-container');
    const textInput = document.getElementById('text-input');
    const sendBtn = document.getElementById('send-btn');
    const micBtn = document.getElementById('mic-btn');
    const statusOrb = document.getElementById('status-orb');

    // Speech Recognition Setup
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition = null;
    let isListening = false;

    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = function() {
            isListening = true;
            micBtn.classList.add('active');
            statusOrb.classList.add('listening');
            addMessage("Listening...", "system-msg", "listening-indicator");
        };

        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            removeMessage("listening-indicator");
            handleCommand(transcript);
        };

        recognition.onerror = function(event) {
            console.error("Speech recognition error", event.error);
            removeMessage("listening-indicator");
            addMessage("Microphone error: " + event.error, "system-msg");
            stopListening();
        };

        recognition.onend = function() {
            stopListening();
        };
    } else {
        micBtn.style.display = 'none';
        addMessage("Speech Recognition is not supported in this browser. Please use text input.", "system-msg");
    }

    function toggleListening() {
        if (!recognition) return;
        
        if (isListening) {
            recognition.stop();
        } else {
            recognition.start();
        }
    }

    function stopListening() {
        isListening = false;
        micBtn.classList.remove('active');
        statusOrb.classList.remove('listening');
        removeMessage("listening-indicator");
    }

    const ttsToggleBtn = document.getElementById('tts-toggle-btn');
    const ttsCancelBtn = document.getElementById('tts-cancel-btn');
    const pauseIcon = document.getElementById('pause-icon');
    const playIcon = document.getElementById('play-icon');
    
    let isSpeaking = false;
    let isPaused = false;

    // Speech Synthesis
    function speak(text) {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // Cancel any ongoing speech
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1.0;
            const voices = window.speechSynthesis.getVoices();
            
            // Try to find a female English voice (case-insensitive)
            const femaleNames = ['female', 'samantha', 'victoria', 'zira', 'karen', 'tessa', 'moira', 'amelia', 'susan'];
            let preferredVoice = voices.find(v => 
                v.lang.includes('en') && 
                femaleNames.some(name => v.name.toLowerCase().includes(name))
            );
            
            // Fallback to any Google English voice, then any English voice
            if (!preferredVoice) {
                preferredVoice = voices.find(v => v.lang.includes('en') && v.name.includes('Google')) || 
                                 voices.find(v => v.lang.includes('en'));
            }

            if(preferredVoice) {
                utterance.voice = preferredVoice;
            }
            
            utterance.onstart = () => {
                isSpeaking = true;
                isPaused = false;
                ttsToggleBtn.style.display = 'flex';
                ttsCancelBtn.style.display = 'flex';
                pauseIcon.style.display = 'block';
                playIcon.style.display = 'none';
                statusOrb.classList.add('listening');
            };
            
            utterance.onend = () => {
                isSpeaking = false;
                isPaused = false;
                ttsToggleBtn.style.display = 'none';
                ttsCancelBtn.style.display = 'none';
                statusOrb.classList.remove('listening');
            };
            
            utterance.onerror = () => {
                isSpeaking = false;
                isPaused = false;
                ttsToggleBtn.style.display = 'none';
                ttsCancelBtn.style.display = 'none';
                statusOrb.classList.remove('listening');
            };
            
            window.speechSynthesis.speak(utterance);
        }
    }

    ttsToggleBtn.addEventListener('click', () => {
        if ('speechSynthesis' in window) {
            if (isPaused) {
                window.speechSynthesis.resume();
                isPaused = false;
                pauseIcon.style.display = 'block';
                playIcon.style.display = 'none';
            } else if (isSpeaking) {
                window.speechSynthesis.pause();
                isPaused = true;
                pauseIcon.style.display = 'none';
                playIcon.style.display = 'block';
            }
        }
    });

    ttsCancelBtn.addEventListener('click', () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            // The onend or onerror event will automatically hide the buttons
        }
    });

    // UI Updates
    function addMessage(text, className, id = null) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${className}`;
        
        if (className === 'bot-msg') {
            msgDiv.innerHTML = marked.parse(text);
        } else {
            msgDiv.textContent = text;
        }

        if (id) msgDiv.id = id;
        
        chatContainer.appendChild(msgDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    function removeMessage(id) {
        const msg = document.getElementById(id);
        if (msg) msg.remove();
    }

    // Backend Communication
    async function handleCommand(commandText) {
        if (!commandText.trim()) return;
        
        addMessage(commandText, "user-msg");
        textInput.value = '';
        
        statusOrb.classList.add('thinking');
        
        try {
            const response = await fetch('/api/command', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ command: commandText })
            });
            
            const data = await response.json();
            
            statusOrb.classList.remove('thinking');
            
            if (data.response) {
                addMessage(data.response, "bot-msg");
                speak(data.response);
            }
            
            if (data.action && data.action.type === 'open_url') {
                setTimeout(() => {
                    window.open(data.action.url, '_blank');
                }, 1000); // Wait a second before opening so user can hear the response
            }
            
        } catch (error) {
            console.error("Error communicating with backend", error);
            statusOrb.classList.remove('thinking');
            addMessage("Sorry, I'm having trouble connecting to the server.", "system-msg");
        }
    }

    // Event Listeners
    sendBtn.addEventListener('click', () => {
        handleCommand(textInput.value);
    });

    textInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleCommand(textInput.value);
        }
    });

    micBtn.addEventListener('click', toggleListening);
});
