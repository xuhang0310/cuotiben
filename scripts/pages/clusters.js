/**
 * 聚类分析页面脚本
 * 处理错题聚类分析和可视化功能
 */

(function() {
  'use strict';

  /**
   * 聚类分析页面控制器
   */
  class ClustersPageController {
    constructor() {
      this.clusters = [];
      this.currentView = 'overview';
      this.selectedCluster = null;
      this.analysisData = null;
      this.init();
    }

    /**
     * 初始化页面
     */
    init() {
      console.log('🔍 初始化聚类分析页面');
      
      // 绑定事件
      this.bindEvents();
      
      // 加载聚类数据
      this.loadClustersData();
      
      // 初始化图表
      this.initCharts();
    }

    /**
     * 绑定事件
     */
    bindEvents() {
      // 视图切换
      const viewTabs = document.querySelectorAll('.view-tab');
      viewTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
          this.switchView(e.target.dataset.view);
        });
      });

      // 重新分析按钮
      const reanalyzeBtn = document.querySelector('#reanalyze-btn');
      if (reanalyzeBtn) {
        reanalyzeBtn.addEventListener('click', () => {
          this.reanalyze();
        });
      }

      // 导出按钮
      const exportBtn = document.querySelector('#export-btn');
      if (exportBtn) {
        exportBtn.addEventListener('click', () => {
          this.exportAnalysis();
        });
      }

      // 聚类参数调整
      const clusterCountSlider = document.querySelector('#cluster-count-slider');
      if (clusterCountSlider) {
        clusterCountSlider.addEventListener('input', (e) => {
          this.updateClusterCount(e.target.value);
        });
      }

      // 相似度阈值调整
      const similaritySlider = document.querySelector('#similarity-slider');
      if (similaritySlider) {
        similaritySlider.addEventListener('input', (e) => {
          this.updateSimilarityThreshold(e.target.value);
        });
      }

      // 聚类方法选择
      const methodSelect = document.querySelector('#clustering-method');
      if (methodSelect) {
        methodSelect.addEventListener('change', (e) => {
          this.updateClusteringMethod(e.target.value);
        });
      }

      // 特征权重调整
      const weightSliders = document.querySelectorAll('.weight-slider');
      weightSliders.forEach(slider => {
        slider.addEventListener('input', (e) => {
          this.updateFeatureWeight(e.target.dataset.feature, e.target.value);
        });
      });
    }

    /**
     * 加载聚类数据
     */
    async loadClustersData() {
      try {
        console.log('📊 加载聚类数据...');
        
        this.showLoading();
        
        let data = null;
        if (window.questionManager) {
          data = await window.questionManager.getClustersAnalysis();
        } else {
          // 模拟聚类数据
          data = this.generateMockClustersData();
        }
        
        this.clusters = data.clusters;
        this.analysisData = data.analysis;
        
        // 渲染数据
        this.renderClustersOverview();
        this.renderAnalysisResults();
        
        console.log('✅ 聚类数据加载完成');
        
      } catch (error) {
        console.error('❌ 加载聚类数据失败:', error);
        this.showError('加载数据失败，请稍后重试');
      } finally {
        this.hideLoading();
      }
    }

    /**
     * 生成模拟聚类数据
     */
    generateMockClustersData() {
      return {
        clusters: [
          {
            id: 1,
            name: '二次方程类',
            description: '涉及二次方程求解的题目',
            size: 23,
            center: { subject: '数学', difficulty: 'medium', tags: ['二次方程', '代数'] },
            questions: [
              { id: 1, content: '求解 x² - 5x + 6 = 0', similarity: 0.95 },
              { id: 2, content: '解方程 2x² + 3x - 1 = 0', similarity: 0.89 },
              { id: 3, content: '已知方程 x² + px + q = 0', similarity: 0.87 }
            ],
            characteristics: {
              commonMistakes: ['因式分解错误', '判别式计算错误'],
              avgDifficulty: 2.3,
              avgAccuracy: 0.67,
              practiceFrequency: 'high'
            }
          },
          {
            id: 2,
            name: '几何证明类',
            description: '几何图形证明相关题目',
            size: 18,
            center: { subject: '数学', difficulty: 'hard', tags: ['几何', '证明'] },
            questions: [
              { id: 4, content: '证明三角形全等', similarity: 0.92 },
              { id: 5, content: '证明四边形是平行四边形', similarity: 0.88 },
              { id: 6, content: '圆的切线证明', similarity: 0.85 }
            ],
            characteristics: {
              commonMistakes: ['证明步骤不完整', '定理应用错误'],
              avgDifficulty: 3.1,
              avgAccuracy: 0.54,
              practiceFrequency: 'medium'
            }
          },
          {
            id: 3,
            name: '英语语法类',
            description: '英语语法相关错题',
            size: 31,
            center: { subject: '英语', difficulty: 'medium', tags: ['语法', '时态'] },
            questions: [
              { id: 7, content: '现在完成时用法', similarity: 0.91 },
              { id: 8, content: '被动语态转换', similarity: 0.86 },
              { id: 9, content: '虚拟语气应用', similarity: 0.83 }
            ],
            characteristics: {
              commonMistakes: ['时态混淆', '语态错误'],
              avgDifficulty: 2.5,
              avgAccuracy: 0.71,
              practiceFrequency: 'high'
            }
          },
          {
            id: 4,
            name: '物理力学类',
            description: '物理力学相关题目',
            size: 15,
            center: { subject: '物理', difficulty: 'hard', tags: ['力学', '运动'] },
            questions: [
              { id: 10, content: '牛顿第二定律应用', similarity: 0.94 },
              { id: 11, content: '动量守恒定律', similarity: 0.89 },
              { id: 12, content: '能量守恒计算', similarity: 0.87 }
            ],
            characteristics: {
              commonMistakes: ['受力分析错误', '公式应用错误'],
              avgDifficulty: 3.2,
              avgAccuracy: 0.49,
              practiceFrequency: 'low'
            }
          },
          {
            id: 5,
            name: '化学反应类',
            description: '化学反应方程式相关',
            size: 12,
            center: { subject: '化学', difficulty: 'medium', tags: ['化学反应', '方程式'] },
            questions: [
              { id: 13, content: '氧化还原反应配平', similarity: 0.90 },
              { id: 14, content: '酸碱中和反应', similarity: 0.85 },
              { id: 15, content: '有机反应机理', similarity: 0.82 }
            ],
            characteristics: {
              commonMistakes: ['配平错误', '反应条件遗漏'],
              avgDifficulty: 2.7,
              avgAccuracy: 0.63,
              practiceFrequency: 'medium'
            }
          }
        ],
        analysis: {
          totalQuestions: 99,
          clustersCount: 5,
          avgSilhouetteScore: 0.73,
          clusteringMethod: 'k-means',
          features: {
            subject: { weight: 0.3, importance: 'high' },
            difficulty: { weight: 0.25, importance: 'high' },
            tags: { weight: 0.2, importance: 'medium' },
            content: { weight: 0.15, importance: 'medium' },
            mistakes: { weight: 0.1, importance: 'low' }
          },
          insights: [
            '数学题目占比最高，需要重点关注',
            '几何证明类题目正确率最低，建议加强练习',
            '英语语法类题目数量多但相对简单',
            '物理力学类题目难度高，需要系统复习'
          ],
          recommendations: [
            '优先练习几何证明类题目，提高正确率',
            '加强物理力学基础概念理解',
            '定期复习英语语法规则',
            '建立错题本，记录常见错误模式'
          ]
        }
      };
    }

    /**
     * 渲染聚类概览
     */
    renderClustersOverview() {
      const container = document.querySelector('.clusters-overview');
      if (!container) return;

      const html = `
        <div class="overview-stats">
          <div class="stat-card">
            <div class="stat-value">${this.analysisData.totalQuestions}</div>
            <div class="stat-label">总题目数</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${this.analysisData.clustersCount}</div>
            <div class="stat-label">聚类数量</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${(this.analysisData.avgSilhouetteScore * 100).toFixed(1)}%</div>
            <div class="stat-label">聚类质量</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${this.analysisData.clusteringMethod}</div>
            <div class="stat-label">聚类方法</div>
          </div>
        </div>
        
        <div class="clusters-grid">
          ${this.clusters.map(cluster => this.renderClusterCard(cluster)).join('')}
        </div>
      `;

      container.innerHTML = html;
    }

    /**
     * 渲染聚类卡片
     */
    renderClusterCard(cluster) {
      const difficultyColor = this.getDifficultyColor(cluster.characteristics.avgDifficulty);
      const accuracyColor = this.getAccuracyColor(cluster.characteristics.avgAccuracy);
      
      return `
        <div class="cluster-card" data-cluster-id="${cluster.id}" onclick="window.clustersController.selectCluster(${cluster.id})">
          <div class="cluster-header">
            <h3 class="cluster-name">${cluster.name}</h3>
            <div class="cluster-size">${cluster.size} 题</div>
          </div>
          
          <div class="cluster-description">
            ${cluster.description}
          </div>
          
          <div class="cluster-metrics">
            <div class="metric">
              <span class="metric-label">平均难度:</span>
              <span class="metric-value" style="color: ${difficultyColor}">
                ${cluster.characteristics.avgDifficulty.toFixed(1)}
              </span>
            </div>
            <div class="metric">
              <span class="metric-label">正确率:</span>
              <span class="metric-value" style="color: ${accuracyColor}">
                ${(cluster.characteristics.avgAccuracy * 100).toFixed(1)}%
              </span>
            </div>
            <div class="metric">
              <span class="metric-label">练习频率:</span>
              <span class="metric-value">${this.getFrequencyText(cluster.characteristics.practiceFrequency)}</span>
            </div>
          </div>
          
          <div class="cluster-tags">
            ${cluster.center.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
          </div>
          
          <div class="cluster-mistakes">
            <div class="mistakes-title">常见错误:</div>
            <ul class="mistakes-list">
              ${cluster.characteristics.commonMistakes.map(mistake => `<li>${mistake}</li>`).join('')}
            </ul>
          </div>
        </div>
      `;
    }

    /**
     * 渲染分析结果
     */
    renderAnalysisResults() {
      const container = document.querySelector('.analysis-results');
      if (!container) return;

      container.innerHTML = `
        <div class="analysis-section">
          <h3>特征权重分布</h3>
          <div class="features-weights">
            ${Object.entries(this.analysisData.features).map(([feature, data]) => `
              <div class="feature-weight">
                <div class="feature-info">
                  <span class="feature-name">${this.getFeatureName(feature)}</span>
                  <span class="feature-importance importance-${data.importance}">${this.getImportanceText(data.importance)}</span>
                </div>
                <div class="weight-bar">
                  <div class="weight-fill" style="width: ${data.weight * 100}%"></div>
                </div>
                <div class="weight-value">${(data.weight * 100).toFixed(1)}%</div>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="analysis-section">
          <h3>分析洞察</h3>
          <div class="insights-list">
            ${this.analysisData.insights.map(insight => `
              <div class="insight-item">
                <i class="icon-lightbulb"></i>
                <span>${insight}</span>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="analysis-section">
          <h3>学习建议</h3>
          <div class="recommendations-list">
            ${this.analysisData.recommendations.map((rec, index) => `
              <div class="recommendation-item">
                <div class="rec-number">${index + 1}</div>
                <div class="rec-content">${rec}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    /**
     * 选择聚类
     */
    selectCluster(clusterId) {
      console.log('🎯 选择聚类:', clusterId);
      
      this.selectedCluster = this.clusters.find(c => c.id === clusterId);
      
      // 更新选中状态
      document.querySelectorAll('.cluster-card').forEach(card => {
        card.classList.remove('selected');
      });
      document.querySelector(`[data-cluster-id="${clusterId}"]`).classList.add('selected');
      
      // 显示详细信息
      this.showClusterDetails(this.selectedCluster);
    }

    /**
     * 显示聚类详情
     */
    showClusterDetails(cluster) {
      const container = document.querySelector('.cluster-details');
      if (!container) return;

      container.innerHTML = `
        <div class="details-header">
          <h3>${cluster.name}</h3>
          <button class="close-details" onclick="this.parentElement.parentElement.style.display='none'">
            <i class="icon-x"></i>
          </button>
        </div>
        
        <div class="details-content">
          <div class="details-section">
            <h4>聚类信息</h4>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">题目数量:</span>
                <span class="info-value">${cluster.size}</span>
              </div>
              <div class="info-item">
                <span class="info-label">平均难度:</span>
                <span class="info-value">${cluster.characteristics.avgDifficulty.toFixed(1)}</span>
              </div>
              <div class="info-item">
                <span class="info-label">平均正确率:</span>
                <span class="info-value">${(cluster.characteristics.avgAccuracy * 100).toFixed(1)}%</span>
              </div>
              <div class="info-item">
                <span class="info-label">练习频率:</span>
                <span class="info-value">${this.getFrequencyText(cluster.characteristics.practiceFrequency)}</span>
              </div>
            </div>
          </div>
          
          <div class="details-section">
            <h4>代表性题目</h4>
            <div class="questions-list">
              ${cluster.questions.map(q => `
                <div class="question-item">
                  <div class="question-content">${q.content}</div>
                  <div class="question-similarity">相似度: ${(q.similarity * 100).toFixed(1)}%</div>
                  <div class="question-actions">
                    <button onclick="window.clustersController.viewQuestion(${q.id})" class="btn btn-sm">
                      查看详情
                    </button>
                    <button onclick="window.clustersController.practiceQuestion(${q.id})" class="btn btn-sm btn-primary">
                      开始练习
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
          
          <div class="details-section">
            <h4>常见错误分析</h4>
            <div class="mistakes-analysis">
              ${cluster.characteristics.commonMistakes.map(mistake => `
                <div class="mistake-item">
                  <i class="icon-alert-triangle"></i>
                  <span>${mistake}</span>
                </div>
              `).join('')}
            </div>
          </div>
          
          <div class="details-actions">
            <button onclick="window.clustersController.practiceCluster(${cluster.id})" class="btn btn-primary">
              <i class="icon-play"></i> 练习此类题目
            </button>
            <button onclick="window.clustersController.exportCluster(${cluster.id})" class="btn btn-secondary">
              <i class="icon-download"></i> 导出题目
            </button>
          </div>
        </div>
      `;
      
      container.style.display = 'block';
    }

    /**
     * 切换视图
     */
    switchView(view) {
      console.log('🔄 切换视图:', view);
      
      this.currentView = view;
      
      // 更新标签页状态
      document.querySelectorAll('.view-tab').forEach(tab => {
        tab.classList.remove('active');
      });
      document.querySelector(`[data-view="${view}"]`).classList.add('active');
      
      // 显示对应内容
      document.querySelectorAll('.view-content').forEach(content => {
        content.style.display = 'none';
      });
      document.querySelector(`#${view}-view`).style.display = 'block';
      
      // 根据视图加载相应数据
      switch (view) {
        case 'overview':
          this.renderClustersOverview();
          break;
        case 'analysis':
          this.renderAnalysisResults();
          break;
        case 'visualization':
          this.renderVisualization();
          break;
        case 'settings':
          this.renderSettings();
          break;
      }
    }

    /**
     * 渲染可视化
     */
    renderVisualization() {
      const container = document.querySelector('#visualization-view');
      if (!container) return;

      // 简单的散点图可视化
      container.innerHTML = `
        <div class="visualization-container">
          <div class="chart-header">
            <h3>聚类可视化</h3>
            <div class="chart-controls">
              <select id="x-axis-select">
                <option value="difficulty">难度</option>
                <option value="accuracy">正确率</option>
                <option value="size">题目数量</option>
              </select>
              <select id="y-axis-select">
                <option value="accuracy">正确率</option>
                <option value="difficulty">难度</option>
                <option value="frequency">练习频率</option>
              </select>
            </div>
          </div>
          
          <div class="scatter-chart">
            <svg id="cluster-chart" width="600" height="400">
              ${this.renderScatterPlot()}
            </svg>
          </div>
          
          <div class="chart-legend">
            ${this.clusters.map((cluster, index) => `
              <div class="legend-item">
                <div class="legend-color" style="background-color: ${this.getClusterColor(index)}"></div>
                <span class="legend-label">${cluster.name}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    /**
     * 渲染散点图
     */
    renderScatterPlot() {
      const width = 600;
      const height = 400;
      const margin = { top: 20, right: 20, bottom: 40, left: 60 };
      
      return this.clusters.map((cluster, index) => {
        const x = margin.left + (cluster.characteristics.avgDifficulty / 4) * (width - margin.left - margin.right);
        const y = height - margin.bottom - (cluster.characteristics.avgAccuracy * (height - margin.top - margin.bottom));
        const r = Math.sqrt(cluster.size) * 2;
        
        return `
          <circle 
            cx="${x}" 
            cy="${y}" 
            r="${r}" 
            fill="${this.getClusterColor(index)}" 
            opacity="0.7"
            stroke="#333"
            stroke-width="1"
            title="${cluster.name}: ${cluster.size}题, 难度${cluster.characteristics.avgDifficulty.toFixed(1)}, 正确率${(cluster.characteristics.avgAccuracy * 100).toFixed(1)}%"
          />
          <text 
            x="${x}" 
            y="${y + 4}" 
            text-anchor="middle" 
            font-size="10" 
            fill="white"
          >
            ${cluster.id}
          </text>
        `;
      }).join('');
    }

    /**
     * 渲染设置
     */
    renderSettings() {
      const container = document.querySelector('#settings-view');
      if (!container) return;

      container.innerHTML = `
        <div class="settings-container">
          <div class="settings-section">
            <h3>聚类参数</h3>
            
            <div class="setting-item">
              <label for="cluster-count-slider">聚类数量: <span id="cluster-count-value">${this.analysisData.clustersCount}</span></label>
              <input type="range" id="cluster-count-slider" min="2" max="10" value="${this.analysisData.clustersCount}">
            </div>
            
            <div class="setting-item">
              <label for="similarity-slider">相似度阈值: <span id="similarity-value">0.7</span></label>
              <input type="range" id="similarity-slider" min="0.1" max="1" step="0.1" value="0.7">
            </div>
            
            <div class="setting-item">
              <label for="clustering-method">聚类方法:</label>
              <select id="clustering-method">
                <option value="k-means" selected>K-Means</option>
                <option value="hierarchical">层次聚类</option>
                <option value="dbscan">DBSCAN</option>
              </select>
            </div>
          </div>
          
          <div class="settings-section">
            <h3>特征权重</h3>
            
            ${Object.entries(this.analysisData.features).map(([feature, data]) => `
              <div class="setting-item">
                <label for="${feature}-weight">${this.getFeatureName(feature)}: <span id="${feature}-weight-value">${(data.weight * 100).toFixed(0)}%</span></label>
                <input type="range" id="${feature}-weight" class="weight-slider" data-feature="${feature}" min="0" max="100" value="${data.weight * 100}">
              </div>
            `).join('')}
          </div>
          
          <div class="settings-actions">
            <button id="apply-settings-btn" class="btn btn-primary">
              <i class="icon-check"></i> 应用设置
            </button>
            <button id="reset-settings-btn" class="btn btn-secondary">
              <i class="icon-refresh-cw"></i> 重置默认
            </button>
          </div>
        </div>
      `;
    }

    /**
     * 重新分析
     */
    async reanalyze() {
      console.log('🔄 重新分析聚类');
      
      try {
        this.showLoading();
        
        // 重新加载数据
        await this.loadClustersData();
        
        // 切换到概览视图
        this.switchView('overview');
        
        this.showNotification('重新分析完成', 'success');
        
      } catch (error) {
        console.error('❌ 重新分析失败:', error);
        this.showError('重新分析失败');
      } finally {
        this.hideLoading();
      }
    }

    /**
     * 导出分析结果
     */
    exportAnalysis() {
      console.log('📤 导出分析结果');
      
      const exportData = {
        timestamp: new Date().toISOString(),
        clusters: this.clusters,
        analysis: this.analysisData,
        settings: {
          clusterCount: this.analysisData.clustersCount,
          method: this.analysisData.clusteringMethod
        }
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `clusters-analysis-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      this.showNotification('分析结果已导出', 'success');
    }

    /**
     * 查看题目
     */
    viewQuestion(questionId) {
      console.log('👁️ 查看题目:', questionId);
      
      if (window.app && window.app.router) {
        window.app.router.navigate(`/question/detail?id=${questionId}`);
      }
    }

    /**
     * 练习题目
     */
    practiceQuestion(questionId) {
      console.log('🎯 练习题目:', questionId);
      
      if (window.app && window.app.router) {
        window.app.router.navigate(`/practice?questionId=${questionId}`);
      }
    }

    /**
     * 练习聚类
     */
    practiceCluster(clusterId) {
      console.log('🎯 练习聚类:', clusterId);
      
      const cluster = this.clusters.find(c => c.id === clusterId);
      if (cluster) {
        const questionIds = cluster.questions.map(q => q.id);
        if (window.app && window.app.router) {
          window.app.router.navigate(`/practice?clusterQuestions=${questionIds.join(',')}`);
        }
      }
    }

    /**
     * 导出聚类
     */
    exportCluster(clusterId) {
      console.log('📤 导出聚类:', clusterId);
      
      const cluster = this.clusters.find(c => c.id === clusterId);
      if (cluster) {
        const exportData = {
          cluster: cluster,
          exportTime: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
          type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cluster-${cluster.name}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification(`聚类"${cluster.name}"已导出`, 'success');
      }
    }

    /**
     * 初始化图表
     */
    initCharts() {
      console.log('📊 初始化图表');
      // 如果有图表库，在这里初始化
    }

    // 辅助方法
    getDifficultyColor(difficulty) {
      if (difficulty < 2) return '#4caf50';
      if (difficulty < 3) return '#ff9800';
      return '#f44336';
    }

    getAccuracyColor(accuracy) {
      if (accuracy > 0.8) return '#4caf50';
      if (accuracy > 0.6) return '#ff9800';
      return '#f44336';
    }

    getFrequencyText(frequency) {
      const map = {
        'low': '低',
        'medium': '中',
        'high': '高'
      };
      return map[frequency] || frequency;
    }

    getFeatureName(feature) {
      const map = {
        'subject': '科目',
        'difficulty': '难度',
        'tags': '标签',
        'content': '内容',
        'mistakes': '错误'
      };
      return map[feature] || feature;
    }

    getImportanceText(importance) {
      const map = {
        'low': '低',
        'medium': '中',
        'high': '高'
      };
      return map[importance] || importance;
    }

    getClusterColor(index) {
      const colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'];
      return colors[index % colors.length];
    }

    // UI 方法
    showLoading() {
      if (window.UI && window.UI.loading) {
        window.UI.loading.show('分析中...');
      }
    }

    hideLoading() {
      if (window.UI && window.UI.loading) {
        window.UI.loading.hide();
      }
    }

    showError(message) {
      if (window.UI && window.UI.notification) {
        window.UI.notification.error(message);
      } else {
        alert(message);
      }
    }

    showNotification(message, type = 'info') {
      if (window.UI && window.UI.notification) {
        window.UI.notification[type](message);
      } else {
        alert(message);
      }
    }
  }

  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.clustersController = new ClustersPageController();
    });
  } else {
    window.clustersController = new ClustersPageController();
  }

  // 导出到全局
  window.ClustersPageController = ClustersPageController;

})();