package service

import (
	// "fmt"
	// "reflect"

	"backend/internal/models"
	// "backend/internal/constants"
	// "backend/internal/database"

	// "github.com/olivere/elastic/v7"
	"time"
)

var users = []models.User{} // empty slice

// AddUser adds a new user to in-memory storage
func AddUser(u *models.User) (bool, error) { // u is a pointer to a User struct.The * means it’s a pointer.
	// Return values: (bool, error), bool -> true if the user was successfully added, false if not (e.g., username exists)
    // error → returns an actual system error if something goes wrong

	// Check if username exists
	for _, user := range users {
		if user.Username == u.Username {
			return false, nil
		}
	}

	// Assign ID and timestamp
	u.ID = len(users) + 1 // len(users) gives the number of elements currently in the slice.
	u.CreatedAt = time.Now() // Sets the creation time of the user to the current system time

	users = append(users, *u) // adds a new element to the slice
	return true, nil
}