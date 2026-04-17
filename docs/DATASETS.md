# Dataset Survey

Public clickbait- and manipulation-labeled corpora evaluated for LUCID training.

## Recommended training stack

1. **Pretraining / weak supervision:** Webis Clickbait Corpus 2017 (primary) + Stop Clickbait 2016 (secondary)
2. **Auxiliary signal:** FakeNewsNet for optional multi-task learning
3. **Primary fine-tuning set:** Custom LUCID TikTok/Reddit corpus (~1,500–2,000 examples) labeled by Claude with Lindsay-validated gold subset
4. **Citation hygiene:** Always cite original papers, not Kaggle mirrors

---

## 1. Webis Clickbait Corpus 2017 — **PRIMARY**

- **Citation:** Potthast, M., Gollub, T., Komlossy, K., Schuster, S., Wiegmann, M., Garces Fernandez, E. P., Hagen, M., & Stein, B. (2018). Crowdsourcing a large corpus of clickbait on Twitter. *COLING*, 1498–1507. https://aclanthology.org/C18-1127/
- **Size:** ~38,517 tweets (19,538 training split + validation + test)
- **Labels:** Continuous clickbait score (MTurk mean over 4-point scale) + discretized class. Includes post text, linked article text, and media.
- **URL:** https://webis.de/data/webis-clickbait-17.html · https://zenodo.org/record/5530410
- **License:** Research use (Zenodo + Webis corpus policy)
- **Why primary:** Human-labeled with inter-annotator data preserved. Short social-style text closer to our domain than news headlines. Continuous severity score aligns with our scoring task.

## 2. Stop Clickbait (Chakraborty et al. 2016) — SECONDARY

- **Citation:** Chakraborty, A., Paranjape, B., Kakarla, S., & Ganguly, N. (2016). Stop Clickbait: Detecting and preventing clickbaits in online news media. *ASONAM*, 9–16. https://doi.org/10.1109/ASONAM.2016.7752207
- **Size:** ~32,000 headlines (16K clickbait / 16K non-clickbait, class-balanced)
- **Labels:** Binary (clickbait vs. non-clickbait), headline-level
- **URL:** https://github.com/bhargaviparanjape/clickbait · Kaggle mirror: https://www.kaggle.com/datasets/amananandrai/clickbait-dataset
- **License:** Academic use (MIT on several mirrors — verify per-mirror)
- **Notes:** Headlines only (no body), English only. Labels are source-level heuristics rather than per-item adjudication → biases classifier toward source-stylistic cues. Best for transfer learning / weak supervision, not ground truth for our 6 axes.

## 3. FakeNewsNet (Shu et al. 2020) — AUXILIARY

- **Citation:** Shu, K., Mahudeswaran, D., Wang, S., Lee, D., & Liu, H. (2020). FakeNewsNet: A data repository with news content, social context, and spatiotemporal information. *Big Data*, 8(3), 171–188. https://doi.org/10.1089/big.2019.0062
- **Size:** ~23,000 articles (PolitiFact + GossipCop) + linked Twitter engagement
- **Labels:** Binary (real/fake) at article level; rich social-context metadata
- **URL:** https://github.com/KaiDMML/FakeNewsNet
- **License:** Research use; tweet IDs require rehydration under Twitter/X terms
- **Notes:** Not clickbait per se — fact-check oriented. Useful as auxiliary multi-task signal: fake-news items correlate with outrage/FOMO/emotional manipulation.

## 4. Fake News Challenge (FNC-1) — NOT RECOMMENDED

- **Citation:** Hanselowski et al. (2018). A retrospective analysis of the Fake News Challenge stance-detection task. *COLING*, 1859–1874. https://aclanthology.org/C18-1158/
- **Size:** ~75,000 headline–article pairs
- **Labels:** Stance (agrees/disagrees/discusses/unrelated)
- **URL:** https://github.com/FakeNewsChallenge/fnc-1
- **Notes:** Stance detection is orthogonal to manipulation scoring. **Skip** — included here only for completeness.

## 5. TikTok / Short-Video Caption Corpora

**Gap finding:** no widely adopted, peer-reviewed, manipulation-labeled TikTok corpus exists at the scale of news-clickbait corpora.

Closest available:
- TikTok-Trends / hashtag scrapes on HuggingFace and Kaggle (unlabeled or weakly labeled)
- MultiBully / cyberbullying short-text corpora (adjacent but off-target)
- Paper-specific releases (e.g., Medina Serrano et al. 2020 on TikTok political content) — small, ad hoc

**Implication for LUCID:**
The absence of a native short-video manipulation corpus is itself a methodological contribution opportunity. Our approach:
1. Pretrain on Webis 2017 + Stop Clickbait
2. LLM-judge-label an in-domain TikTok + Reddit caption sample along the 6 LUCID dimensions
3. Report inter-annotator agreement on the LLM-judge labels vs. a human gold subset as a core evaluation artifact

This is the honest and defensible framing for the technical report.
