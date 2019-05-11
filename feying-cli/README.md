## [Feying-cli]

`Feying` 是一个使用 TypeScript 开发小程序的前端框架。框架使用webpack进行项目的编译, 这样也就支持了npm package 和 postcss等前端必备工具库.
为小程序带来了更加接近前端web的开发体验.

`Feying-cli` 是为 `Feying` 框架提供的 `cli` 工具, 提供了创建项目, 创建界面等功能.

## install
```
npm i -g feying-cli
```

## 当前版本提供的功能
```
create [options] <app-name>  create a new miniApp project
init [options]               create a new miniApp in currnet dir

add page 添加一个新的界面 (ts版本支持)
```

## example
```
feying create demo
```

## 注意 
使用小程序IDE打开项目的时候请选择dist文件夹

## 完整功能

- 初始化工程
  - -t typescript false
  - -n 始化git  true
  - -d 输出文件夹名字 dist
  - -a appid
  - -s sentry
  - -l tea log
  - -i lint
- 创建界面 add page 需要判断项目是否使用了ts
  - 是否使用awex false
  - 是否创建css true
- 创建组件 add component
- 创建模板 add tempalte 
- 创建状态管理   add awex
  - -p 添加到界面
  - -m 添加model
  - -t 使用ts
- 增加代码检查 add lint

