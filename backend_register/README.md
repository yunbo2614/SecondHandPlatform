# Backend

二手物品交易平台后端服务

## 技术栈
- Go 1.21+
- PostgreSQL
- Gin Web Framework

## 项目结构
```
backend/
├── cmd/              # 程序入口
├── internal/         # 内部代码
│   ├── handlers/     # HTTP处理器
│   ├── models/       # 数据模型
│   ├── service/      # 业务逻辑
│   └── database/     # 数据库连接
└── pkg/              # 公共工具
```

## 开发计划
- [ ] 用户注册/登录
- [ ] 商品发布
- [ ] 商品列表
- [ ] 图片上传
