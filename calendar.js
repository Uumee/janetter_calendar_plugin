//================================================
// カレンダーベーススクリプト
// 主にJanetter側への所
//================================================

//外部スクリプトのインポート
//TODO: なおすのめんどうなのです。でもそのうちやるのです。
var script;
script = document.createElement("script");
script.setAttribute("src", "../../Common/js/plugins/Calendar/js/calendardialog.js");
document.getElementsByTagName("head")[0].appendChild(script);

script = document.createElement("link");
script.setAttribute("href", "../../Common/js/plugins/Calendar/FullCalendar/css/fullcalendar.css");
script.setAttribute("rel",'stylesheet');
document.getElementsByTagName("head")[0].appendChild(script);

script = document.createElement("link");
script.setAttribute("href", "../../Common/js/plugins/Calendar/qtip/css/jquery.qtip.min.css");
script.setAttribute("rel",'stylesheet');
document.getElementsByTagName("head")[0].appendChild(script);

var script6 = document.createElement("link");
script6.setAttribute("href", "../../Common/js/plugins/Calendar/FullCalendar/css/fullcalendar.print.css");
script6.setAttribute("rel",'stylesheet');
script6.setAttribute("media",'print');
document.getElementsByTagName("head")[0].appendChild(script6);

var script7 = document.createElement("script");
script7.setAttribute("src", "../../Common/js/plugins/Calendar/FullCalendar/js/moment.min.js");
document.getElementsByTagName("head")[0].appendChild(script7);

var script2 = document.createElement("script");
script2.setAttribute("src", "../../Common/js/plugins/Calendar/FullCalendar/js/fullcalendar.js");
document.getElementsByTagName("head")[0].appendChild(script2);

var script4 = document.createElement("script");
script4.setAttribute("src", "../../Common/js/plugins/Calendar/FullCalendar/js/gcal.js");
document.getElementsByTagName("head")[0].appendChild(script4);

var script5 = document.createElement("script");
script5.setAttribute("src", "../../Common/js/plugins/Calendar/qtip/js/jquery.qtip.min.js");
document.getElementsByTagName("head")[0].appendChild(script5);

