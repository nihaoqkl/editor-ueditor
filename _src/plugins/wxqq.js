UE.commands['setborder'] = {
    execCommand:function (cmd , value) {
        var range = this.selection.getRange();
        var nSpan=domUtils.filterNodeList(this.selection.getStartElementPath(),'span');
        if(nSpan){
            if(!nSpan.style.cssText){
                range.removeInlineStyle('span');
                var span=range.applyInlineStyle("span",{"style":"border:1px solid #000"});
                range.selectNode(span).select();
                return ;
            }
            if(nSpan.style.border)
                nSpan.style.cssText=nSpan.style.cssText.replace(/\s*border:.+?\s*/,'');
            else
                nSpan.style.border='1px solid #000';
        } else {
            range.applyInlineStyle("span",{"style":"border:1px solid #000"})
        }
    },
    queryCommandValue:function () {
        return '';
    },
    queryCommandState:function () {
        var range = this.selection.getRange();
        var nSpan=domUtils.filterNodeList(this.selection.getStartElementPath(),'span');
        if(nSpan && nSpan.style.border){
            return 0;
        } else {
            return 1;
        }
    }
};