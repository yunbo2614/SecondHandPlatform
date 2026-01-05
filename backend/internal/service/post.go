package service

import (
	"fmt"

	"backend/internal/database"
	"backend/internal/models"
)

// GetPostsRequest 获取商品列表请求参数
type GetPostsRequest struct {
	Page     int // 页码，从1开始
	PageSize int // 每页数量
}

// GetPostsResponse 获取商品列表响应
type GetPostsResponse struct {
	Posts      []models.Post `json:"posts"`
	TotalCount int64         `json:"total_count"` // 总数量
	Page       int           `json:"page"`        // 当前页码
	PageSize   int           `json:"page_size"`   // 每页数量
	TotalPages int           `json:"total_pages"` // 总页数
}

// GetPosts 获取商品列表（分页）
func GetPosts(req GetPostsRequest) (*GetPostsResponse, error) {
	db := database.GetDB()

	// 1. 设置默认值
	if req.Page < 1 {
		req.Page = 1
	}
	if req.PageSize < 1 {
		req.PageSize = 8 // 默认每页8个
	}

	// 2. 计算偏移量
	offset := (req.Page - 1) * req.PageSize

	// 3. 查询总数量
	var totalCount int64
	if err := db.Model(&models.Post{}).
		Where("status = ?", "active"). // 只查询状态为active的商品
		Count(&totalCount).Error; err != nil {
		return nil, err
	}

	// 4. 查询分页数据（包含用户信息）
	var posts []models.Post
	if err := db.Preload("User"). // 预加载用户信息
		Where("status = ?", "active").
		Order("created_at DESC"). // 按创建时间倒序
		Limit(req.PageSize).
		Offset(offset).
		Find(&posts).Error; err != nil {
		return nil, err
	}

	// 5. 计算总页数
	totalPages := int(totalCount) / req.PageSize
	if int(totalCount)%req.PageSize != 0 {
		totalPages++
	}

	return &GetPostsResponse{
		Posts:      posts,
		TotalCount: totalCount,
		Page:       req.Page,
		PageSize:   req.PageSize,
		TotalPages: totalPages,
	}, nil
}

// GetPostByID 根据ID获取商品详情
func GetPostByID(postID int) (*models.Post, error) {
	db := database.GetDB()

	var post models.Post
	// 查询指定ID的商品，并预加载用户信息
	if err := db.Preload("User").First(&post, postID).Error; err != nil {
		return nil, err
	}

	return &post, nil
}

// GetMyListingsRequest 获取我的商品列表请求参数
type GetMyListingsRequest struct {
	UserID   int // 用户ID
	Page     int // 页码，从1开始
	PageSize int // 每页数量
}

// GetMyListingsResponse 获取我的商品列表响应
type GetMyListingsResponse struct {
	Posts      []models.Post `json:"posts"`
	TotalCount int64         `json:"total_count"` // 总数量
	Page       int           `json:"page"`        // 当前页码
	PageSize   int           `json:"page_size"`   // 每页数量
	TotalPages int           `json:"total_pages"` // 总页数
}

// GetMyListings 获取我的商品列表（分页）
func GetMyListings(req GetMyListingsRequest) (*GetMyListingsResponse, error) {
	db := database.GetDB()

	// 1. 设置默认值
	if req.Page < 1 {
		req.Page = 1
	}
	if req.PageSize < 1 {
		req.PageSize = 6 // 默认每页6个
	}

	// 2. 计算偏移量
	offset := (req.Page - 1) * req.PageSize

	// 3. 查询总数量（该用户的商品，不包括deleted状态）
	var totalCount int64
	if err := db.Model(&models.Post{}).
		Where("user_id = ? AND status != ?", req.UserID, "deleted").
		Count(&totalCount).Error; err != nil {
		return nil, err
	}

	// 4. 查询分页数据
	var posts []models.Post
	if err := db.Preload("User").
		Where("user_id = ? AND status != ?", req.UserID, "deleted").
		Order("created_at DESC"). // 按创建时间倒序，最新的在前面
		Limit(req.PageSize).
		Offset(offset).
		Find(&posts).Error; err != nil {
		return nil, err
	}

	// 5. 计算总页数
	totalPages := int(totalCount) / req.PageSize
	if int(totalCount)%req.PageSize != 0 {
		totalPages++
	}

	return &GetMyListingsResponse{
		Posts:      posts,
		TotalCount: totalCount,
		Page:       req.Page,
		PageSize:   req.PageSize,
		TotalPages: totalPages,
	}, nil
}

// DeletePost 删除商品（软删除，只修改状态）
func DeletePost(postID int, userID int) error {
	db := database.GetDB()

	// 1. 先查询该商品是否存在
	var post models.Post
	if err := db.First(&post, postID).Error; err != nil {
		return err // 商品不存在
	}

	// 2. 验证该商品是否属于当前用户
	if post.UserID != userID {
		return fmt.Errorf("unauthorized: you can only delete your own posts")
	}

	// 3. 软删除：只修改 status 为 "deleted"
	// UpdatedAt 会自动更新（因为模型中有 gorm:"autoUpdateTime" 标签）
	if err := db.Model(&post).Update("status", "deleted").Error; err != nil {
		return err
	}

	return nil
}

// CreatePostRequest 创建商品请求
type CreatePostRequest struct {
	UserID      int      // 用户ID
	Title       string   // 标题
	Description string   // 描述
	Price       float64  // 价格
	ContactInfo string   // 联系方式
	ZipCode     string   // 邮编
	Negotiable  bool     // 是否可议价
	ImageURLs   []string // 图片URL数组
}

// CreatePost 创建新商品
func CreatePost(req CreatePostRequest) (*models.Post, error) {
	db := database.GetDB()

	// 1. 创建 Post 对象
	post := models.Post{
		UserID:      req.UserID,
		Title:       req.Title,
		Description: req.Description,
		Price:       req.Price,
		ContactInfo: req.ContactInfo,
		ZipCode:     req.ZipCode,
		Negotiable:  req.Negotiable,
		ImageURLs:   req.ImageURLs,
		Status:      "active", // 默认状态为 active
	}

	// 2. 保存到数据库
	if err := db.Create(&post).Error; err != nil {
		return nil, err
	}

	// 3. 预加载用户信息
	if err := db.Preload("User").First(&post, post.ID).Error; err != nil {
		return nil, err
	}

	return &post, nil
}

// UpdatePostRequest 更新商品请求
type UpdatePostRequest struct {
	PostID      int     // 商品ID
	UserID      int     // 用户ID（用于权限验证）
	Title       string  // 标题
	Description string  // 描述
	Price       float64 // 价格
}

// UpdatePost 更新商品信息（只允许修改title, description, price）
func UpdatePost(req UpdatePostRequest) (*models.Post, error) {
	db := database.GetDB()

	// 1. 先查询该商品是否存在
	var post models.Post
	if err := db.First(&post, req.PostID).Error; err != nil {
		return nil, err // 商品不存在
	}

	// 2. 验证该商品是否属于当前用户
	if post.UserID != req.UserID {
		return nil, fmt.Errorf("unauthorized: you can only edit your own posts")
	}

	// 3. 更新允许修改的字段
	updates := map[string]interface{}{
		"title":       req.Title,
		"description": req.Description,
		"price":       req.Price,
	}

	if err := db.Model(&post).Updates(updates).Error; err != nil {
		return nil, err
	}

	// 4. 重新加载更新后的数据（包含用户信息）
	if err := db.Preload("User").First(&post, req.PostID).Error; err != nil {
		return nil, err
	}

	return &post, nil
}

// TODO: 实现其他商品相关的业务逻辑
