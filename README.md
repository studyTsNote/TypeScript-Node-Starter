# TypeScript Node Starter

[原英文文档](README.EN.md)

**在线访问地址**： [https://typescript-node-starter.azurewebsites.net/](https://typescript-node-starter.azurewebsites.net/)

该项目的主要目的是展示用 TypeScript 编写 Node 项目的步骤和工作流程。我们将尽可能地保持更新，同时也鼓励并欢迎社区做出贡献和提出改进建议。

> fork 此项目仅为了小组学习 TypeScript 使用

# 目录

- [准备工作](#准备工作)
- [开始](#开始)
- [TypeScript + Node](#typescript--node)
	- [安装TypeScript](#安装Typescript)
	- [项目结构](#项目结构)
	- [项目的构建](#项目的构建)
	- [类型声明文件（`.ds.ts`）](#类型声明文件（.ds.ts）)
	- [调试](#调试)
	- [测试](#测试)
	- [ESLint](#eslint)
- [依赖](#依赖)
	- [`dependencies`](#dependencies-1)
	- [`devDependencies`](#devdependencies)
- [Hackathon Starter Project](#hackathon-starter-project)

# 准备工作
在本地构建和运行应用，你需要预先安装以下东西：
- [Node.js](https://nodejs.org/en/)
- [MongoDB](https://docs.mongodb.com/manual/installation/)
- [VS Code](https://code.visualstudio.com/)

# 开始
克隆代码库
```sh
git clone --depth=1 https://github.com/Microsoft/TypeScript-Node-Starter.git <project_name>
```

安装依赖
```sh
cd <project_name>
npm install
```

配置 MongoDB
```bash
# 创建 db 目录
sudo mkdir -p /data/db
# 给上读/写权限
sudo chmod 777 /data/db

# 从 macOS 10.15 开始，即使管理员也无法在根目录下创建目录
# 所以还是把 db 目录建在用户目录下吧
mkdir -p ~/data/db
# 用户自己目录下的东西，自动就有读/写权限
```

启动 mongodb
```bash
mongod

# 或者这样
mongod --dbpath ~/data/db
```

构建和运行程序
```bash
npm run build
npm start
```
如果你正在使用 VS Code，你可以快键键 `cmd + shift + b` 来运行默认的构建任务（其实还是 `npm run build`），然后调出命令面板（`cmd + shift + p`）选择 `Tasks: Run Task` \> `npm: start` 来执行 `npm start`。 

> **关于编辑器！**— TypeScript  在[任何编辑器](http://www.typescriptlang.org/index.html#download-links)中都有强大的支持，只是本项目使用 [VS Code](https://code.visualstudio.com/) 的预先配置。在整个 README 中，我们将尝试找出 VS Code 真正令人眼前一亮的独特之处。

最后，打开浏览器，访问`http://localhost:3000`即可。

# TypeScript + Node
把 TypeScript 引入到 Express 项目，需要做出哪些修改呢？在接下来的几个章节中，我将展示给你看。请注意，该项目的所有配置不是只在这里有用，它可以随时用作其他 Node.js 项目向 TypeScript 迁移的参考。

## 安装 TypeScript
仅需 `npm`，就可把 TypeScript 加到项目中来
```sh
npm install -D typescript
```

如果你使用的是 VS Code，那你走运了！VS Code 会检测并使用你安装在 `node_modules` 下的 TypeScript 版本。对于其他编辑器，请确保你安装了对应的 [TypeScript 插件](http://www.typescriptlang.org/index.html#download-links)。

## 项目结构
TypeScript + Node 项目与普通的 Node 项目最明显的不同之处就在于目录结构。在 TypeScript 项目中，最好是要划分为 _source_  和 _distributable_ 两类文件（即，源码文件和待发布文件）。以 `.ts` 结尾的 TypeScript 文件放在 `src` 目录下，而编译后产生的 `.js` 文件则会输出到 `dist` 目录下。`test` 和 `views` 目录依然放在根目录下。

本应用的完整目录结构解释，见下表：

> **注意！** 请确保你已经执行了 `npm run build` 构建了应用

| 文件夹名称 | 描述 |
| ------------------------ | --------------------------------------------------------------------------------------------- |
| **.vscode**              | 存放 VS Code 特定配置                                     |
| **dist**                 | 存放构建输出文件，即最后的发布文件 |
| **node_modules**         | 存放所有的 npm 依赖                                              |
| **src**                  | 存放源码文件                       |
| **src/config**           | 存放 passport 认证策略和登录中间件，或其他的复杂配置 |
| **src/controllers**      | 各种 Controller，用来响应 http 请求 |
| **src/models**           | 模型（Mongoose schema），用于从 MongoDB 中存取数据 |
| **src/public**           | 客户端用到的静态资源                                       |
| **src/types**            | 存放在 DefinitelyTyped 中找不到的 `.d.ts` 文件。详情见这个[章节](#type-definition-dts-files) |
| **src**/server.ts        | express 应用的入口文件                                                       |
| **test**                 | 由于测试代码构建过程和源码不同，所以拿出来单独存放 |
| **views**                | 应用在客户端渲染的视图代码。这里我们使用了 pug 模板引擎 |
| .env.example             | API keys, tokens, 密码, 数据库链接地址。拷一份到 `.env` 填上自己的配置，记住别发布到公共代码库里哦 |
| .travis.yml              | Travis CI 配置文件                                                        |
| .copyStaticAssets.ts     | 一个拷贝图片、字体和 JS 库到 dist 目录的脚本 |
| jest.config.js           | Jest 配置文件，运行 TS 编写的测试代码   |
| package.json             | 定义 npm 依赖和[构建命令](#what-if-a-library-isnt-on-definitelytyped)         |
| tsconfig.json            | TypeScript 的编译配置            |
| .eslintrc                | ESLint 配置，代码风格的规范检查                         |
| .eslintignore            | 配置一些不想要被检查的地方                      |

## 项目的构建
If you're concerned about compile time, the main watch task takes ~2s to refresh.（这什么鬼意思？看不懂 OTZ）

### TypeScript 编译配置
TypeScript 使用 `tsconfig.json` 文件来调整项目编译选项。来让我们一探究竟——首先看到的就是 `compilerOptions`，它详细描述了项目是如何被编译的：

```json
"compilerOptions": {
    "module": "commonjs",
    "esModuleInterop": true,
    "target": "es6",
    "noImplicitAny": true,
    "moduleResolution": "node",
    "sourceMap": true,
    "outDir": "dist",
    "baseUrl": ".",
    "paths": {
        "*": [
            "node_modules/*",
            "src/types/*"
        ]
    }
},
```

| `compilerOptions` | 描述 |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `"module": "commonjs"`             | Node 使用便是 commonjs，那我们也用它 |
| `"esModuleInterop": true,`         | 打开 ES6 的模块导入语法：`import foo from 'foo';`       |
| `"target": "es6"`                  | 编译输出的语言级别。Node 是支持 ES6 的，那我们就指定为 ES6 |
| `"noImplicitAny": true`            | 启用一个严格设置：当使用 any 作为默认值时，就会报错 |
| `"moduleResolution": "node"`       | TypeScript 尝试模仿 Node 的模块解析策略。详细说明看[这里](https://www.typescriptlang.org/docs/handbook/module-resolution.html#node)。 |
| `"sourceMap": true`                | 我们想要 `source map` 和源码一起输出。至于为什么，请看[调试](#debugging)章节 |
| `"outDir": "dist"`                 | 指定编译输出的路径                                               |
| `"baseUrl": "."`                   | 模块解析的配置。详见[路径映射章节](#installing-dts-files-from-definitelytyped) |
| `paths: {...}`                     | 模块解析的配置。详见[路径映射章节](#installing-dts-files-from-definitelytyped) |

接下来 `tsconfig.json` 定义了 TypeScript 的项目上下文，即哪些地方需要编译：
```json
"include": [
    "src/**/*"
]
```
`include` 包含了一组文件匹配规则。这个项目非常简单，因为我们所有的 `.ts` 文件都在 `src` 目录下。对于更复杂的情况，你可以再添加一个 `exclude` ，用于从 `include` 匹配到的集合中排除特定的文件。除此之外，还有一个 `files` 选项，一个文件名一个文件名的去指定，该配置将覆盖 `include` 和 `exclude`。


### 运行构建
所有的构建步骤都是通过 [npm scripts](https://docs.npmjs.com/misc/scripts) 编写的。Npm 脚本允许我们通过 npm 调用终端命令。由于大多数 JavaScript 工具都有方便使用的命令行程序，从而让我们不需要 `grunt` 或 `gulp` 也可管理构建过程。只需从命令行运行 `npm run <script-name>` 就可以调用脚本命令。你可能注意到了，npm 脚本可以相互调用，这可以让我们把一些简单的单个构建脚本轻松组成复杂的构建脚本。以下是该项目所有的可用脚本列表：


| Npm Script | Description |
| ------------------------- | :------------------------------------------------------------------------------------------------ |
| `start`                   | 其实是调用了 `npm run serve`                      |
| `build`                   | 完整构建。执行全部的构建任务（`build-sass`, `build-ts`, `lint`, `copy-static-assets`） |
| `serve`                   | `node dist/server.js` 启动应用          |
| `watch-node`              | 使用 nodemon 运行 `server.js`，检测到代码修改会自动重启服务 |
| `watch`                   | 执行全部的监视任务（TypeScript, Sass, Node） |
| `test`                    | 使用 Jest 执行测试任务                                              |
| `watch-test`              | 监视模式下，执行测试任务                                                              |
| `build-ts`                | 编译所有源码 `.ts ` 文件为 `.js` 并输出到 `dist` 文件夹 |
| `watch-ts`                | 监视 `.ts` 文件的改动，并实时编译 |
| `build-sass`              | 编译所有的 `.scss` 文件为 `.css`                               |
| `watch-sass`              | 监视 `.scss` 文件的改动，并实时编译 |
| `lint`                    | 运行 ESLint，进行代码检查                                                 |
| `copy-static-assets`      | 调用静态资源拷贝脚本                   |
| `debug`                   | 完整构建项目，并在监视模式下，启动应用                  |
| `serve-debug`             | 传入 `--inspect` 参数，启动应用                                       |
| `watch-debug`             | 比 `watch` 多个 debug 参数 `--inspect` |

## 类型声明文件（`.d.ts`）
TypeScript 使用 `.d.ts` 文件为那些不是用 TypeScript 编写的 JS 库提供类型声明。只要你有 `.d.ts` 文件，TypeScript 就可以对库进行类型检查，从而在编辑器方面为你提供更棒的支持。所有流行库的 `.d.ts` 文件都维护在 [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types) 。

> **注意！**因为我们使用了`"noImplicitAny": true`，所以需要为每个用到的库提供一个 `.d.ts` 文件。虽然可以将 `noImplicitAny` 设置为`false` 来忽略有关丢失 `.d.ts` 文件的错误，但是最好的做法是为每个库提供一个 `.d.ts` 文件。（即使 `.d.ts` 文件是啥都不写！）

### 从 DefinitelyTyped 安装 `.d.ts` 文件
For the most part, you'll find `.d.ts` files for the libraries you are using on DefinitelyTyped.
These `.d.ts` files can be easily installed into your project by using the npm scope `@types`.
For example, if we want the `.d.ts` file for jQuery, we can do so with `npm install --save-dev @types/jquery`.

> **Note!** Be sure to add `--save-dev` (or `-D`) to your `npm install`. `.d.ts` files are project dependencies, but only used at compile time and thus should be dev dependencies.

In this template, all the `.d.ts` files have already been added to `devDependencies` in `package.json`, so you will get everything you need after running your first `npm install`.
Once `.d.ts` files have been installed using npm, you should see them in your `node_modules/@types` folder.
The compiler will always look in this folder for `.d.ts` files when resolving JavaScript libraries.

### What if a library isn't on DefinitelyTyped?
If you try to install a `.d.ts` file from `@types` and it isn't found, or you check DefinitelyTyped and cannot find a specific library, you will want to create your own `.d.ts file`.
In the `src` folder of this project, you'll find the `types` folder which holds the `.d.ts` files that aren't on DefinitelyTyped (or weren't as of the time of this writing).

#### Setting up TypeScript to look for `.d.ts` files in another folder
The compiler knows to look in `node_modules/@types` by default, but to help the compiler find our own `.d.ts` files we have to configure path mapping in our `tsconfig.json`.
Path mapping can get pretty confusing, but the basic idea is that the TypeScript compiler will look in specific places, in a specific order when resolving modules, and we have the ability to tell the compiler exactly how to do it.
In the `tsconfig.json` for this project you'll see the following:
```json
"baseUrl": ".",
"paths": {
    "*": [
        "node_modules/*",
        "src/types/*"
    ]
}
```
This tells the TypeScript compiler that in addition to looking in `node_modules/@types` for every import (`*`) also look in our own `.d.ts` file location `<baseUrl>` + `src/types/*`.
So when we write something like:
```ts
import * as flash from "express-flash";
```
First the compiler will look for a `d.ts` file in `node_modules/@types` and then when it doesn't find one look in `src/types` and find our file `express-flash.d.ts`.

#### Using `dts-gen`
Unless you are familiar with `.d.ts` files, I strongly recommend trying to use the tool [dts-gen](https://github.com/Microsoft/dts-gen) first.
The [README](https://github.com/Microsoft/dts-gen#dts-gen-a-typescript-definition-file-generator) does a great job explaining how to use the tool, and for most cases, you'll get an excellent scaffold of a `.d.ts` file to start with.
In this project, `bcrypt-nodejs.d.ts`, `fbgraph.d.ts`, and `lusca.d.ts` were all generated using `dts-gen`.

#### Writing a `.d.ts` file
If generating a `.d.ts` using `dts-gen` isn't working, [you should tell me about it first](https://www.surveymonkey.com/r/LN2CV82), but then you can create your own `.d.ts` file.

If you just want to silence the compiler for the time being, create a file called `<some-library>.d.ts` in your `types` folder and then add this line of code:
```ts
declare module "<some-library>";
```
If you want to invest some time into making a great `.d.ts` file that will give you great type checking and IntelliSense, the TypeScript website has great [docs on authoring `.d.ts` files](http://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html).

#### Contributing to DefinitelyTyped
The reason it's so easy to get great `.d.ts` files for most libraries is that developers like you contribute their work back to DefinitelyTyped.
Contributing `.d.ts` files is a great way to get into the open source community if it's something you've never tried before, and as soon as your changes are accepted, every other developer in the world has access to your work.

If you're interested in giving it a shot, check out the [guidance on DefinitelyTyped](https://github.com/definitelyTyped/DefinitelyTyped/#how-can-i-contribute).
If you're not interested, [you should tell me why](https://www.surveymonkey.com/r/LN2CV82) so we can help make it easier in the future!

### Summary of `.d.ts` management
In general if you stick to the following steps you should have minimal `.d.ts` issues;
1. After installing any npm package as a dependency or dev dependency, immediately try to install the `.d.ts` file via `@types`.
2. If the library has a `.d.ts` file on DefinitelyTyped, the install will succeed and you are done.
If the install fails because the package doesn't exist, continue to step 3.
3. Make sure you project is [configured for supplying your own `d.ts` files](#setting-up-typescript-to-look-for-dts-files-in-another-folder)
4. Try to [generate a `.d.ts` file with dts-gen](#using-dts-gen).
If it succeeds, you are done.
If not, continue to step 5.
5. Create a file called `<some-library>.d.ts` in your `types` folder.
6. Add the following code:
```ts
declare module "<some-library>";
```
7. At this point everything should compile with no errors and you can either improve the types in the `.d.ts` file by following this [guide on authoring `.d.ts` files](http://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html) or continue with no types.
8. If you are still having issues, let me know by sending me an email or pinging me on twitter, I will help you.

## 调试
Debugging TypeScript is exactly like debugging JavaScript with one caveat, you need source maps.

### Source maps
Source maps allow you to drop break points in your TypeScript source code and have that break point be hit by the JavaScript that is being executed at runtime.

> **Note!** - Source maps aren't specific to TypeScript.
Anytime JavaScript is transformed (transpiled, compiled, optimized, minified, etc) you need source maps so that the code that is executed at runtime can be _mapped_ back to the source that generated it.

The best part of source maps is when configured correctly, you don't even know they exist! So let's take a look at how we do that in this project.

#### 配置 source maps
First you need to make sure your `tsconfig.json` has source map generation enabled:
```json
"compilerOptions" {
    "sourceMap": true
}
```
With this option enabled, next to every `.js` file that the TypeScript compiler outputs there will be a `.map.js` file as well.
This `.map.js` file provides the information necessary to map back to the source `.ts` file while debugging.

> **Note!** - It is also possible to generate "inline" source maps using `"inlineSourceMap": true`.
This is more common when writing client side code because some bundlers need inline source maps to preserve the mapping through the bundle.
Because we are writing Node.js code, we don't have to worry about this.

### VS Code 的调试器
Debugging is one of the places where VS Code really shines over other editors.
Node.js debugging in VS Code is easy to setup and even easier to use.
This project comes pre-configured with everything you need to get started.

When you hit `F5` in VS Code, it looks for a top level `.vscode` folder with a `launch.json` file.
In this file, you can tell VS Code exactly what you want to do:
```json
{
    "type": "node",
    "request": "attach",
    "name": "Attach by Process ID",
    "processId": "${command:PickProcess}",
    "protocol": "inspector"
}
```
This is mostly identical to the "Node.js: Attach by Process ID" template with one minor change.
We added `"protocol": "inspector"` which tells VS Code that we're using the latest version of Node which uses a new debug protocol.

With this file in place, you can hit `F5` to attach a debugger.
You will probably have multiple node processes running, so you need to find the one that shows `node dist/server.js`.
Now just set your breakpoints and go!

## 测试
For this project, I chose [Jest](https://facebook.github.io/jest/) as our test framework.
While Mocha is probably more common, Mocha seems to be looking for a new maintainer and setting up TypeScript testing in Jest is wicked simple.

### 安装工具
To add TypeScript + Jest support, first install a few npm packages:
```
npm install -D jest ts-jest
```
`jest` is the testing framework itself, and `ts-jest` is just a simple function to make running TypeScript tests a little easier.

### 配置 Jest
Jest's configuration lives in `jest.config.js`, so let's open it up and add the following code:
```js
module.exports = {
    globals: {
        'ts-jest': {
            tsConfigFile: 'tsconfig.json'
        }
    },
    moduleFileExtensions: [
        'ts',
        'js'
    ],
    transform: {
        '^.+\\.(ts|tsx)$': './node_modules/ts-jest/preprocessor.js'
    },
    testMatch: [
        '**/test/**/*.test.(ts|js)'
    ],
    testEnvironment: 'node'
};
```
Basically we are telling Jest that we want it to consume all files that match the pattern `"**/test/**/*.test.(ts|js)"` (all `.test.ts`/`.test.js` files in the `test` folder), but we want to preprocess the `.ts` files first.
This preprocess step is very flexible, but in our case, we just want to compile our TypeScript to JavaScript using our `tsconfig.json`.
This all happens in memory when you run the tests, so there are no output `.js` test files for you to manage.

### 运行测试
只需执行 `npm run test` 。
执行完毕后，会生成一份测试的覆盖范围报告。

## ESLint
ESLint 是一个代码检查工具，主要用于找出有问题的代码和规范代码风格。

### ESLint 规则
像大多数检查工具一样，ESLint 有大量的可配置规则集，并且支持自定义规则集。所有规则都通过 `.eslintrc` 文件（支持`json`、`js` 和 `yaml`）进行配置。在此项目中，我们使用了相对基本的规则集，没有其他自定义规则。

### 运行 ESLint
和其他构建命令一样，我通过 npm 脚本调用 ESLint。

```sh
npm run build   // 完整构建任务，包含 ESLint
npm run lint    // 仅仅运行 ESLint 任务
```
注意：ESLint 不是监视任务的一部分。

如果你想看到 ESLint 的实时反馈，那我强烈推荐你安装 [VS Code ESLint 扩展](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)。

# 依赖
我们通过 `package.json` 管理第三方依赖。在该文件中，你能看到这两部分：

## `dependencies`

| 依赖包名                         | 描述                                                           |
| ------------------------------- | --------------------------------------------------------------------- |
| async                           | Utility library that provides asynchronous control flow.               |
| bcrypt-nodejs                   | Library for hashing and salting user passwords.                       |
| bluebird                        | Promise library                                                       |
| body-parser                     | Express 4 middleware.                                                 |
| compression                     | Express 4 middleware.                                                 |
| connect-mongo                   | MongoDB session store for Express.                                    |
| dotenv                          | Loads environment variables from .env file.                            |
| errorhandler                    | Express 4 middleware.                                                 |
| express                         | Node.js web framework.                                                |
| express-flash                    | Provides flash messages for Express.                                   |
| express-session                 | Express 4 middleware.                                                 |
| express-validator               | Easy form validation for Express.                                     |
| fbgraph                         | Facebook Graph API library.                                           |
| lodash                          | General utility library.                                              |
| lusca                           | CSRF middleware.                                                      |
| mongoose                        | MongoDB ODM.                                                          |
| nodemailer                      | Node.js library for sending emails.                                   |
| passport                        | Simple and elegant authentication library for node.js                 |
| passport-facebook               | Sign-in with Facebook plugin.                                         |
| passport-local                  | Sign-in with Username and Password plugin.                            |
| pug (jade)                      | Template engine for Express.                                          |
| request                         | Simplified HTTP request library.                                       |
| request-promise                 | Promisified HTTP request library. Let's us use async/await             |
| winston                         | Logging library                                                       |

## `devDependencies`

| 依赖包名                         | 描述                                                            |
| ------------------------------- | ---------------------------------------------------------------------- |
| @types                          | Dependencies in this folder are `.d.ts` files used to provide types    |
| chai                            | Testing utility library that makes it easier to write tests            |
| concurrently                    | Utility that manages multiple concurrent tasks. Used with npm scripts  |
| jest                            | Testing library for JavaScript.                                        |
| node-sass                       | Allows to compile .scss files to .css                                  |
| nodemon                         | Utility that automatically restarts node process when it crashes       |
| supertest                       | HTTP assertion library.                                                |
| ts-jest                         | A preprocessor with sourcemap support to help use TypeScript with Jest.|
| ts-node                         | Enables directly running TS files. Used to run `copy-static-assets.ts` |
| eslint                          | Linter for JavaScript and TypeScript files                             |
| typescript                      | JavaScript compiler/type checker that boosts JavaScript productivity   |

To install or update these dependencies you can use `npm install` or `npm update`.

# Hackathon Starter Project
A majority of this quick start's content was inspired or adapted from Sahat's excellent [Hackathon Starter project](https://github.com/sahat/hackathon-starter).

## 证书
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the [MIT](LICENSE) License.
