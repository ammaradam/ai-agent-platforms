export type Project = {
  name: string; repo: string; tagline: string; summary: string; stack: string[];
  highlights: string[]; status: string; featured?: boolean; demo?: string;
};

export const PROJECTS: Project[] = [
  {
    name: 'agent-gateway-playground',
    repo: 'https://github.com/ammaradam/agent-gateway-playground',
    demo: 'https://agent-gateway-playground.vercel.app',
    tagline: 'Break an AI agent on purpose, and watch every step.',
    summary: 'A Microsoft Agent Framework agent calls tools through a mock agent gateway. Flip a switch, such as a lost response, a missing idempotency key or a tool that returns a wrong 200, and watch the request move through the system as an animated trace with an outcome at the end. It turns the ideas in these posts into things you can test.',
    stack: ['Python', 'Microsoft Agent Framework', 'FastAPI', 'React', 'TypeScript', 'Vercel'],
    highlights: [
      'Real Agent Framework agent, with a function middleware that routes every tool call through the gateway',
      'Scripted planner, so every run is repeatable and needs no API key',
      'Three scenarios: timeouts and retries, who may delete a record, and a 200 that is wrong',
      'Animated flow with play, pause, step, scrub and speed, plus a trace waterfall',
      'Add a scenario by writing one small planner and one list of toggles',
    ],
    status: 'Active',
    featured: true,
  },
  {
    name: 'mlops-toolbox',
    repo: 'https://github.com/ammaradam/MLOps-Toolbox',
    tagline: 'A model that carries its own contract from training to production.',
    summary: 'A Python library built around contract propagation. Registering a model stores its input schema, evaluation report, reference data and baseline predictions; serving, batch scoring, drift checks and CI gates read that contract instead of being configured separately.',
    stack: ['Python 3.11', 'pydantic', 'mypy --strict', 'uv'],
    highlights: [
      'Typed /predict that rejects requests outside the contract with a 422',
      'Drift checks against baselines stored at registration, no training data needed',
      'CI quality gates such as mt gate "f1_macro>=0.85" that exit 0 or 1',
      'mt ship builds a self-contained, deployable folder',
      'Backend-agnostic interfaces, local-first with a single file-based store',
    ],
    status: 'Active',
    featured: true,
  },
  {
    name: 'pos-classifier',
    repo: 'https://github.com/ammaradam/pos-classifier',
    tagline: 'An end-to-end text classification service with a human-review loop.',
    summary: 'Classifies retail point-of-sale product descriptions into product groups with a fine-tuned BERT-tiny model. Low-confidence predictions go to human review, corrections feed a retraining trigger, and a dashboard tracks accuracy against verified labels.',
    stack: ['Python', 'BERT-tiny', 'FastAPI', 'MLflow', 'Prometheus', 'Streamlit', 'Docker'],
    highlights: [
      'Single and batch prediction endpoints with confidence and review flag',
      'Feedback endpoint and a retraining trigger once enough labels arrive',
      'MLflow tracking and model registry stage transitions',
      'Streamlit monitoring of per-class accuracy and the review queue',
    ],
    status: 'Prototype',
    featured: true,
  },
  {
    name: 'RAG-Toolbox',
    repo: 'https://github.com/ammaradam/RAG-Toolbox',
    tagline: 'Chat with a PDF using retrieval-augmented generation.',
    summary: 'A Streamlit app that chunks and embeds an uploaded PDF into Qdrant and answers questions within that context using LlamaIndex.',
    stack: ['Streamlit', 'Qdrant', 'LlamaIndex', 'FastEmbed'],
    highlights: [],
    status: 'Experiment, 2024',
  },
  {
    name: 'Plain-Background-Remover',
    repo: 'https://github.com/ammaradam/Plain-Background-Remover',
    tagline: 'Swap a plain image background for another image.',
    summary: 'A small computer vision command-line tool.',
    stack: ['Python', 'OpenCV'],
    highlights: [],
    status: 'Experiment, 2022',
  },
];
