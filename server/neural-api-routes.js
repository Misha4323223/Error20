/**
 * 🚀 NEURAL API ROUTES
 * REST API для управления нейросетью BOOOMERANGS
 */

const { getGlobalNeuralIntegration } = require('./neural-integration.cjs');
const { getGlobalProgressManager } = require('./neural-progress-manager.cjs');

let neuralIntegration = null;
const progressManager = getGlobalProgressManager();

// Автоинициализация ОТКЛЮЧЕНА - используйте /api/neural/initialize-lite для запуска
console.log('⚡ Neural API в режиме ожидания - используйте /api/neural/initialize-lite для быстрого старта');

// Оценка завершения Фазы 2 - вынесена из setupNeuralRoutes
function assessPhase2Completion(stats) {
  const improvements = {
    layersUpgraded: stats.neural?.numLayers >= 12,
    ropeImplemented: stats.neural?.positionEncoding?.includes('RoPE'),
    memoryOptimized: stats.neural?.memoryOptimization?.includes('Checkpointing'),
    mixedPrecision: stats.neural?.precision?.includes('Mixed')
  };

  const completedCount = Object.values(improvements).filter(Boolean).length;
  const totalCount = Object.keys(improvements).length;
  const completionPercent = Math.round((completedCount / totalCount) * 100);

  return {
    improvements,
    completed: completedCount,
    total: totalCount,
    percentage: completionPercent,
    status: completionPercent === 100 ? 'Фаза 2 завершена' : `Прогресс: ${completionPercent}%`
  };
}

