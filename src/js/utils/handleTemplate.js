  /**
   * 处理模板
   *
   * @parmas tpl {String} [必选] 模板字符串
   *
   * @return tplObj {Object} 处理好的模板对象
   */
  const handleTemplate = (tpl) => {
    var tplObj = {},
      _scriptArr = [],
      _idArr = [],
      _contentArr = [],
      _divArr = [];

    //匹配script 标签里的ID
    var reg_id = /<script.+id="([a-zA-Z]+Tmpl)">/g;

    //匹配模板内容
    var reg_div = /<script[\w ]+><\/script>/g;

    _scriptArr = tpl.match(reg_id);
    _.each(_scriptArr, (val) => {
      _idArr.push(val.match(/id="(\w+)">/)[1]);
    });

    _contentArr = tpl.split('</script>');
    _contentArr.pop();
    _.each(_contentArr, (val, key) => {
      _divArr.push(val.replace(/<script.+id="([a-zA-Z]+Tmpl)">/, ''))
    });

    //合并数组为一个对象
    _.forEach(_idArr, (key, index) => {
      tplObj[key] = _divArr[index]
    })
    return tplObj;
  }

  export default handleTemplate
