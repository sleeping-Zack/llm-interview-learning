'use client';

import { ArrowLeft, ArrowRight, CheckCircle2, CircleAlert, GitBranch, MemoryStick, Snowflake, TriangleAlert } from 'lucide-react';

import { LessonNavigator, LoraCoverageLab } from '@/components/advanced-learning-widgets';
import { DeepDive, FormulaBlock, InterviewAnswer, KeyStatement, LessonSection, QuizList } from '@/components/learning-widgets';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const chapters = [
  { id: 'lesson-9-low-rank', label: '看懂本质', title: '低秩更新' },
  { id: 'lesson-9-targets', label: '决定范围', title: 'Target Modules' },
  { id: 'lesson-9-qlora', label: '压缩基座', title: 'QLoRA' },
  { id: 'lesson-9-memory', label: '算清成本', title: '显存账本' },
  { id: 'lesson-9-recipe', label: '落到项目', title: '训练与部署' },
  { id: 'lesson-9-interview', label: '能输出', title: '面试表达' },
];

export function LessonNine({ onPrevious, onNext }: { onPrevious: () => void; onNext: () => void }) {
  return (
    <article className="lesson-article space-y-10">
      <KeyStatement>
        LoRA 不是把大模型缩小，而是冻结原来的大矩阵，再用两个小矩阵学习一条低秩“纠偏支路”；QLoRA 则进一步把不更新的基座压成 4-bit 存储，但计算、激活与 Adapter 训练并没有消失。
      </KeyStatement>

      <LessonNavigator chapters={chapters} />

      <LessonSection id="lesson-9-goals" eyebrow="01 · 学习目标" title="不只会背 PEFT，而是能算、能选、能排错">
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            '从矩阵形状推导 LoRA 参数量与 Rank 上限',
            '解释 Rank、Alpha、Dropout 与 Target Modules',
            '准确说明 QLoRA 的存储精度、计算精度与训练精度',
            '根据任务、数据、显存和部署方式选择调优方案',
          ].map((goal) => <div key={goal} className="flex gap-3 rounded-xl border bg-card p-4 text-foreground"><CheckCircle2 className="mt-1 size-4 shrink-0 text-primary" />{goal}</div>)}
        </div>
      </LessonSection>

      <LessonSection id="lesson-9-why" eyebrow="02 · 为什么可行" title="很多下游任务并不需要重写整座城市">
        <DeepDive
          title="预训练能力已经在，微调常是在改变它的使用方式"
          intuition={<>基座模型像一座已经建好的城市。全参微调是把整城纳入施工；LoRA 更像增加少量交通控制节点，让原有道路按新任务重新分流。</>}
          mechanism={<>许多任务所需的权重变化具有相关性，可以被较低维子空间近似。LoRA 把大更新矩阵限制为两个窄矩阵的乘积，只训练这条分支。</>}
          takeaway={<>低秩是有效的工程假设，不是对所有任务都成立的定理。巨大语言、领域或能力迁移仍可能需要更大容量甚至全参训练。</>}
        />
        <p>参数高效不是“模型只使用了少量原参数”。冻结的基座仍完整参与每层前向计算；被减少的是需要更新的参数、对应梯度和优化器状态。</p>
      </LessonSection>

      <LessonSection id="lesson-9-low-rank" eyebrow="03 · 数学骨架" title="LoRA 到底在原矩阵旁边加了什么">
        <FormulaBlock label="原始线性层">y = W x，W ∈ ℝ^(d_out × d_in)</FormulaBlock>
        <FormulaBlock label="经典 LoRA">y = W₀x + (α / r) · B A x
