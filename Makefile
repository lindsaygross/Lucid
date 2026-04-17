.PHONY: help install data label gold-set features train evaluate experiment dev-backend dev-frontend deploy clean

help:
	@echo "LUCID — common commands"
	@echo ""
	@echo "Setup:"
	@echo "  make install         Install Python dependencies"
	@echo ""
	@echo "Data pipeline:"
	@echo "  make data            Scrape Reddit + fetch Webis + Stop Clickbait + TikTok samples"
	@echo "  make label           Run Claude labeling pipeline on full corpus"
	@echo "  make gold-set        Launch Gradio labeler for 100-post human validation"
	@echo "  make agreement       Compute inter-annotator agreement (Claude vs Lindsay)"
	@echo "  make features        Build features for classical model"
	@echo ""
	@echo "Training + eval:"
	@echo "  make train-naive     Train naive keyword baseline"
	@echo "  make train-classical Train XGBoost classical model"
	@echo "  make train-deep      Train DistilBERT (CPU fallback; use Colab notebook for GPU)"
	@echo "  make evaluate        Evaluate all 3 models on held-out test set"
	@echo "  make experiment      Run engagement correlation + noise robustness experiments"
	@echo ""
	@echo "Dev servers:"
	@echo "  make dev-backend     Start FastAPI on :8000"
	@echo "  make dev-frontend    Start Next.js on :3000"
	@echo ""
	@echo "Housekeeping:"
	@echo "  make clean           Remove caches, build artifacts"

install:
	pip install -r requirements.txt

data:
	python -m scripts.fetch_datasets
	python -m scripts.scrape_reddit
	python -m scripts.scrape_tiktok

label:
	python -m scripts.label_with_claude

gold-set:
	python -m scripts.gold_set_labeler

agreement:
	python -m scripts.agreement_stats

features:
	python -m scripts.build_features

train-naive:
	python -m scripts.train_naive

train-classical:
	python -m scripts.train_classical

train-deep:
	python -m scripts.train_deep

evaluate:
	python -m scripts.evaluate

experiment:
	python -m scripts.run_experiment

dev-backend:
	uvicorn app:app --reload --port 8000

dev-frontend:
	cd frontend && npm run dev

clean:
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name .pytest_cache -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name .ruff_cache -exec rm -rf {} + 2>/dev/null || true
	rm -rf .mypy_cache
