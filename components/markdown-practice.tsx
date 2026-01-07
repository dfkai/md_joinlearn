"use client";

import { useState, useCallback, useEffect } from 'react';

interface SyntaxButton {
  label: string;
  raw: string;
  syntax: string;
  end?: string;
  desc: string;
  wrap: boolean;
  className?: string;
}

interface Challenge {
  title: string;
  task: string;
  check: (v: string) => boolean;
  hint: string;
}

const syntaxButtons: SyntaxButton[] = [
  { label: 'H1', raw: '#', syntax: '# ', desc: '一级标题', wrap: false },
  { label: 'H2', raw: '##', syntax: '## ', desc: '二级标题', wrap: false },
  { label: 'H3', raw: '###', syntax: '### ', desc: '三级标题', wrap: false },
  { label: 'H4', raw: '####', syntax: '#### ', desc: '四级标题', wrap: false },
  { label: 'B', raw: '**', syntax: '**', desc: '粗体', wrap: true, className: 'font-bold' },
  { label: 'I', raw: '*', syntax: '*', desc: '斜体', wrap: true, className: 'italic' },
  { label: 'S', raw: '~~', syntax: '~~', desc: '删除线', wrap: true, className: 'line-through' },
  { label: 'U', raw: '<u>', syntax: '<u>', end: '</u>', desc: '下划线', wrap: true, className: 'underline' },
  { label: '==', raw: '==', syntax: '==', desc: '高亮', wrap: true },
  { label: 'code', raw: '`', syntax: '`', desc: '行内代码', wrap: true },
  { label: '```', raw: '```', syntax: '```\n', end: '\n```', desc: '代码块', wrap: true },
  { label: '•', raw: '-', syntax: '- ', desc: '无序列表', wrap: false },
  { label: '1.', raw: '1.', syntax: '1. ', desc: '有序列表', wrap: false },
  { label: '☐', raw: '- [ ]', syntax: '- [ ] ', desc: '待办事项', wrap: false },
  { label: '☑', raw: '- [x]', syntax: '- [x] ', desc: '已完成', wrap: false },
  { label: '>', raw: '>', syntax: '> ', desc: '引用', wrap: false },
  { label: '—', raw: '---', syntax: '\n---\n', desc: '分割线', wrap: false },
  { label: '🔗', raw: '[]()', syntax: '[', end: '](url)', desc: '链接', wrap: true },
  { label: '🖼', raw: '![]()', syntax: '![alt](', end: ')', desc: '图片', wrap: true },
  { label: '📊', raw: '| |', syntax: '\n| 列1 | 列2 | 列3 |\n|-----|-----|-----|\n| 内容 | 内容 | 内容 |\n', desc: '表格', wrap: false },
];