ΔW = (α / r) · BA
A ∈ ℝ^(r × d_in)，B ∈ ℝ^(d_out × r)</FormulaBlock>
        <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-center">
          <Card className="border-slate-300 bg-slate-500/5"><CardHeader><Snowflake className="size-5 text-slate-500" /><CardTitle className="font-mono text-base">W₀ · 冻结</CardTitle></CardHeader><CardContent className="text-sm leading-6 text-muted-foreground">保存预训练能力，不创建完整 Adam 状态。</CardContent></Card>
          <span className="hidden text-xl text-muted-foreground md:block">+</span>
          <Card className="border-blue-500/25 bg-blue-500/5"><CardHeader><GitBranch className="size-5 text-blue-600" /><CardTitle className="font-mono text-base">A · 读取</CardTitle></CardHeader><CardContent className="text-sm leading-6 text-muted-foreground">把高维输入压到 r 个可学习方向。</CardContent></Card>
          <span className="hidden text-xl text-muted-foreground md:block">→</span>
          <Card className="border-violet-500/25 bg-violet-500/5"><CardHeader><GitBranch className="size-5 text-violet-600" /><CardTitle className="font-mono text-base">B · 写回</CardTitle></CardHeader><CardContent className="text-sm leading-6 text-muted-foreground">把 r 维修正重新映射到输出空间。</CardContent></Card>
        </div>
        <p>常见初始化让其中一个矩阵为 0，所以训练开始时 <code>ΔW = 0</code>，模型行为先与基座基本一致，再逐步学会修正。不同库的 A/B 初始化方向可能不同，不必把某一种写法背成唯一规则。</p>
      </LessonSection>

      <LessonSection id="lesson-9-rank" eyebrow="04 · Rank 直觉" title="Rank 不是知识类别数，而是更新子空间的容量上限">
        <FormulaBlock>rank(BA) ≤ r
BA = Σᵢ₌₁ʳ bᵢ aᵢᵀ</FormulaBlock>
        <p>每个外积 <code>bᵢaᵢᵀ</code> 可以理解为一组“检测输入方向 → 写出修正方向”。Rank 16 表示这一层最多用 16 组协调方向近似更新，不表示训练 16% 参数，也不表示模型只能学习 16 类知识。</p>
        <div className="grid gap-4 md:grid-cols-2">
          <Card><CardHeader><Badge className="w-fit">容量较小</Badge><CardTitle>低 Rank</CardTitle></CardHeader><CardContent className="text-sm leading-6 text-muted-foreground">Adapter 小、状态少，适合格式、语气和边界清晰的任务；过低时可能欠拟合。</CardContent></Card>
          <Card><CardHeader><Badge variant="secondary" className="w-fit">容量较大</Badge><CardTitle>高 Rank</CardTitle></CardHeader><CardContent className="text-sm leading-6 text-muted-foreground">能表示更复杂更新，但参数、优化器状态和过拟合风险上升，不保证效果单调变好。</CardContent></Card>
        </div>
      </LessonSection>

      <LessonSection id="lesson-9-params" eyebrow="05 · 参数手算" title="为什么两个窄矩阵会省下大量可训练参数">
        <FormulaBlock label="参数量">Full = d_out × d_in
