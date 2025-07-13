/**
 * 🔍 КОМПЛЕКСНЫЙ АНАЛИЗ СИСТЕМЫ BOOOMERANGS
 * Анализируем все компоненты: нейросеть, семантику, API, интеграцию
 */

const fs = require('fs');
const path = require('path');

class SystemAnalyzer {
  constructor() {
    this.results = {
      neural: {},
      semantic: {},
      integration: {},
      api: {},
      issues: [],
      recommendations: []
    };
  }

  async analyze() {
    console.log('🔍 Запуск комплексного анализа системы BOOOMERANGS...\n');

    // Анализ нейросетевой части
    await this.analyzeNeuralSystem();

    // Анализ семантической системы
    await this.analyzeSemanticSystem();

    // Анализ API и интеграции
    await this.analyzeAPIIntegration();

    // Проверка файловой структуры
    await this.analyzeFileStructure();

    // Анализ противоречий
    await this.analyzeContradictions();

    // Генерация отчета и рекомендаций
    this.generateReport();
  }

  async analyzeNeuralSystem() {
    console.log('🧠 === АНАЛИЗ НЕЙРОСЕТЕВОЙ СИСТЕМЫ ===');

    try {
      // Проверяем API статусы
      const statusResponse = await this.makeAPICall('/api/neural/status');
      const statsResponse = await this.makeAPICall('/api/neural/stats');

      this.results.neural.status = statusResponse;
      this.results.neural.stats = statsResponse;

      console.log('📊 Neural Status API:', statusResponse?.status || 'ERROR');
      console.log('📊 Neural Stats API:', statsResponse?.stats?.mode || 'ERROR');

      // Выявляем противоречие
      if (statusResponse?.status !== statsResponse?.stats?.mode) {
        this.results.issues.push({
          type: 'CRITICAL',
          component: 'Neural API',
          issue: 'API endpoints return conflicting neural modes',
          details: `Status API: ${statusResponse?.status}, Stats API: ${statsResponse?.stats?.mode}`,
          impact: 'Users see incorrect neural network state in UI'
        });
      }

      // Анализируем файлы нейросети
      const neuralFiles = [
        'server/neural-network-core.cjs',
        'server/neural-network-lite.cjs',
        'server/neural-integration.cjs',
        'server/neural-api-routes.js'
      ];

      for (const file of neuralFiles) {
        const exists = fs.existsSync(file);
        console.log(`📄 ${file}: ${exists ? '✅ EXISTS' : '❌ MISSING'}`);
        
        if (exists) {
          const content = fs.readFileSync(file, 'utf8');
          const lines = content.split('\n').length;
          console.log(`   Lines: ${lines}, Size: ${Math.round(content.length / 1024)}KB`);
          
          // Проверяем ключевые компоненты
          if (file.includes('neural-integration.cjs')) {
            const hasLiteMode = content.includes("mode === 'lite'");
            const hasFullMode = content.includes("mode === 'full'");
            console.log(`   Lite mode support: ${hasLiteMode ? '✅' : '❌'}`);
            console.log(`   Full mode support: ${hasFullMode ? '✅' : '❌'}`);
          }
        }
      }

    } catch (error) {
      console.error('❌ Ошибка анализа нейросети:', error.message);
      this.results.neural.error = error.message;
    }

    console.log('');
  }

