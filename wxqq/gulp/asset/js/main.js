/**
 * Created by qkl | QQ:80508567 Wechat:qklandy on 2015/12/16.
 */
var wxqqEditor=null;
var client = new ZeroClipboard( document.getElementById("copyAllWxqqEditor") );
function resize(e){
    $('#edui1_iframeholder').height($(window).height()-137);
    $('.editor2').height($(window).height()-137);
    $('#style-operate-area .w1').height($(window).height()-37);
    $('#style-operate-area #insert-style-list').height($(window).height()-77);
    $('#editor-template-scroll').height($(window).height()-186);
    $('#emojiIframe').height($(window).height()-260);
}

function changeColorEditor(color){
    $(wxqqEditor.document).find('.wxqq-bg').css({
        backgroundColor:color
    });
    $(wxqqEditor.document).find('.wxqq-borderTopColor').css({
        borderTopColor:color
    });
    $(wxqqEditor.document).find('.wxqq-borderLeftColor').css({
        borderLeftColor:color
    });
    $(wxqqEditor.document).find('.wxqq-borderRightColor').css({
        borderRightColor:color
    });
    $(wxqqEditor.document).find('.wxqq-borderBottomColor').css({
        borderBottomColor:color
    });
}
wxqqEditor=UE.getEditor('editorContent',{
    toolbars: [
        ["bold","italic","underline","forecolor","backcolor","txtshadow","|","justifyleft","justifycenter","justifyright",'justifyjustify', "indent","rowspacingtop",'rowspacingbottom',"lineheight","|","removeformat",'formatmatch',"autotypeset"],
        ["paragraph","fontfamily","fontsize","inserttable",'background',"uploadword","insertimage",'insertvideo',"horizontal", 'spechars',"|","undo","redo","|","more"],
        ["source",'blockquote','superscript', 'subscript','insertorderedlist', 'insertunorderedlist','emotion','link','searchreplace', 'help','message']
    ],
    initialFrameHeight:800,
    autoHeightEnabled:false,
    elementPathEnabled:false, //是否启用元素路径，默认是显示
    wordCount:false //是否开启字数统计
//        allowDivTransToP:false
});

wxqqEditor.ready(function() {

    setTimeout(function () {

        resize();

        $('.edui-editor-toolbarboxinner').children().eq(1).append('<button id="tbmore" style="background:#ffe69f;padding:2px;border:0;"><i class="fa fa-plus-square" style="color:#888;"></i> 更多</button>');
        $('.edui-editor-toolbarboxinner').children().eq(2).css({backgroundColor: '#F7F4F3'}).hide();

        $('#tbmore').click(function (e) {
            $('.edui-editor-toolbarboxinner').children().eq(2).toggle();
            e.preventDefault();
        });

        wxqqEditor.execCommand('focus');
    },1000);

    //localStorage
    setInterval(function(){
        if( wxqqEditor.getContent().length >200 ){
            window.localStorage._wxqqTmpContent=wxqqEditor.getContent();
            $.toaster({ message : '成功为你缓存一次本地数据', title : '本地保存成功(每隔30秒自动保存)', priority : 'success', timeout:90000 });
        }
    },30000);

    if(!!window.localStorage._wxqqTmpContent){
        wxqqEditor.setContent(window.localStorage._wxqqTmpContent);
    }
});


