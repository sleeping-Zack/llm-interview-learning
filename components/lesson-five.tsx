'use client';

import { ArrowLeft, ArrowRight, CheckCircle2, CircleAlert, Cpu, Database, SlidersHorizontal, Sparkles } from 'lucide-react';

import {
  FormulaBlock,
  InterviewAnswer,
  KeyStatement,
  LessonSection,
  LoraParameterDemo,
  QuizList,
} from '@/components/learning-widgets';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function LessonFive({ onPrevious, onRoadmap }: { onPrevious: () => void; onRoadmap: () => void }) {
  return (
    <article className="lesson-article space-y-10">
      <KeyStatement>
        Prompt 与 RAG 改变“这次看到了什么”；SFT/LoRA 改变“习惯怎样回答”；RLHF/DPO 改变“多个可行回答中更偏好哪一个”。
      </KeyStatement>

      <LessonSection id="lesson-5-goals" eyebrow="01 · 学习目标" title="先把训练目标和训练方式分开">
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            '区分全量微调、PEFT、LoRA 与 QLoRA',
            '解释 rank、alpha、dropout、target modules',
            '说清经典 PPO-based RLHF 的完整流程',
            '理解 DPO 公式、参考模型与选型边界',
          ].map((goal) => <div key={goal} className="flex gap-3 rounded-xl border bg-card p-4 text-foreground"><CheckCircle2 className="mt-1 size-4 shrink-0 text-primary" />{goal}</div>)}
        </div>
        <Card className="border-primary/20 bg-primary/5"><CardContent className="pt-6 text-sm leading-6 text-foreground"><strong>SFT / DPO</strong> 描述用什么数据与 Loss 训练；<strong>LoRA</strong> 描述只更新哪些参数、怎样低成本更新。两者不是同一层概念，完全可以组合。</CardContent></Card>
      </LessonSection>

      <LessonSection id="lesson-5-map" eyebrow="02 · 方法地图" title="四类手段分别解决什么问题">
        <div className="grid gap-4 md:grid-cols-2">
          {[
            ['Prompt', '本次任务规则', '规则能写清、变化频繁、样本很少时，先建立最低成本基线。'],
            ['RAG', '外部动态知识', '知识需更新、引用和追溯时，把检索证据放入上下文。'],
            ['SFT + LoRA', '稳定任务行为', '学习输出格式、领域表达、工具调用与大量示例模式。'],
            ['DPO / RLHF', '回答偏好与边界', '多个回答都能用，但帮助性、安全、语气或质量有明显优劣。'],
          ].map(([title, focus, text]) => <Card key={title}><CardHeader><Badge variant="secondary" className="w-fit">{focus}</Badge><CardTitle className="font-mono">{title}</CardTitle></CardHeader><CardContent className="text-sm leading-6 text-muted-foreground">{text}</CardContent></Card>)}
        </div>
        <FormulaBlock>Prompt baseline → RAG（缺知识）→ SFT/LoRA（行为不稳）→ DPO（偏好排序）</FormulaBlock>
        <p>它们不是互斥关系：真实系统可以由 RAG 提供证据、LoRA 学业务回答结构、DPO 调整偏好，Prompt 负责当前任务约束。</p>
      </LessonSection>

      <LessonSection id="lesson-5-peft" eyebrow="03 · 全量微调 vs PEFT" title="为什么不总是更新全部参数">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><Badge className="w-fit">Full Fine-tuning</Badge><CardTitle>全量微调</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm leading-6 text-muted-foreground"><p>所有或大部分权重参与梯度和更新，自由度高、能力上限通常更强。</p><p>但梯度、Adam 动量、激活与主权重带来巨大显存和训练成本，每个任务还需保存完整模型。</p></CardContent>
          </Card>
          <Card>
            <CardHeader><Badge className="w-fit">PEFT</Badge><CardTitle>参数高效微调</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm leading-6 text-muted-foreground"><p>冻结绝大多数基座参数，只训练少量新增参数或被选择的参数。</p><p>成本低、任务 Adapter 小、便于多租户切换，但更新空间受限，不保证等价于全量微调。</p></CardContent>
          </Card>
        </div>
        <FormulaBlock label="训练显存不是只有权重">M_train ≈ M_weights + M_gradients + M_optimizer + M_activations + M_buffers</FormulaBlock>
        <p>所以“7B × 2 字节 = 14GB”只是某些推理权重的粗算，不能拿来估计完整训练显存。</p>
      </LessonSection>

      <LessonSection id="lesson-5-lora" eyebrow="04 · LoRA 原理" title="把完整更新限制在一个低秩子空间">
        <p>全量微调直接学习与原矩阵同大小的 <code>ΔW</code>；LoRA 假设任务更新可以用两个小矩阵近似：</p>
        <FormulaBlock>W' = W₀ + ΔW
