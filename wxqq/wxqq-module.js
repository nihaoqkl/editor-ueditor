var wxqq_tool_bar_copy_client = new ZeroClipboard( document.getElementById("wxqq_tool_bar_copy") );
/*根据QueryString参数名称获取值 */
function getQueryStringByName(name){
    var result = location.search.match(new RegExp("[\?\&]" +name+ "=([^\&]+)","i"));
    if(result == null || result.length < 1){
        return "";
    }
    return result[1];
}

// 快捷键复制操作
function keyCopyEditorContent(){
    wxqqEditor.addListener('keydown',function (type,event){
        var keyCode = event.keyCode||event.which;
        if((event.ctrlKey && keyCode == 67)||(event.metaKey && keyCode == 67)){
            var editor = wxqqEditor;
            var range = editor.selection.getRange();
            var selectContainer = range.select();
            // 如果全选
            if(selectContainer.startContainer.className == 'view'){
                console.log('aaa');
                // 移除最外层边框
                var w = $(selectContainer.startContainer).find('#wxqqWrap');
                w.replaceWith(w.children());
                w.remove();
                ZeroClipboard.setData("text/html", wxqqEditor.getContent());

                setTimeout(function () {
                    ZeroClipboard.setData("text/html", wxqqEditor.getContent());
                }, 0);
                $('#success').css('display', 'block');
                setTimeout(function(){$('#success').css('display', 'none');},500);
                // 清楚工具条
                if($('#wxqq_tool_bar').length>0){
                    $('#wxqq_tool_bar').remove();
                }
            }else{
                // 否则只选中文字
                editor.zeroclipboard.setHtml(editor.selection.getText());

            }

        }
    });
}

/*编辑情况下内容的载入*/
function  checkEditContent(){

    draftid = getQueryStringByName("draftid");

    if(draftid != ""){
        //更新头部
        $("#ipaiban_login_btn").hide();
        $("#ipaiban_me_name").html(username+"<span class=\"caret\"></span>");
        $("#ipaiban_me_div").show();
        $("#me_access").blur(); //设置失去焦点

        //草稿内容加载
        $.ajax({
            type:"POST",
            async: false,
            url:"DraftServlet",
            dataType:'json',
            data:{draftid:draftid,method:'select'},
            success:function(data){

                console.info('再编辑时的标题:'+data.title);
                console.info('再编辑时的状态:'+data.data);
                if(data.data == 'OK'){
                    //把草稿的内容放入其中
                    content  = data.content;
                    title = data.title;
                    //setTimeout('wxqqEditor.execCommand('inserthtml','')',500);
                    wxqqEditor.setContent(unescape(content));
                    //alert('ABC');

                    vipIcon(data.vip); //设置VIP图标
                    loadMemberSign(data.id,data.name,data.openid);  //加载对应的签名


                }else{
                    console.log("加载草稿失败");
                }
            }
        });

    }
}


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

styleToolBar();