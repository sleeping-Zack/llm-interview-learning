'use client';

import { ArrowLeft, ArrowRight, BrainCircuit, CheckCircle2, CircleAlert, Database, Gauge } from 'lucide-react';

import { LessonNavigator, ModelStorageLab } from '@/components/advanced-learning-widgets';
import {
  DeepDive,
  FormulaBlock,
  InterviewAnswer,
  KeyStatement,
  LessonSection,
  ParameterAnatomyDemo,
  QuizList,
} from '@/components/learning-widgets';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const chapters = [
  { id: 'lesson-6-four-numbers', label: '先分清', title: '四类数字' },
  { id: 'lesson-6-anatomy', label: '再拆开', title: '参数从哪来' },
  { id: 'lesson-6-memory', label: '会估算', title: '显存账本' },
  { id: 'lesson-6-capacity', label: '再深入', title: '容量与 Scaling' },
  { id: 'lesson-6-moe', label: '看边界', title: 'Dense 与 MoE' },
  { id: 'lesson-6-interview', label: '能输出', title: '面试表达' },
];

export function LessonSix({ onPrevious, onNext }: { onPrevious: () => void; onNext: () => void }) {
  return (
    <article className="lesson-article space-y-10">
      <KeyStatement>
        参数是训练学到并长期保存在模型里的数字；激活与 KV Cache 是一次请求产生的临时状态。7B 表示约 70 亿参数，不是 70 亿条知识，也不是 7GB 文件。
      </KeyStatement>

      <LessonNavigator chapters={chapters} />

      <LessonSection id="lesson-6-goals" eyebrow="01 · 学习目标" title="从会背 7B，走到能估规模和显存">
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            '区分参数、超参数、激活、梯度与 KV Cache',
            '解释 Embedding、Attention、FFN 的参数量来源',
            '手算不同精度下权重的理论存储量',
            '说明参数更多为何不自动等于效果更好',
          ].map((goal) => <div key={goal} className="flex gap-3 rounded-xl border bg-card p-4 text-foreground"><CheckCircle2 className="mt-1 size-4 shrink-0 text-primary" />{goal}</div>)}
        </div>
      </LessonSection>

      <LessonSection id="lesson-6-four-numbers" eyebrow="02 · 先分清" title="模型里都叫“数字”，但职责完全不同">
        <div className="grid gap-4 md:grid-cols-2">
          {[
            ['Parameters 参数', '训练学到的 W、Embedding、Norm Scale 等', '训练会更新；推理通常固定', '长期能力与行为'],
            ['Hyperparameters 超参数', '层数、隐藏维度、学习率、Batch、Rank', '由人或搜索流程设定', '决定结构与训练方式'],
            ['Activations 激活', '每层为当前 Batch 计算出的 Hidden States', '每次前向都重新产生', '训练反传所需“草稿”'],
            ['KV Cache', '历史 Token 在每层的 K、V', '每个请求单独增长', '避免 Decode 重算历史'],
          ].map(([title, examples, change, role]) => (
            <Card key={title}>
              <CardHeader><Badge variant="secondary" className="w-fit">{role}</Badge><CardTitle>{title}</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm leading-6 text-muted-foreground"><p>{examples}</p><p className="text-foreground">{change}</p></CardContent>
            </Card>
          ))}
        </div>
        <DeepDive
          title="参数像教材，激活像正在写的草稿"
          intuition={<>所有请求共用同一套教材；每位用户读到不同问题时，会产生自己的草稿和课堂笔记。用户越多、上下文越长，临时笔记越占空间。</>}
          mechanism={<>权重张量在推理服务中可被请求共享；Hidden State、临时 Attention 张量和 KV Cache 则随请求、序列长度与并发产生。</>}
          takeaway={<>“模型权重能放进显卡”只说明能启动，不代表能容纳目标上下文、Batch 和并发。</>}
        />
      </LessonSection>

      <LessonSection id="lesson-6-knowledge" eyebrow="03 · 知识与参数" title="一个事实对应模型里的某个参数吗">
        <p>通常不是。模型知识更像分布式编码：一个概念会受到许多层、许多权重共同影响；同一组权重也会参与大量不同输入的计算。</p>
        <FormulaBlock label="一层的抽象计算">h⁽ˡ⁺¹⁾ = f(h⁽ˡ⁾; W⁽ˡ⁾)</FormulaBlock>
        <div className="grid gap-3 md:grid-cols-3">
          {[
            [BrainCircuit, '分布式', '“巴黎”不是锁在某个单元格，而是许多特征组合让它在相关上下文中获得更高 Logit。'],
            [Database, '不可天然溯源', '参数回答不会自动告诉你训练语料中的原句和出处。'],
            [Gauge, '容量不等于准确率', '更多参数提供更大表示与计算空间，但仍受数据、训练量、架构和对齐影响。'],
          ].map(([Icon, title, text]) => {
            const ItemIcon = Icon as typeof BrainCircuit;
            return <Card key={title as string}><CardHeader><ItemIcon className="size-5 text-primary" /><CardTitle className="text-base">{title as string}</CardTitle></CardHeader><CardContent className="text-sm leading-6 text-muted-foreground">{text as string}</CardContent></Card>;
          })}
        </div>
        <p>这也是为什么动态价格、企业制度和需要引用的事实通常优先交给 RAG 或工具，而不是指望微调把它们可靠写入参数。</p>
      </LessonSection>

      <LessonSection id="lesson-6-anatomy" eyebrow="04 · 参数解剖" title="Embedding、Attention 与 FFN 是参数大户">
        <FormulaBlock label="Dense Decoder 粗估">Parameters ≈ V·d + L·(4d² + 3d·d_ff)</FormulaBlock>
        <div className="grid gap-3 md:grid-cols-3">
          {[
            ['Embedding', 'V × d', '词表每个 Token 一行初始向量；若输入输出权重共享，只计算一份。'],
            ['Attention', '每层约 4d²', '来自 Q、K、V、O 四组线性投影；GQA 会改变 K/V 部分。'],
            ['SwiGLU FFN', '每层约 3d·d_ff', 'Gate、Up、Down 三个大矩阵，常占 Block 参数大头。'],
          ].map(([title, formula, text]) => <Card key={title}><CardHeader><Badge variant="outline" className="w-fit font-mono">{formula}</Badge><CardTitle>{title}</CardTitle></CardHeader><CardContent className="text-sm leading-6 text-muted-foreground">{text}</CardContent></Card>)}
        </div>
        <ParameterAnatomyDemo />
        <DeepDive
          title="Head 数增加，参数一定按比例增加吗"
          intuition={<>把同一条 4096 维宽路切成 32 条或 64 条车道，车道数量变了，但道路总宽度可以不变。</>}
          mechanism={<>若总隐藏维度 d 固定，Head 数 h 增加时单头维度 d_head=d/h 会变小，Q/K/V/O 总投影矩阵尺寸可基本不变。</>}
          takeaway={<>参数量主要看矩阵总形状，不要看到 Head 更多就直接判断模型更大。</>}
        />
      </LessonSection>

      <LessonSection id="lesson-6-memory" eyebrow="05 · 显存手算" title="参数量乘每个参数字节数，只是第一本账">
        <FormulaBlock>Weight bytes ≈ Parameter Count × Bytes per Parameter</FormulaBlock>
        <p>7B 的 BF16 权重理论值约为 7×10⁹×2=14GB；INT4 理论位宽约为 3.5GB。但真实量化还需要 Scale、Zero Point 或分组元数据，运行时也有反量化缓冲。</p>
        <ModelStorageLab />
        <div className="grid gap-3 md:grid-cols-4">
          {[
            ['Weights', '全请求共享', '由参数量与精度主导'],
            ['KV Cache', '每请求独享', '随层数、序列和并发增长'],
            ['Activations', '本轮临时', '随 Batch、序列、维度增长'],
            ['Workspace', '算子临时区', '受框架、Kernel 与碎片影响'],
          ].map(([title, who, driver]) => <div key={title} className="rounded-xl border bg-card p-4"><strong className="font-mono text-sm text-foreground">{title}</strong><p className="mt-2 text-sm">{who}</p><p className="text-xs text-muted-foreground">{driver}</p></div>)}
        </div>
      </LessonSection>

      <LessonSection id="lesson-6-kv" eyebrow="06 · 每请求状态" title="KV Cache 为什么能把“可运行”变成“并发不足”">
        <FormulaBlock label="单请求粗估">KV bytes ≈ 2 × L × T × H_kv × d_head × bytes</FormulaBlock>
        <p>假设 32 层、上下文 8192、8 个 KV Heads、Head Dimension 128、BF16：</p>
        <FormulaBlock>2 × 32 × 8192 × 8 × 128 × 2 bytes ≈ 1 GiB / request</FormulaBlock>
        <DeepDive
          title="为什么模型只加载一份，KV Cache 却要按用户复制"
          intuition={<>教材所有学生共用，但每个学生都要保留自己这节课前面写过的笔记。不同请求的历史 Token 不同，笔记当然不能共享。</>}
          mechanism={<>Decode 每层用新 Query 查询本请求历史 K，并汇总历史 V。GQA/MQA 通过减少 KV Heads 显著降低这份每请求缓存。</>}
          takeaway={<>在线容量规划要同时看权重、单请求缓存、上下文分布与并发目标，不能只问“几 GB 能加载模型”。</>}
        />
      </LessonSection>

      <LessonSection id="lesson-6-training-memory" eyebrow="07 · 训练账本" title="为什么训练 7B 远不止 14GB">
        <div className="grid gap-3 sm:grid-cols-4">
          {[
            ['低精度权重', '≈ 2 B / param'],
            ['梯度', '≈ 2 B / param'],
            ['FP32 主权重', '≈ 4 B / param'],
            ['Adam m + v', '≈ 8 B / param'],
          ].map(([title, value]) => <div key={title} className="rounded-xl border bg-card p-4"><p className="text-xs text-muted-foreground">{title}</p><p className="mt-1 font-mono text-sm font-semibold text-foreground">{value}</p></div>)}
        </div>
        <p>常见混合精度 AdamW 全量训练可接近 16 Bytes / 参数；7B 仅这些状态就约 112GB，还没有算激活。ZeRO/FSDP 会把状态分到多卡，Gradient Checkpointing 则主要减少激活，它们解决的账目不同。</p>
      </LessonSection>

      <LessonSection id="lesson-6-capacity" eyebrow="08 · 容量与 Scaling" title="参数更多，为什么有时收益很大、有时几乎没有">
        <DeepDive
          title="大脑容量、做题数量和学习时间必须配平"
          intuition={<>大教室却只有十道练习题，很多座位没有发挥作用；题目海量但教室太小，又装不下复杂规律。</>}
          mechanism={<>模型参数 N、训练 Token D 与计算预算共同决定可达到的 Loss。参数增大提高容量，但若数据不足、重复或训练步数不够，会出现欠训练。</>}
          takeaway={<>比较模型不能只看 B 数，还要看数据质量与数量、训练计算、架构、上下文、后训练和评测任务。</>}
        />
        <FormulaBlock label="Scaling Law 直觉">Loss ≈ C + A / N^α + B / D^β</FormulaBlock>
        <FormulaBlock label="Dense 训练算力量级">Training FLOPs ≈ 6 × N × D</FormulaBlock>
        <p>Scaling Law 描述一定范围内的统计趋势，不是“把参数翻倍，所有能力就翻倍”。同一平均分还可能掩盖中文、代码、长上下文和安全等能力差异。</p>
      </LessonSection>

      <LessonSection id="lesson-6-moe" eyebrow="09 · 架构预告" title="MoE 的总参数与激活参数为什么不是一回事">
        <div className="grid gap-4 md:grid-cols-2">
          <Card><CardHeader><Badge className="w-fit">Dense</Badge><CardTitle>每个 Token 走同一套 FFN</CardTitle></CardHeader><CardContent className="text-sm leading-6 text-muted-foreground">总参数基本都属于每次前向的共享主干。模型越大，单 Token 计算通常也更重。</CardContent></Card>
          <Card><CardHeader><Badge className="w-fit">Mixture of Experts</Badge><CardTitle>Router 只选少数专家</CardTitle></CardHeader><CardContent className="text-sm leading-6 text-muted-foreground">模型可以拥有大量专家参数，但每个 Token 只激活 Top-k；总容量与单次激活计算被部分解耦。</CardContent></Card>
        </div>
        <p>MoE 不是免费午餐：所有专家权重仍要存储，跨设备路由带来通信，专家负载还可能不均。面试时要同时说明总参数、激活参数和部署内存。</p>
      </LessonSection>

      <LessonSection id="lesson-6-engineering" eyebrow="10 · 工程决策" title="模型选型要从约束倒推，而不是先追最大参数">
        <div className="space-y-3">
          {[
            ['质量门槛', '先用真实业务集比较候选模型，而不是拿公开总榜替代本地任务。'],
            ['显存与并发', '权重只是底座，还要给 KV Cache、峰值请求和框架开销留余量。'],
            ['延迟与吞吐', '小模型可能更适合高并发工具路由，大模型留给复杂推理或升级路径。'],
            ['部署精度', '量化换显存不保证同比加速；硬件 Kernel 支持和质量回归同样重要。'],
          ].map(([title, text], index) => <div key={title} className="grid gap-2 rounded-xl border bg-card p-4 sm:grid-cols-[42px_140px_1fr] sm:items-center"><span className="grid size-8 place-items-center rounded-lg bg-primary/10 font-mono text-xs text-primary">{index + 1}</span><strong className="text-foreground">{title}</strong><span>{text}</span></div>)}
        </div>
      </LessonSection>

      <LessonSection id="lesson-6-interview" eyebrow="11 · 面试表达" title="60 秒讲清参数量、显存与模型能力">
        <InterviewAnswer question="7B 表示什么？如何估算模型显存？">
          7B 表示模型大约有 70 亿个可训练参数，不是 70 亿条知识，也不是文件固定为 7GB。参数主要来自词表 Embedding、每层 Attention 的 Q/K/V/O 投影以及 FFN 的 Gate/Up/Down 矩阵。纯权重存储可以先用参数量乘每个参数字节数估算，例如 7B 的 BF16 理论约 14GB、INT4 位宽理论约 3.5GB，但真实运行还要加量化元数据、激活、临时缓冲和每请求 KV Cache。训练还要保存梯度、FP32 主权重和 Adam 状态，常见全量训练可接近 16 Bytes/参数，所以显存远高于推理。参数更多代表容量更大，但最终能力还取决于数据、训练计算、架构和后训练，必须用目标任务评测验证。
        </InterviewAnswer>
      </LessonSection>

      <LessonSection id="lesson-6-mistakes" eyebrow="12 · 避坑" title="十个常见但不严谨的说法">
        <div className="space-y-3">
          {[
            ['7B 就是 7GB', 'B 是参数个数；文件大小还取决于精度、量化与元数据。'],
            ['一个参数对应一条知识', '知识通常分布在大量参数与层间计算中。'],
            ['模型能加载就能高并发', 'KV Cache 和临时显存会随请求与上下文增长。'],
            ['参数越多一定更聪明', '数据、算力、架构、后训练与任务分布同样关键。'],
            ['Head 数翻倍，参数必然翻倍', '总隐藏维度固定时，单头维度会相应缩小。'],
            ['INT4 权重一定比 BF16 快四倍', '位宽降低不等于硬件算子、访存和反量化同比提速。'],
            ['KV Cache 属于模型参数', '它是每次请求按历史 Token 产生的临时状态。'],
            ['Gradient Checkpointing 会减少参数', '它主要少存激活，反向时用重计算换显存。'],
            ['MoE 总参数都在每个 Token 上计算', '每个 Token 通常只激活少数专家，但总权重仍需存储。'],
            ['公开榜最高就是项目最佳模型', '真实选择还要看本地质量、延迟、成本、隐私与稳定性。'],
          ].map(([wrong, right]) => <div key={wrong} className="flex gap-3 rounded-xl border bg-card p-4"><CircleAlert className="mt-1 size-4 shrink-0 text-destructive" /><div><p className="font-medium text-foreground line-through decoration-destructive/60">{wrong}</p><p>{right}</p></div></div>)}
        </div>
      </LessonSection>

      <LessonSection id="lesson-6-quiz" eyebrow="13 · 主动回忆" title="闭卷检查规模与显存直觉">
        <QuizList questions={[
          { question: '参数、超参数、激活和 KV Cache 的区别是什么？', answer: '参数由训练学习并长期保存；超参数由人或搜索流程设定；激活是本次前向产生的中间结果；KV Cache 是每请求保存的历史 K、V。' },
          { question: '14B 模型以 BF16 保存，纯权重理论约多大？', answer: '14×10⁹×2 Bytes，约 28GB。它不含缓存、激活、临时缓冲与框架开销。' },
          { question: '为什么 FFN 常比 Attention 拥有更多参数？', answer: 'SwiGLU 常有 Gate、Up、Down 三个涉及 d 与扩展维度 d_ff 的大矩阵；在常见比例下，它们总参数可超过 Q/K/V/O。' },
          { question: 'Head 数增加为什么不一定增加总参数？', answer: '若总隐藏维度 d 固定，Head 变多会让每个 Head 变窄，投影矩阵的总体形状可以基本不变。' },
          { question: '为什么加载得下模型不代表能支持目标并发？', answer: '每个请求还需要自己的 KV Cache，且上下文越长缓存越大；并发还要占激活、临时缓冲和框架空间。' },
          { question: '常见混合精度 AdamW 全量训练为什么可接近 16 Bytes/参数？', answer: '大致包括 2B 低精度权重、2B 梯度、4B FP32 主权重和 8B Adam 一二阶状态，具体实现会变化。' },
          { question: '参数量更大但效果不一定更好的三个原因是什么？', answer: '可能数据量或质量不足、训练计算不够或架构/后训练不合适；也可能目标任务与模型能力分布不匹配。' },
          { question: 'MoE 的总参数与激活参数有什么区别？', answer: '总参数包含全部专家；激活参数是一个 Token 实际经过的共享主干与少数被路由专家。总权重仍需存储。' },
        ]} />
      </LessonSection>

      <div className="flex flex-wrap justify-between gap-3 border-t pt-6">
        <Button variant="outline" size="lg" onClick={onPrevious}><ArrowLeft data-icon="inline-start" />返回 Lesson 05</Button>
        <Button size="lg" onClick={onNext}>下一课：Transformer 深入<ArrowRight data-icon="inline-end" /></Button>
      </div>
    </article>
  );
}
