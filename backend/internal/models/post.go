package models

import (
	"time"

	"github.com/lib/pq"
)

// Post 商品帖子模型
type Post struct {
	ID          int            `json:"id" gorm:"primaryKey;autoIncrement"`
	UserID      int            `json:"user_id" gorm:"not null;index"`
	Title       string         `json:"title" gorm:"not null;size:200"`
	Description string         `json:"description" gorm:"type:text"`
	Price       float64        `json:"price" gorm:"not null"`
	ContactInfo string         `json:"contact_info" gorm:"not null;size:200"`
	ZipCode     string         `json:"zip_code" gorm:"not null;size:20"`
	Negotiable  bool           `json:"negotiable" gorm:"not null;default:false"`
	ImageURLs   pq.StringArray `json:"image_urls" gorm:"type:text[]"`
	Status      string         `json:"status" gorm:"default:'active';size:20"` // active, sold, deleted
	CreatedAt   time.Time      `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt   time.Time      `json:"updated_at" gorm:"autoUpdateTime"`

	// 关联
	User User `json:"user" gorm:"foreignKey:UserID"`
}

// TableName 指定表名
func (Post) TableName() string {
	return "posts"
}