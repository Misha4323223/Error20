/**
 * 🧪 ТЕСТ ОТСУТСТВИЯ АВТОМАТИЧЕСКОГО UPGRADE
 * Проверяем, что система больше не пытается автоматически перейти на full режим
 */

const http = require('http');

async function testNoAutoUpgrade() {
  console.log('🧪 ТЕСТ ОТСУТСТВИЯ АВТОМАТИЧЕСКОГО UPGRADE');
  console.log('=========================================');

  try {
    // Шаг 1: Проверяем начальное честное состояние
    console.log('\n1. Проверяем начальное состояние...');
    const initialStatus = await makeRequest('/api/neural/status');
    const initialStats = await makeRequest('/api/neural/stats');
    
    console.log(`  Начальный Status: ${initialStatus.status}`);
    console.log(`  Начальный Stats: ${initialStats.mode || initialStats.neuralMode}`);
    
    if (initialStatus.status !== 'lite' || (initialStats.mode || initialStats.neuralMode) !== 'lite') {
      console.log('❌ ОШИБКА: Система не в честном lite состоянии на старте');
      return { success: false, message: 'System not honest initially' };
    }
    
    // Шаг 2: Отправляем запрос в чат (это должно было раньше запускать auto-upgrade)
    console.log('\n2. Отправляем запрос в чат (раньше запускал автоupgrade)...');
    const chatResponse = await makePostRequest('/api/ai/chat', {
      message: 'Привет, расскажи о себе',
      sessionId: 'test-auto-upgrade-' + Date.now()
    });
    
    console.log(`  Чат ответ получен: ${chatResponse.reply ? 'да' : 'нет'}`);
    console.log(`  Длина ответа: ${chatResponse.reply?.length || 0} символов`);
    
    // Шаг 3: Ждем возможного срабатывания автоupgrade (раньше срабатывал через 1-2 сек)
    console.log('\n3. Ожидание возможного автоupgrade (5 секунд)...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Шаг 4: Проверяем, что состояние НЕ изменилось на full
    console.log('\n4. Проверяем, что автоupgrade НЕ сработал...');
    const finalStatus = await makeRequest('/api/neural/status');
    const finalStats = await makeRequest('/api/neural/stats');
    
    console.log(`  Финальный Status: ${finalStatus.status}`);
    console.log(`  Финальный Stats: ${finalStats.mode || finalStats.neuralMode}`);
    
    // Анализ результата
    const stayedHonest = finalStatus.status === 'lite' && (finalStats.mode || finalStats.neuralMode) === 'lite';
    const noAutoUpgrade = initialStatus.status === finalStatus.status;
    
    console.log('\n🎯 РЕЗУЛЬТАТ ТЕСТА АВТОUPGRADE:');
    if (stayedHonest && noAutoUpgrade) {
      console.log('✅ УСПЕХ: Автоматический upgrade отключен!');
      console.log('✅ Система осталась в честном lite режиме');
      console.log('✅ Никаких ложных заявлений о full режиме');
      console.log('✅ Чат работает, но не запускает upgrade');
      
      return {
        success: true,
        message: 'Auto-upgrade successfully disabled',
        initialMode: initialStatus.status,
        finalMode: finalStatus.status,
        chatWorking: !!chatResponse.reply
      };
    } else {
      console.log('❌ НЕУДАЧА: Автоматический upgrade все еще срабатывает');
      console.log(`❌ Изменение: ${initialStatus.status} → ${finalStatus.status}`);
      
      return {
        success: false,
        message: 'Auto-upgrade still active',
        initialMode: initialStatus.status,
        finalMode: finalStatus.status,
        unexpectedChange: initialStatus.status !== finalStatus.status
      };
    }

  } catch (error) {
    console.log(`❌ Ошибка теста автоupgrade: ${error.message}`);
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

// Запуск теста
if (require.main === module) {
  testNoAutoUpgrade()
    .then(result => {
      console.log('\n🏁 Тест автоupgrade завершен');
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.log('\n💥 Критическая ошибка теста:', error.message);
      process.exit(1);
    });
}

module.exports = { testNoAutoUpgrade };