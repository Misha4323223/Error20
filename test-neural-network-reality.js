/**
 * 🔍 ТЕСТ РЕАЛЬНОСТИ НЕЙРОСЕТИ
 * Проверяем что на самом деле работает - lite или full версия
 * 
 * Использует динамическое расширение для работы с ES модулями
 */

// Динамическое расширение для работы с require в ES модулях
const { createRequire } = await import('module');
const require = createRequire(import.meta.url);

async function testNeuralReality() {
  console.log('🔍 ПРОВЕРКА РЕАЛЬНОСТИ НЕЙРОСЕТИ');
  console.log('='.repeat(50));

  try {
    const { getGlobalNeuralIntegration } = require('./server/neural-integration.cjs');
    const neuralIntegration = getGlobalNeuralIntegration();

    console.log('📊 СТАТУС ИНТЕГРАЦИИ:');
    console.log('- isInitialized:', neuralIntegration.isInitialized);
    console.log('- mode:', neuralIntegration.mode);
    console.log('- upgradeInProgress:', neuralIntegration.upgradeInProgress);
    console.log('- isInitializing:', neuralIntegration.isInitializing);
    console.log('');

    console.log('📊 СОСТОЯНИЕ МОДЕЛЕЙ:');
    console.log('- neuralCore exists:', !!neuralIntegration.neuralCore);
    console.log('- neuralCore.model exists:', !!neuralIntegration.neuralCore?.model);
    console.log('- neuralCore.isInitialized:', neuralIntegration.neuralCore?.isInitialized);
    console.log('- neuralLite exists:', !!neuralIntegration.neuralLite);
    console.log('- neuralLite.model exists:', !!neuralIntegration.neuralLite?.model);
    console.log('- neuralLite.isInitialized:', neuralIntegration.neuralLite?.isInitialized);
    console.log('');

    console.log('🔧 ТЕСТ getCurrentModel():');
    const currentModel = neuralIntegration.getCurrentModel();
    console.log('- getCurrentModel() возвращает:', currentModel === neuralIntegration.neuralCore ? 'FULL' : 
                                                  currentModel === neuralIntegration.neuralLite ? 'LITE' : 'NULL');
    console.log('');

    // Тест статистики модели
    if (currentModel) {
      console.log('📊 СТАТИСТИКА АКТИВНОЙ МОДЕЛИ:');
      try {
        const stats = currentModel.getModelStats();
        console.log('- layers:', stats.layers);
        console.log('- totalParams:', stats.totalParams);
        console.log('- memoryEstimate:', stats.memoryEstimate);
        console.log('- architecture:', stats.architecture);
        
        // Определяем реальный тип на основе параметров
        const realType = stats.totalParams > 10000000 ? 'FULL (>10M params)' : 'LITE (<10M params)';
        console.log('- РЕАЛЬНЫЙ ТИП:', realType);
        
        // Проверяем соответствие mode и реальности
        const expectedMode = stats.totalParams > 10000000 ? 'full' : 'lite';
        const isConsistent = neuralIntegration.mode === expectedMode;
        console.log('- СООТВЕТСТВИЕ MODE:', isConsistent ? '✅ КОРРЕКТНО' : '❌ НЕСООТВЕТСТВИЕ');
        
        if (!isConsistent) {
          console.log(`❌ ПРОБЛЕМА: mode='${neuralIntegration.mode}' но реальная модель ${realType}`);
        }
        
      } catch (error) {
        console.log('❌ Ошибка получения статистики:', error.message);
      }
    } else {
      console.log('❌ НЕТ АКТИВНОЙ МОДЕЛИ');
    }

    console.log('');
    console.log('🔍 АНАЛИЗ ПРОБЛЕМЫ:');
    
    // Проверяем логику getCurrentModel
    const fullReady = neuralIntegration.neuralCore && neuralIntegration.neuralCore.model && neuralIntegration.neuralCore.isInitialized;
    const liteReady = neuralIntegration.neuralLite && neuralIntegration.neuralLite.model && neuralIntegration.neuralLite.isInitialized;
    
    console.log('- fullReady (по логике getCurrentModel):', fullReady);
    console.log('- liteReady (по логике getCurrentModel):', liteReady);
    
    if (!fullReady && !liteReady) {
      console.log('❌ КРИТИЧЕСКАЯ ПРОБЛЕМА: Обе модели не готовы!');
      
      // Проверяем более детально
      if (neuralIntegration.neuralCore) {
        console.log('⚠️ neuralCore существует, но:');
        console.log('  - model:', !!neuralIntegration.neuralCore.model);
        console.log('  - isInitialized:', neuralIntegration.neuralCore.isInitialized);
      }
      
      if (neuralIntegration.neuralLite) {
        console.log('⚠️ neuralLite существует, но:');
        console.log('  - model:', !!neuralIntegration.neuralLite.model);
        console.log('  - isInitialized:', neuralIntegration.neuralLite.isInitialized);
      }
    }

    console.log('');
    console.log('🔧 РЕКОМЕНДАЦИИ:');
    if (neuralIntegration.mode === 'full' && !fullReady) {
      console.log('❌ ИСПРАВИТЬ: mode="full" но full модель не готова');
      console.log('   Решение: Синхронизировать mode с реальным состоянием');
    }
    if (neuralIntegration.mode === 'lite' && !liteReady) {
      console.log('❌ ИСПРАВИТЬ: mode="lite" но lite модель не готова');
      console.log('   Решение: Переинициализировать lite модель');
    }
    if (fullReady && liteReady) {
      console.log('✅ ХОРОШО: Обе модели готовы, используется приоритетная full');
    }

  } catch (error) {
    console.error('❌ ОШИБКА ТЕСТА:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Запуск теста
testNeuralReality().then(() => {
  console.log('\n🔍 ТЕСТ ЗАВЕРШЕН');
}).catch(error => {
  console.error('❌ КРИТИЧЕСКАЯ ОШИБКА ТЕСТА:', error);
});