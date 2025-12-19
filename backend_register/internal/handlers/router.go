package handlers

import (
    "net/http" 

    "github.com/gorilla/mux"   
)

func InitRouter() *mux.Router {
    router := mux.NewRouter() // create a new router
    router.HandleFunc("/signup", http.HandlerFunc(SignupHandler)).Methods("POST")   // register handler
    // router.Handle("/upload", http.HandlerFunc(uploadHandler)).Methods("POST") // register uploadHandler for POST /upload
    // router.Handle("/search", http.HandlerFunc(searchHandler)).Methods("GET") // register searchHandler for GET /search
    return router // router is a pointer, so no need to take address
}