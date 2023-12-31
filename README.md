# sample-oj-frontend

## 根据后台生成后端代码
```
openapi --input http://localhost:8102/api/v2/api-docs --output ./generated --client axios
```

## Project setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn serve
```

### Compiles and minifies for production
```
yarn build
```

### Lints and fixes files
```
yarn lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).


### 使用OPENAPI-TS自动生成接口文件
```
openapi --input http://localhost:8102/api/v2/api-docs --output ./generated --client axios
```