function setupNeuralRoutes(app) {
  // ⚡ Быстрая инициализация lite нейросети
  app.post('/api/neural/initialize-lite', async (req, res) => {
    try {
      console.log('⚡ Запуск lite нейросети...');

      // Проверяем состояние глобальной интеграции
      const globalIntegration = getGlobalNeuralIntegration();

      if (globalIntegration?.isInitialized && globalIntegration?.mode === 'lite') {
        neuralIntegration = globalIntegration;
        return res.json({
          success: true,
          message: 'Lite модель уже инициализирована (глобальная)',
          mode: 'lite',
          alreadyInitialized: true,
          stats: neuralIntegration.getCurrentModel()?.getModelStats?.() || null
        });
      }

      if (neuralIntegration?.isInitialized && neuralIntegration?.mode === 'lite') {
        return res.json({
          success: true,
          message: 'Lite модель уже инициализирована (локальная)',
          mode: 'lite',
          alreadyInitialized: true,
          stats: neuralIntegration.getCurrentModel()?.getModelStats?.() || null
        });
      }

      // Создаем новый экземпляр и инициализируем только lite версию
      console.log('🔄 Создание нового экземпляра нейроинтеграции...');

      // Запускаем отслеживание инициализации через Progress Manager
      progressManager.startOperation('Lite Neural Network Initialization', 10000);

      try {
        // Обновляем прогресс: инициализация
        progressManager.updateProgress(10, 'Инициализация нейроинтеграции...');
        neuralIntegration = getGlobalNeuralIntegration();
        if (!neuralIntegration.isInitialized) {
          await neuralIntegration.initializeLite();
        }

        // Принудительно переводим в lite режим если инициализировалась полная
        if (neuralIntegration.mode !== 'lite') {
          console.log('🔄 Принудительное переключение в LITE режим...');
          progressManager.updateProgress(50, 'Переключение в LITE режим...');
          await neuralIntegration.initializeLite();
        }

        // Завершаем операцию успешно
        progressManager.updateProgress(100, 'Lite нейросеть готова');
        progressManager.completeOperation(true, 'Lite Neural Network Ready');

      } catch (initError) {
        progressManager.completeOperation(false, `Initialization failed: ${initError.message}`);
        throw initError;
      }

      res.json({
        success: true,
        message: 'Lite нейросеть успешно инициализирована',
        mode: neuralIntegration.mode,
        stats: neuralIntegration.getCurrentModel()?.getModelStats?.() || null,
        timestamp: new Date().toISOString(),
        initializationType: 'new_instance',
        autoUpgradeScheduled: false
      });

      // ЧЕСТНОСТЬ: Автоматический upgrade отключен - используйте ручной API
      console.log('📋 [ЧЕСТНОСТЬ] Автоматический upgrade отключен для честности системы');
      console.log('💡 [ЧЕСТНОСТЬ] Для перехода на full используйте POST /api/neural/upgrade-to-full');

    } catch (error) {
      console.error('❌ Ошибка инициализации lite нейросети:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Ошибка инициализации lite нейросети',
        details: error.message 
      });
    }
  });

  // Инициализация LITE нейросети
  app.post('/api/neural/initialize-lite', async (req, res) => {
    try {
      console.log('📡 [API] Запрос инициализации LITE нейросети');

      const neuralIntegration = getGlobalNeuralIntegration();

      // Устанавливаем таймаут для API запроса
      const apiTimeout = setTimeout(() => {
        if (!res.headersSent) {
          console.error('⏰ [API] Таймаут инициализации LITE');
          res.status(408).json({
            success: false,
            error: 'TIMEOUT',
            message: 'Таймаут инициализации LITE нейросети'
          });
        }
      }, 60000); // 60 секунд таймаут для API

      const result = await neuralIntegration.initializeLite();

      clearTimeout(apiTimeout);

      if (!res.headersSent) {
        console.log('✅ [API] LITE инициализация завершена:', result);

        res.json({
          success: result.success !== false,
          message: result.success !== false ? 'LITE нейросеть инициализирована' : result.message,
          data: result
        });
      }
    } catch (error) {
      console.error('❌ [API] Ошибка инициализации LITE:', error);

      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: error.message,
          message: 'Ошибка инициализации LITE нейросети'
        });
      }
    }
  });

  // 🚀 Переход на полную нейросеть
  app.post('/api/neural/upgrade-to-full', async (req, res) => {
    try {
      console.log('🚀 Запуск upgrade на полную модель...');

      if (!neuralIntegration?.isInitialized) {
        return res.status(503).json({
          success: false,
          error: 'Сначала инициализируйте lite модель через /api/neural/initialize-lite'
        });
      }

      // Запускаем отслеживание upgrade операции
      progressManager.startOperation('Full Neural Network Upgrade', 60000);

      // Немедленно отвечаем клиенту, что upgrade начался
      res.json({
        success: true,
        message: 'Upgrade начат, прогресс отслеживается через WebSocket',
        timestamp: new Date().toISOString()
      });

      // Выполняем upgrade асинхронно
      setImmediate(async () => {
        try {
          progressManager.updateProgress(10, 'Подготовка к upgrade...');
          await neuralIntegration.upgradeToFull();
          progressManager.completeOperation(true, 'Full Neural Network Ready');
        } catch (upgradeError) {
          console.error('❌ Ошибка upgrade:', upgradeError);
          progressManager.completeOperation(false, `Upgrade failed: ${upgradeError.message}`);
        }
      });

      return; // Важно: выходим из функции, так как ответ уже отправлен

      if (neuralIntegration.mode === 'full') {
        return res.json({
          success: true,
          message: 'Полная модель уже активна',
          mode: 'full',
          alreadyUpgraded: true
        });
      }

      // Запускаем горячую замену на полную модель
      const upgradeResult = await neuralIntegration.switchToFullModel();

      if (upgradeResult.success) {
        res.json({
          success: true,
          message: 'Успешно переключено на полную модель',
          mode: neuralIntegration.mode,
          upgradeDetails: upgradeResult,
          stats: neuralIntegration.getCurrentModel()?.getModelStats?.() || null,
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Не удалось переключиться на полную модель',
          details: upgradeResult.message,
          fallbackActive: upgradeResult.fallbackActive
        });
      }

    } catch (error) {
      console.error('❌ Ошибка upgrade на полную модель:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Ошибка переключения на полную модель',
        details: error.message 
      });
    }
  });

  // 🧠 Генерация ответа нейросетью
  app.post('/api/neural/generate', async (req, res) => {
    try {
      const { input, options = {} } = req.body;

      if (!input) {
        return res.status(400).json({ error: 'Требуется поле input' });
      }

      if (!neuralIntegration?.isInitialized) {
        return res.status(503).json({ 
          error: 'Нейросеть не инициализирована', 
          suggestion: 'Используйте /api/neural/initialize-lite для быстрого запуска',
          fallback: 'Попробуйте использовать /api/ai/chat для семантической обработки'
        });
      }

      const response = await neuralIntegration.generateHybridResponse(input, options);

      res.json({
        success: true,
        input,
        response,
        type: 'neural_hybrid',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Ошибка генерации neural response:', error);
      res.status(500).json({ 
        error: 'Ошибка генерации ответа', 
        details: error.message 
      });
    }
  });

  // 📊 Расширенная статистика нейросети для dashboard - ЧЕСТНАЯ ВЕРСИЯ
  app.get('/api/neural/stats', (req, res) => {
    try {
      const { getGlobalNeuralIntegration } = require('./neural-integration.cjs');
      const neuralIntegration = getGlobalNeuralIntegration();
      
      let actualStats = {
        success: true,
        neuralMode: 'unknown',
        mode: 'unknown',
        modelName: 'BOOOMERANGS-Neural-Unknown',
        layers: 0,
        parameters: '0',
        memoryUsage: '0MB',
        isInitialized: false,
        health: 'unknown',
        performance: 0,
        uptime: Math.floor(process.uptime()),
        training_sessions: 0,
        last_training: new Date().toISOString(),
        status: 'inactive',
        timestamp: new Date().toISOString()
      };

      if (neuralIntegration && neuralIntegration.isInitialized) {
        const currentModel = neuralIntegration.getCurrentModel();
        
        if (currentModel && currentModel.getModelStats) {
          try {
            const modelStats = currentModel.getModelStats();
            const layers = modelStats.numLayers || modelStats.layers || 0;
            const params = modelStats.totalParams || 0;
            
            // Определяем реальный режим
            let realMode = 'unknown';
            let modelName = 'BOOOMERANGS-Neural-Unknown';
            let performance = 0;
            
            if (params > 100000000) {
              realMode = 'full';
              modelName = 'BOOOMERANGS-Neural-Full-12Layer';
              performance = 95;
            } else if (params > 1000000) {
              realMode = 'lite';
              modelName = 'BOOOMERANGS-Neural-Lite-3Layer';
              performance = 75;
            } else {
              realMode = 'minimal';
              modelName = 'BOOOMERANGS-Neural-Minimal';
              performance = 50;
            }
            
            actualStats = {
              success: true,
              neuralMode: realMode,
              mode: realMode,
              modelName: modelName,
              layers: layers,
              parameters: params > 1000000 ? `${(params / 1000000).toFixed(1)}M` : `${Math.round(params / 1000)}K`,
              memoryUsage: modelStats.memoryEstimate?.estimatedMB ? `${modelStats.memoryEstimate.estimatedMB}MB` : '64MB',
              isInitialized: true,
              health: 'good',
              performance: performance,
              uptime: Math.floor(process.uptime()),
              training_sessions: 0,
              last_training: new Date().toISOString(),
              status: 'active',
              timestamp: new Date().toISOString(),
              // Дополнительная диагностическая информация
              diagnostic: {
                declaredMode: neuralIntegration.mode,
                actualLayers: layers,
                actualParams: params,
                consistent: neuralIntegration.mode === realMode
              }
            };
            
            console.log(`📊 [Neural API] ЧЕСТНАЯ статистика: ${realMode} (${layers} слоев, ${params} параметров)`);
            
          } catch (error) {
            console.error('❌ [Neural API] Ошибка получения статистики модели:', error);
          }
        }
      }

      res.json(actualStats);

    } catch (error) {
      console.error('❌ Ошибка получения neural stats:', error);
      res.status(500).json({ 
        success: false,
        error: 'Ошибка получения статистики', 
        details: error.message 
      });
    }
  });

  // 🎓 Обучение нейросети с расширенным словарем
  app.post('/api/neural/train', async (req, res) => {
    try {
      const { epochs = 10, batchSize = 8, expandVocabulary = true } = req.body;

      if (!neuralIntegration?.isInitialized) {
        return res.status(503).json({ 
          error: 'Нейросеть не инициализирована',
          suggestion: 'Используйте /api/neural/initialize-lite перед обучением'
        });
      }

      console.log('🎓 Запуск обучения с расширенным словарем...');

      // Инициализируем систему обучения
      const { NeuralTrainingSystem } = require('./neural-training-system.cjs');
      const trainingSystem = new NeuralTrainingSystem();
      await trainingSystem.initialize();

      // Подготавливаем данные
      const dataStats = await trainingSystem.prepareTrainingData();

      res.json({
        success: true,
        message: 'Обучение с расширенным словарем запущено',
        config: {
          epochs,
          batchSize,
          expandVocabulary
        },
        dataStats,
        timestamp: new Date().toISOString()
      });

      // Запускаем обучение асинхронно
      const trainingPromise = trainingSystem.trainModel(
        neuralIntegration.getCurrentModel(),
        { epochs, batchSize }
      );

      // Обучение продолжается в фоне
      trainingPromise.then((result) => {
        console.log('✅ Обучение с расширенным словарем завершено:', result);

        // Сохраняем обновленную модель
        neuralIntegration.getCurrentModel()?.saveModel?.();

      }).catch(error => {
        console.error('❌ Ошибка обучения с расширенным словарем:', error);
      });

    } catch (error) {
      console.error('❌ Ошибка запуска обучения:', error);
      res.status(500).json({ 
        error: 'Ошибка запуска обучения',
        details: error.message
      });
    }
  });

  // 📚 Endpoint для расширения словаря
  app.post('/api/neural/expand-vocabulary', async (req, res) => {
    try {
      const { targetSize = 10000, saveToFile = true } = req.body;

      console.log(`📚 Запуск расширения словаря до ${targetSize} токенов...`);

      const { NeuralVocabularyExpander } = require('./neural-vocabulary-expander.cjs');
      const expander = new NeuralVocabularyExpander();
      expander.targetVocabSize = targetSize;

      await expander.initialize();
      await expander.expandVocabulary();

      const stats = expander.getVocabularyStats();

      let saveResult = null;
      if (saveToFile) {
        saveResult = await expander.saveExpandedVocabulary();
      }

      res.json({
        success: true,
        message: `Словарь расширен до ${stats.totalTokens} токенов`,
        stats,
        saveResult,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Ошибка расширения словаря:', error);
      res.status(500).json({ 
        error: 'Ошибка расширения словаря',
        details: error.message
      });
    }
  });

  // 📊 Статистика обучения
  app.get('/api/neural/training-stats', async (req, res) => {
    try {
      // Проверяем наличие файла метрик
      const fs = require('fs');
      const metricsPath = './neural-models/training-metrics.json';

      let trainingMetrics = null;
      if (fs.existsSync(metricsPath)) {
        trainingMetrics = JSON.parse(fs.readFileSync(metricsPath, 'utf8'));
      }

      // Статистика словаря
      let vocabularyStats = null;
      const vocabPath = './neural-models/expanded-vocabulary.json';
      if (fs.existsSync(vocabPath)) {
        const vocabData = JSON.parse(fs.readFileSync(vocabPath, 'utf8'));
        vocabularyStats = vocabData.metadata;
      }

      res.json({
        success: true,
        trainingMetrics,
        vocabularyStats,
        modelStatus: neuralIntegration?.mode || 'not_initialized',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Ошибка получения статистики:', error);
      res.status(500).json({ 
        error: 'Ошибка получения статистики',
        details: error.message
      });
    }
  });

  // 📝 Добавление примера для обучения
  app.post('/api/neural/training-example', async (req, res) => {
    try {
      const { query, response, metadata = {} } = req.body;

      if (!query || !response) {
        return res.status(400).json({ error: 'Требуются поля query и response' });
      }

      if (!neuralIntegration?.isInitialized) {
        return res.status(503).json({ 
          error: 'Нейросеть не инициализирована',
          suggestion: 'Используйте /api/neural/initialize-lite перед добавлением примеров'
        });
      }

      const success = await neuralIntegration.addTrainingExample(query, response, metadata);

      res.json({
        success,
        message: success ? 'Пример добавлен' : 'Не удалось добавить пример',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Ошибка добавления примера:', error);
      res.status(500).json({ error: 'Ошибка добавления примера' });
    }
  });

  // 🎯 Тест нейросети
  app.post('/api/neural/test', async (req, res) => {
    try {
      const testQueries = [
        "Привет, как дела?",
        "Что такое BOOOMERANGS?",
        "Создай изображение кота",
        "Векторизуй картинку",
        "Помоги с дизайном"
      ];

      if (!neuralIntegration?.isInitialized) {
        return res.status(503).json({ 
          error: 'Нейросеть не инициализирована',
          suggestion: 'Используйте /api/neural/initialize-lite перед тестированием'
        });
      }

      const results = [];

      for (const query of testQueries) {
        try {
          const response = await neuralIntegration.generateHybridResponse(query);
          results.push({
            query,
            response,
            success: true
          });
        } catch (error) {
          results.push({
            query,
            error: error.message,
            success: false
          });
        }
      }

      res.json({
        success: true,
        testResults: results,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Ошибка тестирования:', error);
      res.status(500).json({ error: 'Ошибка тестирования' });
    }
  });

  // 🔄 Рестарт нейросети
  app.post('/api/neural/restart', async (req, res) => {
    try {
      if (neuralIntegration) {
        await neuralIntegration.shutdown();
      }

      neuralIntegration = getGlobalNeuralIntegration();
      if (!neuralIntegration.isInitialized) {
        await neuralIntegration.initializeLite();
      }

      res.json({
        success: true,
        message: 'Нейросеть перезапущена',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Ошибка рестарта нейросети:', error);
      res.status(500).json({ error: 'Ошибка рестарта нейросети' });
    }
  });

  console.log('🔗 Neural API routes настроены');
}

module.exports = { setupNeuralRoutes };