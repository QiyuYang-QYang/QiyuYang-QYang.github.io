---
title: "The Art of Machine Learning: Approaching the Boundary of Representation"
kind: Essay
pair: representation
date: 2026-11-04
summary: "We can only know what we can sense, and what we sense can only be kept in compressed form. Follow this thread from the human senses all the way to deep learning, and the dazzling vocabulary — data, inductive bias, architecture, model structure, loss function — turns out to be a set of answers to one old question: with limited perception and limited representation, how do we see as much of the world as we can?"
draft: false
---
> A setting is the guess made before seeing; a framework is the guess given concrete form; an image is what the framework allows you to see.


## A note before starting

This essay is a way of putting in order what I learned in a year of studying machine learning, deep learning and generative AI. It is not a tutorial and will not teach you how to build a network. It tries instead to give these techniques a place that comes before technique, so that someone who has not walked the same technical path can still understand why machine learning looks the way it does.

The route is a little roundabout. The first half sets machine learning aside and talks about something that seems unrelated: how humans come to know the world. Once that is clear, we return to machine learning and find that each of its parts has already appeared, under a different name.

What I want is for machine learning to be recognized again inside a framework that already existed. The aim is to let more people sense what is essential, and what is artful, about machine learning and deep learning, rather than finding it dry and keeping their distance, or getting lost in a sea of terms.

