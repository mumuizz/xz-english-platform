# 第一阶段需求落地说明

## 本轮已完成

### 1. 单词记忆支持整本词库导入
- 新增词库目录接口：`GET /api/words/vocab-library`
- 新增词库统计接口：`GET /api/words/stats`
- 保留并加强整库导入接口：`POST /api/words/import-batch?vocab=xxx&batchSize=100`
- 前端单词记忆页改为动态读取可导入词库，支持直接导入整本词库
- 页面可看到：
  - 词库总词条数
  - 当前账号已导入数量
  - 当前待复习数量

### 2. 英语阅读改为整篇文章
- 阅读接口改成导入整篇文章数据，而不是简短摘要
- 前端阅读页支持：
  - 初中高级筛选
  - 卡片预览
  - 弹窗查看整篇英文正文
  - 中文整篇对照

### 3. 英语听力贴合自考并区分使用场景
- 听力材料拆成两类：
  - `exam-focus`：自考导向
  - `easy-listening`：空闲时间磨耳朵
- 每类材料继续区分：
  - `beginner`
  - `intermediate`
  - `advanced`
- 前端听力页支持：
  - 按场景筛选
  - 按难度筛选
  - 播放、拖动进度、倍速播放
  - 英文原文和中文对照

## 本轮调整的文件
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
- 听力音频地址当前使用公开可访问的演示音频源，后续建议替换成你自己的正式音频资源
- 阅读和听力内容目前是第一版种子数据，后续可以继续扩充为更完整的自考专题库
- 本地依赖未安装完成，当前没有在本机完成完整构建验证

## 下一步建议
1. 把自考历年高频听力题型拆成专题包，例如通知、对话、讲座、说明文
2. 阅读页增加“生词加入单词本”功能，把文章中的词直接送到单词记忆模块
3. 听力页增加听写模式和题目模式，进一步贴近考试训练
