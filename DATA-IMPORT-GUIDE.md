# 📦 数据导入指南

## 一键导入所有数据

### 方法一：使用导入脚本（推荐）

```bash
cd /home/admin/.openclaw/workspace/xz-english-platform
npx tsx import-all-data.ts
```

这将导入：
- ✅ **词库**：CET-4、商务英语、雅思、自考英语（共 600+ 单词）
- ✅ **阅读文章**：5 篇精选文章（初级、中级、高级）
- ✅ **听力材料**：4 个听力资源（VOA、BBC、日常对话、故事）

### 方法二：在网页中导入

登录平台后，在各个页面点击导入按钮：

1. **单词记忆页面** → 点击 "📥 导入词库"
2. **英语阅读页面** → 点击 "📥 导入人民日报文章"
3. **英语听力页面** → 点击 "📥 导入听力材料"

---

## 📚 词库说明

### 已有词库

| 词库 | 单词数 | 难度 | 说明 |
|------|--------|------|------|
| **cet4** | 550 词 | 大学四级 | 四级考试高频核心词汇 |
| **business** | 5 词 | 商务英语 | 商务场景常用词汇 |
| **ielts** | 5 词 | 雅思 | 雅思考试核心词汇 |
| **selfstudy** | 50 词 | 自考英语 | 自学考试英语词汇 |

### 添加新词库

在 `data/vocab/` 目录下创建 JSON 文件：

```json
{
  "name": "词库名称",
  "code": "词库代码",
  "description": "词库描述",
  "words": [
    {
      "word": "单词",
      "phonetic": "音标",
      "meanings": [
        {"pos": "词性", "definitions": ["释义 1", "释义 2"]}
      ],
      "examples": [
        {"en": "英文例句", "zh": "中文翻译"}
      ],
      "tags": ["标签 1", "标签 2"]
    }
  ]
}
```

---

## 📰 阅读文章

### 已有文章

- ✅ China's Economy Shows Strong Recovery (中级)
- ✅ The Rise of Electric Vehicles (中级)
- ✅ Traditional Culture in Modern Times (高级)
- ✅ My Daily Routine (初级)
- ✅ The Benefits of Reading (初级)

### 文章特点

- 📖 **完整文章**：每篇都是完整的文章，不是片段
- 🇨🇳 **中英对照**：英文原文 + 中文翻译
- 📊 **难度分级**：初级/中级/高级
- 🏷️ **标签分类**：经济、科技、文化、日常等

---

## 🎧 听力材料

### 已有资源

| 标题 | 类型 | 难度 | 时长 |
|------|------|------|------|
| VOA Learning English - Technology | 新闻 | 初级 | 3:00 |
| BBC 6 Minute English - Sleep | 讲座 | 中级 | 6:00 |
| Everyday English - At the Restaurant | 对话 | 初级 | 2:00 |
| The Story of Starbucks | 故事 | 中级 | 4:00 |

### 听力功能

- ▶️ **在线播放**：支持多种音频格式
- ⏩ **倍速播放**：0.5x - 2.0x
- 📝 **听力原文**：英文原文 + 中文翻译
- ⏱️ **进度控制**：可拖动进度条

---

## 🔧 故障排除

### 导入失败怎么办？

1. **检查后端是否运行**
   ```bash
   curl http://localhost:3001/api/health
   ```

2. **检查数据库**
   ```bash
   cd server
   npx prisma studio
   ```

3. **重新导入**
   ```bash
   npx tsx import-all-data.ts
   ```

### 数据已存在提示

如果提示"已有 X 条数据，跳过"，说明数据已经导入过了。

如需重新导入，先清空数据：

```bash
cd server
npx prisma db push --force-reset
npx tsx ../import-all-data.ts
```

---

## 📊 数据统计

导入完成后，在个人中心可以看到：
- 📚 累计单词数
- 🔥 打卡天数
- 🎯 学习等级
- 📰 已读文章
- 🎧 已听材料

---

**💡 提示**：首次使用建议先导入所有数据，然后开始学习！
