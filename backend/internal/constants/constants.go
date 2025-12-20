package constants

// ========================================
// 商品状态常量
// ========================================
const (
	PostStatusActive  = "active"  // 在售
	PostStatusSold    = "sold"    // 已售出
	PostStatusDeleted = "deleted" // 已删除
)

// ========================================
// 用户角色常量
// ========================================
const (
	RoleUser  = "user"  // 普通用户
	RoleAdmin = "admin" // 管理员
)

// ========================================
// 响应状态常量
// ========================================
const (
	StatusSuccess = "success"
	StatusError   = "error"
)

// ========================================
// 限制常量
// ========================================
const (
	// 文件上传限制
	MaxFileSize    = 10 * 1024 * 1024 // 10MB
	MaxImageCount  = 5                // 最多上传5张图片
	
	// 字符串长度限制
	MaxTitleLength       = 200 // 商品标题最大长度
	MaxDescriptionLength = 2000 // 商品描述最大长度
	MinPasswordLength    = 6   // 密码最小长度
	MaxPasswordLength    = 50  // 密码最大长度
	
	// 价格限制
	MinPrice = 0.01   // 最低价格 0.01 元
	MaxPrice = 999999 // 最高价格
)

// ========================================
// 错误消息常量
// ========================================
const (
	// 用户相关错误
	ErrUserNotFound      = "User not found"
	ErrUserAlreadyExists = "User already exists"
	ErrInvalidEmail      = "Invalid email format"
	ErrInvalidPassword   = "Invalid password"
	ErrPasswordTooShort  = "Password must be at least 6 characters"
	
	// 认证相关错误
	ErrUnauthorized     = "Unauthorized access"
	ErrInvalidToken     = "Invalid or expired token"
	ErrMissingAuthToken = "Missing authorization token"
	
	// 商品相关错误
	ErrPostNotFound   = "Post not found"
	ErrInvalidPrice   = "Invalid price"
	ErrTitleTooLong   = "Title is too long"
	ErrTooManyImages  = "Too many images"
	
	// 文件上传错误
	ErrFileTooLarge      = "File size exceeds limit"
	ErrInvalidFileType   = "Invalid file type"
	ErrUploadFailed      = "File upload failed"
)

// ========================================
// HTTP Header 常量
// ========================================
const (
	HeaderAuthorization = "Authorization"
	HeaderContentType   = "Content-Type"
)

// ========================================
// 内容类型常量
// ========================================
const (
	ContentTypeJSON = "application/json"
	ContentTypeForm = "multipart/form-data"
)

// ========================================
// JWT 相关常量
// ========================================
const (
	TokenPrefix = "Bearer "
	TokenExpiry = 24 // 小时
)
