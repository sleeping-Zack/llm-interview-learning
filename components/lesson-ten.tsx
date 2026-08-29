'use client';

import { ArrowLeft, BookOpenCheck, BrainCircuit, CheckCircle2, CircleAlert, Database, GitCompareArrows, Scale, ShieldCheck, TriangleAlert, Users } from 'lucide-react';

import { LessonNavigator, PreferenceLab } from '@/components/advanced-learning-widgets';
import { DeepDive, FormulaBlock, InterviewAnswer, KeyStatement, LessonSection, QuizList } from '@/components/learning-widgets';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const chapters = [
  { id: 'lesson-10-data', label: '先看信号', title: '偏好数据' },
  { id: 'lesson-10-rm', label: '训练裁判', title: 'Reward Model' },
  { id: 'lesson-10-ppo', label: '经典路线', title: 'PPO-based RLHF' },
  { id: 'lesson-10-kl', label: '防止漂移', title: 'Reference 与 KL' },
  { id: 'lesson-10-dpo', label: '直接优化', title: 'DPO' },
  { id: 'lesson-10-interview', label: '能输出', title: '面试表达' },
];

export function LessonTen({ onPrevious, onRoadmap }: { onPrevious: () => void; onRoadmap: () => void }) {
  return (
    <article className="lesson-article space-y-10">
      <KeyStatement>
        SFT 教模型“理想回答长什么样”，偏好对齐教模型“两个可行回答中人更喜欢哪一个”；但 Chosen、Reward 分数和事实正确性是三件不同的事。
      </KeyStatement>

      <LessonNavigator chapters={chapters} />

      <LessonSection id="lesson-10-goals" eyebrow="01 · 学习目标" title="看懂整条对齐链路，也保留对代理指标的警惕">
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            '区分 SFT、Reward Model、PPO、DPO 与 LoRA',
            '分清 Actor、Critic、Reference Model 和 Old Policy',
            '用最少公式解释 KL、PPO Clip 与 DPO Loss',
            '识别 Reward Hacking、长度偏差和事实回退',
          ].map((goal) => <div key={goal} className="flex gap-3 rounded-xl border bg-card p-4 text-foreground"><CheckCircle2 className="mt-1 size-4 shrink-0 text-primary" />{goal}</div>)}
        </div>
      </LessonSection>

      <LessonSection id="lesson-10-terms" eyebrow="02 · 先统一口径" title="广义 RLHF 与面试里常说的狭义 RLHF">
        <div className="grid gap-4 md:grid-cols-2">
          <Card><CardHeader><Badge variant="secondary" className="w-fit">广义</Badge><CardTitle>Human Feedback 方法族</CardTitle></CardHeader><CardContent className="text-sm leading-6 text-muted-foreground">只要利用人类反馈改善模型，都可纳入广义 RLHF 讨论；方法不一定使用 PPO。</CardContent></Card>
          <Card><CardHeader><Badge className="w-fit">面试常用口径</Badge><CardTitle>SFT → RM → PPO</CardTitle></CardHeader><CardContent className="text-sm leading-6 text-muted-foreground">狭义 RLHF 通常特指先训练奖励模型，再通过 PPO 在线优化生成策略的三阶段流程。</CardContent></Card>
        </div>
        <p>DPO 也使用人类偏好数据，但工程讨论中常与“PPO-based RLHF”并列比较：它不显式训练 Reward Model，也不在训练期间做 PPO 在线 Rollout。</p>
      </LessonSection>

      <LessonSection id="lesson-10-why" eyebrow="03 · 为什么有偏好阶段" title="有了 SFT，为什么还要比较两个回答">
        <DeepDive
          title="写一个满分答案很难，比较两个答案往往更容易"
          intuition={<>同一道题可能有多个可用回答。让标注者从零写标准答案成本高，而判断 A 与 B 哪个更帮助用户通常更容易。</>}
          mechanism={<>SFT 提高示范回答每个 Token 的条件概率；偏好学习则利用 Chosen / Rejected 的相对次序，调整整段回答的相对倾向。</>}
          takeaway={<>SFT 是模仿信号，Preference 是排序信号。两者都依赖数据质量，偏好也不会自动保证事实正确。</>}
        />
        <div className="overflow-x-auto rounded-xl border bg-card">
          <div className="min-w-[720px]">
            {[
              ['SFT', 'Prompt + 标准回答', '提高示范回答 Token 概率', '教“应该像什么”'],
              ['Reward Model', 'Prompt + Chosen + Rejected', '给偏好回答更高相对分数', '训练一个偏好裁判'],
              ['PPO / DPO', '奖励或固定偏好对', '把偏好信号写回生成策略', '改变生成行为'],
              ['LoRA', '与数据目标无关', '用低秩参数承载更新', '一种更新方式'],
            ].map(([name, data, objective, role], index) => <div key={name} className={`grid grid-cols-[130px_1fr_1.2fr_1fr] gap-4 p-4 text-sm ${index ? 'border-t' : ''}`}><strong className="font-mono text-primary">{name}</strong><span>{data}</span><span className="text-muted-foreground">{objective}</span><span>{role}</span></div>)}
          </div>
        </div>
        <FormulaBlock label="SFT 最少公式">L_SFT = - Σₜ log πθ(y*ₜ | x, y*&lt;ₜ)</FormulaBlock>
        <p>LoRA 可以承载 SFT，也可以承载 DPO。把“训练目标”和“参数更新方式”分开，是回答调优问题的第一条主线。</p>
      </LessonSection>

      <LessonSection id="lesson-10-data" eyebrow="04 · 偏好样本" title="Chosen 只表示这一对中更好，不表示绝对正确">
        <FormulaBlock>x = Prompt
