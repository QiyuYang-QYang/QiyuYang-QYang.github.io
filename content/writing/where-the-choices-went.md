---
title: "Where the Choices Went: Machine Learning as the Art of Connection"
kind: Essay
pair: choices
date: 2026-11-04
summary: No system learns without choices made before it sees any data. This
  essay reads the history of machine learning, from expert systems to coding
  agents, as the story of where those choices live and whether the judgment of
  results can reach them. Every breakthrough connected one more choice to that
  judgment; every characteristic failure sits in the choice that was still left
  outside.
draft: true
---
> Every model is a set of choices. The question is which of them the data is allowed to correct.

### 1. A puzzle

A model trained to do one thing, guess the next piece of text, can now write working software, pass professional exams, and help with open mathematical problems. Nobody told it to do any of these. Its training objective, written out, is a single line: make the observed next token more probable.

The usual answers are "scale" and "data," and both are true. But they explain how much better the model became, not why this kind of training produces this kind of ability, and they do not explain the failures that come with it: the fluent, confident falsehood; the agent that makes the tests pass by editing the tests.

This essay offers a different way to read the history that produced these systems. It follows one thing through that history, and it tries to keep that thing narrow enough to check in every example: **a choice made before the data arrives, and whether the judgment of results can reach it.** The claim is that the history of machine learning is the history of connecting such choices, one after another, to that judgment. Each breakthrough connected one more. Each characteristic failure sits in a choice that was still left outside.

Before following the history, we need a license for the claim: a reason to believe that such choices are always there to be found.

### 2. The license: no learning without a preference

