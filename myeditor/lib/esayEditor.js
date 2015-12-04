/**
 * Created by qkl | QQ:80508567 Wechat:qklandy on 2015/12/1.
 */
;(function($, win, undefined){
    //全局变量
    var document = window.document,
        $document = $(document),
        $window = $(window),
        $body = $('body'),
        $prefix = 'easyEditor_',
        index = 1; //编辑器index，用于同个页面初始化多个编辑器

    ////判断IE6、7、8  //暂时不做ie兼容好了 后续加上
    //var isIE6 = false,
    //    isIE7 = false,
    //    isIE8 = false,
    //    appVersion;
    //if(navigator.appName === "Microsoft Internet Explorer"){
    //    appVersion = $.trim(navigator.appVersion.split(";")[1]);
    //    isIE6 = appVersion === 'MSIE6.0';
    //    isIE7 = appVersion === 'MSIE7.0';
    //    isIE8 = appVersion === 'MSIE8.0';
    //}

    var utils= {
        selector:function(selector){
            return $(selector).get(0);
        },
        type:function(value){
            return Object.prototype.toString.call(value).split(" ")[1].replace(/\]/,'').toLowerCase();
        }
    }


    var eE = window.easyEditor = function(selector, options){
        return new eE.fn.init(selector, options);
    };

    eE.fn=eE.prototype; //原型链

    //全局eE的方法
    $.extend(eE,{

    });

    //eE默认的一些配置和属性参数
    $.extend(eE,{
        CommonTemplate: {
            toolBar: '<div class="'+$prefix+'toolBar">'+
                        '<ul class="clearfix">'+
                        '<li><a href="#" data-cmd="bold"><i class="icon iconfont"></i></a></li>'+
                        '<li><a href="#" data-cmd="italic"><i class="icon iconfont"></i></a></li>'+
                        '<li><a href="#" data-cmd="strike"><i class="icon iconfont"></i></a></li>'+
                        '<li><a href="#" data-cmd="underline"><i class="icon iconfont"></i></a></li>'+
                        '<li><a href="#" data-cmd="char"><i class="icon iconfont"></i></a></li>'+
                        '</ul></div>',
            fastBar: '<div class="'+$prefix+'fastBar">'+
                        '<ul class="clearfix">'+
                        '<li><a href="#" data-cmd="bold"><i class="icon iconfont"></i></a></li>'+
                        '<li><a href="#" data-cmd="italic"><i class="icon iconfont"></i></a></li>'+
                        '<li><a href="#" data-cmd="strike"><i class="icon iconfont"></i></a></li>'+
                        '<li><a href="#" data-cmd="underline"><i class="icon iconfont"></i></a></li>'+
                        '<li><a href="#" data-cmd="char"><i class="icon iconfont"></i></a></li>'+
                        '</ul></div>',

        }
    })

    //初始化toolbar
    $.extend(eE.fn,{
        initConfig:function(){
            /*
             menus = {
             'menuId-1': {
             'title': （字符串，必须）标题,
             'type':（字符串，必须）类型，可以是 btn / dropMenu / dropPanel / modal,
             'cssClass': （字符串，必须）fontAwesome字体样式，例如 'fa fa-head',
             'style': （字符串，可选）设置btn的样式
             'hotKey':（字符串，可选）快捷键，如'ctrl + b', 'ctrl,shift + i', 'alt,meta + y'等，支持 ctrl, shift, alt, meta 四个功能键（只有type===btn才有效）,
             'beforeFn': (函数，可选) 点击按钮之后立即出发的事件
             'command':（字符串）document.execCommand的命令名，如'fontName'；也可以是自定义的命令名，如“撤销”、“插入表格”按钮（type===modal时，command无效）,
             'commandValue': (字符串) document.execCommand的命令值，如 'blockQuote'，可选
             'dropMenu': （$ul，可选）type===dropMenu时，要返回一个$ul，作为下拉菜单,
             'modal':（$div，可选）type===modal是，要返回一个$div，作为弹出框,
             'callback':（函数，可选）回调函数,
             },
             'modaId-2':{
             ……
             }
             }
             */
        },
        initToolBar:function(){
            //暂时写死，后续动态根据配置
            $('#'+this.getCurrentEditorSelector()).before($(eE.CommonTemplate.toolBar).addClass('toolBar'+this.getIndex()));
        },
        initEvent:function(){
            var editor=this,
                index=this.getIndex(),
                _frame=utils.selector('#'+$prefix+index),
                _doc=_frame.contentWindow.document;
            $('.toolBar'+this.getIndex()).find('a').each(function(i,v){
                $(v).on('click',function(e){
                    var that = $(this);
                    _frame.focus();
                    _doc.execCommand(that.data('cmd'),false,'');
                });
            });

            $(_doc).on('mouseup',function(){
                var range=_doc.getSelection().getRangeAt(0);
                if(utils.type(range)!='null' && range.toString().length>=1){
                    alert(range.toString());
                }
            });



        },

        getIndex: function(){
            return this.index;
        },
        getCurrentEditorSelector: function(){
            return $prefix + this.index;
        },

        //初始化
        init: function(selector, options){

            var editor = this,
                _frame = utils.selector(selector),
                _window = _frame.contentWindow,
                _doc = _window.document;

            this.index=index++;

            //设置id
            $(_frame).attr('id',editor.getCurrentEditorSelector());

            //默认配置
            editor.initConfig();
            //初始化ToolBar
            editor.initToolBar();

            //初始化编辑器
            $(_frame).css({
                width:utils.type(eEConfig.width)!='null'?eEConfig.width:'100%',
                height:utils.type(eEConfig.height)!='null'?eEConfig.height:$(win).height()+'px'});
            _doc.designMode="on";//设置为设计模式，就可以填写内容了  开启后注册事件会失效
            _doc.open();
            _doc.close();

            $(_doc).find('body').css({padding:'8px',wordWrap:'break-word'});

            //初始化事件
            editor.initEvent();

            //返回------------------
            return editor;
        }
    });

    //集成selection和range
    $.extend(eE.fn,{
        selection: {

        },
        range: {

        }
    });

    //集成EventBase的事件
    $.extend(eE.fn,{
        addListener:function (types, listener) {
            types =  $.trim(types).split(/\s+/);
            for (var i = 0, ti; ti = types[i++];) {
                getListener(this, ti, true).push(listener);
            }
        },
        removeListener:function (types, listener) {
            types = $.trim(types).split(/\s+/);
            for (var i = 0, ti; ti = types[i++];) {
                utils.removeItem(getListener(this, ti) || [], listener);
            }
        },
        fireEvent:function () {
            var types = arguments[0];
            types = $.trim(types).split(' ');
            for (var i = 0, ti; ti = types[i++];) {
                var listeners = getListener(this, ti),
                    r, t, k;
                if (listeners) {
                    k = listeners.length;
                    while (k--) {
                        if(!listeners[k])continue;
                        t = listeners[k].apply(this, arguments);
                        if(t === true){
                            return t;
                        }
                        if (t !== undefined) {
                            r = t;
                        }
                    }
                }
                if (t = this['on' + ti.toLowerCase()]) {
                    r = t.apply(this, arguments);
                }
            }
            return r;
        },
        on : function(types, listener){
            return this.addListener(types,listener);
        },
        off : function(types, listener){
            return this.removeListener(types, listener)
        },
        trigger:function(){
            return this.fireEvent.apply(this,arguments);
        }
    });

    /**
     * 获得对象所拥有监听类型的所有监听器
     * @method getListener
     * @public
     * @param { Object } obj  查询监听器的对象
     * @param { String } type 事件类型
     * @param { Boolean } force  为true且当前所有type类型的侦听器不存在时，创建一个空监听器数组
     * @return { Array } 监听器数组
     */
    function getListener(obj, type, force) {
        var allListeners;
        type = type.toLowerCase();
        return (
                    ( allListeners = ( obj.__allListeners || force && ( obj.__allListeners = {} ) ) )
                &&  ( allListeners[type] || force && ( allListeners[type] = [] ) )
        );
    }



    //重点！！！
    //构造函数是$E.fn.init，将构造函数的prototype指向$E.fn
    eE.fn.init.prototype = eE.fn;

    $.extend($.fn,{
        easyEditor:function(options){

            var options = options || {};

            var editor = $E(this, options);

            this.before(editor.$editorContainer);
            this.hide();

            //页面刚加载时，初始化selection
            editor.initSelection();

            //返回editor对象
            return editor;
        }
    });

})(jQuery,window);