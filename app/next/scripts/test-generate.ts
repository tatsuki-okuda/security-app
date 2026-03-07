/* eslint-disable no-console */
import { createLangchainLlmGateway } from '../src/features/llm/infrastructure/langchain/LangchainLlmGateway';

// Force local connections for the test
process.env.LLM_BASE_URL = 'http://127.0.0.1:11434/v1';
process.env.LLM_MODEL = 'qwen2.5';
process.env.OPENAI_API_KEY = 'ollama-dummy-key';

async function main() {
  console.log('Testing generateContent...');
  const gateway = createLangchainLlmGateway();
  
  console.log('Calling generateContent...');
  const result = await gateway.generateContent({
    scenarioType: 'パスワード再設定通知',
    userPrompt: '急いでいる感じを出してください。',
  });

  if (result.ok) {
    console.log(JSON.stringify(result.value, null, 2));
  } else {
    console.log('❌ Generation failed. Full result object:');
    console.dir(result, { depth: null });
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