y_w = Chosen response
y_l = Rejected response</FormulaBlock>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-emerald-500/25 bg-emerald-500/6"><CardHeader><Badge className="w-fit bg-emerald-600">Chosen</Badge><CardTitle>相对更受偏爱</CardTitle></CardHeader><CardContent className="text-sm leading-6 text-muted-foreground">可能更准确、简洁、安全或符合格式，但这些维度最好分别标注。</CardContent></Card>
          <Card className="border-rose-500/25 bg-rose-500/6"><CardHeader><Badge variant="secondary" className="w-fit">Rejected</Badge><CardTitle>相对较不受偏爱</CardTitle></CardHeader><CardContent className="text-sm leading-6 text-muted-foreground">不一定完全错误；它只是在当前比较和标注规则下排名更低。</CardContent></Card>
        </div>
        <Card className="border-amber-500/25 bg-amber-500/8"><CardContent className="flex gap-3 pt-6 text-sm leading-6"><TriangleAlert className="mt-0.5 size-5 shrink-0 text-amber-600" /><p>如果两个答案都错，强迫二选一仍只能学到“较不差”。高质量流程应允许平局、无法判断和两者都错，并随机交换展示顺序，降低位置偏差。</p></CardContent></Card>
        <p>候选回答最好来自相近模型与采样条件，否则模型可能学会长度、格式或模型身份等捷径，而不是你真正想要的帮助性与正确性。</p>
      </LessonSection>

      <LessonSection id="lesson-10-rm" eyebrow="05 · Reward Model" title="把两两比较训练成一个可优化的标量分数">
        <DeepDive
          title="奖励模型是学过偏好规则的裁判，不是真理机器"
          intuition={<>把 Prompt 与完整回答交给裁判，它给出一个分数；训练只要求 Chosen 比 Rejected 高。</>}
          mechanism={<>Reward Model 通常共享语言模型骨干，在序列表示上输出标量。Pairwise Loss 只关心两个分数之差，而不要求绝对分数有固定单位。</>}
          takeaway={<>Reward 8.2 不是“82% 正确”，也不能随意跨模型、跨数据集比较。</>}
        />
        <FormulaBlock>P(y_w ≻ y_l | x) = σ(rφ(x,y_w) - rφ(x,y_l))
