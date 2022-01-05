# oauth2
本プログラムは、https://reon777.com/2021/07/10/oauth2-client-app-nodejs/ を参考にして作成してある。

## セットアップ

* パッケージのインストール
    ```
    npm install
    ```

* Githubアカウントへのアプリ登録
  * ClientIDとClientSecretを取得
    * https://docs.github.com/ja/developers/apps/building-oauth-apps/authorizing-oauth-apps の手順に従う。
  * 認可情報を登録
    * src/index.jsのgithubAuthに情報を記入する。



## 操作手順

* 別々のターミナル上で以下を実行
  * Webアプリ立ち上げ
      ```
      npm run serve
      ```

  * APIサーバ立ち上げ
      ```
      node src/index.js
      ```

* その後、http://localhost:8080/auth にアクセスすることで、APIサーバからGithubの認証情報を持ったURLが返却され、認証画面が開く。

* 認証ボタンを押すことで、アクセストークンを持った状態でhttp://localhost:8082/auth/callback へとリダイレクトされる。