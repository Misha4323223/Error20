/**
 * 🔄 НЕМЕДЛЕННЫЙ СБРОС NEURAL INTEGRATION К ЧЕСТНОМУ СОСТОЯНИЮ
 * Принудительно сбрасывает систему без перезапуска сервера
 */

const http = require('http');

async function resetNeuralToHonestNow() {
  console.log('🔄 НЕМЕДЛЕННЫЙ СБРОС NEURAL INTEGRATION К ЧЕСТНОСТИ');
  console.log('================================================');

  try {
    // Шаг 1: Прямой доступ к neural integration модулю
    console.log('\n1. Получаем прямой доступ к neural integration...');
    
    // Получаем текущий neural integration из глобального контекста
    const { getGlobalNeuralIntegration } = require('./server/neural-integration.cjs');
    const neuralIntegration = getGlobalNeuralIntegration();
    
    if (!neuralIntegration) {
      console.log('❌ Neural integration не найден');
      return { success: false, message: 'Neural integration not found' };
    }
    
    console.log(`  Текущий режим: ${neuralIntegration.mode}`);
    console.log(`  Инициализирован: ${neuralIntegration.isInitialized}`);
    
    // Шаг 2: Принудительно сбрасываем к честному lite состоянию
    console.log('\n2. Принудительный сброс к честному lite состоянию...');
    
    const currentModel = neuralIntegration.getCurrentModel();
    const modelStats = currentModel?.getModelStats?.();
    const actualLayers = modelStats?.numLayers || 0;
    const actualParams = modelStats?.totalParams || 0;
    
    console.log(`  Реальные слои модели: ${actualLayers}`);
    console.log(`  Реальные параметры: ${actualParams}`);
    
    // Принудительно устанавливаем честный режим на основе реальных характеристик
    if (actualLayers < 10 || actualParams < 50000000) {
      console.log('  🔧 Принудительно устанавливаем mode = "lite" (честно)');
      neuralIntegration.mode = 'lite';
      neuralIntegration.isInitialized = true;
      
      // Очищаем neuralCore если он есть, но не является полной моделью
      if (neuralIntegration.neuralCore && actualLayers < 10) {
        console.log('  🔧 Очищаем ложный neuralCore (не является полной моделью)');
        neuralIntegration.neuralCore = null;
      }
      
      console.log('  ✅ Режим честно установлен как "lite"');
    } else {
      console.log('  ✅ Модель действительно является полной, оставляем "full"');
    }
    
    // Шаг 3: Останавливаем прогресс manager если он активен
    console.log('\n3. Останавливаем активные операции progress manager...');
    
    if (neuralIntegration.progressManager) {
      try {
        // Принудительно завершаем текущую операцию как неуспешную
        neuralIntegration.progressManager.currentOperation = null;
        neuralIntegration.progressManager.status = 'idle';
        neuralIntegration.progressManager.progress = 0;
        
        console.log('  ✅ Progress manager остановлен');
      } catch (error) {
        console.log('  ⚠️ Ошибка остановки progress manager:', error.message);
      }
    }
    
    // Шаг 4: Проверяем результат через API
    console.log('\n4. Проверяем результат через API...');
    
    const statusAfter = await makeRequest('/api/neural/status');
    const statsAfter = await makeRequest('/api/neural/stats');
    
    console.log(`  Status API: ${statusAfter.status}`);
    console.log(`  Stats API: ${statsAfter.mode || statsAfter.neuralMode}`);
    
    const isNowHonest = statusAfter.status === (statsAfter.mode || statsAfter.neuralMode);
    
    console.log('\n🎯 РЕЗУЛЬТАТ НЕМЕДЛЕННОГО СБРОСА:');
    if (isNowHonest) {
      console.log('✅ УСПЕХ: Neural integration честно сброшен!');
      console.log(`✅ Согласованный режим: "${statusAfter.status}"`);
      console.log('✅ Система работает честно');
      
      return {
        success: true,
        honest: true,
        mode: statusAfter.status,
        layers: actualLayers,
        params: actualParams
      };
    } else {
      console.log('❌ ЧАСТИЧНЫЙ УСПЕХ: API еще не синхронизированы');
      console.log(`❌ Status: "${statusAfter.status}" vs Stats: "${statsAfter.mode || statsAfter.neuralMode}"`);
      
      return {
        success: false,
        honest: false,
        mode: statusAfter.status,
        needsTimeToSync: true
      };
    }

  } catch (error) {
    console.log(`❌ Ошибка немедленного сброса: ${error.message}`);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (e) {
          reject(new Error(`Invalid JSON response from ${path}: ${data}`));
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.setTimeout(5000, () => {
      req.abort();
      reject(new Error(`Request timeout for ${path}`));
    });

    req.end();
  });
}

// Запуск немедленного сброса
if (require.main === module) {
  resetNeuralToHonestNow()
    .then(result => {
      console.log('\n🏁 Немедленный сброс завершен');
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.log('\n💥 Критическая ошибка:', error.message);
      process.exit(1);
    });
}

module.exports = { resetNeuralToHonestNow };