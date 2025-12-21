package handlers

import (
	"encoding/json"
	"net/http"
	"regexp"

	"backend/internal/constants"
	"backend/internal/models"
	"backend/internal/service"
	"backend/pkg/utils"
)

// RegisterRequest 注册请求结构
type RegisterRequest struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

// LoginRequest 登录请求结构
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// AuthResponse 认证响应结构
type AuthResponse struct {
	Token string       `json:"token"`
	User  models.User  `json:"user"`
}

// registerHandler 用户注册
func registerHandler(w http.ResponseWriter, r *http.Request) {
	// 1. 解析 request body
	// request（json的字节数据流） --> 我们自己定义的数据结构 RegisterRequest
	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.SendErrorResponse(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	// 2. 验证请求体内容是否valid
	// 验证输入
	if req.Username == "" || req.Email == "" || req.Password == "" {
		utils.SendErrorResponse(w, http.StatusBadRequest, "Username, email and password are required")
		return
	}

	// 验证邮箱格式
	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	if !emailRegex.MatchString(req.Email) {
		utils.SendErrorResponse(w, http.StatusBadRequest, constants.ErrInvalidEmail)
		return
	}

	// 验证密码长度
	if len(req.Password) < constants.MinPasswordLength {
		utils.SendErrorResponse(w, http.StatusBadRequest, constants.ErrPasswordTooShort)
		return
	}

	if len(req.Password) > constants.MaxPasswordLength {
		utils.SendErrorResponse(w, http.StatusBadRequest, "Password is too long")
		return
	}

	// 3. 加密密码
	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		utils.SendErrorResponse(w, http.StatusInternalServerError, "Failed to hash password")
		return
	}

	// 4. 创建用户
	user := &models.User{
		Username:     req.Username,
		Email:        req.Email,
		PasswordHash: hashedPassword,
	}

	// 5. 保存到数据库
	if err := service.CreateUser(user); err != nil {
		utils.SendErrorResponse(w, http.StatusConflict, err.Error())
		return
	}

	// 6. 生成JWT token
	token, err := utils.GenerateToken(user.ID)
	if err != nil {
		utils.SendErrorResponse(w, http.StatusInternalServerError, "Failed to generate token")
		return
	}

	// 7. 返回响应
	response := AuthResponse{
		Token: token,
		User:  *user,
	}
	utils.SendSuccessResponse(w, response)
}

// loginHandler 用户登录
func loginHandler(w http.ResponseWriter, r *http.Request) {
	// 1. 解析请求体
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.SendErrorResponse(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// 2. 验证输入
	if req.Email == "" || req.Password == "" {
		utils.SendErrorResponse(w, http.StatusBadRequest, "Email and password are required")
		return
	}

	// 3. 查找用户
	user, err := service.GetUserByEmail(req.Email)
	if err != nil {
		utils.SendErrorResponse(w, http.StatusUnauthorized, "Invalid email or password")
		return
	}

	// 4. 验证密码
	if err := utils.CheckPassword(user.PasswordHash, req.Password); err != nil {
		utils.SendErrorResponse(w, http.StatusUnauthorized, "Invalid email or password")
		return
	}

	// 5. 生成JWT token
	token, err := utils.GenerateToken(user.ID)
	if err != nil {
		utils.SendErrorResponse(w, http.StatusInternalServerError, "Failed to generate token")
		return
	}

	// 6. 返回响应
	response := AuthResponse{
		Token: token,
		User:  *user,
	}
	utils.SendSuccessResponse(w, response)
}

