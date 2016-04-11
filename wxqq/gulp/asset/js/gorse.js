/**
 * Created by qkl | QQ:80508567 Wechat:qklandy on 2016/4/11.
 */
var wxqqEditor=null;
var winHeight = 1000;
var editorHeight = 1000;
var client = new ZeroClipboard( document.getElementById("copyAllWxqqEditor") );
var wxqq_tool_bar_copy_client = new ZeroClipboard( document.getElementById("wxqq_tool_bar_copy") );

if(!window.localStorage || document.compatMode!='CSS1Compat' || /MSIE/i.test(navigator.userAgent) || /Trident/i.test(navigator.userAgent) ) {
    //alert('你的浏览器不支持微信圈圈编辑器，请下载chrome,火狐、360极速浏览器、QQ浏览器等现在浏览器使用本站！');
    $('#notSupportModal').modal('show');
}

function appendHtml(html){
    wxqqEditor.execCommand('insertHtml', html);
}
function appendSymbol(obj){
    appendHtml($(obj).find('span').text());
}
function appendMind(html){
    var tpl='<section class="wxqq Powered-by-WeixinQuanquan.com">'+
        '<fieldset class="wxqq-borderTopColor wxqq-borderRightColor wxqq-borderBottomColor wxqq-borderLeftColor" style="margin: 0px; padding: 5px; border: 1px solid rgb(0, 187, 236);">'+
        '<legend style="margin: 0px 10px;">'+
        '<span style="padding: 5px 10px; color: #ffffff; font-weight: bold; font-size: 14px; background-color: #00BBEC;" class="wxqq-bg">今日脑洞大开</span>'+
        '</legend>'+
        '<blockquote style="margin: 0px; padding: 10px; ">'+
        html+
        '</blockquote>'+
        '</fieldset>'+
        '</section>';
    appendHtml(tpl);
}
function getContent(){

    var html = wxqqEditor.getContent();

    function cdnReplace(){
        return 'src="' + decodeURIComponent(arguments[1]) + '"';
    }

    //替换微信cdn前缀
    //html = html.replace(/src=\"http:\/\/img03\.store\.sogou\.com\/net\/a\/04\/link\?appid=100520031&w=1200&url=(.+?)\"/g,cdnReplace);
    //html = html.replace(/src=\"http:\/\/img03\.store\.sogou\.com\/net\/a\/04\/link\?appid=100520031&amp;w=1200&amp;url=(.+?)\"/g,cdnReplace);
    html = html.replace(/src=\"http:\/\/remote\.wx135\.com\/oss\/view\?d=(.+?)\"/g,cdnReplace);

    function cdnReplace2(){
        return 'url(' + decodeURIComponent(arguments[1]) + ')';
    }

    //替换微信cdn前缀
    //html = html.replace(/url\(http:\/\/img03\.store\.sogou\.com\/net\/a\/04\/link\?appid=100520031&w=1200&url=(.+?)\)/g,cdnReplace2);
    //html = html.replace(/url\(http:\/\/img03\.store\.sogou\.com\/net\/a\/04\/link\?appid=100520031&amp;w=1200&amp;url=(.+?)\)/g,cdnReplace2);
    html = html.replace(/url\(http:\/\/remote\.wx135\.com\/oss\/view\?d=(.+?)\)/g,cdnReplace2);

    return html.replace(/(<p>\s*<br\s*\/>\s*<\/p>){2,}/ig,'<p><br><\/p>');
}
function resize(e){
    $('#edui1_iframeholder').height($(window).height()-137);
    $('.editor2').height($(window).height()-137);
    //wxqqEditor.setHeight($(window).height()-137);
    $('#style-operate-area .w1').height($(window).height()-37);
    $('#style-operate-area #insert-style-list').height($(window).height()-77);
    $('#editor-template-scroll').height($(window).height()-186);
    $('#emojiIframe').height($(window).height()-260);
}
//获取最后一个本地的缓存
function getLastStorage(){
    if(!!window.localStorage[_wxqqTmpContent]){
        wxqqEditor.setContent(window.localStorage[_wxqqTmpContent]);
    }
}
function helpOnce(){
    if(confirm('丢弃当前编辑器里的内容，恢复到操作前一分钟的状态？')){
        getLastStorage();
    }
}
//提交创建from自动提交生成长图，pdf等
function htmltoMore(obj){
    var html = wxqqEditor.getContent();
    if(html.length < 200) {
        alert('请先创建你的文案再来保存');
        return ;
    }
    var that=$(obj);
    var form = $('#htmltoMoreForm');
    if(form.size() <= 0) {
        form = $('<form action="/index.php/Home/New/render" method="post" id="htmltoMoreForm" target="_blank"><input name="type" id="htmltoMoreType"><textarea name="html" id="htmltoMoreHtml"></textarea></form>');
    }
    $('body').append(form);

    form.find('#htmltoMoreType').val(that.data('type'));
    form.find('#htmltoMoreHtml').val(html);
    form.submit();

    setTimeout(function(){
        form.remove();
    },1000);

}
var modalCommon={
    tpl:'<div class="modal fade" id="##modalID##" class="##modalClass##" role="dialog">'+
    '<div class="modal-dialog" role="document">'+
    '<div class="modal-content">'+
    '<div class="modal-header">'+
    '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>'+
    '<h4 class="modal-title">##title##</h4>'+
    '</div>'+
    '<div class="modal-body">##html##</div>'+
    '</div>'+
    '</div>'+
    '</div>',
    open:function(objSel,html,callback){
        var tpl='',selector='',type=1; //1->id 0->class
        if(typeof objSel =='object') {
            type=objSel.type=='id'?1:0;
            selector=(type?'#':'.')+objSel.content;
        }
        if($(selector).size()<1) {
            tpl = this.tpl.replace(/##modalID##/i, type?objSel.content:'wxqqModal'+Math.random()*100000);
            tpl = tpl.replace(/##modalClass##/i, !type?objSel.content:'wxqqModal'+Math.random()*100000);
            tpl = tpl.replace(/##title##/i, html['title']);
            tpl = tpl.replace(/##html##/i, html['content']);
            $('body').append($(tpl));
            if (typeof callback == 'function') {
                callback(selector);
            }
        }
        $(selector).modal('show');
        return selector;
    },
    close:function(selector){
        $(selector).modal('hide');
    }
}
function getTpls(type){
    $('#base .block-list').html('');
    $('#base .block-list').append('<li id="tplLoading"><img src="/static/new/images/circle_ball.gif"></li>');
    $.get('/index.php/Home/New/getTpls',function(data){
        $('#base .block-list').html(data);
        $('#base .block-list li').hide();
        $('#base .block-list').find('.wxqq-tpl1').show();
        $('#tplLoading').remove();

    });
}

/**
 * 封面上传
 */
function upload(elementId){
    $('.upload-preview-wrap').hide();
    $.ajaxFileUpload({
        url:'/index.php/Home/Task/upload',
        fileElementId:elementId,
        dataType: 'json',
        success: function (data, status){
            if(data.status){
                $('.upload-preview-wrap').show().find('.upload-preview-img').attr('src',data.pic);
                $('#upload-preview-blank').attr('href',data.pic);
                $('#wxqq_thumb_pic').val(data.pic);
            } else {
                alert(data.data);
            }
        },
        error: function (data, status, e) {
            alert(data.data);
        }
    });
}

function changeColorEditor(color){
    $(wxqqEditor.document).find('.wxqq-color').css({
        color:color
    });
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


//浮动快捷工具条

// 删除样式周围的外边框
function hideWrap (){
    // 判断是否存在外边框,有的话，就删除
    if($(wxqqEditor.document).find('#wxqqWrap').length>0){
        var wrapNode = $(wxqqEditor.document).find('#wxqqWrap');
        wrapNode.before(wrapNode.children());
        wrapNode.remove();
    }
    // 判断是否存在工具条，存在的话删除它
    // if($('#wxqq_tool_bar').length>0){
    //     $('#wxqq_tool_bar').remove();
    // }
    $('#wxqq_tool_bar').hide();
}

// 在样式最外层插入虚线边框
function insertWrap (event){
    // 获取捕捉到的样式
    var select_node = $(event.target).closest('.wxqq');
    if(select_node.length == 0){
        hideWrap();
    }

    // 判断是否在样式内点击
    if(select_node.parent().attr('id')!='wxqqWrap' && select_node.length>0){
        hideWrap();

        var wraphtml = '<section id="wxqqWrap" style="border: dashed 1px #00bbec; padding: 5px;"></section>';

        var wxqqWrap = select_node.wrap(wraphtml).parent();
        var off_top = wxqqWrap.offset().top + wxqqWrap.height() - $(wxqqEditor.document).scrollTop();
        var off_right = $(wxqqEditor.document).width() - (wxqqWrap.offset().left + wxqqWrap.width());
        $('#wxqq_tool_bar').show();
        $('#wxqq_tool_bar').css({top:off_top+70,right:off_right});
        wxqq_tool_bar_copy_client.off( "copy" ); //取消所有的注册事件
        wxqq_tool_bar_copy_client.on( "copy", function( event ) {
            event.clipboardData.setData( "text/html", wxqqWrap.html());
            hideWrap();
            $.toaster({ message : '当前选中的样式', title : '复制成功', priority : 'success', settings:{ debug:false,timeout:5000} });
        });

        // 删除按钮操作
        $('#wxqq_tool_bar_del').on('click',function (){
            wxqqWrap.remove();
            // $('#wxqq_tool_bar').remove();
            $('#wxqq_tool_bar').hide();
        });

        // 前插入空行
        $('#wxqq_tool_bar_isBefore').on('click', function (){
            // wxqqEditor.execCommand('insertrow',wxqqWrap);
            wxqqWrap.before('<p><br /></p>');
            var currentTop = wxqqWrap.offset().top + wxqqWrap.height() - $(wxqqEditor.document).scrollTop();
            $('#wxqq_tool_bar').css('top',currentTop + 47);
        });

        // 后插入空行
        $('#wxqq_tool_bar_isAfter').on('click', function (){
            wxqqWrap.after('<p><br /></p>');
            wxqqEditor.focus(true);         //设置编辑器的光标到文档底部
        });

        // 当滚轮变动时，动态改变工具条的位置
        $(wxqqEditor.document).on('mousewheel',function (){
            if($('#wxqq_tool_bar').css('display')!='none'){
                var current_top = wxqqWrap.offset().top + wxqqWrap.height() - $(wxqqEditor.document).scrollTop();
                $('#wxqq_tool_bar').css('top',current_top + 47);
            }
        });
    }
}

// 样式工具条，整体删除，整体复制操作
function styleToolBar (){
    // 清空缓存中的虚线边框，工具条
    hideWrap();
    // 编辑器获取点击操作
    wxqqEditor.addListener('mousedown',function (type,event){
        var select_tagname = $(event.target).tagName;
        if(select_tagname != "IMG"){
            insertWrap(event);
        }
    });
}
//浮动快捷工具条 end



//初始化编辑器
wxqqEditor=UE.getEditor('editorContent',{
    toolbars: [
        ["undo","redo","|",
            "bold","italic","underline","forecolor","backcolor","fontsize","|",
            "justifyleft","justifycenter","justifyright",'justifyjustify', "indent","rowspacingtop",'rowspacingbottom',"lineheight","|",
            "insertimage",'insertvideo',"horizontal", 'spechars',"|",
            "removeformat",'formatmatch',"autotypeset","|",
            'link','unlink',"source"]
    ],
    //initialFrameWidth:500,
    initialFrameHeight: editorHeight,
    autoHeightEnabled:false,
    elementPathEnabled:false, //是否启用元素路径，默认是显示
    enableAutoSave:false, //关闭本地自动保存
    saveInterval:5000000, //关闭本地自动保存
    autoFloatEnabled:true, //是否保持toolbar的位置不动，默认true
    wordCount:false //是否开启字数统计
//        allowDivTransToP:false
});

function autoHeight(){
    winHeight = $(window).height();
    editorHeight = winHeight - 107;
    $('.wrapChild').css({height:winHeight+"px"});
    $('.editor2').css({height:editorHeight+"px"});
}

//编辑器准备好用的动作
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

    //注册编辑器keydown事件
    styleToolBar();

    //localStorage
    setInterval(function(){
        if( getContent().length > 200 ){
            window.localStorage[_wxqqTmpContent]=getContent();
            $.toaster({ message : '成功为你缓存一次本地数据', title : '本地保存成功(每隔一分钟自动保存)', priority : 'success', timeout:90000 });
        }
    },60000);
});

//base样式过滤
function tplBaseFilter(filterobj){

    $('#base .block-list li').hide();

    if(filterobj.sid == '0') {
        $('#base .block-list li').find('wxqq-pid-'+filterobj.pid).show();
    } else {
        $('#base .block-list li').find('wxqq-sid-'+filterobj.sid).show();
    }

}
//base样式搜索
function tplBaseSearchFilter($search){
    var searchCount=0;
    $('#base .block-list li').hide();

    $('#base .block-list').append('<li id="tplLoading"><img src="/static/new/images/circle_ball.gif"></li>');
    $('#base .block-list li').each(function(i,v){
        var patt1 = new RegExp($search);
        if(patt1.test($(v).data('search'))){
            $(v).show();
            searchCount++;
        }
    });
    $('#tplLoading').remove();
    if(!searchCount){
        if($('#tplTips').size()<=0)
            $('.editor-template-list').prepend('<li id="tplTips">找不到相关['+$search+']的样式</li>');
        else {
            $('#tplTips').html('找不到相关['+$search+']的样式').show();
        }
    } else {
        if($('#tplTips').size()<=0)
            $('.editor-template-list').prepend('<li id="tplTips">相关['+$search+']的样式</li>');
        else {
            $('#tplTips').html('相关['+$search+']的样式').show();
        }
    }
}


$(function(){

    $(window).on('resize', function(){
        autoHeight();
    });

    autoHeight();

    //选项卡
    $('a[data-toggle="tab"]').on('click',function (e) {

        //如果不是外层的选项卡去掉第一个的active
        if($(this).parent().hasClass('outerLi')) {
            $('.outerNav').eq(0).removeClass('active in');
        } else {
            $('#assets').addClass('active in');
            $(this).parents('.outerLi').addClass('active in');
            $('#assets').find('.tab-pane').removeClass('active in');

        }

        $(this).tab('show');
        e.preventDefault();
    });

    $('[data-toggle="tooltip"]').tooltip();
    $('[data-toggle="popover"]').popover();


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
        event.clipboardData.setData( "text/html", getContent());
        $.toaster({ message : '请在微信后台ctrl+v即可', title : '复制成功', priority : 'success', timeout:90000 });
    });

    //保存模版modal
    $('#helpOnce').on('click',function(){
        helpOnce();
    });

    $('#saveTemplate').on('click',function(){
        if(!isLogin){
            $('#loginModal').modal('show');
        } else {

            //获取我授权的公众号可不选择
            $.post("/index.php/Wechat/Tuoguan/isAuthTg", {}, function(data){
                if(data.status=='1'){
                    $('#saveMp').html(data.mps);

                    //如果不是新模版，在重新编辑状态 把同步的托管的微信公众号自动选择
                    $('#saveMp').find('option').each(function(i,v){
                        if($(v).val()==$('#tplmpid').val()){
                            $(v).prop('selected',true);
                            return false;
                        }
                    });

                } else {
                    $('#saveMp').html('<option value="0">你还未授权公众号给微信圈圈[你可默认不做选择,直接保存]!</option>');
                }
            });

            //显示保存弹出框
            $('#saveModal').modal('show');

        }
    });

    //保存
    $(".wxqqSaveTpl").on("click", function(e) {
        var that = $(this),data=wxqqEditor.getContent();
        if ("" == $("#tplName").val()) {
            $.toaster({ message : '请输入你要保存的模版名字', title : '温馨提醒', priority : 'warning', timeout:90000 });
            return ;
        }
        if ("" == data || data.length < 20) {
            $.toaster({ message : '请先创建好的需要的文案再保存吧', title : '温馨提醒', priority : 'warning', timeout:90000 });
            return ;
        }
        that.hide();
        var data={
            title: $("#tplName").val(),
            code: data,
            mpid: $("#saveMp").val()
        }
        if(!isnew){
            data.id=$("#tplid").val();
            data.type=$('#tpltype').val();
        }
        $.post("/index.php/Home/New/save", data, function(data) {
            if(data.status){
                if(!parseInt(data.ismine)){
                    $('#tplid').val(data.newid);
                    $.toaster({ message : '保存成功<br /><br />首次保存会跳转到编辑本模版的连接...请稍后勿操作!!!', title : '温馨提醒', priority : 'warning', timeout:90000 });
                    window.location='/wxeditor/edit/type/u/id/'+data.newid;
                } else {
                    $.toaster({ message : '保存成功<br /><br /><a href="/tpl/preview/'+(!parseInt(data.ismine)?data.newid:$("#tplid").val())+'.html" target="_blank">点我查看我的文章</a>', title : '温馨提醒', priority : 'warning', timeout:90000 });
                }
            } else {
                $.toaster({ message : '保存失败，你可联系客服', title : '错误提醒', priority : 'warning', timeout:90000 });
            }
            $('#saveModal').modal('hide');
            that.show();
        });

        e.preventDefault();
    });

    //同步授权
    $('#syncOpen').on('click',function(){
        $.post("/index.php/Wechat/Tuoguan/isAuthTg", {}, function(data){
            if(data.status=='1'){
                $('.syncModalTip').hide();
                $('#syncMp').html(data.mps);
                $('#saveMp').html(data.mps);
                $('#syncModal').modal('show');
            } else if(data.status=='-1'){
                $('#loginModal').modal('show');
            } else {
                $('.syncModalTip').show();
                $('#syncModal').modal('show');
            }

            //如果不是新模版，在重新编辑状态 把同步的托管的微信公众号自动选择
            $('#syncMp').find('option').each(function(i,v){
                if($(v).val()==$('#tplmpid').val()){
                    $(v).prop('selected',true);
                    return false;
                }
            });
        });
    });

    $(".syncwx").on("click", function(e) {
        var that = $(this),data=getContent(),index=parseInt($("#syncMp").val());
        if ("" == $("#syncTplName").val()) {
            $.toaster({ message : '请输入你要同步到微信官方的素材标题', title : '温馨提醒', priority : 'warning', timeout:90000 });
            return ;
        }
        if ("" == data  || data.length < 20 ) {
            $.toaster({ message : '请先创建好的需要的文案再同步吧', title : '温馨提醒', priority : 'warning', timeout:90000 });
            return ;
        }
        if (!index) {
            $.toaster({ message : '请选择你要同步的公众号哦', title : '温馨提醒', priority : 'warning', timeout:90000 });
            return ;
        }
        that.hide();
        $.post("/index.php/Wechat/Tuoguan/syncmedia", {
            ueid: $("#tplid").val(),
            source_url: $("#source_url").val(),
            author: $("#author").val(),
            wxqq_thumb_pic: $("#wxqq_thumb_pic").val(),
            digest: $("#digest").val(),
            cover: $("#show_cover_pic0").prop('checked')?0:1,
            id: $("#syncMp").val(),
            title: $("#syncTplName").val(),
            code: data
        }, function(data) {

            if(data.status=='1'){
                $.toaster({ message : '同步成功，赶快去后台看看吧', title : '温馨提醒', priority : 'success', timeout:90000 });
                $('#syncModal').modal('hide');
            } else if(data.status=='-1'){
                $('.syncModalTip').show();
                $.toaster({ message : "公众号登录超时了 <br />请重新授权一次你需要同步的公众号", title : '温馨提醒', priority : 'danger', timeout:90000 });
            } else {
                $.toaster({ message : '同步失败，你可联系客服咨询<br />'+data.data, title : '错误提醒', priority : 'danger', timeout:90000 });
                $('#syncModal').modal('hide');
            }
            that.show();
        });

        e.preventDefault();
    });

    //抓取微信文章内容
    $('#crawler').on('click',function(){
        modalCommon.open({type:'id',content:'crawlerModal'},{
            'title':'抓取数据页面：(输入网址，将自动填写标题、封面和内容)',
            'content':
            '<div class="container-fuild" style="margin-bottom:8px;">'+
            '<div class="row">'+
            '<div class="col-xs-12">'+
            '<form class="form-horizontal" onsubmit="return false;">'+
            '<div class="form-group">'+
            '<label for="syncTplName" class="col-sm-2 control-label">输入网址 *</label>'+
            '<div class="col-sm-10">'+
            '<input type="text" class="form-control" id="crawlerUrl" value="" placeholder="请输入微信文章网址">'+
            '</div>'+
            '</div>'+
            '<div class="form-group">'+
            '<label class="col-sm-2 control-label"></label>'+
            '<div class="col-sm-9 controls">'+
            '<p style="font-weight:bold;font-size:14px;">暂只支持：微信公众号文章，QQ公众号文章。</p><p><br /></p>'+
            '<p style="font-weight:bold;font-size:14px;">更多想获取的地址的支持请联系客服。</p>'+
            ' </div>'+
            ' </div>'+
            '<div class="form-group">'+
            '<div class="col-sm-offset-2 col-sm-10">'+
            '<button type="submit" class="crawlerNow btn btn-success" style="width:100px">立即抓取</button> &nbsp; &nbsp; &nbsp;'+
                //'<a href="#" target="_blank" class="btn btn-info" data-toggle="tooltip" data-html="true" data-container="body" data-placement="top" title="">使用教程</a>'+
            ' </div>'+
            ' </div>'+
            '</form>'+
            '</div>'+
            '<div id="crawlerTip" class="col-xs-12 " style="display:none;"><img src="/static/new/images/circle_ball.gif" /></div>'+
            '</div>'+
            '</div>'
        },function(selector){
            $(selector).on('click','.crawlerNow',function(){
                var that=$(this);
                that.hide();
                $('#crawlerTip').show();

                $.post('/index.php/Home/New/crawler',{url: $.trim($('#crawlerUrl').val())}, function(data){
                    if(data.status){
                        wxqqEditor.execCommand('insertHtml',data.data);
                    } else {
                        $.toaster({ message : '抓取错误', title : '温馨提醒', priority : 'error', timeout:90000 });
                    }
                    $('#crawlerTip').hide();
                    that.show();
                });
                modalCommon.close(selector);
            });
        });
    });

    //end


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

            var color = '#'+colors.HEX;

            if($('#replace-color-nav').prop('checked')){ //左侧导航
                $('.editor-template-list').find('.wxqq-bg').css({
                    backgroundColor:'#'+colors.HEX
                });
                $('.editor-template-list').find('.wxqq-color').css({
                    color:'#'+colors.HEX
                });
                $('.editor-template-list').find('.wxqq-borderTopColor').css({
                    borderTopColor:'#'+colors.HEX
                });
                $('.editor-template-list').find('.wxqq-borderLeftColor').css({
                    borderLeftColor:'#'+colors.HEX
                });
                $('.editor-template-list').find('.wxqq-borderRightColor').css({
                    borderRightColor:'#'+colors.HEX
                });
                $('.editor-template-list').find('.wxqq-borderBottomColor').css({
                    borderBottomColor:'#'+colors.HEX
                });
            }

            if($('#replace-color-select').prop('checked')){ //选中
                var _range=wxqqEditor.selection.getRange(),
                    anchorNode=wxqqEditor.selection.getStart();

                if(anchorNode.nodeType!=1){ anchorNode=anchorNode.parentNode;}
                //字体
                if($(anchorNode).hasClass('wxqq-color')){
                    $(anchorNode).css({color:color});
                } else {
                    $(anchorNode).closest('.wxqq').find('.wxqq-color').css({color:color});
                }
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

            if($('#replace-color-edit').prop('checked')){ //编辑器全部
                changeColorEditor(color);
            }
        }
    }).each(function(idx, elm) {
        // $(elm).css({'background-color': this.value})
    });

    $('.color-swatch').on('click',function(){

        var color=$(this).css('background-color');

        if($('#replace-color-nav').prop('checked')){ //左侧导航
            $('.editor-template-list').find('.wxqq-bg').css({
                backgroundColor:color
            });
            $('.editor-template-list').find('.wxqq-color').css({
                color:color
            });
            $('.editor-template-list').find('.wxqq-borderTopColor').css({
                borderTopColor:color
            });
            $('.editor-template-list').find('.wxqq-borderLeftColor').css({
                borderLeftColor:color
            });
            $('.editor-template-list').find('.wxqq-borderRightColor').css({
                borderRightColor:color
            });
            $('.editor-template-list').find('.wxqq-borderBottomColor').css({
                borderBottomColor:color
            });
        }

        if($('#replace-color-select').prop('checked')){ //选中
            var _range=wxqqEditor.selection.getRange(),
                anchorNode=wxqqEditor.selection.getStart();

            if(anchorNode.nodeType!=1){ anchorNode=anchorNode.parentNode;}
            //字体
            if($(anchorNode).hasClass('wxqq-color')){
                $(anchorNode).css({color:color});
            } else {
                $(anchorNode).closest('.wxqq').find('.wxqq-color').css({color:color});
            }
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

        if($('#replace-color-edit').prop('checked')){ //编辑器全部
            changeColorEditor(color);
        }

    });


    //登录下拉
    $('#login-links,#login-menus').hover(
        function(){
            $(this).find('.dropdown-menu').show();
        },
        function(){
            $(this).find('.dropdown-menu').hide();
        }
    );

    //左侧的导航事件

    //base自分类下拉
    $('.tags .dropdown').hover(
        function(){
            $(this).find('.dropdown-menu').show();
        },
        function(){
            $(this).find('.dropdown-menu').hide();
        }
    );

    $('#base .dropdown-menu .filter').on('click',function(e){
        tplBaseFilter({
            pid:$(this).data('pid'),
            sid:$(this).data('sid')
        });

        //点击后高亮代码
        $(this).parent().addClass('active').siblings().removeClass('active');
        $(this).parents('.dropdown').addClass('active').siblings().removeClass('active');

        e.preventDefault();
    });

    $('#base .dropdown button').on('click',function(e){
        $(this).next().find('li').eq(0).find('a').trigger('click');
    });
    //base end

    //加载模版
    $(document).on('click','#base .block-list li',function(e){

        if($(this).hasClass('ignore')){
            return false;
        }

        var style_item = $(this).find('.wxqq'); //第一级的
        var html = $(this).html();

        //function cdnReplace(){
        //    return 'src="' + decodeURIComponent(arguments[1]) + '"';
        //}
        //
        ////替换微信cdn前缀
        ////html = html.replace(/src=\"http:\/\/img03\.store\.sogou\.com\/net\/a\/04\/link\?appid=100520031&w=1200&url=(.+?)\"/g,cdnReplace);
        ////html = html.replace(/src=\"http:\/\/img03\.store\.sogou\.com\/net\/a\/04\/link\?appid=100520031&amp;w=1200&amp;url=(.+?)\"/g,cdnReplace);
        //html = html.replace(/src=\"http:\/\/remote\.wx135\.com\/oss\/view\?d=(.+?)\"/g,cdnReplace);
        //
        //function cdnReplace2(){
        //    return 'url(' + decodeURIComponent(arguments[1]) + ')';
        //}
        //
        ////替换微信cdn前缀
        ////html = html.replace(/url\(http:\/\/img03\.store\.sogou\.com\/net\/a\/04\/link\?appid=100520031&w=1200&url=(.+?)\)/g,cdnReplace2);
        ////html = html.replace(/url\(http:\/\/img03\.store\.sogou\.com\/net\/a\/04\/link\?appid=100520031&amp;w=1200&amp;url=(.+?)\)/g,cdnReplace2);
        //html = html.replace(/url\(http:\/\/remote\.wx135\.com\/oss\/view\?d=(.+?)\)/g,cdnReplace2);

        if(style_item.size()){
            wxqqEditor.execCommand('insertHtml', html + "<p><br/></p>");
        } else {
            wxqqEditor.execCommand('insertHtml', "<section class=\"wxqq\">" + html + "<section style=\"display: block; width: 0; height: 0; clear: both;\"></section></section><p><br/></p>");
        }

        // 统计技术
        // style_click($(this).data('id'));

    });

    //加载所有的模版
    setTimeout(function(){getTpls();},1000);

});