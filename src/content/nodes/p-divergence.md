---
title: Divergence landscape
order: 1
type: project
summary: A diagnostic method for multi-source systems. First describe how an integrator resolves conflict, then, separately, ask whether that behavior matches reality.
pos: [0.8, 0.66]
posNarrow: [0.8, 0.71]
links:
  - to: q-integrate
    question: Is a stable strategy also a correct one?
  - to: past-sich
    question: Where did the agent's reasoning split from its tools?
placeholder: true
---

## Three parts, in order

1. Is the system stable enough to analyze at all?
2. What does it do when sources disagree, independent of whether it is right?
3. Does that behavior match real outcomes?

The vocabulary of correctness never leaks backward from the third part into the second. The behavioral findings should be stateable without the word "error" anywhere in them.

## Try it

Three sources lean toward different outcomes. Drag them, then move the integrator between following the most favorable source and the least favorable one.

<viz-compromise data-scale="1,2,3,4,5" data-sources="Model:2,Retrieval:4,Rules:3" data-alpha="0.5"></viz-compromise>

The full interactive explainer will live here, built on simulated data, so every failure mode found while developing the method can be reproduced by hand.
