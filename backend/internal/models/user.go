package models

import "time"

// User 用户模型
type User struct {
	ID           int       `json:"id" gorm:"primaryKey;autoIncrement"`
	Username     string    `json:"username" gorm:"unique;not null;size:50"`
	Email        string    `json:"email" gorm:"unique;not null;size:100"`
	PasswordHash string    `json:"-" gorm:"not null;size:255"` // 不返回给前端
	CreatedAt    time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt    time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}

// TableName 指定表名
func (User) TableName() string {
	return "users"
}