$(function(){

    $('[data-toggle="tooltip"]').tooltip();

    $(window).resize(resize);

    //注册事件
    $(document).on('click','#insert-style-list .ui-portlet-list > li,#styleSearchResultList #style_search_list > ul > li',function(){

        if($(this).hasClass('ignore')){
            return false;
        }

        var ret = false;
        var num = parseInt($(this).find('.autonum:first').text());
        var id = $(this).data('id');


        $(this).contents().filter(function() {
            return this.nodeType === 3 && $.trim($(this).text()) == "";
        }).remove();
        $(this).find('p').each(function(){
            if($.trim($(this).html())=="&nbsp;") {
                $(this).html('<br/>');
            }
        });
        $(this).find('*').each(function(){
            if($(this).attr('data-width')) {
                return;
            }

            if( this.style.width && this.style.width != ""  && this.style.width.search('%')>0 ) {
                $(this).attr('data-width',this.style.width);
            }
        });

        var style_item = $(this).find('.wxqq'); //第一级的

        if(style_item.size()){
            var html = $(this).html();
            ret=wxqqEditor.execCommand('insertHtml', html + "<p><br/></p>");
        } else {
            ret = wxqqEditor.execCommand('insertHtml', "<section class=\"wxqq\">" + $(this).html() + "<section style=\"display: block; width: 0; height: 0; clear: both;\"></section></section><p><br/></p>");
        }

        if(ret){
            if(typeof num != "undefined") {
                $(this).find('.autonum:first').text(num+1);
            }
            style_click($(this).data('id'));
        }

    });

    //样式的快速导航下拉
    $('.nav .dropdown,.navbar-nav .dropdown,header .dropdown').hover(function(e) {
        $(this).addClass('open');
    }, function() {
        $(this).removeClass('open');
    }).click(function(e) {
        e.stopPropagation();
    });

    //更换背景
    $('#bg-choose .chooser').on('click',function(){
        if($(this).data('url')!='')
            $('body').css({background:'url('+$(this).data('url')+')'});
    });
    $('#bg-choose .chooser:last').trigger('click');

    //右侧的快捷按钮
    $('#clearWxqqEditor').on('click',function(){
        if(confirm('你确定要清空所有内容,无法恢复哦?')){
            wxqqEditor.setContent('');
            wxqqEditor.focus();
        }
    });
    $('#previewEditor').on('click',function(){
        $('#previewBox').html(wxqqEditor.getContent());
        $('#preview-msg').modal('show');
    })
    client.on( "copy", function( event ) {
        event.clipboardData.setData( "text/html", wxqqEditor.getContent());
        $.toaster({ message : '请在微信后台ctrl+v即可', title : '复制成功', priority : 'success', timeout:90000 });
    });

    //end


    //bootstrap的标签页
    $('#right-fix-tab a').on('click',function (e){
        $(this).tab('show');
        e.preventDefault();
    });



    //右侧的快速颜色操作
    $('#custom-color-text').colorPicker({
        customBG: '#222',
        size:2,
        readOnly: false,
        mode:'hsv-h',
        init: function(elm, colors) { // colors is a different instance (not connected to colorPicker)
            elm.style.backgroundColor = elm.value;
            elm.style.color = colors.rgbaMixCustom.luminance > 0.22 ? '#222' : '#ddd';
        },
        displayCallback:function(colors, mode,options){
            $('.editor-template-list').find('.wxqq-bg').css({
                backgroundColor:'#'+colors.HEX
            });
            $('.editor-template-list').find('.wxqq-borderTopColor,.wxqq-borderLeftColor,.wxqq-borderRightColor,.wxqq-borderBottomColor').css({
                borderColor:'#'+colors.HEX
            });
            if($('#replace-color-all').prop('checked')){ //全文换色
                changeColorEditor('#'+colors.HEX);
            }
        }
    }).each(function(idx, elm) {
        // $(elm).css({'background-color': this.value})
    });

    $('.color-swatch').on('click',function(){
        var _range=wxqqEditor.selection.getRange(),
            anchorNode=wxqqEditor.selection.getStart(),
            color=$(this).css('background-color');

        if($('#replace-color-all').prop('checked')){ //全文换色
            changeColorEditor(color);
        } else {
            if(anchorNode.nodeType!=1){ anchorNode=anchorNode.parentNode;}
            //背景
            if($(anchorNode).hasClass('wxqq-bg')){
                $(anchorNode).css({backgroundColor:color});
            } else {
                $(anchorNode).closest('.wxqq').find('.wxqq-bg').css({backgroundColor:color});
            }

            //border颜色
            if($(anchorNode).hasClass('wxqq-borderTopColor')){
                $(anchorNode).css({borderTopColor:color});
            } else {
                $(anchorNode).closest('.wxqq').find('.wxqq-borderTopColor').css({borderTopColor:color});
            }
            if($(anchorNode).hasClass('wxqq-borderLeftColor')){
                $(anchorNode).css({borderLeftColor:color});
            } else {
                $(anchorNode).closest('.wxqq').find('.wxqq-borderLeftColor').css({borderLeftColor:color});
            }
            if($(anchorNode).hasClass('wxqq-borderRightColor')){
                $(anchorNode).css({borderRightColor:color});
            } else {
                $(anchorNode).closest('.wxqq').find('.wxqq-borderRightColor').css({borderRightColor:color});
            }
            if($(anchorNode).hasClass('wxqq-borderBottomColor')){
                $(anchorNode).css({borderBottomColor:color});
            } else {
                $(anchorNode).closest('.wxqq').find('.wxqq-borderBottomColor').css({borderBottomColor:color});
            }
            //border end颜色

        }

    });


    //加载所有的模版
    $.ajax({
        url: 'http://www.weixinquanquan.com/index.php?s=/Home/New/getTpls&callback=?',
        dataType : "jsonp",
        success: function(data){
            $('.editor-template-list').html(data.code);
            $('.editor-template-list li').hide();
            $('.editor-template-list').find('.wxqq-tpl1').show();
        }
    });

    //左边导航条的动作
    $('#left-operate-menu .filter').on('click',function(){
        var that=$(this);
        if(that.data('filter')=='all'){
            $('.editor-template-list li').show();
            $('.editor-template-list').show();
            $('#emojiIframe').hide();
        } else if(that.data('filter')=='emoji'){
            $('.editor-template-list').hide();
            $('#emojiIframe').show();
        } else if(that.data('filter')=='mytpl'){
            $.toaster({ message : '功能暂未开放，尽情期待', title : '温馨提醒', priority : 'warning', timeout:90000 });return ;
        } else if(that.data('filter')=='favorate'){
            $.toaster({ message : '功能暂未开放，尽情期待', title : '温馨提醒', priority : 'warning', timeout:90000 });return ;
        } else {
            $('.editor-template-list').show();
            $('.editor-template-list li').hide();
            $('.editor-template-list').find('.wxqq-'+that.data('filter')).show();
            $('#emojiIframe').hide();
        }

        $('#editor-template-scroll').scrollTop(0);

        that.parent().addClass('active').siblings().removeClass('active');
    });


    //保存模版modal
    $('#save-as-template').on('click',function(){
        if(!isLogin){
            $('#loginModal').modal('show');
        } else {
            $('#saveModal').modal('show');
        }
    });

    //保存
    $(".wxqqSaveTpl").on("click", function(e) {
        var that = $(this),data=wxqqEditor.getContent();
        that.hide();
        if ("" == $("#tplName").val()) {
            $.toaster({ message : '请输入你要保存的模版名字', title : '温馨提醒', priority : 'warning', timeout:90000 }); return ;
        }
        if ("" == data) {
            $.toaster({ message : '请先创建好的需要的文案再保存吧', title : '温馨提醒', priority : 'warning', timeout:90000 });return ;
        }
        $.post("/index.php/Home/New/save", {
            id: $("#tplid").val(),
            type:$('#tpltype').val(),
            title: $("#tplName").val(),
            code: data
        }, function(data) {

            if(data.status){
                if(!data.ismine){
                    $('#tplid').val(data.newid);
                }
                $('#tpltype').val('u');
                $.toaster({ message : '保存成功', title : '温馨提醒', priority : 'warning', timeout:90000 });
            } else {
                $.toaster({ message : '保存失败，你可联系客服', title : '错误提醒', priority : 'warning', timeout:90000 });
            }
            $('#saveModal').modal('hide');
            that.show();
        });

        e.preventDefault();
    });

    if( $('#tplid').val() ){
        $.post('/index.php/Home/New/getTpl',{type:$('#tpltype').val(),id:$('#tplid').val()},function(data){
            if(data.status){
                wxqqEditor.setContent(data.code);
            } else {
                $.toaster({ message : data.data, title : '错误提醒', priority : 'warning', timeout:90000 });
            }
        });
    }
});