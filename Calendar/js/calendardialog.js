//================================================
// calendardialog
// カレンダーを表示したり、予定をドラッグして日付変更したりするダイアログ。
//================================================
(function($, jn){
//
//-->template
var template = '\
<style type="text/css">\
<!--\
.fc-sun{\
    color:red !important;\
}\
.fc-sat{\
    color:blue !important;\
}\
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
    jn.calendardialog = function(){
        this.dialog();
    };
    jn.calendardialog.prototype = {
        //------------------------------------------------
        // 初期化
        //------------------------------------------------
        dialog: function(){

            // var rate = 0.9;
             var main_window = $('div#main');
            // var content_h = main_window.height() * rate,
            //     content_w = main_window.width() * rate;

            $('body').append($(template));
            $('#calendar-content').dialog({
                autoOpen: false,
                resizable: true,
                draggable: true,
                dialogClass: 'calendar-dialog',
                height: "auto",
                width: 600,
                modal: true,
                title: "ついーとかれんだー",
                position:{
                    my: 'center top',
                    at: 'center top',
                    of: main_window
                },
                resizeStop:function(event,ui){
                    $('#calendar').fullCalendar('option','height',$(this).outerHeight());
                },
                close: this.close
            });

        },
        //------------------------------------------------
        // 開け
        //------------------------------------------------
        open: function(){
            var dlg = $('#calendar-content');
            dlg.dialog('open');

            //FullCalendarの初期化
            $("#calendar").fullCalendar({
                header: {
                    left: 'month,listMonth',
                    center: 'title,today',
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
                    listMonth: 'ﾘｽﾄ',
                    week:     '週',
                    day:      '日'
                },
                // jQuery UI theme
                theme: false,
                // 最初の曜日
                firstDay: 0, // 1:月曜日
                // 土曜、日曜を表示
                weekends: true,
                // 週モード (fixed, liquid, variable)
                weekMode: 'fixed',
                // 週数を表示
                weekNumbers: false,
                titleFormat: 'YYYY年 M月',
                // 月名称
                monthNames: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
                // 月略称
                monthNamesShort: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
                // 曜日名称
                dayNames: ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'],
                // 曜日略称
                dayNamesShort: ['日', '月', '火', '水', '木', '金', '土'],
                listDayFormat: 'M月d日',
                noEventsMessage: 'この月にはまだ予定がありません。',
                // 選択可
                selectable: true,
                // 選択時にプレースホルダーを描画
                selectHelper: true,
                editable: true,
                //contentHeight: "auto",
                height: dlg.outerHeight()<200?"auto":dlg.outerHeight(),
                event: [],
                eventRender: function(event,element,view){

                    var qtip_api = null;
                    if(view.type === 'month') {
                        var tooltips = element.qtip({
                            content: {
                                text: event.title,
                                title: event.name
                            },
                            position: {
                                // my: 'bottom center',
                                // at: 'top center',
                                viewport: $('#calendar-content')
                            },
                            hide: {
                                distance: 20
                            },
                            show: {
                                solo: true
                            }
                        });
                        qtip_api = tooltips.qtip('api');
                    }

                    //予定の削除機能の付与
                    if(view.name == 'listDay'){
                        element.find(".fc-list-item-time")
                            .append($("<span class='closeon'>✕</span>")
                                .css('border','3px transparent solid')
                                .css('background-color','transparent')
                                .css('border-radius','30px')
                            );
                    }else{
                        element.find(".fc-content").prepend("<span class='closeon'>✕</span>");
                    }
                    element.find(".closeon").hover(
                        function(e){
                            $(this).css('background-color','red');
                            $(this).css('border-color','red');
                        },
                        function(e){
                            $(this).css('background-color','transparent');
                            $(this).css('border-color','transparent');
                        }
                    );
                    element.find(".closeon").on('click',function(){
                        $('#calendar').fullCalendar('removeEvents',event._id);
                        qtip_api.destroy();
                        return false;
                    });
                }
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
                    //非公開メモを取得し、JSONデータにparse。それをイベントとして追加。
                    var event_json = JSON.parse(data[0].user_memo||"null");
                    $("#calendar").fullCalendar('addEventSource',event_json);
                }
            });

        },
        //------------------------------------------------
        // 閉じて保存
        // todo: もうちょっときれいにならないかな？
        //------------------------------------------------
        close: function(){
            var updated_schedules = $("#calendar").fullCalendar('getEventSources')[0].events;

            if(updated_schedules) {
                var saving_schedule_array = [];
                for (var i = 0; i < updated_schedules.length; i++) {
                    var start_date = new Date(updated_schedules[i].start._d);
                    var end_date = start_date;
                    if(updated_schedules[i].end != null){
                        end_date= new Date(updated_schedules[i].end._d);
                    }
                    saving_schedule_array.push({
                        title: updated_schedules[i].title,
                        name: updated_schedules[i].name,
                        allDay: updated_schedules[i]._allDay,
                        start: start_date.getFullYear() + '-' + ('0' + (start_date.getMonth() + 1)).slice(-2) + '-' + ('0' + start_date.getDate()).slice(-2),
                        end: end_date.getFullYear() + '-' + ('0' + (end_date.getMonth() + 1)).slice(-2) + '-' + ('0' + end_date.getDate()).slice(-2),
                        url: updated_schedules[i].url
                    });
                }

                //todo: ここ重複なう。
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
                                    //FullCalendarの初期化をするため表示されたのを消す。
                                    $("#calendar").fullCalendar('destroy');
                                } else {
                                    //メモの保存失敗・・・。
                                    alert('非公開メモの保存に失敗しました。');
                                }
                            }
                        });
                    }
                });
            }
        },
        holiday_json: function(){

        }
    }
})(jQuery, janet);
