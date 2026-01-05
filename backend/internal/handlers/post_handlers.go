package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"backend/internal/service"
	"backend/pkg/utils"

	"github.com/gorilla/mux"
)

// getPostsHandler 获取商品列表（支持分页）
// GET /items?page=1&page_size=8
func getPostsHandler(w http.ResponseWriter, r *http.Request) {
	// 1. 获取查询参数
	pageStr := r.URL.Query().Get("page")
	pageSizeStr := r.URL.Query().Get("page_size")

	// 2. 转换参数
	page := 1
	pageSize := 8 // 默认每页8个

	if pageStr != "" {
		if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
			page = p
		}
	}

	if pageSizeStr != "" {
		if ps, err := strconv.Atoi(pageSizeStr); err == nil && ps > 0 {
			pageSize = ps
		}
	}

	// 3. 调用 service 层获取数据
	resp, err := service.GetPosts(service.GetPostsRequest{
		Page:     page,
		PageSize: pageSize,
	})
	if err != nil {
		utils.SendErrorResponse(w, http.StatusInternalServerError, "Failed to get posts: "+err.Error())
		return
	}

	// 4. 返回成功响应
	utils.SendSuccessResponse(w, resp)
}

// getPostByIDHandler 根据ID获取商品详情
// GET /item/{id}
func getPostByIDHandler(w http.ResponseWriter, r *http.Request) {
	// 1. 从路径参数中获取 ID
	vars := mux.Vars(r)
	idStr := vars["id"]

	// 2. 转换为整数
	postID, err := strconv.Atoi(idStr)
	if err != nil {
		utils.SendErrorResponse(w, http.StatusBadRequest, "Invalid post ID")
		return
	}

	// 3. 调用 service 层获取商品详情
	post, err := service.GetPostByID(postID)
	if err != nil {
		// 如果找不到商品，返回404
		utils.SendErrorResponse(w, http.StatusNotFound, "Post not found")
		return
	}

	// 4. 返回成功响应
	utils.SendSuccessResponse(w, post)
}

// myListingsHandler 获取我的商品列表
// GET /mylistings?page=1&page_size=6
func myListingsHandler(w http.ResponseWriter, r *http.Request) {
	// 1. 从 Context 中获取用户ID（由 AuthMiddleware 设置）
	userID, ok := r.Context().Value("userID").(int)
	if !ok {
		utils.SendErrorResponse(w, http.StatusUnauthorized, "User not authenticated")
		return
	}

	// 2. 获取查询参数
	pageStr := r.URL.Query().Get("page")
	pageSizeStr := r.URL.Query().Get("page_size")

	// 3. 转换参数
	page := 1
	pageSize := 6 // 默认每页6个

	if pageStr != "" {
		if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
			page = p
		}
	}

	if pageSizeStr != "" {
		if ps, err := strconv.Atoi(pageSizeStr); err == nil && ps > 0 {
			pageSize = ps
		}
	}

	// 4. 调用 service 层获取数据
	resp, err := service.GetMyListings(service.GetMyListingsRequest{
		UserID:   userID,
		Page:     page,
		PageSize: pageSize,
	})
	if err != nil {
		utils.SendErrorResponse(w, http.StatusInternalServerError, "Failed to get my listings: "+err.Error())
		return
	}

	// 5. 返回成功响应
	utils.SendSuccessResponse(w, resp)
}

// deletePostHandler 删除商品（软删除）
// DELETE /item/{id}
func deletePostHandler(w http.ResponseWriter, r *http.Request) {
	// 1. 从 Context 中获取用户ID
	userID, ok := r.Context().Value("userID").(int)
	if !ok {
		utils.SendErrorResponse(w, http.StatusUnauthorized, "User not authenticated")
		return
	}

	// 2. 从路径参数中获取 ID
	vars := mux.Vars(r)
	idStr := vars["id"]

	// 3. 转换为整数
	postID, err := strconv.Atoi(idStr)
	if err != nil {
		utils.SendErrorResponse(w, http.StatusBadRequest, "Invalid post ID")
		return
	}

	// 4. 调用 service 层删除商品
	err = service.DeletePost(postID, userID)
	if err != nil {
		// 判断错误类型
		if err.Error() == "record not found" {
			utils.SendErrorResponse(w, http.StatusNotFound, "Post not found")
			return
		}
		if err.Error() == "unauthorized: you can only delete your own posts" {
			utils.SendErrorResponse(w, http.StatusForbidden, "You can only delete your own posts")
			return
		}
		utils.SendErrorResponse(w, http.StatusInternalServerError, "Failed to delete post: "+err.Error())
		return
	}

	// 5. 返回成功响应
	utils.SendSuccessWithMessage(w, "Post deleted successfully", nil)
}

// editPostHandler 编辑商品信息
// PUT /edit/{id}
func editPostHandler(w http.ResponseWriter, r *http.Request) {
	// 1. 从 Context 中获取用户ID
	userID, ok := r.Context().Value("userID").(int)
	if !ok {
		utils.SendErrorResponse(w, http.StatusUnauthorized, "User not authenticated")
		return
	}

	// 2. 从 URL 中获取商品ID
	vars := mux.Vars(r)
	postIDStr := vars["id"]
	postID, err := strconv.Atoi(postIDStr)
	if err != nil {
		utils.SendErrorResponse(w, http.StatusBadRequest, "Invalid post ID")
		return
	}

	// 3. 解析请求体
	var req struct {
		Title       string  `json:"title"`
		Description string  `json:"description"`
		Price       float64 `json:"price"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.SendErrorResponse(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// 4. 验证必填字段
	if req.Title == "" || req.Price <= 0 {
		utils.SendErrorResponse(w, http.StatusBadRequest, "Title and valid price are required")
		return
	}

	// 5. 调用 service 层更新商品
	post, err := service.UpdatePost(service.UpdatePostRequest{
		PostID:      postID,
		UserID:      userID,
		Title:       req.Title,
		Description: req.Description,
		Price:       req.Price,
	})
	if err != nil {
		// 判断错误类型
		if err.Error() == "record not found" {
			utils.SendErrorResponse(w, http.StatusNotFound, "Post not found")
			return
		}
		if err.Error() == "unauthorized: you can only edit your own posts" {
			utils.SendErrorResponse(w, http.StatusForbidden, "You can only edit your own posts")
			return
		}
		utils.SendErrorResponse(w, http.StatusInternalServerError, "Failed to update post: "+err.Error())
		return
	}

	// 6. 返回成功响应
	utils.SendSuccessWithMessage(w, "Post updated successfully", post)
}

// TODO: 实现其他商品相关的 handlers
