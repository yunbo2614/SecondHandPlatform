package handlers

import (
	"backend/internal/middleware"

	"github.com/gorilla/mux"
)

// InitRouter 初始化路由
// 注意，这里只是注册路由，不是真正实际运行时的调用过程
// router 是用来构建调用链的
func InitRouter() *mux.Router {
	router := mux.NewRouter()

	// 应用 CORS 中间件到所有路由（必须放在最前面）
	router.Use(middleware.CORSMiddleware)

	// ========================================
	// 公开路由（不需要登录）
	// ========================================
	router.HandleFunc("/register", registerHandler).Methods("POST")
	router.HandleFunc("/login", loginHandler).Methods("POST")
	// router.HandleFunc("/posts", getPostsHandler).Methods("GET") // 浏览所有商品（公开）

	// ========================================
	// 受保护的路由（需要登录）
	// ========================================
	// 创建受保护的子路由器
	protected := router.PathPrefix("/").Subrouter()
	
	// 应用认证中间件到所有受保护的路由
	protected.Use(middleware.AuthMiddleware)

	// 商品相关路由（需要认证）
	// protected.HandleFunc("/posts", createPostHandler).Methods("POST")           // 发布商品
	// protected.HandleFunc("/posts/{id}", getPostByIDHandler).Methods("GET")      // 获取商品详情
	// protected.HandleFunc("/posts/{id}", updatePostHandler).Methods("PUT")       // 更新商品
	// protected.HandleFunc("/posts/{id}", deletePostHandler).Methods("DELETE")    // 删除商品
	// protected.HandleFunc("/my-listings", myListingsHandler).Methods("GET")      // 我的商品列表

	// 上传相关路由（需要认证）
	// protected.HandleFunc("/upload", uploadImageHandler).Methods("POST")         // 上传图片

	return router
}