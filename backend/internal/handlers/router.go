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
	router.HandleFunc("/register", registerHandler).Methods("POST", "OPTIONS")
	router.HandleFunc("/login", loginHandler).Methods("POST", "OPTIONS")

	// ========================================
	// 受保护的路由（需要登录）
	// ========================================
	// 创建受保护的子路由器
	protected := router.PathPrefix("/").Subrouter()
	
	// 应用认证中间件到所有受保护的路由
	protected.Use(middleware.AuthMiddleware)

	// 商品相关路由（需要认证）
	protected.HandleFunc("/items", getPostsHandler).Methods("GET", "OPTIONS")             // 浏览所有商品（需要登录）
	protected.HandleFunc("/item/{id}", getPostByIDHandler).Methods("GET", "OPTIONS")      // 获取商品详情
	protected.HandleFunc("/item/{id}", editPostHandler).Methods("PUT", "OPTIONS")         // 更新商品
	protected.HandleFunc("/item/{id}", deletePostHandler).Methods("DELETE", "OPTIONS")    // 删除商品（软删除）
	protected.HandleFunc("/mylistings", myListingsHandler).Methods("GET", "OPTIONS")      // 我的商品列表

	// 上传相关路由（需要认证）
	protected.HandleFunc("/upload", uploadNewPostHandler).Methods("POST", "OPTIONS")      // 上传新商品（含图片）

	return router
}