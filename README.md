# oauth2
https://qiita.com/kg0r0/items/6df1aea4474e8424b10f を参考に作成

## セットアップ

* パッケージのインストール
    ```
    npm install
    ```

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