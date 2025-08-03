/**
 * AI Model Service for flashcard generation
 * Handles communication with various AI providers
 */

export interface AiProvider {
  name: string;
  apiKey?: string;
  baseUrl?: string;
  model: string;
}

export interface FlashcardGenerationPrompt {
  text: string;
  maxCards: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  subject?: string;
  focusAreas?: string[];
  language: string;
}

export interface GeneratedFlashcard {
  question: string;
  answer: string;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  confidence: number; // 0-1 score of AI confidence
}

export class AiModelService {
  private static providers: Record<string, AiProvider> = {
    openai: {
      name: 'OpenAI',
      baseUrl: 'https://api.openai.com/v1',
      model: 'gpt-4-turbo-preview'
    },
    anthropic: {
      name: 'Anthropic',
      baseUrl: 'https://api.anthropic.com/v1',
      model: 'claude-3-sonnet-20240229'
    },
    local: {
      name: 'Local Model',
      baseUrl: '/api/local-ai',
      model: 'llama-3-8b-instruct'
    }
  };

  /**
   * Generate flashcards using the specified AI provider
   */
  static async generateFlashcards(
    prompt: FlashcardGenerationPrompt,
    provider: string = 'openai'
  ): Promise<{ success: boolean; flashcards?: GeneratedFlashcard[]; error?: string }> {
    try {
      const aiProvider = this.providers[provider];
      if (!aiProvider) {
        throw new Error(`Unknown AI provider: ${provider}`);
      }

      console.log(`Generating flashcards using ${aiProvider.name}...`);

      const systemPrompt = this.createSystemPrompt(prompt);
      const userPrompt = this.createUserPrompt(prompt);

      // Route to appropriate provider
      switch (provider) {
        case 'openai':
          return await this.callOpenAI(systemPrompt, userPrompt, aiProvider);
        case 'anthropic':
          return await this.callAnthropic(systemPrompt, userPrompt, aiProvider);
        case 'local':
          return await this.callLocalModel(systemPrompt, userPrompt, aiProvider);
        default:
          throw new Error(`Provider ${provider} not implemented`);
      }
    } catch (error) {
      console.error('Error generating flashcards:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate flashcards'
      };
    }
  }

  /**
   * Create system prompt for flashcard generation
   */
  private static createSystemPrompt(prompt: FlashcardGenerationPrompt): string {
    return `You are an expert educator and flashcard creator. Your task is to create high-quality study flashcards from the provided text.

Guidelines:
- Create exactly ${prompt.maxCards} flashcards
- Difficulty level: ${prompt.difficulty}
- Language: ${prompt.language}
- Focus on key concepts, definitions, processes, and important facts
- Questions should be clear, specific, and testable
- Answers should be concise but complete
- Include variety: definitions, explanations, examples, applications
- Assign appropriate difficulty levels
- Categorize by topic/subject area

${prompt.focusAreas?.length ? `Focus particularly on these areas: ${prompt.focusAreas.join(', ')}` : ''}

Return your response as a JSON array with this exact structure:
[
  {
    "question": "Clear, specific question",
    "answer": "Concise but complete answer", 
    "explanation": "Additional context if needed",
    "difficulty": "easy|medium|hard",
    "category": "topic/subject area",
    "confidence": 0.95
  }
]

Ensure the JSON is valid and properly formatted.`;
  }

  /**
   * Create user prompt with the text to process
   */
  private static createUserPrompt(prompt: FlashcardGenerationPrompt): string {
    return `Please create ${prompt.maxCards} flashcards from the following text:

${prompt.text}

Remember to follow the guidelines and return valid JSON only.`;
  }

  /**
   * Call OpenAI API
   */
  private static async callOpenAI(
    systemPrompt: string,
    userPrompt: string,
    provider: AiProvider
  ): Promise<{ success: boolean; flashcards?: GeneratedFlashcard[]; error?: string }> {
    try {
      // TODO: Implement when API key is available
      // This should use the Supabase secrets for the API key
      
      const response = await fetch(`${provider.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${provider.apiKey || 'TODO_GET_FROM_SUPABASE_SECRETS'}`
        },
        body: JSON.stringify({
          model: provider.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 4000,
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content received from OpenAI');
      }

      const flashcards = JSON.parse(content);
      return { success: true, flashcards };
    } catch (error) {
      console.error('OpenAI API error:', error);
      return {
        success: false,
        error: 'OpenAI integration not yet configured. Please set up API key in Supabase secrets.'
      };
    }
  }

  /**
   * Call Anthropic Claude API
   */
  private static async callAnthropic(
    systemPrompt: string,
    userPrompt: string,
    provider: AiProvider
  ): Promise<{ success: boolean; flashcards?: GeneratedFlashcard[]; error?: string }> {
    try {
      // TODO: Implement when API key is available
      
      const response = await fetch(`${provider.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': provider.apiKey || 'TODO_GET_FROM_SUPABASE_SECRETS',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: provider.model,
          max_tokens: 4000,
          system: systemPrompt,
          messages: [
            { role: 'user', content: userPrompt }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Anthropic API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.content[0]?.text;
      
      if (!content) {
        throw new Error('No content received from Anthropic');
      }

      const flashcards = JSON.parse(content);
      return { success: true, flashcards };
    } catch (error) {
      console.error('Anthropic API error:', error);
      return {
        success: false,
        error: 'Anthropic integration not yet configured. Please set up API key in Supabase secrets.'
      };
    }
  }

  /**
   * Call local AI model
   */
  private static async callLocalModel(
    systemPrompt: string,
    userPrompt: string,
    provider: AiProvider
  ): Promise<{ success: boolean; flashcards?: GeneratedFlashcard[]; error?: string }> {
    try {
      // TODO: Implement local model integration
      // This could use a local Ollama instance or similar
      
      return {
        success: false,
        error: 'Local AI model integration not yet implemented'
      };
    } catch (error) {
      console.error('Local model error:', error);
      return {
        success: false,
        error: 'Local model integration not yet configured'
      };
    }
  }

  /**
   * Test connection to AI provider
   */
  static async testProvider(provider: string): Promise<{ success: boolean; error?: string }> {
    try {
      const testPrompt: FlashcardGenerationPrompt = {
        text: 'The capital of France is Paris.',
        maxCards: 1,
        difficulty: 'easy',
        language: 'en'
      };

      const result = await this.generateFlashcards(testPrompt, provider);
      return { success: result.success, error: result.error };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Provider test failed'
      };
    }
  }

  /**
   * Get available providers
   */
  static getAvailableProviders(): string[] {
    return Object.keys(this.providers);
  }

  /**
   * Update provider configuration
   */
  static updateProvider(name: string, config: Partial<AiProvider>): void {
    if (this.providers[name]) {
      this.providers[name] = { ...this.providers[name], ...config };
    }
  }
}