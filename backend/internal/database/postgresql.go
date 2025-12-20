package database

import (
	"fmt"
	"log"

	"backend/internal/config"
	"backend/internal/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// db 全局数据库连接实例
var db *gorm.DB

// InitPostgreSQL 初始化PostgreSQL数据库连接
func InitPostgreSQL() error {
	// 1. 构建数据库连接字符串 (DSN)
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		config.AppConfig.DBHost,
		config.AppConfig.DBPort,
		config.AppConfig.DBUser,
		config.AppConfig.DBPassword,
		config.AppConfig.DBName,
	)

	// 2. 连接数据库
	var err error
	db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}

	log.Println("✅ Connected to PostgreSQL database")

	// 3. 自动迁移数据库表（根据模型创建表）
	if err := db.AutoMigrate(&models.User{}, &models.Post{}); err != nil {
		return fmt.Errorf("failed to migrate database: %w", err)
	}

	log.Println("✅ Database migration completed")

	return nil
}

// GetDB 获取数据库连接实例
func GetDB() *gorm.DB {
	return db
}

// CloseDB 关闭数据库连接
func CloseDB() error {
	if db != nil {
		sqlDB, err := db.DB()
		if err != nil {
			return err
		}
		return sqlDB.Close()
	}
	return nil
}
