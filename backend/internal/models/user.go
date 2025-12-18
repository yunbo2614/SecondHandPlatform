// models/user.go
package models

type User struct {
    ID           int       `json:"id" gorm:"primaryKey"`
    Username     string    `json:"username"`
    Email        string    `json:"email"`
    PasswordHash string    `json:"-"` // 不返回给前端
    CreatedAt    time.Time `json:"created_at"`
}