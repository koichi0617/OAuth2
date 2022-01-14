const path = require('path');
require('dotenv').config({path: path.join(__dirname, "../.env")});
const express = require('express')
const app = express()
const crypto = require('crypto');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const {HttpProxyAgent} = require('hpagent');
const {Issuer, generators, custom} = require('openid-client')
let githubIssuer;
let client;
let state;

custom.setHttpOptionsDefaults({
    keepAlive: true,
    keepAliveMsecs: 1000,
    maxSockets: 256,
    maxFreeSockets: 256,
    scheduling: 'lifo',
    proxy: `${process.env.PROXY}`,
});

//ログイン情報を保持するCookie設定
app.set('trust proxy', 1)
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    cookie:{
    httpOnly: true,
    secure: false,
    maxage: 1000 * 60 * 30
    }
}))
app.use(cookieParser())


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
const server = app.listen(8082, async () => {
    //Github用のIssuerを登録
    githubIssuer = await new Issuer({
        authorization_endpoint: 'https://github.com/login/oauth/authorize',
        token_endpoint: 'https://github.com/login/oauth/access_token',
    })
    console.log('Discoverd issuer %O', githubIssuer.metadata);
    //Issuerにクライアント情報を追加
    client = new githubIssuer.Client({
        client_id: `${process.env.GITHUB_CLIENT_ID}`,
        client_secret: `${process.env.GITHUB_CLIENT_SECRET}`,
        redirect_uris: ['http://localhost:8082/auth/callback'],
        response_types: ['code'],
    });
    console.log("Node.js is listening to PORT:" + server.address().port)
    // console.log(HTTP_PROXY);
});

//OAuthで利用する認証画面のURLを取得し、レスポンスとして返却
app.get('/auth', (req, res, next) => {
    (async () => {
        if(req.session.loggedIn){
            return res.send('OK!');
        }
        const code_verifier = generators.codeVerifier();
        const code_challenge = generators.codeChallenge(code_verifier);
        const nonce = generators.nonce();
        // const state = generators.state();
        state = generators.state();
        const url = client.authorizationUrl({
            scope: 'openid',
            state,
            code_challenge,
            code_challenge_method: 'S256',
            nonce,
        });
        // req.session.state = state;
        req.session.code_verifier = code_verifier;
        req.session.originalUrl = req.originalUrl;
        req.session.nonce = nonce;
        console.log(req.session);
        console.log(url);
        return res.json(url);
    })().catch(next);
})

//ログイン後に遷移するコールバック
app.get('/auth/callback', (req, res, next) => {
    (async () => {
        console.log('~callback~');
        if (!req.session) {
            return res.status(403).send('NG');
        }
        // const state = req.session.state;
        const code_verifier = req.session.code_verifier;
        const nonce = req.session.nonce;
        const params = client.callbackParams(req);
        console.log(req.session);
        console.log(state);
        console.log(code_verifier);
        console.log(params);
        //ここのコールバック処理でプロキシエラーになる
        const tokenSet = await client.callback('http://localhost:8082/auth/callback', params, { code_verifier, state, nonce });
        console.log('received and validated tokens %j', tokenSet);
        console.log('validated ID Token claims %j', tokenSet.claims());
        req.session.loggedIn = true;
        return res.redirect(req.session.originalUrl);
    })().catch(next);
})
