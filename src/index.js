const path = require('path');
require('dotenv').config({path: path.join(__dirname, "../.env")});
const express = require('express')
const app = express()
const {Issuer, generators} = require('openid-client')
let githubIssuer;
let client;

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
    Issuer.discover('https://accounts.google.com/.well-known/openid-configuration').then(function(githubIssuer){
    console.log('Discoverd issuer %s %O', githubIssuer.issuer, githubIssuer.metadata);
    })
    client = new githubIssuer.Client({
        client_id: `${process.env.CLIENT_ID}`,
        client_secret: `${process.env.CLIENT_SECRET}`,
        redirect_uris: ['http://localhost:8082/auth/callback'],
        response_types: ['code'],
    });
    console.log("Node.js is listening to PORT:" + server.address().port)
});

//OAuthで利用する認証画面のURLを取得し、レスポンスとして返却
app.get('/auth', function(req, res) {
    if(req.session.loggedIn){
        return res.send('OK!');
    }
    const code_verifier = generators.codeVerifier();
    const code_challenge = generators.codeChallenge(code_verifier);
    const nonce = generators.nonce();
    const state = generators.state();
    const url = client.authorizationUrl({
        scope: 'openid',
        state,
        nonce,
        code_challenge,
        code_challenge_method: 'S256',
    });
    req.session.state = state;
    req.session.code_verifier = code_verifier;
    req.session.originalUrl = req.originalUrl;
    req.session.nonce = nonce;
    return res.redirect(url);
})

//ログイン後に遷移するコールバック
app.get('/auth/callback', function(req, res) {
    if (!req.session){
        return res.status(403).send('NG');
    }
    const state = req.session.state;
    const code_verifier = req.session.code_verifier;
    const nonce = req.session.nonce;
    const params = client.callbackParams(req);
    const tokenSet = await client.callback('http://localhost:8080/auth/callback', params, { code_verifier, state, nonce });
    console.log('received and validated tokens %j', tokenSet);
    console.log('validated ID Token claims %j', tokenSet.claims());
    req.session.loggedIn = true;
    return res.redirect(req.session.originalUrl);
})
