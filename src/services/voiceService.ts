import OpenAI from 'openai';
import axios from 'axios';

export class VoiceService {
  private openai: OpenAI;
  private elevenlabsApiKey: string;
  
  private voices = {
    'alloy': { provider: 'openai', gender: 'neutral', style: 'balanced' },
    'echo': { provider: 'openai', gender: 'male', style: 'professional' },
    'fable': { provider: 'openai', gender: 'neutral', style: 'storytelling' },
    'onyx': { provider: 'openai', gender: 'male', style: 'deep' },
    'nova': { provider: 'openai', gender: 'female', style: 'energetic' },
    'shimmer': { provider: 'openai', gender: 'female', style: 'warm' }
  };

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    this.elevenlabsApiKey = process.env.ELEVENLABS_API_KEY || '';
  }

  /**
   * Transcribe audio to text using Whisper
   */
  async transcribe(
    audioBuffer: Buffer | Blob,
    language?: string
  ): Promise<string> {
    try {
      const transcription = await this.openai.audio.transcriptions.create({
        file: audioBuffer as any,
        model: 'whisper-1',
        language: language || 'en',
        response_format: 'text'
      });

      return transcription as unknown as string;
    } catch (error) {
      console.error('Transcription error:', error);
      throw new Error('Failed to transcribe audio');
    }
  }

  /**
   * Synthesize text to speech
   */
  async synthesize(
    text: string,
    voice: string = 'alloy',
    options?: {
      speed?: number;
      provider?: 'openai' | 'elevenlabs';
    }
  ): Promise<Buffer> {
    const provider = options?.provider || 'openai';

    if (provider === 'openai') {
      return await this.synthesizeWithOpenAI(text, voice, options?.speed);
    } else {
      return await this.synthesizeWithElevenLabs(text, voice, options);
    }
  }

  /**
   * Synthesize using OpenAI TTS
   */
  private async synthesizeWithOpenAI(
    text: string,
    voice: string,
    speed: number = 1.0
  ): Promise<Buffer> {
    try {
      const response = await this.openai.audio.speech.create({
        model: 'tts-1-hd',
        voice: voice as any,
        input: text,
        speed: Math.max(0.25, Math.min(4.0, speed))
      });

      const buffer = Buffer.from(await response.arrayBuffer());
      return buffer;
    } catch (error) {
      console.error('OpenAI TTS error:', error);
      throw new Error('Failed to synthesize speech');
    }
  }

  /**
   * Synthesize using ElevenLabs (higher quality)
   */
  private async synthesizeWithElevenLabs(
    text: string,
    voiceId: string,
    options?: any
  ): Promise<Buffer> {
    if (!this.elevenlabsApiKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    try {
      const response = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: options?.stability || 0.5,
            similarity_boost: options?.similarity || 0.75,
            style: options?.style || 0.0,
            use_speaker_boost: true
          }
        },
        {
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': this.elevenlabsApiKey
          },
          responseType: 'arraybuffer'
        }
      );

      return Buffer.from(response.data);
    } catch (error) {
      console.error('ElevenLabs TTS error:', error);
      throw new Error('Failed to synthesize speech with ElevenLabs');
    }
  }

  /**
   * Stream audio synthesis (for real-time playback)
   */
  async* streamSynthesis(
    text: string,
    voice: string = 'alloy'
  ): AsyncGenerator<Buffer> {
    // Split text into chunks for streaming
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    
    for (const sentence of sentences) {
      const audio = await this.synthesizeWithOpenAI(sentence.trim(), voice);
      yield audio;
    }
  }

  /**
   * Clone a voice (ElevenLabs only)
   */
  async cloneVoice(
    name: string,
    audioSamples: Buffer[],
    description?: string
  ): Promise<string> {
    if (!this.elevenlabsApiKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    try {
      const formData = new FormData();
      formData.append('name', name);
      
      if (description) {
        formData.append('description', description);
      }

      audioSamples.forEach((sample, index) => {
        const blob = new Blob([sample], { type: 'audio/mpeg' });
        formData.append('files', blob, `sample_${index}.mp3`);
      });

      const response = await axios.post(
        'https://api.elevenlabs.io/v1/voices/add',
        formData,
        {
          headers: {
            'xi-api-key': this.elevenlabsApiKey,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      return response.data.voice_id;
    } catch (error) {
      console.error('Voice cloning error:', error);
      throw new Error('Failed to clone voice');
    }
  }

  /**
   * Get available voices
   */
  listVoices() {
    return Object.entries(this.voices).map(([id, config]) => ({
      id,
      ...config
    }));
  }

  /**
   * Detect language from audio
   */
  async detectLanguage(audioBuffer: Buffer): Promise<string> {
    try {
      // Use Whisper's language detection
      const response = await this.openai.audio.transcriptions.create({
        file: audioBuffer as any,
        model: 'whisper-1',
        response_format: 'verbose_json'
      });

      return (response as any).language || 'en';
    } catch (error) {
      console.error('Language detection error:', error);
      return 'en'; // Default to English
    }
  }
}
