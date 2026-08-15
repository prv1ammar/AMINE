from mangum import Mangum

from app.main import app

# Netlify invokes this function at /.netlify/functions/api/*. netlify.toml's
# redirect rewrites incoming requests to include that prefix; this strips it
# back off so the path FastAPI sees matches what it sees locally under uvicorn
# (e.g. /api/v1/products, /health).
handler = Mangum(app, api_gateway_base_path="/.netlify/functions/api")