LoRA = r × (d_in + d_out)</FormulaBlock>
        <p>一个 <code>4096 × 4096</code> 线性层原有 16,777,216 个参数；使用 Rank 16 时，LoRA 只有 <code>16 × (4096 + 4096) = 131,072</code> 个参数，约占 0.78%。</p>
        <Card className="border-amber-500/25 bg-amber-500/8"><CardContent className="flex gap-3 pt-6 text-sm leading-6"><TriangleAlert className="mt-0.5 size-5 shrink-0 text-amber-600" /><p>这只是一个矩阵。整个模型还要乘层数，并看覆盖哪些投影。GQA 中 K/V 投影可能比 Q 更窄，MLP 的 Gate/Up/Down 也不是简单的 d×d，所以真实参数量必须按模型配置统计。</p></CardContent></Card>
      </LessonSection>

      <LessonSection id="lesson-9-hyper" eyebrow="06 · 三个超参数" title="Rank、Alpha 与 Dropout 控制的是不同事情">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ['Rank r', '控制低秩更新的表示容量，也直接改变 Adapter 参数量。'],
            ['Alpha α', '经典 LoRA 通过 α/r 缩放更新分支，要与 Rank、学习率和训练步数一起看。'],
            ['LoRA Dropout', '只在训练时随机丢弃 Adapter 分支输入，用于正则化；不减少参数量。'],
          ].map(([title, text]) => <Card key={title}><CardHeader><CardTitle className="font-mono text-base">{title}</CardTitle></CardHeader><CardContent className="text-sm leading-6 text-muted-foreground">{text}</CardContent></Card>)}
        </div>
        <p>“Alpha 必须是 Rank 两倍”只是经验起点，不是理论定律。rsLoRA 等变体还会使用 <code>α/√r</code> 缩放；面试中先说明自己讨论的是经典 LoRA，再谈变体会更严谨。</p>
      </LessonSection>

      <LessonSection id="lesson-9-targets" eyebrow="07 · 更新范围" title="Target Modules 决定模型的哪些变换可以被改写">
        <div className="overflow-x-auto rounded-xl border bg-card">
          <div className="min-w-[680px]">
            {[
              ['Q / V', '参数最少，经典常见起点', '容量可能不足，不能视为固定标准'],
              ['Q / K / V / O', '更完整地调整 Attention 信息路由', 'Adapter 与计算略增'],
              ['Attention + MLP', '连特征加工主线也可调整，容量更强', '参数更多，更需验证集与回归评测'],
              ['Embedding / LM Head', '新增 Token 或输出头变化时可能需要', '保存、合并与部署配置更复杂'],
            ].map(([target, gain, cost], index) => <div key={target} className={`grid grid-cols-[150px_1fr_1fr] gap-4 p-4 text-sm ${index ? 'border-t' : ''}`}><strong className="font-mono text-primary">{target}</strong><span>{gain}</span><span className="text-muted-foreground">{cost}</span></div>)}
          </div>
        </div>
        <p>模块名称依架构而异：可能叫 <code>q_proj</code>，也可能是融合的 <code>qkv</code> 或 <code>c_attn</code>。正式训练前必须打印可训练参数、比例和梯度，确认 Adapter 真的插到了目标层。</p>
        <LoraCoverageLab />
      </LessonSection>

      <LessonSection id="lesson-9-frozen" eyebrow="08 · 冻结不等于免费" title="只训练不到 1%，为什么长序列仍然会 OOM">
        <DeepDive
          title="省掉参数账本，不代表省掉整条计算链"
          intuition={<>主教材不改了，但每次做题仍要完整翻阅；为了修改旁边的笔记，还要保留解题过程中的草稿。</>}
          mechanism={<>基座仍执行全部 Forward，并把梯度通过激活传给前面的 Adapter。LoRA 省掉底座梯度和优化器状态，但激活、临时张量与底座计算仍在。</>}
          takeaway={<>LoRA OOM 时若主要瓶颈是激活，先降 Sequence Length 或 Micro Batch、开 Checkpointing，Rank 从 16 降到 8 可能只带来很小改善。</>}
        />
      </LessonSection>

      <LessonSection id="lesson-9-qlora" eyebrow="09 · QLoRA 主线" title="4-bit 保存的是冻结基座，不是把全部训练都压成 4-bit">
        <div className="grid gap-3 md:grid-cols-3">
          {[
            ['存储精度', '底座权重以 4-bit NF4 加缩放元数据保存。'],
            ['计算精度', '使用某个权重块时，通常临时反量化到 BF16 等格式参与矩阵乘法。'],
            ['训练精度', 'LoRA Adapter、梯度和优化器状态仍使用更高精度。'],
          ].map(([title, text], index) => <Card key={title} className="relative overflow-hidden"><div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-violet-500" /><CardHeader><span className="font-mono text-xs text-primary">0{index + 1}</span><CardTitle>{title}</CardTitle></CardHeader><CardContent className="text-sm leading-6 text-muted-foreground">{text}</CardContent></Card>)}
        </div>
        <FormulaBlock label="QLoRA 数据流">4-bit frozen base
  └─ dequantize for compute → BF16 matmul
BF16 / FP16 LoRA adapters
  └─ gradients + optimizer updates</FormulaBlock>
        <p>QLoRA 的主要收益是显存，不保证比普通 LoRA 更快。反量化、特殊 Kernel 和数据换页可能增加开销。</p>
      </LessonSection>

      <LessonSection id="lesson-9-quant" eyebrow="10 · 三个高频名词" title="NF4、Double Quantization 与 Paged Optimizer 各省哪一笔">
        <div className="space-y-3">
          {[
            ['NF4', '针对神经网络权重常见的近似正态分布设计非均匀 4-bit 刻度；密集区域分得更细，不等于普通均匀 INT4。'],
            ['Double Quantization', '继续量化每组权重使用的缩放常数，减少量化元数据；不是把 4-bit 权重再变成 2-bit。'],
            ['Paged Optimizer', '显存峰值时借助统一内存把部分优化器数据换到 CPU，缓解突发峰值；频繁换页会变慢。'],
          ].map(([title, text], index) => <div key={title} className="grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-[40px_170px_1fr] sm:items-center"><span className="grid size-8 place-items-center rounded-lg bg-primary/10 font-mono text-xs text-primary">{index + 1}</span><strong className="font-mono text-foreground">{title}</strong><span>{text}</span></div>)}
        </div>
      </LessonSection>

      <LessonSection id="lesson-9-memory" eyebrow="11 · QLoRA 显存" title="3.5GB 是 7B 的理想 4-bit 载荷，不是训练总显存">
        <FormulaBlock>7 × 10⁹ params × 0.5 Bytes ≈ 3.5 GB</FormulaBlock>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['量化基座', '权重载荷 + 分组缩放与打包元数据'],
            ['Adapter 状态', 'LoRA 参数、梯度、Adam m/v'],
            ['Activations', '随序列、Micro Batch、层数增长'],
            ['Runtime', '反量化缓冲、Kernel Workspace、碎片'],
          ].map(([title, text]) => <div key={title} className="rounded-xl border bg-card p-4"><MemoryStick className="mb-3 size-4 text-primary" /><strong className="block text-sm text-foreground">{title}</strong><p className="mt-2 text-sm leading-6">{text}</p></div>)}
        </div>
        <Card className="border-rose-500/25 bg-rose-500/7"><CardContent className="flex gap-3 pt-6 text-sm leading-6"><CircleAlert className="mt-0.5 size-5 shrink-0 text-rose-600" /><p><strong>必须分清：</strong>“4-bit 基座权重大小”和“QLoRA 训练峰值显存”是两个完全不同的数字。任何不说明序列、Batch、Checkpointing、框架和硬件的显存承诺都不严谨。</p></CardContent></Card>
      </LessonSection>

      <LessonSection id="lesson-9-recipe" eyebrow="12 · 训练方法" title="一套不迷信固定参数的 LoRA / QLoRA 实验流程">
        <div className="space-y-3">
          {[
            ['先定问题', '格式、语气、工具调用适合微调；持续变化且需引用的事实优先 RAG / Tool。'],
            ['建基线', '保留未微调模型、固定验证集和核心 Bad Cases，明确要改善什么、不能退化什么。'],
            ['做消融', '从中等 Rank 开始，分别比较 Target Modules、学习率、训练 Token 与 Epoch，不一次改完所有变量。'],
            ['查数据链', '核对 Chat Template、Tokenizer、Loss Mask、截断、重复数据和有效 Token 统计。'],
            ['做回归', '除训练 Loss 外，检查任务质量、格式、幻觉、拒答、通用能力以及 Merge 前后一致性。'],
          ].map(([title, text], index) => <div key={title} className="grid gap-2 rounded-xl border bg-card p-4 sm:grid-cols-[42px_120px_1fr] sm:items-center"><span className="grid size-8 place-items-center rounded-full bg-primary text-xs text-primary-foreground">{index + 1}</span><strong className="text-foreground">{title}</strong><span>{text}</span></div>)}
        </div>
      </LessonSection>

      <LessonSection id="lesson-9-deploy" eyebrow="13 · 合并与部署" title="Merge 省掉运行分支，但会牺牲 Adapter 切换灵活性">
        <FormulaBlock>W′ = W₀ + (α / r) · BA</FormulaBlock>
        <div className="grid gap-4 md:grid-cols-2">
          <Card><CardHeader><Badge className="w-fit">合并部署</Badge><CardTitle>一个完整权重</CardTitle></CardHeader><CardContent className="space-y-2 text-sm leading-6 text-muted-foreground"><p>推理不再执行额外 LoRA 分支，部署简单。</p><p>需要生成接近完整模型大小的新权重，不便快速切换多任务。</p></CardContent></Card>
          <Card><CardHeader><Badge variant="secondary" className="w-fit">Adapter 服务</Badge><CardTitle>基座 + 多个小适配器</CardTitle></CardHeader><CardContent className="space-y-2 text-sm leading-6 text-muted-foreground"><p>便于按租户或任务切换，也节省存储。</p><p>Adapter 缓存、请求调度和连续批处理会更复杂。</p></CardContent></Card>
        </div>
        <p>4-bit 基座的合并通常要先反量化，再加入高精度更新，随后保存为高精度或重新量化。再次量化会引入新误差，必须重新评测；Adapter 还必须匹配精确基座版本、模块形状、Tokenizer 与 Chat Template。</p>
      </LessonSection>

      <LessonSection id="lesson-9-choice" eyebrow="14 · 方法选型" title="Prompt、RAG、LoRA、QLoRA 与全参微调怎样选">
        <div className="overflow-x-auto rounded-xl border bg-card">
          <div className="min-w-[720px]">
            {[
              ['Prompt / Few-shot', '规则清楚、变化快、先验证可行性', '无需训练，能力上限受基座约束'],
              ['RAG / Tool', '动态事实、私有资料、需要来源', '检索与生成链路都要评测'],
              ['LoRA', '行为、格式、风格、稳定任务', '基座仍需 BF16/FP16 等精度加载'],
              ['QLoRA', '显存紧张且可接受量化基座', '省显存为主，不保证更快'],
              ['Full Fine-tuning', '大规模领域/语言迁移且资源充足', '成本高、遗忘与部署风险更大'],
            ].map(([method, fit, boundary], index) => <div key={method} className={`grid grid-cols-[160px_1fr_1fr] gap-4 p-4 text-sm ${index ? 'border-t' : ''}`}><strong className="font-mono text-primary">{method}</strong><span>{fit}</span><span className="text-muted-foreground">{boundary}</span></div>)}
          </div>
        </div>
      </LessonSection>

      <LessonSection id="lesson-9-interview" eyebrow="15 · 面试表达" title="60 秒讲清 LoRA 与 QLoRA">
        <InterviewAnswer question="LoRA 为什么有效？QLoRA 又多做了什么？">
          LoRA 冻结原权重 W，把任务更新限制为低秩矩阵 ΔW=BA。若原矩阵为 d_out×d_in，全参需要训练 d_outd_in 个参数，而 LoRA 只训练 r(d_in+d_out) 个，因此显著减少梯度和优化器状态。Rank 决定更新子空间容量，Alpha 控制更新缩放，Target Modules 决定哪些变换可被调整。QLoRA 再把冻结基座以 NF4 形式 4-bit 存储，计算时按块反量化到 BF16 等精度，只训练高精度 Adapter。它主要节省基座权重及全参训练状态，但完整前向、激活与临时缓冲仍在，所以长序列仍可能 OOM。实际选型还要看任务是否属于行为调整，动态事实通常更应使用 RAG 或工具。
        </InterviewAnswer>
      </LessonSection>

      <LessonSection id="lesson-9-mistakes" eyebrow="16 · 避坑" title="十个最容易把“会用”说成“没理解”的误区">
        <div className="space-y-3">
          {[
            ['LoRA 把原模型缩小了', '基座仍完整存在，只是被冻结并增加低秩更新分支。'],
            ['Rank 16 就是训练 16% 参数', '比例由 Rank、矩阵形状、层数和 Target Modules 共同决定。'],
            ['Rank 越高效果一定越好', '容量更高也可能带来过拟合与资源浪费。'],
            ['Alpha 有一个通用最佳值', '它要与 Rank、学习率、初始化和训练步数一起调。'],
            ['LoRA 永远只选 Q、V', '不同架构、任务与资源会得到不同最优覆盖范围。'],
            ['底座冻结就不用反向传播', '仍要沿计算图反传，才能更新 Adapter。'],
            ['QLoRA 直接更新 4-bit 底座', '经典 QLoRA 冻结量化底座，只训练 Adapter。'],
            ['4-bit 7B 只要 3.5GB 就能训练', '训练还要 Adapter 状态、激活、缓冲、元数据与安全余量。'],
            ['QLoRA 一定比 LoRA 更快', '反量化与特殊 Kernel 可能增加开销。'],
            ['同架构 Adapter 可以随便混用', '精确权重版本、模块、Tokenizer 和模板都要匹配。'],
          ].map(([wrong, right]) => <div key={wrong} className="flex gap-3 rounded-xl border bg-card p-4"><CircleAlert className="mt-1 size-4 shrink-0 text-destructive" /><div><p className="font-medium text-foreground line-through decoration-destructive/60">{wrong}</p><p>{right}</p></div></div>)}
        </div>
      </LessonSection>

      <LessonSection id="lesson-9-quiz" eyebrow="17 · 主动回忆" title="闭卷检查低秩、量化与工程边界">
        <QuizList questions={[
          { question: '一个 4096×4096 矩阵使用 Rank 16，LoRA 参数量是多少？', answer: '16×(4096+4096)=131,072，约为原矩阵参数量的 0.78%。' },
          { question: 'A 为 16×4096、B 为 4096×16，BA 的秩最大是多少？', answer: '最大为 16，因为矩阵乘积的秩不超过两个因子的最小秩。' },
          { question: '经典 LoRA 中 Alpha 主要控制什么？', answer: '通过 α/r 控制 Adapter 更新分支的缩放；应与 Rank、学习率和训练步数共同判断。' },
          { question: '底座被冻结后，哪些成本仍然存在？', answer: '完整前向计算、Adapter 所需的激活与反向传播、临时缓冲，以及基座权重存储都还存在。' },
          { question: 'QLoRA 的 4-bit、计算精度和 Adapter 精度分别是什么关系？', answer: '冻结基座以 4-bit 存储，使用时通常反量化到 BF16 等格式计算；Adapter 以 BF16/FP16 等较高精度训练。' },
          { question: 'Double Quantization 是把 4-bit 权重变成 2-bit 吗？', answer: '不是。它主要进一步量化分组缩放常数，减少量化元数据。' },
          { question: 'LoRA 仍然 OOM 时，为什么先看序列长度而不一定先降 Rank？', answer: '若峰值主要来自激活，序列长度与 Micro Batch 的影响远大于少量 Adapter 参数；可先降长度或开启 Checkpointing。' },
          { question: '持续变化并要求引用来源的企业事实，优先 LoRA 还是 RAG？', answer: '优先 RAG、搜索或工具；LoRA 适合行为和表达调整，不是可靠的动态知识库。' },
        ]} />
      </LessonSection>

      <div className="flex flex-wrap justify-between gap-3 border-t pt-6">
        <Button variant="outline" size="lg" onClick={onPrevious}><ArrowLeft data-icon="inline-start" />返回 Lesson 08</Button>
        <Button size="lg" onClick={onNext}>下一课：RLHF 与 DPO<ArrowRight data-icon="inline-end" /></Button>
      </div>
    </article>
  );
}
