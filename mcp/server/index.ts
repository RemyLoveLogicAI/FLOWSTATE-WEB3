#!/usr/bin/env node
/**
 * FlowState AI MCP Server
 * Model Context Protocol server with integrated voice capabilities
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { VoiceService } from '../../src/services/voiceService.js';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';

// Initialize voice service
const voiceService = new VoiceService();

// Tool definitions
const tools: Tool[] = [
  {
    name: 'voice_transcribe',
    description: 'Transcribe audio file to text using Whisper AI. Supports multiple languages and audio formats.',
    inputSchema: {
      type: 'object',
      properties: {
        audioPath: {
          type: 'string',
          description: 'Path to the audio file to transcribe',
        },
        language: {
          type: 'string',
          description: 'Optional language code (e.g., "en", "es", "fr")',
        },
      },
      required: ['audioPath'],
    },
  },
  {
    name: 'voice_synthesize',
    description: 'Convert text to speech with natural-sounding voices. Choose from multiple voices and adjust speed.',
    inputSchema: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: 'Text to convert to speech',
        },
        voice: {
          type: 'string',
          description: 'Voice to use: alloy, echo, fable, onyx, nova, shimmer',
          enum: ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'],
        },
        speed: {
          type: 'number',
          description: 'Speech speed (0.25 to 4.0, default 1.0)',
          minimum: 0.25,
          maximum: 4.0,
        },
        outputPath: {
          type: 'string',
          description: 'Path where to save the audio file',
        },
      },
      required: ['text', 'outputPath'],
    },
  },
  {
    name: 'voice_list',
    description: 'List all available voice options with their characteristics (gender, style, provider)',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'voice_detect_language',
    description: 'Detect the language of spoken audio using AI',
    inputSchema: {
      type: 'object',
      properties: {
        audioPath: {
          type: 'string',
          description: 'Path to the audio file',
        },
      },
      required: ['audioPath'],
    },
  },
  {
    name: 'voice_clone',
    description: 'Clone a voice from audio samples (requires ElevenLabs API key)',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Name for the cloned voice',
        },
        samplePaths: {
          type: 'array',
          items: { type: 'string' },
          description: 'Paths to audio sample files (at least 3 recommended)',
        },
        description: {
          type: 'string',
          description: 'Optional description of the voice',
        },
      },
      required: ['name', 'samplePaths'],
    },
  },
];

// Create MCP server
const server = new Server(
  {
    name: 'flowstate-ai-voice-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'voice_transcribe': {
        const { audioPath, language } = args as {
          audioPath: string;
          language?: string;
        };

        const audioBuffer = await fs.readFile(audioPath);
        const transcription = await voiceService.transcribe(
          audioBuffer,
          language
        );

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                transcription,
                language: language || 'auto-detected',
                audioFile: audioPath,
              }, null, 2),
            },
          ],
        };
      }

      case 'voice_synthesize': {
        const { text, voice = 'alloy', speed = 1.0, outputPath } = args as {
          text: string;
          voice?: string;
          speed?: number;
          outputPath: string;
        };

        const audioBuffer = await voiceService.synthesize(text, voice, {
          speed,
        });

        // Ensure output directory exists
        const dir = path.dirname(outputPath);
        await fs.mkdir(dir, { recursive: true });

        await fs.writeFile(outputPath, audioBuffer);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: 'Audio synthesized successfully',
                outputPath,
                voice,
                speed,
                textLength: text.length,
              }, null, 2),
            },
          ],
        };
      }

      case 'voice_list': {
        const voices = voiceService.listVoices();

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                voices,
                count: voices.length,
              }, null, 2),
            },
          ],
        };
      }

      case 'voice_detect_language': {
        const { audioPath } = args as { audioPath: string };

        const audioBuffer = await fs.readFile(audioPath);
        const language = await voiceService.detectLanguage(audioBuffer);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                language,
                audioFile: audioPath,
              }, null, 2),
            },
          ],
        };
      }

      case 'voice_clone': {
        const { name, samplePaths, description } = args as {
          name: string;
          samplePaths: string[];
          description?: string;
        };

        const sampleBuffers = await Promise.all(
          samplePaths.map((path) => fs.readFile(path))
        );

        const voiceId = await voiceService.cloneVoice(
          name,
          sampleBuffers,
          description
        );

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: 'Voice cloned successfully',
                voiceId,
                voiceName: name,
                samplesUsed: samplePaths.length,
              }, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: errorMessage,
            tool: name,
          }, null, 2),
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('FlowState AI Voice MCP server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
