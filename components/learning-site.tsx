'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  Check,
  CheckCircle2,
  Circle,
  Clock3,
  Menu,
  Search,
  Sparkles,
  Target,
} from 'lucide-react';

import { LessonOne } from '@/components/lesson-one';
import { LessonTwo } from '@/components/lesson-two';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress, ProgressLabel, ProgressValue } from '@/components/ui/progress';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

type PageId = 'roadmap' | 'lesson-1' | 'lesson-2';

type Lesson = {
  id: string;
  number: string;
  title: string;
  shortTitle: string;
  stage: string;
  priority: 'P0' | 'P1';
  duration: string;
  description: string;
  available: boolean;
};

const lessons: Lesson[] = [
  { id: 'lesson-1', number: '01', title: '大模型的本质与生成机制', shortTitle: 'LLM 到底在做什么', stage: '底层直觉', priority: 'P0', duration: '25 分钟', description: 'Next Token、训练与推理、Logits、解码与幻觉。', available: true },
  { id: 'lesson-2', number: '02', title: 'Tokenizer、Embedding 与 Context', shortTitle: '文字如何进入模型', stage: '底层直觉', priority: 'P0', duration: '35 分钟', description: '子词、Token ID、三种 Embedding、位置与 Token 预算。', available: true },
  { id: 'lesson-3', number: '03', title: 'Transformer 与 Self-Attention', shortTitle: 'Attention 内部机制', stage: '模型内部', priority: 'P0', duration: '待更新', description: 'Q/K/V、多头注意力、因果掩码、残差与归一化。', available: false },
  { id: 'lesson-4', number: '04', title: '预训练、SFT 与训练数据', shortTitle: '大模型如何训练', stage: '训练基础', priority: 'P0', duration: '待更新', description: '交叉熵、反向传播、数据构造、指令微调与 Scaling。', available: false },
  { id: 'lesson-5', number: '05', title: 'LoRA、QLoRA、RLHF 与 DPO', shortTitle: '大模型调优方法', stage: '模型调优', priority: 'P0', duration: '待更新', description: '全量微调、PEFT、低秩矩阵、显存与偏好对齐。', available: false },
  { id: 'lesson-6', number: '06', title: '推理加速、量化与部署', shortTitle: '模型怎样跑得更快', stage: '推理工程', priority: 'P1', duration: '待更新', description: 'KV Cache、Continuous Batching、量化、吞吐与延迟。', available: false },
  { id: 'lesson-7', number: '07', title: 'RAG：检索、重排与生成', shortTitle: 'RAG 完整链路', stage: 'AI 应用', priority: 'P0', duration: '待更新', description: 'Chunk、Embedding、BM25、RRF、Rerank 与引用。', available: false },
  { id: 'lesson-8', number: '08', title: 'Agent、工具调用与记忆', shortTitle: 'Agent 核心机制', stage: 'AI 应用', priority: 'P0', duration: '待更新', description: 'Function Calling、ReAct、Plan-Execute、状态与记忆。', available: false },
  { id: 'lesson-9', number: '09', title: 'AgentRunner 与可靠性工程', shortTitle: '把 Agent 做稳定', stage: '项目深挖', priority: 'P0', duration: '待更新', description: '预算、HITL、Verifier、Trace、SSE、失败恢复。', available: false },
  { id: 'lesson-10', number: '10', title: '评测、安全与防御', shortTitle: '怎么证明系统可靠', stage: '工程质量', priority: 'P0', duration: '待更新', description: '离线评测、Bad Case、Prompt Injection、权限边界。', available: false },
  { id: 'lesson-11', number: '11', title: 'LLM 应用系统设计', shortTitle: '系统设计面试', stage: '面试进阶', priority: 'P1', duration: '待更新', description: '容量、成本、降级、可观测性与端到端架构。', available: false },
  { id: 'lesson-12', number: '12', title: '简历答辩与模拟面试', shortTitle: '项目追问实战', stage: '面试冲刺', priority: 'P0', duration: '待更新', description: '指标口径、证据链、追问树与完整模拟面试。', available: false },
];

