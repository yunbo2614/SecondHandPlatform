package middleware

import (
	"context"
	"net/http"
	"strings"

	"backend/pkg/utils"
)

// AuthMiddleware 认证中间件
// 验证 JWT Token 并将 userID 放入 Context
func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// 1. 从请求头获取 Authorization
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			utils.SendErrorResponse(w, http.StatusUnauthorized, "Missing authorization header")
			return
		}

		// 2. 提取 Token（格式：Bearer <token>）
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			utils.SendErrorResponse(w, http.StatusUnauthorized, "Invalid authorization format")
			return
		}
		tokenString := parts[1]

		// 3. 验证 Token
		claims, err := utils.ValidateToken(tokenString)
		if err != nil {
			utils.SendErrorResponse(w, http.StatusUnauthorized, "Invalid or expired token")
			return
		}

		// 4. 将 userID 存入 Context，传递给后续的 handler
		ctx := context.WithValue(r.Context(), "userID", claims.UserID)

		// 5. 调用下一个 handler
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
