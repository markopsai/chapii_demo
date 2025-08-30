// React import removed - not needed with new JSX transform
import { Assistant } from '@/lib/api/assistants.api';

interface AssistantSelectorProps {
  assistants: Assistant[];
  selectedAssistant: Assistant | null;
  onSelectAssistant: (assistantId: string) => void;
  loading: boolean;
  error: string | null;
}

export function AssistantSelector({
  assistants,
  selectedAssistant,
  onSelectAssistant,
  loading,
  error
}: AssistantSelectorProps) {
  if (loading) {
    return (
      <div className="flex items-center space-x-2 p-4 border-b">
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
        <span className="text-sm text-gray-600">Loading assistants...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border-b bg-red-50 text-red-700 text-sm">
        Error loading assistants: {error}
      </div>
    );
  }

  if (assistants.length === 0) {
    return (
      <div className="p-4 border-b bg-yellow-50 text-yellow-700 text-sm">
        No assistants found. Create an assistant in your Vapi dashboard first.
      </div>
    );
  }

  return (
    <div className="p-4 border-b bg-white">
      <label htmlFor="assistant-select" className="block text-sm font-medium text-gray-700 mb-2">
        Select Assistant
      </label>
      <select
        id="assistant-select"
        className="w-full p-2 border border-gray-300 rounded-md bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        value={selectedAssistant?.id || ''}
        onChange={(e) => onSelectAssistant(e.target.value)}
      >
        {assistants.map((assistant) => (
          <option key={assistant.id} value={assistant.id}>
            {assistant.name}
          </option>
        ))}
      </select>
      {selectedAssistant && (
        <div className="mt-2 text-xs text-gray-500">
          <div>Model: {selectedAssistant.model?.provider} {selectedAssistant.model?.model}</div>
          {selectedAssistant.voice && (
            <div>Voice: {selectedAssistant.voice.provider} ({selectedAssistant.voice.voiceId})</div>
          )}
        </div>
      )}
    </div>
  );
}
