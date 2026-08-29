'use client';

import { ArrowLeft, ArrowRight, CheckCircle2, CircleAlert, Cpu, Gauge, Network, TriangleAlert, Waves } from 'lucide-react';

import { LessonNavigator, ParallelismQuickMap, TrainingMemoryLab } from '@/components/advanced-learning-widgets';
import { DeepDive, FormulaBlock, InterviewAnswer, KeyStatement, LessonSection, QuizList } from '@/components/learning-widgets';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const chapters = [
  { id: 'lesson-8-loop', label: '先走一遍', title: '训练循环' },
  { id: 'lesson-8-memory', label: '拆开成本', title: '显存账本' },
  { id: 'lesson-8-batch', label: '看懂步数', title: 'Batch 体系' },
  { id: 'lesson-8-parallel', label: '跨多张卡', title: '三类并行' },
  { id: 'lesson-8-zero', label: '理解分片', title: 'ZeRO / FSDP' },
  { id: 'lesson-8-interview', label: '能输出', title: '面试表达' },
];

export function LessonEight({ onPrevious, onNext }: { onPrevious: () => void; onNext: () => void }) {
  return (
    <article className="lesson-article space-y-10">
      <KeyStatement>
        大模型训练贵，不只是因为权重多：每次更新还要保存梯度、优化器状态和反向传播激活，并在多张设备之间持续通信。省显存、提吞吐与保稳定往往是三种不同取舍。
      </KeyStatement>

      <LessonNavigator chapters={chapters} />

      <LessonSection id="lesson-8-goals" eyebrow="01 · 学习目标" title="能解释训练为什么贵，也能定位到底贵在哪里">
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            '完整复述 Forward、Backward 与 Optimizer Step',
            '区分 Micro Batch、Global Batch 与梯度累积',
            '解释混合精度、Checkpointing 与 ZeRO 各省什么',
            '比较数据、张量、流水线并行的通信与边界',
          ].map((goal) => <div key={goal} className="flex gap-3 rounded-xl border bg-card p-4 text-foreground"><CheckCircle2 className="mt-1 size-4 shrink-0 text-primary" />{goal}</div>)}
        </div>
      </LessonSection>

      <LessonSection id="lesson-8-loop" eyebrow="02 · 一次训练迭代" title="模型不是“看见答案就记住”，而是完成一条数值链路">
        <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {[
            ['01', '取 Batch'],
            ['02', 'Forward'],
            ['03', '计算 Loss'],
            ['04', 'Backward'],
            ['05', '裁剪 / 同步'],
            ['06', 'Optimizer Step'],
          ].map(([number, step]) => <div key={step} className="rounded-xl border bg-card p-3 text-center"><span className="block font-mono text-[10px] text-primary">{number}</span><strong className="mt-2 block text-xs text-foreground">{step}</strong></div>)}
        </div>
        <FormulaBlock label="最简参数更新">θ ← θ - η · ∇_θ L</FormulaBlock>
        <p>Forward 产生预测与中间激活；Loss 衡量预测误差；Backward 使用链式法则计算每个可训练参数的梯度；分布式训练还要聚合或分片这些梯度；最后 AdamW 根据历史动量和当前梯度更新参数。</p>
        <DeepDive
          title="一次 Step 更新的不是“答案”，而是整套函数"
          intuition={<>答错一道题后，老师不是把答案粘进一个格子，而是微调大量解题习惯。下一次遇到相似题，整套判断过程都会略有变化。</>}
          mechanism={<>Loss 对所有有效 Token 聚合后反向传播，梯度分布到 Embedding、Attention、FFN 等被训练权重；一次更新会影响许多不同输入的输出分布。</>}
          takeaway={<>训练数据、学习率和更新范围不当会造成能力迁移，也可能带来过拟合与遗忘。</>}
        />
      </LessonSection>

      <LessonSection id="lesson-8-adam" eyebrow="03 · AdamW 深入" title="优化器为什么还要为每个参数保存两本历史账">
        <FormulaBlock>m_t = β₁m_&#123;t-1&#125; + (1-β₁)g_t
