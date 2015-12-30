
/**
 * Created by Administrator on 2015/12/15.
 */
UE.registerUI('addtextshadow',function(editor,uiName){
    //注册按钮执行时的command命令，使用命令默认就会带有回退操作
    var domUtils=UE.dom.domUtils,utils=UE.utils,browser=UE.browser;
    var getObj = function(editor,tagNames){
        //filterNodeList给定一个节点数组nodeList和一组标签名tagNames， 获取其中能够匹配标签名的节点集合中的第一个节点
        return UE.dom.domUtils.filterNodeList(editor.selection.getStartElementPath(),tagNames);
    }

    function mergeWithParent(node){
        var parent;
        while(parent = node.parentNode){
            if(parent.tagName == 'SPAN' && domUtils.getChildCount(parent,function(child){
                    return !domUtils.isBookmarkNode(child) && !domUtils.isBr(child)
                }) == 1) {
                parent.style.cssText += node.style.cssText;
                domUtils.remove(node,true);
                node = parent;

            }else{
                break;
            }
        }

    }
    function mergeChild(rng,cmdName,value){
        rng.adjustmentBoundary();//调整Range的边界，使其"缩小"到最合适的位置
        if(!rng.collapsed && rng.startContainer.nodeType == 1){
            var start = rng.startContainer.childNodes[rng.startOffset];
            if(start && domUtils.isTagNode(start,'span')){
                var bk = rng.createBookmark();//创建当前range的一个书签，记录下当前range的位置，方便当dom树改变时，还能找回原来的选区位置
                utils.each(domUtils.getElementsByTagName(start, 'span'), function (span) {
                    if (!span.parentNode || domUtils.isBookmarkNode(span))return;
                    /*if(cmdName == 'backcolor' && domUtils.getComputedStyle(span,'background-color').toLowerCase() === value){
                     return;
                     }*/
                    domUtils.removeStyle(span,'text-shadow');
                    if(span.style.cssText.replace(/^\s+$/,'').length == 0){
                        domUtils.remove(span,true)//?
                    }
                });
                rng.moveToBookmark(bk)            //调整当前range的边界到书签位置，并删除该书签对象所标记的位置内的节点
            }
        }


    }
    function mergesibling(rng,cmdName,value) {
        var collapsed = rng.collapsed,
            bk = rng.createBookmark(), common;
        if (collapsed) {
            common = bk.start.parentNode;
            while (dtd.$inline[common.tagName]) {
                common = common.parentNode;//???
            }
        } else {
            common = domUtils.getCommonAncestor(bk.start, bk.end);//获取离nodeA与nodeB最近的公共的祖先节点
        }
        utils.each(domUtils.getElementsByTagName(common, 'span'), function (span) {
            if (!span.parentNode || domUtils.isBookmarkNode(span))return;
            if (/\s*border\s*:\s*none;?\s*/i.test(span.style.cssText)) {
                if(/^\s*border\s*:\s*none;?\s*$/.test(span.style.cssText)){
                    domUtils.remove(span, true);
                }else{
                    domUtils.removeStyle(span,'border');
                }
                return
            }
            if (/border/i.test(span.style.cssText) && span.parentNode.tagName == 'SPAN' && /border/i.test(span.parentNode.style.cssText)) {
                span.style.cssText = span.style.cssText.replace(/border[^:]*:[^;]+;?/gi, '');
            }
            if(!(cmdName=='fontborder' && value=='none')){
                var next = span.nextSibling;
                while (next && next.nodeType == 1 && next.tagName == 'SPAN' ) {
                    /* if(domUtils.isBookmarkNode(next) && cmdName == 'fontborder'){
                     span.appendChild(next);
                     next = span.nextSibling;
                     continue;
                     }*/
                    if (next.style.cssText == span.style.cssText) {
                        domUtils.moveChild(next, span);//把节点src的所有子节点移动到另一个节点tag上去
                        domUtils.remove(next);
                    }
                    if (span.nextSibling === next)
                        break;
                    next = span.nextSibling;
                }
            }


            mergeWithParent(span);
            if(browser.ie && browser.version > 8 ){
                //拷贝父亲们的特别的属性,这里只做背景颜色的处理
                var parent = domUtils.findParent(span,function(n){return n.tagName == 'SPAN' && /background-color/.test(n.style.cssText)});
                if(parent && !/background-color/.test(span.style.cssText)){
                    span.style.backgroundColor = parent.style.backgroundColor;
                }
            }

        });
        rng.moveToBookmark(bk);
        mergeChild(rng,cmdName,value)
    }






    editor.registerCommand(uiName,{
        execCommand: function (cmdName, value) {
            var me = this,
                range = this.selection.getRange(),
                text;
            var style='text-shadow';
            var obj=getObj(this,'span');
            if (!range.collapsed) {
                if(obj && (obj.style.textShadow || obj.parentNode.style.textShadow) ){
                    me.execCommand('removeFormat', 'span,a', style);
                }else{
                    range = me.selection.getRange();

                    range.applyInlineStyle('span', {'style': style + ':' + value});
                    mergesibling(range, cmdName,value);
                    range.select();
                }

            } else {

                var span = domUtils.findParentByTagName(range.startContainer, 'span', true);
                text = me.document.createTextNode('font');
                if (span && !span.children.length && !span[browser.ie ? 'innerText' : 'textContent'].replace(fillCharReg, '').length) {
                    //for ie hack when enter
                    range.insertNode(text);

                    range.selectNode(text).select();
                    me.execCommand('removeFormat', 'span,a', style, null);

                    span = domUtils.findParentByTagName(text, 'span', true);
                    range.setStartBefore(text);

                    span && (span.style.cssText += ';' + style + ':' + value);
                    range.collapse(true).select();


                } else {
                    range.insertNode(text);
                    range.selectNode(text).select();
                    span = range.document.createElement('span');


                    //a标签内的不处理跳过
                    if (domUtils.findParentByTagName(text, 'a', true)) {
                        range.setStartBefore(text).setCursor();
                        domUtils.remove(text);
                        return;
                    }
                    me.execCommand('removeFormat', 'span,a', style);


                    span.style.cssText = style + ':' + value;


                    text.parentNode.insertBefore(span, text);
                    //修复，span套span 但样式不继承的问题
                    if (!browser.ie || browser.ie && browser.version == 9) {
                        var spanParent = span.parentNode;
                        while (!domUtils.isBlockElm(spanParent)) {
                            if (spanParent.tagName == 'SPAN') {
                                //opera合并style不会加入";"
                                span.style.cssText = spanParent.style.cssText + ";" + span.style.cssText;
                            }
                            spanParent = spanParent.parentNode;
                        }
                    }


                    if (opera) {
                        setTimeout(function () {
                            range.setStart(span, 0).collapse(true);
                            mergesibling(range, cmdName,value);
                            range.select();
                        });
                    } else {
                        range.setStart(span, 0).collapse(true);
                        mergesibling(range,cmdName,value);
                        range.select();
                    }

                    //trace:981
                    //domUtils.mergeToParent(span)
                }
                domUtils.remove(text);
            }


            return true;
        },
        queryCommandValue: function (cmdName) {
            var startNode = this.selection.getStart();
            if (cmdName == 'text-shadow') {
                var tmp = startNode, val;
                while (tmp && dtd.$inline[tmp.tagName]) {
                    if (val = domUtils.getComputedStyle(tmp, 'text-shadow')) {

                        return val;
                    }
                    tmp = tmp.parentNode;
                }
                return ''
            }

            return  domUtils.getComputedStyle(startNode, 'text-shadow');
        },
        queryCommandState: function (cmdName) {
            /*if (cmdName!='text-shadow')
             return 0;
             var val = this.queryCommandValue(cmdName);
             if (cmdName == 'text-shadow') {
             return /1px/.test(val);
             }*/

            var obj=getObj(this,'span');
            return obj && obj.style.textShadow ? 1 : 0;


        }
    });

    //创建一个button
    var btn = new UE.ui.Button({
        //按钮的名字
        name:uiName,
        //提示
        title:uiName,
        //需要添加的额外样式，指定icon图标，这里默认使用一个重复的icon
        cssRules :'background-position: -500px 0;',
        //点击时执行的命令
        onclick:function () {
            //这里可以不用执行命令,做你自己的操作也可
            editor.execCommand(uiName,'1px 1px 1px #000');
        }
    });

    //当点到编辑内容上时，按钮要做的状态反射
    editor.addListener('selectionchange', function () {
        var state = editor.queryCommandState(uiName);
        if (state == -1) {
            btn.setDisabled(true);
            btn.setChecked(false);
        } else {
            btn.setDisabled(false);
            btn.setChecked(state);
        }
    });

    //因为你是添加button,所以需要返回这个button
    return btn;
}/*index 指定添加到工具栏上的那个位置，默认时追加到最后,editorId 指定这个UI是那个编辑器实例上的，默认是页面上所有的编辑器都会添加这个按钮*/);