const challenges: Challenge[] = [
  { title: '一级标题', task: '创建一个一级标题："Hello"', check: (v) => /^#\s*Hello\s*$/.test(v.trim()), hint: '# Hello' },
  { title: '二级标题', task: '创建一个二级标题："学习笔记"', check: (v) => /^##\s*学习笔记\s*$/.test(v.trim()), hint: '## 学习笔记' },
  { title: '粗体', task: '把"重要"这个词加粗', check: (v) => /\*\*重要\*\*/.test(v), hint: '**重要**' },
  { title: '斜体', task: '把"强调"这个词变成斜体', check: (v) => /(?<!\*)\*强调\*(?!\*)/.test(v), hint: '*强调*' },
  { title: '粗斜体', task: '把"特别重要"变成粗斜体', check: (v) => /\*\*\*特别重要\*\*\*/.test(v), hint: '***特别重要***' },
  { title: '删除线', task: '给"过时的"添加删除线', check: (v) => /~~过时的~~/.test(v), hint: '~~过时的~~' },
  { title: '行内代码', task: '把 console.log 变成行内代码', check: (v) => /`console\.log`/.test(v), hint: '`console.log`' },
  { title: '无序列表', task: '创建一个无序列表项："苹果"', check: (v) => /^[-*]\s*苹果\s*$/.test(v.trim()), hint: '- 苹果' },
  { title: '有序列表', task: '创建第一个有序列表项："第一步"', check: (v) => /^1\.\s*第一步\s*$/.test(v.trim()), hint: '1. 第一步' },
  { title: '引用', task: '创建引用："知识就是力量"', check: (v) => /^>\s*知识就是力量\s*$/.test(v.trim()), hint: '> 知识就是力量' },
  { title: '链接', task: '创建一个文字为"点击这里"的链接', check: (v) => /\[点击这里\]\(.+\)/.test(v), hint: '[点击这里](url)' },
  { title: '待办事项', task: '创建一个未完成的任务："学习Markdown"', check: (v) => /^-\s*\[\s*\]\s*学习Markdown\s*$/.test(v.trim()), hint: '- [ ] 学习Markdown' },
  { title: '已完成任务', task: '创建一个已完成的任务："安装软件"', check: (v) => /^-\s*\[x\]\s*安装软件\s*$/.test(v.trim()), hint: '- [x] 安装软件' },
  { title: '高亮', task: '把"关键词"高亮显示', check: (v) => /==关键词==/.test(v), hint: '==关键词==' },
  { title: '分割线', task: '创建一条分割线', check: (v) => /^---$/.test(v.trim()), hint: '---' },
];

const defaultMarkdown = `# 欢迎使用 Markdown 练习器 🎯

这是一个帮助你快速掌握 **Markdown** 语法的工具。

## 两种模式

- **练习模式**：自由输入，实时预览
- **挑战模式**：闯关练习，巩固语法

## 常用语法示例

### 文字样式

- **粗体文字** 用双星号包裹
- *斜体文字* 用单星号包裹
- ~~删除线~~ 用双波浪线包裹
- ==高亮文字== 用双等号包裹

### 代码

行内代码：\`console.log('Hello')\`

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

### 表格

| 功能 | 语法 | 效果 |
|-----|-----|-----|
| 粗体 | \`**文字**\` | **文字** |
| 斜体 | \`*文字*\` | *文字* |

### 引用

> 学习 Markdown，让写作更高效！

### 任务列表

- [x] 学习标题语法
- [x] 学习文字样式
- [ ] 完成挑战模式
- [ ] 掌握所有语法

---

**切换到挑战模式，测试你的掌握程度！** 🎮`;

const parseMarkdown = (text: string): string => {
  let html = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="bg-gray-800 text-green-400 p-3 rounded-lg my-2 overflow-x-auto text-sm"><code>$2</code></pre>');
  html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-200 text-pink-600 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>');
  html = html.replace(/^#### (.+)$/gm, '<h4 class="text-base font-bold mt-3 mb-1 text-gray-800">$1</h4>');
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold mt-4 mb-2 text-gray-800">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-5 mb-2 text-gray-800">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-6 mb-3 text-gray-800">$1</h1>');
  html = html.replace(/^---$/gm, '<hr class="my-4 border-gray-300"/>');
  html = html.replace(/^\|(.+)\|$/gm, (_match, content: string) => {
    const cells = content.split('|').map(c => c.trim());
    if (cells.every(c => /^[-:]+$/.test(c))) return '';
    const cellHtml = cells.map(c => `<td class="border border-gray-300 px-3 py-1.5">${c}</td>`).join('');
    return `<tr>${cellHtml}</tr>`;
  });
  html = html.replace(/(<tr>.*<\/tr>\n?)+/g, '<table class="border-collapse my-3 w-full">$&</table>');
  html = html.replace(/^- \[x\] (.+)$/gm, '<div class="flex items-center gap-2 my-1"><span class="text-green-500">✓</span><span class="line-through text-gray-500">$1</span></div>');
  html = html.replace(/^- \[ \] (.+)$/gm, '<div class="flex items-center gap-2 my-1"><span class="text-gray-400">○</span><span>$1</span></div>');
  html = html.replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>');
  html = html.replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>');
  html = html.replace(/^&gt; (.+)$/gm, '<blockquote class="border-l-4 border-blue-400 pl-4 py-1 my-2 text-gray-600 italic bg-blue-50 rounded-r">$1</blockquote>');
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong class="font-bold italic">$1</strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold">$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em class="italic">$1</em>');
  html = html.replace(/~~(.+?)~~/g, '<del class="line-through">$1</del>');
  html = html.replace(/==(.+?)==/g, '<mark class="bg-yellow-200 px-0.5 rounded">$1</mark>');
  html = html.replace(/&lt;u&gt;(.+?)&lt;\/u&gt;/g, '<u>$1</u>');
  html = html.replace(/&lt;sup&gt;(.+?)&lt;\/sup&gt;/g, '<sup>$1</sup>');
  html = html.replace(/&lt;sub&gt;(.+?)&lt;\/sub&gt;/g, '<sub>$1</sub>');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-500 underline hover:text-blue-700">$1</a>');
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full rounded my-2"/>');
  html = html.replace(/\n/g, '<br/>');
  return html;
};

export default function MarkdownPractice() {
  const [markdown, setMarkdown] = useState(defaultMarkdown);
  const [mode, setMode] = useState<'practice' | 'challenge'>('practice');
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [challengeInput, setChallengeInput] = useState('');
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [showResult, setShowResult] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [stats, setStats] = useState({ chars: 0, words: 0, lines: 0 });

  useEffect(() => {
    const chars = markdown.length;
    const words = markdown.trim() ? markdown.trim().split(/\s+/).length : 0;
    const lines = markdown.split('\n').length;
    setStats({ chars, words, lines });
  }, [markdown]);

  const insertSyntax = useCallback((btn: SyntaxButton) => {
    const textarea = document.getElementById('md-input') as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = markdown.substring(start, end);
    let newText: string, cursorPos: number;
    if (btn.wrap && selected) {
      const endSyntax = btn.end || btn.syntax;
      newText = markdown.substring(0, start) + btn.syntax + selected + endSyntax + markdown.substring(end);
      cursorPos = start + btn.syntax.length + selected.length + endSyntax.length;
    } else if (btn.wrap) {
      const endSyntax = btn.end || btn.syntax;
      newText = markdown.substring(0, start) + btn.syntax + '文字' + endSyntax + markdown.substring(end);
      cursorPos = start + btn.syntax.length;
    } else {
      newText = markdown.substring(0, start) + btn.syntax + markdown.substring(end);
      cursorPos = start + btn.syntax.length;
    }
    setMarkdown(newText);
    setTimeout(() => { textarea.focus(); textarea.setSelectionRange(cursorPos, cursorPos); }, 0);
  }, [markdown]);

  const checkAnswer = () => {
    const correct = challenges[currentChallenge].check(challengeInput);
    setShowResult(correct);
    if (correct) {
      setCompleted(prev => new Set([...prev, currentChallenge]));
      setTimeout(() => {
        setShowResult(null);
        setChallengeInput('');
        setShowHint(false);
        if (currentChallenge < challenges.length - 1) setCurrentChallenge(c => c + 1);
      }, 1200);
    } else {
      setTimeout(() => setShowResult(null), 1500);
    }
  };

  const goToChallenge = (idx: number) => {
    setCurrentChallenge(idx);
    setChallengeInput('');
    setShowResult(null);
    setShowHint(false);
  };

  const bgClass = darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 to-indigo-50';
  const cardClass = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textClass = darkMode ? 'text-gray-100' : 'text-gray-800';
  const subTextClass = darkMode ? 'text-gray-400' : 'text-gray-600';

  return (
    <div className={`h-screen flex flex-col ${bgClass} transition-colors duration-300`}>
      {/* Header */}
      <header className={`${cardClass} border-b shadow-sm flex-shrink-0`}>
        <div className="px-4 py-2 flex items-center justify-between gap-2">
          <h1 className={`text-base sm:text-lg font-bold ${textClass} whitespace-nowrap`}>📝 Markdown 练习器 <span className={`text-sm font-normal ${subTextClass} hidden sm:inline`}>| joinlearn.com 出品</span></h1>
          <div className="flex items-center gap-1 sm:gap-2">
            <button onClick={() => setMode('practice')}
              className={`px-2 sm:px-4 py-2 text-sm font-medium rounded-md transition-colors shadow-sm ${mode === 'practice' ? 'bg-indigo-600 text-white' : darkMode ? 'bg-gray-700 text-gray-100 hover:bg-gray-600 border border-gray-600' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}`}>
              <span className="sm:hidden">✏️</span><span className="hidden sm:inline">✏️ 练习</span>
            </button>
            <button onClick={() => setMode('challenge')}
              className={`px-2 sm:px-4 py-2 text-sm font-medium rounded-md transition-colors shadow-sm flex items-center gap-1 sm:gap-1.5 ${mode === 'challenge' ? 'bg-indigo-600 text-white' : darkMode ? 'bg-gray-700 text-gray-100 hover:bg-gray-600 border border-gray-600' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}`}>
              <span className="sm:hidden">🎮</span><span className="hidden sm:inline">🎮 挑战</span>
              {completed.size > 0 && <span className="bg-yellow-400 text-yellow-900 px-1 sm:px-1.5 rounded-full text-xs font-semibold">{completed.size}/{challenges.length}</span>}
            </button>
            <button onClick={() => setDarkMode(!darkMode)}
              className={`px-2 sm:px-3 py-2 text-sm rounded-md transition-colors shadow-sm ${darkMode ? 'bg-yellow-400 text-gray-900 hover:bg-yellow-300' : 'bg-gray-800 text-white hover:bg-gray-700'}`}>
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </header>

      {mode === 'challenge' ? (
        /* Challenge Mode */
        <div className="flex-1 flex flex-col min-h-0 p-2 gap-2">
          {/* Progress */}
          <div className={`${cardClass} rounded-xl border p-3 flex-shrink-0`}>
            <div className="flex flex-wrap gap-2">
              {challenges.map((c, i) => (
                <button key={i} onClick={() => goToChallenge(i)}
                  className={`w-9 h-9 text-sm rounded-md font-medium transition-colors shadow-sm ${
                    i === currentChallenge
                      ? 'bg-indigo-600 text-white ring-2 ring-indigo-300 ring-offset-1'
                      : completed.has(i)
                        ? 'bg-green-50 text-green-700 border border-green-300 hover:bg-green-100'
                        : darkMode ? 'bg-gray-700 text-gray-100 border border-gray-600 hover:bg-gray-600' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                  }`}>
                  {completed.has(i) ? '✓' : i + 1}
                </button>
              ))}
              <div className="flex-1" />
              <span className={`text-sm ${subTextClass} self-center`}>
                完成 {completed.size}/{challenges.length}
              </span>
            </div>
          </div>

          {/* Challenge Card */}
          <div className={`flex-1 ${cardClass} rounded-xl border flex flex-col min-h-0`}>
            <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex-shrink-0`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-lg font-bold ${textClass}`}>
                  第 {currentChallenge + 1} 关：{challenges[currentChallenge].title}
                </span>
                {completed.has(currentChallenge) && <span className="text-green-500 text-lg">✓ 已完成</span>}
              </div>
              <p className={`${subTextClass}`}>{challenges[currentChallenge].task}</p>
            </div>

            <div className="flex-1 flex flex-col md:flex-row min-h-0 p-4 gap-4">
              {/* Preview - First on mobile */}
              <div className="flex-1 flex flex-col min-h-0 order-1 md:order-2">
                <label className={`text-sm font-medium ${subTextClass} mb-2`}>👀 渲染效果：</label>
                <div className={`flex-1 p-3 rounded-lg overflow-auto select-none ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-50'
                } border ${darkMode ? 'border-gray-600' : 'border-gray-200'} min-h-24 ${textClass}`}
                  dangerouslySetInnerHTML={{ __html: parseMarkdown(challengeInput) || '<span class="text-gray-400">预览区域</span>' }}
                />
              </div>

              {/* Input - Second on mobile */}
              <div className="flex-1 flex flex-col min-h-0 order-2 md:order-1">
                <label className={`text-sm font-medium ${subTextClass} mb-2`}>✏️ 你的答案：</label>
                <textarea
                  value={challengeInput}
                  onChange={e => setChallengeInput(e.target.value)}
                  placeholder="在这里输入 Markdown 语法..."
                  className={`flex-1 p-3 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                    darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 border-gray-200'
                  } border min-h-24`}
                />
              </div>
            </div>

            {/* Actions */}
            <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex-shrink-0`}>
              {showHint && (
                <div className={`mb-3 p-2 rounded-lg text-sm font-mono ${darkMode ? 'bg-gray-700 text-yellow-300' : 'bg-yellow-50 text-yellow-800 border border-yellow-200'}`}>
                  💡 提示：<code className="bg-yellow-100 text-yellow-900 px-1 rounded">{challenges[currentChallenge].hint}</code>
                </div>
              )}
              {showResult !== null && (
                <div className={`mb-3 p-2 rounded-lg text-sm font-medium ${showResult ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {showResult ? '🎉 正确！太棒了！' : '❌ 不对哦，再试试看'}
                </div>
              )}
              <div className="flex gap-2 flex-wrap">
                <button onClick={checkAnswer}
                  className="px-5 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
                  检查答案
                </button>
                <button onClick={() => setShowHint(!showHint)}
                  className={`px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-colors ${darkMode ? 'bg-gray-700 text-gray-100 hover:bg-gray-600 border border-gray-600' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}`}>
                  {showHint ? '隐藏提示' : '💡 看提示'}
                </button>
                <button onClick={() => setChallengeInput('')}
                  className={`px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-colors ${darkMode ? 'bg-gray-700 text-gray-100 hover:bg-gray-600 border border-gray-600' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}`}>
                  清空
                </button>
                <div className="flex-1" />
                {currentChallenge > 0 && (
                  <button onClick={() => goToChallenge(currentChallenge - 1)}
                    className={`px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-colors ${darkMode ? 'bg-gray-700 text-gray-100 hover:bg-gray-600 border border-gray-600' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}`}>
                    ← 上一关
                  </button>
                )}
                {currentChallenge < challenges.length - 1 && (
                  <button onClick={() => goToChallenge(currentChallenge + 1)}
                    className={`px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-colors ${darkMode ? 'bg-gray-700 text-gray-100 hover:bg-gray-600 border border-gray-600' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}`}>
                    下一关 →
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Syntax Reference */}
          <div className={`${cardClass} rounded-xl border p-3 flex-shrink-0`}>
            <div className={`text-xs ${subTextClass} mb-2`}>语法参考（点击插入）：</div>
            <div className="flex flex-wrap gap-1.5">
              {syntaxButtons.map((btn, i) => (
                <button key={i} onClick={() => setChallengeInput(prev => prev + btn.syntax + (btn.wrap ? (btn.end || btn.syntax) : ''))}
                  title={btn.desc}
                  className={`px-3 py-1.5 text-sm font-medium font-mono rounded-md transition-colors shadow-sm ${
                    darkMode
                      ? 'bg-gray-700 text-gray-100 hover:bg-gray-600 border border-gray-600'
                      : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 hover:border-gray-300'
                  }`}>
                  {btn.raw}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Practice Mode */
        <>
          {/* Desktop Toolbar - hidden on mobile */}
          <div className={`${cardClass} border-b px-2 py-2 flex-shrink-0 overflow-x-auto hidden md:block`}>
            <div className="flex items-center gap-1.5 min-w-max">
              {syntaxButtons.map((btn, i) => (
                <button key={i} onClick={() => insertSyntax(btn)} title={btn.desc}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors shadow-sm ${
                    darkMode
                      ? 'bg-gray-700 text-gray-100 hover:bg-gray-600 border border-gray-600'
                      : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 hover:border-gray-300'
                  } ${btn.className || ''}`}>
                  {btn.label}
                </button>
              ))}
              <div className="flex-1" />
              <span className={`text-xs ${subTextClass}`}>
                {stats.chars}字 · {stats.words}词 · {stats.lines}行
              </span>
              <button onClick={() => setMarkdown('')}
                className="px-3 py-1.5 text-sm font-medium rounded-md bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors shadow-sm">清空</button>
              <button onClick={() => setMarkdown(defaultMarkdown)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors shadow-sm ${darkMode ? 'bg-gray-700 text-gray-100 hover:bg-gray-600 border border-gray-600' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}`}>重置</button>
            </div>
          </div>

          {/* Main Content */}
          <main className="flex-1 flex flex-col md:flex-row min-h-0 p-2 gap-2">
            {/* Editor */}
            <div className={`flex-1 ${cardClass} rounded-xl border overflow-hidden flex flex-col order-2 md:order-1`}>
              <div className={`px-3 py-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'} flex-shrink-0 hidden md:block`}>
                <span className={`text-sm font-medium ${subTextClass}`}>✏️ Markdown 输入</span>
              </div>
              <textarea id="md-input" value={markdown} onChange={e => setMarkdown(e.target.value)} spellCheck={false}
                className={`flex-1 p-3 resize-none focus:outline-none font-mono text-sm ${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-700'}`}
                placeholder="在这里输入 Markdown 内容..."/>
            </div>

            {/* Preview */}
            <div className={`flex-1 ${cardClass} rounded-xl border overflow-hidden flex flex-col order-1 md:order-2`}>
              <div className={`px-3 py-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'} flex-shrink-0 hidden md:block`}>
                <span className={`text-sm font-medium ${subTextClass}`}>👀 实时预览</span>
              </div>
              <div className={`flex-1 p-4 overflow-y-auto select-none ${textClass}`}
                dangerouslySetInnerHTML={{ __html: parseMarkdown(markdown) }}/>
            </div>
          </main>

          {/* Mobile Toolbar - below input, visible on mobile */}
          <div className={`${cardClass} border-t px-2 py-2 flex-shrink-0 md:hidden`}>
            <div className="overflow-x-auto">
              <div className="flex items-center gap-1.5 min-w-max pb-2">
                {syntaxButtons.map((btn, i) => (
                  <button key={i} onClick={() => insertSyntax(btn)} title={btn.desc}
                    className={`px-2.5 py-1.5 text-sm font-medium rounded-md transition-colors shadow-sm ${
                      darkMode
                        ? 'bg-gray-700 text-gray-100 hover:bg-gray-600 border border-gray-600'
                        : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 hover:border-gray-300'
                    } ${btn.className || ''}`}>
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
              <span className={`text-xs ${subTextClass}`}>
                {stats.chars}字 · {stats.words}词 · {stats.lines}行
              </span>
              <div className="flex gap-2">
                <button onClick={() => setMarkdown('')}
                  className="px-4 py-1.5 text-sm font-medium rounded-md bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors shadow-sm">清空</button>
                <button onClick={() => setMarkdown(defaultMarkdown)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors shadow-sm ${darkMode ? 'bg-gray-700 text-gray-100 hover:bg-gray-600 border border-gray-600' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}`}>重置</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
