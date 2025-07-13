/**
 * 🛠️ ФИНАЛЬНОЕ ИСПРАВЛЕНИЕ ЧЕСТНОСТИ NEURAL INTEGRATION
 * Принудительно сбрасывает систему к честному состоянию lite модели
 */

const http = require('http');
const { Worker } = require('worker_threads');

async function fixNeuralHonestyFinal() {
  console.log('🛠️ ФИНАЛЬНОЕ ИСПРАВЛЕНИЕ ЧЕСТНОСТИ NEURAL INTEGRATION');
  console.log('=====================================================');

  try {
    console.log('\n1. Анализируем проблему честности...');
    
    // Проверяем текущее состояние
    const statusBefore = await makeRequest('/api/neural/status');
    const statsBefore = await makeRequest('/api/neural/stats');
    
    console.log(`  Status API сообщает: ${statusBefore.status}`);
    console.log(`  Stats API сообщает: ${statsBefore.mode || statsBefore.neuralMode}`);
    console.log(`  Реальные слои: ${statsBefore.layers || 'unknown'}`);
    console.log(`  Реальные параметры: ${statsBefore.parameters || 'unknown'}`);
    
    const isLying = statusBefore.status === 'full' && statsBefore.layers < 12;
    
    if (!isLying) {
      console.log('✅ Система уже честна, исправление не требуется');
      return { success: true, message: 'Already honest' };
    }
    
    console.log('❌ ОБНАРУЖЕНА ЛОЖЬ: Status сообщает "full", но реально работает lite модель');
    console.log('\n2. Начинаем принудительное исправление...');
    
    // Отправляем специальный POST запрос на честную инициализацию
    console.log('\n  2.1. Принудительная реинициализация lite модели...');
    const honestInit = await makePostRequest('/api/neural/initialize-lite', {
      forceHonest: true,
      resetToLite: true
    });
    
    console.log(`     Результат инициализации: ${honestInit.success ? 'успешно' : 'ошибка'}`);
    if (honestInit.message) {
      console.log(`     Сообщение: ${honestInit.message}`);
    }
    
    // Ждем стабилизации состояния
    console.log('\n  2.2. Ожидание стабилизации системы...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Проверяем результат исправления
    console.log('\n3. Проверяем результат исправления...');
    const statusAfter = await makeRequest('/api/neural/status');
    const statsAfter = await makeRequest('/api/neural/stats');
    
    console.log(`  Status API после исправления: ${statusAfter.status}`);
    console.log(`  Stats API после исправления: ${statsAfter.mode || statsAfter.neuralMode}`);
    console.log(`  Слои после исправления: ${statsAfter.layers || 'unknown'}`);
    
    const isNowHonest = statusAfter.status === (statsAfter.mode || statsAfter.neuralMode);
    
    console.log('\n🎯 РЕЗУЛЬТАТ ФИНАЛЬНОГО ИСПРАВЛЕНИЯ:');
    if (isNowHonest) {
      console.log('✅ УСПЕХ: Система стала честной!');
      console.log(`✅ Оба API согласованно сообщают: "${statusAfter.status}"`);
      console.log('✅ Ложные заявления о "full" режиме устранены');
      
      return {
        success: true,
        message: 'Neural system is now honest',
        statusMode: statusAfter.status,
        statsMode: statsAfter.mode || statsAfter.neuralMode,
        actualLayers: statsAfter.layers
      };
    } else {
      console.log('❌ НЕУДАЧА: Система продолжает лгать');
      console.log(`❌ Status: "${statusAfter.status}" vs Stats: "${statsAfter.mode || statsAfter.neuralMode}"`);
      console.log('❌ Требуется перезапуск сервера для полного исправления');
      
      return {
        success: false,
        message: 'Honesty fix failed, server restart needed',
        statusMode: statusAfter.status,
        statsMode: statsAfter.mode || statsAfter.neuralMode,
        recommendation: 'Перезапустите сервер для применения изменений'
      };
    }

  } catch (error) {
    console.log(`❌ Критическая ошибка исправления: ${error.message}`);
    return { 
      success: false, 
      error: error.message,
      recommendation: 'Проверьте доступность сервера'
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

// Запуск исправления
if (require.main === module) {
  fixNeuralHonestyFinal()
    .then(result => {
      console.log('\n🏁 Финальное исправление завершено');
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

module.exports = { fixNeuralHonestyFinal };