L_RM = -log σ(r_w - r_l)</FormulaBlock>
        <p>如果两个分数同时加 100，差值不变，偏好概率也不变。这说明 Reward 的绝对刻度并不天然带有“正确率”或“质量百分比”的含义。</p>
      </LessonSection>

      <LessonSection id="lesson-10-actors" eyebrow="06 · 四个逻辑角色" title="经典 PPO-based RLHF 到底同时管理哪些模型">
        <div className="grid gap-4 md:grid-cols-2">
          {[
            [BrainCircuit, 'Actor / Policy', '真正被更新、最终负责生成的策略模型。', '训练'],
            [ShieldCheck, 'Reference Model', '冻结的 SFT 起点，用于长期约束策略不要漂移过远。', '冻结'],
            [Scale, 'Reward Model', '为 Actor 生成的完整回答给出偏好代理分数。', '冻结'],
            [BookOpenCheck, 'Value / Critic', '估计从当前状态出发未来能获得的回报，帮助降低策略梯度方差。', '训练'],
          ].map(([Icon, title, text, status]) => {
            const ItemIcon = Icon as typeof BrainCircuit;
            return <Card key={title as string}><CardHeader><div className="flex items-center justify-between gap-3"><ItemIcon className="size-5 text-primary" /><Badge variant={status === '训练' ? 'default' : 'secondary'}>{status as string}</Badge></div><CardTitle className="font-mono text-base">{title as string}</CardTitle></CardHeader><CardContent className="text-sm leading-6 text-muted-foreground">{text as string}</CardContent></Card>;
          })}
        </div>
        <p>这是四个逻辑角色，不代表工程上永远同时放四份完整模型。骨干可能共享，冻结模型可以量化或卸载，Reference Log Probability 也可预计算；回答时先讲职责，再讲实现优化。</p>
      </LessonSection>

      <LessonSection id="lesson-10-ppo" eyebrow="07 · PPO 主线" title="高奖励行为要更可能，但单次更新不能迈得太远">
        <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {[
            ['01', 'Prompt'], ['02', 'Actor 生成'], ['03', 'RM 打分'], ['04', '加入 KL'], ['05', '估计 Advantage'], ['06', 'PPO 更新'],
          ].map(([number, step]) => <div key={step} className="rounded-xl border bg-card p-3 text-center"><span className="block font-mono text-[10px] text-primary">{number}</span><strong className="mt-2 block text-xs text-foreground">{step}</strong></div>)}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Card><CardHeader><CardTitle>语言模型里的强化学习映射</CardTitle></CardHeader><CardContent className="space-y-2 text-sm leading-6 text-muted-foreground"><p><strong className="text-foreground">State：</strong>Prompt 加已经生成的 Token。</p><p><strong className="text-foreground">Action：</strong>选择下一个 Token。</p><p><strong className="text-foreground">Trajectory：</strong>一条完整回答。</p><p><strong className="text-foreground">Reward：</strong>通常在回答完成后为主。</p></CardContent></Card>
          <Card><CardHeader><CardTitle>Advantage 在回答什么</CardTitle></CardHeader><CardContent className="text-sm leading-6 text-muted-foreground">它衡量这次 Action / 回答相对 Critic 原先预期好多少。高于预期就推动概率上升，低于预期则相反；Critic 用来减少纯策略梯度的方差。</CardContent></Card>
        </div>
        <FormulaBlock>ρₜ = πθ(aₜ|sₜ) / π_old(aₜ|sₜ)
