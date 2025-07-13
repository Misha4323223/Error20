/**
 * 🔧 ПРИНУДИТЕЛЬНЫЙ СБРОС NEURAL INTEGRATION К ЧЕСТНОМУ СОСТОЯНИЮ
 * Исправляет ложные заявления о "full" режиме
 */

const http = require('http');

async function forceHonestNeuralReset() {
  console.log('🔧 ПРИНУДИТЕЛЬНЫЙ СБРОС NEURAL INTEGRATION К ЧЕСТНОСТИ');
  console.log('=====================================================');

  try {
    // Шаг 1: Проверяем текущее состояние
    console.log('\n1. Проверяем текущее ложное состояние...');
    const beforeStatus = await makeRequest('/api/neural/status');
    const beforeStats = await makeRequest('/api/neural/stats');
    
    console.log(`  Status API (ложный): ${beforeStatus.status}`);
    console.log(`  Stats API (честный): ${beforeStats.mode || beforeStats.neuralMode}`);
    
    if (beforeStatus.status === beforeStats.mode) {
      console.log('✅ Система уже честна, сброс не требуется');
      return;
    }
    
    // Шаг 2: Принудительно инициализируем ТОЛЬКО lite модель
    console.log('\n2. Принудительная инициализация lite модели...');
    const initResponse = await makePostRequest('/api/neural/initialize-lite', {});
    
    console.log(`  Инициализация lite: ${initResponse.success ? 'успешно' : 'ошибка'}`);
    if (initResponse.message) {
      console.log(`  Сообщение: ${initResponse.message}`);
    }
    
    // Шаг 3: Ждем стабилизации
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Шаг 4: Проверяем результат
    console.log('\n3. Проверяем честность после сброса...');
    const afterStatus = await makeRequest('/api/neural/status');
    const afterStats = await makeRequest('/api/neural/stats');
    
    console.log(`  Status API (после сброса): ${afterStatus.status}`);
    console.log(`  Stats API (после сброса): ${afterStats.mode || afterStats.neuralMode}`);
    
    // Анализ результата
    const isNowHonest = afterStatus.status === (afterStats.mode || afterStats.neuralMode);
    
    console.log('\n🎯 РЕЗУЛЬТАТ ПРИНУДИТЕЛЬНОГО СБРОСА:');
    if (isNowHonest) {
      console.log('✅ УСПЕХ: Система стала честной!');
      console.log(`✅ Оба API сообщают: "${afterStatus.status}"`);
    } else {
      console.log('❌ НЕУДАЧА: Система продолжает лгать');
      console.log(`❌ Status: "${afterStatus.status}" vs Stats: "${afterStats.mode || afterStats.neuralMode}"`);
    }
    
    return {
      success: isNowHonest,
      beforeStatus: beforeStatus.status,
      afterStatus: afterStatus.status,
      statsMode: afterStats.mode || afterStats.neuralMode
    };

  } catch (error) {
    console.log(`❌ Ошибка принудительного сброса: ${error.message}`);
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

function makePostRequest(path, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(responseData);
          resolve(jsonData);
        } catch (e) {
          reject(new Error(`Invalid JSON response from ${path}: ${responseData}`));
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.setTimeout(10000, () => {
      req.abort();
      reject(new Error(`Request timeout for ${path}`));
    });

    req.write(postData);
    req.end();
  });
}

// Запуск сброса
if (require.main === module) {
  forceHonestNeuralReset()
    .then(result => {
      console.log('\n🏁 Принудительный сброс завершен');
      process.exit(0);
    })
    .catch(error => {
      console.log('\n💥 Критическая ошибка сброса:', error.message);
      process.exit(1);
    });
}

module.exports = { forceHonestNeuralReset };