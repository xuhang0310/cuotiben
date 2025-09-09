import type { Question as StoreQuestion } from '@/stores/question'

// 重新导出Question类型
export type { Question } from '@/stores/question'

// Mock数据：题目列表
export const mockQuestions: StoreQuestion[] = [
  {
    id: '1',
    title: '题目31',
    content: '这是一道关于数学的题目，请计算 2 + 2 = ?',
    options: ['3', '4', '5', '6'],
    correctAnswer: '4',
    explanation: '2 + 2 = 4，这是基础的加法运算。',
    difficulty: 'easy',
    subject: '数学',
    tags: ['加法', '基础'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    practiceCount: 5,
    correctCount: 3,
    lastPracticeAt: new Date('2024-01-15'),
    isFavorite: false
  },
  {
    id: '2',
    title: '题目32',
    content: '下列哪个选项是正确的英语语法？',
    options: ['I are happy', 'I am happy', 'I is happy', 'I be happy'],
    correctAnswer: 'I am happy',
    explanation: '"I am happy" 是正确的英语语法，主语 I 应该搭配 am。',
    difficulty: 'medium',
    subject: '英语',
    tags: ['语法', '基础'],
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
    practiceCount: 3,
    correctCount: 2,
    lastPracticeAt: new Date('2024-01-16'),
    isFavorite: true
  },
  {
    id: '3',
    title: '题目33',
    content: '中国的首都是哪里？',
    options: ['上海', '北京', '广州', '深圳'],
    correctAnswer: '北京',
    explanation: '中华人民共和国的首都是北京。',
    difficulty: 'easy',
    subject: '地理',
    tags: ['中国', '首都'],
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03'),
    practiceCount: 2,
    correctCount: 2,
    lastPracticeAt: new Date('2024-01-17'),
    isFavorite: false
  },
  {
    id: '4',
    title: '题目34',
    content: '以下哪个是编程语言？',
    options: ['HTML', 'CSS', 'JavaScript', 'Photoshop'],
    correctAnswer: 'JavaScript',
    explanation: 'JavaScript 是一种编程语言，而 HTML 和 CSS 是标记语言，Photoshop 是图像处理软件。',
    difficulty: 'medium',
    subject: '计算机',
    tags: ['编程', '语言'],
    createdAt: new Date('2024-01-04'),
    updatedAt: new Date('2024-01-04'),
    practiceCount: 4,
    correctCount: 1,
    lastPracticeAt: new Date('2024-01-18'),
    isFavorite: true
  },
  {
    id: '5',
    title: '题目35',
    content: '水的化学分子式是什么？',
    options: ['H2O', 'CO2', 'NaCl', 'O2'],
    correctAnswer: 'H2O',
    explanation: '水的化学分子式是 H2O，由两个氢原子和一个氧原子组成。',
    difficulty: 'easy',
    subject: '化学',
    tags: ['分子式', '基础'],
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05'),
    practiceCount: 6,
    correctCount: 5,
    lastPracticeAt: new Date('2024-01-19'),
    isFavorite: false
  },
  {
    id: '6',
    title: '题目36',
    content: '以下哪个不是哺乳动物？',
    options: ['狗', '猫', '鸟', '马'],
    correctAnswer: '鸟',
    explanation: '鸟类属于鸟纲，不是哺乳动物。哺乳动物的特征是用乳汁哺育幼崽。',
    difficulty: 'medium',
    subject: '生物',
    tags: ['动物', '分类'],
    createdAt: new Date('2024-01-06'),
    updatedAt: new Date('2024-01-06'),
    practiceCount: 3,
    correctCount: 1,
    lastPracticeAt: new Date('2024-01-20'),
    isFavorite: false
  },
  {
    id: '7',
    title: '题目37',
    content: '1000 毫升等于多少升？',
    options: ['0.1升', '1升', '10升', '100升'],
    correctAnswer: '1升',
    explanation: '1000 毫升 = 1 升，这是基本的体积单位换算。',
    difficulty: 'easy',
    subject: '数学',
    tags: ['单位换算', '体积'],
    createdAt: new Date('2024-01-07'),
    updatedAt: new Date('2024-01-07'),
    practiceCount: 1,
    correctCount: 0,
    lastPracticeAt: new Date('2024-01-21'),
    isFavorite: true
  },
  {
    id: '8',
    title: '题目38',
    content: '以下哪个是正确的过去式？',
    options: ['go - goed', 'eat - eated', 'run - ran', 'see - seed'],
    correctAnswer: 'run - ran',
    explanation: '"run" 的过去式是 "ran"，这是不规则动词的变化形式。',
    difficulty: 'hard',
    subject: '英语',
    tags: ['过去式', '不规则动词'],
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-08'),
    practiceCount: 7,
    correctCount: 2,
    lastPracticeAt: new Date('2024-01-22'),
    isFavorite: false
  },
  {
    id: '9',
    title: '题目39',
    content: '太阳系中最大的行星是？',
    options: ['地球', '火星', '木星', '土星'],
    correctAnswer: '木星',
    explanation: '木星是太阳系中最大的行星，质量约为地球的318倍。',
    difficulty: 'medium',
    subject: '天文',
    tags: ['太阳系', '行星'],
    createdAt: new Date('2024-01-09'),
    updatedAt: new Date('2024-01-09'),
    practiceCount: 2,
    correctCount: 1,
    lastPracticeAt: new Date('2024-01-23'),
    isFavorite: true
  },
  {
    id: '10',
    title: '题目310',
    content: '以下哪个是正确的Python语法？',
    options: ['print "Hello"', 'print("Hello")', 'echo "Hello"', 'console.log("Hello")'],
    correctAnswer: 'print("Hello")',
    explanation: 'Python 3.x 中正确的打印语法是 print("Hello")。',
    difficulty: 'hard',
    subject: '计算机',
    tags: ['Python', '语法'],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
    practiceCount: 8,
    correctCount: 6,
    lastPracticeAt: new Date('2024-01-24'),
    isFavorite: false
  }
]

// 模拟从API获取题目列表
export const fetchQuestions = async (): Promise<StoreQuestion[]> => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  return mockQuestions
}

// 模拟添加题目
export const addQuestion = async (question: Omit<StoreQuestion, 'id' | 'createdAt' | 'updatedAt' | 'practiceCount' | 'correctCount'>): Promise<StoreQuestion> => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 300))
  
  const newQuestion: StoreQuestion = {
    ...question,
    id: Date.now().toString(),
    createdAt: new Date(),
    updatedAt: new Date(),
    practiceCount: 0,
    correctCount: 0,
    isFavorite: false
  }
  
  mockQuestions.push(newQuestion)
  return newQuestion
}

// 模拟更新题目
export const updateQuestion = async (id: string, updates: Partial<StoreQuestion>): Promise<StoreQuestion | null> => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 300))
  
  const index = mockQuestions.findIndex(q => q.id === id)
  if (index !== -1) {
    mockQuestions[index] = {
      ...mockQuestions[index],
      ...updates,
      updatedAt: new Date()
    }
    return mockQuestions[index]
  }
  return null
}

// 模拟删除题目
export const deleteQuestion = async (id: string): Promise<boolean> => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 300))
  
  const index = mockQuestions.findIndex(q => q.id === id)
  if (index !== -1) {
    mockQuestions.splice(index, 1)
    return true
  }
  return false
}

// 根据ID获取题目
export const getQuestionById = async (id: string): Promise<StoreQuestion | null> => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 200))
  
  return mockQuestions.find(q => q.id === id) || null
}