ΔW = B · A
h = W₀x + (α / r) · B · A · x</FormulaBlock>
        <p>
          原权重 <code>W₀</code> 冻结，只训练 <code>A</code> 和 <code>B</code>。通常一支随机初始化、另一支初始化为 0，使训练开始时 <code>ΔW=0</code>，不会突然改变基座输出。
        </p>
        <LoraParameterDemo />
        <p>
          为什么可能有效？预训练模型已有通用能力，垂直任务往往只需沿少数方向调整格式、语言风格、决策边界或工具调用习惯。但低秩是容量假设，不是所有任务都严格成立。
        </p>
      </LessonSection>

      <LessonSection id="lesson-5-hyperparams" eyebrow="05 · LoRA 超参数" title="rank、alpha、dropout 与 target modules">
        <div className="space-y-3">
          {[
            ['rank / r', '低秩空间容量', '小则便宜但表达受限；大则容量和参数量近似线性增加，也可能更易过拟合。'],
            ['alpha', 'LoRA 分支缩放', '通常通过 α/r 作用；还与学习率、初始化和优化器共同决定更新强度。'],
            ['dropout', 'LoRA 分支正则化', '小数据时可降低过拟合；不是把基座权重永久丢弃。'],
            ['target_modules', '哪些线性层加 LoRA', '可选 q/k/v/o_proj 与 MLP 的 gate/up/down_proj；覆盖越多容量和成本越高。'],
          ].map(([name, role, text], index) => (
            <div key={name} className="grid gap-2 rounded-xl border bg-card p-4 sm:grid-cols-[42px_140px_140px_1fr] sm:items-center"><span className="grid size-8 place-items-center rounded-lg bg-primary/10 font-mono text-xs text-primary">{index + 1}</span><strong className="font-mono text-foreground">{name}</strong><Badge variant="secondary" className="w-fit">{role}</Badge><span>{text}</span></div>
          ))}
        </div>
        <p>
          不同模型模块命名不同，不能盲抄配置。训练前必须打印可训练参数和匹配模块，否则可能一个模块都没匹配，或意外训练过多层。
        </p>
      </LessonSection>

      <LessonSection id="lesson-5-deploy" eyebrow="06 · 保存与部署" title="Adapter 分开加载，还是合并权重">
        <div className="grid gap-4 md:grid-cols-2">
          <Card><CardHeader><CardTitle>Base + Adapter</CardTitle></CardHeader><CardContent className="space-y-2 text-sm leading-6 text-muted-foreground"><p>Adapter 小，一个基座可动态切换多个业务版本，适合多租户。</p><p>推理框架需支持 Adapter，并严格绑定基座、Tokenizer、模板和配置版本。</p></CardContent></Card>
          <Card><CardHeader><CardTitle>Merge into Base</CardTitle></CardHeader><CardContent className="space-y-2 text-sm leading-6 text-muted-foreground"><p>把 α/r · BA 写回 W₀，推理结构与普通模型一致，通常无额外 LoRA 分支。</p><p>需要保存新的完整权重，不便动态切换；量化模型还需谨慎处理反量化和重量化误差。</p></CardContent></Card>
        </div>
        <FormulaBlock>W_merged = W₀ + (α / r) · B · A</FormulaBlock>
      </LessonSection>

      <LessonSection id="lesson-5-qlora" eyebrow="07 · QLoRA" title="4-bit 冻结基座 + 高精度 LoRA">
        <p>QLoRA 的典型思路是：冻结的基座以 4-bit 存储，计算时按需反量化到 BF16/FP16，梯度只更新较高精度的 LoRA 参数。</p>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ['NF4', '针对近似正态分布权重设计的 4-bit 表示，让有限的 16 个取值更适合模型权重。'],
            ['Double Quantization', '进一步量化分块 Scale 等量化常数，减少元数据开销；不是把 4-bit 再压成 2-bit。'],
            ['Paged Optimizer', '用统一内存分页思想缓解优化器状态的显存峰值，降低突发 OOM 风险。'],
          ].map(([title, text]) => <Card key={title}><CardHeader><CardTitle className="font-mono text-base">{title}</CardTitle></CardHeader><CardContent className="text-sm leading-6 text-muted-foreground">{text}</CardContent></Card>)}
        </div>
        <Card className="border-amber-500/25 bg-amber-500/8"><CardContent className="pt-6 text-sm leading-6 text-foreground"><strong>“4-bit 训练”并不表示所有内容都是 4-bit：</strong>Adapter、梯度、优化器、激活、临时计算与 KV Cache 通常仍使用更高精度。</CardContent></Card>
      </LessonSection>

      <LessonSection id="lesson-5-memory" eyebrow="08 · 显存追问" title="QLoRA 为什么仍然可能 OOM">
        <FormulaBlock>M_total ≈ M_4bit_base + M_LoRA + M_gradients