  async analyzeSemanticSystem() {
    console.log('🔬 === АНАЛИЗ СЕМАНТИЧЕСКОЙ СИСТЕМЫ ===');

    try {
      // Проверяем основные семантические модули
      const semanticModules = [
        'server/semantic-memory/index.cjs',
        'server/conversation-engine.cjs',
        'server/semantic-analyzer.cjs',
        'server/natural-language-generator.cjs',
        'server/meta-semantic-engine.cjs',
        'server/emotional-semantic-matrix.cjs'
      ];

      let availableModules = 0;
      let totalModules = semanticModules.length;

      for (const module of semanticModules) {
        const exists = fs.existsSync(module);
        console.log(`📦 ${path.basename(module)}: ${exists ? '✅ EXISTS' : '❌ MISSING'}`);
        
        if (exists) {
          availableModules++;
          try {
            // Пытаемся загрузить модуль
            delete require.cache[require.resolve(`./${module}`)];
            const loaded = require(`./${module}`);
            console.log(`   Loading: ✅ SUCCESS`);
            
            // Проверяем экспорты
            const exports = Object.keys(loaded);
            console.log(`   Exports: ${exports.length > 0 ? exports.slice(0, 3).join(', ') : 'NONE'}`);
            
          } catch (loadError) {
            console.log(`   Loading: ❌ ERROR - ${loadError.message.substring(0, 50)}`);
            this.results.issues.push({
              type: 'ERROR',
              component: 'Semantic Module',
              issue: `Module ${module} fails to load`,
              details: loadError.message,
              impact: 'Semantic functionality degraded'
            });
          }
        }
      }

      this.results.semantic.moduleAvailability = `${availableModules}/${totalModules}`;
      console.log(`📊 Module Availability: ${availableModules}/${totalModules} (${Math.round(availableModules/totalModules*100)}%)`);

      // Тестируем семантический API
      const chatResponse = await this.makeAPICall('/api/ai/chat', 'POST', {
        message: 'тест семантической системы'
      });

      if (chatResponse?.success) {
        console.log('💬 Chat API: ✅ WORKING');
        this.results.semantic.chatAPI = 'working';
      } else {
        console.log('💬 Chat API: ❌ ERROR');
        this.results.semantic.chatAPI = 'error';
        this.results.issues.push({
          type: 'CRITICAL',
          component: 'Chat API',
          issue: 'Chat API not responding correctly',
          details: chatResponse?.error || 'Unknown error',
          impact: 'Users cannot interact with AI system'
        });
      }

    } catch (error) {
      console.error('❌ Ошибка анализа семантики:', error.message);
      this.results.semantic.error = error.message;
    }

    console.log('');
  }

  async analyzeAPIIntegration() {
    console.log('🔗 === АНАЛИЗ API И ИНТЕГРАЦИИ ===');

    try {
      // Проверяем основные API endpoints
      const endpoints = [
        { path: '/api/neural/status', method: 'GET' },
        { path: '/api/neural/stats', method: 'GET' },
        { path: '/api/ai/chat', method: 'POST', body: { message: 'test' } }
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await this.makeAPICall(endpoint.path, endpoint.method, endpoint.body);
          const status = response?.success ? '✅ OK' : '❌ ERROR';
          console.log(`🌐 ${endpoint.method} ${endpoint.path}: ${status}`);
          
          if (endpoint.path === '/api/neural/status' && response) {
            console.log(`   Status: ${response.status}, Progress: ${response.progress}%`);
          }
          if (endpoint.path === '/api/neural/stats' && response?.stats) {
            console.log(`   Mode: ${response.stats.mode}, Layers: ${response.stats.layers}, Params: ${response.stats.parameters}`);
          }
        } catch (error) {
          console.log(`🌐 ${endpoint.method} ${endpoint.path}: ❌ ERROR - ${error.message}`);
        }
      }

      // Проверяем routes.ts
      const routesPath = 'server/routes.ts';
      if (fs.existsSync(routesPath)) {
        const content = fs.readFileSync(routesPath, 'utf8');
        const hasNeuralRoutes = content.includes('/api/neural');
        const hasChatRoutes = content.includes('/api/ai/chat');
        
        console.log(`📄 Routes Configuration:`);
        console.log(`   Neural routes: ${hasNeuralRoutes ? '✅' : '❌'}`);
        console.log(`   Chat routes: ${hasChatRoutes ? '✅' : '❌'}`);

        this.results.integration.routes = {
          neural: hasNeuralRoutes,
          chat: hasChatRoutes
        };
      }

    } catch (error) {
      console.error('❌ Ошибка анализа API:', error.message);
      this.results.integration.error = error.message;
    }

