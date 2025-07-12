/**
 * 🔬 ДЕТАЛЬНАЯ ОТЛАДКА ГЕНЕРАЦИИ НЕЙРОСЕТИ
 * Проверяем пошагово что происходит при генерации ответа
 */

import fetch from 'node-fetch';

async function testNeuralGeneration() {
    console.log('🔬 ДЕТАЛЬНАЯ ОТЛАДКА ГЕНЕРАЦИИ НЕЙРОСЕТИ');
    console.log('='.repeat(60));
    
    try {
        // 1. Прямой тест neural integration
        console.log('\n1. 🧠 ПРЯМОЙ ТЕСТ NEURAL INTEGRATION:');
        const testResponse = await fetch('http://localhost:5000/api/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                message: "Привет! Как дела?",
                debug: true,
                forceNeuralIntegration: true
            })
        });
        
        const testData = await testResponse.json();
        console.log('   Raw response:', JSON.stringify(testData, null, 2));
        
        // 2. Проверка логики conversation-engine
        console.log('\n2. 🤖 ТЕСТ CONVERSATION ENGINE:');
        const conversationResponse = await fetch('http://localhost:5000/api/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                message: "Расскажи про нейросети",
                provider: "ConversationEngine-Semantic",
                debug: true
            })
        });
        
        const conversationData = await conversationResponse.json();
        console.log('   Conversation response:', JSON.stringify(conversationData, null, 2));
        
        // 3. Проверка модели neural status
        console.log('\n3. 📊 АНАЛИЗ NEURAL STATUS:');
        const statusResponse = await fetch('http://localhost:5000/api/neural/status');
        const statusData = await statusResponse.json();
        
        const statsResponse = await fetch('http://localhost:5000/api/neural/stats');
        const statsData = await statsResponse.json();
        
        console.log('   Status declared:', statusData.status);
        console.log('   Stats actual:', statsData.stats?.mode);
        console.log('   Model initialized:', statusData.initialized);
        console.log('   Model layers:', statsData.stats?.layers);
        console.log('   Model parameters:', statsData.stats?.parameters);
        
        // 4. Проверка что модель отвечает хотя бы что-то
        console.log('\n4. 🧪 ПРОСТОЙ ТЕСТ ГЕНЕРАЦИИ:');
        const simpleTests = [
            "Привет",
            "Как дела?",
            "Что такое AI?",
            "Расскажи про вышивку"
        ];
        
        for (const test of simpleTests) {
            try {
                const response = await fetch('http://localhost:5000/api/ai/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        message: test,
                        timeout: 5000
                    })
                });
                
                const data = await response.json();
                
                console.log(`   "${test}":`, {
                    hasReply: !!data.reply,
                    replyLength: data.reply?.length || 0,
                    provider: data.provider,
                    model: data.model,
                    preview: data.reply?.substring(0, 50) + (data.reply?.length > 50 ? '...' : '')
                });
                
            } catch (error) {
                console.log(`   "${test}": ERROR - ${error.message}`);
            }
        }
        
        // 5. Проверка инициализации модели
        console.log('\n5. 🔍 ПРОВЕРКА ИНИЦИАЛИЗАЦИИ МОДЕЛИ:');
        try {
            const initResponse = await fetch('http://localhost:5000/api/neural/init-lite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            
            const initData = await initResponse.json();
            console.log('   Init response:', JSON.stringify(initData, null, 2));
            
            // Ждем инициализации
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Проверяем статус после инициализации
            const afterInitStatus = await fetch('http://localhost:5000/api/neural/status');
            const afterInitData = await afterInitStatus.json();
            console.log('   Status after init:', afterInitData.status);
            
        } catch (error) {
            console.log('   Init error:', error.message);
        }
        
        // 6. Проверка upgrade
        console.log('\n6. 🚀 ПРОВЕРКА UPGRADE TO FULL:');
        try {
            const upgradeResponse = await fetch('http://localhost:5000/api/neural/upgrade-to-full', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            
            const upgradeData = await upgradeResponse.json();
            console.log('   Upgrade response:', JSON.stringify(upgradeData, null, 2));
            
            if (upgradeData.success) {
                // Ждем завершения upgrade
                await new Promise(resolve => setTimeout(resolve, 10000));
                
                // Проверяем что модель действительно полная
                const fullStatusResponse = await fetch('http://localhost:5000/api/neural/status');
                const fullStatusData = await fullStatusResponse.json();
                
                const fullStatsResponse = await fetch('http://localhost:5000/api/neural/stats');
                const fullStatsData = await fullStatsResponse.json();
                
                console.log('   Status after upgrade:', fullStatusData.status);
                console.log('   Stats after upgrade:', fullStatsData.stats?.mode);
                console.log('   Layers after upgrade:', fullStatsData.stats?.layers);
                
                // КРИТИЧЕСКИЙ ТЕСТ: Проверяем что полная модель действительно генерирует ответы
                console.log('\n   🎯 КРИТИЧЕСКИЙ ТЕСТ FULL МОДЕЛИ:');
                const fullTestResponse = await fetch('http://localhost:5000/api/ai/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        message: "Расскажи про искусственный интеллект подробно",
                        forceNeuralIntegration: true,
                        debug: true
                    })
                });
                
                const fullTestData = await fullTestResponse.json();
                console.log('   Full model response:', {
                    hasReply: !!fullTestData.reply,
                    replyLength: fullTestData.reply?.length || 0,
                    provider: fullTestData.provider,
                    model: fullTestData.model,
                    preview: fullTestData.reply?.substring(0, 100) + (fullTestData.reply?.length > 100 ? '...' : '')
                });
                
                // Проверяем качество ответа
                if (fullTestData.reply) {
                    const words = fullTestData.reply.split(' ');
                    const uniqueWords = new Set(words);
                    const repetitionRatio = words.length / uniqueWords.size;
                    
                    console.log('   Quality analysis:', {
                        totalWords: words.length,
                        uniqueWords: uniqueWords.size,
                        repetitionRatio: repetitionRatio.toFixed(2),
                        quality: repetitionRatio < 2 && words.length > 10 ? 'Good' : 'Poor'
                    });
                }
            }
            
        } catch (error) {
            console.log('   Upgrade error:', error.message);
        }
        
        // 7. Финальный анализ
        console.log('\n7. 📝 ФИНАЛЬНЫЙ АНАЛИЗ:');
        
        const finalStatusResponse = await fetch('http://localhost:5000/api/neural/status');
        const finalStatusData = await finalStatusResponse.json();
        
        const finalStatsResponse = await fetch('http://localhost:5000/api/neural/stats');
        const finalStatsData = await finalStatsResponse.json();
        
        console.log('   Final status:', finalStatusData.status);
        console.log('   Final mode:', finalStatsData.stats?.mode);
        console.log('   Final layers:', finalStatsData.stats?.layers);
        console.log('   Final parameters:', finalStatsData.stats?.parameters);
        
        // Заключение
        console.log('\n🎯 ЗАКЛЮЧЕНИЕ:');
        console.log('='.repeat(60));
        
        if (finalStatusData.status === 'full' && finalStatsData.stats?.mode === 'full') {
            console.log('✅ СТАТУС: Полная модель активна и согласована');
        } else if (finalStatusData.status === 'full' && finalStatsData.stats?.mode === 'lite') {
            console.log('❌ ПРОБЛЕМА: Заявлен full статус, но работает lite модель');
        } else {
            console.log('❓ НЕОПРЕДЕЛЕННОСТЬ: Статусы не ясны');
        }
        
    } catch (error) {
        console.error('❌ Критическая ошибка тестирования:', error.message);
    }
}

// Запуск теста
testNeuralGeneration().catch(console.error);