+ M_optimizer + M_activations + M_buffers</FormulaBlock>
        <p>4-bit 主要压缩基座权重，长序列和大 Batch 的激活仍可能成为主瓶颈。常见优化顺序：</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            '降低 Micro Batch，用 Gradient Accumulation 保持有效 Batch',
            '缩短序列或按长度分桶，避免偶发超长样本制造峰值',
            '开启 Gradient Checkpointing，以额外计算换激活显存',
            '使用更省显存的 Attention，减少 Rank 或 Target Modules',
          ].map((item, index) => <div key={item} className="flex gap-3 rounded-xl border bg-card p-4"><span className="font-mono text-xs text-primary">0{index + 1}</span><span>{item}</span></div>)}
        </div>
      </LessonSection>

      <LessonSection id="lesson-5-rlhf" eyebrow="09 · RLHF" title="经典 PPO-based RLHF 的三段流程">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ['01 · SFT', '先用高质量指令答案得到可对话的初始策略模型。'],
            ['02 · Reward Model', '用同题 chosen/rejected 偏好对学习一个回答标量评分。'],
            ['03 · PPO', '策略在线生成，奖励模型评分，再在 KL 约束下更新策略。'],
          ].map(([title, text]) => <Card key={title}><CardHeader><CardTitle>{title}</CardTitle></CardHeader><CardContent className="text-sm leading-6 text-muted-foreground">{text}</CardContent></Card>)}
        </div>
        <FormulaBlock label="奖励模型偏好损失">L_RM = -log σ(r_φ(x,y_chosen) - r_φ(x,y_rejected))</FormulaBlock>
        <FormulaBlock label="带参考约束的奖励直觉">R(x,y) = r_φ(x,y) - β · KL(π_θ || π_ref)</FormulaBlock>
        <p>
          KL 惩罚限制策略为迎合奖励模型而偏离原模型太远。完整链路可能同时维护策略、参考、奖励和价值模型，还要在线采样与 PPO 更新，成本高且超参数敏感。
        </p>
        <p>
          奖励模型只是在近似标注偏好，可能偏好表面更长、更礼貌的回答，也可能被策略钻漏洞，这叫 Reward Hacking。
        </p>
      </LessonSection>

      <LessonSection id="lesson-5-dpo" eyebrow="10 · DPO" title="不用显式奖励模型，直接优化偏好差异">
        <p>一条 DPO 数据包含同一个问题 <code>x</code>、更好的回答 <code>y_w</code> 与较差回答 <code>y_l</code>。它比较当前模型相对参考模型对两者的概率变化：</p>
        <FormulaBlock>s_θ(x,y) = log π_θ(y|x) - log π_ref(y|x)</FormulaBlock>
        <FormulaBlock>L_DPO = -log σ(β · [s_θ(x,y_w) - s_θ(x,y_l)])</FormulaBlock>
        <p>
          直觉上，让 chosen 相对参考模型的提升大于 rejected 的提升。参考模型提供稳定锚点，防止策略为了拟合偏好对而无约束漂移。
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <Card><CardHeader><Badge className="w-fit">PPO-based RLHF</Badge><CardTitle>显式奖励 + 在线强化学习</CardTitle></CardHeader><CardContent className="text-sm leading-6 text-muted-foreground">有奖励模型与 Rollout，探索能力更灵活，但显存、吞吐和稳定性工程复杂。</CardContent></Card>
          <Card><CardHeader><Badge className="w-fit">DPO</Badge><CardTitle>离线偏好对 + 类监督损失</CardTitle></CardHeader><CardContent className="text-sm leading-6 text-muted-foreground">无独立奖励模型和 PPO，通常更简单稳定，但强依赖离线偏好数据覆盖与质量。</CardContent></Card>
        </div>
        <p>
          严谨地说，DPO 不需要<strong className="text-foreground">经典 PPO-based RLHF</strong> 的显式奖励模型和 PPO；若把 RLHF 广义理解为“利用人类反馈对齐”，DPO 也属于偏好对齐方法。
        </p>
      </LessonSection>

      <LessonSection id="lesson-5-data-eval" eyebrow="11 · 数据与评测" title="数据质量通常比盲目增大 rank 更重要">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><Database className="size-5 text-primary" /><CardTitle>训练数据</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm leading-6 text-muted-foreground"><p>输入贴近线上分布，答案正确一致，模板、工具 Schema 与推理阶段一致。</p><p>DPO 的 chosen 必须真实更好，rejected 不能差得毫无信息量，也不能带来源偏差。</p></CardContent>
          </Card>
          <Card>
            <CardHeader><SlidersHorizontal className="size-5 text-primary" /><CardTitle>评测切面</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm leading-6 text-muted-foreground"><p>任务成功率、格式合法率、事实性、安全、通用能力回归、延迟与显存。</p><p>DPO 还看 Margin、概率漂移、输出长度、过度拒答和分布外表现。</p></CardContent>
          </Card>
        </div>
        <p>Adapter 必须绑定精确基座版本、Tokenizer、Chat Template、Target Modules、Rank/Alpha、数据和训练代码版本。“同为 7B”并不足以保证兼容。</p>
      </LessonSection>

      <LessonSection id="lesson-5-interview" eyebrow="12 · 面试表达" title="60 秒标准回答">
        <InterviewAnswer question="请介绍 LoRA、QLoRA、RLHF 与 DPO 的区别。">
          LoRA 是参数高效微调方法，它冻结基座权重，把完整更新矩阵写成低秩分解 ΔW=BA，使参数量从 d×k 降为 r(d+k)。Rank 控制容量，Alpha 控制缩放，Target Modules 决定适配哪些 Attention 或 MLP 层。QLoRA 在此基础上把冻结基座以 4-bit 保存，典型涉及 NF4、Double Quantization 和 Paged Optimizer，但 Adapter、梯度、激活和计算并不全是 4-bit，因此长序列仍可能 OOM。经典 PPO-based RLHF 先 SFT，再训练奖励模型，最后用 PPO 和 KL 约束优化策略。DPO 则直接用 chosen/rejected 偏好对，相对于参考模型提高 chosen、压低 rejected 的相对概率，不需要单独训练奖励模型和运行 PPO，因此工程上更简单，但依赖离线偏好数据质量。选型上，动态知识优先 RAG，稳定行为用 SFT/LoRA，回答偏好再考虑 DPO 或 RLHF。
        </InterviewAnswer>
        <Card>
          <CardHeader><CardTitle>一句话分层记忆</CardTitle></CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            {[
              [Cpu, 'LoRA / QLoRA', '如何低成本更新参数'],
              [Sparkles, 'SFT / DPO', '用什么训练信号'],
              [Database, 'RAG', '如何在推理时拿外部知识'],
            ].map(([Icon, title, text]) => {
              const ItemIcon = Icon as typeof Cpu;
              return <div key={title as string} className="rounded-xl bg-muted p-4 text-sm leading-6"><ItemIcon className="mb-2 size-4 text-primary" /><strong className="block text-foreground">{title as string}</strong><span>{text as string}</span></div>;
            })}
          </CardContent>
        </Card>
      </LessonSection>

      <LessonSection id="lesson-5-mistakes" eyebrow="13 · 避坑" title="十个容易混淆的说法">
        <div className="space-y-3">
          {[
            ['LoRA 是量化方法', 'LoRA 是低秩微调；QLoRA 才组合 4-bit 基座与 LoRA。'],
            ['QLoRA 所有参数和计算都是 4-bit', '主要是冻结基座权重的存储；其余通常更高精度。'],
            ['LoRA 适合可靠写入大量最新知识', '动态、可追溯知识通常更适合 RAG。'],
            ['rank 越大一定越好', '它是容量、显存与过拟合的权衡。'],
            ['Alpha 越大效果越强越好', '它与 rank、学习率和初始化共同作用，过大可能不稳定。'],
            ['DPO 不需要参考模型', '标准目标显式使用冻结参考策略作为锚点。'],
            ['DPO 与 RLHF 完全无关', '它没有经典 PPO 环节，但广义上仍利用偏好反馈做对齐。'],
            ['奖励模型分数就是真实质量', '它只是偏好近似，可能含偏差或被 Reward Hacking。'],
            ['SFT、LoRA、DPO 是同类概念', 'SFT/DPO 是目标，LoRA 是参数更新方式。'],
            ['训练 Loss 降低就能上线', '还需真实任务、事实性、安全与通用能力回归。'],
          ].map(([wrong, right]) => <div key={wrong} className="flex gap-3 rounded-xl border bg-card p-4"><CircleAlert className="mt-1 size-4 shrink-0 text-destructive" /><div><p className="font-medium text-foreground line-through decoration-destructive/60">{wrong}</p><p>{right}</p></div></div>)}
        </div>
      </LessonSection>

      <LessonSection id="lesson-5-quiz" eyebrow="14 · 主动回忆" title="闭卷检查调优与对齐">
        <QuizList questions={[
          { question: '4096×4096 的线性层，LoRA rank=8，新增多少参数，约占原矩阵多少？', answer: '8×(4096+4096)=65,536；原矩阵 16,777,216，因此约占 0.39%。' },
          { question: 'rank、alpha 与 target_modules 分别控制什么？', answer: 'rank 控制低秩容量；alpha 通常通过 α/r 缩放更新；target_modules 决定哪些 Attention/MLP 线性层加入 LoRA。' },
          { question: 'QLoRA 使用 4-bit 基座后，为什么仍可能 OOM？', answer: '4-bit 主要压缩冻结权重；LoRA 参数、梯度、优化器、激活和临时缓冲仍占显存，长序列激活尤其可能成为瓶颈。' },
          { question: '经典 PPO-based RLHF 的三个阶段是什么？KL 惩罚做什么？', answer: 'SFT、奖励模型、PPO。KL 限制策略偏离参考模型过远，缓解 Reward Hacking、语言退化和不稳定。' },
          { question: '用一句话解释 DPO 以及参考模型为什么重要。', answer: 'DPO 让 chosen 相对参考模型的概率提升大于 rejected；参考模型是行为锚点，防止策略为拟合偏好对而无约束漂移。' },
          { question: '每天更新且必须引用原文的内部政策，应优先 LoRA 还是 RAG？', answer: '优先 RAG，因为知识更新快且要求来源；若回答结构仍不稳定，可再结合 LoRA/SFT。' },
          { question: 'SFT、LoRA 和 DPO 能否组合？', answer: '可以。可先用 LoRA 承载 SFT，再在指令模型上用 LoRA 承载 DPO；SFT/DPO 是训练目标，LoRA 是参数更新方式。' },
        ]} />
      </LessonSection>

      <Card className="overflow-hidden bg-[linear-gradient(135deg,oklch(0.22_0.08_263),oklch(0.44_0.18_266))] text-white ring-0">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="text-sm text-white/65">下一课预告</p><p className="mt-1 font-heading text-xl font-semibold">推理加速、量化与部署</p><p className="mt-1 text-sm text-white/70">KV Cache、Continuous Batching、量化、吞吐、延迟与服务成本。</p></div>
          <Badge variant="secondary">内容整理中</Badge>
        </CardContent>
      </Card>

      <div className="flex flex-wrap justify-between gap-3 border-t pt-6">
        <Button variant="outline" size="lg" onClick={onPrevious}><ArrowLeft data-icon="inline-start" />返回 Lesson 04</Button>
        <Button variant="secondary" size="lg" onClick={onRoadmap}>返回学习地图<ArrowRight data-icon="inline-end" /></Button>
      </div>
    </article>
  );
}
