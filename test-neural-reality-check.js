/**
 * 🔍 ДОСКОНАЛЬНАЯ ПРОВЕРКА РЕАЛЬНОСТИ НЕЙРОСЕТИ
 * Проверяем какая нейросеть (3 или 12 слоев) фактически отвечает в чате
 */

import fetch from 'node-fetch';

async function testNeuralReality() {
    console.log('🔍 ДОСКОНАЛЬНАЯ ПРОВЕРКА РЕАЛЬНОСТИ НЕЙРОСЕТИ');
    console.log('=' .repeat(60));
    
    try {
        // 1. Проверка статуса neural API
        console.log('\n1. 📊 ПРОВЕРКА СТАТУСА NEURAL API:');
        const statusResponse = await fetch('http://localhost:5000/api/neural/status');
        const statusData = await statusResponse.json();
        console.log('   Status API response:', JSON.stringify(statusData, null, 2));
        
        // 2. Проверка статистики neural API
        console.log('\n2. 📈 ПРОВЕРКА СТАТИСТИКИ NEURAL API:');
        const statsResponse = await fetch('http://localhost:5000/api/neural/stats');
        const statsData = await statsResponse.json();
        console.log('   Stats API response:', JSON.stringify(statsData, null, 2));
        
        // 3. Проверка dashboard статуса
        console.log('\n3. 🖥️ ПРОВЕРКА DASHBOARD СТАТУСА:');
        const dashboardResponse = await fetch('http://localhost:5000/api/neural/status/dashboard');
        const dashboardData = await dashboardResponse.json();
        console.log('   Dashboard response:', JSON.stringify(dashboardData, null, 2));
        
        // 4. Тестовые вопросы в чат
        console.log('\n4. 🤖 ТЕСТОВЫЕ ВОПРОСЫ В ЧАТ:');
        const testQuestions = [
            "Привет, как дела?",
            "Расскажи про искусственный интеллект",
            "Что такое нейронные сети?"
        ];
        
        for (const question of testQuestions) {
            console.log(`\n   Вопрос: "${question}"`);
            try {
                const chatResponse = await fetch('http://localhost:5000/api/ai/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        message: question,
                        forceNeuralIntegration: true 
                    })
                });
                
                const chatData = await chatResponse.json();
                console.log(`   Ответ (${chatData.reply?.length || 0} символов):`, 
                    chatData.reply?.substring(0, 100) + (chatData.reply?.length > 100 ? '...' : ''));
                console.log(`   Провайдер: ${chatData.provider}`);
                console.log(`   Модель: ${chatData.model}`);
                console.log(`   Уверенность: ${chatData.confidence}%`);
                
                // Анализ качества ответа
                if (chatData.reply) {
                    const words = chatData.reply.split(' ');
                    const uniqueWords = new Set(words);
                    const repetitionRatio = words.length / uniqueWords.size;
                    const hasMeaningfulContent = chatData.reply.length > 50 && repetitionRatio < 2;
                    
                    console.log(`   Качество: ${hasMeaningfulContent ? '✅ Осмысленный' : '❌ Бессмысленный'}`);
                    console.log(`   Коэффициент повторений: ${repetitionRatio.toFixed(2)}`);
                } else {
                    console.log('   Качество: ❌ Пустой ответ');
                }
                
            } catch (error) {
                console.log(`   ❌ Ошибка чата: ${error.message}`);
            }
        }
        
        // 5. Анализ несоответствий
        console.log('\n5. 🔍 АНАЛИЗ НЕСООТВЕТСТВИЙ:');
        
        const declaredMode = statusData.status || statusData.mode;
        const realMode = statsData.mode || statsData.status;
        
        if (declaredMode !== realMode) {
            console.log(`   ❌ НЕСООТВЕТСТВИЕ ОБНАРУЖЕНО!`);
            console.log(`   📋 Заявленный режим: ${declaredMode}`);
            console.log(`   🎯 Реальный режим: ${realMode}`);
        } else {
            console.log(`   ✅ Режимы совпадают: ${declaredMode}`);
        }
        
        // 6. Проверка параметров модели
        console.log('\n6. 🧠 ПРОВЕРКА ПАРАМЕТРОВ МОДЕЛИ:');
        if (statsData.parameters) {
            const params = statsData.parameters;
            console.log(`   Параметры: ${params.toLocaleString()}`);
            console.log(`   Слои: ${statsData.layers || 'неизвестно'}`);
            
            if (params > 100000000) {
                console.log(`   🎯 Это полная модель (115M+ параметров)`);
            } else if (params > 2000000) {
                console.log(`   ⚡ Это lite модель (2.4M параметров)`);
            } else {
                console.log(`   ❓ Неизвестный тип модели`);
            }
        }
        
        // 7. Финальный вердикт
        console.log('\n7. ⚖️ ФИНАЛЬНЫЙ ВЕРДИКТ:');
        console.log('=' .repeat(60));
        
        if (declaredMode === 'full' && realMode === 'full') {
            console.log('✅ СТАТУС: Заявлена и активна полная модель');
        } else if (declaredMode === 'full' && realMode === 'lite') {
            console.log('❌ ПРОБЛЕМА: Заявлена полная, но работает lite');
        } else if (declaredMode === 'lite' && realMode === 'lite') {
            console.log('✅ СТАТУС: Заявлена и активна lite модель');
        } else {
            console.log('❓ НЕОПРЕДЕЛЕННОСТЬ: Статусы не ясны');
        }
        
    } catch (error) {
        console.error('❌ Критическая ошибка проверки:', error.message);
    }
}

// Запуск проверки
testNeuralReality().catch(console.error);