(function($, jn){

/* //JSONに関するテスト
    var obj_array = [];

    obj_array.push({ title: '01'});
    obj_array.push({ title: '02'});
    obj_array.push({ title: '03'});

    console.info('TEST : obj_array');
    console.log(obj_array);
    var json_str = JSON.stringify(obj_array);
    console.info('TEST : obj_array => json_str');
    console.log(json_str);
    console.info('TEST : json_str => JSON.parse() => object');
    console.log(JSON.parse(json_str));
*/

    //新着ツイート（画面表示前）
    //ここでツイートボタンとなるカレンダーボタンを設置したい
    var origin_onReceiveNewStatusesBefore = jn.onReceiveNewStatusesBefore;
    jn.onReceiveNewStatusesBefore = function (tweet_object) {
        origin_onReceiveNewStatusesBefore && origin_onReceiveNewStatusesBefore();
        // console.log(tweet_object);
        //
        // var new_id = tweet_object.id_str;
        //
        // $('div.tweet-container').each(function(index,element){
        //     console.log($(element).find('div.tweet-buttons > a').size());
        // });

        // $('div.tweet-buttons')
        //     .append($('<a action="add_calendar_today" title="予定追加">')
        //         .append($('<div class="tl-icon-calendar">')
        //             .css('float','left')
        //             .css('margin','0 4px 0 0')
        //             .css('background-repeat','no-repeat')
        //             .css('width','15px')
        //             .css('height','15px')
        //             .css('background-image','url(../../Common/js/plugins/Calendar/images/schedule_icon.png)')
        //             .css('background-position','center')
        //         )
        //     );
    };

    //ツイートごとに設置されてるメニューへカレンダー追加ボタンの追加
    //カレンダー表示用の大きなボタンの設置
    var origin_onContextMemuGearBuildStarted = jn.onContextMemuGearBuildStarted;
    jn.onContextMemuGearBuildStarted = function(success, data){
        origin_onContextMemuGearBuildStarted && janet.onContextMemuGearBuildStarted(accounts);

        //カレンダー表示アイコンの追加
        $('div#menu > a:last')
            .after($('<a class="menu-icon-calendar" action="open_calendar" title="カレンダー"></a>')
                .append($('<div class="menu-icon-calendar"></div>')
                    .css('background-image','url(../../Common/js/plugins/Calendar/images/calendar_icon.png)')
                    .css('opacity','0.8')
                    .css('margin-left','auto')
                    .css('margin-right','auto')
                    .css('width','28px')
                    .css('height','28px')
                    .css('background-repeat','no-repeat')
                    .css('background-position','center')
                    .css('background-size','contain')
                    .hover(
                        function(){
                            $(this).css('opacity','1.0');
                        },
                        function(){
                            $(this).css('opacity','0.8');
                        }
                    )
                )
            );

        //カレンダーのメニューの追加
        $('ul#contextmenu-tweet')
            .append($("<li class='separator'></li>"))
            .append($("<li>カレンダーに追加</li>").attr("action","add_calendar_today")
        );

    };

    //カレンダー用のActionの追加
    var action_original = jn.action;
    jn.action = function(options){
        switch(options.act){
            // カレンダーに追加する（日付は今日）
            case 'add_calendar_today':
                add_calendar_json(options);
                break;
            //カレンダーを開く
            case 'open_calendar':
                (new jn.calendardialog()).open();
                break;
            // 元の処理へ遷移
            default:
                action_original.apply(this,arguments);
                break;
        }
    };

    /**
     * add_calendar_json
     *
     * １．自らのプロフィールに保存されている非公開メモを取得する。
     * ２．取得した非公開メモを配列に戻す。（非公開メモはJSON文字列である前提）
     * ３．非公開メモとして保存されているスケジュール配列に引数であるツイートを登録
     * ４．メモをセーブする。
     *
     * todo: こういった非公開メモを使う部分をクラス化し、ローカルファイル出力不可のJanetterに一時保存機能をつけたい。
     */
    var add_calendar_json = function(options) {
        jn.websocket.send({
            action: 'users_show',
            data: {
                screen_name: jn.accounts[0].screen_name,
                juid: jn.accounts[0].juid
            },
            timeout: jn.REQUEST_SERV_TIMEOUT_CONNECT_TWITTER,
            done: function(success, data, code){
                //自分の非公開メモを読み取り
                var memo = data[0].user_memo || null;
                console.log(data[0].user_memo);
                //新たな非公開メモを作成し
                memo = schedule_json(memo,options,new Date());
                console.log(memo);
                //それを保存する。
                usermemo_save(memo);
            }
        });
    };

    /**
     * usermemo_save
     *
     * ユーザの非公開メモを保存する。
     * @param new_memo 保存する文字列
     */
    var usermemo_save = function(new_memo){
        //引数がJSONかどうか判定をし、JSONならば保存を実行する。
        if(isJSON(new_memo)) {
            jn.websocket.send({
                action: 'users_memo_add',
                data: {
                    user_id: jn.accounts[0].juid,
                    memo: new_memo
                },
                done: function (success, data, code) {
                    if (success) {
                        //メモ保存成功！
                    } else {
                        //メモの保存失敗・・・。
                        alert('非公開メモの保存に失敗しました。');
                    }
                }
            });
        }else{
            alert('JSON文字列以外が保存されようとしています。');
        }
    };

    /**
     * schedule_json
     *
     * 保存するツイートをスケジュールとしてJSONファイルに組み込みます。
     * 既存のJSONデータがある場合は追加します。
     *
     * JSONデータの内訳として
     *     配列[ オブジェクト{Tweet} , オブジェクト{Tweet} , ... ];
     * とする。
     *
     * @param existing_json {string} 保存されていたスケジュール（既存の非公開メモ）
     * @param tweet ツイートに関するデータ
     * @param date 保存する日付
     *
     * todo: 現在、全てのスケジュールはallDay:trueに設定してある。時間指定出来たほうが良いか？複雑になるか？
     * todo: 時間指定可能とする場合、スケジュール追加に当たってさらなるDialogが必要かと思う。
     * todo: スケジュールオブジェクトに追加するデータは今、開発者側で決め打ちしてるので、色々詳細な設定を追加したい。
     */
    var schedule_json = function(existing_json,tweet,date){
        //初期化
        var schedule_array = [];
        //すでに他のスケジュールが保存されていた場合
        if(existing_json) {
            schedule_array = JSON.parse(existing_json);
        }

        //スケジュールの追加を行う
        schedule_array.push ({
            title: tweet.data.original,
            name: tweet.data.user.name + " @" + tweet.data.user.screen_name,
            start: date.getFullYear()+'-'+('0'+(date.getMonth()+1)).slice(-2)+'-'+('0'+date.getDate()).slice(-2),
            end: date.getFullYear()+'-'+('0'+(date.getMonth()+1)).slice(-2)+'-'+('0'+date.getDate()).slice(-2),
            url: 'https://twitter.com/' + tweet.data.user.screen_name + '/status/' + tweet.data.id_str,
            allDay: true
        });

        return JSON.stringify(schedule_array);
    };

    /**
     * isJSON
     *
     * JSONかどうか判定
     *
     * 参考http://qiita.com/kenchan0130/items/c4cea096b5a2b303d085
     * @param arg 判定する文字列及び関数
     * @returns {boolean}
     *
     * todo: ほんとに必要か？ デバッグではお世話になったけど。
     */
    var isJSON = function(arg) {
        arg = (typeof arg === "function") ? arg() : arg;
        if (typeof arg  !== "string") {
            return false;
        }
        try {
            arg = (!JSON) ? eval("(" + arg + ")") : JSON.parse(arg);
            return true;
        } catch (e) {
            return false;
        }
    };

})(jQuery, janet);
