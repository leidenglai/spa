# webapp Create in 2017-05-2
实现一个简洁的webapp单页面应用（webpack+zepto+es6）；

项目并不能直接使用，只是提供一个架构思路以供交流使用

# 环境
初始化 安装依赖包
```sh
npm install
```

# 开始
调试模式
```sh
npm start
```

# 构建
```sh
npm run build
```

# 移动端SPA 搭建 文档
## 概述
在移动端的时代，依赖于浏览器的Webapp越来越多。在Webapp中，又要数单页面架构体验最好，更像原生app。简单来说，不需要频繁切换网页，可以局部刷新，整个加载流畅度会好很多。
一般的SPA(Single page application)需要考虑很多方面：
1. 初始化
2. 路由监控
3. 开发调试
4. 性能优化
5. 打包上线

## 技术栈
1. Nodejs 、npm // 各插件基础、依赖包管理
2. Webpack // 前端资源模块化管理、开发、打包工具
3. Zepto.js // 简约JavaScript库，包含大部分jQuery库，类似jQuery API
4. Director.js // 简单的路由插件
5. iScroll.js // 页面滑动，拖动插件。主要用于传统流式布局滚动改为CSS3偏移滑动
6. Lodash.js // JS工具库，强大的辅助函数

### 资源
* npm包：https://www.npmjs.com
* Webpack中文文档：http://www.css88.com/doc/webpack2
* Webpack官网： [webpack](https://webpack.js.org/)
* Zepto.js git：https://github.com/madrobby/zepto
* Director.js git： https://github.com/flatiron/director
* iScroll git：https://github.com/cubiq/iscroll
* Lodash.js 中文文档： http://www.css88.com/doc/lodash/
* 国际化： [jQuery之前端国际化jQuery.i18n.properties - 飛雲若雪 - 博客园](http://www.cnblogs.com/sydeveloper/p/3729951.html)
* Less: [{less}](http://less.bootcss.com/)http://less.bootcss.com/

## 项目开始
本项目使用了npm作为包管理工具，所以入口文件为根目录下的 package.json。

Windows下使用cmd，mac启动terminal。cd到项目目录，然后执行`npm install`安装项目下的所有的依赖包，执行此命令 安装package.json中 devDependencies（开发环境）和dependencies（生产环境和测试环境）中的所有依赖包。

安装完成所有依赖包之后执行命令`npm start` 此命令执行package.json下的scripts.start的值：使用node执行build/dev.js启动项目。
**注意 ** ：npm 除了执行start、test、stop等几个可以简写，其他的自定义命令都需要在执行时写全 `npm run xxx` [npm scripts 使用指南](http://www.ruanyifeng.com/blog/2016/10/npm_scripts.html)

npm start 执行build/dev.js，启动nodejs调用webpack 构建开发环境等等，调用src/index.html和src/index.js，监听本地端口。具体webpack使用和配置另说。

## 入口文件
入口文件在webpack的 build/webpack.config.dev.js中配置，为先执行index.html，之后加载index.js文件。

### src/index.html
有两个注意的地方：
1. 屏幕尺寸适配使用rem，将布局和字体之类的单位由px改为rem;下面这段代码是根据不同的屏幕尺寸设定不同的rem基础依赖值，如iphone6是75px。
```
<script>
  /*
  * 按照宽高比例设定html字体, width=device-width initial-scale=0.5
  */
  !function(N,M){function L(){
  // ...
</script>
```
2. 界面的主要容器
```
  <!-- 主容器 -->
  <div id="container"></div>
  <!-- 主容器 end -->

  <!-- 底部导航 -->
  <div id="bottomNavbar"></div>
  <!-- 底部导航 end -->

  <!-- 全局消息提示 -->
  <div id="messageBox"></div>
  <!-- 全局消息提示 end -->

  <!-- 全局confirm -->
  <div id="confirmBox"></div>
  <!-- 全局confirm end -->

  <!-- 分享弹窗 -->
  <div id="sharePop"></div>
  <!-- 分享弹窗 end -->

```
这是整个应用的大概底层模块，所有的具体业务模块之后通过js添加到主容器container中。


###  src/index.js
index.js主要按顺序完成以下几件事：
1. 将公共插件暴露到全局，如iScroll、i18n（Zepto和$在webpack配置中已声明为全局）
2. initI18n 加载语言包,因为require函数太特别了，他是webpack底层用于加载模块，所以必须明确的声明模块名，require函数在这里只能接受字符串，不能接受变量；各种语言的css文件在存放在目录` src/css/lang/xx.less `
3. 加载和管理底部navbar
4.  **重点**
路由监控，加载路由配置文件`src/js/routes.js`，使用html5的 [HIstory API](https://developer.mozilla.org/zh-CN/docs/Web/API/History) 控制历史记录。
5. 处理页面各模块的层级关系。本项目模块逻辑设计为将各个业务模块放在各自的div中，然后放在主容器container中，通过display属性控制显示层。也就是说，只要点击过的界面，实例一直保存在moduleInstanceStack对象中，dom节点也保留在document中，除非刷新浏览器或者主动优化（内存占用太大，模块参数发生变化）
这样做的好处是能一直保存历史记录中的页面状态、快速翻页；

缺点是可能内存占用太大、各页面的实例隔离需要注意。

## 业务模块
通过监听到url，异步加载具体的业务模块
```
  "/store": (cb) => {
    require.ensure([], (require) => {
      // 加载控制器
      const Controller = require('js/app/store').default

      // 加载模板
      const template = require('tpl/store.html')
      cb(Controller, template)
    })
  },
```

[require.ensure](http://www.css88.com/doc/webpack2/guides/code-splitting-require/) ： webpack 在编译时，会静态地解析代码中的 require.ensure()，同时将模块添加到一个分开的 chunk （也就是一个单独的文件）当中。这个新的 chunk 会被 webpack 通过 jsonp 来按需加载。

然后是加载js逻辑代码和模板代码，实现简单的mvc结构；
回调中执行具体的业务逻辑。

业务模块规范：
```
import Main from 'utils/main'

/**
 * 商店列表页
 */
class StoreClass extends Main {
  // 构造函数，初始化工作
  constructor(templateHtml) {
      //继承公共方法
      super()
    // ...
  }
  // ....
  // 各种具体逻辑
  // 如init、事件绑定等

  destructor() {
    // 析构函数，销毁实例时执行
    // 垃圾处理，事件解绑等
    // ...
  }
}
export default StoreClass;
```

## CSS模块
使用纯 [Less](http://less.bootcss.com/) 方式编写css代码，Less 是一门 CSS 预处理语言，它扩充了 CSS 语言，增加了诸如变量、混合（mixin）、函数等功能，让 CSS 更易维护、方便制作主题、扩充。

### 模块管理
因为现阶段css代码较少，所以在初始化时将所有的css全部通过webpack以内联的方式加载在页面头部head标签内，主要模块`src/css/main.less`
### 布局 Flex
[flex介绍](http://www.ruanyifeng.com/blog/2015/07/flex-grammar.html)
因为只在手机浏览器中使用此项目，所以使用Flex布局模式，再在webpack中使用postcss插件解决浏览器兼容问题

### 尺寸 rem单位
[rem介绍](https://isux.tencent.com/web-app-rem.html)
在开发过程中还是照UI尺寸开发，之后使用webpack的postcss-px2rem插件自动转换为rem单位
### 动画 css3
 [CSS3 -w3school](http://www.w3school.com.cn/css3/)
所有动画用css3开发，灵活使用transition和animation。尽量不用js写动画，可以使用js控制Class来触发和改变动画效果。

## 模板文件
在路由模块中，通过require加载控制器的之后，还加载模板文件：
```
  ...
      // 加载模板
      const template = require('tpl/store.html')
  ...
```
在`tpl/store.html`中所有的html模块模板都是通过`<script></script>`包裹起来的，再通过`_.template()`函数转换后通过js动态添加到主容器中。
一个容器例子：
```
<script type="text/html" id="storeTmpl">
  <div id="storeContent" class="pageContainer">
    <!-- 具体模块代码 -->
    <!-- 变量写在“<%- 变量 %>”中，比如 -->
    <div><%- data.test %></div>
  </div>
</script>
```
js中加载模板时：
```
var html = _.template(that.templateHtml['storeTmpl'], { variable: 'data' })({ test: "这是一个例子" });

console.log(html)
// 输出：
// <div id="storeContent" class="pageContainer">
//    <!-- 具体模块代码 -->
//    <!-- 变量写在“<%- 变量 %>”中，比如 -->
//    <div>这是一个例子</div>
//  </div>

```
通过Zepto的文档操作方法将其添加到 document中；

项目底层已将模板代码解析过（解析逻辑位于index.js），将 `tpl/store.html`解析到that.templateHtml对象，对象每个键名对应script标签的id属性，值为模板代码。