v_t = β₂v_&#123;t-1&#125; + (1-β₂)g_t²</FormulaBlock>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ['Gradient g', '当前这个 Batch 认为参数应该往哪走。'],
            ['First Moment m', '平滑后的总体方向，类似带惯性的行进趋势。'],
            ['Second Moment v', '梯度平方的历史尺度，用于调节不同参数的实际步长。'],
          ].map(([title, text]) => <Card key={title}><CardHeader><CardTitle className="font-mono text-base">{title}</CardTitle></CardHeader><CardContent className="text-sm leading-6 text-muted-foreground">{text}</CardContent></Card>)}
        </div>
        <p>AdamW 还把 Weight Decay 与梯度更新解耦。它通常比朴素 SGD 更容易训练 Transformer，但两份动量和可能的 FP32 主权重会显著增加显存。</p>
      </LessonSection>

      <LessonSection id="lesson-8-memory" eyebrow="04 · 显存组成" title="训练峰值是参数状态、激活与临时通信的叠加">
        <div className="grid gap-3 sm:grid-cols-4">
          {[
            ['Weights', '低精度权重与可能的 FP32 主权重'],
            ['Gradients', '每个可训练参数对应的梯度'],
            ['Optimizer', 'Adam 的 m、v 与相关状态'],
            ['Activations', '反向传播需要的逐层中间结果'],
          ].map(([title, text]) => <div key={title} className="rounded-xl border bg-card p-4"><strong className="font-mono text-sm text-primary">{title}</strong><p className="mt-2 text-sm leading-6">{text}</p></div>)}
        </div>
        <TrainingMemoryLab />
        <p>真正 OOM 还可能来自 Attention 临时张量、通信 Bucket、算子 Workspace 和内存碎片，因此理论合计永远要留安全余量。</p>
      </LessonSection>

      <LessonSection id="lesson-8-batch" eyebrow="05 · Batch 体系" title="Micro Batch、梯度累积与 Global Batch 不要混用">
        <FormulaBlock>Global Batch = Micro Batch × Gradient Accumulation × Data-Parallel Replicas</FormulaBlock>
        <FormulaBlock>Tokens per Update ≈ Global Batch × Sequence Length</FormulaBlock>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ['Micro Batch', '一张数据并行设备一次 Forward/Backward 真正放入的样本数，直接影响激活峰值。'],
            ['Gradient Accumulation', '连续做多个小批次并累积梯度，达到次数后再执行一次 Optimizer Step。'],
            ['Global Batch', '所有数据并行副本与累积步共同贡献给一次参数更新的数据量。'],
          ].map(([title, text]) => <Card key={title}><CardHeader><CardTitle>{title}</CardTitle></CardHeader><CardContent className="text-sm leading-6 text-muted-foreground">{text}</CardContent></Card>)}
        </div>
        <DeepDive
          title="8 张 GPU 不一定把 Global Batch 乘 8"
          intuition={<>如果 8 张卡分成两组，每 4 张合作切一个模型，那么真正独立处理不同数据的副本只有 2 组。</>}
          mechanism={<>只有 Data-Parallel Replicas 扩大 Batch；Tensor Parallel 和 Pipeline Parallel 的多张卡共同承载同一个模型副本，不应重复计数。</>}
          takeaway={<>报告 Batch 口径时要同时给出 Micro Batch、累积步数、DP Degree 与 Sequence Length。</>}
        />
      </LessonSection>

      <LessonSection id="lesson-8-precision" eyebrow="06 · 混合精度" title="BF16 与 FP16 都是 16 位，但稳定性来源不同">
        <div className="grid gap-4 md:grid-cols-2">
          <Card><CardHeader><Badge variant="secondary" className="w-fit">更细尾数 · 较窄范围</Badge><CardTitle>FP16</CardTitle></CardHeader><CardContent className="space-y-3 text-sm leading-6 text-muted-foreground"><p>有效数字较多，但指数范围较窄，小梯度可能下溢、大数可能溢出。</p><p>常配合 Loss Scaling，把 Loss 与梯度先放大，更新前再反缩放。</p></CardContent></Card>
          <Card><CardHeader><Badge variant="secondary" className="w-fit">较宽范围 · 较粗尾数</Badge><CardTitle>BF16</CardTitle></CardHeader><CardContent className="space-y-3 text-sm leading-6 text-muted-foreground"><p>指数位宽接近 FP32，更能承受大模型训练中的数值范围。</p><p>通常较少依赖 Loss Scaling，但并不保证永远没有 NaN。</p></CardContent></Card>
        </div>
        <FormulaBlock label="FP16 Loss Scaling 直觉">L′ = S·L → Backward 得到 S·g → 更新前再除以 S</FormulaBlock>
        <p>混合精度不是把所有内容都变成 16 位：矩阵乘法可用低精度，部分归一化、归约、Master Weights 与 Optimizer States 仍可能保留 FP32。</p>
      </LessonSection>

      <LessonSection id="lesson-8-activation" eyebrow="07 · 激活优化" title="Gradient Checkpointing 为什么省显存却让训练变慢">
        <DeepDive
          title="少留草稿，需要时再重算"
          intuition={<>解长题时只保存关键中间结论，回头需要细节就重新推一遍。草稿纸少了，计算时间却增加了。</>}
          mechanism={<>前向只保存选定边界激活；反向传播到某段时重新执行该段 Forward，恢复缺失的中间量。</>}
          takeaway={<>它主要换掉激活显存，不减少参数、梯度或优化器状态，也不减少总计算量。</>}
        />
        <div className="grid gap-3 md:grid-cols-3">
          {[
            ['Checkpointing', '重算换激活显存', '长序列、大模型训练常用'],
            ['FlashAttention', '分块与融合减少 HBM 读写和中间矩阵落盘', '改实现，不改数学目标'],
            ['Length Bucketing', '相近长度样本放一起，减少 Padding', '提升有效 Token 比例'],
          ].map(([title, mechanism, note]) => <Card key={title}><CardHeader><Badge variant="outline" className="w-fit">{note}</Badge><CardTitle>{title}</CardTitle></CardHeader><CardContent className="text-sm leading-6 text-muted-foreground">{mechanism}</CardContent></Card>)}
        </div>
      </LessonSection>

      <LessonSection id="lesson-8-parallel" eyebrow="08 · 三类并行" title="模型放不下、算不快和层数太深，对应不同切法">
        <ParallelismQuickMap />
        <div className="overflow-hidden rounded-xl border bg-card">
          {[
            ['Data Parallel', '不同数据', '每步同步梯度或参数状态', '吞吐扩展'],
            ['Tensor Parallel', '同层矩阵', '层内频繁 All-Reduce / All-Gather', '单层放不下'],
            ['Pipeline Parallel', '不同层', '相邻 Stage 传递激活与梯度', '模型很深'],
          ].map(([type, splits, communication, solves], index) => <div key={type} className={`grid gap-2 p-4 md:grid-cols-[160px_110px_1fr_120px] ${index ? 'border-t' : ''}`}><strong className="font-mono text-primary">{type}</strong><span>{splits}</span><span className="text-muted-foreground">{communication}</span><Badge variant="secondary" className="w-fit">{solves}</Badge></div>)}
        </div>
        <p>超大模型常组合成 3D Parallelism：数据并行负责样本，张量并行切层内矩阵，流水线并行切层。组合越多，拓扑、通信与调度越重要。</p>
      </LessonSection>

      <LessonSection id="lesson-8-zero" eyebrow="09 · ZeRO / FSDP" title="数据并行为什么还要把“重复保存的账本”拆开">
        <div className="space-y-3">
          {[
            ['Stage 0', '每个数据并行副本保存完整参数、梯度和优化器状态。'],
            ['Stage 1', '先分片 Optimizer States，减少最大的一部分重复账本。'],
            ['Stage 2', '再分片 Gradients，每张卡只长期保留自己负责的梯度片段。'],
            ['Stage 3', '再分片 Parameters；计算某层前按需 All-Gather，用完后可重新释放或分片。'],
          ].map(([stage, text], index) => <div key={stage} className="grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-[42px_110px_1fr] sm:items-center"><span className="grid size-8 place-items-center rounded-full bg-primary text-xs text-primary-foreground">{index}</span><strong className="font-mono text-foreground">{stage}</strong><span>{text}</span></div>)}
        </div>
        <DeepDive
          title="ZeRO-3 与 Tensor Parallel 都拆参数，为什么不是一回事"
          intuition={<>ZeRO-3 像仓库把完整零件分散保管，需要加工某层时临时凑齐；Tensor Parallel 则让多个人同时各算同一个大矩阵的一部分。</>}
          mechanism={<>ZeRO/FSDP 主要消除数据并行副本的状态冗余；Tensor Parallel 改变单次矩阵计算本身的分工，层内通信模式不同。</>}
          takeaway={<>两者可以组合：一个解决状态重复，一个解决单层计算与显存。</>}
        />
      </LessonSection>

      <LessonSection id="lesson-8-communication" eyebrow="10 · 通信瓶颈" title="GPU 更多不代表一定线性加速">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            [Network, '带宽', '要同步的数据量很大，链路搬运速度可能跟不上计算。'],
            [Waves, '延迟', '许多小通信或跨节点操作会被启动与往返时间拖慢。'],
            [Cpu, '拓扑', '同机高速互联与跨机网络差异巨大，切分方式应贴合硬件。'],
          ].map(([Icon, title, text]) => {
            const ItemIcon = Icon as typeof Network;
            return <Card key={title as string}><CardHeader><ItemIcon className="size-5 text-primary" /><CardTitle>{title as string}</CardTitle></CardHeader><CardContent className="text-sm leading-6 text-muted-foreground">{text as string}</CardContent></Card>;
          })}
        </div>
        <p>强扩展看“总问题规模不变时，加卡后能快多少”；弱扩展看“每卡工作量近似不变时，总吞吐能否随卡数增长”。两者都要结合每卡有效 Token、通信占比和利用率。设备空闲不一定是模型小，也可能是在等数据或等通信。</p>
      </LessonSection>

      <LessonSection id="lesson-8-efficiency" eyebrow="11 · 吞吐与利用率" title="训练快不只是 Step/s，要看真正处理了多少有效 Token">
        <FormulaBlock>Token Throughput = Effective Tokens / Second</FormulaBlock>
        <FormulaBlock label="MFU 的数量级直觉">MFU ≈ Achieved Model FLOPs / Hardware Peak FLOPs</FormulaBlock>
        <p>Step/s 会被 Batch、Sequence 和 Packing 改变，不能单独比较。更可靠的看法是：有效 Token/s、每 GPU Token/s、模型 FLOPs 利用率、通信占比、Padding 比例与数据等待时间一起观察。</p>
        <Card className="border-amber-500/25 bg-amber-500/8"><CardContent className="flex gap-3 pt-6 text-sm leading-6 text-foreground"><Gauge className="mt-0.5 size-5 shrink-0 text-amber-600" /><p>MFU 依赖对模型 FLOPs 的估算口径，不是 GPU 所有单元的绝对使用率。不同项目只有口径一致时才值得横向比较。</p></CardContent></Card>
      </LessonSection>

      <LessonSection id="lesson-8-data" eyebrow="12 · 数据管线" title="GPU 等数据时，再昂贵的算力也在空转">
        <div className="grid gap-3 md:grid-cols-4">
          {[
            ['读取与解压', '存储吞吐、网络与文件碎片'],
            ['Tokenize', '离线预处理或多进程并行'],
            ['Shuffle / Sample', '保持配比并减少顺序偏差'],
            ['Pack / Collate', '减少 Padding，生成正确 Mask'],
          ].map(([title, text]) => <div key={title} className="rounded-xl border bg-card p-4"><strong className="text-sm text-foreground">{title}</strong><p className="mt-2 text-xs leading-5 text-muted-foreground">{text}</p></div>)}
        </div>
        <p>Packing 能提高有效 Token 比例，但必须正确处理样本边界、EOS、Attention Mask 与 Loss Mask。吞吐提升若以跨样本泄漏为代价，训练目标已经变了。</p>
      </LessonSection>

      <LessonSection id="lesson-8-debug" eyebrow="13 · 故障诊断" title="Loss、OOM、NaN 和低利用率各自先查什么">
        <div className="overflow-hidden rounded-xl border bg-card">
          {[
            ['CUDA OOM', 'Micro Batch、序列长度、激活峰值、临时 Workspace、碎片', '先降 Micro Batch / 长度，再开 Checkpointing 或分片'],
            ['Loss 震荡 / 发散', '学习率、Warmup、梯度范数、异常样本、Batch 变化', '查日志与数据，勿只盲目换优化器'],
            ['NaN / Inf', 'FP16 溢出、Loss Scaling、过大学习率、不稳定算子', '看首次出现层和梯度范数'],
            ['GPU 利用率低', '数据等待、Padding、通信、CPU Tokenize、小矩阵', '用时间线定位空洞，不凭单个百分比猜'],
          ].map(([symptom, checks, first], index) => <div key={symptom} className={`grid gap-2 p-4 md:grid-cols-[150px_1fr_1fr] ${index ? 'border-t' : ''}`}><strong className="text-foreground">{symptom}</strong><span>{checks}</span><span className="text-muted-foreground">{first}</span></div>)}
        </div>
      </LessonSection>

      <LessonSection id="lesson-8-interview" eyebrow="14 · 面试表达" title="60 秒解释大模型训练显存与分布式策略">
        <InterviewAnswer question="为什么大模型训练这么贵？常见优化手段分别解决什么？">
          大模型训练除了低精度权重，还要保存梯度、FP32 主权重、Adam 的一阶和二阶状态，以及反向传播所需激活，所以常见混合精度全量训练的模型状态可接近 16 Bytes/参数，远高于推理。Micro Batch 和 Sequence Length 主要影响激活峰值；Gradient Accumulation 用多个小批次模拟更大 Global Batch，但不减少总计算；Gradient Checkpointing 少存激活、反向时重算。多卡方面，Data Parallel 让副本处理不同数据，Tensor Parallel 切同层矩阵，Pipeline Parallel 切不同层。ZeRO/FSDP 则在数据并行组内逐级分片优化器、梯度和参数，减少状态冗余。真实选型要同时看单卡是否放得下、通信拓扑、有效 Token 吞吐和训练稳定性，而不是认为 GPU 数翻倍就会线性加速。
        </InterviewAnswer>
      </LessonSection>

      <LessonSection id="lesson-8-mistakes" eyebrow="15 · 避坑" title="十个训练工程误区">
        <div className="space-y-3">
          {[
            ['Gradient Accumulation 会减少总计算', '它降低单次峰值，样本仍需完成前向和反向。'],
            ['8 张卡就把 Global Batch 乘 8', '只有数据并行副本数参与；TP/PP 卡共同承载一个副本。'],
            ['BF16 比 FP16 每一位都更精确', 'BF16 范围更大，尾数精度反而更低。'],
            ['混合精度表示所有状态都是 16 位', '关键累加、主权重或优化器状态可能保留 FP32。'],
            ['Checkpointing 会减少参数量', '它主要减少保存的激活，并增加重计算。'],
            ['FlashAttention 把标准 Attention 变成 O(T)', '它主要优化访存与分块，数学上的密集注意力仍涉及位置两两交互。'],
            ['ZeRO-3 与 Tensor Parallel 完全一样', '前者分片数据并行状态，后者切分层内矩阵计算。'],
            ['GPU 越多一定越快', '通信、流水线气泡和小批次会造成非线性扩展。'],
            ['Step/s 越高训练一定越快', 'Batch、长度和有效 Token 比例不同，必须统一口径。'],
            ['OOM 只需要降低 LoRA Rank', '长序列激活常是主因，应先看显存拆账。'],
          ].map(([wrong, right]) => <div key={wrong} className="flex gap-3 rounded-xl border bg-card p-4"><CircleAlert className="mt-1 size-4 shrink-0 text-destructive" /><div><p className="font-medium text-foreground line-through decoration-destructive/60">{wrong}</p><p>{right}</p></div></div>)}
        </div>
      </LessonSection>

      <LessonSection id="lesson-8-quiz" eyebrow="16 · 主动回忆" title="闭卷检查训练与并行">
        <QuizList questions={[
          { question: '一次训练迭代的六个主要步骤是什么？', answer: '取 Batch、Forward、计算 Loss、Backward、必要的裁剪与分布式同步、Optimizer Step，之后通常清空梯度。' },
          { question: 'Adam 为什么比 SGD 多占显存？', answer: '它为每个参数维护一阶动量 m 和二阶动量 v，混合精度训练还可能保留 FP32 主权重。' },
          { question: 'Global Batch 应如何计算？', answer: 'Micro Batch × Gradient Accumulation × Data-Parallel Replicas；TP/PP 设备数不能直接当副本数。' },
          { question: 'BF16 相比 FP16 的主要优势是什么？', answer: '指数范围接近 FP32，更能承受大范围数值；它的尾数精度并不更高。' },
          { question: 'Gradient Checkpointing 省什么、付出什么？', answer: '少保存部分激活以降低显存，反向时重算对应前向，因此付出更多计算时间。' },
          { question: 'Data、Tensor、Pipeline Parallel 分别切什么？', answer: '分别切数据样本、同层矩阵和不同层。它们的通信位置与适用瓶颈不同。' },
          { question: 'ZeRO Stage 1、2、3 依次多分片什么？', answer: 'Stage 1 分片优化器状态，Stage 2 再分片梯度，Stage 3 再分片参数。' },
          { question: '为什么 Step/s 不能单独衡量训练效率？', answer: '不同 Step 可能包含不同 Batch、序列长度和 Padding；应看有效 Token/s、每卡吞吐、通信与利用率等统一口径。' },
        ]} />
      </LessonSection>

      <Card className="border-amber-500/25 bg-amber-500/8"><CardContent className="flex gap-3 pt-6 text-sm leading-6 text-foreground"><TriangleAlert className="mt-0.5 size-5 shrink-0 text-amber-600" /><p>这课的显存数字用于面试估算与方案比较。真正训练前仍要用目标框架、模型结构、硬件与样本长度做小规模 Profiling，再决定并行组合。</p></CardContent></Card>

      <div className="flex flex-wrap justify-between gap-3 border-t pt-6">
        <Button variant="outline" size="lg" onClick={onPrevious}><ArrowLeft data-icon="inline-start" />返回 Lesson 07</Button>
        <Button size="lg" onClick={onNext}>下一课：LoRA 与 QLoRA 深入<ArrowRight data-icon="inline-end" /></Button>
      </div>
    </article>
  );
}
