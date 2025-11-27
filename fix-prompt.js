// 修复提示词工程入门101的简单脚本
const fs = require('fs');

// 读取当前文件
const content = fs.readFileSync('constants.ts', 'utf8');

// 找到提示词工程的content行并替换
const oldPattern = /(\s+content:\s+'# 提示词工程 101[^}]+isLearningPath:\s+true,)/s;
const newContent = `    estimatedDuration: 45,
    difficulty: 'beginner',
    prerequisites: ['基础电脑操作能力', '了解AI基本概念'],
    learningObjectives: [
      '掌握提示词工程的核心原理',
      '学会编写有效的提示词',
      '了解不同场景下的最佳实践',
      '能够独立解决常见的提示词问题',
      '掌握高级技巧和优化方法'
    ],
    sections: [
      {
        id: 'prompt-section-1',
        title: '第一章：提示词工程基础',
        content: '<h2>什么是提示词工程？</h2><p>提示词工程（Prompt Engineering）是指设计、优化和管理与大语言模型（LLM）交互的输入文本的艺术和科学。好的提示词能够显著提升AI的响应质量和准确性。</p><h2>为什么重要？</h2><p>在AI时代，提示词工程是每个人的必备技能。无论是开发者、产品经理、内容创作者还是普通用户，掌握提示词工程都能帮助你：</p><ul><li>🎯 <strong>提高效率</strong>：用更少的时间获得更好的结果</li><li>💡 <strong>激发创意</strong>：探索AI的更多可能性</li><li>🔍 <strong>精准控制</strong>：让AI按照你的意图输出内容</li><li>🚀 <strong>避免陷阱</strong>：减少误解和错误响应</li></ul><h2>AI模型的工作原理</h2><p>理解提示词工程，首先需要了解AI模型的基本工作方式：</p><div class="info-box"><p><strong>语言模型本质</strong>：大语言模型是基于海量文本数据训练的神经网络，通过预测下一个词来生成响应。它们不是真正"理解"语言，而是通过模式匹配来生成最可能的内容。</p></div><h2>提示词的黄金法则</h2><p>经过大量实践，我们总结出了以下黄金法则：</p><ol><li><strong>明确性原则</strong>：越具体越好，避免歧义</li><li><strong>上下文原则</strong>：提供足够的背景信息</li><li><strong>结构化原则</strong>：使用清晰的格式和层次</li><li><strong>示例原则</strong>：通过少量示例引导模型</li><li><strong>迭代原则</strong>：持续优化和测试</li></ol><h2>实践练习</h2><p><strong>小练习</strong>：尝试用不同的提示词询问AI同一个问题，观察结果的差异。</p><ul><li>模糊提问："帮我写个程序"</li><li>具体提问："用Python写一个计算器程序，支持加减乘除，要有输入验证和错误处理"</li></ul>',
        duration: 10,
        order: 1,
        isCompleted: false,
        quiz: [
          {
            id: 'quiz-1-1',
            question: '什么是提示词工程？',
            options: [
              '编写复杂的代码程序',
              '设计、优化和管理与AI交互的输入文本',
              '训练大语言模型',
              '管理数据库系统'
            ],
            correctAnswer: 1
          },
          {
            id: 'quiz-1-2',
            question: '以下哪个不是提示词工程的黄金法则？',
            options: [
              '明确性原则',
              '上下文原则',
              '随意性原则',
              '结构化原则'
            ],
            correctAnswer: 2
          }
        ]
      },
      {
        id: 'prompt-section-2',
        title: '第二章：核心技巧与策略',
        content: '<h2>清晰明确的技巧</h2><p>清晰的提示词应该包含以下要素：</p><ul><li><strong>目标明确</strong>：清楚说明你想要什么</li><li><strong>格式指定</strong>：定义输出的格式和结构</li><li><strong>约束条件</strong>：说明限制和边界</li><li><strong>质量标准</strong>：设定期望的质量水平</li></ul><h2>上下文构建</h2><p>好的上下文能够帮助AI更好地理解你的需求：</p><div class="example-box"><h3>示例：缺乏上下文</h3><p>"帮我分析这个数据"</p><h3>示例：有丰富上下文</h3><p>"我是一个数据分析师，需要分析销售数据。这是过去6个月的销售记录CSV文件，请帮我分析销售趋势、找出最佳销售月份，并提供具体的业务建议。请用表格形式展示主要发现。"</p></div><h2>角色扮演技巧</h2><p>通过让AI扮演特定角色，可以获得更专业的响应：</p><ul><li><strong>专家角色</strong>："作为资深前端工程师..."</li><li><strong>导师角色</strong>："想象你是一位编程导师..."</li><li><strong>批评者角色</strong>："请以代码审查的角度..."</li><li><strong>创意角色</strong>："作为一名创意总监..."</li></ul><h2>思维链技术</h2><p>引导AI逐步思考，而不是直接给出答案：</p><div class="technique-box"><h3>传统提问</h3><p>"12×25等于多少？"</p><h3>思维链提问</h3><p>"请一步一步计算12×25：1) 先分解计算 2) 展示每步结果 3) 给出最终答案"</p></div><h2>少样本学习</h2><p>通过少量示例引导AI理解任务模式：</p><pre><code>请按照以下格式转换用户输入：输入：我想学习Python 输出：学习目标：Python编程，建议时长：3个月，关键技能：语法基础、数据结构、Web开发 输入：想成为数据分析师 输出：学习目标：数据分析，建议时长：6个月，关键技能：统计学、Python/R、机器学习基础 输入：我想做UI设计 输出：学习目标：UI设计，建议时长：4个月，关键技能：设计软件、色彩理论、用户体验</code></pre>',
        duration: 12,
        order: 2,
        isCompleted: false,
        quiz: [
          {
            id: 'quiz-2-1',
            question: '以下哪种上下文描述最有效？',
            options: [
              '分析数据',
              '帮我分析销售数据',
              '作为数据分析师，分析过去6个月销售CSV数据的趋势，找出最佳月份，用表格展示',
              '看看这些数字'
            ],
            correctAnswer: 2
          },
          {
            id: 'quiz-2-2',
            question: '思维链技术的主要作用是什么？',
            options: [
              '让AI更快响应',
              '引导AI逐步思考，提高推理准确性',
              '减少token消耗',
              '增加回答的创意性'
            ],
            correctAnswer: 1
          }
        ]
      },
      {
        id: 'prompt-section-3',
        title: '第三章：实战应用场景',
        content: '<h2>代码生成场景</h2><p>在编程场景中，优秀的提示词应该包含：</p><div class="code-pattern"><h3>最佳实践模板</h3><pre><code># 角色和背景 作为一名资深[语言]开发者，我需要... # 具体需求 请创建一个[功能描述]，要求：1. 功能特性1 2. 功能特性2 3. 技术栈：[具体技术] # 输出格式 请提供：- 完整代码 - 使用说明 - 可能的改进建议</code></pre></div><h2>内容创作场景</h2><p>对于内容创作，重点关注结构和风格：</p><ul><li><strong>目标读者</strong>：明确内容的目标受众</li><li><strong>语调风格</strong>：正式、轻松、专业等</li><li><strong>内容结构</strong>：引言、主体、结论</li><li><strong>关键词要求</strong>：SEO考虑</li></ul><h2>问题解决场景</h2><p>让AI帮助解决问题时，提供充分的问题描述：</p><div class="problem-solving"><h3>问题描述框架</h3><ol><li><strong>现象描述</strong>：发生了什么问题</li><li><strong>环境信息</strong>：使用的技术栈、版本</li><li><strong>已尝试方案</strong>：已经试过的解决方法</li><li><strong>期望结果</strong>：希望达到的效果</li><li><strong>约束条件</strong>：时间、资源等限制</li></ol></div><h2>学习和教育场景</h2><p>用AI辅助学习时，注意以下技巧：</p><ul><li><strong>分层解释</strong>：从简单到复杂</li><li><strong>类比说明</strong>：用熟悉的概念类比新概念</li><li><strong>实例验证</strong>：通过例子巩固理解</li><li><strong>互动问答</strong>：鼓励进一步提问</li></ul><h2>数据分析场景</h2><p>对于数据分析任务，强调方法论：</p><ol><li><strong>数据理解</strong>：先描述数据的结构和含义</li><li><strong>分析目标</strong>：明确要回答的业务问题</li><li><strong>分析方法</strong>：指定使用的统计或分析方法</li><li><strong>结果解释</strong>：要求用业务语言解释技术结果</li></ol>',
        duration: 13,
        order: 3,
        isCompleted: false,
        quiz: [
          {
            id: 'quiz-3-1',
            question: '代码生成场景中，最重要的要素是？',
            options: [
              '代码的长度',
              '具体需求和技术栈',
              '代码的复杂度',
              '使用的编程语言'
            ],
            correctAnswer: 1
          },
          {
            id: 'quiz-3-2',
            question: '问题解决场景中，哪个描述是不必要的？',
            options: [
              '现象描述',
              '环境信息',
              '已尝试方案',
              '程序员的姓名'
            ],
            correctAnswer: 3
          }
        ]
      },
      {
        id: 'prompt-section-4',
        title: '第四章：高级技巧与优化',
        content: '<h2>迭代优化策略</h2><p>提示词工程是一个迭代过程：</p><div class="iteration-cycle"><h3>PDCA循环</h3><ul><li><strong>Plan</strong>：设计初始提示词</li><li><strong>Do</strong>：执行并获得响应</li><li><strong>Check</strong>：评估结果质量</li><li><strong>Act</strong>：优化和调整</li></ul></div><h2>温度和采样参数</h2><p>理解AI模型的参数对结果的影响：</p><ul><li><strong>Temperature</strong>：控制输出的随机性<ul><li>低值（0.1-0.3）：准确、一致性</li><li>中值（0.5-0.7）：平衡、创意性</li><li>高值（0.8-1.0）：创造性、多样性</li></ul></li><li><strong>Top-p</strong>：核采样，控制候选词池</li><li><strong>Max Tokens</strong>：限制输出长度</li></ul><h2>提示词模板化</h2><p>创建可复用的提示词模板：</p><pre><code># [TASK_TYPE] 任务模板 ## 角色设定 你是一位专业的{ROLE}，在{DOMAIN}领域有{EXPERIENCE}经验。 ## 任务描述 {TASK_DESCRIPTION} ## 输出要求 - 格式：{OUTPUT_FORMAT} - 长度：{LENGTH_REQUIREMENT} - 语调：{TONE} - 关键要素：{KEY_ELEMENTS} ## 示例参考 {EXAMPLE}</code></pre><h2>多轮对话策略</h2><p>在长对话中保持上下文连贯：</p><ul><li><strong>状态维护</strong>：在每轮对话中简要回顾前文</li><li><strong>目标聚焦</strong>：避免话题偏离，适时拉回</li><li><strong>进展确认</strong>：定期确认理解和进展</li><li><strong>总结归纳</strong>：适时总结关键信息</li></ul><h2>错误处理和调试</h2><p>当AI响应不理想时的处理策略：</p><div class="troubleshooting"><h3>常见问题及解决方案</h3><ol><li><strong>回答偏离主题</strong>：重新强调核心需求</li><li><strong>信息过于冗长</strong>：指定长度和重点</li><li><strong>回答过于简短</strong>：要求详细说明和举例</li><li><strong>格式不符合要求</strong>：提供具体格式示例</li><li><strong>理解错误意图</strong>：用不同方式重新描述问题</li></ol></div><h2>性能优化</h2><p>提高提示词效率的技巧：</p><ul><li><strong>精简表达</strong>：去除冗余词汇，保持简洁</li><li><strong>批量处理</strong>：将相关问题合并提问</li><li><strong>缓存常用</strong>：保存有效的提示词模板</li><li><strong>版本管理</strong>：记录提示词的版本和效果</li></ul><h2>工具和资源</h2><p>推荐一些实用的提示词工程工具：</p><ul><li><strong>提示词库</strong>：收集和管理常用提示词</li><li><strong>A/B测试</strong>：比较不同提示词的效果</li><li><strong>性能监控</strong>：跟踪响应质量和成本</li><li><strong>社区分享</strong>：学习他人的最佳实践</li></ul><h2>持续学习</h2><p>提示词工程是一个不断发展的领域：</p><ol><li><strong>关注研究</strong>：跟踪最新的学术论文和技术博客</li><li><strong>实践总结</strong>：记录自己的成功案例和失败教训</li><li><strong>社区交流</strong>：参与相关论坛和讨论组</li><li><strong>工具更新</strong>：了解新工具和平台的功能</li></ol><h2>总结与展望</h2><p>恭喜你完成了提示词工程入门学习！现在你已经掌握了：</p><ul><li>✅ 提示词工程的基本概念和重要性</li><li>✅ 核心技巧和策略</li><li>✅ 各种场景的应用方法</li><li>✅ 高级优化技巧</li></ul><p><strong>下一步</strong>：开始在实际项目中应用这些技巧，不断练习和优化！</p>',
        duration: 10,
        order: 4,
        isCompleted: false,
        quiz: [
          {
            id: 'quiz-4-1',
            question: '在需要创造性回答时，temperature参数应该设置为？',
            options: [
              '0.1-0.3',
              '0.5-0.7',
              '0.8-1.0',
              '0'
            ],
            correctAnswer: 2
          },
          {
            id: 'quiz-4-2',
            question: '提示词工程的PDCA循环中，A代表什么？',
            options: [
              'Analyze（分析）',
              'Act（行动）',
              'Assess（评估）',
              'Adjust（调整）'
            ],
            correctAnswer: 1
          }
        ]
      }
    ]
  }, isLearningPath: true,`;

const updatedContent = content.replace(oldPattern, newContent);

// 写回文件
fs.writeFileSync('constants.ts', updatedContent, 'utf8');

console.log('修复完成！');