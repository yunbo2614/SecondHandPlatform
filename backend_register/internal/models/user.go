// models/user.go
package models

import "time"

type User struct {
    ID           int       `json:"id" gorm:"primaryKey"` 
    Username     string    `json:"username"`
    Email        string    `json:"email"`
    Password     string    `json:"password"`          // input only
    PasswordHash string    `json:"-" gorm:"column:password"` // stored hashed password
    CreatedAt    time.Time `json:"created_at"` // time.Time represents dates and timestamps in Go

    // GORM is a popular ORM (Object-Relational Mapping) library for Go. 
    // It converts the struct fields into columns in the relational database.
    // need GORM if you want to store data persistently in a relational database.
}
