/**
 * 🎯 ФИНАЛЬНЫЙ ТЕСТ НЕЙРОСЕТИ
 * Проверяем реальное состояние full модели после всех исправлений
 */

import fetch from 'node-fetch';

async function finalNeuralTest() {
    console.log('🎯 ФИНАЛЬНЫЙ ТЕСТ НЕЙРОСЕТИ ПОСЛЕ ИСПРАВЛЕНИЙ');
    console.log('='.repeat(60));
    
    // Ждем полной загрузки сервера
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    try {
        // 1. Проверяем статус нейросети
        console.log('\n1. 📊 ПРОВЕРКА СТАТУСА НЕЙРОСЕТИ:');
        const statusResponse = await fetch('http://localhost:5000/api/neural/status');
        const statusData = await statusResponse.json();
        
        const statsResponse = await fetch('http://localhost:5000/api/neural/stats');
        const statsData = await statsResponse.json();
        
        console.log('   Status API:', statusData.status);
        console.log('   Stats API:', statsData.stats?.mode);
        console.log('   Initialized:', statusData.initialized);
        console.log('   Layers:', statsData.stats?.layers);
        console.log('   Parameters:', statsData.stats?.parameters?.toLocaleString());
        
        // 2. Тестируем простые запросы
        console.log('\n2. 🧪 ТЕСТИРОВАНИЕ ПРОСТЫХ ЗАПРОСОВ:');
        const simpleTests = [
            { query: "Привет", expected: "greeting" },
            { query: "Как дела?", expected: "casual" },
            { query: "Спасибо", expected: "gratitude" }
        ];
        
        for (const test of simpleTests) {
            try {
                const response = await fetch('http://localhost:5000/api/ai/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: test.query })
                });
                
                const data = await response.json();
                
                console.log(`   "${test.query}":`);
                console.log(`     Response: ${data.response ? data.response.substring(0, 60) + '...' : 'EMPTY'}`);
                console.log(`     Provider: ${data.provider}`);
                console.log(`     Neural Mode: ${data.metadata?.neuralMode}`);
                console.log(`     Layers: ${data.metadata?.layersUsed}`);
                console.log(`     Quality: ${data.response && !data.response.includes('[object Object]') ? 'GOOD' : 'BAD'}`);
                
            } catch (error) {
                console.log(`   "${test.query}": ERROR - ${error.message}`);
            }
        }
        
        // 3. Тестируем сложные запросы
        console.log('\n3. 🧠 ТЕСТИРОВАНИЕ СЛОЖНЫХ ЗАПРОСОВ:');
        const complexTests = [
            { query: "Расскажи про искусственный интеллект", category: "AI" },
            { query: "Что такое вышивка?", category: "Embroidery" },
            { query: "Объясни квантовые компьютеры", category: "Science" }
        ];
        
        for (const test of complexTests) {
            try {
                const response = await fetch('http://localhost:5000/api/ai/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: test.query })
                });
                
                const data = await response.json();
                
                console.log(`   "${test.query}":`);
                console.log(`     Response: ${data.response ? data.response.substring(0, 80) + '...' : 'EMPTY'}`);
                console.log(`     Has [object Object]: ${data.response?.includes('[object Object]') ? 'YES (BAD)' : 'NO (GOOD)'}`);
                console.log(`     Provider: ${data.provider}`);
                console.log(`     Neural Mode: ${data.metadata?.neuralMode}`);
                console.log(`     Layers: ${data.metadata?.layersUsed}`);
                console.log(`     Response Length: ${data.response?.length || 0} chars`);
                
            } catch (error) {
                console.log(`   "${test.query}": ERROR - ${error.message}`);
            }
        }
        
        // 4. Инициализируем lite модель для сравнения
        console.log('\n4. 🚀 ИНИЦИАЛИЗАЦИЯ LITE МОДЕЛИ:');
        try {
            const initResponse = await fetch('http://localhost:5000/api/neural/init-lite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            
            const initData = await initResponse.json();
            console.log('   Init response:', initData.success ? 'SUCCESS' : 'FAILED');
            
            // Ждем инициализации
            await new Promise(resolve => setTimeout(resolve, 8000));
            
            // Проверяем статус после инициализации
            const afterInitStatus = await fetch('http://localhost:5000/api/neural/status');
            const afterInitData = await afterInitStatus.json();
            
            const afterInitStats = await fetch('http://localhost:5000/api/neural/stats');
            const afterInitStatsData = await afterInitStats.json();
            
            console.log('   Status after init:', afterInitData.status);
            console.log('   Mode after init:', afterInitStatsData.stats?.mode);
            console.log('   Layers after init:', afterInitStatsData.stats?.layers);
            
        } catch (error) {
            console.log('   Init error:', error.message);
        }
        
        // 5. Тестируем lite модель
        console.log('\n5. 🧪 ТЕСТИРОВАНИЕ LITE МОДЕЛИ:');
        const liteResponse = await fetch('http://localhost:5000/api/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: "Привет! Как дела?" })
        });
        
        const liteData = await liteResponse.json();
        console.log('   Lite response:', liteData.response ? liteData.response.substring(0, 60) + '...' : 'EMPTY');
        console.log('   Neural mode:', liteData.metadata?.neuralMode);
        console.log('   Layers:', liteData.metadata?.layersUsed);
        console.log('   Quality:', liteData.response && !liteData.response.includes('[object Object]') ? 'GOOD' : 'BAD');
        
        // 6. Пробуем upgrade to full
        console.log('\n6. 🚀 UPGRADE TO FULL:');
        try {
            const upgradeResponse = await fetch('http://localhost:5000/api/neural/upgrade-to-full', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            
            const upgradeData = await upgradeResponse.json();
            console.log('   Upgrade response:', upgradeData.success ? 'SUCCESS' : 'FAILED');
            
            if (upgradeData.success) {
                // Ждем завершения upgrade
                await new Promise(resolve => setTimeout(resolve, 15000));
                
                // Проверяем статус после upgrade
                const finalStatus = await fetch('http://localhost:5000/api/neural/status');
                const finalStatusData = await finalStatus.json();
                
                const finalStats = await fetch('http://localhost:5000/api/neural/stats');
                const finalStatsData = await finalStats.json();
                
                console.log('   Status after upgrade:', finalStatusData.status);
                console.log('   Mode after upgrade:', finalStatsData.stats?.mode);
                console.log('   Layers after upgrade:', finalStatsData.stats?.layers);
                
                // Финальный тест full модели
                console.log('\n7. 🎯 ФИНАЛЬНЫЙ ТЕСТ FULL МОДЕЛИ:');
                const fullTestResponse = await fetch('http://localhost:5000/api/ai/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: "Расскажи про нейросети подробно" })
                });
                
                const fullTestData = await fullTestResponse.json();
                console.log('   Full response:', fullTestData.response ? fullTestData.response.substring(0, 100) + '...' : 'EMPTY');
                console.log('   Has [object Object]:', fullTestData.response?.includes('[object Object]') ? 'YES (BAD)' : 'NO (GOOD)');
                console.log('   Neural mode:', fullTestData.metadata?.neuralMode);
                console.log('   Layers:', fullTestData.metadata?.layersUsed);
                console.log('   Provider:', fullTestData.metadata?.provider);
                console.log('   Response length:', fullTestData.response?.length || 0);
                
                // Анализ качества
                if (fullTestData.response) {
                    const words = fullTestData.response.split(' ');
                    const uniqueWords = new Set(words);
                    const repetitionRatio = words.length / uniqueWords.size;
                    
                    console.log('   Quality metrics:');
                    console.log('     Total words:', words.length);
                    console.log('     Unique words:', uniqueWords.size);
                    console.log('     Repetition ratio:', repetitionRatio.toFixed(2));
                    console.log('     Overall quality:', 
                        !fullTestData.response.includes('[object Object]') && 
                        repetitionRatio < 3 && 
                        words.length > 20 ? 'EXCELLENT' : 'NEEDS IMPROVEMENT');
                }
            }
            
        } catch (error) {
            console.log('   Upgrade error:', error.message);
        }
        
        // 8. Финальный вердикт
        console.log('\n8. 🏁 ФИНАЛЬНЫЙ ВЕРДИКТ:');
        console.log('='.repeat(60));
        
        // Итоговая проверка статуса
        const verdictStatus = await fetch('http://localhost:5000/api/neural/status');
        const verdictStatusData = await verdictStatus.json();
        
        const verdictStats = await fetch('http://localhost:5000/api/neural/stats');
        const verdictStatsData = await verdictStats.json();
        
        console.log('   Final Status API:', verdictStatusData.status);
        console.log('   Final Stats API:', verdictStatsData.stats?.mode);
        console.log('   Final Layers:', verdictStatsData.stats?.layers);
        console.log('   Final Parameters:', verdictStatsData.stats?.parameters?.toLocaleString());
        
        if (verdictStatusData.status === 'full' && verdictStatsData.stats?.mode === 'full' && verdictStatsData.stats?.layers === 12) {
            console.log('   🎉 ВЕРДИКТ: ПОЛНАЯ МОДЕЛЬ АКТИВНА И РАБОТАЕТ!');
        } else if (verdictStatusData.status === 'full' && verdictStatsData.stats?.mode === 'lite') {
            console.log('   ⚠️  ВЕРДИКТ: ЗАЯВЛЕН FULL СТАТУС, НО РАБОТАЕТ LITE МОДЕЛЬ');
        } else {
            console.log('   ❓ ВЕРДИКТ: СТАТУС НЕОПРЕДЕЛЕННЫЙ');
        }
        
    } catch (error) {
        console.error('❌ Критическая ошибка тестирования:', error.message);
    }
}

// Запуск теста
finalNeuralTest().catch(console.error);