'use client';

import { ArrowLeft, ArrowRight, CheckCircle2, CircleAlert, GitBranch, Route, Waves } from 'lucide-react';

import { LessonNavigator, RopeRotationLab } from '@/components/advanced-learning-widgets';
import { DeepDive, FormulaBlock, InterviewAnswer, KeyStatement, LessonSection, QuizList } from '@/components/learning-widgets';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const chapters = [
  { id: 'lesson-7-residual-stream', label: '先看整体', title: 'Residual Stream' },
  { id: 'lesson-7-rope', label: '理解顺序', title: 'RoPE 位置' },
  { id: 'lesson-7-norm', label: '稳定深层', title: 'Norm 与残差' },
  { id: 'lesson-7-ffn', label: '加工信息', title: 'FFN / SwiGLU' },
  { id: 'lesson-7-long-context', label: '工程边界', title: '长上下文' },
  { id: 'lesson-7-interview', label: '能输出', title: '面试表达' },
];

export function LessonSeven({ onPrevious, onNext }: { onPrevious: () => void; onNext: () => void }) {
  return (
    <article className="lesson-article space-y-10">
      <KeyStatement>
        一层 Transformer 是“先从别的 Token 取信息，再在本位置加工信息”，两次更新都写回 Residual Stream；位置、Norm 与残差让这套过程能在很多层中稳定重复。
      </KeyStatement>

      <LessonNavigator chapters={chapters} />

      <LessonSection id="lesson-7-goals" eyebrow="01 · 学习目标" title="第二遍学 Transformer，要回答“为什么这样设计”">
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            '用 Residual Stream 串起一个完整 Pre-Norm Block',
            '区分位置编码、Causal Mask 与 Attention 内容匹配',
            '解释 RMSNorm、Residual 与 SwiGLU 的真实职责',
            '说明 RoPE Scaling 为何不能保证长上下文质量',
          ].map((goal) => <div key={goal} className="flex gap-3 rounded-xl border bg-card p-4 text-foreground"><CheckCircle2 className="mt-1 size-4 shrink-0 text-primary" />{goal}</div>)}
        </div>
      </LessonSection>

      <LessonSection id="lesson-7-residual-stream" eyebrow="02 · 全景心智模型" title="Residual Stream 像所有层共同维护的一块白板">
        <p>每个 Token 在每层都有一个 d 维向量。不要把它想成被 Attention“替换”掉，而要想成一块不断写入新信息的公共白板：</p>
        <FormulaBlock label="常见 Pre-Norm Block">Uˡ = Xˡ + Attention(Norm(Xˡ))