    console.log('');
  }

  async analyzeFileStructure() {
    console.log('📁 === АНАЛИЗ ФАЙЛОВОЙ СТРУКТУРЫ ===');

    const criticalFiles = [
      'server/index.ts',
      'server/routes.ts',
      'server/neural-integration.cjs',
      'server/semantic-memory/index.cjs',
      'client/src/pages/SmartChatPage.tsx',
      'replit.md'
    ];

    for (const file of criticalFiles) {
      const exists = fs.existsSync(file);
      console.log(`📄 ${file}: ${exists ? '✅' : '❌'}`);
      
      if (exists) {
        const stats = fs.statSync(file);
        const size = Math.round(stats.size / 1024);
        const modified = stats.mtime.toISOString().split('T')[0];
        console.log(`   Size: ${size}KB, Modified: ${modified}`);
      }
    }

    // Проверяем модели на диске
    const modelPaths = [
      './neural-models/booomerangs-transformer/',
      './neural-models/booomerangs-lite/'
    ];

    for (const modelPath of modelPaths) {
      if (fs.existsSync(modelPath)) {
        const files = fs.readdirSync(modelPath);
        const hasModel = files.includes('model.json');
        const hasWeights = files.some(f => f.includes('weights') || f.includes('.bin'));
        
        console.log(`🧠 ${modelPath}:`);
        console.log(`   Model file: ${hasModel ? '✅' : '❌'}`);
        console.log(`   Weights: ${hasWeights ? '✅' : '❌'}`);
        console.log(`   Files: ${files.length}`);
      } else {
        console.log(`🧠 ${modelPath}: ❌ NOT FOUND`);
      }
    }

    console.log('');
  }

  async analyzeContradictions() {
    console.log('⚠️ === АНАЛИЗ ПРОТИВОРЕЧИЙ ===');

    const contradictions = [];

    // Противоречие в нейросетевых статусах
    if (this.results.neural.status?.status !== this.results.neural.stats?.stats?.mode) {
      contradictions.push({
        type: 'Neural API Mismatch',
        issue: 'Status and Stats APIs return different neural modes',
        status_api: this.results.neural.status?.status,
        stats_api: this.results.neural.stats?.stats?.mode,
        severity: 'HIGH'
      });
    }

    // Проверяем заявления в replit.md
    if (fs.existsSync('replit.md')) {
      const replitContent = fs.readFileSync('replit.md', 'utf8');
      
      // Ищем заявления о полной нейросети
      const claimsFullModel = replitContent.includes('полная модель (12 слоев, 115M параметров) функционирует');
      const actuallyUsesLite = this.results.neural.stats?.stats?.mode === 'lite';
      
      if (claimsFullModel && actuallyUsesLite) {
        contradictions.push({
          type: 'Documentation vs Reality',
          issue: 'replit.md claims full model works, but system uses lite',
          documentation: 'Claims 12 layers, 115M parameters',
          reality: `Actually ${this.results.neural.stats?.stats?.layers} layers, ${this.results.neural.stats?.stats?.parameters}`,
          severity: 'HIGH'
        });
      }
    }

    this.results.contradictions = contradictions;

    contradictions.forEach((contradiction, index) => {
      console.log(`${index + 1}. ${contradiction.type} (${contradiction.severity})`);
      console.log(`   Issue: ${contradiction.issue}`);
      if (contradiction.status_api) console.log(`   Status API: ${contradiction.status_api}`);
      if (contradiction.stats_api) console.log(`   Stats API: ${contradiction.stats_api}`);
      if (contradiction.documentation) console.log(`   Documentation: ${contradiction.documentation}`);
      if (contradiction.reality) console.log(`   Reality: ${contradiction.reality}`);
      console.log('');
    });

    console.log('');
  }

  generateReport() {
    console.log('📋 === ИТОГОВЫЙ ОТЧЕТ ===');

    // Статус компонентов
    console.log('🎯 СТАТУС КОМПОНЕНТОВ:');
    console.log(`   Neural System: ${this.getNeuralSystemStatus()}`);
    console.log(`   Semantic System: ${this.getSemanticSystemStatus()}`);
    console.log(`   API Integration: ${this.getAPIStatus()}`);
    console.log('');

    // Критические проблемы
    const criticalIssues = this.results.issues.filter(i => i.type === 'CRITICAL');
    console.log(`🚨 КРИТИЧЕСКИЕ ПРОБЛЕМЫ: ${criticalIssues.length}`);
    criticalIssues.forEach((issue, index) => {
      console.log(`   ${index + 1}. ${issue.component}: ${issue.issue}`);
      console.log(`      Impact: ${issue.impact}`);
    });
    console.log('');

    // Рекомендации
    this.generateRecommendations();
    console.log('💡 РЕКОМЕНДАЦИИ:');
    this.results.recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec.action}`);
      console.log(`      Priority: ${rec.priority}`);
      console.log(`      Expected Impact: ${rec.impact}`);
      console.log('');
    });

    // Сохраняем отчет в файл
    this.saveReport();
  }

  generateRecommendations() {
    const recommendations = [];

    // Исправление противоречий в API
    if (this.results.contradictions.some(c => c.type === 'Neural API Mismatch')) {
      recommendations.push({
        action: 'Унифицировать neural API endpoints - сделать status и stats консистентными',
        priority: 'HIGH',
        impact: 'Устранит путаницу в интерфейсе пользователя',
        implementation: 'Обновить neural-api-routes.js для возврата одинаковых статусов'
      });
    }

    // Исправление документации
    if (this.results.contradictions.some(c => c.type === 'Documentation vs Reality')) {
      recommendations.push({
        action: 'Обновить документацию в replit.md в соответствии с реальным состоянием',
        priority: 'MEDIUM',
        impact: 'Честное отражение возможностей системы',
        implementation: 'Изменить описания на актуальные характеристики lite модели'
      });
    }

    // Починка семантической системы
    if (this.results.semantic.chatAPI === 'error') {
      recommendations.push({
        action: 'Исправить семантическую систему для работы chat API',
        priority: 'HIGH',
        impact: 'Восстановит основную функциональность ИИ чата',
        implementation: 'Отладить conversation-engine и semantic-router интеграцию'
      });
    }

    // Реализация настоящей полной модели
    if (this.results.neural.stats?.stats?.mode === 'lite') {
      recommendations.push({
        action: 'Реализовать настоящую полную нейросеть или честно документировать lite систему',
        priority: 'MEDIUM',
        impact: 'Либо получить заявленную функциональность, либо установить реалистичные ожидания',
        implementation: 'Завершить разработку full модели ИЛИ переписать документацию под lite'
      });
    }

    this.results.recommendations = recommendations;
  }

  getNeuralSystemStatus() {
    if (this.results.neural.error) return '❌ ERROR';
    if (this.results.contradictions.some(c => c.type === 'Neural API Mismatch')) return '⚠️ INCONSISTENT';
    if (this.results.neural.status?.success && this.results.neural.stats?.success) return '✅ WORKING';
    return '❓ UNKNOWN';
  }

  getSemanticSystemStatus() {
    if (this.results.semantic.error) return '❌ ERROR';
    if (this.results.semantic.chatAPI === 'error') return '❌ BROKEN';
    if (this.results.semantic.moduleAvailability) {
      const [available, total] = this.results.semantic.moduleAvailability.split('/').map(Number);
      if (available === total) return '✅ WORKING';
      if (available > total * 0.7) return '⚠️ PARTIAL';
      return '❌ DEGRADED';
    }
    return '❓ UNKNOWN';
  }

  getAPIStatus() {
    if (this.results.integration.error) return '❌ ERROR';
    if (this.results.integration.routes?.neural && this.results.integration.routes?.chat) return '✅ CONFIGURED';
    return '⚠️ PARTIAL';
  }

  async makeAPICall(endpoint, method = 'GET', body = null) {
    try {
      const url = `http://localhost:5000${endpoint}`;
      const options = {
        method,
        headers: { 'Content-Type': 'application/json' }
      };
      
      if (body && method === 'POST') {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(url, options);
      return await response.json();
    } catch (error) {
      return { error: error.message };
    }
  }

  saveReport() {
    const reportPath = './system-analysis-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`📄 Полный отчет сохранен в: ${reportPath}`);
  }
}

// Запуск анализа
async function runAnalysis() {
  try {
    const analyzer = new SystemAnalyzer();
    await analyzer.analyze();
  } catch (error) {
    console.error('❌ Критическая ошибка анализа:', error);
  }
}

// Если файл запущен напрямую
if (require.main === module) {
  runAnalysis();
}

module.exports = { SystemAnalyzer };