Put a few objects on a table. In 1969 Satosi Watanabe asked how similar any two of them are, if we are perfectly impartial about which properties count. A property, in the end, is just a way of picking some of the objects out. With n objects there are `$2^n$` ways of picking, and any two objects turn out to share exactly `$2^{n-2}$` of them, whichever two you choose. This is the [ugly duckling theorem](https://en.wikipedia.org/wiki/Ugly_duckling_theorem): to an observer with no preferences, an ugly duckling is exactly as similar to a swan as two swans are to each other.

Similarity is not something objects bring with them. It appears only when someone gives some properties more weight than others.

Twenty-seven years later David Wolpert proved the learning version of the same fact. Averaged over every possible problem, treating all of them as equally likely, no learning algorithm does better than random guessing on data it has not seen. Whatever an algorithm gains on one kind of problem it loses on another. This is the [no free lunch theorem](https://en.wikipedia.org/wiki/No_free_lunch_theorem). Machine learning has a name for whatever tilts an algorithm toward some problems and away from others: [inductive bias](https://en.wikipedia.org/wiki/Inductive_bias).

Together these two results are the license. They say that every system that learns anything carries choices that the data did not make. So finding such choices inside every successful system is not a coincidence we have to argue for. It is guaranteed. The only questions left are where the choices live, who makes them, and whether anything can correct them.

In practice they live in three places:

- **what the model is allowed to be**: its architecture, which fixes what it can represent and which differences it can ignore;
- **what the model is told to prefer**: its objective or loss, which fixes what counts as a good result;
- **what the model is shown**: its data, which fixes the world it is right about.

Inductive bias is not a fourth place. It is the substance stored in the other three. A convolutional network keeps its bias in its architecture; a contrastive learner keeps it in the choice of which changes count as "the same image"; a language model keeps much of it in the data it reads.

The art of machine learning, in this reading, is the art of deciding where to put these choices and how to connect them, so that a judgment about the results can flow back and correct them.

### 3. When nothing was connected

The first serious attempts at artificial intelligence connected nothing.

The [expert systems](https://en.wikipedia.org/wiki/Expert_system) of the 1980s turned the judgments of doctors and engineers into thousands of "if... then..." rules. People decided what to look at, people decided how the observations combined, and the machine carried out the rules. When the machine was wrong, nothing inside it changed; someone had to notice, find the rule, and rewrite it.

Early computer vision was built the same way, one step removed. Engineers designed the features an image should be described by, such as edges, corners, and the directions of textures, and then a learning algorithm drew boundaries on top of those features. The boundary was learned. The features were not. If the engineers had chosen the wrong features, the error had no path back to tell them.

Such systems had a characteristic failure, and it was an honest one. Inside the cases the rules described, they were reliable. Outside, they stopped. A case the rules did not cover produced no answer, or an obviously wrong one.

Keep this failure in mind. Later systems would fail differently, and the difference tells us which choices had been connected.

### 4. The first connection: features join the gradient

The idea that features could be learned is old. It met an early wall in 1969, when Marvin Minsky and Seymour Papert showed that a single-layer [perceptron](https://en.wikipedia.org/wiki/Perceptron) cannot learn [exclusive or](https://en.wikipedia.org/wiki/Exclusive_or). Picture a lamp that is on when exactly one of two switches is up. Look at either switch alone and it tells you nothing about the lamp; the information exists only in the combination. A model that can only weigh the switches separately will never find it.

The way out was to add a hidden layer that first combines the switches into a new quantity, and then judges by that. The hidden layer is a learned feature. What made it trainable was [backpropagation](https://en.wikipedia.org/wiki/Backpropagation): a way to send the error at the output back through every layer, telling each parameter which way to move.

That is the first connection in our sense. The choice of what to look at was no longer made entirely before the data arrived. It was now inside the loop. A wrong feature could be corrected by the same signal that judged the result.

In 2012 a convolutional network called [AlexNet](https://en.wikipedia.org/wiki/AlexNet) made the point impossible to ignore. On the [ImageNet](https://en.wikipedia.org/wiki/ImageNet) benchmark it cut the top-5 error from the runner-up's roughly twenty-six percent to about fifteen. Nobody told it to look for edges or textures. When researchers later opened such networks layer by layer, they found that the lowest layers had learned edges and patches of color, almost exactly the features engineers had designed by hand; above them, textures and simple shapes; above those, eyes, wheels, fur; and at the top, whole objects. Decades of feature design had been rediscovered by the gradient, and then extended into places nobody had named.

But not everything had moved inside the loop. The architecture was still a human choice, and a deliberate one. A [convolutional network](https://en.wikipedia.org/wiki/Convolutional_neural_network) assumes that neighboring pixels are more related than distant ones, and that a cat shifted to the left is still a cat. These assumptions are not learned from data. They are built in, and the gradient cannot remove them. The features were connected; the architecture was not.

Neither was the set of answers. A cat-and-dog classifier is trained to choose between exactly two classes. Its last layer, the [softmax](https://en.wikipedia.org/wiki/Softmax_function), must divide all the probability among them, adding up to one. "Neither" is not in its world.

So it fails in a new way. Show it a car, and it does not stop, as an expert system would; it says, without hesitation, that this is 92 percent dog. In 2015 researchers fooled the best image classifiers of the time with images that looked to a person like colored static, and the classifiers answered with more than 99 percent confidence. The expert system's failure was honest: it stopped. This failure is dangerous: it continues, in the same confident tone.

Notice where the failure sits. Not in the features, which had been connected and could adapt, but in the choice that had been left outside the loop: the fixed list of classes. This pattern will repeat.

### 5. The task decides which differences count

Words show the same thing more cleanly than images.

The simplest way to give a computer a vocabulary of a hundred thousand words is [one-hot encoding](https://en.wikipedia.org/wiki/One-hot): each word becomes a hundred-thousand-dimensional vector, with a 1 in its own position and 0 everywhere else. Every word sits at a corner of a hypercube, and every pair of words is exactly the same distance apart. "Cat" is as far from "dog" as from "audit." This is the ugly duckling theorem drawn as geometry: perfect impartiality, and no similarity at all.

The fix is to project the words into a space of a few hundred dimensions, where distances can mean something. In 2013 [word2vec](https://en.wikipedia.org/wiki/Word2vec) learned that projection with a simple task: given a word, guess the words around it. The belief behind it is the linguist J. R. Firth's line, "You shall know a word by the company it keeps."

Then something instructive happens. In word2vec's space, "good" and "bad" sit close together, because people use them in the same places: this film was good, this film was bad. Train the same kind of model to decide whether a review is positive or negative, and the two words are pushed apart. Neighbors under one task, opponents under another. Which is their real relationship? The license from Section 2 says the question has no answer. The task decides which differences are kept and which can be thrown away.

And the task, in supervised learning, comes with labels, which come from people. Thousands of annotators press buttons according to their own judgment. They do not always agree. When researchers rechecked ten widely used benchmark datasets in 2021, they estimated that at least 3.3 percent of the test labels were wrong on average, and at least 6 percent in the ImageNet validation set. The classes a model learns are, in the end, the statistical average of a group's judgment.

So at this stage the choices sit like this: the features are connected; the architecture is chosen by hand; the task, the labels, and therefore what counts as a good result, are all fixed by people before training starts.

### 6. When the judge itself is learned

The next connection reached the judgment itself.

Ask a network to sharpen a blurry photo, and the most direct loss compares the result to the true image pixel by pixel: [mean squared error](https://en.wikipedia.org/wiki/Mean_squared_error). The network learns to produce washed-out images. Behind one blurry photo there are many possible sharp ones, and mean squared error rewards the answer that is not too far from any of them, which is their average. Many sharp faces averaged together make one blurry face. The loss had defined "looking alike" as "pixels that are close," which is not how eyes judge.

In 2014 Ian Goodfellow and colleagues replaced the formula with a second network, a referee trained to tell real images from generated ones. The generator tries to fool the referee; the referee tries to catch it. This is the [generative adversarial network](https://en.wikipedia.org/wiki/Generative_adversarial_network). Applied to sharpening, it works: a blurry average does not fool a referee that hunts for flaws, so the generator learns to draw sharp textures.

Here the standard of a good result is no longer a line of formula written by a person. It is learned, and it changes during training. One more choice has moved inside the loop.

And the failure moves with it. The sharp textures are not necessarily in the original image. They are what the generator believes "should" be there. A learned judge rewards what looks real, so the system invents detail. The failure is no longer blur, which belonged to the hand-written loss; it is plausible fabrication, which belongs to a judge that knows what real looks like but not what is true.

A quieter version of the same move needs no labels at all. [Contrastive learning](https://en.wikipedia.org/wiki/Self-supervised_learning), which took off around 2020, gives the network one rule: two crops, recolorings, or flips of the same image count as the same thing; different images count as different things. Pull the same together, push the different apart. The labels are gone. But the choice has not disappeared; it has moved. What counts as "the same" depends entirely on which transformations the designer allows. Allow recoloring and the network learns to ignore color. Allow flipping and it learns to ignore orientation. The inductive bias now lives in a list of image edits.

### 7. An objection: the bitter lesson

There is a well-known argument against everything this essay is saying.

In 2019 Richard Sutton wrote a short essay called "[The Bitter Lesson](http://www.incompleteideas.net/IncIdeas/BitterLesson.html)." Looking back over seventy years of AI research, he observed that methods which build in human knowledge win in the short term, and general methods that scale with computation, search and learning, win in the long term, every time. The lesson is bitter because researchers keep wanting to build in what they know, and keep being overtaken.

The cleanest evidence for Sutton is the vision [transformer](https://en.wikipedia.org/wiki/Vision_transformer). It throws away most of the convolutional network's built-in assumptions about images: no special treatment for neighboring pixels, no built-in tolerance for shifts. With modest data it does worse than a convolutional network. With enough data it does better. Less human knowledge in the architecture, better results.

The history in this essay agrees with half of this. Hand-designed features lost to learned features; fixed similarity lost to learned similarity. The direction of travel is away from choices that the data cannot correct.

But the bias did not vanish when the architecture let go of it. The license in Section 2 says it cannot. It moved: into the objective, into the augmentations, into the data. A vision transformer trained without assumptions about images still has to be told what to predict, and from which images. The bitter lesson is not that human choices stop mattering. It is that a choice placed where the gradient cannot reach it will eventually lose to a choice placed where it can. It is a lesson about *where*, not about *whether*.

Read this way, the bitter lesson is the strongest single piece of evidence for the claim of this essay.

### 8. The next token

Now the puzzle from the beginning.

A language model is trained on one objective: given the text so far, predict the next token. On the output side this is a classification, and an enormous one; the classes are the whole vocabulary, tens of thousands to over a hundred thousand of them. In the terms of Section 5, the task decides which differences the model must keep. So which differences does predicting the next token keep?

Every difference that affects what a person would write next.

To predict the next line of a proof, it helps to follow the proof. To predict the next sentence of a conversation, it helps to model what the speakers want. To predict the next line of code, it helps to know what the program is supposed to do. None of these were asked for. They are what it costs to lower the loss on text that people wrote while doing these things. In 2019 the GPT-2 paper put this in its title: language models are [unsupervised multitask learners](https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf). Any task that can be written as "continue this text" is already inside the objective.

So the objective is a classification with trivial classes and extraordinary scissors. The scissors are human writing itself. Every distinction people found worth putting into words is one the model is rewarded for keeping. That is why one line of objective yields so much: it inherits, wholesale, the choices of everyone who wrote the training data.

It also says where the limits are. In 2022 DeepMind's [Chinchilla](https://en.wikipedia.org/wiki/Neural_scaling_law) study fitted how a language model's loss falls as the model and the data grow:

```math
L(N, D) = E + \frac{A}{N^{\alpha}} + \frac{B}{D^{\beta}}
```

N is the number of parameters, D the amount of data. The last two terms shrink toward zero as both grow. The first, E, does not move. The authors read it, approximately, as the entropy of the text itself: after "the weather today is," a person might write "nice" or "fine," and no model can know which. No amount of scale removes it. And the model is bounded in a second way, by what is not in the text: what was never written down, what happened after the data was collected, what is hard to put into words at all.

The same objective explains another change. A classifier's classes are fixed before training. A language model's are not; any answer can be spelled out a token at a time, and the task is specified by whoever asks. [CLIP](https://en.wikipedia.org/wiki/Contrastive_Language-Image_Pre-training), in 2021, previewed this for images: it learns only which pictures go with which sentences, and the classes are written by the user at the moment of use. The fixed list of classes, the choice that made the cat-and-dog classifier call a car a dog, has finally been opened. At least within language, it is no longer a choice made before the data.

### 9. Handing over the judgment

But a model that predicts the next token well does not know what a good answer is. It knows what a likely continuation is. The next few years of language models are a sequence of attempts to connect that last choice, the standard of a good result, to something other than the text.

The first replacement was people. From around 2022, models were adjusted using human demonstrations and human rankings of their answers. In the InstructGPT study, a model of about 1.3 billion parameters tuned this way was preferred by people over a 175-billion-parameter model that had not been. Changing the judge did more than making the model over a hundred times larger.

The second replacement was programs. On problems whose answers can be checked automatically, such as mathematics with a known answer or code with tests, "do people like it" was replaced by "is it right." A verifier cannot be flattered.

The third replacement was environments. Models were placed where they could call tools, read and write files, and work on a software project for hours; whether the task got done became the reward.

At each step the judgment moved further from a person's hand. And at each step, the characteristic failure moved to the part that was still drawn by hand.

**Hallucination.** In 2025 researchers at OpenAI and Georgia Tech [analyzed why language models state falsehoods fluently](https://arxiv.org/abs/2509.04664). Their account: when a pretrained model cannot reliably tell a true statement from a false one, it may produce the false one; and post-training does not remove this, because the evaluations that models are optimized against give points for a correct guess and nothing for "I don't know." Guessing raises the score. The remedy they propose is not a new architecture. It is a new judge: evaluations that reward calibrated abstention. The failure lives exactly in the choice that was still made by hand, the scoring rule.

**Reward hacking.** An environment checks only what its authors thought to check. Where the checks leave a gap, a model trained against them finds it: coding agents have been observed editing the tests instead of fixing the code, or making a check pass without doing the work. Economists knew this long before, as Goodhart's law, in Marilyn Strathern's phrasing: when a measure becomes a target, it ceases to be a good measure. The judgment was handed to the environment; the environment was drawn by people; the system fails exactly where the drawing is incomplete.

### 10. The rule, and what is left

Put the stages side by side.


| Stage | What joined the loop | What it gained | Where it failed |
| ----------------------------------------- | ----------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------ |
| Expert systems, hand-made features | nothing | reliability inside the rules | stops outside the rules |
| End-to-end deep learning | features | features rediscovered and extended | the fixed list of classes: confidently wrong outside it |
| Learned judges (GANs) | the standard of "looks real" | sharp images | invented detail |
| Contrastive learning | labels removed | learning without annotation | bias moved into the choice of augmentations |
| Next-token prediction, open classes | the classes themselves | any task that can be written as text | entropy floor; what was never written |
| Human preference, verifiers, environments | the standard of a good answer | usefulness, correctness in checkable domains | hallucination, reward hacking: the scoring rule and the checks still drawn by people |


The pattern is the claim of this essay, and now it can be stated as a rule:

**A learning system fails in the way set by the choice that is still outside its loop.**

The rule is useful because it predicts. Given a new system, do not start by asking how big it is. Ask which of its choices the judgment can reach, and which it cannot. The failures will be found in the second list.

What remains in the second list today? The architecture, though less than before. The data, which is still mostly what people wrote and photographed. And the deepest choice, the one this essay has been circling: what counts as good. Even when the judge is a program or an environment, someone wrote the program and built the environment. The judgment has left human hands, but its shape is still drawn by people.

One more observation, offered as a suspicion rather than a result. Every choice in this history was a decision about which differences count. The architecture decides which differences can be ignored: a shift, a rotation. The objective decides which errors cost more than others. The data decides which distinctions the world even offers. Ugly duckling's lesson was that no difference counts until someone decides it does. If that is right, then the art described here is one instance of something older and more general: the art of deciding which differences matter, which people practiced long before there were machines, every time they drew a line through the world and gave the two sides different names. I try to follow that thread outside machine learning in a [companion essay](/post.html#the-subjective-art-of-objective-problems-classification-cognition-and-the-limits-of-artificial-intelligence).

This essay, too, made a choice before the evidence: to read the history as a story of connection. It is a bias, and the license in Section 2 says I could not have read the history without one. Where it fails is for the reader to find.

### References

- Watanabe, S. (1969). Knowing and Guessing: A Quantitative Study of Inference and Information. New York: Wiley.
- Wolpert, D. H. (1996). The lack of a priori distinctions between learning algorithms. Neural Computation, 8(7), 1341–1390.
- Minsky, M., & Papert, S. (1969). Perceptrons. Cambridge, MA: MIT Press.
- Rumelhart, D. E., Hinton, G. E., & Williams, R. J. (1986). Learning representations by back-propagating errors. Nature, 323, 533–536.
- Krizhevsky, A., Sutskever, I., & Hinton, G. E. (2012). ImageNet classification with deep convolutional neural networks. NeurIPS.
- Zeiler, M. D., & Fergus, R. (2014). Visualizing and understanding convolutional networks. ECCV.
- Nguyen, A., Yosinski, J., & Clune, J. (2015). Deep neural networks are easily fooled: High confidence predictions for unrecognizable images. CVPR.
- Mikolov, T., Chen, K., Corrado, G., & Dean, J. (2013). Efficient estimation of word representations in vector space. arXiv:1301.3781.
- Firth, J. R. (1957). A synopsis of linguistic theory, 1930–1955. In Studies in Linguistic Analysis. Oxford: Blackwell.
- Northcutt, C. G., Athalye, A., & Mueller, J. (2021). Pervasive label errors in test sets destabilize machine learning benchmarks. NeurIPS Datasets and Benchmarks Track.
- Goodfellow, I., et al. (2014). Generative adversarial nets. NeurIPS.
- Ledig, C., et al. (2017). Photo-realistic single image super-resolution using a generative adversarial network. CVPR.
- Chen, T., Kornblith, S., Norouzi, M., & Hinton, G. (2020). A simple framework for contrastive learning of visual representations. ICML.
- Sutton, R. (2019). The Bitter Lesson. incompleteideas.net.
- Dosovitskiy, A., et al. (2021). An image is worth 16x16 words: Transformers for image recognition at scale. ICLR.
- Radford, A., et al. (2019). Language models are unsupervised multitask learners. OpenAI.
- Hoffmann, J., et al. (2022). Training compute-optimal large language models. arXiv:2203.15556.
- Radford, A., et al. (2021). Learning transferable visual models from natural language supervision. ICML.
- Ouyang, L., et al. (2022). Training language models to follow instructions with human feedback. NeurIPS.
- Kalai, A. T., Nachum, O., Vempala, S. S., & Zhang, E. (2025). Why language models hallucinate. arXiv:2509.04664.
- Baker, B., et al. (2025). Monitoring reasoning models for misbehavior and the risks of promoting obfuscation. arXiv:2503.11926.
- Goodhart, C. A. E. (1975). Problems of monetary management: The U.K. experience. Papers in Monetary Economics, Reserve Bank of Australia.
- Strathern, M. (1997). 'Improving ratings': Audit in the British university system. European Review, 5(3), 305–321.

