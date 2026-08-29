'use client';

import { ArrowLeft, ArrowRight, CheckCircle2, CircleAlert, Layers3, Search } from 'lucide-react';

import {
  ContextBudgetDemo,
  FormulaBlock,
  InterviewAnswer,
  KeyStatement,
  LessonSection,
  QuizList,
} from '@/components/learning-widgets';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const pipeline = [
  ['文本', '“苹果发布了新手机”'],
  ['Tokenizer', '[苹果] [发布] [了] [新] [手机]'],
  ['Token IDs', '[5231, 904, 71, 318, 6208]'],
  ['Embedding', '每个 ID 查表得到一个初始向量'],
  ['Transformer', '加入位置与上下文，形成 Hidden State'],
];

export function LessonTwo({ onPrevious, onNext }: { onPrevious: () => void; onNext: () => void }) {
  return (
    <article className="lesson-article space-y-10">
      <KeyStatement>
        文本先被 Tokenizer 切成 Token 并映射为 ID；模型用 ID 查 Embedding 矩阵得到向量，再结合位置与上下文形成 Hidden State。
      </KeyStatement>

      <LessonSection id="lesson-2-goals" eyebrow="01 · 学习目标" title="这一课会打通两条工程主线">
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            '文本如何变成模型可计算的向量',
            'Token、ID、Embedding、Hidden State 的区别',
            'Context Window 到底统计哪些内容',
            '为什么模型支持 128k，业务仍可能限制 32k',
          ].map((goal) => (
            <div key={goal} className="flex gap-3 rounded-xl border bg-card p-4 text-foreground">
              <CheckCircle2 className="mt-1 size-4 shrink-0 text-primary" />
              <span>{goal}</span>
            </div>
          ))}
        </div>
      </LessonSection>

      <LessonSection id="lesson-2-pipeline" eyebrow="02 · 总流程" title="文字进入模型后经历什么">
        <p>下面只是帮助理解的示例；真实切分由具体模型的 Tokenizer 决定。</p>
        <div className="space-y-2">
          {pipeline.map(([name, detail], index) => (
            <div key={name} className="grid gap-2 rounded-xl border bg-card p-4 sm:grid-cols-[42px_120px_1fr] sm:items-center">
              <span className="grid size-9 place-items-center rounded-lg bg-muted font-mono text-xs text-primary">0{index + 1}</span>
              <strong className="font-mono text-sm text-foreground">{name}</strong>
              <code className="overflow-x-auto font-mono text-xs text-muted-foreground">{detail}</code>
            </div>
          ))}
        </div>
      </LessonSection>

      <LessonSection id="lesson-2-tokenizer" eyebrow="03 · Tokenizer" title="为什么现代 LLM 通常使用子词">
        <div className="grid gap-3 md:grid-cols-3">
          {[
            ['字符级', '词表小、几乎无新词', '同样文本会很长，计算成本高'],
            ['完整单词级', '常见文本序列较短', '词表巨大，罕见词与新词难覆盖'],
            ['子词级', '常见词可保持完整，罕见词可拆分', '需要从语料中学习切分规则'],
          ].map(([title, good, tradeoff]) => (
            <Card key={title}>
              <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm leading-6 text-muted-foreground">
                <p><span className="font-medium text-emerald-700 dark:text-emerald-300">优点：</span>{good}</p>
                <p><span className="font-medium text-amber-700 dark:text-amber-300">代价：</span>{tradeoff}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <p>
          例如 <code>unhappiness</code> 可能被切成 <code>[un] [happi] [ness]</code>。核心权衡是：
        </p>
        <FormulaBlock>词表大小 ↔ 序列长度 ↔ 语言覆盖 ↔ 参数与计算成本</FormulaBlock>
        <div className="overflow-hidden rounded-xl border bg-card">
          {[
            ['BPE', '从小单元开始，反复合并高频相邻片段；实现简单，应用广泛。'],
            ['WordPiece', '倾向选择更有利于语料建模的子词；编码时常见最长匹配。'],
            ['Unigram', '从较大的候选词表开始，逐步删除贡献较低的子词，并为切分赋概率。'],
          ].map(([name, text], index) => (
            <div key={name} className={`grid gap-1 p-4 sm:grid-cols-[110px_1fr] ${index ? 'border-t' : ''}`}>
              <strong className="font-mono text-primary">{name}</strong>
              <span>{text}</span>
            </div>
          ))}
        </div>
        <Card className="border-primary/25 bg-primary/5">
          <CardContent className="pt-6 text-sm leading-6 text-foreground">
            <strong>高频追问：</strong>SentencePiece 是 Tokenizer 工具框架，可以实现 BPE 或 Unigram；它不是与这三者并列的“第四种子词算法”。
          </CardContent>
        </Card>
      </LessonSection>

      <LessonSection id="lesson-2-vocab" eyebrow="04 · 词表权衡" title="词表越大越好吗">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>较大词表</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm leading-6 text-muted-foreground">
              <p>常见文本可能需要更少 Token，更节省上下文位置。</p>
              <p>但 Embedding 和输出层矩阵更大，低频 Token 也可能训练不足。</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>较小词表</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm leading-6 text-muted-foreground">
              <p>矩阵较小，每个 Token 更容易获得充分训练。</p>
              <p>但词会被切得更碎，序列变长，Attention 和上下文成本上升。</p>
            </CardContent>
          </Card>
        </div>
        <p>如果词表大小是 <code>V</code>，模型维度是 <code>d</code>，输入 Embedding 矩阵为：</p>
        <FormulaBlock label="Embedding 矩阵">E ∈ R^(V × d)    参数量 = V × d</FormulaBlock>
        <p>
          例如 <code>V=100,000</code>、<code>d=4,096</code>，共有 409.6M 个参数。若使用 BF16/FP16，每个参数约 2 字节，仅该矩阵约占 819 MB。部分模型会让输入 Embedding 与输出层共享权重。
        </p>
      </LessonSection>

      <LessonSection id="lesson-2-id-embedding" eyebrow="05 · ID 与向量" title="Token ID 本身没有语义">
        <p>Tokenizer 词表可以看成一个映射表：</p>
        <FormulaBlock>Token “北京” → id = 105
x = EmbeddingMatrix[105]</FormulaBlock>
        <p>
          ID 只是数组索引。105 不比 20 更重要，105 与 106 也不一定语义相近；不同模型的 ID 通常不能互用。真正进入神经网络计算的是查表得到的向量。
        </p>
        <div className="grid gap-3 md:grid-cols-3">
          {[
            ['Token Embedding', '单个 Token 的初始查表结果', '同一 ID 初始向量相同', '生成模型输入'],
            ['Contextual Hidden State', '该位置与上下文交互后的表示', '随语境改变', 'Attention 与下一 Token 预测'],
            ['Sentence Embedding', '整句话或文档的固定长度向量', '随文本内容改变', '语义搜索、RAG、聚类'],
          ].map(([title, what, context, usage]) => (
            <Card key={title}>
              <CardHeader><CardTitle className="font-mono text-base">{title}</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm leading-6 text-muted-foreground">
                <p>{what}</p>
                <Badge variant="secondary">{context}</Badge>
                <p><strong className="text-foreground">用途：</strong>{usage}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <p>
          “我吃了一个苹果”和“苹果发布了新手机”中的“苹果”若是同一 ID，初始 Token Embedding 可以相同；经过 Transformer 后，Hidden State 会因上下文不同而分别偏向“水果”和“公司”。
        </p>
      </LessonSection>

      <LessonSection id="lesson-2-similarity" eyebrow="06 · RAG 联系" title="Sentence Embedding 为什么能检索">
        <p>
          专门训练的 Embedding 模型会把语义相近的句子映射到向量空间中较近的位置。检索时常用余弦相似度比较方向：
        </p>
        <FormulaBlock label="Cosine Similarity">cos(a,b) = (a · b) / (||a|| × ||b||)</FormulaBlock>
        <p>
          如果向量已经做 L2 归一化，即 <code>||a||=||b||=1</code>，余弦相似度就等于点积。工程上还要关注模型是否适配中文、查询与文档是否需要不同前缀、向量维度、归一化方式以及距离度量是否匹配。
        </p>
        <Card>
          <CardContent className="flex gap-3 pt-6 text-sm leading-6 text-muted-foreground">
            <Search className="mt-0.5 size-5 shrink-0 text-primary" />
            <p>
              RAG 中的 Sentence Embedding 通常来自专门的检索模型，不能直接拿生成模型输入层的 Token Embedding 做等价替代。
            </p>
          </CardContent>
        </Card>
      </LessonSection>

      <LessonSection id="lesson-2-position" eyebrow="07 · 位置与模板" title="顺序、角色和边界如何进入模型">
        <p>
          仅有 Token Embedding，模型难以区分“我打你”和“你打我”。因此模型需要位置表示。现代 LLM 常用 RoPE，把位置信息旋转地融入 Attention 的 Query 与 Key。
        </p>
        <FormulaBlock>模型输入 = Token 表示 ⊕ Position 信息</FormulaBlock>
        <p>
          这里的 <code>⊕</code> 表示融合，不一定是直接相加。只把配置里的 32k 改成 128k，通常不能可靠扩展上下文；位置编码方案、训练长度与长上下文数据都会影响真实效果。
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Chat Template</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
              <p>API 中的 role 与 JSON 最终会被模板转换为模型能读取的 Token 序列：</p>
              <FormulaBlock>&lt;SYSTEM&gt;...&lt;END&gt;
&lt;USER&gt;什么是 Token？&lt;END&gt;
&lt;ASSISTANT&gt;</FormulaBlock>
              <p>模板错配可能造成角色混乱、系统指令失效、提前 EOS 或工具格式异常。</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>两种常见 Mask</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
              <p><strong className="text-foreground">Padding Mask：</strong>让批处理补齐用的 PAD 不参与有效计算。</p>
              <p><strong className="text-foreground">Causal Mask：</strong>让当前位置不能看到未来 Token，保证自回归生成。</p>
              <p>两者解决不同问题，面试时不要混为一谈。</p>
            </CardContent>
          </Card>
        </div>
      </LessonSection>

      <LessonSection id="lesson-2-context" eyebrow="08 · Context Window" title="上下文窗口统计的不只是用户问题">
        <FormulaBlock>T_system + T_template + T_history + T_tool_schema
+ T_RAG + T_tool_results + T_current + T_output ≤ C_model</FormulaBlock>
        <p>
          系统提示、角色模板、历史消息、工具定义、RAG 证据、工具返回值、当前问题和输出都可能占 Token。字符数不能替代 Token 数；生产系统应使用目标模型对应的 Tokenizer 计数。
        </p>
        <ContextBudgetDemo />
        <p>
          工具在外部真正执行搜索或数据库查询，本身不消耗模型 Context；但工具 Schema 要先提供给模型，调用参数与结果也要重新进入上下文，因此都会消耗 Token。
        </p>
      </LessonSection>

      <LessonSection id="lesson-2-32k" eyebrow="09 · 项目追问" title="“32k Token”可能代表三件不同的事">
        <div className="space-y-3">
          {[
            ['C_model：模型技术窗口', '单次模型计算允许的输入与输出总长度上限。'],
            ['B_call：业务单次预算', '为了成本、延迟、并发和质量，应用主动设置的小于模型窗口的限制。'],
            ['B_run：Agent 运行累计预算', '多轮模型调用的输入与输出累计额度，用于阻止失控循环与成本超限。'],
          ].map(([title, text], index) => (
            <div key={title} className="grid gap-2 rounded-xl border bg-card p-4 sm:grid-cols-[42px_220px_1fr] sm:items-center">
              <span className="grid size-9 place-items-center rounded-full bg-primary text-sm text-primary-foreground">{index + 1}</span>
              <strong className="font-mono text-sm text-foreground">{title}</strong>
              <span>{text}</span>
            </div>
          ))}
        </div>
        <FormulaBlock label="Agent 累计预算">B_used = Σ_i (T_input_i + T_output_i)
B_used + B_reserved ≤ B_run</FormulaBlock>
        <Card className="border-amber-500/25 bg-amber-500/8">
          <CardContent className="pt-6 text-sm leading-6 text-foreground">
            简历或项目里写了“32k Token 预算”，面试时必须结合真实代码确认它是哪一种：按单次请求还是整个 Run 累计？是否包含工具 Schema、命中缓存的 Token 和输出？并发任务如何预留与回收？不要凭名词猜实现。
          </CardContent>
        </Card>
      </LessonSection>

      <LessonSection id="lesson-2-truncation" eyebrow="10 · 长上下文管理" title="能放更多，不代表应该全部塞进去">
        <p>长输入会增加 Prefill 延迟、费用、KV Cache 占用和无关信息干扰，模型还可能出现“中间信息不易召回”的问题。推荐保留优先级：</p>
        <FormulaBlock>系统与安全约束
&gt; 当前问题
&gt; 直接相关证据与必要业务状态
&gt; 最近完整对话
&gt; 较旧、低相关历史</FormulaBlock>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ['完整回合截断', '删除较旧的完整消息，不从 JSON、代码块或工具调用中间硬切。'],
            ['结构化摘要', '把旧历史压成事实、决策、待办和约束，而非保留全部原文。'],
            ['按需 RAG', '外部存储完整状态，每轮只检索当前任务真正需要的片段。'],
            ['输出预留', '输入不能占满窗口，要为回答、模板变化和计数误差留空间。'],
          ].map(([title, text]) => (
            <Card key={title}>
              <CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader>
              <CardContent className="text-sm leading-6 text-muted-foreground">{text}</CardContent>
            </Card>
          ))}
        </div>
        <p>
          Agent 的完整状态更适合保存在数据库、对象存储或状态机中；Prompt 是每轮对状态的“投影”，只携带当下决策必需的信息。
        </p>
      </LessonSection>

      <LessonSection id="lesson-2-interview" eyebrow="11 · 面试表达" title="60 秒综合回答">
        <InterviewAnswer question="文字如何进入 LLM？Context Window 又如何计算？">
          文本会先由 Tokenizer 按子词切分并映射成 Token ID。ID 本身只是词表索引，模型用它查 Embedding 矩阵得到初始向量，再结合位置信息进入 Transformer。经过多层上下文交互后，每个位置形成 Contextual Hidden State，并用于预测下一个 Token。Context Window 统计的不只是用户问题，还包括系统提示、Chat Template、历史消息、工具定义与结果、RAG 文档和输出。模型窗口是技术上限，生产系统通常还会设置更小的单次业务预算或 Agent 累计预算，并通过完整回合截断、摘要和按需检索控制成本与质量。
        </InterviewAnswer>
        <Card>
          <CardHeader><CardTitle>面试官继续追问时</CardTitle></CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            {[
              ['Tokenizer', '讲子词的折中、BPE/WordPiece/Unigram、语言覆盖。'],
              ['Embedding', '讲 ID 无语义、三种 Embedding、余弦相似度。'],
              ['Context', '讲完整计数、输出预留、32k 三种口径与截断策略。'],
            ].map(([title, text]) => (
              <div key={title} className="rounded-xl bg-muted p-4 text-sm leading-6">
                <strong className="mb-1 block font-mono text-foreground">{title}</strong>
                <span>{text}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </LessonSection>

      <LessonSection id="lesson-2-mistakes" eyebrow="12 · 避坑" title="七个容易被追问打穿的说法">
        <div className="space-y-3">
          {[
            ['Token ID 越接近，语义越相似', 'ID 只是词表索引，语义来自向量与上下文。'],
            ['同一个 Token 的向量永远相同', '初始 Token Embedding 可相同，Hidden State 会随语境改变。'],
            ['SentencePiece 是第四种子词算法', '它是工具框架，可使用 BPE 或 Unigram。'],
            ['Chat API 的 role 会被模型直接理解', 'role 通常先由 Chat Template 转为特殊 Token 序列。'],
            ['32k 等于 3.2 万个中文字', 'Token 与字符不一一对应，且不同模型切分不同。'],
            ['模型支持 128k，输入就能放满 128k', '输入与输出共享窗口，还需考虑模板和安全余量。'],
            ['更长上下文一定更好', '它会增加延迟、成本和干扰，且召回质量不一定线性提升。'],
          ].map(([wrong, right]) => (
            <div key={wrong} className="flex gap-3 rounded-xl border bg-card p-4">
              <CircleAlert className="mt-1 size-4 shrink-0 text-destructive" />
              <div>
                <p className="font-medium text-foreground line-through decoration-destructive/60">{wrong}</p>
                <p>{right}</p>
              </div>
            </div>
          ))}
        </div>
      </LessonSection>

      <LessonSection id="lesson-2-quiz" eyebrow="13 · 主动回忆" title="闭卷检查是否真的理解">
        <QuizList
          questions={[
            { question: '为什么现代 LLM 通常选择子词，而不是只用字符或完整单词？', answer: '子词在词表大小、序列长度和开放词汇能力之间取得折中：常见词可保持完整，罕见词可由较小片段组合。' },
            { question: 'Token ID 为 5000，是否比 ID 为 20 的 Token 更有语义？', answer: '不是。Token ID 只是词表索引，数值大小与距离不表达语义。' },
            { question: '水果和公司语境里的“苹果”，Token Embedding 与 Hidden State 分别是否相同？', answer: '如果是同一 ID，初始 Token Embedding 通常相同；经过上下文计算后的 Hidden State 不同。' },
            { question: 'V=50,000、d=4,096，输入 Embedding 有多少参数？', answer: '50,000 × 4,096 = 204,800,000 个参数。' },
            { question: '模型支持 128k，业务限制 32k；系统与工具 4k、历史与 RAG 21k、问题 2k、输出预留 6k，是否超限？', answer: '总量 33k，超过 32k 的业务预算，但没有超过 128k 的模型技术窗口。' },
            { question: '工具在外部执行是否消耗 Context？工具为什么仍与 Token 预算有关？', answer: '外部执行动作本身不占 Context；但工具 Schema、调用参数和返回结果会进入模型上下文，因此消耗 Token。' },
            { question: '为什么不能从任意 Token 位置硬截断对话？', answer: '可能破坏角色边界、工具调用与结果配对、JSON、代码或关键语义。应按完整结构和信息优先级截断。' },
          ]}
        />
      </LessonSection>

      <Card className="bg-muted/60">
        <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <Layers3 className="mt-1 size-5 shrink-0 text-primary" />
            <div>
              <p className="font-medium text-foreground">下一课：Transformer 与 Self-Attention</p>
              <p className="text-sm leading-6 text-muted-foreground">Q、K、V 是什么？模型怎样让不同 Token 彼此交换信息？</p>
            </div>
          </div>
          <Badge>已解锁</Badge>
        </CardContent>
      </Card>

      <div className="flex flex-wrap justify-between gap-3 border-t pt-6">
        <Button variant="outline" size="lg" onClick={onPrevious}>
          <ArrowLeft data-icon="inline-start" />
          返回 Lesson 01
        </Button>
        <Button size="lg" onClick={onNext}>
          下一课：Transformer 与 Attention
          <ArrowRight data-icon="inline-end" />
        </Button>
      </div>
    </article>
  );
}
