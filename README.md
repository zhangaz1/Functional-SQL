# Functional-SQL
Functional SQL



#代码运行向导



##安装环境


- 下载安装node（ version >= 0.12 ）([http://nodejs.org](http://nodejs.org "node官网"))

- 安装版自动会安装npm

- 命令行中执行下面命令，全局安装gulp、mocha：

```
npm install -g gulp
```

```
npm install -g mocha
```

- 命令行切换到代码根目录（30_WsDev）执行依赖包安装：

```
npm install
```

如果过程中出现问题（网络不好造成安装失败），可以重复尝试一下，若总是失败，可以解压node_modules.zip到当前目录来用。



##运行测试和hint等


运行测试：

```
gulp test
```

运行hint：

```
gulp hint
```


##运行代码

命令行进入***src目录中***，执行下面命令

```
node index.js 'testData.txt'
```

其中最后一个为输入数据的文件。
