/**
 * Created by qianlei on 14/11/19.
 */
;(function($){
    //init
    $.fn.autoregion = function(options) {
        var defaults = {
            autoopen : true,
            //常用选项卡
            commonTab: false,
            //是否是始发地
            isStart : false,
            //是否开启复选
            isCheckBox : false,
            //是否开启区县
            isShowZone : true,
            source : window.regionData,
            x : 0,
            y : 0
        };
        options = $.extend({}, defaults, options || {});

        var self = $(this),
            label = [],
            curclass = 'current',
            hdvalue = self.val(),
            cnt = 0;
            
        if (options.commonTab) label.push({k:'z',label:'常用',index:0});
        options.isShowZone?label.push({k:'a',label:'省',index:1},{k:'b',label:'市',index:2},{k:'c',label:'区县',index:3}):label.push({k:'a',label:'省',index:1},{k:'b',label:'市',index:2});

        var getData = function(type,currentObj) {
            var arr = [],data = [],id=options.isCheckBox?currentObj.children('a').attr('code'):currentObj.attr('code');
            if (type == 1){data = options.source.city;}
            else if (type == 2) {data = options.source.zone;}
            $.each(data,function(i,v){
                //区 不需要区分是否是始发地
                if (options.isStart && type!=2) {
                    if (typeof (v.start) == 'undefined' || v.start!='Y') return true;
                }

                if (v.pid==id) {
                    arr.push(v);
                }
            });
            return options.isCheckBox?'<dl class="panel-category"><dt code="'+id+'">'+currentObj.text()+'</dt><dd>'+getHtmlData(arr)+'</dd></dl>':getHtmlData(arr);
        };
        var getHtmlData = function(data) {
            var s = '';
            $.each(data,function(i,v){
                s += '<li>'+(options.isCheckBox?'<input type="checkbox"/><a code="'+v.id+'" class="panel-item" href="javascript:void(0)" style="padding:0 10px 0 0">'+v.name+'</a></li>':'<a code="'+v.id+'" class="panel-item" href="javascript:void(0)">'+v.name+'</a></li>');
            });
            return '<ul class="clearfix">'+s+'</ul><div class="c"></div>';
        };
        var getProvinceData = function(data, classArr){
            var s = '', t = '', arr = [], cf = [];
            $.each(classArr, function(i,v)
            {
                arr = [];
                t = v.split('-');
                $.each(data,function(ii,vv)
                {
                    if (options.isStart)
                    {
                        if (typeof (vv.start) =='undefined' || vv.start!='Y') return true;
                    }

                    if (vv.py>=t[0] && vv.py<=t[1]) {
                        arr.push(vv);
                    }
                });
                if (arr.length) cf.push({label:v,data:arr});
            });

            $.each(cf,function(i,v){
                s += '<dl class="panel-category"><dt>'+v.label+'</dt><dd>'+getHtmlData(v.data)+'</dd></dl>';
            });
            return s;
        };
        self.bind('click',function()
        {
            var a = '', b = '', html = '', hdname = '', left = 0, top = 0, areatab = '', hd = '', ath;
            if (options.x) left = options.x;
            if (options.y) top = options.y;

            // if in the dialog
            var offset = self.closest('.ui-dialog').length ? self.position() : self.offset();
            if (left==0) left = offset.left;
            if (top==0) top = offset.top+self.outerHeight();
            $.each(label,function(i,v){
                a += '<li class="s-tab-t box-sizing '+(i==0?curclass:'')+'" index="'+ v.index +'"><span class="inner">'+ v.label+'</span></li>';
                b += '<div index="'+ v.index +'" class="s-tab-b" style="display:'+(i==0?'block':'none')+'">{'+v.k+'}</div>';
            });
            a += '<li class="s-tab-t closen"><span>关闭</span></li>';
            if (options.commonTab)
            {
                var hot = [];
                $.each(options.source.city,function(i,v){
                    if (typeof (v.hot) != 'defined' && v.hot=='Y') hot.push(v);
                });
                b = b.replace('{z}',hot.length ? getHtmlData(hot) : '');
            }
            b = b.replace('{a}',getProvinceData(options.source.province, ['A-G','H-K','L-S','T-Z']));
            b = b.replace('{b}','');
            b = b.replace('{c}','');
            html += '<div class="area-tab"><ul class="h">'+a+'</ul><div class="c"><dl class="panel-category"><dt id="selectedText"></dt></dl></div>'+b+'</div>';
            if (self.next('.area-tab').length==0)
            {
                hdname = options.hdname ? options.hdname : 'hd_'+self.attr('name');
                self.after('<input type="hidden" name="'+hdname+'" value="'+hdvalue+'">').after(html);
            }
            areatab = self.next('.area-tab');
            ath = areatab.find('.h>li');
            areatab.css({
                'top': top+'px',
                'left': left+'px',
                'width': (ath.outerWidth()*ath.length)
            });
            areatab.show();
            hd = areatab.next();
            $(areatab).off('click').on('click','.s-tab-t',function(){
                if ($(this).hasClass(curclass)) {
                    return false;
                }

                if ($(this).hasClass('closen'))
                {
                    self.next('.area-tab').hide();
                    return false;
                }

                var index = $(this).attr('index');
                $(this).addClass(curclass).siblings().removeClass(curclass);
                $('.s-tab-b',areatab).show().filter(function(){
                    return $(this).attr('index')!=index
                }).hide();
            });
            
			if (options.isCheckBox) {
				$(areatab).on('click', 'dd li', function() {
					var id = $(this).attr('code');
					var index = $(this).closest('div').attr('index');
					if (typeof($(this).attr('check')) != "undefined") {
						$(this).removeAttr('check');
						$(this).children('input')[0].checked = false;
						$(this).children('a').removeClass(curclass);
						var currentThis = this;
						if (index == 1 || index == 2) {
							var index1Text = [];
							$('.s-tab-b[index=' + index + ']', areatab).next().find('dt').filter(function() {
								if ($(this).text() == $(currentThis).text()) {
									$(this).siblings().find('.current').each(function(i, v) {
										index1Text.push(v.text);
									});
									return true;
								}
							}).closest('dl').remove();
							$('.s-tab-b[index=' + index + ']', areatab).next().next().find('dt').filter(function() {
								return $.inArray($(this).text(), index1Text) >= 0;
							}).closest('dl').remove();
						}
					} else {
						$(this).attr('check','');
						$(this).children('input')[0].checked = true;
						$(this).children('a').addClass(curclass);
						if (index == 1 || index == 2) {
							$('.s-tab-b[index=' + index + ']', areatab).next().append(getData(index, $(this)));
						}
					}

					//set textfield
					var selectedRegion,
						selectedCity,
						selectedZone,
					    valtext = [],
					    valcode = [],
					    regionOut = [],
					    cityOut = [];
					selectedRegion = $('.s-tab-b[index=1]', areatab).find('a.current');
					selectedCity = $('.s-tab-b[index=2]', areatab).find('a.current');
					selectedZone = $('.s-tab-b[index=3]', areatab).find('a.current');
					
					for (var c=0; c < selectedZone.length; c++) {
						for (var b=0; b < selectedCity.length; b++) {
							if (selectedZone.eq(c).closest('dd').siblings('dt').text() == selectedCity[b].text) {
								valtext.push(selectedCity.eq(b).closest('dd').siblings('dt').text()+'-'+selectedCity[b].text+'-'+selectedZone[c].text);
								valcode.push(selectedCity.eq(b).closest('dd').siblings('dt').attr('code')+','+selectedCity.eq(b).attr('code')+','+selectedZone.eq(c).attr('code'));
								if ($.inArray(selectedCity.eq(b).closest('dd').siblings('dt').text(), regionOut)<0) {
									regionOut.push(selectedCity.eq(b).closest('dd').siblings('dt').text());
								};
								if ($.inArray(selectedCity[b].text, cityOut)<0) {
									cityOut.push(selectedCity[b].text);
								};
							};
						};
					};
					
					for (var b=0; b < selectedCity.length; b++) {
						if ($.inArray(selectedCity.eq(b).text(), cityOut)<0) {
							valtext.push(selectedCity.eq(b).closest('dd').siblings('dt').text()+'-'+selectedCity[b].text);
							valcode.push(selectedCity.eq(b).closest('dd').siblings('dt').attr('code')+','+selectedCity.eq(b).attr('code'));
							if ($.inArray(selectedCity.eq(b).closest('dd').siblings('dt').text(), regionOut)<0) {
								regionOut.push(selectedCity.eq(b).closest('dd').siblings('dt').text());
							};
						};
					};
					
					for (var a=0; a < selectedRegion.length; a++) {
						if ($.inArray(selectedRegion.eq(a).text(), regionOut)<0) {
							valtext.push(selectedRegion[a].text);
							valcode.push(selectedRegion.eq(a).attr('code'));
						};
					};
					
					self.val(valtext.join(','));
					$('#selectedText').html(valtext.join('，'));
					hd.val(valcode.join('|'));
				});
			} else {
				$(areatab).on('click', '.panel-item', function() {
					var id = $(this).attr('code');
					var index = $(this).closest('div').attr('index');
					$(this).closest('div').find('.panel-item').removeClass(curclass);
					$(this).addClass(curclass);
					if (index == 0) {
						$('.s-tab-t[index=' + index + ']', areatab).removeClass(curclass);
						$('.s-tab-b[index=' + index + ']', areatab).hide();
						var pid = 0;
						$.each(options.source.city, function(i, v) {
							if (v.id == id) {
								pid = v.pid;
							}
						});
						for (var j = 1; j <= 2; j++) {
							pid = j == 1 ? pid : id;
							$('.s-tab-b[index=' + (parseInt(index) + j) + ']', areatab).find('.panel-item').removeClass(curclass).each(function(i, v) {
								if ($(v).attr('code') == pid) {
									$(v).addClass(curclass).trigger('click');
								}
							});
						}
					} else if (index == 1 || index == 2) {
						$('.s-tab-t[index=' + index + ']', areatab).removeClass(curclass).next().addClass(curclass);
						$('.s-tab-b[index=' + index + ']', areatab).hide().next().html(getData(index, $(this))).show();
						$('.s-tab-b[index=0]', areatab).find('.panel-item').removeClass(curclass);
						if (index == 1) {
							$('.s-tab-b[index=3]', areatab).html('');
						}
					} else {
						areatab.hide();
					}

					//set textfield
					var v,
					    valtext = [],
					    valcode = [];
					for (var i = 1; i <= 3; i++) {
						v = $('.s-tab-b[index=' + i + ']', areatab).find('a.current');
						if (v.length > 0) {
							valtext.push(v.text());
							valcode.push(v.attr('code'));
						}
					}
					self.val(valtext.join('-'));
					hd.val(valcode.join(','));
				});
			}

            if (hdvalue)
            {
                $('.s-tab-t[index=0]',areatab).removeClass(curclass);
                $('.s-tab-b[index=0]',areatab).hide();
                if (options.isCheckBox && cnt == 0) {
                	var selectVal = hdvalue.split('|');
					for (var b=0; b < selectVal.length; b++) {
						(function chileFor(val){
							for (var a=0; a < val.length; a++) {
								if (!$('.s-tab-b[index=' + (a + 1) + ']', areatab).find('.panel-item[code=' + val[a] + ']').hasClass(curclass)) {
									$('.s-tab-b[index=' + (a + 1) + ']', areatab).find('.panel-item[code=' + val[a] + ']').addClass(curclass).trigger('click');
								};
							};
						})(selectVal[b].split(','));
					};
                } else if (!options.isCheckBox) {
                	$.each(hdvalue.split(','),function(i,v){
	                    if (v) {
	                        $('.s-tab-b[index='+(i+1)+']',areatab).find('.panel-item[code='+v+']').addClass(curclass).trigger('click');
	                    }
	                });
                }
                
				if (cnt == 0) {
					areatab.hide();
				} else {
					areatab.show();
				}
				cnt++; 
            }

            $(document).mouseup(function(e){
                if(!areatab.is(e.target) && areatab.has(e.target).length === 0){
                    self.next('.area-tab').hide();
                }
            });
        });
        if (hdvalue) {
            self.trigger('click');
        }
    };

    $.fn.autoregionClean = function() {
        var self = $(this),hdname = 'hd_'+self.attr('name');
        self.nextAll('.area-tab').hide();
        self.nextAll('input[name="'+hdname+'"]').val('');
        self.val('');
    }
})(jQuery);