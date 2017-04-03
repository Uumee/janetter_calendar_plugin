//================================================
// advsearch
//
//	([^\\]{1})\n
//	$1\\\n
//================================================
(function($, jn){
//
//-->template
var template = '\
<style type="text/css">\
<!--\
//-->\
</style>\
<div id="calendar-content">\
	<div class="frame">\
	<div id="calendar"></div>\
	</div>\
</div>\
';
//<--template

    //------------------------------------------------
    // advsearchダイアログですよ
    //------------------------------------------------
    jn.calendar_viewer = function(){
        this.dialog();
    };
    jn.calendar_viewer.prototype = {
        //------------------------------------------------
        // 初期化
        //------------------------------------------------
        dialog: function(){
            $('body').append($(template));
            $('#calendar-content').dialog({
                autoOpen: false,
                resizable: true,
                draggable: true,
                dialogClass: 'calendar-dialog',
                height: "auto",
                width: 500,
                modal: true,
                title: "ついーとかれんだー",
                close: function(event,ui){
                    var updated_schedules = $("#calendar").fullCalendar('getEventSources')[0].events;

                    if(updated_schedules.length > 0) {
                        var saving_schedule_array = [];
                        console.log('更新されたスケジュールの配列作成開始');
                        for (var i = 0; i < updated_schedules.length; i++) {
                            console.log(i);
                            var date = new Date(updated_schedules[i].start._d);
                            saving_schedule_array.push({
                                title: updated_schedules[i].title,
                                allDay: updated_schedules[i]._allDay,
                                start: date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2),
                                end: date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2),
                                url: updated_schedules[i].url
                            });
                        }

                        jn.websocket.send({
                            action: 'users_show',
                            data: {
                                screen_name: jn.accounts[0].screen_name,
                                juid: jn.accounts[0].juid
                            },
                            timeout: jn.REQUEST_SERV_TIMEOUT_CONNECT_TWITTER,
                            done: function (success, data, code) {
                                var schedule_jsonstr = JSON.stringify(saving_schedule_array);
                                jn.websocket.send({
                                    action: 'users_memo_add',
                                    data: {
                                        user_id: jn.accounts[0].juid,
                                        memo: schedule_jsonstr
                                    },
                                    done: function (success, data, code) {
                                        if (success) {
                                            //メモの保存成功！
                                            $("#calendar").fullCalendar('destroy');
                                        } else {
                                            //メモの保存失敗・・・。
                                            alert('失敗！');
                                        }
                                    }
                                });
                            }
                        });
                    }
                }
            });
        },
        //------------------------------------------------
        // 開け
        //------------------------------------------------
        open: function(){
            $('#calendar-content').dialog('open');

            $("#calendar").fullCalendar({
                header: {
                    left: 'today',
                    center: 'title',
                    right: 'prev,next'
                },
                // ボタン文字列
                buttonText: {
                    prev:     '<', // <
                    next:     '>', // >
                    prevYear: '<<',  // <<
                    nextYear: '>>',  // >>
                    today:    '今日',
                    month:    '月',
                    week:     '週',
                    day:      '日'
                },
                // jQuery UI theme
                theme: false,
                // 最初の曜日
                firstDay: 1, // 1:月曜日
                // 土曜、日曜を表示
                weekends: true,
                // 週モード (fixed, liquid, variable)
                weekMode: 'fixed',
                // 週数を表示
                weekNumbers: false,
                titleFormat: 'YYYY年M月',
                // 月名称
                monthNames: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
                // 月略称
                monthNamesShort: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
                // 曜日名称
                dayNames: ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'],
                // 曜日略称
                dayNamesShort: ['日', '月', '火', '水', '木', '金', '土'],
                // 選択可
                selectable: false,
                // 選択時にプレースホルダーを描画
                selectHelper: false,
                contentHeight: "auto",
                editable: true,
                event: []
            });

            //イベントデータの取得
            jn.websocket.send({
                action: 'users_show',
                data: {
                    screen_name: jn.accounts[0].screen_name,
                    juid: jn.accounts[0].juid
                },
                timeout: jn.REQUEST_SERV_TIMEOUT_CONNECT_TWITTER,
                done: function(success, data, code){
                    var event_json = JSON.parse(data[0].user_memo||"null");
                    console.log(event_json);
                    $("#calendar").fullCalendar('addEventSource',event_json);
                }
            });

        }
    }
})(jQuery, janet);