const searchEntries = [
  { page: 'lesson-1' as PageId, type: '知识点', title: 'Next Token Prediction', text: '自回归、条件概率、逐 Token 生成、当前上下文' },
  { page: 'lesson-1' as PageId, type: '知识点', title: 'Logits、Softmax 与 Temperature', text: '未归一化分数、概率分布、随机性、解码' },
  { page: 'lesson-1' as PageId, type: '训练', title: 'Teacher Forcing 与 Causal Mask', text: '交叉熵、训练并行、推理串行、参数更新' },
  { page: 'lesson-1' as PageId, type: '工程', title: '幻觉为什么出现', text: '概率续写不等于事实核验、RAG、Tool、Verifier' },
  { page: 'lesson-2' as PageId, type: '知识点', title: 'BPE、WordPiece 与 Unigram', text: 'Tokenizer、子词、SentencePiece、词表大小' },
  { page: 'lesson-2' as PageId, type: '知识点', title: 'Token ID 与 Token Embedding', text: '词表索引、Embedding Matrix、V × d、参数量' },
  { page: 'lesson-2' as PageId, type: '知识点', title: 'Hidden State 与 Sentence Embedding', text: '上下文化表示、向量检索、余弦相似度、RAG' },
  { page: 'lesson-2' as PageId, type: '知识点', title: 'RoPE、Chat Template 与 Mask', text: '位置信息、特殊 Token、Padding Mask、Causal Mask' },
  { page: 'lesson-2' as PageId, type: '项目追问', title: '32k Token 预算口径', text: '模型窗口、单次业务预算、Agent Run 累计预算、reserve' },
  { page: 'lesson-2' as PageId, type: '工程', title: 'Context Window 与截断', text: '系统提示、历史、工具 Schema、RAG、输出预留、摘要' },
];

const pageMeta: Record<PageId, { label: string; title: string; description: string; duration: string }> = {
  roadmap: { label: 'Course Roadmap', title: '大模型面试学习地图', description: '从零基础到底层原理、调优、RAG、Agent 与系统设计，按面试优先级逐步补齐。', duration: '共 12 课' },
  'lesson-1': { label: 'Lesson 01 · P0 必会', title: '大模型的本质与生成机制', description: '从“下一个 Token 预测”出发，打通训练、推理、幻觉与应用可靠性的第一条主线。', duration: '约 25 分钟' },
  'lesson-2': { label: 'Lesson 02 · P0 必会', title: 'Tokenizer、Embedding 与 Context', description: '理解文字如何进入模型，以及 Token 预算、RAG 向量和 Agent 上下文到底如何工作。', duration: '约 35 分钟' },
};

