'use client';

import { ArrowLeft, ArrowRight, CheckCircle2, CircleAlert, Cpu, Layers3, Zap } from 'lucide-react';

import {
  AttentionDemo,
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

export function LessonThree({ onPrevious, onNext }: { onPrevious: () => void; onNext: () => void }) {
  return (
    <article className="lesson-article space-y-10">
      <KeyStatement>
        Self-Attention 让每个 Token 动态聚合上下文信息；FFN 在每个位置继续加工，残差与 RMSNorm 保证深层网络稳定，多个 Block 堆叠后形成上下文化表示。
      </KeyStatement>

      <LessonSection id="lesson-3-goals" eyebrow="01 · 学习目标" title="这一课要把 Transformer 拆开看懂">
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            '说清 Q、K、V 分别参与什么计算',
            '写出 Scaled Dot-Product Attention 公式',
            '解释因果 Mask 与训练并行并不矛盾',
            '理解 MHA、GQA、KV Cache 与推理性能',
          ].map((goal) => (
            <div key={goal} className="flex gap-3 rounded-xl border bg-card p-4 text-foreground">
              <CheckCircle2 className="mt-1 size-4 shrink-0 text-primary" />{goal}
            </div>
          ))}
        </div>
      </LessonSection>

      <LessonSection id="lesson-3-flow" eyebrow="02 · 完整主链" title="从 Embedding 到下一个 Token">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['01', 'Embedding + Position', 'Token 变成带位置信息的初始向量'],
            ['02', 'N × Transformer Block', 'Attention 交换信息，FFN 继续加工'],
            ['03', 'Final Norm + LM Head', '隐藏状态投影到词表大小的 Logits'],
            ['04', 'Softmax + Decoding', '得到概率，选择下一个 Token'],
          ].map(([number, title, text]) => (
            <Card key={number} className="relative overflow-hidden">
              <CardContent className="p-4">
                <span className="font-mono text-xs font-semibold text-primary">{number}</span>
                <strong className="mt-3 block text-sm text-foreground">{title}</strong>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <FormulaBlock label="常见 Pre-Norm Block">Uˡ = Xˡ + Attention(RMSNorm(Xˡ))
Xˡ⁺¹ = Uˡ + FFN(RMSNorm(Uˡ))</FormulaBlock>
        <p>
          假设序列长度为 <code>T</code>、隐藏维度为 <code>d</code>，每层输入形状通常是 <code>T × d</code>。最后取当前位置隐藏状态 <code>h_t</code>，经 LM Head 得到词表中每个候选的 Logit。
        </p>
        <FormulaBlock>z_t = h_t · W_vocab</FormulaBlock>
      </LessonSection>

      <LessonSection id="lesson-3-qkv" eyebrow="03 · Q / K / V" title="Attention 如何决定“看谁、拿什么”">
        <p>同一份输入 <code>X</code> 经过三组可学习的线性投影：</p>
        <FormulaBlock>Q = XW_Q    K = XW_K    V = XW_V</FormulaBlock>
        <div className="grid gap-3 md:grid-cols-3">
          {[
            ['Query', '当前位置想找什么', '发起匹配'],
            ['Key', '每个位置用什么特征被匹配', '决定相关性'],
            ['Value', '该位置真正提供什么信息', '被加权聚合'],
          ].map(([title, intuition, role]) => (
            <Card key={title}>
              <CardHeader><Badge variant="secondary" className="w-fit">{role}</Badge><CardTitle className="font-mono">{title}</CardTitle></CardHeader>
              <CardContent className="text-sm leading-6 text-muted-foreground">{intuition}</CardContent>
            </Card>
          ))}
        </div>
        <p>
          这些只是便于理解的类比。Q、K、V 并非人工写死的三类语义，而是训练自动学出的向量。不同投影让“如何匹配”和“匹配后传递什么”能够分开学习。
        </p>
        <AttentionDemo />
      </LessonSection>

      <LessonSection id="lesson-3-attention" eyebrow="04 · 核心公式" title="Scaled Dot-Product Attention 四步拆解">
        <FormulaBlock label="完整公式">Attention(Q,K,V) = softmax(QKᵀ / √d_k + M) · V</FormulaBlock>
        <div className="space-y-3">
          {[
            ['① QKᵀ', '计算每个 Query 与所有 Key 的匹配分数，得到 T × T 矩阵。'],
            ['② ÷ √dₖ', '维度增大时点积也易变大；缩放可避免 Softmax 过度饱和和梯度过小。'],
            ['③ + Mask → Softmax', '屏蔽不可见位置，并把每行分数变成和为 1 的权重。'],
            ['④ 权重 × V', '按照“看谁”的权重汇总 Value，得到当前位置的新表示。'],
          ].map(([title, text]) => (
            <div key={title} className="grid gap-1 rounded-xl border bg-card p-4 sm:grid-cols-[140px_1fr]">
              <strong className="font-mono text-primary">{title}</strong><span>{text}</span>
            </div>
          ))}
        </div>
        <p>
          Softmax 对每个 Query 所对应的全部可见 Key 做，也就是对分数矩阵的每一行归一化。Attention 可以概括为：<strong className="text-foreground">Q 与 K 决定看谁，V 决定拿回什么。</strong>
        </p>
      </LessonSection>

      <LessonSection id="lesson-3-mask" eyebrow="05 · 因果约束" title="模型训练时为什么不会偷看答案">
        <p>Decoder-only LLM 的第 i 个位置只能读取自己及之前的位置。未来分数被加上负无穷，Softmax 后权重变为 0：</p>
        <FormulaBlock>Mᵢⱼ = 0       当 j ≤ i
Mᵢⱼ = -∞      当 j &gt; i</FormulaBlock>
        <div className="overflow-hidden rounded-xl border bg-card">
          {['位置 1：可看 1', '位置 2：可看 1、2', '位置 3：可看 1、2、3', '位置 4：可看 1、2、3、4'].map((row, index) => (
            <div key={row} className={`flex items-center gap-3 px-4 py-3 ${index ? 'border-t' : ''}`}>
              <span className="grid size-7 place-items-center rounded-full bg-primary/10 font-mono text-xs text-primary">{index + 1}</span>{row}
            </div>
          ))}
        </div>
        <p>
          <strong className="text-foreground">Causal Mask</strong> 防止看到未来；<strong className="text-foreground">Padding Mask</strong> 屏蔽批处理中补齐的 PAD。两者有时会合并实现，但概念不同。
        </p>
      </LessonSection>

      <LessonSection id="lesson-3-heads" eyebrow="06 · 多头注意力" title="为什么要在多个子空间同时观察">
        <FormulaBlock>headₘ = Attention(XW_Qᵐ, XW_Kᵐ, XW_Vᵐ)
MHA(X) = Concat(head₁, ..., headₕ)W_O</FormulaBlock>
        <p>
          不同 Head 可以在不同表示子空间学习语法、指代、位置、主题或代码变量依赖。多头注意力不是多个模型投票，而是同一层内部的并行子空间。
        </p>
        <div className="grid gap-3 md:grid-cols-3">
          {[
            ['MHA', '每个 Query Head 都有独立 K、V Head', '表达能力强，KV Cache 较大'],
            ['MQA', '所有 Query Head 共用一组 K、V', '缓存最小，共享最强'],
            ['GQA', '一组 Query Heads 共用一组 K、V', '质量与推理效率的常见折中'],
          ].map(([title, text, tradeoff]) => (
            <Card key={title}>
              <CardHeader><CardTitle className="font-mono">{title}</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm leading-6 text-muted-foreground"><p>{text}</p><p className="text-foreground">{tradeoff}</p></CardContent>
            </Card>
          ))}
        </div>
      </LessonSection>

      <LessonSection id="lesson-3-block" eyebrow="07 · Block 其余组件" title="Residual、RMSNorm 与 FFN 各司其职">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ['Residual', 'Y = X + F(X)', '保留原信息，让深层网络学习增量并改善梯度传播。'],
            ['RMSNorm', '缩放向量均方根', '稳定数值尺度；通常不做减均值，现代 LLM 常用 Pre-Norm。'],
            ['FFN / SwiGLU', '逐位置非线性变换', 'Attention 负责跨 Token 交换，FFN 负责拿到信息后的深加工。'],
          ].map(([title, formula, text]) => (
            <Card key={title}>
              <CardHeader><CardTitle>{title}</CardTitle><Badge variant="outline" className="w-fit font-mono">{formula}</Badge></CardHeader>
              <CardContent className="text-sm leading-6 text-muted-foreground">{text}</CardContent>
            </Card>
          ))}
        </div>
        <FormulaBlock label="现代 LLM 常见 SwiGLU">FFN(x) = [SiLU(xW_gate) ⊙ (xW_up)]W_down</FormulaBlock>
      </LessonSection>

      <LessonSection id="lesson-3-parameters" eyebrow="加深 A · 模型规模" title="7B、14B 的参数到底从哪里长出来">
        <DeepDive
          title="把 Transformer 想成一栋重复搭建的加工大楼"
          intuition={<>层数 <code>L</code> 像楼层数；隐藏维度 <code>d</code> 像走廊宽度；FFN 中间维度像加工车间；词表 <code>V</code> 决定入口要准备多少种 Token 名片。</>}
          mechanism={<>每层 Attention 有 Q、K、V、O 投影，约 <code>4d²</code>；SwiGLU 常有 Gate、Up、Down 三个矩阵，约 <code>3d·d_ff</code>。所有层重复累加。</>}
          takeaway={<>“7B”是约 70 亿个可训练数字，不是 70 亿条知识。层数增加近似线性；宽度 <code>d</code> 出现在矩阵两边，代价常接近平方增长。</>}
        />
        <FormulaBlock label="Dense Decoder 的粗略参数量">Parameters ≈ V·d + L·(4d² + 3d·d_ff)</FormulaBlock>
        <ParameterAnatomyDemo />
        <div className="grid gap-3 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>FFN 参数多，Attention 长文本贵</CardTitle></CardHeader>
            <CardContent className="text-sm leading-6 text-muted-foreground">FFN 的大矩阵常占 Block 参数大头；但标准 Attention 还要处理 T × T 的位置关系，序列极长时计算与访存会成为瓶颈。两句话可以同时成立。</CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Head 变多，参数不一定同比变多</CardTitle></CardHeader>
            <CardContent className="text-sm leading-6 text-muted-foreground">若总隐藏维度 d 不变，更多 Head 常只是把同一向量切得更细，每个 Head 会变窄；Q/K/V/O 总矩阵尺寸可能基本不变。</CardContent>
          </Card>
        </div>
        <DeepDive
          title="为什么要堆很多层"
          intuition={<>一层只完成一轮“跨 Token 开会取信息 → 各自回工位加工”。多层堆叠，让信息可以被反复组合与修正。</>}
          mechanism={<>每个 Block 都在残差流上增加一次 Attention 与 FFN 变换。浅层到深层可能形成越来越抽象的表示，但不存在“第 10 层固定管语法”的硬规则。</>}
          takeaway={<>Attention 不是整台 Transformer。真正的能力来自位置、Attention、FFN、残差、归一化与许多层共同协作。</>}
        />
      </LessonSection>

      <LessonSection id="lesson-3-inference" eyebrow="08 · 训练与推理" title="训练并行、生成串行，矛盾吗">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><Badge className="w-fit">Training</Badge><CardTitle>整段序列并行</CardTitle></CardHeader>
            <CardContent className="text-sm leading-6 text-muted-foreground">
              完整标准答案已经存在，所有位置的 Q/K/V 可以一次矩阵运算同时计算；因果 Mask 仍保证每个位置只用前缀信息。
            </CardContent>
          </Card>
          <Card>
            <CardHeader><Badge className="w-fit">Inference</Badge><CardTitle>Token 间必须串行</CardTitle></CardHeader>
            <CardContent className="text-sm leading-6 text-muted-foreground">
              第 t+1 个 Token 的输入依赖第 t 个实际采样结果。流式输出改善感知延迟，却不会消除这种自回归依赖。
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border bg-card p-4"><strong className="text-foreground">Prefill</strong><p className="mt-1">并行处理已有 Prompt 并建立 KV Cache，主要影响首 Token 延迟 TTFT。</p></div>
          <div className="rounded-xl border bg-card p-4"><strong className="text-foreground">Decode</strong><p className="mt-1">每次处理一个新 Token，主要看 TPOT 或 tokens/s。</p></div>
        </div>
      </LessonSection>

      <LessonSection id="lesson-3-kv" eyebrow="09 · KV Cache" title="缓存什么，为什么不缓存过去的 Q">
        <p>
          历史 Token 在同一层中的 K、V 不会因新 Token 到来而改变，因此可缓存。新一步只计算新 Token 的 Q/K/V，用新 Q 查询历史 K、汇总历史 V，再把新 K/V 追加进缓存。
        </p>
        <FormulaBlock label="粗略显存关系">KV bytes ∝ 2 × L × T × H_kv × d_head × bytes_per_element</FormulaBlock>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ['为什么不缓存旧 Q', '旧 Q 已完成过去位置的查询，新位置只需要自己的 Q。'],
            ['它解决什么', '避免每生成一个 Token 都重算全部历史 K、V。'],
            ['它没有解决什么', '无法消除逐 Token 串行，且缓存显存随 T 近似线性增长。'],
          ].map(([title, text]) => (
            <Card key={title}><CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader><CardContent className="text-sm leading-6 text-muted-foreground">{text}</CardContent></Card>
          ))}
        </div>
      </LessonSection>

      <LessonSection id="lesson-3-engineering" eyebrow="10 · 工程取舍" title="Attention 如何影响 AI 应用性能">
        <div className="space-y-3">
          {[
            ['长上下文不是免费的', '标准 Attention 的 Prefill 计算随序列长度近似 O(T²)，KV Cache 则随 T 近似线性增长。'],
            ['KV Cache 限制并发', '单请求缓存越大，同一张 GPU 能同时容纳的请求越少。'],
            ['GQA/MQA 换吞吐', '减少 KV Heads 可以降低缓存与 Decode 成本，但共享表示可能带来质量取舍。'],
            ['FlashAttention 优化访存', '通过分块等方式减少中间矩阵读写；通常不等于把标准 Attention 理论复杂度变成 O(T)。'],
            ['Prompt 裁剪是系统工程', '完整状态留在数据库或状态机，只把当前步骤需要的证据和历史投影进 Prompt。'],
          ].map(([title, text], index) => (
            <div key={title} className="grid gap-2 rounded-xl border bg-card p-4 sm:grid-cols-[42px_180px_1fr] sm:items-center">
              <span className="grid size-8 place-items-center rounded-lg bg-primary/10 font-mono text-xs text-primary">{index + 1}</span>
              <strong className="text-foreground">{title}</strong><span>{text}</span>
            </div>
          ))}
        </div>
      </LessonSection>

      <LessonSection id="lesson-3-interview" eyebrow="11 · 面试表达" title="60 秒标准回答">
        <InterviewAnswer question="请解释 Transformer 的核心结构与 Self-Attention。">
          Transformer 的核心模块是 Self-Attention。输入 Token 经过 Embedding 后，在每层通过不同线性投影得到 Q、K、V；Q 和 K 的点积表示匹配程度，除以根号 d_k 后加入因果 Mask，再经 Softmax 得到权重，最后对 V 加权求和。因果 Mask 保证 Decoder-only 模型只能看到当前及之前的 Token。多头注意力让模型在不同子空间捕捉不同关系；Attention 负责跨 Token 交换信息，FFN 负责每个位置上的非线性加工，Residual 与 RMSNorm 帮助深层网络稳定训练。训练时完整序列已知，因此可以用 Mask 并行计算；推理仍要逐 Token 串行。KV Cache 保存每层历史 Token 的 K、V，减少重复计算，但显存会随上下文长度增长。
        </InterviewAnswer>
        <Card>
          <CardHeader><CardTitle>回答的三层结构</CardTitle></CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            {[
              [Cpu, '公式层', 'QKᵀ / √dₖ + Mask → Softmax → 加权 V'],
              [Layers3, '结构层', 'Attention + FFN + Residual + RMSNorm'],
              [Zap, '工程层', 'Prefill、Decode、KV Cache、GQA 与长上下文'],
            ].map(([Icon, title, text]) => {
              const ItemIcon = Icon as typeof Cpu;
              return <div key={title as string} className="rounded-xl bg-muted p-4 text-sm leading-6"><ItemIcon className="mb-2 size-4 text-primary" /><strong className="block text-foreground">{title as string}</strong><span>{text as string}</span></div>;
            })}
          </CardContent>
        </Card>
      </LessonSection>

      <LessonSection id="lesson-3-mistakes" eyebrow="12 · 避坑" title="八个高频错误说法">
        <div className="space-y-3">
          {[
            ['Attention 就等于理解', '它是信息聚合机制，只是完整模型计算的一部分。'],
            ['Q、K、V 是人工定义的固定语义', '它们是训练学习出的不同线性投影。'],
            ['因果 Mask 会删除未来 Token', '它只把未来位置的注意力权重压到 0。'],
            ['训练并行说明 Token 没有依赖', '依赖仍在，只是由 Mask 在矩阵中同时表达。'],
            ['多头注意力是多个模型投票', '它是同一层里的多个表示子空间。'],
            ['FFN 负责跨 Token 交流', 'FFN 通常逐位置计算，跨位置交流主要靠 Attention。'],
            ['KV Cache 让整段生成并行', '它减少重复计算，但不消除自回归串行。'],
            ['Attention 权重能直接解释模型原因', '权重只是某层某头的中间量，不能直接当完整因果解释。'],
          ].map(([wrong, right]) => (
            <div key={wrong} className="flex gap-3 rounded-xl border bg-card p-4"><CircleAlert className="mt-1 size-4 shrink-0 text-destructive" /><div><p className="font-medium text-foreground line-through decoration-destructive/60">{wrong}</p><p>{right}</p></div></div>
          ))}
        </div>
      </LessonSection>

      <LessonSection id="lesson-3-quiz" eyebrow="13 · 主动回忆" title="闭卷检查核心机制">
        <QuizList questions={[
          { question: '写出 Scaled Dot-Product Attention 公式，并说出每一步作用。', answer: 'Attention(Q,K,V)=softmax(QKᵀ/√d_k+M)V。QKᵀ 算匹配，缩放稳定 Softmax，Mask 屏蔽位置，Softmax 得到权重，最后聚合 V。' },
          { question: '为什么点积要除以 √d_k？', answer: '维度变大时点积方差也会增大，Softmax 容易饱和、分布过尖并导致梯度过小；缩放可稳定分数范围。' },
          { question: '训练为什么可以并行，而推理不能一次生成完整答案？', answer: '训练时完整目标序列已知，可用三角因果 Mask 同时计算各位置；推理时后一步依赖前一步实际生成结果，因此生成步骤串行。' },
          { question: 'Attention 与 FFN 的职责有什么区别？', answer: 'Attention 负责不同 Token 位置间的信息聚合；FFN 在每个位置独立进行非线性特征加工。' },
          { question: 'KV Cache 缓存什么，为什么不缓存旧 Q？', answer: '缓存每层历史 Token 的 K 和 V。新位置需要自己的 Q 查询历史 K 并汇总历史 V；旧 Q 已完成过去查询，通常不再使用。' },
          { question: 'MHA、MQA、GQA 的主要区别是什么？', answer: '区别在 K/V Heads 的共享程度：MHA 各自独立，MQA 全部共享一组，GQA 分组共享，是质量与缓存成本的折中。' },
          { question: '为什么把 Agent 的全部历史都塞进 Prompt 可能更差？', answer: '会提高 Prefill、KV Cache、延迟和成本，并让有效信息与噪声竞争；应把完整状态外置，只投影当前任务需要的内容。' },
          { question: '为什么隐藏维度翻倍时，主干参数常接近四倍？', answer: 'Attention 和 FFN 的主要权重都是大矩阵，隐藏维度 d 同时出现在输入和输出两边，因此多项近似按 d² 增长。' },
          { question: '为什么“FFN 参数更多”和“长上下文 Attention 更贵”不矛盾？', answer: '参数量与运行时计算瓶颈不是同一个指标。FFN 大矩阵常占更多参数；标准 Attention 的位置两两交互却会随序列长度约按 T² 增长。' },
        ]} />
      </LessonSection>

      <div className="flex flex-wrap justify-between gap-3 border-t pt-6">
        <Button variant="outline" size="lg" onClick={onPrevious}><ArrowLeft data-icon="inline-start" />返回 Lesson 02</Button>
        <Button size="lg" onClick={onNext}>下一课：预训练与 SFT<ArrowRight data-icon="inline-end" /></Button>
      </div>
    </article>
  );
}
