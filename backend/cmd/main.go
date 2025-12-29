package main

import (
	"fmt"
	"log"
	"net/http"

	"backend/internal/config"
	"backend/internal/database"
	"backend/internal/handlers"
)

func main() {
	fmt.Println("🚀 Starting SecondHand Platform Server...")

	// 1. 加载配置文件 (.env)
	config.LoadConfig()
	fmt.Println("✅ Configuration loaded")
	fmt.Printf("   - Database: %s:%s\n", config.AppConfig.DBHost, config.AppConfig.DBPort)
	fmt.Printf("   - Server Port: %s\n", config.AppConfig.ServerPort)

	// 2. 初始化数据库连接
	if err := database.InitPostgreSQL(); err != nil {
		log.Fatalf("❌ Failed to initialize PostgreSQL: %v", err)
	}
	defer database.CloseDB()

	// 3. 初始化 GCS
	if err := database.InitGCS(); err != nil {
		log.Fatalf("❌ Failed to initialize GCS: %v", err)
	}
	fmt.Println("✅ GCS initialized")

	// 4. 初始化路由
	router := handlers.InitRouter()
	fmt.Println("✅ Router initialized")

	// 5. 启动 HTTP 服务器
	port := config.AppConfig.ServerPort //8080
	fmt.Printf("🌐 Server listening on http://localhost:%s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, router))
}