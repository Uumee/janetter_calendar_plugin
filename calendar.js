//================================================
// カレンダーベーススクリプト
//================================================

//外部スクリプトのインポート
var script;
script = document.createElement("script");
script.setAttribute("src", "../../Common/js/plugins/Calendar/js/calendar_viewer.js");
document.getElementsByTagName("head")[0].appendChild(script);

script = document.createElement("link");
script.setAttribute("href", "../../Common/js/plugins/Calendar/FullCalendar/css/fullcalendar.css");
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

(function($, jn){

    //ツイートごとに設置されてるメニューへカレンダー追加ボタンの追加（がしたいぞ）
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


        //セパレータを追加してからカレンダーのメニューを追加しますね。
        $('ul#contextmenu-tweet')
            .append($("<li class='separator'></li>"))
            .append($("<li>カレンダーに追加</li>")
            .append($("<ul></ul>")
                .append($("<li>カレンダーを開く</li>").attr("action","open_calendar"))
                .append($("<li>今日に追加</li>").attr("action","add_calendar_today"))
                .append($("<li>明日に追加</li>").attr("action","add_calendar_tomorrow"))
                .append($("<li>ツイート日に追加</li>").attr("action","add_calendar_tweetdate"))
            )
        );

        /*　ツイートにスケジュールボタンを追加しようとしたけどむりくせー
        $('div.tweet-buttons')
            .append($('<a action="add_calendar_today" title="予定追加">')
                .append($('<div class="tl-icon-calendar">')
                    .css('float','left')
                    .css('margin','0 4px 0 0')
                    .css('background-repeat','no-repeat')
                    .css('width','15px')
                    .css('height','15px')
                    .css('background-image','url(../../Common/js/plugins/Calendar/images/schedule_icon.png)')
                    .css('background-position','center')
                )
            );*/



    };

    //Wikiのコピペ。カレンダー追加Actionの追加
    var action_original = jn.action;
    jn.action = function(options){
        var act = options.act,
            elem = options.element,
            event = options.event;
        switch(act){
            // 追加する処理
            case 'add_calendar_today':
                var target_tweet_id_str = options.data.id_str;
                var my_profile_data = null;
                jn.websocket.send({
                    action: 'users_show',
                    data: {
                        screen_name: jn.accounts[0].screen_name,
                        juid: jn.accounts[0].juid
                    },
                    timeout: jn.REQUEST_SERV_TIMEOUT_CONNECT_TWITTER,
                    done: function(success, data, code){
                        var memo = data[0].user_memo;
                        memo += "\n" + target_tweet_id_str;
                        jn.websocket.send({
                            action: 'users_memo_add',
                            data: {
                                user_id: jn.accounts[0].juid,
                                memo: memo,
                            },
                            done: function(success, data, code){
                                console.log(success);
                            }
                        });
                    }
                });
                break;
            case 'add_calendar_tomorrow':
                console.log();
                break;
            case 'add_calendar_tweetdate':
                console.log(localStorage.length);
                break;
            case 'open_calendar':
                console.log("カレンダーを開きます。");
                jn.calendarvr = new jn.calendar_viewer();
                jn.calendarvr.open();
                break;
            // 元の処理へ遷移
            default:
                action_original.apply(this,arguments);
                break;
        }
    };

})(jQuery, janet);
