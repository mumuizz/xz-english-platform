# 阶段需求落地说明

## 第一批已完成

### 1. 单词记忆支持整本词库导入
- 新增词库目录接口：`GET /api/words/vocab-library`
- 新增词库统计接口：`GET /api/words/stats`
- 保留并增强整库导入接口：`POST /api/words/import-batch?vocab=xxx&batchSize=100`
- 单词记忆页支持动态读取词库目录并导入整本词库

### 2. 英语阅读改为整篇文章
- 阅读模块改为整篇文章展示
- 支持按初级、中级、高级筛选
- 支持整篇英文正文和中文对照展示

### 3. 英语听力按场景和难度分类
- 区分 `exam-focus` 和 `easy-listening`
- 区分 `beginner`、`intermediate`、`advanced`
- 支持播放、进度拖动、倍速、原文和中文对照

## 第二批已完成

### 4. 阅读页新增生词加入单词本
- 从当前文章中提取候选生词
- 支持直接加入单词本
- 自动带入文章来源和例句

### 5. 听力页新增题目模式
- 每条材料支持配套题目
- 提交后即时显示得分和解析

## 第三批已完成

### 6. 听力页新增听写模式
- 每条材料支持听写片段训练
- 支持提交听写并即时判分
- 支持重做

### 7. 听力页新增错题本
- 题目模式提交后自动记录错题
- 支持按材料查看错题、你的答案、正确答案和解析

## 本轮核心文件
- `client/src/pages/Ebbinghaus.tsx`
- `client/src/pages/Reading.tsx`
- `client/src/pages/Listening.tsx`
- `client/src/components/WordCard.tsx`
- `server/src/routes/words.ts`
- `server/src/routes/articles.ts`
- `server/src/routes/listening.ts`
- `server/src/index.ts`
- `server/src/init.ts`

## 当前限制
- 当前环境未安装前后端依赖，无法完成本地构建验证
- 听力题库和听写片段目前为静态配置，后续适合抽到服务端配置化管理
- 阅读生词加入单词本时，释义目前是来源说明，不是完整词典释义
- 听力音频地址目前仍是演示音频源，后续建议替换为正式素材

## 下一步建议
1. 阅读模块增加句子收藏和整篇复述
2. 听力模块增加按题型统计和错题再练
3. 单词模块增加按来源分组复习