*(My thanks to Dr. Martin Zhang of CMU 02-620 Machine Learning for Scientists, for his depth in statistical learning and his clear teaching; to Prof. Bhiksha Raj of CMU 11-685 Introduction to Deep Learning, for generously sharing the history, theory and technical detail of the field as one connected whole; and to Dr. Matt Gormley and Dr. Aran Nayebi of 10-623 Generative AI, for taking apart the theory and technique behind today's rapidly evolving generative models.)*


## 1. Introduction: able to use it, unable to connect it

### The common situation: technique-centered thinking

Over the past decade or so, machine learning, and deep learning in particular, has produced a startling result every few years: recognizing a cat in a photo, translating a paragraph, predicting how a protein folds, writing a passable essay. It iterates so quickly that a model is often superseded within a few years of being proposed. Its reach runs through every industry, and it draws people from every industry to learn it.

As more people learn it, a common state appears: the engineering can be mastered, but the understanding does not connect. We can get a model to run without being able to say why it was designed that way; we can keep up with the latest trend without seeing whether a longer logic runs underneath. The first problem leaves us with nowhere to start on a new problem. The second leaves us unable to tell which advances are fundamental, which are real breakthroughs, and which are temporary patches or designs without a future.

### Why this happens: the actual obstacles

I see at least three reasons.

**First, concepts are laid out along the technical timeline.** Textbooks cover linear models, then neural networks, then convolution, recurrence, attention and generative models. Each concept is placed where it appeared in history rather than next to the problem it solves. The vocabulary keeps growing, but there is no coordinate system in which to place it.

**Second, the reason for a design is not in its definition.** We know a model consists of some architecture, some loss function, some objective, but not why it is this one and not another. The reason usually lives in a paper's motivation, not in a textbook's definition, and a learner does not have the energy to read through the ocean of papers. Attention is limited (attention, it turns out, really is all you need).

**Third, much of it looks like alchemy.** Learning rates, initialization, normalization and other training and inference techniques are introduced together as hyperparameters. Combined with the trial-and-error practice of real engineering, they come to seem like things found mostly by experiment, and the supposed black-box nature of neural networks reinforces the impression. In a 2017 NeurIPS talk, Ali Rahimi went as far as comparing machine learning to alchemy; the Chinese community's word for it, 炼丹, "brewing elixirs," means the same thing. Is that really so?

### What machine learning should tell us: representation and abstraction, subjective means of knowing an objective world

The view I want to put forward is this: **machine learning is, at bottom, a discipline about perception and cognition.** The fundamental question it answers is not how to fit a pile of data, but how to build a representation of the world.

The claim has roughly three layers.

**Representation and abstraction.** A representation is how we grasp an objective world by subjective means. Every representation carries a choice: what to keep and what to discard.

**Compression and projection.** The properties of the world are high-dimensional, perhaps infinite. A representation is necessarily a compression, a projection of a high-dimensional world into a lower-dimensional space we can handle.

**The computability of the world.** Some things could once only be felt, not stated: what a sentence means, what makes a painting's style, why two smells are alike. Today they have become objects of computation. This does not mean the world itself is computable. It means we have found new representations that bring part of the world within the reach of computation.

Let us set machine learning aside for now and talk about something else: why perception and cognition, concepts that touch everyone, map onto machine learning.


## 2. The nature of human cognition: a lossy, compressed representation of the physical world

### The endless properties of the physical world

The physical world is continuous in time, in space and in its properties. Pick up any object and its measurable properties have no end: size, weight, temperature, color, smell, its place in someone's memory. These properties are tied to one another, forming a web whose edges cannot be seen.

Bergson described reality as a continuous flow, *durée*, and observed that the intellect habitually cuts this flow into static frames and strings them together, pretending that this is motion. He called it the "cinematographic mechanism" of thought. From the start, cognition does not copy the world; it cuts it up and reassembles it.

### The information-theoretic premise: what cannot be sensed cannot be known

Cognition has to pass through information, and information has physical preconditions.

First, **what cannot be sensed cannot be known.** Information must travel through some physical medium — light, sound, chemical molecules, vibration — to reach us. Without a medium there is no information; without information, no cognition.

Second, **information is always lost on the way.** Every medium is subject to noise, attenuation and limited bandwidth.

Third, **information cannot be separated from energy.** Transmitting and processing information costs energy, and energy is finite. We cannot obtain all the information for free.

### The knower as matter: the limits on cognition

Those who know the world are themselves made of matter, and these limits fall on us layer by layer.

The first layer is the channel. The biologist Jakob von Uexküll coined the term *Umwelt*: every organism lives in a world drawn by its senses. A tick's world contains only the smell of butyric acid, body warmth and the touch of hair, and nothing else. We laugh at how small the tick's world is, but humans are no exception. As the *Zhuangzi* puts it: "The morning mushroom knows nothing of the turn from dusk to dawn; the summer cicada knows nothing of spring and autumn. These are the short-lived."

The second layer is the number and range of channels. Humans have only a few senses, and each covers a narrow band of physical signals. Our ears hear roughly 20 Hz to 20 kHz; a dog hears the whistle we cannot. Our eyes see light from about 380 to 750 nanometers; a bee sees the ultraviolet we cannot. Our noses work with a few hundred kinds of olfactory receptors, and many molecules have no smell for us at all. Outside these narrow bands, the world is silent to us.

The third layer is the physical substrate of the channels. Every sensation must eventually become a neural signal. Electrical signals are disturbed by noise as they travel; chemical signaling consumes energy. The brain is about two percent of body weight but uses roughly a fifth of the body's energy. The channels themselves also fail: they age, become diseased, and finally die.

So perception is necessarily lossy and cannot fully reflect reality. Cognition is a further processing of perception, and lossy input cannot be processed into lossless cognition. What we know has never been the whole of the world.

### Loss at every step from information to perception to cognition: cognition must be a compressed representation

Information theory has a plain but rigorous result called the data processing inequality. If the world `$X$` is first perceived as `$Y$` and then processed into cognition `$Z$`, and cognition touches the world only through perception (so that `$X \to Y \to Z$` forms a Markov chain), then

```math
I(X;Z) \le I(X;Y)
```

That is, cognition contains no more information about the world than perception does. Each additional layer of processing can only preserve or reduce information about the source; it cannot create more out of nothing.

Add one more fact: our memory and processing capacity are finite, and in the face of an endless world a finite capacity can hold only a compressed version of it. Put the two together and the conclusion is clear: cognition is necessarily a compression of the world.

What is compressed must be stored, and storage requires a medium. What we keep is not the world itself but its traces on some medium: the firing of neurons, words on paper, a photograph, a recording. **To build cognition is to build representation.** The medium to some extent determines what a representation can become: what can be written is kept as writing; what cannot is kept only in images, in movement, or in the memory of the body. I do not want to overstate this and say the medium determines everything. But at the very least it limits the forms a representation can take, and so affects what is kept and what is lost.


## 3. What compression makes possible: representations that can be measured and compared

### The limit of compression: how far are we from it?

Compression has a limit. Shannon proved in 1948 that the limit of lossless compression of an information source is its entropy. Lossy compression has a limit too: if we allow the reconstruction to be somewhat unlike the original, by no more than `$D$`, then the minimum amount of information needed is given by a curve called the rate–distortion function:

```math
R(D) = \min_{p(\hat{x}\mid x):\ \mathbb{E}[d(x,\hat{x})] \le D} I(X;\hat{X})
```

Because there is a limit, there can be compression that comes *closer*. Of any real compression we can ask: how far is it from the limit? And the very word "closer" is already a comparison. Compression has a limit, and the limit is a point of reference.

### The fidelity criterion: comparability requires a chosen ruler

There is something easily skipped in the formula above: `$d(x,\hat{x})$`, the distortion function. It specifies what it means for a reconstruction to be "alike." Comparing point by point is one kind of likeness; comparing whole distributions is another; comparing how things look to the human eye is yet another. The world does not hand us this ruler. We have to choose it.

So the fuller statement is: compression has a limit, and with a chosen ruler, representations become measurable and comparable.

The point holds at a deeper level too. In 1969 Satosi Watanabe proved a theorem with a mischievous flavor, the Ugly Duckling theorem: if all possible properties are treated as equally important, then any two things share exactly the same number of properties. An ugly duckling and a swan are as similar, and as dissimilar, as two swans. Similarity is not something objects bring with them; it appears only when an observer gives certain properties a little more weight. That weight is the ruler.

There is one more layer. Economy and fidelity often cannot both be had: one compression is more economical, another more faithful, and the two can only be partly compared. To produce a complete ranking we must choose again: how much more are you willing to spend for fidelity? Comparability is not carried by the representation itself. It depends on what your chosen ruler measures.

### Measurable is not computable: computability comes from a chosen scope

If things can be compared, does that mean they can be computed? No. The sharpest example comes from compression itself. The length of the shortest description of an object is its Kolmogorov complexity, the ideal limit of compression. In general it is uncomputable. The limit exists and can be compared against, but it cannot be calculated.

Where does computability come from, then? From a scope we draw in advance. Once we choose a class of admissible descriptions, the limit of compression within that scope becomes estimable and computable: the entropy under a given probabilistic model, for example, or the minimum description length within a given model class. The compression limit of the world itself cannot be computed. What can be computed is the part inside the scope we have drawn.

This drawing in advance is what the opening of this essay called a setting: the guess made before seeing.

### A common vehicle for computing representations: mappings and functionals

To compute with representations we naturally turn to mathematics. If representation is a single concept, its computability needs a single mathematical description. Set theory speaks of membership, statistics of uncertainty, category theory of transformations between structures. Here I use the word *mapping*: a representation is a mapping from the world (or from our perception of it) into some carrier space. To accommodate uncertainty, this mapping is best understood as a generalized stochastic mapping, a conditional distribution `$p(z \mid x)$`, of which a deterministic function is a special case.

With this word, three concepts each find their place:

- a **representation** is a mapping;
- a **ruler** is a functional defined on mappings: it takes in a whole mapping and returns a score;
- **building a representation** means searching, within a family of mappings chosen in advance, for the one the ruler scores best.


## 4. Where is the limit of compressed representation?

### Describable problems and hard-to-describe problems

The world's problems fall roughly into two kinds. Some can be described clearly: the weight of an object, the orbit of a planet, the proportions of a chemical reaction. They can be written as symbols and equations. Others are hard to describe: why a face is this person's face, why a melody makes one sad, why a smell suddenly brings back a place. These are not nonexistent. It is just hard to find a medium that can hold them.

A description is, in fact, a combination on some medium of the representations stored in cognition: text combines words, equations combine symbols. And what cognition stores has already passed three lossy gates: sensation, processing, cognition. The capacity to describe is therefore bounded at both ends: by what cognition has kept, and by what the medium can combine.

### The limit of what can be represented is narrower than the limit of what can be perceived

This leads to a conclusion: **the boundary of what can be represented is narrower than the boundary of what can be perceived.** From perception to cognition to representation, each step loses something. Polanyi put it in one sentence: "We know more than we can tell." An old craftsman knows good timber with one touch but cannot write a complete rule for it; a physician sees what is wrong in a scan at a glance but struggles to state the grounds. This knowledge lives in perception without ever entering representation.

The goal of representation, then, is to approach the boundary of perception. The history of language, notation, mathematics and science is, in a sense, a history of shortening this distance: bringing more of what is sensed into the range of what can be said, transmitted and computed.

### Both boundaries can move: extending perception, extending representation

One more thing must be added: **the boundary of perception is not fixed.** It is set by channels, and channels can be extended. Microscopes, telescopes, spectrometers and gas sensors have opened new channels beyond the human senses, bringing what was invisible or odorless into perception.

**Nor is the boundary of representation fixed.** Coordinates, calculus, probability: each new notation has made a class of previously inexpressible things describable.

Seen this way, the history of human knowledge is a history of two kinds of tools taking turns to push forward: one extends the channels of perception, the other extends the capacity of representation. In the language of the previous section, the boundary of representational capacity is the boundary of the family of mappings available to us. What a family of mappings can represent determines how closely the best representation in that family can approach.

With all this in hand, we return to machine learning.


## 5. Breaking the limit: deep learning as an approximator of mappings

### Traditional machine learning and AI: the describable range

Traditional machine learning and artificial intelligence dealt mainly with the describable kind of problem. The quantitative kind is regression: turn one aspect of the world into numbers and find the relations between them. The qualitative kind is classification: cut the world into a finite number of classes and assign each thing to one. There is also symbolism: write knowledge as rules and logic and let the machine reason by them.

They have something in common: **the representation is designed by people.** Which features to look at, how to combine them, by what rules to reason — all of this must first be described by a person. The boundary of these methods is therefore the boundary of human descriptive ability.

### Modern deep learning: the hard-to-describe range

What truly separates deep learning from them is not whether it does regression or classification, but that **the representation itself becomes the object of learning.** People no longer have to describe the features first; they only provide a family of mappings and a ruler, and leave the rest to the data.

The weight of this becomes clear: a representation designed by people is bounded by human descriptive ability; a learned representation is not. What it approaches is no longer "what people can say," but "what the data contain."

### Why approximation is possible: universal approximation and the manifold hypothesis

There are two reasons this works.

One is universal approximation. A sufficiently wide neural network can approximate a large class of continuous functions to arbitrary precision. In other words, this family of mappings is, in principle, large enough.

The other is the manifold hypothesis. High-dimensional natural data such as images and sounds are not spread evenly through the whole space; they gather near low-dimensional structures. The world is high-dimensional, but the learnable structure is low-dimensional, so compression is possible.

But keep in mind: universal approximation says only that this family of mappings *can contain* the answer. It says nothing about whether learning can *find* it, still less whether what is learned will *generalize*. Those depend on the setting, the ruler and the data, which is the subject of the next section.


## 6. Deep learning, seen again: why particular designs succeed

### Overview: from memorizing terms to understanding design

We can now return to the question from the beginning: why are we so familiar with the terms of deep learning and yet still unable to use them, unable to design?

My answer: what we remember is what fills each position; what a designer understands is what each position does. In the framework of cognition laid out above, every part of deep learning already has its place:

| Element of cognition | Name in deep learning | What it decides |
|---|---|---|
| Channel: what can be sensed can be known | Data | Which part of the world the model can see |
| Setting: a scope drawn and weights assigned in advance | Inductive bias | What is assumed to matter before seeing |
| Medium: the structure in which a representation is stored | Architecture | How information is compressed, passed and combined |
| Imaging: how the world is rendered again from a compressed representation | Model structure | How the representation produces visible results |
| Ruler: the chosen standard of likeness | Loss function and objective | What counts as alike, what counts as good |

Return to the three words from the opening. Data is the channel; it marks which part of the world the model can see. And choosing which data to use is itself a guess made before seeing, so together with inductive bias it forms the *setting*. Architecture is the medium of representation, the concrete design of the setting: the *framework*. Model structure decides how the world is rendered again from a compressed representation, and together with the ruler that judges the result, it is the *image*. Let us take them one at a time.

### Data: the model's channel

Data is to a model what the senses are to a person. What cannot be sensed cannot be known; likewise, what is not in the data cannot be learned. A model's *Umwelt* is drawn by its data. A model trained on scans from one hospital lives in a world that ends with that hospital's machines and patients. The "out-of-distribution problem" of machine learning, a model encountering something outside its channel, is simply a direct consequence of "what cannot be sensed cannot be known."

But channels can be extended. Giving a model new senses — infrared, spectral, gas-sensor signals — pushes the boundary of its perception and lets it see what people cannot. This is the fundamental route by which machine learning can go beyond human perception, rather than merely approaching it.

### Inductive bias: the model's setting

As we said, without that bit of weight there is no similarity; the Ugly Duckling theorem settles the matter. Machine learning has a theorem that echoes it from afar, the "no free lunch" theorem: if all possible problems are treated equally, no learning algorithm does better than random guessing on unseen data. Without bias there is no learning.

A convolutional network assumes that neighboring pixels are more related than distant ones, and that a cat moved to the left of the frame is still the same cat. A recurrent network assumes a sequence has an order and that each step follows the same rule. Contrastive learning, by choosing which transformations are allowed, specifies which differences can be ignored: allow color changes, and the model learns not to care about color.

Inductive bias, then, is not an engineering compromise but a precondition of cognition. Designing a new model is largely a matter of choosing a new set of settings.

### Architecture: the medium of representation

The medium limits what a representation can become. Architecture is the medium of representation: it specifies the structure in which information is compressed, passed on and combined.

A convolutional network builds upward from local receptive fields, layer by layer: edges and textures at the bottom, parts and wholes at the top. This structure was learned from the eye in the first place. Hubel and Wiesel found neurons in the cat's visual cortex that respond only to line segments of a particular orientation; Kunihiko Fukushima's Neocognitron, and later the convolutional network, carried forward this hierarchical idea.

U-Net encodes and then decodes: it compresses the input step by step into a low-resolution abstract representation, then restores it step by step. Its most elegant feature is the skip connection, which hands the detail of each compression layer directly to the corresponding restoration layer. Looking back to Section 2, this is almost an engineering answer to the data processing inequality: since each layer of compression loses something, leave a small path for the details that would be lost.

The Transformer uses attention to let each position decide, based on content, which other positions to relate to. What it relaxes is precisely the convolutional network's setting that "neighbors are more related": connections are no longer fixed in advance by position but left to the data.

One more point: architecture and model structure, discussed next, are two independent positions. The same generative principle can be paired with different architectures; diffusion models, for example, can use either a U-Net or a Transformer. One reason people feel dizzy at the number of terms is that these two positions get mixed together.

### Model structure: the principle of imaging

The value of a representation lies in its ability to approximate the world and to render the world again from compressed form. Model structure specifies the principle of this "imaging."

A **variational autoencoder (VAE)** first compresses the input into a low-dimensional latent variable and then reconstructs the input from it. Its training objective is

```math
\log p(x) \ge \mathbb{E}_{q(z\mid x)}\big[\log p(x\mid z)\big] - \mathrm{KL}\big(q(z\mid x)\,\|\,p(z)\big)
```

The first term governs how faithful the reconstruction is; the second, how much information the representation takes up. Is this not the tension from Section 3, economy against fidelity? The later β-VAE simply puts a weight between the two terms. That weight is the trade-off we said must be chosen again in order to produce a complete ranking.

A **diffusion model** adds noise to data step by step until it becomes pure noise, then learns to remove the noise step by step. To generate, it starts from noise and recovers an image little by little. What it learns is how to bring an image back into view when the information has been buried under noise.

**Flow matching** learns a continuous path from a simple distribution to the data distribution, like a wind that slowly blows noise into data. Generation here is not a single leap but a continuous deformation.

Three model structures, three principles of imaging: reconstruction after compression, recovery through denoising, transport along a path.

### Objectives and loss functions: the ruler of fidelity

The loss function is the chosen ruler of Section 3.

Mean absolute error and mean squared error compare output and answer point by point; the likeness they choose is numerical closeness. Such rulers show their temperament when generating images: behind one blurry photo there may be several sharp ones, and mean squared error rewards their mean, mean absolute error their median, neither of which is any one of them. Many sharp faces stacked together make one blurry face. This is not a failure of optimization. The ruler was chosen that way.

KL divergence compares not individual points but whole distributions. The likeness it chooses is agreement in a statistical sense.

As for the "alchemical" choices mentioned at the start — learning rate, initialization, normalization — they too have a common place in this framework. They decide whether the search for the best mapping, within the chosen family of mappings, can proceed stably and arrive. They are not each a law unto themselves; they all serve the same task. The impression of alchemy comes from not seeing this shared task, not from these choices lacking reasons.

To choose a loss function is to choose what "alike" means in the model's eyes. Data cannot make this choice for you. It depends on what you want to see.

### Example one: latent diffusion models

Latent diffusion models, the basis of Stable Diffusion, use nearly all five positions above.

Their **data** are vast numbers of images and the text describing them; the world they can draw ends where these images and texts end.

Their **setting** is that images have local spatial structure, and that the meaning of an image can be stated in words.

Their **imaging** layers two principles. A VAE first compresses the image into a low-dimensional latent space, and diffusion then takes place in that latent space. Why not diffuse directly on pixels? Because pixel space is too high-dimensional and too costly, and most pixel-level detail does not matter for what the picture depicts. This step is the engineering form of "compression has a limit" and of the manifold hypothesis: first compress onto the learnable low-dimensional structure, then learn inside it.

Their **architecture** is a U-Net, with cross-attention injecting the text representation so that language becomes the condition for imaging.

Their **ruler**, in the diffusion part, is the mean squared error of predicted noise; in the compression part, it combines reconstruction error, perceptual similarity and an adversarial judge, specifically to avoid the blur that point-by-point comparison produces.

Every part of this system finds its place and its reason in the framework above. Its success is not the luck of alchemy but the coordination of a set of settings, a medium, an imaging principle and a ruler.

### Example two: language models

Language models are another combination.

Their **data** are text written by people. And as Section 4 said, text is precisely the medium of what humans *can represent*. So the channel of a language model is exactly the boundary of human representational capacity: the world it can reach is at most the world that has been written down.

Their **setting** is that text can be predicted from left to right, one unit at a time, and that a word's meaning is determined by the words around it.

Their **architecture** is the Transformer, using attention to decide which parts of the context relate to one another.

Their **ruler** is the cross-entropy between the predicted next unit and the actual text. This ruler has a peculiar property: to predict well what a person will write next, the model must preserve every distinction that affects what people write, reasoning, intention and knowledge among them. A goal that looks as narrow as can be thus inherits the ways in which all its writers carve up the world.

It has its limit too. A language model's loss has a floor that no amount of scaling can lower, which can be roughly understood as the entropy of text itself. This is exactly the limit of compression; and whatever lies outside text, every feeling never written down or impossible to write, lies outside its channel.


## Closing the loop: from cognition to deep learning, and back

### What cognitive science and neuroscience gave deep learning

This framework was not tailor-made for machine learning. It applies equally to biological cognitive systems, and historically the inspiration has run in both directions.

The hierarchical structure of the visual cortex inspired the convolutional network. In 1961 Barlow proposed the efficient coding hypothesis: the task of a sensory system is to encode external stimuli with as little redundancy as possible. Biological perception, in other words, is itself a compressor. In 1999 Rao and Ballard proposed predictive coding: the cortex continually predicts the next input and passes upward only what it predicted wrongly. This is strikingly similar in structure to learning methods built on prediction.

Channel, compression, setting, ruler: these are not only parts of machine learning but parts of biological cognition. That the same framework holds for both systems suggests, indirectly, that it was not built for machine learning alone.

### What learning theory suggests about how we learn

In the other direction, machine learning can offer people a reference for their own learning. A model that only memorizes its training examples fails on new ones; a model that generalizes has learned the structure behind the examples.

People are the same. The technique-centered way of learning described at the start remembers what fills each position. The way this essay hopes to encourage is to understand what each position does.

**Bias cannot be avoided, but it can be noticed.** Without bias there is no learning, and human cognition carries bias too. A good learner differs in knowing what their bias is and where it will fail.

**The boundaries can be pushed.** Both boundaries, of perception and of representation, can be pushed outward. Machine learning is the newest tool for pushing them, and will not be the last.

#### Lesson one: how to learn — on-policy and off-policy

The two concepts below are terms from training models. Borrowed to look at human learning, they are not exact, but they make a point clearly.

Reinforcement learning distinguishes on-policy from off-policy learning. The difference is not in what is learned but in where the experience comes from: on-policy learning uses experience generated by one's own current behavior; off-policy learning uses experience generated by some other behavior.

Reading a textbook, studying worked examples, asking an AI for the answer: these are off-policy. What we see is the path taken by a behavior better than our own. Such learning is efficient, because good experience comes cheaply. But it has a cost, which imitation learning states plainly: an expert never goes where the learner will go wrong. The demonstrations contain only correct states, none of the states that follow your mistakes. So once you try it yourself and drift by one step, you are in a situation never demonstrated, and from there you drift further. This is compounding error.

Working problems, deriving things yourself, writing code that fails and going back to fix it: these are on-policy. The experience comes from your own behavior, and so do the mistakes, which means what you learn is precisely what to do in the places you will actually reach. It is slow and costly, but it covers the distribution you will really encounter.

The two are not either-or. Imitation learning has a classic compromise called DAgger: let the learner act by its own policy, then ask the expert what the right action would have been in the states the learner actually reached, and add these labels to training. In a learner's terms: asking an AI "how do I solve this problem" is off-policy; solving it yourself first, then bringing your own attempt and asking "why was this step wrong" is having the expert label the path you walked. The first teaches you someone else's answer; the second teaches you how to find your way out of your own mistakes.

So the answer to how one should learn lies not in whether to use textbooks or AI, but in where the experience comes from: first let your own behavior generate experience, then let a better behavior correct it.

#### Lesson two: why you understand a derivation but cannot reproduce it — teacher forcing

Almost every learner has had this experience: following a derivation in a book line by line, understanding every step; then closing the book and getting stuck at the second step. This is not an illusion. A phenomenon from training sequence models explains it.

The most common way to train a model that generates step by step is called teacher forcing: at every step the correct previous step is fed to the model, which learns only "given the correct prefix, what comes next." This trains quickly and stably. But at generation time no one feeds it the correct prefix; it sees its own previous output, and once that output deviates even slightly, it is in a situation never seen in training. This mismatch between training and use is called exposure bias: the model has never been exposed to its own mistakes.

Following a derivation line by line is exactly teacher forcing. At every step the book hands you the correct previous line, and what you learn is "given the correct prefix, why the next step holds." This is real understanding, but only half of it. The other half is whether, when the prefix is your own and possibly wrong, you can keep going, notice that you have gone astray, and find your way back. The book has never let you practice that half.

One remedy for exposure bias is scheduled sampling: during training, gradually feed the model less of the correct prefix and let it continue more and more from its own output. A learner can do the same: read through once with the book, then cover the next few lines and derive them, then cover more, until the book is closed and you derive the whole thing from the start. Understanding is the ability you have when fed the correct prefix; deriving is the ability you have when exposed to your own output. The distance between them is exposure bias.

These two concepts describe two sides of the same thing. The off-policy learner has never seen where they will go wrong; the teacher-forced learner has never practiced continuing from their own mistakes. The remedy points the same way: let your own behavior enter the training.


### Coda

Return to the three words from the opening. A setting is the guess made before seeing; a framework is the guess given concrete form; an image is what the design allows you to see.

Every technique in deep learning is a set of choices made at these three levels. Once this is understood, what lies before you is no longer a list of terms to memorize, but a set of choices that can be examined, replaced and redesigned.

And what these choices are doing together is something much older than machine learning: with limited perception and limited representation, seeing as much of the world as we can.

## References

- Rahimi, A., & Recht, B. (2017). Reflections on random kitchen sinks. NeurIPS Test of Time Award talk.
- Bergson, H. (1907). L’Évolution créatrice [Creative Evolution]. Paris: Alcan.
- von Uexküll, J. (1934). Streifzüge durch die Umwelten von Tieren und Menschen [A Foray into the Worlds of Animals and Humans]. Berlin: Springer.
- Shannon, C. E. (1948). A mathematical theory of communication. Bell System Technical Journal, 27, 379–423, 623–656.
- Shannon, C. E. (1959). Coding theorems for a discrete source with a fidelity criterion. IRE National Convention Record, 7(4), 142–163.
- Cover, T. M., & Thomas, J. A. (2006). Elements of Information Theory (2nd ed.). Wiley.
- Watanabe, S. (1969). Knowing and Guessing: A Quantitative Study of Inference and Information. New York: Wiley.
- Kolmogorov, A. N. (1965). Three approaches to the quantitative definition of information. Problems of Information Transmission, 1(1), 1–7.
- Rissanen, J. (1978). Modeling by shortest data description. Automatica, 14(5), 465–471.
- Polanyi, M. (1966). The Tacit Dimension. Garden City, NY: Doubleday.
- Cybenko, G. (1989). Approximation by superpositions of a sigmoidal function. Mathematics of Control, Signals and Systems, 2(4), 303–314.
- Hornik, K. (1991). Approximation capabilities of multilayer feedforward networks. Neural Networks, 4(2), 251–257.
- Bengio, Y., Courville, A., & Vincent, P. (2013). Representation learning: A review and new perspectives. IEEE Transactions on Pattern Analysis and Machine Intelligence, 35(8), 1798–1828.
- Wolpert, D. H. (1996). The lack of a priori distinctions between learning algorithms. Neural Computation, 8(7), 1341–1390.
- Hubel, D. H., & Wiesel, T. N. (1962). Receptive fields, binocular interaction and functional architecture in the cat’s visual cortex. Journal of Physiology, 160(1), 106–154.
- Fukushima, K. (1980). Neocognitron: A self-organizing neural network model for a mechanism of pattern recognition unaffected by shift in position. Biological Cybernetics, 36, 193–202.
- Ronneberger, O., Fischer, P., & Brox, T. (2015). U-Net: Convolutional networks for biomedical image segmentation. MICCAI.
- Vaswani, A., et al. (2017). Attention is all you need. NeurIPS.
- Peebles, W., & Xie, S. (2023). Scalable diffusion models with transformers. ICCV.
- Kingma, D. P., & Welling, M. (2014). Auto-encoding variational Bayes. ICLR.
- Higgins, I., et al. (2017). β-VAE: Learning basic visual concepts with a constrained variational framework. ICLR.
- Sohl-Dickstein, J., et al. (2015). Deep unsupervised learning using nonequilibrium thermodynamics. ICML.
- Ho, J., Jain, A., & Abbeel, P. (2020). Denoising diffusion probabilistic models. NeurIPS.
- Lipman, Y., et al. (2023). Flow matching for generative modeling. ICLR.
- Chen, T., Kornblith, S., Norouzi, M., & Hinton, G. (2020). A simple framework for contrastive learning of visual representations. ICML.
- Rombach, R., et al. (2022). High-resolution image synthesis with latent diffusion models. CVPR.
- Hoffmann, J., et al. (2022). Training compute-optimal large language models. arXiv:2203.15556.
- Barlow, H. B. (1961). Possible principles underlying the transformations of sensory messages. In Sensory Communication (pp. 217–234). MIT Press.
- Rao, R. P. N., & Ballard, D. H. (1999). Predictive coding in the visual cortex. Nature Neuroscience, 2(1), 79–87.
- Williams, R. J., & Zipser, D. (1989). A learning algorithm for continually running fully recurrent neural networks. Neural Computation, 1(2), 270–280.
- Ross, S., Gordon, G., & Bagnell, D. (2011). A reduction of imitation learning and structured prediction to no-regret online learning. AISTATS.
- Bengio, S., Vinyals, O., Jaitly, N., & Shazeer, N. (2015). Scheduled sampling for sequence prediction with recurrent neural networks. NeurIPS.
- Ranzato, M., Chopra, S., Auli, M., & Zaremba, W. (2016). Sequence level training with recurrent neural networks. ICLR.
