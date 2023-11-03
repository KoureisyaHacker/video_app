//---------------------------------------------------------
//                      設定・宣言
//---------------------------------------------------------
//キャッシュの名前
const CACHE_NAME = 'koureisya_hacker_pwa';
//キャッシュバージョン
const CACHE_VERSION = "2023.11.3";
//キャッシュキーを作る
const CACHE_KEY = `${CACHE_NAME}:${CACHE_VERSION}`;
//キャッシュ対象のファイルを選択（スコープからの相対パス）
const CACHE_FILES = [
    './',
    './home.html'
    //ファイルを追加したらここにパスを追加
].map(path => new URL(path,registration.scope).pathname);



//---------------------------------------------------------------
//                     インストール時の処理
//---------------------------------------------------------------
self.addEventListener('install',(event) =>{
    //イベントの完了を処理が成功するまで遅延
    event.waitUntil(
        //cacheStorageの中に指定したCACHE_KEYのcacheを新しく作成して開く
        caches.open(CACHE_KEY).then((cache) => {
            //パスの一覧を渡してcacheに追加する
            return cache.addAll(CACHE_FILES);
        })
    );
});



//---------------------------------------------------------------
//                  リクエストに対する処理
//          キャッシュに無ければネットに探しに行く
//---------------------------------------------------------------

//キャッシュ対象ファイルかどうかを判定
const isTargetFile = function(url){
    return CACHE_FILES.indexOf(new URL(url).pathname) >= 0;
};

//リクエストに対してデータを探す処理
self.addEventListener('fetch',(event) => {
    //レスポンスを宣言
    event.respondWith(
        caches.open(CACHE_KEY).then(function(cache){
            //cache内にリクエストに対するキャッシュが存在するか確認する
            caches.match(event.request).then((response) => {
                //もしキャッシュがあればそれを返す。
                if (response) return response;
                //もしなければネットに取得しに行く
                return fetch(event.request).then(function(response){
                    //キャッシュ対象のファイルでキャッシュすべきレスポンスだったらキャッシュする
                    if (isTargetFile(event.request.url) && response.ok) {
                        cache.put(event.request, response.clone());
                    }
                    return response;
                }); 
            });
        })
    );
});



//-------------------------------------------------------------
//                  有効化（起動？）した時の処理
//-------------------------------------------------------------
//起動した時の処理
self.addEventListener('activate',function(event) {
    //イベントの完了を処理が成功するまで遅延
    event.waitUntil(
        //
        caches.keys().then(function(cacheKey) {
            return Promise.all(
                cacheKey.filter(function(cacheKey) {
                    const [cacheName, cacheVersion] = cacheKey.split(':');
                    return cacheName == CACHE_NAME && cacheVersion != CACHE_VERSION;
                }).map(function(cacheKey) {
                    return caches.delete(cacheKey);
                })
            );
        })
    );
});