export interface ExtractedData {
  name?: string;
  email?: string;
  organization?: string;
  useCase?: string;
  [key: string]: any; // Allow for additional fields
}

export class DataExtractor {
  private static emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  
  static extractFromFunctionResult(functionResult: any): Partial<ExtractedData> {
    const extracted: Partial<ExtractedData> = {};
    
    if (!functionResult || typeof functionResult !== 'object') {
      return extracted;
    }

    // Extract from direct properties
    if (functionResult.name) {
      extracted.name = String(functionResult.name);
    }
    
    if (functionResult.email) {
      extracted.email = String(functionResult.email);
    }
    
    if (functionResult.organization || functionResult.company) {
      extracted.organization = String(functionResult.organization || functionResult.company);
    }
    
    if (functionResult.useCase || functionResult.use_case) {
      extracted.useCase = String(functionResult.useCase || functionResult.use_case);
    }

    return extracted;
  }

  static extractFromText(text: string): Partial<ExtractedData> {
    const extracted: Partial<ExtractedData> = {};
    
    // Extract email using regex
    const emailMatch = text.match(this.emailRegex);
    if (emailMatch) {
      extracted.email = emailMatch[0];
    }
    
    return extracted;
  }

  static extractFromTranscript(transcript: string, context: 'user' | 'assistant'): Partial<ExtractedData> {
    const extracted: Partial<ExtractedData> = {};
    
    // Only extract from user responses for now
    if (context !== 'user') {
      return extracted;
    }

    // Name extraction patterns
    const namePatterns = [
      /(?:my name is|i'm|i am|call me)\s+([a-zA-Z\s]+?)(?:\.|,|$|\s+and|\s+from|\s+my)/i,
      /(?:name[:']?\s*)([a-zA-Z\s]+?)(?:\.|,|$|\s+and|\s+from|\s+my)/i,
      /(?:actually|sorry|correction|my name should be|it's actually)\s+([a-zA-Z\s]+?)(?:\.|,|$|\s+and|\s+from)/i
    ];
    
    for (const pattern of namePatterns) {
      const match = transcript.match(pattern);
      if (match && match[1]) {
        const name = match[1].trim();
        if (name.length > 1 && name.length < 50) { // Reasonable name length
          extracted.name = name;
          break;
        }
      }
    }

    // Email extraction
    const emailMatch = transcript.match(this.emailRegex);
    if (emailMatch) {
      extracted.email = emailMatch[0];
    }

    // Organization extraction patterns
    const orgPatterns = [
      /(?:work at|from|company is|organization is|employed at|with)\s+([a-zA-Z0-9\s&.,-]+?)(?:\.|,|$|\s+and|\s+as)/i,
      /(?:at|for)\s+([a-zA-Z0-9\s&.,-]+?)(?:\.|,|$|\s+for|\s+as|\s+in)/i,
      /(?:company[:']?\s*)([a-zA-Z0-9\s&.,-]+?)(?:\.|,|$|\s+and)/i
    ];
    
    for (const pattern of orgPatterns) {
      const match = transcript.match(pattern);
      if (match && match[1]) {
        const org = match[1].trim();
        if (org.length > 1 && org.length < 100) {
          extracted.organization = org;
          break;
        }
      }
    }

    return extracted;
  }

  static mergeData(existing: ExtractedData, newData: Partial<ExtractedData>): ExtractedData {
    return {
      ...existing,
      ...Object.fromEntries(
        Object.entries(newData).filter(([, value]) => value !== undefined && value !== '')
      )
    };
  }
}
