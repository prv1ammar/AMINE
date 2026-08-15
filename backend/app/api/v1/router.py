from fastapi import APIRouter

from app.api.v1 import admin, auth, collections, inquiries, lookbook_entries, newsletter, products, social_images

api_router = APIRouter()
api_router.include_router(products.router)
api_router.include_router(collections.router)
api_router.include_router(inquiries.router)
api_router.include_router(newsletter.router)
api_router.include_router(social_images.router)
api_router.include_router(lookbook_entries.router)
api_router.include_router(auth.router)
api_router.include_router(admin.router)