function SidebarContent({
  active,
  completed,
  onNavigate,
}: {
  active: PageId;
  completed: Set<string>;
  onNavigate: (id: PageId) => void;
}) {
  return (
    <>
      <button type="button" onClick={() => onNavigate('roadmap')} className="flex h-20 w-full items-center gap-3 border-b px-5 text-left">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <BrainCircuit className="size-5" />
        </span>
        <span className="min-w-0">
          <span className="block font-heading font-semibold">LLM 面试知识库</span>
          <span className="block truncate text-xs text-muted-foreground">AI 应用开发 · 从原理到面试</span>
        </span>
      </button>

      <nav className="flex-1 overflow-y-auto px-3 py-5" aria-label="课程目录">
        <button
          type="button"
          onClick={() => onNavigate('roadmap')}
          className={`mb-3 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${active === 'roadmap' ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'hover:bg-sidebar-accent'}`}
        >
          <span className="font-mono text-xs opacity-70">00</span>
          <span className="flex-1 text-sm font-medium">完整学习地图</span>
          <BookOpen className="size-4 opacity-70" />
        </button>

        <p className="mb-2 px-3 text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">已收录课程</p>
        <div className="space-y-1">
          {lessons.slice(0, 2).map((lesson) => (
            <button
              key={lesson.id}
              type="button"
              onClick={() => onNavigate(lesson.id as PageId)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${active === lesson.id ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'hover:bg-sidebar-accent'}`}
            >
              <span className="font-mono text-xs opacity-70">{lesson.number}</span>
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{lesson.shortTitle}</span>
              {completed.has(lesson.id) ? <CheckCircle2 className="size-4 text-emerald-500" /> : <Circle className="size-3 opacity-35" />}
            </button>
          ))}
        </div>

        <p className="mt-6 mb-2 px-3 text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">后续路线</p>
        <div className="space-y-1">
          {lessons.slice(2).map((lesson) => (
            <div key={lesson.id} className="flex items-center gap-3 rounded-xl px-3 py-2 text-muted-foreground/70">
              <span className="font-mono text-xs">{lesson.number}</span>
              <span className="min-w-0 flex-1 truncate text-xs">{lesson.shortTitle}</span>
              <span className="text-[10px]">待更新</span>
            </div>
          ))}
        </div>
      </nav>

      <div className="border-t p-4">
        <Progress value={(completed.size / 12) * 100} aria-label="课程学习进度">
          <ProgressLabel>学习进度</ProgressLabel>
          <ProgressValue>{completed.size} / 12</ProgressValue>
        </Progress>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">进度保存在当前浏览器，可随时回来继续。</p>
      </div>
    </>
  );
}

function Roadmap({ onNavigate }: { onNavigate: (id: PageId) => void }) {
  return (
    <article className="space-y-9">
      <Card className="overflow-hidden bg-primary text-primary-foreground ring-0">
        <CardContent className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_220px] lg:items-center">
          <div>
            <div className="mb-3 flex items-center gap-2 text-primary-foreground/75">
              <Sparkles className="size-4" />
              <span className="text-xs font-semibold tracking-wide">你的学习方法</span>
            </div>
            <h2 className="font-heading text-2xl font-semibold sm:text-3xl">先理解，再口述，最后扛住追问</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-primary-foreground/75">
              每课固定按“直觉 → 原理 → 公式 → 工程取舍 → 面试表达 → 主动回忆”展开。第一次顺序读，复习时只看核心句、面试回答和小测。
            </p>
          </div>
          <Button variant="secondary" size="lg" onClick={() => onNavigate('lesson-1')}>
            从 Lesson 01 开始
            <ArrowRight data-icon="inline-end" />
          </Button>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.12em] text-primary uppercase">课程路线</p>
          <h2 className="mt-1 font-heading text-2xl font-semibold tracking-tight">12 课覆盖面试主线</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {lessons.map((lesson) => (
            <Card key={lesson.id} className={lesson.available ? 'border-primary/25' : 'opacity-80'}>
              <CardHeader>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={lesson.available ? 'default' : 'secondary'}>Lesson {lesson.number}</Badge>
                    <Badge variant="outline">{lesson.priority}</Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">{lesson.stage}</span>
                </div>
                <CardTitle>{lesson.title}</CardTitle>
                <CardDescription>{lesson.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock3 className="size-3.5" />{lesson.duration}
                </span>
                {lesson.available ? (
                  <Button variant="outline" onClick={() => onNavigate(lesson.id as PageId)}>
                    进入课程<ArrowRight data-icon="inline-end" />
                  </Button>
                ) : <Badge variant="secondary">待更新</Badge>}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ['第一次学习', '完整顺序阅读，拖动交互演示，并用自己的话复述核心概念。'],
          ['第二次复习', '只看核心句、公式卡、易错点和标准回答，补齐模糊处。'],
          ['面试前冲刺', '隐藏答案做闭卷自测；每道 P0 题先答 30 秒，再展开到工程层。'],
        ].map(([title, text], index) => (
          <Card key={title}>
            <CardHeader>
              <span className="mb-2 font-mono text-xs text-primary">0{index + 1}</span>
              <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-6 text-muted-foreground">{text}</CardContent>
          </Card>
        ))}
      </section>
    </article>
  );
}

function SearchResults({ query, onNavigate }: { query: string; onNavigate: (id: PageId) => void }) {
  const normalized = query.trim().toLowerCase();
  const results = searchEntries.filter((entry) => `${entry.type} ${entry.title} ${entry.text}`.toLowerCase().includes(normalized));

  return (
    <section className="space-y-5">
      <div>
        <p className="text-sm text-muted-foreground">搜索“{query}”</p>
        <h2 className="mt-1 font-heading text-2xl font-semibold">找到 {results.length} 个相关知识点</h2>
      </div>
      {results.length ? (
        <div className="space-y-3">
          {results.map((result) => (
            <button key={result.title} type="button" onClick={() => onNavigate(result.page)} className="block w-full text-left">
              <Card className="transition-colors hover:border-primary/40 hover:bg-muted/40">
                <CardContent className="flex items-start gap-4 p-5">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Search className="size-4" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="mb-1 flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">{result.type}</Badge>
                      <span className="font-mono text-xs text-muted-foreground">{result.page === 'lesson-1' ? 'Lesson 01' : 'Lesson 02'}</span>
                    </span>
                    <strong className="block text-foreground">{result.title}</strong>
                    <span className="mt-1 block text-sm leading-6 text-muted-foreground">{result.text}</span>
                  </span>
                  <ArrowRight className="mt-2 size-4 shrink-0 text-muted-foreground" />
                </CardContent>
              </Card>
            </button>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="mx-auto mb-3 size-6 text-muted-foreground" />
            <p className="font-medium text-foreground">暂时没有命中</p>
            <p className="mt-1 text-sm text-muted-foreground">试试 Token、Embedding、32k、RAG、幻觉或 Teacher Forcing。</p>
          </CardContent>
        </Card>
      )}
    </section>
  );
}

function StudyAside({ active }: { active: PageId }) {
  const content = active === 'lesson-1'
    ? {
        goals: ['脱稿解释逐 Token 生成', '区分训练与普通推理', '说明幻觉的机制原因'],
        mapping: ['SSE 流式输出：逐 Token 生成的外部表现', 'RAG / Verifier：给概率模型补事实与校验'],
        tip: '面试回答先讲主链，再等追问展开公式，不要一上来堆名词。',
      }
    : active === 'lesson-2'
      ? {
          goals: ['区分 ID、Embedding、Hidden State', '解释完整 Context 组成', '说清 32k 的三种口径'],
          mapping: ['Embedding + BM25 + Rerank：检索链路', '工具 Schema / Result：都会进入 Token 预算'],
          tip: '简历数字必须回到真实代码口径；不确定时明确说需要核对实现。',
        }
      : {
          goals: ['先完成两课底层直觉', '每课做完闭卷自测', '能把概念映射回项目'],
          mapping: ['P0：高频且必须能深入', 'P1：理解工程取舍即可'],
          tip: '建议每次只学一课，第二天不看笔记复述一次，比连续刷完更有效。',
        };

  return (
    <aside className="space-y-4 lg:sticky lg:top-8 lg:self-start">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 text-primary"><Target className="size-4" /><CardTitle className="text-base">这一页的通过标准</CardTitle></div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2.5 text-sm leading-6 text-muted-foreground">
            {content.goals.map((goal) => <li key={goal} className="flex gap-2"><Check className="mt-1.5 size-3.5 shrink-0 text-primary" />{goal}</li>)}
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">与你的 AI 应用方向</CardTitle></CardHeader>
        <CardContent>
          <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
            {content.mapping.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </CardContent>
      </Card>
      <Card className="bg-muted/65">
        <CardContent className="pt-6 text-sm leading-6 text-muted-foreground">{content.tip}</CardContent>
      </Card>
    </aside>
  );
}

export function LearningSite() {
  const [active, setActive] = useState<PageId>('roadmap');
  const [query, setQuery] = useState('');
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem('llm-interview-completed');
    if (saved) {
      try {
        setCompleted(new Set(JSON.parse(saved) as string[]));
      } catch {
        window.localStorage.removeItem('llm-interview-completed');
      }
    }

    const syncFromHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'lesson-1' || hash === 'lesson-2' || hash === 'roadmap') setActive(hash);
    };
    syncFromHash();
    window.addEventListener('popstate', syncFromHash);
    return () => window.removeEventListener('popstate', syncFromHash);
  }, []);

  const navigate = (id: PageId) => {
    setActive(id);
    setQuery('');
    setMobileOpen(false);
    window.history.pushState(null, '', `#${id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleComplete = () => {
    if (active === 'roadmap') return;
    setCompleted((current) => {
      const next = new Set(current);
      if (next.has(active)) next.delete(active);
      else next.add(active);
      window.localStorage.setItem('llm-interview-completed', JSON.stringify([...next]));
      return next;
    });
  };

  const meta = pageMeta[active];
  const isSearching = query.trim().length > 0;
  const activeCompleted = completed.has(active);
  const searchPlaceholder = useMemo(() => '搜索 Token、Embedding、32k、RAG…', []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b bg-background/92 backdrop-blur-xl md:hidden">
        <div className="flex h-16 items-center justify-between gap-3 px-4">
          <button type="button" onClick={() => navigate('roadmap')} className="flex min-w-0 items-center gap-2.5 text-left">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground"><BrainCircuit className="size-5" /></span>
            <span className="min-w-0"><span className="block truncate font-heading text-sm font-semibold">LLM 面试知识库</span><span className="block truncate text-xs text-muted-foreground">{meta.label}</span></span>
          </button>
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger render={<Button variant="outline" size="icon" aria-label="打开课程目录" />}><Menu /></SheetTrigger>
            <SheetContent side="left" className="w-[88%] p-0" showCloseButton>
              <SheetHeader className="sr-only"><SheetTitle>课程目录</SheetTitle><SheetDescription>选择学习地图或课程</SheetDescription></SheetHeader>
              <SidebarContent active={active} completed={completed} onNavigate={navigate} />
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r bg-sidebar md:flex">
        <SidebarContent active={active} completed={completed} onNavigate={navigate} />
      </aside>

      <main className="md:pl-72">
        <div className="border-b bg-background/82 backdrop-blur-xl md:sticky md:top-0 md:z-20">
          <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-7 lg:px-10">
            <div className="relative flex-1 sm:max-w-md">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={searchPlaceholder} aria-label="搜索课程知识点" className="h-10 pl-9" />
            </div>
            <Badge variant="outline" className="hidden sm:inline-flex">已收录 2 / 12</Badge>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-7 md:py-10 lg:px-10">
          {!isSearching ? (
            <div className="mb-8 flex flex-wrap items-start justify-between gap-5">
              <div className="max-w-3xl">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{meta.label}</Badge>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Clock3 className="size-3.5" />{meta.duration}</span>
                </div>
                <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">{meta.title}</h1>
                <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">{meta.description}</p>
              </div>
              {active !== 'roadmap' ? (
                <Button variant={activeCompleted ? 'secondary' : 'outline'} size="lg" onClick={toggleComplete}>
                  {activeCompleted ? '已学完' : '标记已学完'}
                  <CheckCircle2 data-icon="inline-end" />
                </Button>
              ) : null}
            </div>
          ) : null}

          <div className={`grid gap-7 ${isSearching ? '' : 'lg:grid-cols-[minmax(0,1fr)_280px]'}`}>
            <div className="min-w-0">
              {isSearching ? <SearchResults query={query} onNavigate={navigate} /> : active === 'roadmap' ? <Roadmap onNavigate={navigate} /> : active === 'lesson-1' ? <LessonOne onNext={() => navigate('lesson-2')} /> : <LessonTwo onPrevious={() => navigate('lesson-1')} onRoadmap={() => navigate('roadmap')} />}
            </div>
            {!isSearching ? <StudyAside active={active} /> : null}
          </div>
        </div>
      </main>
    </div>
  );
}
