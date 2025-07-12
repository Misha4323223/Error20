const { getGlobalNeuralIntegration } = require('./server/neural-integration.cjs');

async function checkNeuralReality() {
  console.log('🔍 ГЛУБОКАЯ ДИАГНОСТИКА НЕЙРОСЕТИ');
  console.log('='.repeat(60));

  const neuralIntegration = getGlobalNeuralIntegration();

  // 1. Проверяем заявленные характеристики
  console.log('📊 ЗАЯВЛЕННЫЕ ХАРАКТЕРИСТИКИ:');
  console.log('- mode:', neuralIntegration.mode);
  console.log('- isInitialized:', neuralIntegration.isInitialized);
  console.log('');

  // 2. Проверяем реальные модели
  console.log('🧠 ПРОВЕРКА РЕАЛЬНЫХ МОДЕЛЕЙ:');

  if (neuralIntegration.neuralCore) {
    console.log('✅ neuralCore существует');
    console.log('  - model существует:', !!neuralIntegration.neuralCore.model);
    console.log('  - isInitialized:', neuralIntegration.neuralCore.isInitialized);

    if (neuralIntegration.neuralCore.model) {
      try {
        const stats = neuralIntegration.neuralCore.getModelStats();
        console.log('  - numLayers:', stats.numLayers);
        console.log('  - totalParams:', stats.totalParams);
        console.log('  - vocabSize:', stats.vocabSize);
        console.log('  - architecture:', stats.architecture);
      } catch (error) {
        console.log('  - ❌ Ошибка получения статистики FULL:', error.message);
      }
    }
  } else {
    console.log('❌ neuralCore НЕ существует');
  }

  if (neuralIntegration.neuralLite) {
    console.log('✅ neuralLite существует');
    console.log('  - model существует:', !!neuralIntegration.neuralLite.model);
    console.log('  - isInitialized:', neuralIntegration.neuralLite.isInitialized);

    if (neuralIntegration.neuralLite.model) {
      try {
        const stats = neuralIntegration.neuralLite.getModelStats();
        console.log('  - numLayers:', stats.numLayers);
        console.log('  - totalParams:', stats.totalParams);
        console.log('  - vocabSize:', stats.vocabSize);
        console.log('  - architecture:', stats.architecture);
      } catch (error) {
        console.log('  - ❌ Ошибка получения статистики LITE:', error.message);
      }
    }
  } else {
    console.log('❌ neuralLite НЕ существует');
  }

  // 3. Тестируем качество генерации
  console.log('');
  console.log('🧪 ТЕСТ КАЧЕСТВА ГЕНЕРАЦИИ:');

  try {
    const currentModel = neuralIntegration.getCurrentModel();
    if (currentModel) {
      console.log('✅ getCurrentModel() работает');
      console.log('  - Тип модели:', currentModel.constructor.name);

      // Тестируем простую генерацию
      const testResponse = await currentModel.generateResponse('привет как дела', {
        maxTokens: 20,
        temperature: 0.7
      });

      console.log('  - Тестовый ответ:', `"${testResponse}"`);
      console.log('  - Длина ответа:', testResponse.length);
      console.log('  - Выглядит осмысленно:', testResponse.includes(' ') && testResponse.length > 20);

    } else {
      console.log('❌ getCurrentModel() вернул null');
    }
  } catch (error) {
    console.log('❌ Ошибка тестирования генерации:', error.message);
  }

  // 4. Проверяем словари
  console.log('');
  console.log('📚 ПРОВЕРКА СЛОВАРЕЙ:');

  try {
    const currentModel = neuralIntegration.getCurrentModel();
    if (currentModel) {
      console.log('  - vocabSize:', currentModel.vocabSize);
      console.log('  - vocabulary size:', currentModel.vocabulary?.size || 'N/A');
      console.log('  - reverseVocabulary size:', currentModel.reverseVocabulary?.size || 'N/A');

      // Проверяем первые несколько токенов
      if (currentModel.reverseVocabulary) {
        console.log('  - Первые токены:');
        for (let i = 0; i < Math.min(10, currentModel.reverseVocabulary.size); i++) {
          const word = currentModel.reverseVocabulary.get(i);
          console.log(`    ${i}: "${word}"`);
        }
      }
    }
  } catch (error) {
    console.log('❌ Ошибка проверки словарей:', error.message);
  }

  // 5. Финальный вердикт
  console.log('');
  console.log('🎯 ФИНАЛЬНЫЙ ВЕРДИКТ:');

  const actualModel = neuralIntegration.getCurrentModel();
  const realModelType = actualModel?.constructor.name || 'unknown';
  const realLayers = actualModel?.numLayers || 0;
  const realParams = actualModel?.model?.countParams?.() || 0;

  console.log(`  - Реально используется: ${realModelType}`);
  console.log(`  - Реальные слои: ${realLayers}`);
  console.log(`  - Реальные параметры: ${realParams}`);

  if (realModelType.includes('Lite') || realLayers === 3) {
    console.log('  ❌ ПРОБЛЕМА: Заявлен FULL, но работает LITE!');
  } else if (realLayers === 12 && realParams > 100000000) {
    console.log('  ✅ Действительно используется FULL модель');
    console.log('  🔧 Проблема в алгоритме генерации/детокенизации');
  } else {
    console.log('  ⚠️ Неопределенное состояние - требует дополнительной диагностики');
  }
}

checkNeuralReality().catch(console.error);