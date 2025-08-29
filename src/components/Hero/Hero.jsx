import React, { useState, useEffect, useRef } from 'react';
import './Hero.css';
import LanguageDropdown from '../LanguageDropdown/LanguageDropdown';
import { useLanguage } from '../../hooks/useLanguage';
import { GoogleGenerativeAI } from '@google/generative-ai';

const Hero = () => {
  const { t } = useLanguage();
  const [question, setQuestion] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [visibleWords, setVisibleWords] = useState(0);
  const words = t('heroSubtitle');
  
  // Document upload and analysis states
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisSuccess, setAnalysisSuccess] = useState(false);
  const [analysisCompleted, setAnalysisCompleted] = useState(false);
  const [analysisReport, setAnalysisReport] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const fileInputRef = useRef(null);
  const reportSectionRef = useRef(null);
  
  // Voice control states
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Chat functionality states
  const [chatMessages, setChatMessages] = useState([]);
  const [isAsking, setIsAsking] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [activeTab, setActiveTab] = useState('report');
  const [isIntegratingPOV, setIsIntegratingPOV] = useState(false); // 'report' or 'chat'
  
  // Voice input states
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [voiceSupported, setVoiceSupported] = useState(false);
  
  // IoT Health Monitoring states
  const [iotData, setIotData] = useState({
    heartRate: '',
    bloodPressure: { systolic: '', diastolic: '' },
    temperature: '',
    oxygenLevel: '',
    weight: '',
    steps: ''
  });
  const [iotDevices, setIotDevices] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [iotReport] = useState(null);
  const [showIotReport, setShowIotReport] = useState(false);
  const [inputMode, setInputMode] = useState('manual'); // 'manual' or 'iot'
  const [showFuturePerkModal, setShowFuturePerkModal] = useState(false);
  
  // Initialize Gemini AI with API key rotation logic
  const getActiveAPIKey = async () => {
    try {
      // Try primary key first
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models', {
        headers: { 'x-goog-api-key': import.meta.env.VITE_GOOGLE_AI_API_KEY }
      });
      if (response.ok) return import.meta.env.VITE_GOOGLE_AI_API_KEY;
    } catch {
      // If primary fails, use secondary key
      return import.meta.env.VITE_GOOGLE_AI_API_KEY_2;
    }
  };
  
  const [genAI, setGenAI] = useState(null);

  useEffect(() => {
    const initializeGenAI = async () => {
      const activeKey = await getActiveAPIKey();
      setGenAI(new GoogleGenerativeAI(activeKey));
    };
    initializeGenAI();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisibleWords(prev => {
        if (prev < words.length) {
          return prev + 1;
        }
        clearInterval(timer);
        return prev;
      });
    }, 600); // 600ms delay between each word

    return () => clearInterval(timer);
  }, [words.length]);

  // Initialize voice recognition on component mount
  useEffect(() => {
    initializeVoiceRecognition();
  }, []);

  const handleQuestionChange = (e) => {
    setQuestion(e.target.value);
    setIsTyping(e.target.value.length > 0);
  };

  const handleDocumentUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type (accept common document formats)
      const allowedTypes = ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
      if (allowedTypes.includes(file.type)) {
        setUploadedFile(file);
        setAnalysisReport(null);
        setShowReport(false);
        setAnalysisSuccess(false);
        setAnalysisCompleted(false);
      } else {
        alert('Please upload a valid document file (PDF, DOC, DOCX, TXT, JPG, PNG)');
      }
    }
  };

  const handleAnalyzeDocument = async () => {
    if (!uploadedFile) {
      alert('Please upload a document first');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      let fileContent = '';
      
      // Handle different file types
      if (uploadedFile.type === 'text/plain') {
        fileContent = await uploadedFile.text();
      } else if (uploadedFile.type.startsWith('image/')) {
        // For images, convert to base64 and analyze
        const base64Data = await convertToBase64(uploadedFile);
        const imagePart = {
          inlineData: {
            data: base64Data.split(',')[1],
            mimeType: uploadedFile.type
          }
        };
        
        const prompt = "Analyze this medical document or image. Provide a comprehensive health analysis report including: 1) Document type identification, 2) Key medical findings, 3) Health recommendations, 4) Risk factors identified, 5) Suggested follow-up actions. Format the response in a clear, professional medical report style.";
        
        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        
        setAnalysisReport({
          content: response.text(),
          fileName: uploadedFile.name,
          fileType: uploadedFile.type,
          analysisDate: new Date().toLocaleString()
        });
        
        setIsAnalyzing(false);
        setAnalysisSuccess(true);
        setAnalysisCompleted(true);
        
        // Show success message for 2 seconds, then transition to report
        setTimeout(() => {
          setAnalysisSuccess(false);
          setShowReport(true);
          setActiveTab('report'); // Ensure report tab is active
          
          // Smooth scroll to report section after showing the report
          setTimeout(() => {
            if (reportSectionRef.current) {
              reportSectionRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
              });
            }
          }, 100);
        }, 2000);
         return;
      } else {
        // For other file types, read as text (basic implementation)
        fileContent = await uploadedFile.text();
      }
      
      const prompt = `Analyze this medical document content and provide a comprehensive health analysis report. Document content: "${fileContent}". Please provide: 1) Document type identification, 2) Key medical findings, 3) Health recommendations, 4) Risk factors identified, 5) Suggested follow-up actions. Format the response in a clear, professional medical report style.`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      setAnalysisReport({
        content: response.text(),
        fileName: uploadedFile.name,
        fileType: uploadedFile.type,
        analysisDate: new Date().toLocaleString()
      });
      

      
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Error analyzing document. Please try again.');
      setIsAnalyzing(false);
      return;
    }
    
    // Success handling for text documents
    setIsAnalyzing(false);
    setAnalysisSuccess(true);
    setAnalysisCompleted(true);
    
    // Show success message for 2 seconds, then transition to report
    setTimeout(() => {
      setAnalysisSuccess(false);
      setShowReport(true);
      setActiveTab('report'); // Ensure report tab is active
      
      // Smooth scroll to report section after showing the report
      setTimeout(() => {
        if (reportSectionRef.current) {
          reportSectionRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 100);
    }, 2000);
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handleCloseReport = () => {
    setShowReport(false);
    setAnalysisCompleted(false);
    setAnalysisReport(null);
    setUploadedFile(null);
    setActiveTab('chat');
  };

  const handleCopyReport = () => {
    if (analysisReport) {
      navigator.clipboard.writeText(analysisReport.content);
      alert('Report copied to clipboard!');
    }
  };

  const handleDownloadReport = () => {
    if (analysisReport) {
      const element = document.createElement('a');
      const file = new Blob([analysisReport.content], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `health-analysis-${analysisReport.fileName}-${Date.now()}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  const handleVoiceReport = () => {
    if (!('speechSynthesis' in window)) {
      alert('Voice synthesis not supported in this browser');
      return;
    }

    if (isPlaying) {
      // Pause/Stop the speech
      speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      // Start/Resume the speech
      if (analysisReport) {
        const utterance = new SpeechSynthesisUtterance(analysisReport.content);
        utterance.rate = 0.8;
        utterance.pitch = 1;
        
        utterance.onstart = () => {
          setIsPlaying(true);
        };
        
        utterance.onend = () => {
          setIsPlaying(false);
        };
        
        utterance.onerror = () => {
          setIsPlaying(false);
        };
        speechSynthesis.speak(utterance);
      }
    }
  };

  // Function to process markdown-like content and remove asterisks
  const processReportContent = (content) => {
    if (!content) return [];
    
    return content.split('\n').map((paragraph, index) => {
      // Remove asterisks and process bold text
      let processedText = paragraph.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      processedText = processedText.replace(/\*([^*]+)\*/g, '$1');
      processedText = processedText.replace(/\*{4,}/g, ''); // Remove multiple asterisks
      
      return {
        id: index,
        content: processedText,
        hasHtml: processedText.includes('<strong>')
      };
    }).filter(item => item.content.trim() !== '');
  };

  const handleCloseChat = () => {
    // Add closing animation class
    const chatSection = document.querySelector('.chat-section');
    if (chatSection) {
      chatSection.classList.add('closing');
    }
    
    // Delay the state changes to allow animation to complete
    setTimeout(() => {
      setChatMessages([]);
      setShowChat(false);
      setQuestion('');
      setActiveTab('report');
      
      // Remove closing class after hiding
      if (chatSection) {
        chatSection.classList.remove('closing');
      }
    }, 500); // Match the CSS transition duration
  };

  // Function to parse markdown formatting
  const parseMarkdown = (text) => {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  };

  // Voice recognition functions
  const initializeVoiceRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onstart = () => {
        setIsRecording(true);
      };
      
      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuestion(transcript);
        setIsRecording(false);
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };
      
      recognitionInstance.onend = () => {
        setIsRecording(false);
      };
      
      setRecognition(recognitionInstance);
      setVoiceSupported(true);
    } else {
      setVoiceSupported(false);
    }
  };

  const startVoiceRecording = () => {
    if (recognition && !isRecording) {
      recognition.start();
    }
  };

  const stopVoiceRecording = () => {
    if (recognition && isRecording) {
      recognition.stop();
    }
  };

  // Function to integrate user question directly into the report
  const integrateQuestionIntoReport = async (userQuestion) => {
    console.log('🔍 Integration called with:', {
      hasReport: !!analysisReport,
      question: userQuestion,
      reportLength: analysisReport?.content?.length || 0
    });
    
    if (!analysisReport || !userQuestion.trim()) {
      console.log('❌ Integration skipped - missing report or question');
      return;
    }
    
    setIsIntegratingPOV(true);
    
    try {
      console.log('🚀 Starting API call to integrate question...');
      const genAI = new GoogleGenerativeAI('AIzaSyDkzjwwX-tHU595-8UdVVGtgGevykYwo9c');
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `Please update this medical report by incorporating the user's question/concern. Add a new section or update existing sections to address their specific question while maintaining the professional medical report format.

Original Report:
${analysisReport.content}

User's Question/Concern:
${userQuestion}

Please provide the updated report that addresses the user's question within the medical context.`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      const updatedContent = response.text();
      
      console.log('📝 Report update:', {
        originalLength: analysisReport.content.length,
        newLength: updatedContent.length,
        timestamp: new Date().toLocaleTimeString()
      });
      
      setAnalysisReport({
        ...analysisReport,
        content: updatedContent
      });
      
      console.log('✅ Successfully integrated user question into report');
      
      // Force a re-render by updating a dummy state
      setTimeout(() => {
        console.log('🔄 Forcing UI update...');
        setActiveTab('report'); // Switch to report tab to show the update
      }, 100);
      
    } catch (error) {
       console.error('❌ POV integration error:', error);
     } finally {
       setIsIntegratingPOV(false);
     }
   };

  const handleAskQuestion = async () => {
    if (!question.trim()) return;
    
    setIsAsking(true);
    setShowChat(true);
    setActiveTab('chat');
    
    // Store the current question for integration
    const currentQuestion = question;
    
    // Integrate question into report IMMEDIATELY if report exists
    if (analysisReport) {
      console.log('🔄 Integrating question into report:', currentQuestion);
      await integrateQuestionIntoReport(currentQuestion);
    }
    
    // Add user message to chat
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: currentQuestion,
      timestamp: new Date().toLocaleTimeString()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const healthPrompt = `You are a professional health assistant. Please provide helpful, accurate health information for the following question. Always remind users to consult healthcare professionals for serious concerns. Keep responses informative but not overly technical. Question: ${currentQuestion}`;
      
      const result = await model.generateContent(healthPrompt);
      const response = await result.response;
      const aiResponse = response.text();
      
      // Add AI response to chat
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: aiResponse,
        timestamp: new Date().toLocaleTimeString()
      };
      
      setChatMessages(prev => [...prev, aiMessage]);
      
      // Scroll to chat section after response
      setTimeout(() => {
        const chatSection = document.querySelector('.chat-section');
        if (chatSection) {
          chatSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
      
    } catch (error) {
      console.error('Error asking question:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: 'I apologize, but I\'m having trouble processing your question right now. Please try again later.',
        timestamp: new Date().toLocaleTimeString()
      };
      
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAsking(false);
      setQuestion(''); // Clear input after sending message
    }
  };

  // IoT Helper Functions
  const handleIotDataChange = (field, value) => {
    if (field === 'bloodPressure') {
      setIotData(prev => ({
        ...prev,
        bloodPressure: { ...prev.bloodPressure, ...value }
      }));
    } else {
      setIotData(prev => ({ ...prev, [field]: value }));
    }
  };

  const simulateIotScan = async () => {
    setIsScanning(true);
    
    // Simulate scanning for devices
    setTimeout(() => {
      const mockDevices = [
        { id: 1, name: 'Heart Rate Monitor', type: 'heartRate', connected: false },
        { id: 2, name: 'Blood Pressure Cuff', type: 'bloodPressure', connected: false },
        { id: 3, name: 'Smart Thermometer', type: 'temperature', connected: false },
        { id: 4, name: 'Pulse Oximeter', type: 'oxygenLevel', connected: false },
        { id: 5, name: 'Smart Scale', type: 'weight', connected: false },
        { id: 6, name: 'Fitness Tracker', type: 'steps', connected: false }
      ];
      setIotDevices(mockDevices);
      setIsScanning(false);
    }, 3000);
  };

  const connectIotDevice = (deviceId) => {
    setIotDevices(prev => prev.map(device => 
      device.id === deviceId 
        ? { ...device, connected: !device.connected }
        : device
    ));
    

  };



  return (
    <>
    <section className="hero">
      {/* Background Elements */}
      <div className="hero-background">
        <div className="medical-animations">
          {/* Medical Icons */}
          <div className="medical-icon stethoscope-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 2a2 2 0 0 0-2 2v6.5a0.5 0.5 0 0 1-1 0V4a3 3 0 0 1 6 0v6.5a0.5 0.5 0 0 1-1 0V4a2 2 0 0 0-2-2Z"/>
              <path d="M16 10.5a0.5 0.5 0 1 1 0 1 0.5 0.5 0 0 1 0-1Z"/>
              <path d="M20 10a2 2 0 0 0-2-2h-1a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-1Z"/>
              <path d="M11 15.5a0.5 0.5 0 1 1 0 1 0.5 0.5 0 0 1 0-1Z"/>
              <path d="M4 15a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-1Z"/>
            </svg>
          </div>
          
          <div className="medical-icon heartbeat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          
          <div className="medical-icon dna-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 15c6.667-6 13.333 0 20-6"/>
              <path d="M9 22c1.798-1.998 2.518-3.995 2.807-5.993"/>
              <path d="M15 2c-1.798 1.998-2.518 3.995-2.807 5.993"/>
              <path d="M17 6.1c.64.7 1.358 1.4 2.2 2.1"/>
              <path d="M2.3 14.1c1.5-1.7 6.9 3.8 5.4-2.1"/>
            </svg>
          </div>
          
          <div className="medical-icon cross-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v20M2 12h20"/>
            </svg>
          </div>
          
          <div className="medical-icon pill-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.5 20.5 21 10a3.5 3.5 0 0 0-5-5l-10.5 10.5a3.5 3.5 0 1 0 5 5Z"/>
              <path d="M8.5 8.5 15 15"/>
            </svg>
          </div>
          
          {/* Molecular Structure */}
          <div className="molecular-structure">
            <div className="molecule-center"></div>
            <div className="electron-orbit orbit-1">
              <div className="electron"></div>
            </div>
            <div className="electron-orbit orbit-2">
              <div className="electron"></div>
            </div>
            <div className="electron-orbit orbit-3">
              <div className="electron"></div>
            </div>
          </div>
          
          {/* Heartbeat Wave */}
          <div className="heartbeat-wave">
            <div className="wave-line"></div>
          </div>
        </div>
        <div className="gradient-overlay"></div>
      </div>

      <div className="hero-container">
        {/* Language Dropdown */}
        <div className="hero-controls">
          <LanguageDropdown />
        </div>

        {/* Main Content */}
        <div className="hero-content">
          <div className="hero-text fade-in">
            <h1 className="hero-title">
              <span className="title-main gradient-text">{t('heroTitle')}</span>
              <span className="title-subtitle">
                {words.map((word, index) => (
                  <span 
                    key={index} 
                    className={`word ${index < visibleWords ? 'visible' : ''}`}
                    style={{ animationDelay: `${index * 0.6}s` }}
                  >
                    {word}
                    {index < words.length - 1 && ' '}
                  </span>
                ))}
              </span>
            </h1>
            <p className="hero-description slide-in-up" style={{animationDelay: '0.2s'}}>
              Upload medical documents, ask health questions, and receive personalized insights to make informed decisions about your wellness journey.
            </p>
          </div>

          {/* Document Section */}
          <div className="hero-actions slide-in-up">
            <div className="document-section card glass-effect">
              <h3 className="section-title gradient-text">{t('aiHealthAnalysis')}</h3>
              <p className="section-description">{t('uploadDescription')}</p>
              
              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                style={{ display: 'none' }}
              />
              
              <div className="document-buttons">
                <button 
                  className="btn btn-upload btn-modern btn-primary btn-gradient floating-animation"
                  onClick={handleDocumentUpload}
                >
                  <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7,10 12,15 17,10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  <span className="btn-text">{t('uploadMedicalRecords')}</span>
                  <div className="btn-shine"></div>
                </button>
                <button 
                  className={`btn btn-analyze btn-modern btn-outline floating-animation ${analysisCompleted ? 'completed' : ''}`}
                  onClick={handleAnalyzeDocument}
                  style={{animationDelay: '0.2s'}}
                  disabled={!uploadedFile || isAnalyzing || analysisCompleted}
                >
                  <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {analysisCompleted ? (
                      <>
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22,4 12,14.01 9,11.01"/>
                      </>
                    ) : (
                      <>
                        <circle cx="11" cy="11" r="8"/>
                        <path d="M21 21l-4.35-4.35"/>
                        <circle cx="11" cy="11" r="3"/>
                      </>
                    )}
                  </svg>
                  <span className="btn-text">
                    {analysisCompleted ? t('analysisCompleted') : (isAnalyzing ? t('analyzing') : t('analyzeHealthData'))}
                  </span>
                  <div className="btn-shine"></div>
                </button>
              </div>
              
              {/* Uploaded File Display */}
              {uploadedFile && (
                <div className="uploaded-file-info slide-in-up">
                  <div className="file-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14,2 14,8 20,8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                      <polyline points="10,9 9,9 8,9"/>
                    </svg>
                  </div>
                  <div className="file-details">
                    <span className="file-name">{uploadedFile.name}</span>
                    <span className="file-size">{(uploadedFile.size / 1024).toFixed(1)} KB</span>
                  </div>
                </div>
              )}
              
              {/* Analysis Animation */}
              {isAnalyzing && (
                <div className="analysis-animation">
                  <div className="medical-scanner">
                    <div className="scanner-line"></div>
                    <div className="dna-helix">
                      <div className="helix-strand strand-1"></div>
                      <div className="helix-strand strand-2"></div>
                    </div>
                    <div className="pulse-circles">
                      <div className="pulse-circle circle-1"></div>
                      <div className="pulse-circle circle-2"></div>
                      <div className="pulse-circle circle-3"></div>
                    </div>
                  </div>
                  <p className="analysis-text">{t('analyzingDocument')}</p>
                </div>
              )}
              
              {/* Success Animation - Same location as analysis */}
              {analysisSuccess && (
                <div className="analysis-animation">
                  <div className="success-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22,4 12,14.01 9,11.01"/>
                    </svg>
                  </div>
                  <p className="analysis-text success-message">{t('analysisSuccessful')}</p>
                </div>
              )}
            </div>

            {/* Question Section */}
            <div className="question-section card glass-effect slide-in-up" style={{animationDelay: '0.3s'}}>
              <h3 className="section-title gradient-text">{t('intelligentAssistant')}</h3>
              <p className="section-description">{t('instantAnswers')}</p>
              <div className="question-input-container">
                <div className={`input-wrapper glow-effect floating-animation ${isTyping ? 'typing' : ''}`}>
                  <input
                    type="text"
                    className="question-input"
                    placeholder={isRecording ? t('listening') : t('askHealthQuestion')}
                    value={question}
                    onChange={handleQuestionChange}
                    onKeyPress={(e) => e.key === 'Enter' && !isAsking && question.trim() && handleAskQuestion()}
                  />
                  <div className="input-border"></div>
                  <div className="input-glow"></div>
                </div>
                <div className="button-group">
                  {voiceSupported && (
                    <button 
                      className={`btn btn-voice-hero btn-modern btn-secondary btn-gradient floating-animation ${isRecording ? 'recording' : ''}`}
                      onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                      disabled={isAsking}
                      title={isRecording ? "Stop recording" : "Start voice input"}
                    >
                      <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        {isRecording ? (
                          <rect x="6" y="6" width="12" height="12" rx="2"/>
                        ) : (
                          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                        )}
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                        <line x1="12" y1="19" x2="12" y2="23"/>
                        <line x1="8" y1="23" x2="16" y2="23"/>
                      </svg>
                      <div className="btn-shine"></div>
                    </button>
                  )}
                  <button 
                    className="btn btn-ask btn-modern btn-accent btn-gradient floating-animation"
                  onClick={handleAskQuestion}
                  disabled={!question.trim() || isAsking}
                  style={{animationDelay: '0.4s'}}
                >
                  <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                  </svg>
                  <span className="btn-text">{isAsking ? t('asking') : t('askHealthWellAI')}</span>
                  <div className="btn-shine"></div>
                </button>
                </div>
              </div>
            </div>
          </div>
        </div>



        {/* Decorative Elements */}
        <div className="hero-decorations">
          <div className="pulse-ring pulse-ring-1"></div>
          <div className="pulse-ring pulse-ring-2"></div>
          <div className="pulse-ring pulse-ring-3"></div>
        </div>
      </div>
    </section>
    
    {/* IoT Health Monitoring Section */}
    <section className="iot-health-section">
      <div className="iot-container">
        <div className="iot-header">
          <div className="iot-title-container">
            <div className="iot-icon-wrapper">
              <div className="pulse-heart">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </div>
            </div>
            <div className="title-with-badge">
              <h2 className="iot-title gradient-text">{t('iotHealthMonitoring')}</h2>
              <div className="future-perk-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
                <span>{t('futurePerk')}</span>
              </div>
            </div>
            <p className="iot-subtitle">{t('iotSubtitle')}</p>
            <div className="future-notice">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
              <span>{t('comingSoonFeature')}</span>
            </div>
          </div>
          
          <div className="mode-toggle">
            <button 
              className={`mode-btn ${inputMode === 'manual' ? 'active' : ''}`}
              onClick={() => setInputMode('manual')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
              </svg>
              {t('manualInput')}
            </button>
            <button 
              className={`mode-btn ${inputMode === 'iot' ? 'active' : ''}`}
              onClick={() => setInputMode('iot')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
              {t('iotDevices')}
            </button>
          </div>
        </div>

        <div className="iot-content">
          {inputMode === 'manual' ? (
            <div className="manual-input-section">
              <div className="health-metrics-grid">
                <div className="metric-card heart-rate-card">
                  <div className="metric-header">
                    <div className="metric-icon">
                      <div className="heartbeat-line">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                        </svg>
                      </div>
                    </div>
                    <h3>{t('heartRate')}</h3>
                  </div>
                  <div className="metric-input">
                    <input
                      type="number"
                      placeholder={t('enterBPM')}
                      value={iotData.heartRate}
                      onChange={(e) => handleIotDataChange('heartRate', e.target.value)}
                    />
                    <span className="unit">BPM</span>
                  </div>
                  <div className="metric-visualization">
                    <div className="pulse-wave"></div>
                  </div>
                </div>

                <div className="metric-card blood-pressure-card">
                  <div className="metric-header">
                    <div className="metric-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M8 12h8"/>
                        <path d="M12 8v8"/>
                      </svg>
                    </div>
                    <h3>{t('bloodPressure')}</h3>
                  </div>
                  <div className="metric-input dual-input">
                    <input
                      type="number"
                      placeholder={t('systolic')}
                      value={iotData.bloodPressure.systolic}
                      onChange={(e) => handleIotDataChange('bloodPressure', { systolic: e.target.value })}
                    />
                    <span className="separator">/</span>
                    <input
                      type="number"
                      placeholder={t('diastolic')}
                      value={iotData.bloodPressure.diastolic}
                      onChange={(e) => handleIotDataChange('bloodPressure', { diastolic: e.target.value })}
                    />
                    <span className="unit">mmHg</span>
                  </div>
                  <div className="metric-visualization">
                    <div className="pressure-gauge">
                      <div className="gauge-needle"></div>
                      <div className="gauge-arc"></div>
                    </div>
                  </div>
                </div>

                <div className="metric-card temperature-card">
                  <div className="metric-header">
                    <div className="metric-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/>
                      </svg>
                    </div>
                    <h3>{t('temperature')}</h3>
                  </div>
                  <div className="metric-input">
                    <input
                      type="number"
                      step="0.1"
                      placeholder={t('enterTemp')}
                      value={iotData.temperature}
                      onChange={(e) => handleIotDataChange('temperature', e.target.value)}
                    />
                    <span className="unit">°F</span>
                  </div>
                  <div className="temperature-indicator">
                    <div className="temp-bar"></div>
                  </div>
                </div>

                <div className="metric-card oxygen-card">
                  <div className="metric-header">
                    <div className="metric-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                      </svg>
                    </div>
                    <h3>{t('oxygenLevel')}</h3>
                  </div>
                  <div className="metric-input">
                    <input
                      type="number"
                      placeholder={t('enterPercent')}
                      value={iotData.oxygenLevel}
                      onChange={(e) => handleIotDataChange('oxygenLevel', e.target.value)}
                    />
                    <span className="unit">%</span>
                  </div>
                  <div className="oxygen-rings">
                    <div className="ring ring-1"></div>
                    <div className="ring ring-2"></div>
                    <div className="ring ring-3"></div>
                  </div>
                </div>

                <div className="metric-card weight-card">
                  <div className="metric-header">
                    <div className="metric-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M7 20h10"/>
                        <path d="M12 16v4"/>
                        <path d="M12 4a4 4 0 0 1 4 4v4H8V8a4 4 0 0 1 4-4Z"/>
                      </svg>
                    </div>
                    <h3>{t('weight')}</h3>
                  </div>
                  <div className="metric-input">
                    <input
                      type="number"
                      placeholder={t('enterWeight')}
                      value={iotData.weight}
                      onChange={(e) => handleIotDataChange('weight', e.target.value)}
                    />
                    <span className="unit">lbs</span>
                  </div>
                  <div className="metric-visualization">
                    <div className="weight-scale">
                      <div className="scale-platform"></div>
                      <div className="scale-indicator"></div>
                    </div>
                  </div>
                </div>

                <div className="metric-card steps-card">
                  <div className="metric-header">
                    <div className="metric-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 20V10"/>
                        <path d="M12 20V4"/>
                        <path d="M6 20v-6"/>
                      </svg>
                    </div>
                    <h3>{t('dailySteps')}</h3>
                  </div>
                  <div className="metric-input">
                    <input
                      type="number"
                      placeholder={t('enterSteps')}
                      value={iotData.steps}
                      onChange={(e) => handleIotDataChange('steps', e.target.value)}
                    />
                    <span className="unit">steps</span>
                  </div>
                  <div className="steps-progress">
                    <div className="progress-bar"></div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="iot-devices-section">
              <div className="device-scanner">
                <div className="scanner-header">
                  <h3>{t('availableHealthDevices')}</h3>
                  <button 
                    className={`scan-btn ${isScanning ? 'scanning' : ''}`}
                    onClick={simulateIotScan}
                    disabled={isScanning}
                  >
                    <div className="scan-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 7v6h6"/>
                        <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>
                      </svg>
                    </div>
                    {isScanning ? t('scanning') : t('scanForDevices')}
                  </button>
                </div>
                
                {isScanning && (
                  <div className="scanning-animation">
                    <div className="radar-sweep"></div>
                    <div className="scan-waves">
                      <div className="wave wave-1"></div>
                      <div className="wave wave-2"></div>
                      <div className="wave wave-3"></div>
                    </div>
                  </div>
                )}
                
                <div className="devices-grid">
                  {iotDevices.map(device => (
                    <div key={device.id} className={`device-card ${device.connected ? 'connected' : ''}`}>
                      <div className="device-status">
                        <div className={`status-indicator ${device.connected ? 'connected' : 'disconnected'}`}></div>
                      </div>
                      <div className="device-info">
                        <h4>{device.name}</h4>
                        <p>{device.type}</p>
                      </div>
                      <button 
                        className="connect-btn"
                        onClick={() => connectIotDevice(device.id)}
                      >
                        {device.connected ? t('disconnect') : t('connect')}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          <div className="iot-actions">
            <button 
              className="generate-report-btn btn-modern btn-accent btn-gradient"
              onClick={() => setShowFuturePerkModal(true)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <line x1="10" y1="9" x2="8" y2="9"/>
              </svg>
              {t('generateHealthReport')}
              <div className="btn-shine"></div>
            </button>
          </div>
        </div>
        
        {/* IoT Report Display */}
        {showIotReport && iotReport && (
          <div className="iot-report-section">
            <div className="report-header">
              <h3>{t('healthAnalysisReport')}</h3>
              <p className="report-timestamp">{t('generatedOn')} {iotReport.timestamp}</p>
              <button 
                className="close-report-btn"
                onClick={() => setShowIotReport(false)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="report-content">
              <div className="health-summary">
                <h4>{t('healthMetricsSummary')}</h4>
                <div className="metrics-summary">
                  {Object.entries(iotReport.data).map(([key, value]) => (
                    <div key={key} className="summary-item">
                      <span className="metric-name">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>
                      <span className="metric-value">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="report-analysis">
                <div className="analysis-content">
                  {iotReport.content.split('\n').map((paragraph, index) => (
                    <p key={index} className="analysis-paragraph">{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* IoT Background Animations */}
      <div className="iot-background">
        <div className="health-particles">
          <div className="particle particle-1"></div>
          <div className="particle particle-2"></div>
          <div className="particle particle-3"></div>
          <div className="particle particle-4"></div>
          <div className="particle particle-5"></div>
        </div>
        <div className="data-streams">
          <div className="stream stream-1"></div>
          <div className="stream stream-2"></div>
          <div className="stream stream-3"></div>
        </div>
      </div>
    </section>
    
    {/* Future Perk Modal */}
    {showFuturePerkModal && (
      <div className="modal-overlay" onClick={() => setShowFuturePerkModal(false)}>
        <div className="future-perk-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <div className="modal-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
            </div>
            <h3>Future Perk Coming Soon!</h3>
            <button 
              className="modal-close-btn"
              onClick={() => setShowFuturePerkModal(false)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div className="modal-content">
            <div className="perk-preview">
              <div className="preview-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </div>
              <h4>AI-Powered Health Reports</h4>
              <p>Get comprehensive health analysis and personalized recommendations based on your IoT device data and manual inputs.</p>
            </div>
            <div className="coming-soon-features">
              <h5>What's Coming:</h5>
              <ul>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20,6 9,17 4,12"/>
                  </svg>
                  Real-time IoT device connectivity
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20,6 9,17 4,12"/>
                  </svg>
                  Advanced health trend analysis
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20,6 9,17 4,12"/>
                  </svg>
                  Personalized health recommendations
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20,6 9,17 4,12"/>
                  </svg>
                  Integration with healthcare providers
                </li>
              </ul>
            </div>
            <div className="modal-actions">
              <button 
                className="notify-btn btn-modern btn-accent btn-gradient"
                onClick={() => {
                  alert('Thanks for your interest! We\'ll notify you when this feature is available.');
                  setShowFuturePerkModal(false);
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                Notify Me When Available
                <div className="btn-shine"></div>
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    
    {/* Chat Response Section */}
    {(showChat || (showReport && analysisReport)) && (
      <section className="chat-section" ref={reportSectionRef}>
        <div className="chat-container">
          {/* Tab Navigation when both report and chat are visible */}
          {showReport && analysisReport && (
            <div className="tab-navigation">
              <button 
                className={`tab-btn ${activeTab === 'report' ? 'active' : ''}`}
                onClick={() => setActiveTab('report')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
                Medical Report
              </button>
              <button 
                className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
                onClick={() => setActiveTab('chat')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                </svg>
                Health Assistant
              </button>
            </div>
          )}
          
          {/* Chat Content */}
          <div className={`chat-content ${(!showReport || !analysisReport || activeTab === 'chat') ? 'visible' : 'hidden'}`}>
            <div className="chat-header">
              <h3 className="chat-title gradient-text">Health Assistant Conversation</h3>
              <button 
                className="action-btn close-btn" 
                onClick={handleCloseChat} 
                title="Close Chat"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            
            <div className="chat-messages">
              {chatMessages.map((message) => (
                <div key={message.id} className={`chat-message ${message.type}`}>
                  <div className="message-avatar">
                    {message.type === 'user' ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    )}
                  </div>
                  <div className="message-content">
                    <div className="message-text" dangerouslySetInnerHTML={{ __html: parseMarkdown(message.content) }}></div>
                    <div className="message-time">{message.timestamp}</div>
                  </div>
                </div>
              ))}
              
              {isAsking && (
                <div className="chat-message ai typing">
                  <div className="message-avatar">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                  <div className="message-content">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
            </div>
           </div>
           
           {/* Report Content (when tab is active) */}
          {showReport && analysisReport && activeTab === 'report' && (
            <div className="report-content-tab visible">
              <div className="report-header">
                <h3 className="report-title gradient-text">
                  Health Analysis Report
                  {isIntegratingPOV && (
                    <span className="pov-integration-indicator">
                      <svg className="spinning" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 12a9 9 0 11-6.219-8.56"/>
                      </svg>
                      Integrating your perspective...
                    </span>
                  )}
                </h3>
                <div className="report-actions">
                  <button className="action-btn copy-btn" onClick={handleCopyReport} title={t('copyReport')}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                  </button>
                  <button className="action-btn download-btn" onClick={handleDownloadReport} title={t('downloadReport')}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7,10 12,15 17,10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                  </button>
                  <button className={`action-btn voice-btn ${isPlaying ? 'playing' : ''}`} onClick={handleVoiceReport} title={isPlaying ? "Pause Reading" : "Read Aloud"}>
                    {isPlaying ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="6" y="4" width="4" height="16"/>
                        <rect x="14" y="4" width="4" height="16"/>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="11,5 6,9 2,9 2,15 6,15 11,19 11,5"/>
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
                      </svg>
                    )}
                  </button>
                  <button className="action-btn close-btn" onClick={handleCloseReport} title={t('closeReport')}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="report-text">
                {processReportContent(analysisReport.content).map((item) => (
                  <p key={item.id} className="report-paragraph">
                    {item.hasHtml ? (
                      <span dangerouslySetInnerHTML={{ __html: item.content }} />
                    ) : (
                      item.content
                    )}
                  </p>
                ))}
              </div>
              

            </div>
          )}
          
          {/* Chat Input Area - Always at the bottom when chat is active */}
          {(!showReport || !analysisReport || activeTab === 'chat') && (
            <div className="chat-input-area">
              <div className="chat-input-container">
                <div className={`input-wrapper glow-effect ${isTyping ? 'typing' : ''}`}>
                  <input
                    type="text"
                    className="chat-input"
                    placeholder={isRecording ? t('listening') : t('askHealthQuestion')}
                    value={question}
                    onChange={handleQuestionChange}
                    onKeyPress={(e) => e.key === 'Enter' && !isAsking && question.trim() && handleAskQuestion()}
                  />
                  <div className="input-border"></div>
                  <div className="input-glow"></div>
                </div>
                {voiceSupported && (
                  <button 
                    className={`btn btn-voice ${isRecording ? 'recording' : ''}`}
                    onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                    disabled={isAsking}
                    title={isRecording ? "Stop recording" : "Start voice input"}
                  >
                    <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      {isRecording ? (
                        <rect x="6" y="6" width="12" height="12" rx="2"/>
                      ) : (
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                      )}
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                      <line x1="12" y1="19" x2="12" y2="23"/>
                      <line x1="8" y1="23" x2="16" y2="23"/>
                    </svg>
                    <div className="btn-shine"></div>
                  </button>
                )}
                <button 
                  className="btn btn-send btn-modern btn-accent btn-gradient"
                  onClick={handleAskQuestion}
                  disabled={!question.trim() || isAsking}
                >
                  <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22,2 15,22 11,13 2,9 22,2"/>
                  </svg>
                  <span className="btn-text">{isAsking ? t('sending') : t('send')}</span>
                  <div className="btn-shine"></div>
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    )}
    
    {/* Professional Footer */}
    <footer className="professional-footer">
      <div className="footer-background">
        <div className="footer-wave"></div>
        <div className="footer-particles">
          {[...Array(20)].map((_, i) => (
            <div key={i} className={`particle particle-${i % 4}`}></div>
          ))}
        </div>
      </div>
      
      <div className="footer-content">
        <div className="footer-main">
          <div className="footer-brand">
            <div className="brand-icon">
              <div className="pulse-ring"></div>
              <div className="pulse-ring pulse-ring-delay"></div>
              <svg viewBox="0 0 24 24" className="health-logo">
                <path d="M12 2C13.1 2 14 2.9 14 4V8H18C19.1 8 20 8.9 20 10V14C20 15.1 19.1 16 18 16H14V20C14 21.1 13.1 22 12 22H10C8.9 22 8 21.1 8 20V16H4C2.9 16 2 15.1 2 14V10C2 8.9 2.9 8 4 8H8V4C8 2.9 8.9 2 10 2H12Z" fill="currentColor"/>
              </svg>
            </div>
            <div className="brand-text">
              <h3>{t('heroTitle')}</h3>
              <p>{t('advancedHealthcareAnalytics')}</p>
            </div>
          </div>
          
          <div className="footer-links">
            <div className="link-group">
              <h4>{t('platform')}</h4>
              <div className="links">
                <a href="#" className="footer-link">{t('documentAnalysis')}</a>
                <a href="#" className="footer-link">{t('iotIntegration')}</a>
                <a href="#" className="footer-link">{t('aiDiagnostics')}</a>
              </div>
            </div>
            
            <div className="link-group">
              <h4>{t('resources')}</h4>
              <div className="links">
                <a href="#" className="footer-link">{t('documentation')}</a>
                <a href="#" className="footer-link">{t('apiReference')}</a>
                <a href="#" className="footer-link">{t('support')}</a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="footer-divider"></div>
          <div className="footer-meta">
            <p>&copy; 2024 {t('heroTitle')}. {t('advancedHealthcareTechnology')}.</p>
            <div className="footer-badges">
              <span className="badge">{t('hipaaCompliant')}</span>
              <span className="badge">{t('iso27001')}</span>
              <span className="badge">{t('fdaApproved')}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
    </>
  );
};

export default Hero;