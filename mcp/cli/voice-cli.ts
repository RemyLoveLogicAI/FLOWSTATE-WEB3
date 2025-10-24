#!/usr/bin/env node
/**
 * FlowState AI Voice CLI
 * Command-line interface for voice interactions
 */

import { Command } from 'commander';
import { VoiceService } from '../../src/services/voiceService.js';
import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';

const voiceService = new VoiceService();
const program = new Command();

program
  .name('flowstate-voice')
  .description('FlowState AI Voice CLI - Easy voice interactions')
  .version('1.0.0');

// Transcribe command
program
  .command('transcribe')
  .description('Transcribe an audio file to text')
  .argument('<audio-file>', 'Path to audio file')
  .option('-l, --language <code>', 'Language code (e.g., en, es, fr)')
  .option('-o, --output <file>', 'Output file for transcription')
  .action(async (audioFile, options) => {
    const spinner = ora('Transcribing audio...').start();

    try {
      const audioBuffer = await fs.readFile(audioFile);
      const transcription = await voiceService.transcribe(
        audioBuffer,
        options.language
      );

      spinner.succeed('Transcription complete!');

      console.log('\n' + chalk.cyan('Transcription:'));
      console.log(chalk.white(transcription));

      if (options.output) {
        await fs.writeFile(options.output, transcription);
        console.log(chalk.green(`\n✓ Saved to ${options.output}`));
      }
    } catch (error) {
      spinner.fail('Transcription failed');
      console.error(chalk.red(error instanceof Error ? error.message : String(error)));
      process.exit(1);
    }
  });

// Synthesize command
program
  .command('speak')
  .description('Convert text to speech')
  .argument('<text>', 'Text to speak')
  .option('-v, --voice <name>', 'Voice to use (alloy, echo, fable, onyx, nova, shimmer)', 'alloy')
  .option('-s, --speed <number>', 'Speech speed (0.25-4.0)', '1.0')
  .option('-o, --output <file>', 'Output audio file', 'output.mp3')
  .action(async (text, options) => {
    const spinner = ora('Generating speech...').start();

    try {
      const audioBuffer = await voiceService.synthesize(text, options.voice, {
        speed: parseFloat(options.speed),
      });

      const dir = path.dirname(options.output);
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(options.output, audioBuffer);

      spinner.succeed('Speech generated!');
      console.log(chalk.green(`✓ Audio saved to ${options.output}`));
      console.log(chalk.gray(`  Voice: ${options.voice}`));
      console.log(chalk.gray(`  Speed: ${options.speed}x`));
    } catch (error) {
      spinner.fail('Speech generation failed');
      console.error(chalk.red(error instanceof Error ? error.message : String(error)));
      process.exit(1);
    }
  });

// Interactive mode
program
  .command('interactive')
  .alias('i')
  .description('Interactive voice session')
  .action(async () => {
    console.log(chalk.cyan.bold('\n🎤 FlowState AI Voice - Interactive Mode\n'));

    while (true) {
      const { action } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: 'What would you like to do?',
          choices: [
            { name: '🎤 Transcribe audio file', value: 'transcribe' },
            { name: '🔊 Speak text (TTS)', value: 'speak' },
            { name: '📋 List available voices', value: 'list' },
            { name: '🌐 Detect audio language', value: 'detect' },
            { name: '❌ Exit', value: 'exit' },
          ],
        },
      ]);

      if (action === 'exit') {
        console.log(chalk.yellow('\nGoodbye! 👋\n'));
        process.exit(0);
      }

      try {
        if (action === 'transcribe') {
          const { audioFile, language } = await inquirer.prompt([
            {
              type: 'input',
              name: 'audioFile',
              message: 'Audio file path:',
            },
            {
              type: 'input',
              name: 'language',
              message: 'Language code (optional, press enter to auto-detect):',
            },
          ]);

          const spinner = ora('Transcribing...').start();
          const audioBuffer = await fs.readFile(audioFile);
          const transcription = await voiceService.transcribe(
            audioBuffer,
            language || undefined
          );
          spinner.succeed('Done!');

          console.log('\n' + chalk.cyan('Transcription:'));
          console.log(chalk.white(transcription) + '\n');
        } else if (action === 'speak') {
          const { text, voice, speed, output } = await inquirer.prompt([
            {
              type: 'input',
              name: 'text',
              message: 'Text to speak:',
            },
            {
              type: 'list',
              name: 'voice',
              message: 'Choose voice:',
              choices: ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'],
            },
            {
              type: 'number',
              name: 'speed',
              message: 'Speed (0.25-4.0):',
              default: 1.0,
            },
            {
              type: 'input',
              name: 'output',
              message: 'Output file:',
              default: 'output.mp3',
            },
          ]);

          const spinner = ora('Generating speech...').start();
          const audioBuffer = await voiceService.synthesize(text, voice, {
            speed,
          });
          const dir = path.dirname(output);
          await fs.mkdir(dir, { recursive: true });
          await fs.writeFile(output, audioBuffer);
          spinner.succeed(`Saved to ${output}\n`);
        } else if (action === 'list') {
          const voices = voiceService.listVoices();
          console.log(chalk.cyan('\n📋 Available Voices:\n'));
          voices.forEach((voice) => {
            console.log(
              `  ${chalk.bold(voice.id)} - ${voice.gender} (${voice.style})`
            );
          });
          console.log('');
        } else if (action === 'detect') {
          const { audioFile } = await inquirer.prompt([
            {
              type: 'input',
              name: 'audioFile',
              message: 'Audio file path:',
            },
          ]);

          const spinner = ora('Detecting language...').start();
          const audioBuffer = await fs.readFile(audioFile);
          const language = await voiceService.detectLanguage(audioBuffer);
          spinner.succeed(`Detected language: ${language}\n`);
        }
      } catch (error) {
        console.error(
          chalk.red(
            '\n❌ Error: ' +
              (error instanceof Error ? error.message : String(error)) +
              '\n'
          )
        );
      }
    }
  });

// List voices command
program
  .command('voices')
  .description('List all available voices')
  .action(() => {
    const voices = voiceService.listVoices();
    console.log(chalk.cyan('\n📋 Available Voices:\n'));
    voices.forEach((voice) => {
      console.log(
        `  ${chalk.bold(voice.id)}\n` +
          `    Gender: ${voice.gender}\n` +
          `    Style: ${voice.style}\n` +
          `    Provider: ${voice.provider}\n`
      );
    });
  });

// Detect language command
program
  .command('detect')
  .description('Detect language of audio file')
  .argument('<audio-file>', 'Path to audio file')
  .action(async (audioFile) => {
    const spinner = ora('Detecting language...').start();

    try {
      const audioBuffer = await fs.readFile(audioFile);
      const language = await voiceService.detectLanguage(audioBuffer);

      spinner.succeed('Detection complete!');
      console.log(chalk.cyan(`Detected language: ${chalk.bold(language)}`));
    } catch (error) {
      spinner.fail('Detection failed');
      console.error(chalk.red(error instanceof Error ? error.message : String(error)));
      process.exit(1);
    }
  });

program.parse();
