# AI Interview System

## Run

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
docker compose up -d
alembic upgrade head
uvicorn app.main:app --reload
```
