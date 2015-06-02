# FUCK the autoRegion


```javascript
	//编辑时初始化数据
	$('#start').val('6,94,838|6,94,842|6,87|12|17');

	//初始化插件
	$('#start').autoregion({
		autoopen : true,
		//常用选项卡
		commonTab : false,
		//是否是始发地
		isStart : false,
		//是否开启复选
		isCheckBox : true,
		//是否开启区县
		isShowZone : true,
		source : window.regionData,
		x : 0,
		y : 0
	}); 
```
