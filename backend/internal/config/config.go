package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

// Config 应用配置结构
type Config struct {
	// Database
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string

	// JWT
	JWTSecret string

	// GCS
	GCSBucket              string
	GCSProjectID           string
	GoogleCredentialsPath  string

	// Server
	ServerPort string
}

var AppConfig *Config

// LoadConfig 加载配置
func LoadConfig() {
	// 加载.env文件
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	AppConfig = &Config{
		// Database
		DBHost:     getEnv("DB_HOST", "localhost"),
		DBPort:     getEnv("DB_PORT", "5432"),
		DBUser:     getEnv("DB_USER", "postgres"),
		DBPassword: getEnv("DB_PASSWORD", ""),
		DBName:     getEnv("DB_NAME", "secondhand"),

		// JWT
		JWTSecret: getEnv("JWT_SECRET", "your-secret-key-change-this"),

		// GCS
		GCSBucket:             getEnv("GCS_BUCKET", ""),
		GCSProjectID:          getEnv("GCS_PROJECT_ID", ""),
		GoogleCredentialsPath: getEnv("GOOGLE_APPLICATION_CREDENTIALS", ""),

		// Server
		ServerPort: getEnv("PORT", "8080"),
	}
}

// getEnv 获取环境变量，如果不存在则返回默认值
func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}
