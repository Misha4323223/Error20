/**
 * 🔍 ТЕСТ ЧЕСТНОСТИ NEURAL STATUS API
 * Проверяем что система честно сообщает о состоянии lite/full режима
 */

const http = require('http');

async function testHonestNeuralStatus() {
  console.log('🔍 ТЕСТИРОВАНИЕ ЧЕСТНОСТИ NEURAL STATUS API');
  console.log('==========================================');

  try {
    // Тест 1: Проверяем /api/neural/status
    console.log('\n1. Тестируем /api/neural/status');
    const statusResponse = await makeRequest('/api/neural/status');
    
    console.log('📊 Neural Status Response:');
    console.log(`  Status: ${statusResponse.status}`);
    console.log(`  Message: ${statusResponse.message}`);
    console.log(`  Progress: ${statusResponse.progress}%`);
    console.log(`  Success: ${statusResponse.success}`);

    // Тест 2: Проверяем /api/neural/stats
    console.log('\n2. Тестируем /api/neural/stats');
    const statsResponse = await makeRequest('/api/neural/stats');
    
    console.log('📊 Neural Stats Response:');
    console.log(`  Mode: ${statsResponse?.neuralMode || 'unknown'}`);
    console.log(`  Model: ${statsResponse?.modelName || 'unknown'}`);
    console.log(`  Parameters: ${statsResponse?.parameters || 'unknown'}`);
    console.log(`  Layers: ${statsResponse?.layers || 'unknown'}`);

    // Анализ честности
    console.log('\n📋 АНАЛИЗ ЧЕСТНОСТИ:');
    
    const statusMode = statusResponse.status;
    const statsMode = statsResponse?.neuralMode || statsResponse?.mode;
    
    if (statusMode === statsMode) {
      console.log(`✅ ЧЕСТНОСТЬ ПОДТВЕРЖДЕНА: Оба API сообщают режим "${statusMode}"`);
    } else {
      console.log(`❌ НЕСООТВЕТСТВИЕ ОБНАРУЖЕНО:`);
      console.log(`   /api/neural/status: "${statusMode}"`);
      console.log(`   /api/neural/stats: "${statsMode}"`);
    }
    
    // Проверка на false claims
    if (statusMode === 'full' && (!statsResponse || statsResponse.layers < 12)) {
      console.log('❌ ЛОЖНОЕ ЗАЯВЛЕНИЕ: Status сообщает "full", но реальная модель имеет < 12 слоев');
    } else if (statusMode === 'lite' && statsResponse?.layers >= 12) {
      console.log('❌ ЛОЖНОЕ ЗАЯВЛЕНИЕ: Status сообщает "lite", но реальная модель имеет >= 12 слоев');
    } else {
      console.log('✅ СООТВЕТСТВИЕ: Заявленный режим соответствует реальным характеристикам');
    }

    console.log('\n🎯 РЕЗУЛЬТАТ ТЕСТА:');
    const isHonest = statusMode === statsMode;
    console.log(`Система честна: ${isHonest ? 'ДА' : 'НЕТ'}`);
    console.log(`Текущий режим: ${statusMode}`);
    
    return {
      isHonest,
      statusMode,
      statsMode,
      statusResponse,
      statsResponse
    };

  } catch (error) {
    console.log(`❌ Ошибка теста: ${error.message}`);
    return { error: error.message };
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

// Запуск теста
if (require.main === module) {
  testHonestNeuralStatus()
    .then(result => {
      console.log('\n🏁 Тест завершен');
      process.exit(0);
    })
    .catch(error => {
      console.log('\n💥 Критическая ошибка теста:', error.message);
      process.exit(1);
    });
}

module.exports = { testHonestNeuralStatus };