Xˡ⁺¹ = Uˡ + FFN(Norm(Uˡ))</FormulaBlock>
        <div className="grid gap-3 md:grid-cols-4">
          {[
            ['01 · Norm', '把当前向量尺度整理到稳定范围'],
            ['02 · Attention', '从允许看到的其他位置读取信息'],
            ['03 · Residual Add', '把读取结果作为增量写回白板'],
            ['04 · FFN + Add', '逐位置加工，再写回一次增量'],
          ].map(([title, text]) => <Card key={title}><CardHeader><CardTitle className="font-mono text-sm">{title}</CardTitle></CardHeader><CardContent className="text-sm leading-6 text-muted-foreground">{text}</CardContent></Card>)}
        </div>
        <DeepDive
          title="为什么要加回 X，而不是只保留 F(X)"
          intuition={<>修改文档时保留原文，再提交一段增量，比每层都从空白重写更稳。即使某个子层暂时没学好，主信息通道仍然存在。</>}
          mechanism={<>残差提供近似恒等路径，信息和梯度可以跨层传播；子层只需学习对当前表示的修正，而不是每次重建全部表示。</>}
          takeaway={<>Residual 不只是“防止信息丢失”的口号，它让非常深的网络更容易优化，并形成贯穿多层的主信息通道。</>}
        />
      </LessonSection>

      <LessonSection id="lesson-7-position-why" eyebrow="03 · 位置问题" title="只有内容匹配，为什么分不清“狗咬人”和“人咬狗”">
        <p>如果没有位置线索，Self-Attention 更像看到一个 Token 集合。相同的“人、狗、咬”虽然内容都在，但谁在前、谁在后没有被完整表达。</p>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ['Content Projection', 'Q/K 里有什么内容特征', '决定“可能相关什么”'],
            ['Position Encoding', 'Token 位于哪里、相隔多远', '让匹配感知顺序与距离'],
            ['Causal Mask', '哪些未来位置不允许读取', '规定可见性，不表达精确距离'],
          ].map(([title, input, role]) => <Card key={title}><CardHeader><Badge variant="secondary" className="w-fit">{role}</Badge><CardTitle className="font-mono text-base">{title}</CardTitle></CardHeader><CardContent className="text-sm leading-6 text-muted-foreground">{input}</CardContent></Card>)}
        </div>
        <p>Causal Mask 的三角形结构确实带来方向性，但现代 LLM 仍通常使用 RoPE 等位置机制，让 Attention 分数显式包含更丰富的相对位置信息。</p>
      </LessonSection>

      <LessonSection id="lesson-7-rope" eyebrow="04 · RoPE 深入" title="把位置写进 Q、K 的旋转角度">
        <FormulaBlock>q̃_m = R_m q_m,    k̃_n = R_n k_n</FormulaBlock>
        <FormulaBlock label="关键性质">q̃_mᵀk̃_n = q_mᵀ R_&#123;n-m&#125; k_n</FormulaBlock>
        <p>左右两边的位置旋转在点积中合成了相对距离 n-m。你不需要推导复数形式，但要明白：RoPE 没有直接给 Token 粘一个整数标签，而是改变 Q、K 的几何关系。</p>
        <RopeRotationLab />
        <DeepDive
          title="为什么不同维度要使用不同旋转频率"
          intuition={<>一组钟表走得快，擅长分辨相邻几个 Token；另一组走得慢，能在更长范围保留不同角度。</>}
          mechanism={<>RoPE 把维度两两配对，并使用从高频到低频的一组角速度。多种频率共同提供局部与长距离位置模式。</>}
          takeaway={<>一个二维转盘只是教学切片；真实 RoPE 是很多频率同时作用，最终 Attention 还会与内容共同决定分数。</>}
        />
      </LessonSection>

      <LessonSection id="lesson-7-qkv" eyebrow="05 · Q/K/V 再深入" title="Q、K 决定路由，V 承载被取回的内容">
        <FormulaBlock>Q = XW_Q,   K = XW_K,   V = XW_V</FormulaBlock>
        <FormulaBlock>Attention(Q,K,V) = softmax(QKᵀ / √d_k + M)V</FormulaBlock>
        <div className="space-y-3">
          {[
            ['线性投影不是固定标签', '同一个 Token 在不同层、不同 Head 的 Q/K/V 会不同，表示是任务中学出来的。'],
            ['缩放不是为了把值限制到 0～1', '除以 √d_k 是控制点积分布尺度，Softmax 才负责归一化。'],
            ['Attention 输出不是复制一个 Token', '它是所有可见 Value 的加权和，再经输出投影写回残差流。'],
            ['权重高不等于完整因果解释', '某层某头的权重只是一处中间路由信号，后面还有多层和 FFN。'],
          ].map(([title, text], index) => <div key={title} className="grid gap-2 rounded-xl border bg-card p-4 sm:grid-cols-[42px_190px_1fr] sm:items-center"><span className="grid size-8 place-items-center rounded-lg bg-primary/10 font-mono text-xs text-primary">{index + 1}</span><strong className="text-foreground">{title}</strong><span>{text}</span></div>)}
        </div>
      </LessonSection>

      <LessonSection id="lesson-7-heads" eyebrow="06 · 多头与 GQA" title="多个 Query 视角，为什么可以共享较少的 K/V">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ['MHA', '每个 Query Head 有自己的 K/V Head', '表达自由度高，KV Cache 最大'],
            ['GQA', '一组 Query Heads 共用一组 K/V', '现代 LLM 常见质量—效率折中'],
            ['MQA', '全部 Query Heads 共用单组 K/V', '缓存最小，共享约束最强'],
          ].map(([title, mechanism, tradeoff]) => <Card key={title}><CardHeader><CardTitle className="font-mono">{title}</CardTitle></CardHeader><CardContent className="space-y-2 text-sm leading-6 text-muted-foreground"><p>{mechanism}</p><p className="text-foreground">{tradeoff}</p></CardContent></Card>)}
        </div>
        <p>GQA 主要减少 K/V 投影与缓存，而 Query Heads 仍可保留多个查询视角。它不会让 Attention 变成另一个算法，核心公式仍然成立。</p>
      </LessonSection>

      <LessonSection id="lesson-7-norm" eyebrow="07 · Norm 与稳定性" title="LayerNorm 与 RMSNorm 都在控制尺度，但并不相同">
        <div className="grid gap-4 md:grid-cols-2">
          <Card><CardHeader><Badge variant="secondary" className="w-fit">Center + Scale</Badge><CardTitle>LayerNorm</CardTitle></CardHeader><CardContent className="space-y-3 text-sm leading-6 text-muted-foreground"><FormulaBlock>LN(x) = γ ⊙ (x-μ) / √(σ²+ε) + β</FormulaBlock><p>先减均值，再按标准差归一化，通常还有可学习 γ、β。</p></CardContent></Card>
          <Card><CardHeader><Badge variant="secondary" className="w-fit">Scale only</Badge><CardTitle>RMSNorm</CardTitle></CardHeader><CardContent className="space-y-3 text-sm leading-6 text-muted-foreground"><FormulaBlock>RMSNorm(x) = γ ⊙ x / √(mean(x²)+ε)</FormulaBlock><p>不减均值，主要控制均方根尺度；计算更简洁，现代 LLM 常见。</p></CardContent></Card>
        </div>
        <DeepDive
          title="Pre-Norm 为什么更容易训练很深"
          intuition={<>先把材料尺寸整理好，再送进加工机；加工结果以增量写回原主线，主线本身不必每层都穿过复杂机器。</>}
          mechanism={<>Pre-Norm 把 Norm 放在 Attention/FFN 之前，Residual 路径更接近直接恒等通道，深层梯度传播通常更稳定。</>}
          takeaway={<>Pre-Norm 与 Post-Norm 是结构位置差异，不是“一个有 Norm、另一个没有”。具体模型还可能使用额外缩放方案。</>}
        />
      </LessonSection>

      <LessonSection id="lesson-7-ffn" eyebrow="08 · FFN / SwiGLU" title="Attention 开完会，为什么每个 Token 还要回工位加工">
        <FormulaBlock label="常见 SwiGLU">FFN(x) = [SiLU(xW_gate) ⊙ (xW_up)]W_down</FormulaBlock>
        <div className="grid gap-3 md:grid-cols-3">
          {[
            ['Up Projection', '从 d 扩展到更大的 d_ff，提供更宽的特征空间。'],
            ['Gate', '学习哪些特征通道应该通过或减弱，而不是固定开关。'],
            ['Down Projection', '把加工结果投回 d 维，作为增量写回 Residual Stream。'],
          ].map(([title, text]) => <Card key={title}><CardHeader><CardTitle>{title}</CardTitle></CardHeader><CardContent className="text-sm leading-6 text-muted-foreground">{text}</CardContent></Card>)}
        </div>
        <DeepDive
          title="FFN 为什么既像“知识加工层”，又不能简单叫数据库"
          intuition={<>FFN 的大矩阵像每个 Token 都会经过的庞大加工车间，能识别和组合大量特征模式。</>}
          mechanism={<>它对每个位置独立使用同一套参数，通过非线性门控变换当前隐藏状态。许多事实关联可能依赖 FFN 参数，但也与 Attention 和其他层共同形成。</>}
          takeaway={<>可以说 FFN 承担重要特征变换与参数容量，不能说“一条知识就存放在某个 FFN 神经元”。</>}
        />
      </LessonSection>

      <LessonSection id="lesson-7-depth" eyebrow="09 · 为什么需要很多层" title="一轮“通信—加工”不够，抽象关系需要反复组合">
        <div className="flex flex-col gap-2 rounded-2xl border bg-card p-5 sm:flex-row sm:items-center">
          {['Token 片段', '局部搭配', '句法与指代', '任务意图', '输出倾向'].map((item, index) => <div key={item} className="flex flex-1 items-center gap-2"><span className="flex-1 rounded-xl bg-muted p-3 text-center text-xs font-medium text-foreground">{item}</span>{index < 4 ? <ArrowRight className="size-4 shrink-0 rotate-90 text-primary sm:rotate-0" /> : null}</div>)}
        </div>
        <p>这是一种理解层级抽象的直觉，不代表每一层都固定负责某一种能力。真实模型中的表示是分布式的，同一能力可能跨越许多层与 Head。</p>
      </LessonSection>

      <LessonSection id="lesson-7-long-context" eyebrow="10 · 长上下文边界" title="RoPE Scaling 能延长坐标尺，却不保证模型会读长文">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            [Route, '位置外推', '超出训练长度后，模型遇到没充分学过的角度与距离分布。'],
            [Waves, '频率缩放', '插值、NTK-aware 等方法改变旋转频率，让更长位置落入可用范围。'],
            [GitBranch, '能力评测', 'Needle、长文问答、代码跨文件与真实 RAG 任务应分开测试。'],
          ].map(([Icon, title, text]) => {
            const ItemIcon = Icon as typeof Route;
            return <Card key={title as string}><CardHeader><ItemIcon className="size-5 text-primary" /><CardTitle>{title as string}</CardTitle></CardHeader><CardContent className="text-sm leading-6 text-muted-foreground">{text as string}</CardContent></Card>;
          })}
        </div>
        <p>把配置从 32k 改成 128k 可能让程序接受更长输入，却不代表模型在长距离事实召回、推理和抗干扰上保持相同质量。位置方法、长上下文训练、数据与推理实现都要配合。</p>
      </LessonSection>

      <LessonSection id="lesson-7-architectures" eyebrow="11 · 架构坐标" title="Encoder、Decoder-only 与 Encoder-Decoder 看见的信息不同">
        <div className="overflow-hidden rounded-xl border bg-card">
          {[
            ['Encoder-only', '双向读取整段输入', '分类、抽取、表示学习等理解任务'],
            ['Decoder-only', 'Causal Mask，只看当前及左侧', '现代通用生成式 LLM 主流'],
            ['Encoder-Decoder', 'Encoder 双向编码；Decoder 生成并 Cross-Attend', '翻译、摘要、输入输出映射'],
          ].map(([type, visibility, use], index) => <div key={type} className={`grid gap-2 p-4 md:grid-cols-[150px_220px_1fr] ${index ? 'border-t' : ''}`}><strong className="font-mono text-primary">{type}</strong><span>{visibility}</span><span className="text-muted-foreground">{use}</span></div>)}
        </div>
        <p>“Transformer”是一类架构积木，不等于所有模型都使用相同 Mask 或数据流。回答具体模型时要先确认它属于哪种形态。</p>
      </LessonSection>

      <LessonSection id="lesson-7-interview" eyebrow="12 · 面试表达" title="60 秒讲清一个现代 Transformer Block">
        <InterviewAnswer question="请深入解释 Transformer Block 中各组件的职责。">
          对 Decoder-only LLM，一个常见 Pre-Norm Block 会先对 Residual Stream 做 RMSNorm，再计算带 RoPE 和 Causal Mask 的 Self-Attention，把结果作为增量加回；然后再次 Norm，经过 SwiGLU FFN，再做一次残差相加。Attention 中 Q、K 决定不同位置怎样匹配，Softmax 权重对 V 做加权汇总，因此它负责跨 Token 通信；FFN 对每个位置独立做非线性特征加工。RoPE 旋转 Q、K，让点积自然包含相对位置；Causal Mask 只负责禁止读取未来。Residual 提供信息和梯度的主通道，RMSNorm 控制数值尺度，使很多层能够稳定堆叠。工程上，FFN 往往占较多参数，而 Attention 的位置交互会随序列变长迅速变贵；GQA 通过共享较少的 K/V Heads 降低 KV Cache。
        </InterviewAnswer>
      </LessonSection>

      <LessonSection id="lesson-7-mistakes" eyebrow="13 · 避坑" title="十个容易混淆的判断">
        <div className="space-y-3">
          {[
            ['Causal Mask 就是位置编码', 'Mask 规定可见性；RoPE 等位置机制表达位置与距离。'],
            ['RoPE 直接加到 Token Embedding 上', 'RoPE 通常旋转 Attention 的 Q、K。'],
            ['Attention 输出就是复制权重最高的 Token', '输出是所有可见 V 的加权和。'],
            ['FFN 负责不同 Token 之间通信', '常规 FFN 逐位置计算，跨位置通信主要由 Attention 完成。'],
            ['RMSNorm 与 LayerNorm 完全一样', 'RMSNorm 通常不减均值，归一化形式不同。'],
            ['Residual 只是防止数值变小', '它提供信息与梯度的近似恒等通道。'],
            ['Pre-Norm 表示每层之后没有 Norm', '它把 Norm 放在子层之前，模型通常仍有 Final Norm。'],
            ['更多层必然每层学固定更高级概念', '抽象表示可能逐步形成，但没有固定层职责表。'],
            ['改大 max_position 就获得可靠 128k', '位置缩放、训练数据、实现与专项评测都要匹配。'],
            ['Attention 权重就是模型完整解释', '它只是多层、多头计算中的一项中间信号。'],
          ].map(([wrong, right]) => <div key={wrong} className="flex gap-3 rounded-xl border bg-card p-4"><CircleAlert className="mt-1 size-4 shrink-0 text-destructive" /><div><p className="font-medium text-foreground line-through decoration-destructive/60">{wrong}</p><p>{right}</p></div></div>)}
        </div>
      </LessonSection>

      <LessonSection id="lesson-7-quiz" eyebrow="14 · 主动回忆" title="闭卷检查 Transformer 第二遍">
        <QuizList questions={[
          { question: '用一句话概括 Attention 与 FFN 的分工。', answer: 'Attention 负责跨 Token 路由和聚合信息；FFN 使用共享参数对每个位置的表示做非线性加工。' },
          { question: 'Residual Stream 的心智模型是什么？', answer: '它是贯穿所有层的主信息通道；Attention 与 FFN 不断计算增量并加回，而不是每层从零重写表示。' },
          { question: 'RoPE 为什么能表达相对位置？', answer: '位置 m、n 分别旋转 Q、K，二者点积可写成依赖 R_{n-m} 的形式，因此分数自然包含相对距离。' },
          { question: 'Causal Mask 与 RoPE 各解决什么问题？', answer: 'Causal Mask 禁止读取未来；RoPE 为 Q/K 匹配提供位置和相对距离信息。' },
          { question: 'LayerNorm 与 RMSNorm 的主要差别是什么？', answer: 'LayerNorm 通常减均值并按方差缩放；RMSNorm 不减均值，按均方根缩放，形式更简洁。' },
          { question: 'SwiGLU 的 Gate、Up、Down 分别做什么？', answer: 'Up 扩展特征维度，Gate 通过可学习门控调节特征，Down 把结果投回隐藏维度。' },
          { question: 'GQA 为什么能减少 KV Cache？', answer: '多个 Query Heads 分组共享更少的 K/V Heads，历史 Token 需要缓存的 K/V 数量因此下降。' },
          { question: '为什么支持更长输入不等于长上下文能力更强？', answer: '接受长度只是硬上限；位置外推、长距离召回、抗干扰和推理还依赖训练、位置缩放、数据与实现，需要专项评测。' },
        ]} />
      </LessonSection>

      <div className="flex flex-wrap justify-between gap-3 border-t pt-6">
        <Button variant="outline" size="lg" onClick={onPrevious}><ArrowLeft data-icon="inline-start" />返回 Lesson 06</Button>
        <Button size="lg" onClick={onNext}>下一课：训练成本与并行<ArrowRight data-icon="inline-end" /></Button>
      </div>
    </article>
  );
}
