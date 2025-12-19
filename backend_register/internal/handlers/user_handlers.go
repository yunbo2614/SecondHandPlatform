package handlers

import (
	"encoding/json"
    // Provides functionality to encode and decode JSON data.
	// Used to read the JSON body of incoming HTTP requests (e.g., signup data)
	// and to send JSON responses back to the client.

	"net/http"
    // Provides HTTP server and client implementations and start the HTTP server.

	// "fmt"

	"regexp"
    // Provides regular expression matching.
	// Used to validate user input, e.g., checking that usernames match a certain pattern.

	// "time"


	"backend/internal/models"
    // Imports the internal models package.
	// Provides the data structures and other database models used by handlers.

	"backend/internal/service"
    // Imports the internal service package.
    // The service folder contains the code that enforces the rules and behavior of the application, 
    // determining how data is processed, validated, and stored to support the handlers.


	// jwt "github.com/form3tech-oss/jwt-go"

	"golang.org/x/crypto/bcrypt"
    // Provides the bcrypt password hashing algorithm.
    // bcrypt converts a plain-text password into a one-way, irreversible hash.
	// Used to securely hash user passwords before storing them in the database.
)

// SignupHandler handles user registration (signup) requests
func SignupHandler(w http.ResponseWriter, r *http.Request) { 
    // r stands for “request”, and w stands for “response writer”
    // http.ResponseWriter and *http.Request are standard in Go HTTP handlers

    // 1. Ensure the request method is POST
    // Signup should only accept POST requests because it creates a new resource
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed) // http.StatusMethodNotAllowed == 405
		return // return immediately exits the function. No code below it runs. Send the error response and stop here.
	}

    // 2. Tell the client that the response will be in JSON format
    w.Header().Set("Content-Type", "application/json")
    // w is your response writer (http.ResponseWriter)
    // w.Header() gives you access to the HTTP headers that will be sent in the response
    // HTTP headers are key-value pairs that describe metadata about the HTTP response
    // Set assigns a value to a header key. Header().Set("Header-Name", "Header-Value")
    // If the header already exists, .Set overwrites it

    // 3. Declare a User struct to store the incoming request data
    var user models.User
    // Create a new variable called user that can hold all the information about a user, 
    // using the User struct defined in the models package.

    // 4. Decode JSON request body into the user struct
    // Example JSON: { "username": "test", "password": "123456" }
    if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
        http.Error(w, "Invalid request body", http.StatusBadRequest) // Sends an HTTP 400 Bad Request response to the client
        return
    }
    // json.NewDecoder(r.Body) creates a JSON decoder that reads from this request body (r.Body)
    // Decode(&user) reads the JSON data from the request body and maps it into the user variable, 
    // and returns an error if the JSON is invalid, malformed, or cannot be mapped to the struct.

    // 5. Validate input:
    // - Username and password must not be empty
    // - Username must match the allowed pattern (3–30 chars, letters, numbers, underscores)
    if user.Username == "" || user.Password == "" ||  // Checks if the user left the username or password empty in the request
        !regexp.MustCompile(`^[a-zA-Z0-9_]{3,30}$`).MatchString(user.Username) {
        http.Error(w, "Invalid username or password", http.StatusBadRequest)
        return
    }
    // MustCompile compiles a regex pattern into a Regexp object
    // If the pattern is invalid, MustCompile immediately stops the program
    // [a-zA-Z0-9_]: Allowed characters: lowercase letters, uppercase letters, digits, underscore
    // {3,30}: Length must be 3 to 30 characters

    // 6. Hash the input password using bcrypt
    hashedPassword, err := bcrypt.GenerateFromPassword(
        []byte(user.Password), // converts the user.Password string into a byte slice
        bcrypt.DefaultCost, // Determines how much computational effort is required to hash the password
    )
    if err != nil {
        http.Error(w, "Failed to hash password", http.StatusInternalServerError)
        return
    }

    // 7. Replace input password with hashed password
    // Only the hash will be stored in the database
    user.Password = string(hashedPassword)

    // 8. Call the service layer to add the user
    // The service handles business logic and data storage
    success, err := service.AddUser(&user) // AddUser is expected to return two values: success/err
    if err != nil {
        http.Error(w, "Failed to save user", http.StatusInternalServerError)
        return
    }

    // 9. If the user already exists, return an error
    if !success {
        http.Error(w, "User already exists", http.StatusBadRequest)
        return
    }

    // 10. Registration successful
    // Return HTTP 201 (Created) with a success message
    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(map[string]string{ 
        "message": "User registered successfully", // This is sent to the client as the response body
    })
    // json.NewEncoder(w) creates a JSON encoder that writes directly to the response (w)
    // .Encode(value) converts the given Go value into JSON and writes it to the response body
}

