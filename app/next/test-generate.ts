import { config } from 'dotenv';
config();
import { createLangchainLlmGateway } from './src/features/llm/infrastructure/langchain/LangchainLlmGateway';

async function run() {
  const gateway = createLangchainLlmGateway();
  console.log('Starting generation...');
  const start = Date.now();
  const result = await gateway.generateContent({ scenarioType: 'パスワード再設定', userPrompt: '' });
  console.log(`Finished in ${Date.now() - start}ms`);
  console.log('Result:', result.ok ? 'Success' : result.error);
}

run().catch(console.error);
