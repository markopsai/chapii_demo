import React, { useState, useEffect, useRef } from 'react';
import { useVapi, vapi } from '@/features/Assistant';
import { useAssistants } from '@/features/Assistant/useAssistants';
import { MessageList } from '@/features/Messages';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { MessageTypeEnum, MessageRoleEnum, Message } from '@/lib/types/conversation.type';

// Match Vapi dashboard structured data fields exactly
interface VapiStructuredData {
  name: string;      // Person's actual name
  email: string;     // Email address
  intent: string;    // Intent/purpose
  company: string;   // Company name
  phone: string;     // Phone number
}

interface NotificationState {
  show: boolean;
  message: string;
  type: 'added' | 'updated';
}

export function ChapiiLayout() {
  const scrollAreaRef = useRef<any>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [isAgentLive, setIsAgentLive] = useState(false);
  const [structuredData, setStructuredData] = useState<VapiStructuredData>({
    name: '',
    email: '',
    intent: '',
    company: '',
    phone: ''
  });
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    message: '',
    type: 'added'
  });

  const {
    assistants,
    selectedAssistant,
    loading: assistantsLoading,
    selectAssistant,
  } = useAssistants();

  const { toggleCall, messages, callStatus, activeTranscript } = useVapi(selectedAssistant);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    const viewport = viewportRef.current;
    if (viewport) {
      viewport.scrollTop = viewport.scrollHeight;
    }
  };

  useEffect(() => {
    vapi.on("message", scrollToBottom);
    return () => {
      vapi.off("message", scrollToBottom);
    };
  }, []);

  // Also scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, activeTranscript]);

  // Debug: Log all Vapi events and fetch structured data
  useEffect(() => {
    const handleCallEnd = async (callData: any) => {
      console.log("📞 CALL ENDED - Raw data:", JSON.stringify(callData, null, 2));
      console.log("📞 Available properties:", Object.keys(callData || {}));
      console.log("📞 Call ID attempts:", {
        id: callData?.id,
        callId: callData?.callId,
        call_id: callData?.call_id,
        direct: callData
      });
      
      // Try multiple wait times and call ID formats
      const tryFetchData = async (delay: number) => {
        setTimeout(async () => {
          try {
            // Try multiple possible call ID locations
            const callId = callData?.id || callData?.callId || callData?.call_id || callData;
            console.log(`🔍 Attempt after ${delay}ms - Call ID:`, callId);
            
            if (callId && typeof callId === 'string') {
              console.log("📡 Fetching from Vapi API with server key...");
              console.log("🔑 Using API key:", import.meta.env.VITE_VAPI_SERVER_API_KEY ? 'Found' : 'Missing');
              
              const response = await fetch(`https://api.vapi.ai/call/${callId}`, {
                headers: {
                  'Authorization': `Bearer ${import.meta.env.VITE_VAPI_SERVER_API_KEY}`,
                  'Content-Type': 'application/json'
                }
              });
              
              console.log("📡 Response status:", response.status, response.statusText);
              
              if (response.ok) {
                const callDetails = await response.json();
                console.log("📊 FULL CALL DETAILS:", JSON.stringify(callDetails, null, 2));
                
                // Look for structured data in multiple locations
                const possibleData = [
                  callDetails.analysis?.structuredData,
                  callDetails.structuredData,
                  callDetails.data,
                  callDetails.analysis?.data
                ];
                
                console.log("🔍 Checking for structured data in:", possibleData);
                
                const data = possibleData.find(d => d && typeof d === 'object');
                console.log("🎯 Found structured data:", data);
                
                if (data) {
                  const newStructuredData = {
                    name: data.name || data.Name || '',
                    email: data.email || data.Email || '',
                    intent: data.intent || data.Intent || '',
                    company: data.company || data.Company || '',
                    phone: data.phone || data.Phone || data.phoneNumber || ''
                  };
                  
                  console.log("✅ Setting structured data:", newStructuredData);
                  setStructuredData(newStructuredData);
                  
                  const filledFields = Object.entries(newStructuredData)
                    .filter(([_, value]) => value)
                    .map(([key, _]) => key.toUpperCase());
                  
                  if (filledFields.length > 0) {
                    showNotification(
                      `${filledFields.join(', ')} captured from Vapi`,
                      'added'
                    );
                  }
                } else {
                  console.log("❌ No structured data found in any location");
                  
                  // For testing: Set sample data to verify UI works
                  console.log("🧪 Setting test data for UI verification...");
                  setStructuredData({
                    name: 'Matrix (from conversation)',
                    email: 'matrix@gmail.com',
                    intent: 'customer support',
                    company: 'Acme Corp',
                    phone: '5551234'
                  });
                  
                  showNotification(
                    'Test data set - check Vapi dashboard for actual structured data configuration',
                    'added'
                  );
                }
              } else {
                console.error("❌ API Response not OK:", response.status, await response.text());
              }
            } else {
              console.log("❌ No valid call ID found:", callId);
            }
          } catch (error) {
            console.error("❌ Error fetching structured data:", error);
          }
        }, delay);
      };
      
      // Try multiple times with different delays
      tryFetchData(2000);  // 2 seconds
      tryFetchData(5000);  // 5 seconds
      tryFetchData(8000);  // 8 seconds
    };
    
    // Listen for ALL Vapi events for debugging
    const logAllEvents = (eventName: string, ...args: any[]) => {
      console.log(`🎯 VAPI EVENT [${eventName}]:`, ...args);
    };
    
    // Log specific events
    vapi.on("call-end", handleCallEnd);
    vapi.on("call-start", (data) => console.log("📞 CALL START:", data));
    vapi.on("message", (data) => console.log("💬 MESSAGE:", data));
    
    return () => {
      vapi.off("call-end", handleCallEnd);
    };
  }, []);

  const showNotification = (message: string, type: 'added' | 'updated') => {
    setNotification({ show: true, message, type });
    // Auto-hide after 3 seconds
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const handleStart = () => {
    setIsAgentLive(!isAgentLive);
    toggleCall();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex flex-col lg:flex-row gap-4 max-w-7xl mx-auto">
        
        {/* Left Column - Config Panel */}
        <div className="lg:w-1/4 w-full">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Config</h2>
            
            {/* Assistant Selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assistant
              </label>
              <select
                className="w-full p-3 border border-gray-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={selectedAssistant?.id || ''}
                onChange={(e) => selectAssistant(e.target.value)}
                disabled={assistantsLoading}
              >
                {assistantsLoading ? (
                  <option>Loading assistants...</option>
                ) : assistants.length > 0 ? (
                  assistants.map((assistant) => (
                    <option key={assistant.id} value={assistant.id}>
                      {assistant.name}
                    </option>
                  ))
                ) : (
                  <option>No assistants found</option>
                )}
              </select>
            </div>

            {/* Start Button */}
            <button
              onClick={handleStart}
              className={`w-full py-3 px-4 rounded-lg font-medium text-sm transition-colors ${
                isAgentLive
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {isAgentLive ? 'Stop' : 'Start'}
            </button>

            {/* Status Info */}
            {selectedAssistant && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-600">
                  <div className="mb-1">
                    <span className="font-medium">Model:</span> {selectedAssistant.model?.provider} {selectedAssistant.model?.model}
                  </div>
                  {selectedAssistant.voice && (
                    <div>
                      <span className="font-medium">Voice:</span> {selectedAssistant.voice.provider} ({selectedAssistant.voice.voiceId})
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Middle Column - Transcript + Agent */}
        <div className="lg:w-1/2 w-full">
          <div className="bg-white rounded-lg shadow-sm p-6 h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Chapii Agent Demo</h1>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isAgentLive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className={`text-sm font-medium ${isAgentLive ? 'text-green-600' : 'text-red-600'}`}>
                  {isAgentLive ? 'LIVE' : 'OFF'}
                </span>
              </div>
            </div>

            {/* Agent Description */}
            {selectedAssistant?.model?.systemPrompt && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  {selectedAssistant.model.systemPrompt}
                </p>
              </div>
            )}

            {/* Chat Messages */}
            <div className="flex-1 min-h-[400px] max-h-[500px] relative">
              <ScrollArea
                ref={scrollAreaRef}
                viewportRef={viewportRef}
                className="h-full flex flex-1 p-4"
              >
                <div className="flex flex-1 flex-col min-h-[85vh] justify-end">
                  <MessageList 
                    messages={messages} 
                    activeTranscript={activeTranscript} 
                  />
                  
                  {/* Placeholder when no messages */}
                  {messages.length === 0 && !activeTranscript && (
                    <div className="flex items-center justify-center h-32">
                      <p className="text-gray-500 text-sm">Start a conversation to see messages here</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Waveform Placeholder */}
            {isAgentLive && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center space-x-1">
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-blue-500 rounded-full animate-pulse"
                      style={{
                        height: `${Math.random() * 20 + 10}px`,
                        animationDelay: `${i * 100}ms`
                      }}
                    ></div>
                  ))}
                </div>
                <p className="text-center text-xs text-gray-500 mt-2">Listening...</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Tool Response */}
        <div className="lg:w-1/4 w-full">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tool Response</h2>
            
            {/* Notification */}
            {notification.show && (
              <div className={`mb-4 p-3 rounded-lg border transition-all duration-300 ease-in-out ${
                notification.type === 'added' 
                  ? 'bg-green-50 border-green-200 text-green-800' 
                  : 'bg-blue-50 border-blue-200 text-blue-800'
              }`}>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    notification.type === 'added' ? 'bg-green-500' : 'bg-blue-500'
                  }`}></div>
                  <span className="text-sm font-medium">
                    {notification.type === 'added' ? '✨ Data Captured' : '🔄 Data Updated'}
                  </span>
                </div>
                <p className="text-sm mt-1 ml-4">
                  {notification.message}
                </p>
              </div>
            )}
            
            <div className="space-y-4">
              {/* NAME - Person's actual name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NAME</label>
                <div className={`w-full p-3 border border-gray-200 rounded-lg text-sm transition-colors ${
                  structuredData.name 
                    ? 'bg-green-50 text-gray-900 border-green-200' 
                    : 'bg-gray-50 text-gray-500'
                }`}>
                  {structuredData.name || 'Not provided'}
                </div>
              </div>

              {/* EMAIL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">EMAIL</label>
                <div className={`w-full p-3 border border-gray-200 rounded-lg text-sm transition-colors ${
                  structuredData.email 
                    ? 'bg-green-50 text-gray-900 border-green-200' 
                    : 'bg-gray-50 text-gray-500'
                }`}>
                  {structuredData.email || 'Not provided'}
                </div>
              </div>

              {/* INTENT - New field matching dashboard */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">INTENT</label>
                <div className={`w-full p-3 border border-gray-200 rounded-lg text-sm transition-colors ${
                  structuredData.intent 
                    ? 'bg-green-50 text-gray-900 border-green-200' 
                    : 'bg-gray-50 text-gray-500'
                }`}>
                  {structuredData.intent || 'Not provided'}
                </div>
              </div>

              {/* COMPANY - Renamed from ORGANIZATION */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">COMPANY</label>
                <div className={`w-full p-3 border border-gray-200 rounded-lg text-sm transition-colors ${
                  structuredData.company 
                    ? 'bg-green-50 text-gray-900 border-green-200' 
                    : 'bg-gray-50 text-gray-500'
                }`}>
                  {structuredData.company || 'Not provided'}
                </div>
              </div>

              {/* PHONE - New field matching dashboard */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PHONE</label>
                <div className={`w-full p-3 border border-gray-200 rounded-lg text-sm transition-colors ${
                  structuredData.phone 
                    ? 'bg-green-50 text-gray-900 border-green-200' 
                    : 'bg-gray-50 text-gray-500'
                }`}>
                  {structuredData.phone || 'Not provided'}
                </div>
              </div>
            </div>

            {/* Data Control */}
            <div className="mt-6 space-y-3">
              {Object.values(structuredData).some(value => value) && (
                <button
                  onClick={() => setStructuredData({ name: '', email: '', intent: '', company: '', phone: '' })}
                  className="w-full py-2 px-3 text-sm bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg transition-colors"
                >
                  Clear All Data
                </button>
              )}
              
              {/* Call Status */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-600">
                  <div className="mb-1">
                    <span className="font-medium">Status:</span> {callStatus}
                  </div>
                  <div className="mb-1">
                    <span className="font-medium">Messages:</span> {messages.length}
                  </div>
                  <div>
                    <span className="font-medium">Data Fields:</span> {Object.values(structuredData).filter(v => v).length}/5
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
