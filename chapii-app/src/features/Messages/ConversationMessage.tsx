import {
  MessageRoleEnum,
  TranscriptMessage,
} from "@/lib/types/conversation.type";

interface ConversationMessageProps {
  message: TranscriptMessage;
}

export function ConversationMessage({ message }: ConversationMessageProps) {
  return (
    <div className={`flex mb-4 ${message.role === MessageRoleEnum.USER ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] p-3 rounded-lg ${
        message.role === MessageRoleEnum.USER
          ? 'bg-blue-500 text-white rounded-br-sm'
          : 'bg-gray-100 text-gray-900 rounded-bl-sm'
      }`}>
        <p className="text-sm leading-relaxed">{message.transcript}</p>
      </div>
    </div>
  );
}
