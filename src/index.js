const path = require('path');
require('dotenv').config({path: path.join(__dirname, "../.env")});

var express = require('express')
var app = express()

// Cross-Origin Resource Sharingを有効にする記述（HTTPレスポンスヘッダの追加）
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Max-Age', '86400');
    next();
});

// OPTIONSメソッドの実装
app.options('*', function (req, res) {
    res.sendStatus(200);
});

//APIサーバを http://localhost:8082 で立ち上げ
var server = app.listen(8082, function(){
    console.log("Node.js is listening to PORT:" + server.address().port)
});

//OAuthで利用する認証画面のURLを取得し、レスポンスとして返却
app.get('/auth', function(req, res) {
    var uri = githubAuth.code.getUri()
    console.log({uri});
    res.json(uri)
})

//ログイン後に遷移するコールバック
app.get('/auth/callback', function(req, res) {
    console.log(req.originalUrl)
    githubAuth.code.getToken(req.originalUrl).then(function(user) {
        try {
            console.log({user})
            //トークンをリフレッシュ
            user.refresh().then(function(updatedUser) {
                console.log(updatedUser !== user)
                console.log(updatedUser.accessToken)
            })
            console.log(user.accessToken)
            //アクセストークンを受け取る画面を指定
            res.redirect('http://localhost:8080?accessToken=' + user.accessToken)
        } catch (e) {
            console.log('/auth/callback でエラー')
            console.log(e)
            res.send('')
        }
    })
})

var ClientOAuth2 = require('client-oauth2');
const { log } = require('console');

var githubAuth = new ClientOAuth2({
    // clientId: '',
    // clientSecret: '',
    clientId: `${process.env.CLIENT_ID}`,
    clientSecret: `${process.env.CLIENT_SECRET}`,
    accessTokenUri: 'https://github.com/login/oauth/access_token',
    authorizationUri: 'https://github.com/login/oauth/authorize',
    redirectUri: 'http://localhost:8082/auth/callback',
    scopes: ['notifications', 'gist']
})
