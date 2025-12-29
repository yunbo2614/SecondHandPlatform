package database

import (
	"context"
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"time"

	"backend/internal/config"

	"cloud.google.com/go/storage"
)

var gcsClient *storage.Client

// InitGCS 初始化 Google Cloud Storage 客户端
func InitGCS() error {
	ctx := context.Background()

	var client *storage.Client
	var err error

	// 如果配置了凭证文件路径，使用文件认证（本地开发）
	if config.AppConfig.GoogleCredentialsPath != "" {
		// 设置环境变量（推荐方式）
		os.Setenv("GOOGLE_APPLICATION_CREDENTIALS", config.AppConfig.GoogleCredentialsPath)
	}

	// 使用 Application Default Credentials
	// 优先级：环境变量 > 服务账号（GCP上）> gcloud 配置
	client, err = storage.NewClient(ctx)
	if err != nil {
		return fmt.Errorf("failed to create GCS client: %w", err)
	}

	gcsClient = client
	return nil
}

// UploadFile 上传文件到 GCS
func UploadFile(file multipart.File, fileHeader *multipart.FileHeader) (string, error) {
	ctx := context.Background()

	// 1. 生成唯一的文件名（使用时间戳 + 原文件名）
	timestamp := time.Now().Unix()
	ext := filepath.Ext(fileHeader.Filename)
	filename := fmt.Sprintf("%d_%s%s", timestamp, "image", ext)

	// 2. 获取 bucket
	bucket := gcsClient.Bucket(config.AppConfig.GCSBucket)

	// 3. 创建文件对象
	obj := bucket.Object(filename)
	writer := obj.NewWriter(ctx)

	// 4. 设置文件元数据
	writer.ContentType = fileHeader.Header.Get("Content-Type")

	// 5. 复制文件内容到 GCS
	if _, err := io.Copy(writer, file); err != nil {
		writer.Close()
		return "", fmt.Errorf("failed to upload file: %w", err)
	}

	// 6. 关闭 writer
	if err := writer.Close(); err != nil {
		return "", fmt.Errorf("failed to close writer: %w", err)
	}

	// 7. 返回文件的公开 URL
	// 格式：https://storage.googleapis.com/bucket-name/filename
	url := fmt.Sprintf("https://storage.googleapis.com/%s/%s", config.AppConfig.GCSBucket, filename)
	return url, nil
}

// DeleteFile 从 GCS 删除文件
func DeleteFile(filename string) error {
	ctx := context.Background()

	bucket := gcsClient.Bucket(config.AppConfig.GCSBucket)
	obj := bucket.Object(filename)

	if err := obj.Delete(ctx); err != nil {
		return fmt.Errorf("failed to delete file: %w", err)
	}

	return nil
}
