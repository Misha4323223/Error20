/**
 * 🔧 НЕМЕДЛЕННЫЙ ПРИНУДИТЕЛЬНЫЙ СБРОС К ЧЕСТНОСТИ
 * Исправляет neural integration в runtime без перезапуска сервера
 */

const http = require('http');

async function forceHonestResetImmediate() {
  console.log('🔧 НЕМЕДЛЕННЫЙ ПРИНУДИТЕЛЬНЫЙ СБРОС К ЧЕСТНОСТИ');
  console.log('==============================================');

  try {
    // Шаг 1: Анализируем проблему
    console.log('\n1. Анализируем текущую проблему лжи...');
    const statusBefore = await makeRequest('/api/neural/status');
    const statsBefore = await makeRequest('/api/neural/stats');
    
    console.log(`  Status API лжет: ${statusBefore.status}`);
    console.log(`  Stats API честный: ${statsBefore.mode || statsBefore.neuralMode}`);
    console.log(`  Реальные слои: ${statsBefore.layers}`);
    
    const isLyingNow = statusBefore.status === 'full' && statsBefore.layers < 12;
    
    if (!isLyingNow) {
      console.log('✅ Система уже честна');
      return { success: true, honest: true };
    }
    
    console.log('❌ ПОДТВЕРЖДЕНА ЛОЖ: Система заявляет "full", но работает "lite"');
    
    // Шаг 2: Используем специальный endpoint для принудительного исправления честности
    console.log('\n2. Отправляем команду принудительной честности...');
    
    // Попробуем отправить специальный POST запрос с флагом честности
    const honestRequest = await makePostRequest('/api/neural/force-honest-mode', {
      forceMode: 'lite',
      resetStatusAPI: true,
      reason: 'Исправление ложных заявлений о full режиме'
    });
    
    console.log(`  Результат принудительной честности: ${honestRequest.success ? 'успех' : 'ошибка'}`);
    
    // Если специального endpoint нет, используем обходной путь
    if (!honestRequest.success && honestRequest.error && honestRequest.error.includes('404')) {
      console.log('\n  2.1. Используем обходной путь через переинициализацию...');
      
      // Пытаемся переинициализировать lite модель с флагом честности
      const reinitResponse = await makePostRequest('/api/neural/initialize-lite', {
        forceHonest: true,
        resetMode: true,
        preventAutoUpgrade: true
      });
      
      console.log(`      Переинициализация: ${reinitResponse.success ? 'успех' : 'ошибка'}`);
    }
    
    // Шаг 3: Ждем применения изменений
    console.log('\n3. Ожидание применения изменений...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Шаг 4: Проверяем результат
    console.log('\n4. Проверяем честность после исправления...');
    const statusAfter = await makeRequest('/api/neural/status');
    const statsAfter = await makeRequest('/api/neural/stats');
    
    console.log(`  Status API после исправления: ${statusAfter.status}`);
    console.log(`  Stats API после исправления: ${statsAfter.mode || statsAfter.neuralMode}`);
    
    const isNowHonest = statusAfter.status === (statsAfter.mode || statsAfter.neuralMode);
    
    console.log('\n🎯 РЕЗУЛЬТАТ НЕМЕДЛЕННОГО СБРОСА:');
    if (isNowHonest) {
      console.log('✅ УСПЕХ: Система исправлена и стала честной!');
      console.log(`✅ Согласованный режим: "${statusAfter.status}"`);
      console.log('✅ Больше никакой лжи о full режиме');
      
      return {
        success: true,
        honest: true,
        mode: statusAfter.status,
        beforeStatus: statusBefore.status,
        afterStatus: statusAfter.status
      };
    } else {
      console.log('❌ ЧАСТИЧНЫЙ УСПЕХ: Требуется дополнительное исправление');
      console.log(`❌ Status: "${statusAfter.status}" vs Stats: "${statsAfter.mode || statsAfter.neuralMode}"`);
      
      return {
        success: false,
        honest: false,
        needsServerRestart: true,
        mode: statusAfter.status,
        recommendation: 'Требуется перезапуск сервера для полного исправления'
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
          // Если получили не JSON, это может быть 404 или другая ошибка
          resolve({ 
            success: false, 
            error: `HTTP ${res.statusCode}: ${responseData}`,
            statusCode: res.statusCode
          });
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

// Запуск немедленного сброса
if (require.main === module) {
  forceHonestResetImmediate()
    .then(result => {
      console.log('\n🏁 Немедленный сброс завершен');
      if (result.recommendation) {
        console.log(`💡 Рекомендация: ${result.recommendation}`);
      }
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.log('\n💥 Критическая ошибка:', error.message);
      process.exit(1);
    });
}

module.exports = { forceHonestResetImmediate };