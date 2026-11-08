"""
Application Configuration
"""
from pydantic_settings import BaseSettings
from typing import List
import json


class Settings(BaseSettings):
    # Database（環境変数または .env で必須設定。認証情報をコードに埋めない）
    DATABASE_URL: str
    
    # Security（環境変数または .env で必須設定。既知のデフォルト値は置かない）
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Application
    API_V1_PREFIX: str = "/api/v1"
    # CORS_ORIGINSは文字列として読み込み、後でリストに変換
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:3001"
    
    # QR Code
    QR_CODE_SIZE: int = 10
    QR_CODE_BORDER: int = 4
    
    @property
    def cors_origins_list(self) -> List[str]:
        """CORS_ORIGINSをリスト形式で取得"""
        if not self.CORS_ORIGINS or not self.CORS_ORIGINS.strip():
            return ["http://localhost:3000", "http://localhost:3001"]
        # JSON形式の文字列を試す
        try:
            parsed = json.loads(self.CORS_ORIGINS)
            if isinstance(parsed, list):
                return parsed
        except (json.JSONDecodeError, ValueError):
            pass
        # カンマ区切りの文字列として処理
        return [origin.strip() for origin in self.CORS_ORIGINS.split(',') if origin.strip()]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

if settings.SECRET_KEY == "your-secret-key-here-change-in-production":
    raise RuntimeError("SECRET_KEY must be changed from the known placeholder value")