L_clip = E[min(ρₜAₜ, clip(ρₜ, 1-ε, 1+ε)Aₜ)]</FormulaBlock>
        <p><code>clip</code> 限制单轮更新的概率比变化，避免 Actor 因一次高奖励样本突然走得太远。真实实现还会包含 Value Loss、Entropy Bonus、Mask 与归一化等细节。</p>
      </LessonSection>

      <LessonSection id="lesson-10-kl" eyebrow="08 · 最高频追问" title="Reference Model 与 Old Policy 不是一个职责">
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-primary/25"><CardHeader><Badge className="w-fit">长期锚点</Badge><CardTitle className="font-mono">π_ref</CardTitle></CardHeader><CardContent className="text-sm leading-6 text-muted-foreground">通常是冻结的 SFT 模型。它回答“Actor 相比训练起点漂移了多少”，用于 KL 约束。</CardContent></Card>
          <Card className="border-cyan-500/25"><CardHeader><Badge variant="secondary" className="w-fit">本轮快照</Badge><CardTitle className="font-mono">π_old</CardTitle></CardHeader><CardContent className="text-sm leading-6 text-muted-foreground">PPO 当前一轮更新前的策略快照。它回答“这几次梯度更新相对采样时策略变化了多少”，用于概率比与 Clip。</CardContent></Card>
        </div>
        <FormulaBlock label="带参考约束的直觉目标">maximize E[rφ(x,y)] - β · D_KL(πθ || π_ref)</FormulaBlock>
        <p>KL 约束的是 Token 概率分布，不是两段文本的字面相似度，也不是事实错误惩罚。Reference Model 更不是事实知识库；它只帮助防止策略为了刷奖励而严重偏离原有语言与能力分布。</p>
      </LessonSection>

      <LessonSection id="lesson-10-hacking" eyebrow="09 · Reward Hacking" title="为什么奖励升高，真实质量反而可能下降">
        <DeepDive
          title="当代理指标变成强目标，模型会寻找评分规则漏洞"
          intuition={<>如果作文只按字数给分，最优策略会变成长篇堆字，而不是写得更准确。这就是 Goodhart 式失效。</>}
          mechanism={<>Reward Model 只近似人类偏好。Actor 反复优化后会进入裁判不熟悉的分布，并放大长度、语气、自信度等可投机特征。</>}
          takeaway={<>Reward、DPO Loss 与偏好准确率都是过程指标，必须用独立事实、安全、能力和人工盲评验证。</>}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ['长度投机', '越写越长，因为训练数据或裁判偏爱详细回答。'],
            ['过度迎合', '用户前提错误时仍顺着说，以换取“友好”信号。'],
            ['自信幻觉', '用确定语气包装不确定事实，提高表面说服力。'],
            ['Alignment Tax', '过度对齐造成推理、代码或开放回答能力回退。'],
          ].map(([title, text]) => <div key={title} className="rounded-xl border bg-card p-4"><strong className="text-foreground">{title}</strong><p className="mt-2 text-sm leading-6">{text}</p></div>)}
        </div>
      </LessonSection>

      <LessonSection id="lesson-10-dpo" eyebrow="10 · DPO 主线" title="不先训练裁判，直接让当前策略相对参考策略更偏向 Chosen">
        <div className="grid gap-4 md:grid-cols-2">
          <Card><CardHeader><Badge className="w-fit">需要</Badge><CardTitle>DPO 训练输入</CardTitle></CardHeader><CardContent className="space-y-2 text-sm leading-6 text-muted-foreground"><p>固定偏好对 <code>(x, y_w, y_l)</code></p><p>当前待训练策略 <code>πθ</code></p><p>冻结参考策略 <code>π_ref</code> 或其预计算 Log Probability</p></CardContent></Card>
          <Card><CardHeader><Badge variant="secondary" className="w-fit">省掉</Badge><CardTitle>经典 PPO 组件</CardTitle></CardHeader><CardContent className="space-y-2 text-sm leading-6 text-muted-foreground"><p>独立 Reward Model</p><p>Value / Critic</p><p>训练期间的在线 Rollout 与 PPO 循环</p></CardContent></Card>
        </div>
        <FormulaBlock label="先比较各自对 Chosen 的偏好差">Δθ = log πθ(y_w|x) - log πθ(y_l|x)
