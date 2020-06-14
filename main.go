package main

import (
	"fmt"
	. "net"
	"net/http"
	"path/filepath"
	"runtime"
	"time"

	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	"github.com/tylerb/graceful"
)

const TIMEOUT = 5

var (
	_, b, _, _ = runtime.Caller(0)
	BASEPATH   = filepath.Dir(b)
)

func rootHandler(writer http.ResponseWriter, request *http.Request) {

}

func main() {
	m := chi.NewRouter()
	m.Use(middleware.Logger)
	m.HandleFunc("/", rootHandler)
	m.Route("/images", func(r chi.Router) {
		r.Handle("/*", http.FileServer(http.Dir(".")))
	})
	m.Handle("/*", http.FileServer(http.Dir(BASEPATH+"/static/")))

	listener, err := Listen("tcp", "127.0.0.1:8080")
	if err != nil {
		panic(err)
	}
	fmt.Println("listening on http://" + listener.Addr().String())
	panic(graceful.Serve(&http.Server{Handler: m}, listener, TIMEOUT*time.Second))
}
