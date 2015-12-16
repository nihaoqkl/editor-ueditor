/**
 * Created by qkl | QQ:80508567 Wechat:qklandy on 2015/12/16.
 */
var wxqqEditor=null;
ZeroClipboard.config( { swfPath: "./js/ZeroClipboard/ZeroClipboard.swf" } );
var client = new ZeroClipboard( document.getElementById("copyAllWxqqEditor") );
wxqqEditor=UE.getEditor('editorContent',{
    toolbars: [
        ["bold","italic","underline","forecolor","backcolor","txtshadow","|","justifyleft","justifycenter","justifyright",'justifyjustify', "indent","rowspacingtop",'rowspacingbottom',"lineheight","|","removeformat",'formatmatch',"autotypeset"],
        ["paragraph","fontfamily","fontsize","inserttable",'background',"uploadword","insertimage",'insertvideo',"horizontal", 'spechars',"|","undo","redo","|","more"],
        ["source",'blockquote','superscript', 'subscript','insertorderedlist', 'insertunorderedlist','emotion','link','searchreplace', 'help','message']
    ],
    autoHeightEnabled:false,
    elementPathEnabled:false, //是否启用元素路径，默认是显示
    wordCount:false, //是否开启字数统计
//        allowDivTransToP:false
});

wxqqEditor.ready(function() {

    $(window).trigger('resize');

    setTimeout(function () {

        $('#edui1_iframeholder').height($(window).height()-137);
        $('.editor2').height($(window).height()-137);
        $('#style-operate-area .w1').height($(window).height()-37);
        $('#style-operate-area #insert-style-list').height($(window).height()-77);


        $('.edui-editor-toolbarboxinner').children().eq(1).append('<button id="tbmore" style="background:#ffe69f;padding:2px;border:0;"><i class="fa fa-plus-square" style="color:#888;"></i> 更多</button>');
        $('.edui-editor-toolbarboxinner').children().eq(2).css({backgroundColor: '#F7F4F3'}).hide();

        $('#tbmore').click(function (e) {
            $('.edui-editor-toolbarboxinner').children().eq(2).toggle();
            e.preventDefault();
        });

        wxqqEditor.execCommand('focus');
    });

    //localStorage
    setInterval(function(){
        if( wxqqEditor.getContent().length >200 ){
            window.localStorage._wxqqTmpContent=wxqqEditor.getContent();
            $.toaster({ message : '成功为你缓存一次本地数据', title : '本地保存成功(每隔10秒自动保存)', priority : 'success', timeout:90000 });
        }
    },10000);

    console.log($.cookie('editorTmp'));
    if(!!window.localStorage._wxqqTmpContent){
        wxqqEditor.setContent(window.localStorage._wxqqTmpContent);
    }
});


$(function(){

    $('[data-toggle="tooltip"]').tooltip();

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

        var style_item = $(this).find('> .wxqq:first'); //第一级的

        if(style_item.size()){
            if(style_item.find('> *').size() == 1 && style_item.find('> *').eq(0).hasClass('wxqq') ) {
                ret = wxqqEditor.execCommand('insertHtml',  style_item.html() + "<p><br/></p>" );
            } else {
                var html = style_item.prop('outerHTML');
                ret=wxqqEditor.execCommand('insertHtml', html + "<p><br/></p>");
            }
        } else {
            ret = wxqqEditor.execCommand('insertHtml', "<section data-id=\""+id+"\" class=\"wxqq\">" + $(this).html() + "<section style=\"display: block; width: 0; height: 0; clear: both;\"></section></section><p><br/></p>");
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
        }
    }).each(function(idx, elm) {
        // $(elm).css({'background-color': this.value})
    });

    $('.color-swatch').on('click',function(){
        var _range=wxqqEditor.selection.getRange(),
            anchorNode=_range.startContainer;

        if($('#replace-color-all').prop('checked')){

            $(wxqqEditor.document).find('.wxqq-bg').css({
                backgroundColor:$(this).css('background-color')
            });
            $(wxqqEditor.document).find('.wxqq-borderTopColor,.wxqq-borderLeftColor,.wxqq-borderRightColor,.wxqq-borderBottomColor').css({
                borderColor:$(this).css('background-color')
            });
        } else {
            //背景
            if($(anchorNode).hasClass('wxqq-bg')){
                $(anchorNode).css({backgroundColor:$(this).css('background-color')});
            } else {
                $(anchorNode).parents('.wxqq-bg').css({backgroundColor:$(this).css('background-color')});
            }

            //border颜色
            if($(anchorNode).hasClass('wxqq-borderTopColor')){
                $(anchorNode).css({borderTopColor:$(this).css('background-color')});
            } else {
                $(anchorNode).parents('.wxqq-borderTopColor').css({borderTopColor:$(this).css('background-color')});
            }
            if($(anchorNode).hasClass('wxqq-borderLeftColor')){
                $(anchorNode).css({borderLeftColor:$(this).css('background-color')});
            } else {
                $(anchorNode).parents('.wxqq-borderLeftColor').css({borderLeftColor:$(this).css('background-color')});
            }
            if($(anchorNode).hasClass('wxqq-borderRightColor')){
                $(anchorNode).css({borderRightColor:$(this).css('background-color')});
            } else {
                $(anchorNode).parents('.wxqq-borderRightColor').css({borderRightColor:$(this).css('background-color')});
            }
            if($(anchorNode).hasClass('wxqq-borderBottomColor')){
                $(anchorNode).css({borderBottomColor:$(this).css('background-color')});
            } else {
                $(anchorNode).parents('.wxqq-borderBottomColor').css({borderBottomColor:$(this).css('background-color')});
            }
            //border end颜色
        }

    });


    //加载所有的模版
    $.ajax({
        url: 'http://www.weixinquanquan.com/index.php?s=/Home/New/index&callback=?',
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
        that.parent().addClass('active').siblings().removeClass('active');
        if(that.data('filter')!='all'){
            $('.editor-template-list li').hide();
            $('.editor-template-list').find('.wxqq-'+that.data('filter')).show();
        } else {
            $('.editor-template-list li').show();
        }
    });


});