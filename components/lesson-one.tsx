'use client';

import { ArrowRight, CheckCircle2, CircleAlert, Lightbulb } from 'lucide-react';

import {
  DeepDive,
  FormulaBlock,
  InterviewAnswer,
  KeyStatement,
  LessonSection,
  NextTokenDemo,
  QuizList,
} from '@/components/learning-widgets';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const terms = [
  ['Token', '模型读写文本时使用的小片段，不一定等于一个字或一个单词。'],
  ['Context', '本次计算可见的系统指令、问题、历史消息、工具信息与已生成内容。'],
  ['Parameters', '训练学到的大量数字，决定模型如何把输入映射为输出概率。'],
  ['Logits', '模型对词表中每个候选 Token 给出的未归一化分数。'],
  ['Softmax', '把 Logits 转成总和为 1 的概率分布。'],
  ['Decoding', '根据概率分布决定实际输出哪个 Token 的策略。'],
  ['Autoregressive', '把刚生成的 Token 追加回上下文，然后继续预测。'],
];

export function LessonOne({ onNext }: { onNext: () => void }) {
  return (
    <article className="lesson-article space-y-10">
      <KeyStatement>
        LLM 是一个参数化的概率模型：它根据当前可见上下文预测下一个 Token，把结果追加回上下文，再重复这个过程。
      </KeyStatement>

      <LessonSection id="lesson-1-goals" eyebrow="01 · 建立直觉" title="这一课真正要掌握什么">
        <p>学完后，不只是会背“下一个 Token 预测”，还要能把这句话展开成一条完整因果链：</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            '能解释 LLM 如何逐 Token 生成整段回答',
            '能区分训练、推理和普通对话中的状态变化',
            '能说明 Logits、Softmax、Temperature 的关系',
            '能解释为什么语言流畅不等于事实正确',
          ].map((goal) => (
            <div key={goal} className="flex gap-3 rounded-xl border bg-card p-4 text-foreground">
              <CheckCircle2 className="mt-1 size-4 shrink-0 text-primary" />
              <span>{goal}</span>
            </div>
          ))}
        </div>
      </LessonSection>

      <LessonSection id="lesson-1-emergence" eyebrow="加深 A · 目标与能力" title="只做“文字接龙”，为什么还能写代码和推理">
        <DeepDive
          title="训练目标简单，不代表内部计算简单"
          intuition={<>如果让一个人做海量“补全后半句”，为了补准技术文档、小说和代码，他迟早要学会语法、概念关系、指代和常见推理模式。</>}
          mechanism={<>模型始终优化 <code>P(x_t | x_&#123;&lt;t&#125;)</code>。但要让不同场景里的真实后续获得高概率，它必须在隐藏状态中形成能复用的内部表示和计算方式。</>}
          takeaway={<>“下一个 Token”描述的是<strong className="text-foreground">训练目标</strong>，不是对模型能力上限的评价；能形成推理模式，也不保证每次都推对。</>}
        />
        <p>
          一步预测是局部任务，连续很多步就能组成解释、翻译或程序。就像 CPU 的单条指令很简单，许多指令组合后却能运行复杂软件。这里不需要把模型神化，也不能把它贬成只会背固定句子的输入法。
        </p>
      </LessonSection>

      <LessonSection id="lesson-1-intuition" eyebrow="02 · 超级输入法" title="先用一个准确的类比理解">
        <p>
          普通输入法看到“今天天气很”，可能推荐“好、冷、热”。LLM 在形式上也做续写，但它使用更长的上下文、规模更大的参数，并为整个词表中的候选 Token 计算分数。
        </p>
        <div className="grid gap-3 sm:grid-cols-4">
          {['读取全部上下文', '计算候选分数', '按策略选 Token', '追加后继续预测'].map((step, index) => (
            <div key={step} className="rounded-xl bg-muted p-4 text-center text-foreground">
              <span className="mb-2 block font-mono text-xs text-primary">0{index + 1}</span>
              <span className="text-sm font-medium">{step}</span>
            </div>
          ))}
        </div>
        <Card className="border-amber-500/25 bg-amber-500/8">
          <CardContent className="flex gap-3 pt-6 text-sm leading-6 text-foreground">
            <Lightbulb className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <p>
              “Next”指的是要预测的位置，不是“只看紧挨着的前一个 Token”。Transformer 会利用该位置之前所有允许看到的上下文。
            </p>
          </CardContent>
        </Card>
      </LessonSection>

      <LessonSection id="lesson-1-terms" eyebrow="03 · 必要术语" title="七个词先钉牢">
        <div className="overflow-hidden rounded-xl border bg-card">
          {terms.map(([term, meaning], index) => (
            <div
              key={term}
              className={`grid gap-1 px-4 py-3.5 sm:grid-cols-[120px_1fr] ${index ? 'border-t' : ''}`}
            >
              <code className="font-mono text-sm font-semibold text-primary">{term}</code>
              <span>{meaning}</span>
            </div>
          ))}
        </div>
      </LessonSection>

      <LessonSection id="lesson-1-demo" eyebrow="04 · 动手观察" title="一次回答是怎样长出来的">
        <p>
          下面每点击一次，只生成一个 Token。真实模型每轮都会重新利用当前上下文计算词表分布；页面中的数字只用于演示机制。
        </p>
        <NextTokenDemo />
      </LessonSection>

      <LessonSection id="lesson-1-math" eyebrow="05 · 必要公式" title="从一句话走到数学表达">
        <p>对第 <code>t</code> 个位置，模型估计的是在前文条件下各候选 Token 的概率：</p>
        <FormulaBlock label="条件概率">P(x_t | x_1, x_2, ..., x_&#123;t-1&#125;)</FormulaBlock>
        <p>整段文本的概率可以用概率链式法则写成每一步条件概率的乘积：</p>
        <FormulaBlock label="自回归分解">P(x_1, ..., x_T) = ∏&#123;t=1...T&#125; P(x_t | x_&#123;&lt;t&#125;)</FormulaBlock>
        <p>
          模型最后一层先输出 <strong className="text-foreground">Logits</strong>。Softmax 把它们归一化成概率：
        </p>
        <FormulaBlock label="Softmax">p_i = exp(z_i) / Σ_j exp(z_j)</FormulaBlock>
        <p>
          Temperature 会先把 Logits 除以 <code>T</code>。较低的 T 让分布更尖、更确定；较高的 T 让分布更平、更随机。它改变的是选词分布，<strong className="text-foreground">不会给模型增加新知识</strong>。
        </p>
        <FormulaBlock label="Temperature">p_i = softmax(z_i / T)</FormulaBlock>
      </LessonSection>

      <LessonSection id="lesson-1-training" eyebrow="06 · 训练与推理" title="模型怎样学会预测">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Badge variant="secondary" className="w-fit">训练</Badge>
              <CardTitle>给它标准答案并更新参数</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
              <p>训练文本向右错一位，前面的 Token 用来预测后面的真实 Token，这叫 Teacher Forcing。</p>
              <p>模型给真实 Token 的概率越低，Cross Entropy Loss 越大；反向传播据此调整参数。</p>
              <FormulaBlock>Loss = -Σ_t log P(x_t^real | x_&#123;&lt;t&#125;)</FormulaBlock>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Badge variant="secondary" className="w-fit">推理</Badge>
              <CardTitle>固定参数并逐步生成</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
              <p>正常聊天时参数通常不更新。模型只是读取当前上下文，并把新生成内容加入临时上下文。</p>
              <p>训练时整段文本的多个位置可并行算损失；生成时第 t+1 个 Token 依赖第 t 个实际输出，因此天然串行。</p>
            </CardContent>
          </Card>
        </div>
        <p>
          <strong className="text-foreground">Causal Mask（因果掩码）</strong>保证每个位置训练时只能看见自己之前的 Token，不能偷看后面的标准答案。这样训练任务才与实际生成一致。
        </p>
      </LessonSection>

      <LessonSection id="lesson-1-parameters" eyebrow="加深 B · 知识在哪里" title="参数不是数据库：模型到底把什么学进去了">
        <DeepDive
          title="几十亿参数，是几十亿个调节旋钮，不是几十亿条事实"
          intuition={<>参数更像被压缩进大量旋钮的“世界规律”。提问时模型不是定位某个知识单元格，而是让输入经过层层变换，使某些后续 Token 得分更高。</>}
          mechanism={<>训练会更新权重 <code>W</code>；普通推理中 <code>W</code> 固定，变化的是本次请求的隐藏状态与 KV Cache。知识通常分散在许多参数及其组合中。</>}
          takeaway={<>参数量代表可学习的<strong className="text-foreground">容量</strong>，不等于可准确查询的事实条数，更不保证信息最新、可溯源。</>}
        />
        <FormulaBlock label="一层的抽象写法">h⁽ˡ⁺¹⁾ = f(h⁽ˡ⁾; W⁽ˡ⁾)</FormulaBlock>
        <div className="grid gap-3 md:grid-cols-3">
          {[
            ['模型参数', '训练形成的长期能力与倾向', '预训练、SFT、LoRA 等训练才会更新'],
            ['当前上下文', '这次请求的临时工作台', 'Prompt、Few-shot、RAG 资料会改变本次计算'],
            ['外部系统', '可更新、可检索、可追溯的信息源', '数据库、搜索、工具结果不属于模型权重'],
          ].map(([title, role, changes]) => (
            <Card key={title}><CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader><CardContent className="space-y-2 text-sm leading-6 text-muted-foreground"><p>{role}</p><p className="text-foreground">{changes}</p></CardContent></Card>
          ))}
        </div>
      </LessonSection>

      <LessonSection id="lesson-1-ppl" eyebrow="加深 C · 训练指标" title="Cross Entropy 与 Perplexity 到底在衡量什么">
        <p>
          如果真实下一个 Token 是“巴黎”，模型只给它 1% 概率，惩罚会远大于给它 90% 概率。对所有有效位置取平均，就得到语言模型常见的 Cross Entropy。
        </p>
        <FormulaBlock label="平均交叉熵">L = -(1/N) Σ_t log P(x_t | x_&#123;&lt;t&#125;)</FormulaBlock>
        <FormulaBlock label="困惑度">PPL = exp(L)</FormulaBlock>
        <DeepDive
          title="PPL 越低，模型就一定越好吗"
          intuition={<>PPL 可以粗略理解为模型每一步“有多犹豫”。PPL=10 像是在约 10 个同等候选中犹豫，但这只是帮助理解的近似。</>}
          mechanism={<>PPL 是平均交叉熵的指数形式，主要衡量对这类文本的下一 Token 预测能力。Tokenizer 会改变序列切分，因此也会改变数值。</>}
          takeaway={<>只能在<strong className="text-foreground">相同 Tokenizer、相同数据与相同计算口径</strong>下认真比较；低 PPL 不自动等于事实更准、指令跟随更好。</>}
        />
      </LessonSection>

      <LessonSection id="lesson-1-alignment" eyebrow="07 · 能力形成" title="预训练、SFT 与偏好对齐">
        <div className="space-y-3">
          {[
            ['预训练', '在海量文本上学习语言、知识和代码模式，得到会续写的 Base Model。'],
            ['SFT 指令微调', '用“指令—理想回答”数据教模型遵循任务格式、角色和回答风格。'],
            ['偏好对齐', '用人类或模型偏好信号，让回答更有帮助、更安全、更符合期望。'],
          ].map(([title, text], index) => (
            <div key={title} className="grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-[42px_120px_1fr] sm:items-center">
              <span className="grid size-9 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">{index + 1}</span>
              <strong className="text-foreground">{title}</strong>
              <span>{text}</span>
            </div>
          ))}
        </div>
        <p>
          三个阶段改变了模型的参数或行为分布，但在线回答时仍然通过“预测下一个 Token”完成生成。RAG 则不同：它通常不改参数，而是在推理前把检索到的证据放进上下文。
        </p>
      </LessonSection>

      <LessonSection id="lesson-1-hallucination" eyebrow="08 · 工程联系" title="为什么会幻觉，以及应用层怎么补">
        <Card className="border-l-4 border-l-destructive">
          <CardHeader>
            <CardTitle>高概率续写 ≠ 客观事实</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
            <p>模型的训练目标是让真实后续文本具有更高概率，而不是连接数据库逐条核验事实。</p>
            <p>信息缺失、知识过时、问题歧义、采样随机性，以及前一步生成错误，都可能让后续回答看似流畅却不真实。</p>
          </CardContent>
        </Card>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ['RAG', '把可追溯的外部证据放入上下文，降低“凭记忆回答”。'],
            ['Tool Calling', '把计算、查询、写入等确定性动作交给外部系统执行。'],
            ['Verifier / Eval', '检查答案是否有证据、格式是否正确，并用测试集持续评估。'],
          ].map(([title, text]) => (
            <Card key={title}>
              <CardHeader><CardTitle className="font-mono text-base">{title}</CardTitle></CardHeader>
              <CardContent className="text-sm leading-6 text-muted-foreground">{text}</CardContent>
            </Card>
          ))}
        </div>
      </LessonSection>

      <LessonSection id="lesson-1-interview" eyebrow="09 · 面试表达" title="30 秒标准回答">
        <InterviewAnswer question="LLM 是什么？它如何生成一段回答？">
          LLM 通常是基于 Transformer、在大规模文本上训练的概率生成模型。训练时，它根据前文预测真实的下一个 Token，并通过交叉熵损失和反向传播调整参数；推理时参数通常固定，模型根据当前上下文计算下一个 Token 的概率分布，按解码策略选出一个 Token，再追加回上下文循环生成。因此一整段回答本质上是一连串带上下文条件的下一个 Token 预测。它优化的是合理续写而不是真实性验证，所以也可能产生幻觉。
        </InterviewAnswer>
        <Card>
          <CardHeader><CardTitle>追问时再展开这三层</CardTitle></CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            {[
              ['机制层', 'Logits → Softmax → 解码；Causal Mask 保证不能看未来。'],
              ['训练层', 'Teacher Forcing、Cross Entropy、反向传播、参数更新。'],
              ['工程层', 'Temperature 不增加知识；RAG、工具和验证器负责可靠性补强。'],
            ].map(([title, text]) => (
              <div key={title} className="rounded-xl bg-muted p-4 text-sm leading-6">
                <strong className="mb-1 block text-foreground">{title}</strong>
                <span>{text}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </LessonSection>

      <LessonSection id="lesson-1-mistakes" eyebrow="10 · 避坑" title="六个高频错误说法">
        <div className="space-y-3">
          {[
            ['Next Token 只看前一个 Token', '它利用当前允许看到的全部上下文。'],
            ['Token 就是一个汉字或英文单词', 'Token 也可能是子词、标点、空格或代码符号。'],
            ['模型每次都选概率最高的词', 'Greedy 会；Sampling、Top-p 等策略不一定。'],
            ['概率最高就一定正确', '语言概率和事实真实性是不同目标。'],
            ['每次聊天都会训练模型', '普通推理一般只改变临时上下文，不更新权重。'],
            ['LLM 是大型答案数据库', '知识主要分布在参数模式中，检索数据库属于外部系统。'],
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

      <LessonSection id="lesson-1-quiz" eyebrow="11 · 主动回忆" title="不要看笔记，先回答">
        <QuizList
          questions={[
            { question: '“Next Token Prediction”是否意味着只读取前一个 Token？', answer: '不是。“Next”是预测目标的位置；模型会利用该位置之前允许看到的全部上下文。' },
            { question: '生成“北京”的概率为 80%，之后生成“。”的条件概率为 75%，这条路径的概率是多少？', answer: '80% × 75% = 60%。整段序列概率是每一步条件概率的乘积。' },
            { question: 'Logits、Softmax 和 Temperature 的关系是什么？', answer: 'Logits 是未归一化分数；Softmax 把它们变成概率；Temperature 通过缩放 Logits 改变概率分布的尖锐程度，但不会增加模型知识。' },
            { question: '为什么训练可以并行，而生成通常串行？', answer: '训练时已有完整标准文本，可在因果掩码下同时计算各位置损失；生成时下一个位置依赖上一位置实际采样出的结果。' },
            { question: '普通对话和训练最核心的区别是什么？', answer: '普通推理通常固定模型参数，只改变本次上下文；训练会根据损失反向传播并更新参数。' },
            { question: '为什么流畅回答仍可能是幻觉？', answer: '模型优化的是高概率的合理续写，不是事实核验；上下文不足、知识过时或先前生成错误都可能导致幻觉。' },
            { question: '模型参数、当前上下文和外部数据库的核心区别是什么？', answer: '参数是训练形成的长期权重；上下文是本次请求的临时条件，不会自动改权重；外部数据库可更新、可查询并可提供来源。' },
            { question: '为什么两个模型的 PPL 不能直接随意比较？', answer: 'PPL 受评测数据、Tokenizer 和计算口径影响；它主要衡量下一 Token 预测，不直接等于事实性、指令跟随或综合体验。' },
          ]}
        />
      </LessonSection>

      <div className="flex justify-end border-t pt-6">
        <Button size="lg" onClick={onNext}>
          下一课：Tokenizer、Embedding 与 Context
          <ArrowRight data-icon="inline-end" />
        </Button>
      </div>
    </article>
  );
}
