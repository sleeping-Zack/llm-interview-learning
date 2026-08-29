'use client';

import { ArrowLeft, ArrowRight, CheckCircle2, CircleAlert, Database, FlaskConical, GraduationCap } from 'lucide-react';

import {
  DeepDive,
  FormulaBlock,
  InterviewAnswer,
  KeyStatement,
  LessonSection,
  QuizList,
  SftMaskDemo,
} from '@/components/learning-widgets';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function LessonFour({ onPrevious, onNext }: { onPrevious: () => void; onNext: () => void }) {
  return (
    <article className="lesson-article space-y-10">
      <KeyStatement>
        预训练让模型学会语言、知识与通用模式；SFT 让它学会按指令和格式回答。两者通常仍在优化下一个 Token，只是数据分布和参与 Loss 的位置不同。
      </KeyStatement>

      <LessonSection id="lesson-4-goals" eyebrow="01 · 学习目标" title="从“模型会生成”走到“模型怎样被教会”">
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            '解释 Cross Entropy、Teacher Forcing 与反向传播',
            '读懂 Batch、Sequence、Packing 与梯度累积',
            '说明数据清洗、去重、配比为什么决定能力',
            '区分 Base、Instruct、Chat 与 SFT Loss Mask',
          ].map((goal) => <div key={goal} className="flex gap-3 rounded-xl border bg-card p-4 text-foreground"><CheckCircle2 className="mt-1 size-4 shrink-0 text-primary" />{goal}</div>)}
        </div>
      </LessonSection>

      <LessonSection id="lesson-4-stages" eyebrow="02 · 训练全景" title="一个对话模型通常经历三个阶段">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ['01', 'Pre-training', '海量网页、书籍、代码等', '学语言、知识和通用模式'],
            ['02', 'SFT', '指令—回答与多轮对话', '学任务执行、角色和输出格式'],
            ['03', 'Preference Alignment', 'chosen/rejected 或奖励信号', '学什么回答更有帮助、更安全'],
          ].map(([number, title, data, learns]) => (
            <Card key={title} className="overflow-hidden">
              <CardHeader className="border-b bg-muted/45"><span className="font-mono text-xs text-primary">{number}</span><CardTitle className="font-mono text-base">{title}</CardTitle></CardHeader>
              <CardContent className="space-y-2 pt-5 text-sm leading-6 text-muted-foreground"><p><strong className="text-foreground">数据：</strong>{data}</p><p><strong className="text-foreground">作用：</strong>{learns}</p></CardContent>
            </Card>
          ))}
        </div>
        <p>这些阶段通常继续更新同一个 Transformer 主体，而不是额外拼上三个独立模块。</p>
      </LessonSection>

      <LessonSection id="lesson-4-pretraining" eyebrow="03 · 预训练目标" title="海量文本如何变成海量练习题">
        <p>以 Decoder-only LLM 为例，一段长度为 T 的文本几乎每个位置都能提供一次监督信号：</p>
        <FormulaBlock>P(x₁, x₂, ..., x_T) = ∏&#123;t=1...T&#125; P(x_t | x_&#123;&lt;t&#125;)</FormulaBlock>
        <div className="rounded-xl border bg-card p-4 font-mono text-sm leading-8 text-muted-foreground">
          输入「今」 → 预测「天」<br />
          输入「今天」 → 预测「天」<br />
          输入「今天天」 → 预测「气」<br />
          输入「今天天气」 → 预测「很」
        </div>
        <p>
          为持续预测准确，模型必须压缩语法、事实关联、代码结构和常见推理文本模式。但它学到的是条件概率，不是一个自带来源和事实核验能力的知识数据库。
        </p>
      </LessonSection>

      <LessonSection id="lesson-4-loss" eyebrow="04 · Cross Entropy" title="模型如何知道自己错了">
        <p>语言模型在每个位置都对整个词表做一次多分类。若真实 Token 概率越低，惩罚越大：</p>
        <FormulaBlock label="单个位置">Loss_t = -log P(x_t^real | x_&#123;&lt;t&#125;)</FormulaBlock>
        <FormulaBlock label="有效位置平均">L = -(1/N) Σ_t m_t · log P(x_t^real | x_&#123;&lt;t&#125;)</FormulaBlock>
        <p>
          <code>m_t</code> 是 Loss Mask，决定哪些位置参与平均。Padding、用户输入或其他不希望监督的位置可以被排除。最小化 Cross Entropy 等价于最大化训练语料的似然。
        </p>
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6 text-sm leading-6 text-foreground">
            面试别只说“交叉熵用于分类”。更完整地说：每个 Token 位置都对整个词表分类，交叉熵衡量模型概率分布与真实下一个 Token 的差异。
          </CardContent>
        </Card>
      </LessonSection>

      <LessonSection id="lesson-4-teacher" eyebrow="05 · Teacher Forcing" title="训练并行的关键前提">
        <p>训练时每个位置读取的是真实前缀，而不是模型上一步自己的预测：</p>
        <FormulaBlock>输入：&lt;BOS&gt; 机器 学习 很 有趣
标签：机器   学习 很 有趣 &lt;EOS&gt;</FormulaBlock>
        <p>
          即使模型在某个位置预测错了，下一个位置仍使用训练数据中的正确前缀。配合 Causal Mask，整段序列可以并行计算，又不会偷看未来答案。
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <Card><CardHeader><CardTitle>优势</CardTitle></CardHeader><CardContent className="text-sm leading-6 text-muted-foreground">训练稳定、数据利用率高、矩阵计算高效，可以同时获得多个位置的梯度。</CardContent></Card>
          <Card><CardHeader><CardTitle>Exposure Bias</CardTitle></CardHeader><CardContent className="text-sm leading-6 text-muted-foreground">训练总看正确前缀，推理却会读到自己的错误前缀；早期错误可能在后续不断放大。</CardContent></Card>
        </div>
      </LessonSection>

      <LessonSection id="lesson-4-backprop" eyebrow="06 · 参数更新" title="反向传播不是一句“答错了”">
        <div className="grid gap-2 sm:grid-cols-5">
          {['Token IDs', '前向传播', 'Cross Entropy', '反向传播', 'Optimizer 更新'].map((step, index) => (
            <div key={step} className="rounded-xl border bg-card p-3 text-center"><span className="mb-2 block font-mono text-xs text-primary">0{index + 1}</span><span className="text-xs font-medium text-foreground">{step}</span></div>
          ))}
        </div>
        <FormulaBlock>θ ← θ - η · ∇_θ L</FormulaBlock>
        <p>
          梯度 <code>∇_θ L</code> 描述参数轻微变化会让 Loss 向哪个方向改变；优化器据此更新参数。实际大模型常用 AdamW，还会结合权重衰减、梯度裁剪、混合精度等手段。
        </p>
      </LessonSection>

      <LessonSection id="lesson-4-optimizer" eyebrow="加深 A · Optimizer" title="AdamW 为什么比一句“沿梯度下山”更复杂">
        <DeepDive
          title="梯度给方向，Optimizer 决定真正迈多大一步"
          intuition={<>普通梯度下降只看当前坡度；Adam 像同时记一本“最近总体往哪走”和“这里平时抖得多不多”的日志，为不同参数调节步长。</>}
          mechanism={<>Adam 为每个参数维护梯度的一阶动量 <code>m</code> 和平方梯度的二阶动量 <code>v</code>；AdamW 再把 Weight Decay 与梯度更新解耦。</>}
          takeaway={<>Optimizer 状态也是与参数同规模的大数组，所以<strong className="text-foreground">训练显存远大于只加载权重做推理</strong>。</>}
        />
        <FormulaBlock label="Adam 的两本历史账">m_t = β₁m_&#123;t-1&#125; + (1-β₁)g_t
          {'\n'}v_t = β₂v_&#123;t-1&#125; + (1-β₂)g_t²</FormulaBlock>
        <div className="grid gap-3 sm:grid-cols-4">
          {[
            ['低精度权重', '约 2 B / 参数'],
            ['梯度', '约 2 B / 参数'],
            ['FP32 主权重', '约 4 B / 参数'],
            ['Adam m + v', '约 8 B / 参数'],
          ].map(([title, value]) => <div key={title} className="rounded-xl border bg-card p-4"><p className="text-xs text-muted-foreground">{title}</p><p className="mt-1 font-mono text-sm font-semibold text-foreground">{value}</p></div>)}
        </div>
        <p>
          上面是常见混合精度全量训练的数量级直觉，合计可接近 <code>16 Bytes / 参数</code>，还没算激活和临时张量。具体实现会因精度、分片、量化优化器与框架而变化，不能把 16 当成永远精确的常数。
        </p>
      </LessonSection>

      <LessonSection id="lesson-4-batch" eyebrow="07 · 训练批次" title="Batch、Sequence 与一次参数更新">
        <FormulaBlock>Input shape = [Batch Size, Sequence Length]
Global Batch ≈ Micro Batch × GPU 数 × Gradient Accumulation
Tokens per Update ≈ Global Batch × Sequence Length</FormulaBlock>
        <p>
          例如 Batch=8、Sequence=4096，一次前向最多处理 32,768 Tokens。大模型训练更常用“训练了多少 Token”而非“多少篇文章”衡量规模。
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ['Padding', '短样本补到统一长度，实现简单但浪费计算；Attention Mask 与 Loss Mask 必须正确。'],
            ['Packing', '把多条短样本拼入一条序列，提高有效 Token 比例，但要严格处理边界。'],
            ['Gradient Accumulation', '连续累积多个小 Batch 的梯度后再更新，省显存但增加每次更新耗时。'],
          ].map(([title, text]) => <Card key={title}><CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader><CardContent className="text-sm leading-6 text-muted-foreground">{text}</CardContent></Card>)}
        </div>
        <p>序列越长，能容纳的上下文越多，但标准 Attention 计算增长很快。训练中常使用长度分桶、动态 Padding、Packing 与梯度检查点。</p>
      </LessonSection>

      <LessonSection id="lesson-4-precision" eyebrow="加深 B · 精度与激活" title="混合精度不是把所有数字都粗暴变成 16 位">
        <DeepDive
          title="小计算器负责大部分工作，关键账目保留高精度"
          intuition={<>大矩阵乘法用更省显存、更快的 BF16/FP16；容易累积误差的归一化、累加或优化器状态则可能保留 FP32。</>}
          mechanism={<>FP16 尾数更细但指数范围较窄，常需 Loss Scaling 防止小梯度变成 0；BF16 的指数范围接近 FP32，更耐大范围数值，但尾数并不更精细。</>}
          takeaway={<>BF16 的优势主要是<strong className="text-foreground">数值范围更稳</strong>，不是“精度全面高于 FP16”。出现 NaN 仍要查学习率、异常数据和梯度范数。</>}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <Card><CardHeader><CardTitle>激活像解题草稿</CardTitle></CardHeader><CardContent className="text-sm leading-6 text-muted-foreground">为了反向传播，每层的中间结果通常要暂存。它大致随 Micro Batch、序列长度、层数和隐藏维度增长，长序列还会引入昂贵的 Attention 中间计算。</CardContent></Card>
          <Card><CardHeader><CardTitle>Gradient Checkpointing</CardTitle></CardHeader><CardContent className="text-sm leading-6 text-muted-foreground">前向时少留一部分“草稿”，反向时再重算。它用更多计算时间换更少激活显存，不会减少模型参数，也不会让总计算凭空消失。</CardContent></Card>
        </div>
      </LessonSection>

      <LessonSection id="lesson-4-data" eyebrow="08 · 数据工程" title="数量、质量、去重和配比共同决定能力">
        <div className="space-y-3">
          {[
            ['清洗', '移除乱码、网页模板、广告、低信息文本，做语言识别、隐私与许可证处理。'],
            ['精确与近似去重', '减少重复记忆、分布扭曲、计算浪费、隐私风险与测试泄漏。'],
            ['数据配比', '为通用网页、代码、书籍、中文、数学等来源设置采样权重，塑造能力分布。'],
            ['去污染', '检查训练集与评测集的精确或语义相似内容，避免“背过答案”的虚高分。'],
          ].map(([title, text], index) => (
            <div key={title} className="grid gap-2 rounded-xl border bg-card p-4 sm:grid-cols-[42px_110px_1fr] sm:items-center"><span className="grid size-8 place-items-center rounded-lg bg-primary/10 font-mono text-xs text-primary">{index + 1}</span><strong className="text-foreground">{title}</strong><span>{text}</span></div>
          ))}
        </div>
        <p>
          清洗并非越狠越好：过滤器也可能误删方言、小语种或专业文本。小类数据过度采样虽然提升曝光次数，也可能造成记忆和过拟合。
        </p>
      </LessonSection>

      <LessonSection id="lesson-4-optimization" eyebrow="09 · 训练稳定性" title="学习率、Batch 与 Scaling Law">
        <div className="grid gap-4 md:grid-cols-2">
          <Card><CardHeader><CardTitle>Learning Rate</CardTitle></CardHeader><CardContent className="space-y-2 text-sm leading-6 text-muted-foreground"><p>过大易震荡、发散或破坏旧能力；过小则收敛慢、预算内学不充分。</p><p>常见策略：Warmup 从小步开始，达到峰值后再 Linear/Cosine Decay。</p></CardContent></Card>
          <Card><CardHeader><CardTitle>Batch Size</CardTitle></CardHeader><CardContent className="space-y-2 text-sm leading-6 text-muted-foreground"><p>较大 Batch 可提升硬件利用率、降低梯度噪声，但增加显存并改变优化动态。</p><p>Batch 改变后，学习率与训练步数通常也要重调。</p></CardContent></Card>
        </div>
        <FormulaBlock label="Scaling Law 直觉">Loss ≈ C + A / N^α + B / D^β</FormulaBlock>
        <p>
          <code>N</code> 是参数量，<code>D</code> 是训练 Token 数。Scaling Law 说明在一定范围内规模增加有可预测趋势，但重点是模型、数据和计算的配平，不是“参数越多一定越好”。
        </p>
        <FormulaBlock label="Dense Transformer 训练算力粗估">Training FLOPs ≈ 6 × N × D</FormulaBlock>
        <p>
          这是建立数量级的近似，不是云账单公式。它提醒我们：参数翻倍或训练 Token 翻倍，计算量都会大致同比增加；同样 Token 数下，重复、低质数据的有效信息仍可能很低。
        </p>
      </LessonSection>

      <LessonSection id="lesson-4-model-types" eyebrow="10 · 模型形态" title="Base、Instruct 与 Chat 的区别">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ['Base', '主要完成预训练', '擅长续写，不一定把“写首诗”当成必须执行的命令。'],
            ['Instruct', 'Base + 指令 SFT/对齐', '学习识别意图、遵循要求和使用指定格式。'],
            ['Chat', '面向多轮对话的 Instruct 形态', '包含角色、特殊 Token、Chat Template，可能支持工具调用。'],
          ].map(([title, training, behavior]) => (
            <Card key={title}><CardHeader><Badge variant="secondary" className="w-fit">{training}</Badge><CardTitle>{title}</CardTitle></CardHeader><CardContent className="text-sm leading-6 text-muted-foreground">{behavior}</CardContent></Card>
          ))}
        </div>
        <p>这些名称不是严格统一的行业标准，最终应查看模型卡、Tokenizer 与官方 Chat Template。模板错配可能直接导致角色混乱或无法正确停止。</p>
      </LessonSection>

      <LessonSection id="lesson-4-sft" eyebrow="11 · SFT" title="输入完整对话，常常只监督 Assistant">
        <p>SFT 数据通常先经 Chat Template 序列化，再 Tokenize。底层仍是 Cross Entropy，只是监督目标集中在希望模型生成的回答部分：</p>
        <SftMaskDemo />
        <p>
          这是常见而非唯一做法。有的训练会对全序列计算 Loss，或给不同角色不同权重。多轮数据也可训练全部 Assistant 回合或只训练最后一轮，关键是模板、边界、EOS 与线上推理保持一致。
        </p>
      </LessonSection>

      <LessonSection id="lesson-4-choices" eyebrow="12 · 方法选型" title="继续预训练、SFT、RAG 与 LoRA 解决不同问题">
        <div className="overflow-hidden rounded-xl border bg-card">
          {[
            ['继续预训练', '领域语言、稳定知识分布与通用模式不足'],
            ['SFT', '任务执行、回答结构、工具调用和输出格式不稳定'],
            ['RAG', '知识经常更新，回答需要证据与可追溯来源'],
            ['LoRA / QLoRA', '它是低成本更新参数的方式，可承载 SFT 或偏好训练'],
          ].map(([method, purpose], index) => <div key={method} className={`grid gap-1 p-4 sm:grid-cols-[150px_1fr] ${index ? 'border-t' : ''}`}><strong className="font-mono text-primary">{method}</strong><span>{purpose}</span></div>)}
        </div>
        <FormulaBlock>Prompt / Few-shot 基线 → RAG 解决知识 → 有稳定数据再做 SFT → LoRA 小成本验证</FormulaBlock>
      </LessonSection>

      <LessonSection id="lesson-4-risks" eyebrow="13 · 训练风险" title="过拟合、灾难性遗忘与数据泄漏">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            [FlaskConical, '过拟合', '训练 Loss 继续下降，但验证集和真实任务变差；模型机械模仿固定答案。'],
            [GraduationCap, '灾难性遗忘', '新任务变好，却破坏数学、代码或通用问答等原能力。'],
            [Database, '数据泄漏', '评测题或高度相似答案进入训练集，使分数变成“背题能力”。'],
          ].map(([Icon, title, text]) => {
            const ItemIcon = Icon as typeof Database;
            return <Card key={title as string}><CardHeader><ItemIcon className="size-5 text-primary" /><CardTitle>{title as string}</CardTitle></CardHeader><CardContent className="text-sm leading-6 text-muted-foreground">{text as string}</CardContent></Card>;
          })}
        </div>
        <p>
          缓解手段包括更小学习率、减少 Epoch、Early Stopping、混入通用数据、多任务训练、LoRA，以及同时监控目标任务与通用能力。LoRA 冻结基座权重，但加载 Adapter 后的整体行为仍可能退化。
        </p>
      </LessonSection>

      <LessonSection id="lesson-4-eval" eyebrow="14 · 评测" title="训练 Loss 不是上线结论">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ['Train', '用于更新参数'],
            ['Validation', '用于选超参数和 Early Stopping'],
            ['Hidden Test', '只用于最后客观评估，不能反复调参'],
          ].map(([title, text]) => <div key={title} className="rounded-xl border bg-card p-4"><strong className="font-mono text-primary">{title}</strong><p className="mt-1 text-sm">{text}</p></div>)}
        </div>
        <p>至少同时检查任务成功率、格式合法率、事实性、引用正确率、安全性、通用能力回归、不同长度与难度切片，而不是只看一个平均 Loss。</p>
      </LessonSection>

      <LessonSection id="lesson-4-interview" eyebrow="15 · 面试表达" title="60 秒标准回答">
        <InterviewAnswer question="预训练和 SFT 分别在做什么？">
          Decoder-only 模型的预训练通常基于真实前缀预测下一个 Token。训练时使用 Teacher Forcing 和 Causal Mask，所有位置可以并行计算，再用 Cross Entropy 衡量真实 Token 的负对数概率，通过反向传播和 AdamW 等优化器更新参数。预训练依赖海量、多样且清洗、去重和配比后的数据，主要形成语言、知识与通用能力。预训练后的 Base Model 擅长续写但未必遵循指令；SFT 再使用指令—回答或多轮数据继续训练，通常只对 Assistant 部分计算 Loss，让模型学习任务执行、输出格式和对话行为。工程上必须控制学习率、Batch、序列长度与数据分布，并用无泄漏的独立评测集检查泛化和灾难性遗忘。动态且需引用的知识通常优先 RAG，行为与格式适配才考虑 SFT 或 LoRA。
        </InterviewAnswer>
      </LessonSection>

      <LessonSection id="lesson-4-mistakes" eyebrow="16 · 避坑" title="八个常见错误说法">
        <div className="space-y-3">
          {[
            ['预训练是在把知识存进数据库', '知识和模式分布式编码在参数中，没有天然来源定位。'],
            ['SFT 使用完全不同的模型结构', '通常仍是原 Transformer 在新数据上继续训练。'],
            ['Teacher Forcing 会把当前答案泄漏给模型', '当前位置只能看真实前缀，未来答案由 Causal Mask 屏蔽。'],
            ['训练也必须逐 Token 串行', '完整序列已知，可以并行计算全部位置。'],
            ['训练 Loss 越低模型一定越好', '可能过拟合、泄漏，必须检查独立评测。'],
            ['Base 只是更弱的 Chat 模型', '主要差异是训练阶段和行为分布，不只是强弱。'],
            ['SFT 是更新企业知识的最佳办法', '动态可追溯知识通常更适合 RAG。'],
            ['LoRA 完全不会导致能力退化', 'Adapter 仍会改变整体输出分布。'],
          ].map(([wrong, right]) => <div key={wrong} className="flex gap-3 rounded-xl border bg-card p-4"><CircleAlert className="mt-1 size-4 shrink-0 text-destructive" /><div><p className="font-medium text-foreground line-through decoration-destructive/60">{wrong}</p><p>{right}</p></div></div>)}
        </div>
      </LessonSection>

      <LessonSection id="lesson-4-quiz" eyebrow="17 · 主动回忆" title="闭卷检验训练主线">
        <QuizList questions={[
          { question: '预训练阶段通常在优化什么？', answer: '给定真实历史 Token，提高真实下一个 Token 的概率；常用有效位置的平均 Cross Entropy，即负对数似然。' },
          { question: '训练为什么能并行，推理为什么通常串行？', answer: '训练时完整真实序列存在，可用 Teacher Forcing 和 Causal Mask 同时计算；推理时后一步依赖刚生成的实际 Token。' },
          { question: 'SFT 为什么常只对 Assistant Token 计算 Loss？', answer: 'System/User 是生成条件，Assistant 才是希望模型学习输出的目标；Mask 可让优化更聚焦。' },
          { question: '数据去重除了节省算力，还解决什么问题？', answer: '避免重复内容扭曲分布，降低机械记忆、隐私风险和训练—评测泄漏导致的虚高分。' },
          { question: '每天更新的企业价格知识优先 SFT 还是 RAG？', answer: '优先 RAG，因为更新快、可追溯；若输出格式仍不稳定，再考虑 SFT。' },
          { question: '微调后目标任务提升，但数学和代码下降，是什么问题？', answer: '灾难性遗忘或能力退化；可减小学习率、减少 Epoch、混入通用数据、Early Stopping、LoRA，并做通用能力回归。' },
          { question: '为什么不能只根据训练 Loss 判断成功？', answer: '它只反映对训练 Token 的拟合，不能证明泛化，也排除不了过拟合、记忆或数据泄漏；需独立验证集与真实业务指标。' },
          { question: '为什么 AdamW 全量训练的显存会远高于模型权重本身？', answer: '除低精度权重外，还要保存梯度、可能的 FP32 主权重，以及 Adam 的一阶和二阶动量；另外还有激活与临时张量。' },
          { question: 'Gradient Checkpointing 省的是什么，代价是什么？', answer: '它主要减少需要长期保存的激活，在反向传播时重算部分前向结果，因此用额外计算时间换峰值显存。' },
        ]} />
      </LessonSection>

      <div className="flex flex-wrap justify-between gap-3 border-t pt-6">
        <Button variant="outline" size="lg" onClick={onPrevious}><ArrowLeft data-icon="inline-start" />返回 Lesson 03</Button>
        <Button size="lg" onClick={onNext}>下一课：LoRA、QLoRA 与偏好对齐<ArrowRight data-icon="inline-end" /></Button>
      </div>
    </article>
  );
}
