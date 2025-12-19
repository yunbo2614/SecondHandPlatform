package main

import (
	"fmt" // fmt provides functions for formatted I/O (input/output), like printing to the console or reading input.
	"log" // log is a built-in logging package in Go. It provides simple functions to log messages, errors, or fatal conditions.
	"net/http" // net/http provides HTTP client and server implementations
	           // HTTP server listens on a port and responds to incoming HTTP requests.Receives requests from clients (e.g., Postman, frontend)
			   // HTTP Client sends requests to external services or APIs
	"backend/internal/handlers" // import internal package
)

func main() {
	fmt.Println("started-service") // Print a startup message to the console so we know the service has started


	// TODO: Initialize database connections here
	// InitPostgreSQLBackend()
	// InitGCSBackend()

	log.Fatal(http.ListenAndServe(":7070", handlers.InitRouter())) // Start HTTP server
	// Start the HTTP server on port 7070
	// handlers.InitRouter() calls the InitRouter function from the handlers package create and configure a new HTTP router that directs incoming requests to the appropriate handler functions for the service.
	// http.ListenAndServe block starts a web server that listens for incoming HTTP requests
	// log.Fatal prints the error and terminates the program
}