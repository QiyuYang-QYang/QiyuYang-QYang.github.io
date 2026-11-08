---
title: Integrative Agentic Workflow for Clinical Prognosis Outcome Prediction in ICH
year: "2026"
tags: LLM Agent · Harness Engineering · Clinical AI · Evaluation
where: Shenzhen Research Institute of Big Data · CUHK-SZ
order: 1
---
### Summary

An LLM agent that predicts how well a patient will recover from a spontaneous brain hemorrhage, measured by the Glasgow Outcome Scale (GOS) at discharge, from the CT scan and clinical record taken at admission. The agent calls a set of tools to examine each case in depth and from several angles: machine-learning prediction, statistical analysis, and retrieval of similar past patients. The LLM then integrates this evidence into an outcome prediction, a severity assessment, and a report of its uncertainty. The manuscript is under review.

### My contribution

I designed a uniform interface for the agent: a harness that assembles the prompt dynamically from each tool's call schema, the system prompt, and the user prompt. New tools can be plugged in without rewriting the agent, and the framework can be carried over to other clinical problems.

I also reframed patient retrieval. Instead of matching patients by text similarity, I used contrastive learning to build an embedding space in which patients are arranged by outcome, so that neighbors tend to recover in similar ways. This made the retrieved cases more stable, and the evidence the LLM received more consistent.

Clinical outcome assessment is not purely objective: the same case can be graded differently depending on how a clinician weighs theory against experience, and much of that reasoning is never written down. To reflect this, I designed the context to be less prescriptive. Rather than ordering the LLM toward an answer, it makes this uncertainty explicit, which gives the agent a way to balance caution and autonomy, something I consider central to designing clinical agents.

### Thoughts and next steps

The core difficulty is a mismatch between features and labels. All inputs are captured at admission; the label is assigned at discharge. What happens in between, including hematoma expansion, treatment response and complications, is unobserved. Patients with near-identical admission profiles reach different outcomes, and in our analysis real outcomes were markedly more dispersed than predictions within the same tool-signal region. This sets a ceiling that further modeling of the admission snapshot cannot lift, and suggests such systems should be evaluated on how faithfully they represent outcome uncertainty, not only on exact-grade accuracy.

A natural extension is to model prognosis as a trajectory rather than an endpoint: generating a distribution over a patient's future states (hematoma volume, GCS, complications) and updating it as new observations arrive. This requires longitudinal data and trajectory-level evaluation, but better matches how prognosis is actually revised in clinical care.