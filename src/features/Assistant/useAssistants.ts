import { useState, useEffect, useMemo } from 'react';
import { AssistantsAPI, Assistant } from '@/lib/api/assistants.api';
import { envConfig } from '@/config/env.config';

export function useAssistants() {
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [selectedAssistant, setSelectedAssistant] = useState<Assistant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const assistantsAPI = useMemo(
    () => new AssistantsAPI(
      envConfig.vapi.apiUrl,
      envConfig.vapi.serverApiKey || envConfig.vapi.token
    ),
    []
  );

  useEffect(() => {
    const fetchAssistants = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("Fetching assistants with API key:", envConfig.vapi.serverApiKey || envConfig.vapi.token);
        const fetchedAssistants = await assistantsAPI.getAssistants();
        console.log("Fetched assistants:", fetchedAssistants);
        setAssistants(fetchedAssistants);
        
        // Auto-select the first assistant if available and none selected
        if (fetchedAssistants.length > 0) {
          console.log("Auto-selecting first assistant:", fetchedAssistants[0]);
          setSelectedAssistant(fetchedAssistants[0]);
        }
      } catch (err) {
        console.error("Error fetching assistants:", err);
        setError(err instanceof Error ? err.message : 'Failed to fetch assistants');
      } finally {
        setLoading(false);
      }
    };

    fetchAssistants();
  }, [assistantsAPI]);

  const selectAssistant = (assistantId: string) => {
    const assistant = assistants.find(a => a.id === assistantId);
    if (assistant) {
      setSelectedAssistant(assistant);
    }
  };

  return {
    assistants,
    selectedAssistant,
    loading,
    error,
    selectAssistant,
    setSelectedAssistant,
  };
}