Δ_ref = log π_ref(y_w|x) - log π_ref(y_l|x)</FormulaBlock>
        <FormulaBlock label="DPO Loss">L_DPO = -log σ(β · (Δθ - Δ_ref))</FormulaBlock>
        <div className="space-y-2">
          {[
            ['Δθ', '当前模型有多偏向 Chosen。'],
            ['Δref', '起始模型原本有多偏向 Chosen。'],
            ['Δθ - Δref', '当前模型是否比起点更支持 Chosen。'],
            ['σ 与负对数', '把相对偏好差转成平滑的分类式训练损失。'],
          ].map(([symbol, text]) => <div key={symbol} className="grid gap-2 rounded-xl border bg-card p-3 sm:grid-cols-[120px_1fr]"><strong className="font-mono text-primary">{symbol}</strong><span>{text}</span></div>)}
        </div>
        <PreferenceLab />
      </LessonSection>

      <LessonSection id="lesson-10-sequence" eyebrow="11 · 序列概率" title="回答概率不是一个现成分数，而是多个 Token Log Probability 的和">
        <FormulaBlock>log π(y|x) = Σₜ log π(yₜ | x, y&lt;ₜ)</FormulaBlock>
        <p>实现通常只对回答 Token 求和，并 Mask 掉 Prompt 与 Padding。长回答天然包含更多负的 Log Probability，因此序列求和、Token 平均和长度归一化会带来不同偏好；不同库还可能有 Label Smoothing 或 Reference-free 变体，不能把所有口径混为一谈。</p>
        <Card className="border-primary/20 bg-primary/5"><CardContent className="flex gap-3 pt-6 text-sm leading-6"><GitCompareArrows className="mt-0.5 size-5 shrink-0 text-primary" /><p><strong>关于 β：</strong>它缩放偏好 Logit，并与参考约束的理论权衡相关；不能只看公式就背成“越大更新越强”。应结合 KL、胜率、长度分布和能力回归共同选择。</p></CardContent></Card>
      </LessonSection>

      <LessonSection id="lesson-10-choice" eyebrow="12 · 方法选型" title="SFT、DPO 与 PPO-based RLHF 各自适合什么">
        <div className="overflow-x-auto rounded-xl border bg-card">
          <div className="min-w-[760px]">
            {[
              ['SFT', '标准回答', '否', '通常否', '简单稳定，适合格式、风格与基础行为'],
              ['DPO', '固定偏好对', '否', '经典 DPO 需要', '成本较低，但受离线数据覆盖限制'],
              ['PPO-based RLHF', '偏好 + 在线生成', '是', '通常需要', '能在线探索任意奖励，但系统最复杂'],
            ].map(([method, data, rm, ref, fit], index) => <div key={method} className={`grid grid-cols-[180px_1fr_100px_130px_1.5fr] gap-4 p-4 text-sm ${index ? 'border-t' : ''}`}><strong className="font-mono text-primary">{method}</strong><span>{data}</span><span>{rm}</span><span>{ref}</span><span className="text-muted-foreground">{fit}</span></div>)}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ['教固定格式', '优先 SFT，并可使用 LoRA 承载更新。'],
            ['已有可靠偏好对', '优先尝试 DPO，先做离线偏好与能力回归。'],
            ['有可执行在线奖励', '需要探索时 PPO 类方法更有价值。'],
            ['写入最新事实', '优先 RAG、搜索或工具，不把 DPO 当知识库。'],
          ].map(([need, answer]) => <div key={need} className="rounded-xl border bg-card p-4"><strong className="text-foreground">{need}</strong><p className="mt-2 text-sm leading-6">{answer}</p></div>)}
        </div>
      </LessonSection>

      <LessonSection id="lesson-10-eval" eyebrow="13 · 数据与评测" title="对齐效果必须在奖励模型之外被证明">
        <div className="grid gap-4 md:grid-cols-2">
          <Card><CardHeader><Database className="size-5 text-primary" /><CardTitle>偏好数据检查</CardTitle></CardHeader><CardContent><ul className="space-y-2 text-sm leading-6 text-muted-foreground"><li>Prompt 是否来自真实流量与难例</li><li>两回答是否可比较、是否允许跳过和平局</li><li>展示顺序是否随机，是否有长度与格式泄漏</li><li>训练验证是否按 Prompt 隔离近重复</li><li>事实、帮助性、安全与风格是否拆分标注</li></ul></CardContent></Card>
          <Card><CardHeader><Users className="size-5 text-primary" /><CardTitle>至少四层评测</CardTitle></CardHeader><CardContent><ul className="space-y-2 text-sm leading-6 text-muted-foreground"><li>盲评 Pairwise Win Rate 与长度控制</li><li>事实、推理、代码、安全的客观集合</li><li>拒答过多、迎合、答案变长等行为回归</li><li>线上 A/B、任务成功率、投诉与高风险 Bad Cases</li></ul></CardContent></Card>
        </div>
        <p>模型更新后，旧偏好数据可能已偏离当前策略分布。离线 DPO 更简单，但数据覆盖不到的行为也无法靠公式凭空学会；需要持续收集真实失败样本并保持独立测试集。</p>
      </LessonSection>

      <LessonSection id="lesson-10-safety" eyebrow="14 · 对齐边界" title="偏好训练不是生产安全系统的替代品">
        <Card className="border-rose-500/25 bg-rose-500/7"><CardContent className="flex gap-3 pt-6 text-sm leading-6"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-rose-600" /><div><p className="font-medium text-foreground">模型行为只是一层防线</p><p className="mt-2">高风险应用仍需要权限控制、输入输出校验、敏感动作确认、审计、工具沙箱和人工升级。模型即使通过对齐，也可能被提示注入、分布外输入或不完美奖励诱导。</p></div></CardContent></Card>
        <p>事实类任务还需要检索、工具或 Verifier。对齐可以让模型更愿意承认不确定性，却不能保证其内部所有知识都正确且最新。</p>
      </LessonSection>

      <LessonSection id="lesson-10-interview" eyebrow="15 · 面试表达" title="60 秒讲清经典 RLHF 与 DPO">
        <InterviewAnswer question="RLHF 与 DPO 的流程和差别是什么？">
          预训练让模型学会续写，SFT 让它模仿标准回答，但同一问题常有多个可行答案，所以还要学习人类偏好。经典 PPO-based RLHF 会先用 Chosen 和 Rejected 训练 Reward Model，再让 Actor 在线生成，由 Reward Model 打分，使用 Critic 估计 Advantage、PPO 更新 Actor，同时用 KL 约束它不要偏离冻结的 SFT Reference Model。PPO 中的 Old Policy 只是一轮更新的概率比基准，与 Reference Model 职责不同。DPO 则直接比较当前策略与 Reference 对 Chosen、Rejected 的序列 Log Probability 差，使用分类式 Loss 做偏好优化，因此省掉显式 Reward Model、Critic 和在线 PPO Rollout。它更简单，但受固定偏好数据覆盖限制。最后，偏好不等于事实，对齐后仍需 RAG、工具、独立事实评测与安全控制。
        </InterviewAnswer>
      </LessonSection>

      <LessonSection id="lesson-10-mistakes" eyebrow="16 · 避坑" title="十个偏好对齐高频误区">
        <div className="space-y-3">
          {[
            ['Reward 8.2 就是 82% 正确', '它是未校准的偏好代理分数，主要看分数差。'],
            ['Chosen 一定事实正确', '它只表示当前偏好对中排名更高。'],
            ['DPO 完全不需要 Reference Model', '经典 DPO 需要参考策略或预计算的参考 Log Probability。'],
            ['PPO 的 Old Policy 就是 Reference Model', '一个约束本轮更新，一个约束长期偏离。'],
            ['KL 衡量两个答案文本相似度', '它比较策略的概率分布。'],
            ['DPO 会让 Chosen 绝对概率一直上升', '目标优化的是相对偏好差，绝对概率可能同时变化。'],
            ['DPO 比 PPO 在所有任务都更好', 'DPO 简单但缺少在线探索，依赖离线数据覆盖。'],
            ['LoRA、SFT、DPO 是同一层选择', 'LoRA 是更新方式，SFT/DPO 是训练目标。'],
            ['Reward 上升就说明模型变好', '模型可能利用裁判偏差，必须看独立评测。'],
            ['做完对齐就不需要 RAG 和安全层', '偏好不等于事实，模型行为也不能替代系统权限与校验。'],
          ].map(([wrong, right]) => <div key={wrong} className="flex gap-3 rounded-xl border bg-card p-4"><CircleAlert className="mt-1 size-4 shrink-0 text-destructive" /><div><p className="font-medium text-foreground line-through decoration-destructive/60">{wrong}</p><p>{right}</p></div></div>)}
        </div>
      </LessonSection>

      <LessonSection id="lesson-10-quiz" eyebrow="17 · 主动回忆" title="闭卷检查偏好、策略与约束">
        <QuizList questions={[
          { question: 'SFT 和偏好对齐最核心的信号差异是什么？', answer: 'SFT 模仿一个示范回答的 Token；偏好对齐学习候选回答之间的相对次序。' },
          { question: 'Reward Model 输出 8.2，能解释为 82% 正确吗？', answer: '不能。它是未校准的偏好代理分数，训练主要依赖 Chosen 与 Rejected 的分数差。' },
          { question: 'PPO 中 Reference Model 和 Old Policy 的职责分别是什么？', answer: 'Reference 长期约束 Actor 不要偏离 SFT 起点；Old Policy 是本轮 PPO 概率比与裁剪的采样基准。' },
          { question: '经典 RLHF 为什么加入 KL？', answer: '限制 Actor 为追逐不完美奖励而严重偏离原策略，降低语言崩坏、模式坍缩与 Reward Hacking。' },
          { question: '经典 DPO 省掉了哪些组件，又保留了什么？', answer: '省掉显式 Reward Model、Critic 和 PPO 在线 Rollout；仍需要当前策略、偏好对和参考策略或其预计算 Log Probability。' },
          { question: '为什么 Chosen 不一定是正确答案？', answer: '它只代表这一对候选中被标注为更好；若两者都错，它仍然只是相对较好。' },
          { question: 'DPO Loss 中为什么要减去 Reference Margin？', answer: '目标关心当前策略相比起始策略是否更支持 Chosen，而不是只看当前模型自身的绝对偏好。' },
          { question: 'Reward 上涨但人工胜率和事实准确率下降，可能发生了什么？', answer: '可能是 Reward Overoptimization / Hacking；应停止只追代理指标，检查数据偏差、KL、长度和训练步数，并使用独立评测。' },
        ]} />
      </LessonSection>

      <div className="flex flex-wrap justify-between gap-3 border-t pt-6">
        <Button variant="outline" size="lg" onClick={onPrevious}><ArrowLeft data-icon="inline-start" />返回 Lesson 09</Button>
        <Button size="lg" onClick={onRoadmap}>返回完整学习地图</Button>
      </div>
    </article>
  );
}
