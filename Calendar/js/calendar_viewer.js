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
            $('#calendar-content')
                .dialog({
                    autoOpen: false,
                    resizable: true,
                    draggable: true,
                    dialogClass: 'calendar-dialog',
                    height: "auto",
                    width: 500,
                    modal: true,
                    title: "ついーとかれんだー",
                });
        },
        //------------------------------------------------
        // 開け
        //------------------------------------------------
        open: function(){
            // $('#ui-dialog-title-advsearch-content').text(jn.msg.advSTitle);
            $('#calendar-content').dialog('open');

            //カレンダーの設定
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
                selectable: true,
                // 選択時にプレースホルダーを描画
                selectHelper: true,
                contentHeight: "auto"
            });
        },
        //------------------------------------------------
        // 閉じなさい
        //------------------------------------------------
        close: function(){
            $('#calendar-content').dialog('close');
        },
        //------------------------------------------------
        // アクション振り分け
        //------------------------------------------------
        action: function(act, elem, event){
            console.log("action ------");
            console.log(act);
            console.log(elem);
            console.log(event);
            console.log("action end ------");
        }
    }
})(jQuery, janet);
